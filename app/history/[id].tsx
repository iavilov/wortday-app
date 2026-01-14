import { ContentContainer } from '@/components/ui/content-container';
import { ScreenHeader } from '@/components/ui/screen-header';
import { ScreenLayout } from '@/components/ui/screen-layout';
import { WordCard } from '@/components/word-card';
import { Colors } from '@/constants/design-tokens';
import { formatDate } from '@/lib/date-helpers';
import { getWordContent, t } from '@/lib/i18n-helpers';
import * as wordService from '@/lib/word-service';
import { useSettingsStore } from '@/store/settings-store';
import { useWordStore } from '@/store/word-store';
import { Word } from '@/types/word';
import { createBrutalShadow } from '@/utils/platform-styles';
import { useLocalSearchParams, useRouter } from 'expo-router';
import { ArrowLeft } from 'lucide-react-native';
import { useEffect, useState } from 'react';
import { ActivityIndicator, ScrollView, Share, Text, TouchableOpacity, View } from 'react-native';
import Animated from 'react-native-reanimated';

export default function WordDetailPage() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const router = useRouter();
  const { translationLanguage } = useSettingsStore();
  const { toggleFavorite, isFavorite } = useWordStore();
  const [word, setWord] = useState<Word | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    async function fetchWord() {
      const { word: fetchedWord, error } = await wordService.getWordById(id as string);
      if (error) {
        console.error('Failed to fetch word:', error);
      }
      setWord(fetchedWord);
      setIsLoading(false);
    }
    fetchWord();
  }, [id]);

  const handleBack = () => {
    if (router.canGoBack()) {
      router.back();
    } else {
      router.replace('/history');
    }
  };

  if (isLoading) {
    return (
      <ScreenLayout>
        <View className="flex-1 justify-center items-center">
          <ActivityIndicator size="large" color={Colors.primary} />
          <Text className="text-text-muted mt-4 font-w-medium">
            {t('common.loading', translationLanguage)}
          </Text>
        </View>
      </ScreenLayout>
    );
  }

  if (!word) {
    return (
      <ScreenLayout>
        <View className="flex-1 justify-center items-center bg-background p-6">
          <Text className="text-text-main font-w-semibold text-lg mb-6">
            {t('common.notFound', translationLanguage)}
          </Text>
          <TouchableOpacity
            onPress={handleBack}
            className="flex-row items-center px-6 py-3"
            style={{
              backgroundColor: Colors.surface,
              borderWidth: 3,
              borderColor: Colors.border,
              borderRadius: 8,
              ...createBrutalShadow(3, Colors.border),
            }}
          >
            <ArrowLeft size={20} color={Colors.border} strokeWidth={3} className="mr-2" />
            <Text className="text-border font-w-bold uppercase text-sm">
              {t('history.back', translationLanguage)}
            </Text>
          </TouchableOpacity>
        </View>
      </ScreenLayout>
    );
  }

  const content = getWordContent(word, translationLanguage);

  const displayWord = word.word_de;

  const dateString = formatDate(new Date(), translationLanguage);

  const onShare = async () => {
    try {
      const shareTemplate = t('home.shareMessage', translationLanguage);
      const message = shareTemplate
        .replace('{word}', displayWord)
        .replace('{translation}', content.translation);

      await Share.share({
        message: `${message} 🚀 Vocade`,
      });
    } catch (error) {
      console.error(error);
    }
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
          badgeText={t('history.datum', translationLanguage)}
          badgeColor={Colors.accentYellow}
          showBackButton
          onBackPress={handleBack}
        />

        <ContentContainer>
          <Animated.View>
            <WordCard
              word={word}
              content={content}
              translationLanguage={translationLanguage}
              isFavorite={isFavorite(word.id)}
              onToggleFavorite={() => toggleFavorite(word.id)}
              onAudioPress={() => console.log('Audio playback not implemented yet')}
              onShare={onShare}
            />
          </Animated.View>
        </ContentContainer>
      </ScrollView>
    </ScreenLayout>
  );
}
