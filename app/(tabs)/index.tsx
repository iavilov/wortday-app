import { BrutalButton } from '@/components/ui/brutal-button';
import { BrutalCard } from '@/components/ui/brutal-card';
import { BrutalWordTitle } from '@/components/ui/brutal-word-title';
import { ContentContainer } from '@/components/ui/content-container';
import { HighlightedText } from '@/components/ui/highlighted-text';
import { ScreenHeader } from '@/components/ui/screen-header';
import { ScreenLayout } from '@/components/ui/screen-layout';
import { Colors } from '@/constants/design-tokens';
import { t } from '@/constants/translations';
import { getWordContent } from '@/lib/i18n-helpers';
import { useSettingsStore } from '@/store/settings-store';
import { useWordStore } from '@/store/word-store';
import { ARTICLE_COLORS, PART_OF_SPEECH_COLORS } from '@/types/word';
import { createBrutalShadow } from '@/utils/platform-styles';
import { Heart, Share2 } from 'lucide-react-native';
import React, { useEffect } from 'react';
import { ActivityIndicator, Platform, ScrollView, Share, Text, View } from 'react-native';

export default function Index() {
  const { todayWord, isLoading, loadTodayWord, toggleFavorite, isFavorite } = useWordStore();
  const { translationLanguage } = useSettingsStore();

  useEffect(() => {
    loadTodayWord();
  }, []);

  if (isLoading) {
    return (
      <View className="flex-1 justify-center items-center bg-background">
        <ActivityIndicator size="large" color={Colors.primary} />
        <Text className="text-text-muted mt-4 font-w-medium">
          {t('common.loading', translationLanguage)}
        </Text>
      </View>
    );
  }

  if (!todayWord) {
    return (
      <View className="flex-1 justify-center items-center bg-background p-6">
        <Text className="text-text-main font-w-semibold text-lg">
          {t('common.notFound', translationLanguage)}
        </Text>
      </View>
    );
  }

  const hasArticle = !!todayWord.article;
  const articleColors = hasArticle ? ARTICLE_COLORS[todayWord.article!] : null;
  const content = getWordContent(todayWord, translationLanguage);

  // Nouns are capitalized, other parts of speech are lowercase. 
  // We keep the logic but avoid explicit 'noun' string check if possible, 
  // or just use the word as provided in the database if it's already correctly capitalized.
  const displayWord = todayWord.word_de;

  const publishDate = new Date();
  const day = publishDate.getDate();
  const locale = translationLanguage === 'en' ? 'en-US' :
    translationLanguage === 'uk' ? 'uk-UA' :
      translationLanguage === 'de' ? 'de-DE' : 'ru-RU';

  const month = publishDate.toLocaleString(locale, { month: 'short' }).toUpperCase().replace('.', '');
  const dateString = `${day}. ${month}`;

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
          badgeText={t('home.today', translationLanguage)}
          badgeColor={Colors.accentYellow}
          rightElement={
            <View className="mr-2">
              <BrutalButton
                onPress={onShare}
                borderRadius={4}
                borderWidth={2}
                contentContainerStyle={{ paddingHorizontal: 16, paddingVertical: 8 }}
                pressableStyle={{ flexDirection: 'row' }}
              >
                <Share2 size={18} color={Colors.border} strokeWidth={3} style={{ marginRight: 8 }} />
                <Text className="text-border font-w-extrabold uppercase text-xs">
                  {t('home.share', translationLanguage)}
                </Text>
              </BrutalButton>
            </View>
          }
        />

        <ContentContainer>
          <View
            className="absolute -top-4 right-3 px-3 py-1 z-50"
            style={{
              backgroundColor: Colors.accentPink,
              borderWidth: 2,
              borderColor: Colors.border,
              ...createBrutalShadow(2, Colors.border),
            }}
          >
            <Text className="text-md font-w-extrabold uppercase text-border">
              {t('home.wordOfTheDay', translationLanguage)}
            </Text>
          </View>

          <BrutalCard>
            <View className="flex-row justify-start mb-8">
              <BrutalButton
                onPress={() => toggleFavorite(todayWord.id)}
                borderWidth={2}
                borderRadius={25}
                style={{ width: 44, height: 44 }}
                contentContainerStyle={{ height: '100%' }}
              >
                <Heart
                  size={22}
                  color={Colors.border}
                  fill={isFavorite(todayWord.id) ? Colors.border : 'transparent'}
                  strokeWidth={2.5}
                />
              </BrutalButton>
            </View>

            <BrutalWordTitle
              word={displayWord}
              onAudioPress={() => console.log('Audio playback not implemented yet')}
            />

            <View className="flex-row items-center flex-wrap gap-2 mb-5">
              {hasArticle && articleColors && (
                <View
                  className="px-4 py-1 mr-1"
                  style={{
                    backgroundColor: articleColors.bg,
                    borderWidth: 3,
                    borderColor: articleColors.border,
                    ...createBrutalShadow(2, Colors.border),
                  }}>
                  <Text
                    className="font-w-extrabold text-sm uppercase"
                    style={{
                      color: articleColors.text
                    }}>
                    {todayWord.article}
                  </Text>

                </View>
              )}
              <View
                className="bg-white px-4 py-1.5"
                style={{
                  borderWidth: 2,
                  borderColor: Colors.border,
                }}
              >
                <Text className="text-md font-w-bold text-text-main">
                  {todayWord.transcription_de}
                </Text>
              </View>
              {todayWord.part_of_speech !== ('noun' as string) && (
                <View
                  className="px-3 py-1"
                  style={{
                    backgroundColor: (PART_OF_SPEECH_COLORS as any)[todayWord.part_of_speech]?.bg || Colors.surface,
                    borderWidth: 1,
                    borderColor: Colors.border,
                  }}
                >
                  <Text className="text-xs font-w-bold text-border uppercase">
                    {todayWord.part_of_speech}
                  </Text>
                </View>
              )}

            </View>

            <View className="mb-6">
              <Text className="text-xl text-text-main font-w-bold">
                {content.translation}
              </Text>
            </View>

            <View className="h-0.5 w-full bg-border mb-6" />

            <View
              className="p-5 my-6 relative"
              style={{
                borderWidth: 2,
                borderColor: Colors.border,
                borderRadius: 4,
                backgroundColor: Colors.gray50,

              }}
            >
              <View
                className="bg-white absolute -top-4 left-4 px-3 py-1 flex-row items-center"
                style={{
                  borderWidth: 2,
                  borderColor: Colors.border,
                  ...createBrutalShadow(2, Colors.border),
                }}
              >
                <Text
                  className="text-[10px] font-w-extrabold text-text-main uppercase tracking-widest"
                >
                  {t('home.beispiel', translationLanguage)}
                </Text>
              </View>

              <HighlightedText
                text={content.exampleSentence.de}
                textClassName="text-xl text-text-main font-w-bold leading-[36px] mt-2"
                highlightClassName="text-lg"
              />

              <View
                className="mt-4"
              >
                <Text
                  className="text-[16px] text-text-muted font-w-medium"
                  style={Platform.OS === 'ios' ? { transform: [{ skewX: '-12deg' }] } : { fontStyle: 'italic' }}
                >
                  {content.exampleSentence.translation}
                </Text>
              </View>
            </View>


            <View className="pb-6">
              <View
                className="bg-green-50 p-5 mt-4 relative"
                style={{
                  borderWidth: 2,
                  borderColor: Colors.border,
                  borderRadius: 4,

                }}
              >
                <View
                  className="bg-white absolute -top-4 left-4 px-3 py-1 flex-row items-center"
                  style={{
                    borderWidth: 2,
                    borderColor: Colors.border,
                    ...createBrutalShadow(2, Colors.border),
                  }}
                >

                  <Text
                    className="text-[10px] font-w-extrabold text-text-main uppercase tracking-widest"
                  >
                    {t('home.etymologie', translationLanguage)}
                  </Text>
                </View>

                <Text
                  className="text-sm text-text-main font-w-medium leading-relaxed mt-2"
                >
                  {content.etymology.text || t('common.notFound', translationLanguage)}

                </Text>

                {content.etymology.rootWord && (
                  <View className="mt-4 flex-row items-center">
                    <Text className="text-xs text-text-muted font-w-bold uppercase tracking-wider mr-2">
                      {t('home.root', translationLanguage)}:
                    </Text>
                    <View
                      className="bg-accent-yellow px-2 py-0.5"
                      style={{
                        borderWidth: 2,
                        borderColor: Colors.border,
                      }}
                    >
                      <Text className="text-xs font-w-bold text-text-main">
                        {content.etymology.rootWord}
                      </Text>
                    </View>
                  </View>
                )}
              </View>
            </View>
          </BrutalCard>
        </ContentContainer>
      </ScrollView>
    </ScreenLayout>
  );
}
