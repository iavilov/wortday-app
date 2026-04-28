/**
 * Generates two MP3 files per word via Google Cloud TTS Neural2-F:
 *   - {id}_word.mp3:     "<article> <word_de>" (or just word for non-nouns)
 *   - {id}_sentence.mp3: example_sentence.de (markdown ** stripped)
 *
 * Uploads to Supabase Storage bucket `pronunciations`, then writes
 * media={audio_word, audio_sentence} into the words table.
 *
 * Idempotent: skips files already present in Storage.
 *
 * Run: npm run generate:audio
 */

import { createClient } from '@supabase/supabase-js';
import * as dotenv from 'dotenv';
import * as path from 'path';
import { buildWordText, stripSentenceMarkdown } from '../lib/pronunciation-text';

dotenv.config({ path: path.resolve(__dirname, '../.env.local') });

const SUPABASE_URL = process.env.EXPO_PUBLIC_SUPABASE_URL ?? 'https://ghrbimousviadvdwvuhx.supabase.co';
const SERVICE_ROLE_KEY = process.env.SUPABASE_SERVICE_ROLE_KEY!;
const TTS_API_KEY = process.env.GOOGLE_TTS_API_KEY!;

if (!SERVICE_ROLE_KEY || !TTS_API_KEY) {
  console.error('Missing SUPABASE_SERVICE_ROLE_KEY or GOOGLE_TTS_API_KEY in .env.local');
  process.exit(1);
}

const BUCKET = 'pronunciations';
const VOICE = 'de-DE-Neural2-F';
const SPEAKING_RATE = 0.9;
const THROTTLE_MS = 100;
const FILE_SIZE_LIMIT = 262144;

const supabase = createClient(SUPABASE_URL, SERVICE_ROLE_KEY, {
  auth: { autoRefreshToken: false, persistSession: false },
});

interface WordRow {
  id: string;
  word_de: string;
  article: string | null;
  content: { example_sentence: { de: string } };
}

const sleep = (ms: number) => new Promise((r) => setTimeout(r, ms));

async function ensureBucket(): Promise<void> {
  const { data: buckets } = await supabase.storage.listBuckets();
  const exists = buckets?.some((b) => b.name === BUCKET);

  if (exists) {
    const { error } = await supabase.storage.updateBucket(BUCKET, {
      public: true,
      fileSizeLimit: FILE_SIZE_LIMIT,
      allowedMimeTypes: ['audio/mpeg'],
    });
    if (error) throw new Error(`Failed to update bucket: ${error.message}`);
    console.log(`Bucket "${BUCKET}" updated (fileSizeLimit=${FILE_SIZE_LIMIT})`);
    return;
  }

  const { error } = await supabase.storage.createBucket(BUCKET, {
    public: true,
    fileSizeLimit: FILE_SIZE_LIMIT,
    allowedMimeTypes: ['audio/mpeg'],
  });
  if (error) throw new Error(`Failed to create bucket: ${error.message}`);
  console.log(`Bucket "${BUCKET}" created (fileSizeLimit=${FILE_SIZE_LIMIT})`);
}

async function fileExists(filename: string): Promise<boolean> {
  const { data } = await supabase.storage.from(BUCKET).list('', { search: filename });
  return !!data?.some((f) => f.name === filename);
}

async function synthesizeMp3(text: string): Promise<Buffer> {
  const url = `https://texttospeech.googleapis.com/v1/text:synthesize?key=${TTS_API_KEY}`;
  const body = {
    input: { text },
    voice: { languageCode: 'de-DE', name: VOICE },
    audioConfig: { audioEncoding: 'MP3', speakingRate: SPEAKING_RATE },
  };
  const res = await fetch(url, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(body),
  });
  if (!res.ok) {
    const err = await res.text();
    throw new Error(`TTS API ${res.status}: ${err.slice(0, 200)}`);
  }
  const json = (await res.json()) as { audioContent: string };
  return Buffer.from(json.audioContent, 'base64');
}

async function uploadIfMissing(filename: string, text: string): Promise<'uploaded' | 'skipped'> {
  if (await fileExists(filename)) return 'skipped';
  const mp3 = await synthesizeMp3(text);
  const { error } = await supabase.storage.from(BUCKET).upload(filename, mp3, {
    contentType: 'audio/mpeg',
    upsert: false,
  });
  if (error) throw new Error(`Upload ${filename} failed: ${error.message}`);
  return 'uploaded';
}

async function main() {
  await ensureBucket();

  const { data: words, error } = await supabase
    .from('words')
    .select('id, word_de, article, content')
    .order('level')
    .order('sequence_number')
    .range(0, 99999);

  if (error) throw error;
  if (!words || words.length === 0) {
    console.log('No words found in DB');
    return;
  }

  console.log(`Processing ${words.length} words...`);

  let uploaded = 0;
  let skipped = 0;
  let updated = 0;

  for (const w of words as WordRow[]) {
    const wordFile = `${w.id}_word.mp3`;
    const sentenceFile = `${w.id}_sentence.mp3`;
    const wordText = buildWordText(w.article, w.word_de);
    const sentenceText = stripSentenceMarkdown(w.content?.example_sentence?.de ?? '');

    if (!sentenceText) {
      console.warn(`  [${w.id}] no example_sentence.de — skipping sentence`);
    }

    try {
      const r1 = await uploadIfMissing(wordFile, wordText);
      r1 === 'uploaded' ? uploaded++ : skipped++;
      await sleep(THROTTLE_MS);

      if (sentenceText) {
        const r2 = await uploadIfMissing(sentenceFile, sentenceText);
        r2 === 'uploaded' ? uploaded++ : skipped++;
        await sleep(THROTTLE_MS);
      }

      const media = {
        audio_word: wordFile,
        audio_sentence: sentenceText ? sentenceFile : '',
      };
      const { error: updErr } = await supabase
        .from('words')
        .update({ media })
        .eq('id', w.id);
      if (updErr) throw new Error(`DB update ${w.id} failed: ${updErr.message}`);
      updated++;

      console.log(`  ✓ ${w.id} (${wordText})`);
    } catch (e) {
      console.error(`  ✗ ${w.id}:`, (e as Error).message);
    }
  }

  console.log(`\nDone. Uploaded: ${uploaded}, skipped: ${skipped}, DB updated: ${updated}/${words.length}`);
}

main().catch((e) => {
  console.error(e);
  process.exit(1);
});
