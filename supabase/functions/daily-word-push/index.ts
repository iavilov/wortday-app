// Daily Word Push — Supabase Edge Function
//
// Invoked every 15 minutes by pg_cron. For each user:
//   - whose `notifications_enabled` is true
//   - whose local time (in their notification_timezone) is within ±7 minutes
//     of their notification_time today
//   - who has not already received today's push
// fetch today's word via the get_today_word RPC and POST it to Expo Push API.
//
// Idempotency: ledger row in daily_word_notifications is RESERVED before the
// Expo POST (INSERT ... ON CONFLICT DO NOTHING). Only candidates whose row
// was actually inserted proceed to send. A crash between Expo and DB write
// therefore can't cause a duplicate push on the next cron tick.

// @ts-expect-error — Deno std import resolved at runtime by Supabase
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2.45.0';

const SUPABASE_URL = Deno.env.get('SUPABASE_URL')!;
const SERVICE_ROLE_KEY = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!;
const EXPO_PUSH_URL = 'https://exp.host/--/api/v2/push/send';
const WINDOW_SECONDS = 7 * 60; // ±7 min around notification_time

interface Candidate {
    user_id: string;
    expo_token: string;
    platform: 'ios' | 'android';
    translation_language: 'ru' | 'uk' | 'en' | 'de';
    language_level: 'beginner' | 'intermediate' | 'advanced';
    notification_timezone: string;
    notification_time: string; // 'HH:MM:SS'
}

interface ExpoPushMessage {
    to: string;
    title: string;
    body: string;
    sound: 'default';
    data: { wordId: string; sequenceNumber: number };
    priority: 'high';
    channelId?: string;
}

type LedgerStatus = 'sent' | 'skipped_no_token' | 'content_exhausted' | 'failed';

interface LedgerRow {
    user_id: string;
    sent_for_date: string;
    word_id: string | null;
    status: LedgerStatus;
    error: string | null;
}

const TITLE_BY_LANG: Record<string, string> = {
    ru: 'Слово дня',
    uk: 'Слово дня',
    en: 'Word of the day',
    de: 'Wort des Tages',
};

function buildPushBody(wordDe: string, article: string | null, sequenceNumber: number, lang: string): string {
    const wordWithArticle = article ? `${article} ${wordDe}` : wordDe;
    const counter =
        lang === 'ru' ? `№${sequenceNumber}` :
        lang === 'uk' ? `№${sequenceNumber}` :
        lang === 'de' ? `Nr. ${sequenceNumber}` :
        `#${sequenceNumber}`;
    return `${wordWithArticle} · ${counter}`;
}

/**
 * Send messages to Expo Push API in batches of 100. Returns the user_ids
 * whose push failed (either HTTP error or per-ticket error). Ordering of
 * `messages` and `owners` must match by index.
 */
async function sendToExpo(messages: ExpoPushMessage[], owners: string[]): Promise<string[]> {
    const failed: string[] = [];
    if (messages.length === 0) return failed;

    for (let start = 0; start < messages.length; start += 100) {
        const chunk = messages.slice(start, start + 100);
        const chunkOwners = owners.slice(start, start + 100);

        let response: Response;
        try {
            response = await fetch(EXPO_PUSH_URL, {
                method: 'POST',
                headers: {
                    Accept: 'application/json',
                    'Accept-encoding': 'gzip, deflate',
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify(chunk),
            });
        } catch (err) {
            console.error('[daily-word-push] Expo fetch threw:', err);
            failed.push(...chunkOwners);
            continue;
        }

        const responseText = await response.text();

        if (!response.ok) {
            console.error('[daily-word-push] Expo API HTTP error', response.status, responseText);
            failed.push(...chunkOwners);
            continue;
        }

        // Even with HTTP 200, individual tickets can have status: 'error'
        // (DeviceNotRegistered, InvalidCredentials, MessageRateExceeded, ...)
        try {
            const parsed = JSON.parse(responseText) as {
                data?: Array<{ status: 'ok' | 'error'; id?: string; message?: string; details?: unknown }>;
            };
            const tickets = parsed.data ?? [];
            tickets.forEach((ticket, i) => {
                if (ticket.status === 'ok') {
                    console.log(`[daily-word-push] ticket ok id=${ticket.id} → ${chunk[i].to}`);
                } else {
                    console.error(
                        `[daily-word-push] ticket error → ${chunk[i].to}:`,
                        ticket.message,
                        ticket.details,
                    );
                    failed.push(chunkOwners[i]);
                }
            });
        } catch (err) {
            console.error('[daily-word-push] Failed to parse Expo response:', err, responseText);
            failed.push(...chunkOwners);
        }
    }
    return failed;
}

Deno.serve(async () => {
    const startedAt = Date.now();
    const supabase = createClient(SUPABASE_URL, SERVICE_ROLE_KEY, {
        auth: { autoRefreshToken: false, persistSession: false },
    });

    // Pull all candidates whose local time is in the ±7-min window around their
    // notification_time, who have a push token, and who haven't been notified today.
    const { data: candidates, error: fetchError } = await supabase.rpc('get_push_candidates', {
        p_window_seconds: WINDOW_SECONDS,
    });

    if (fetchError) {
        console.error('[daily-word-push] candidate query failed:', fetchError);
        return new Response(JSON.stringify({ ok: false, error: fetchError.message }), { status: 500 });
    }

    const list = (candidates as Candidate[] | null) ?? [];
    console.log(`[daily-word-push] ${list.length} candidates in window`);

    const today = new Date().toISOString().slice(0, 10);

    type Plan = {
        candidate: Candidate;
        word: { id: string; word_de: string; article: string | null; sequence_number: number } | null;
        status: LedgerStatus;
        error: string | null;
    };

    // Step 1 — resolve today's word per candidate (no side effects yet).
    const plans: Plan[] = [];
    for (const c of list) {
        const { data: rpc, error: rpcError } = await supabase.rpc('get_today_word', {
            p_user_id: c.user_id,
        });

        if (rpcError) {
            console.error(`[daily-word-push] get_today_word failed for ${c.user_id}:`, rpcError);
            plans.push({ candidate: c, word: null, status: 'failed', error: rpcError.message });
            continue;
        }

        const word = rpc?.word as Plan['word'];
        const exhausted = Boolean(rpc?.exhausted);

        if (exhausted || !word) {
            plans.push({ candidate: c, word: null, status: 'content_exhausted', error: null });
        } else {
            plans.push({ candidate: c, word, status: 'sent', error: null });
        }
    }

    // Step 2 — RESERVE ledger rows BEFORE sending. INSERT ... ON CONFLICT DO NOTHING
    // (`ignoreDuplicates: true`) returns only rows actually inserted, so a re-run
    // in the same window is a no-op for users already processed.
    const reservationRows: LedgerRow[] = plans.map(p => ({
        user_id: p.candidate.user_id,
        sent_for_date: today,
        word_id: p.word?.id ?? null,
        status: p.status,
        error: p.error,
    }));

    let reservedUserIds = new Set<string>();
    if (reservationRows.length > 0) {
        const { data: reservedData, error: reserveError } = await supabase
            .from('daily_word_notifications')
            .upsert(reservationRows, { onConflict: 'user_id,sent_for_date', ignoreDuplicates: true })
            .select('user_id');

        if (reserveError) {
            console.error('[daily-word-push] ledger reserve failed:', reserveError);
            return new Response(
                JSON.stringify({ ok: false, error: reserveError.message }),
                { status: 500 },
            );
        }

        reservedUserIds = new Set((reservedData ?? []).map(r => r.user_id));
    }

    // Step 3 — build messages only for plans whose ledger row was newly inserted
    // AND that have a real word to send.
    const messages: ExpoPushMessage[] = [];
    const owners: string[] = [];
    for (const p of plans) {
        if (p.status !== 'sent' || !p.word) continue;
        if (!reservedUserIds.has(p.candidate.user_id)) continue;
        messages.push({
            to: p.candidate.expo_token,
            title: TITLE_BY_LANG[p.candidate.translation_language] ?? TITLE_BY_LANG.en,
            body: buildPushBody(p.word.word_de, p.word.article, p.word.sequence_number, p.candidate.translation_language),
            sound: 'default',
            data: { wordId: p.word.id, sequenceNumber: p.word.sequence_number },
            priority: 'high',
            channelId: 'daily-word',
        });
        owners.push(p.candidate.user_id);
    }

    // Step 4 — send.
    const failedUserIds = await sendToExpo(messages, owners);

    // Step 5 — downgrade ledger rows for failures so they're visible in logs.
    // We don't roll back idempotency: a "failed" ledger row still blocks a
    // retry on the next 15-min tick. Operators can replay manually if needed.
    if (failedUserIds.length > 0) {
        const { error: updateError } = await supabase
            .from('daily_word_notifications')
            .update({ status: 'failed', error: 'Expo push send failed' })
            .in('user_id', failedUserIds)
            .eq('sent_for_date', today);
        if (updateError) {
            console.error('[daily-word-push] failure mark update failed:', updateError);
        }
    }

    const sentCount = messages.length - failedUserIds.length;
    const duration = Date.now() - startedAt;
    console.log(
        `[daily-word-push] processed=${list.length} reserved=${reservedUserIds.size} sent=${sentCount} failed=${failedUserIds.length} duration=${duration}ms`,
    );

    return new Response(
        JSON.stringify({
            ok: true,
            processed: list.length,
            reserved: reservedUserIds.size,
            sent: sentCount,
            failed: failedUserIds.length,
        }),
        { headers: { 'Content-Type': 'application/json' } },
    );
});
