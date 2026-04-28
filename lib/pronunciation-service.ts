import { Audio } from 'expo-av';
import * as Speech from 'expo-speech';

export { buildWordText, stripSentenceMarkdown } from './pronunciation-text';

const SUPABASE_URL =
  process.env.EXPO_PUBLIC_SUPABASE_URL ?? 'https://ghrbimousviadvdwvuhx.supabase.co';
const STORAGE_BASE = `${SUPABASE_URL}/storage/v1/object/public/pronunciations`;

let currentSound: Audio.Sound | null = null;

async function unloadCurrent(): Promise<void> {
  if (!currentSound) return;
  const sound = currentSound;
  currentSound = null;
  try {
    await sound.unloadAsync();
  } catch {
    // ignore — sound may already be unloaded
  }
}

export function getAudioUrl(audioPath: string): string {
  return `${STORAGE_BASE}/${audioPath}`;
}

async function playFallback(text: string): Promise<void> {
  try {
    Speech.stop();
    Speech.speak(text, { language: 'de-DE', rate: 0.9 });
  } catch (e) {
    console.warn('[pronunciation] expo-speech fallback failed:', e);
  }
}

export async function playPronunciation(
  audioPath: string | undefined,
  fallbackText?: string,
): Promise<void> {
  await unloadCurrent();

  if (!audioPath) {
    if (fallbackText) await playFallback(fallbackText);
    return;
  }

  try {
    const { sound } = await Audio.Sound.createAsync(
      { uri: getAudioUrl(audioPath) },
      { shouldPlay: true },
    );
    currentSound = sound;

    sound.setOnPlaybackStatusUpdate((status) => {
      if ('isLoaded' in status && status.isLoaded && status.didJustFinish) {
        sound.unloadAsync().catch(() => {});
        if (currentSound === sound) currentSound = null;
      }
    });
  } catch (e) {
    console.warn('[pronunciation] expo-av failed, falling back to TTS:', e);
    if (fallbackText) await playFallback(fallbackText);
  }
}
