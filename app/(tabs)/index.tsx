import { BrutalButton } from '@/components/ui/brutal-button';
import { BrutalTag } from '@/components/ui/brutal-tag';
import { ContentContainer } from '@/components/ui/content-container';
import { ScreenHeader } from '@/components/ui/screen-header';
import { ScreenLayout } from '@/components/ui/screen-layout';
import { WordCard } from '@/components/word-card';
import { Colors, borderRadius } from '@/constants/design-tokens';
import { t } from '@/constants/translations';
import { formatDate } from '@/lib/date-helpers';
import { getWordContent } from '@/lib/i18n-helpers';
import { useSettingsStore } from '@/store/settings-store';
import { useWordStore } from '@/store/word-store';
import * as Haptics from 'expo-haptics';
import { Share2 } from 'lucide-react-native';
import React, { useEffect } from 'react';
import { ActivityIndicator, Alert, ScrollView, Share, Text, View } from 'react-native';

export default function Index() {
  const { todayWord, isLoading, loadTodayWord, toggleFavorite, isFavorite } = useWordStore();
  const { translationLanguage } = useSettingsStore();

  useEffect(() => {
    loadTodayWord();
  }, []);

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

  if (!todayWord) {
    return (
      <ScreenLayout>
        <View className="flex-1 justify-center items-center p-6">
          <Text className="text-text-main font-w-semibold text-lg">
            {t('common.notFound', translationLanguage)}
          </Text>
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
        message: `${message} 🚀 Vocade`,
      });
    } catch (error) {
      console.error(error);
    }
  };

  const handleAudioPress = () => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    Alert.alert(
      t('home.audioComingSoon', translationLanguage),
      t('home.audioComingSoonMessage', translationLanguage)
    );
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
            isFavorite={isFavorite(todayWord.id)}
            onToggleFavorite={() => toggleFavorite(todayWord.id)}
            onAudioPress={handleAudioPress}
          // onShare is in header, so not passed here
          />
        </ContentContainer>
      </ScrollView>
    </ScreenLayout>
  );
}
