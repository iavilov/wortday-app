import { BrutalButton } from '@/components/ui/brutal-button';
import { BrutalEmpty } from '@/components/ui/brutal-empty';
import { BrutalCardSkeleton } from '@/components/ui/brutal-skeleton';
import { BrutalTag } from '@/components/ui/brutal-tag';
import { ContentContainer } from '@/components/ui/content-container';
import { ScreenHeader } from '@/components/ui/screen-header';
import { ScreenLayout } from '@/components/ui/screen-layout';
import { WordCard } from '@/components/word-card';
import { Colors, borderRadius } from '@/constants/design-tokens';
import { t } from '@/constants/translations';
import { formatDate } from '@/lib/date-helpers';
import { getWordContent } from '@/lib/i18n-helpers';
import * as pronunciationService from '@/lib/pronunciation-service';
import { useSettingsStore } from '@/store/settings-store';
import { useWordStore } from '@/store/word-store';
import * as Haptics from 'expo-haptics';
import { useToast } from '@/store/toast-store';
import { useRouter } from 'expo-router';
import { GraduationCap, SearchX, Share2 } from 'lucide-react-native';
import React, { useEffect } from 'react';
import { ScrollView, Share, Text, View } from 'react-native';

export default function Index() {
  const router = useRouter();
  const todayWord = useWordStore(s => s.todayWord);
  const isLoading = useWordStore(s => s.isLoading);
  const exhausted = useWordStore(s => s.exhausted);
  const favoriteIds = useWordStore(s => s.favoriteIds);
  const loadTodayWord = useWordStore(s => s.loadTodayWord);
  const toggleFavorite = useWordStore(s => s.toggleFavorite);
  const markWordAsViewed = useWordStore(s => s.markWordAsViewed);
  const translationLanguage = useSettingsStore(s => s.translationLanguage);
  const languageLevel = useSettingsStore(s => s.languageLevel);
  const registrationDate = useSettingsStore(s => s.registrationDate);
  const { show: showToast } = useToast();

  // Load today's word when component mounts OR when level/registration date changes
  // This ensures correct word is shown when switching between accounts
  useEffect(() => {
    console.log(`[Home] Loading today's word for level=${languageLevel}, registrationDate=${registrationDate}`);
    loadTodayWord();
  }, [languageLevel, registrationDate, loadTodayWord]);

  // Auto-mark word as viewed when loaded
  useEffect(() => {
    if (todayWord && !isLoading) {
      console.log(`[Home] Auto-marking word as viewed: ${todayWord.id}`);
      markWordAsViewed(todayWord.id);
    }
  }, [todayWord?.id, isLoading, markWordAsViewed]);

  if (isLoading) {
    return (
      <ScreenLayout>
        <ContentContainer className="mt-6">
          <BrutalCardSkeleton />
        </ContentContainer>
      </ScreenLayout>
    );
  }

  if (exhausted) {
    return (
      <ScreenLayout>
        <View className="flex-1 justify-center items-center px-6">
          <BrutalEmpty
            Icon={GraduationCap}
            iconBackground={Colors.primary}
            title={t('home.exhaustedTitle', translationLanguage)}
            description={t('home.exhaustedSubtitle', translationLanguage)}
            actionLabel={t('home.exhaustedChangeLevel', translationLanguage)}
            onAction={() => router.push('/settings/level')}
          />
        </View>
      </ScreenLayout>
    );
  }

  if (!todayWord) {
    return (
      <ScreenLayout>
        <View className="flex-1 justify-center items-center px-6">
          <BrutalEmpty
            Icon={SearchX}
            iconBackground={Colors.accentYellow}
            title={t('common.notFound', translationLanguage)}
          />
        </View>
      </ScreenLayout>
    );
  }

  const content = getWordContent(todayWord, translationLanguage);

  const displayWord = todayWord.word_de;
  const dateString = formatDate(new Date(), translationLanguage);

  const onShare = async () => {
    try {
      const shareTemplate = t('home.shareMessage', translationLanguage);
      const message = shareTemplate
        .replace('{word}', displayWord)
        .replace('{translation}', content.translation);

      await Share.share({
        message: `${message} 🚀 Wortday`,
      });
    } catch (error) {
      console.error(error);
    }
  };

  const handleAudioPress = () => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    const wordText = pronunciationService.buildWordText(todayWord.article, todayWord.word_de);
    pronunciationService.playPronunciation(todayWord.media?.audio_word, wordText);
  };

  const handleSentenceAudioPress = () => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    const sentence = pronunciationService.stripSentenceMarkdown(todayWord.content.example_sentence.de);
    pronunciationService.playPronunciation(todayWord.media?.audio_sentence, sentence);
  };

  return (
    <ScreenLayout>
      <ScrollView
        className="flex-1 w-full"
        showsVerticalScrollIndicator={false}
        contentContainerStyle={{
          paddingBottom: 160,
          alignItems: 'center'
        }}
      >
        <ScreenHeader
          title={dateString}
          badgeText={t('home.today', translationLanguage)}
          badgeColor={Colors.accentYellow}
          rightElement={
            <View className="mr-2">
              <BrutalButton
                onPress={onShare}
                borderRadius={borderRadius.SMALL}
                borderWidth={2}
                contentContainerStyle={{ paddingHorizontal: 16, paddingVertical: 8 }}
                pressableStyle={{ flexDirection: 'row' }}
              >
                <Share2 size={18} color={Colors.border} strokeWidth={3} style={{ marginRight: 8 }} />
                <Text className="text-border font-w-bold uppercase text-xs">
                  {t('home.share', translationLanguage)}
                </Text>
              </BrutalButton>
            </View>
          }
        />

        <ContentContainer>
          <BrutalTag
            text={t('home.wordOfTheDay', translationLanguage)}
            backgroundColor={Colors.accentPink}
            borderWidth={2}
            borderRadius={borderRadius.SHARP}
            shadowOffset={1}
            style={{ position: 'absolute', right: 12, top: -20, zIndex: 50 }}
            textClassName="text-xs"
          />

          <WordCard
            word={todayWord}
            content={content}
            translationLanguage={translationLanguage}
            isFavorite={favoriteIds.has(todayWord.id)}
            onToggleFavorite={() => {
              const wasFavorite = favoriteIds.has(todayWord.id);
              toggleFavorite(todayWord.id);
              showToast(
                t(wasFavorite ? 'home.toastUnfavorited' : 'home.toastFavorited', translationLanguage),
                'success',
              );
            }}
            onAudioPress={handleAudioPress}
            onSentenceAudioPress={handleSentenceAudioPress}
          // onShare is in header, so not passed here
          />
        </ContentContainer>
      </ScrollView>
    </ScreenLayout>
  );
}
