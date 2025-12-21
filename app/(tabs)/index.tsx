import { ScreenLayout } from '@/components/ui/screen-layout';
import { EtymologyAccordion } from '@/components/word-card/etymology-accordion';
import { Colors, transcriptionColor } from '@/constants/design-tokens';
import { getWordContent } from '@/lib/i18n-helpers';
import { useSettingsStore } from '@/store/settings-store';
import { useWordStore } from '@/store/word-store';
import { ARTICLE_COLORS } from '@/types/word';
import { createBrutalShadow, createOverflowStyle } from '@/utils/platform-styles';
import { Heart } from 'lucide-react-native';
import { useEffect } from 'react';
import { ActivityIndicator, Image, Platform, ScrollView, Text, TouchableOpacity, View } from 'react-native';
import Animated, { FadeInDown } from 'react-native-reanimated';

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
        <Text className="text-text-muted mt-4" style={{ fontFamily: 'Rubik_500Medium' }}>
          Загрузка...
        </Text>
      </View>
    );
  }

  if (!todayWord) {
    return (
      <View className="flex-1 justify-center items-center bg-background p-6">
        <Text className="text-text-main text-lg" style={{ fontFamily: 'Rubik_600SemiBold' }}>
          Слово дня не найдено
        </Text>
      </View>
    );
  }

  const hasArticle = !!todayWord.article;
  const articleColors = hasArticle ? ARTICLE_COLORS[todayWord.article!] : null;
  const content = getWordContent(todayWord, translationLanguage);

  // Capitalization rules: Noun -> Capitalized, Verb/Adj -> lowercase
  const displayWord = todayWord.part_of_speech === 'noun'
    ? todayWord.word_de // Assume data is correct, or todayWord.word_de.charAt(0).toUpperCase() + ...
    : todayWord.word_de.toLowerCase();

  return (
    <ScreenLayout>
      <ScrollView
        className="flex-1"
        style={{ width: '100%' }}
        showsVerticalScrollIndicator={false}
        contentContainerStyle={{ flexGrow: 1, justifyContent: 'center', alignItems: 'center', }}
      >

        <Animated.View
          entering={FadeInDown.duration(800).delay(200)}
          className="w-full max-w-sm my-6"
        >
          <View
            className='bg-surface rounded-card overflow-hidden'
            style={{
              borderWidth: 3,
              borderColor: Colors.border,
            }}
          >
            <View
              className="m-4"
              style={{
                borderWidth: 3,
                borderColor: Colors.border,
                borderRadius: 8,
                backgroundColor: Colors.surface,
                ...createOverflowStyle(),
                ...createBrutalShadow(4, Colors.border),
              }}
            >
              <Image
                source={{ uri: todayWord.media.image_path }}
                className="w-full h-56"
                style={{
                  backgroundColor: '#F5F5F5',
                  borderRadius: Platform.OS === 'web' ? 0 : 8,
                }}
                resizeMode="cover"
              />
            </View>

            <View className="px-6 pb-4 pt-6">
              <View className="flex-row items-center mb-3">
                {hasArticle && articleColors && (
                  <View
                    className="px-4 py-1.5 mr-3"
                    style={{
                      backgroundColor: articleColors.bg,
                      borderWidth: 3,
                      borderColor: articleColors.border,
                      ...createBrutalShadow(2, Colors.border),
                    }}>
                    <Text
                      className="font-bold text-sm uppercase"
                      style={{
                        fontFamily: 'Rubik_900Black',
                        color: articleColors.text
                      }}>
                      {todayWord.article}
                    </Text>
                  </View>
                )}

                <View className="flex-row items-center justify-center">
                  <View
                    className="px-4 py-1.5 mr-3"
                    style={{
                      backgroundColor: transcriptionColor.bg,
                      borderWidth: 1,
                    }}>
                    <Text
                      className="font-bold text-sm uppercase"
                      style={{
                        fontFamily: 'Rubik_900Black',
                      }}>
                      {todayWord.part_of_speech}
                    </Text>
                  </View>

                </View>



                <Text className="text-text-main text-4xl flex-1"
                  style={{ fontFamily: 'Rubik_700Bold' }}>
                  {displayWord}
                </Text>
              </View>

              <Text className="text-text-muted text-2xl mt-1"
                style={{ fontFamily: 'Rubik_500Medium' }}>
                {content.translation.main}
              </Text>
            </View>

            <View className="mx-6 mb-6 h-px bg-border" />
            <View className="px-6 pb-6">
              <Text className="text-text-main font-bold text-xs uppercase mb-3 tracking-wider"
                style={{ fontFamily: 'Rubik_700Bold' }}>
                📖 Beispiel
              </Text>
              <View
                className="bg-surface p-5 rounded-lg"
                style={{
                  borderWidth: 2,
                  borderColor: Colors.border,
                }}
              >
                <Text className="text-text-main text-lg mb-2"
                  style={{ fontFamily: 'Rubik_600SemiBold', lineHeight: 28 }}>
                  {content.exampleSentence.de}
                </Text>
                <Text className="text-text-muted text-base"
                  style={{ fontFamily: 'Rubik_400Regular' }}>
                  {content.exampleSentence.translation}
                </Text>
              </View>
            </View>

            <View className="px-6 pb-6 max-w-md">
              <EtymologyAccordion title="📚 Этимология" defaultOpen={false}>
                <Text className="text-text-muted text-base leading-6"
                  style={{ fontFamily: 'Rubik_400Regular' }}>
                  {content.etymology.text}
                </Text>
                {content.etymology.rootWord && (
                  <Text className="text-text-muted text-sm mt-3 italic"
                    style={{ fontFamily: 'Rubik_500Medium' }}>
                    Корень: {content.etymology.rootWord}
                  </Text>
                )}
              </EtymologyAccordion>
            </View>

            <View className="px-6 pb-8 flex-row items-center justify-center">
              <TouchableOpacity
                onPress={() => toggleFavorite(todayWord.id)}
                activeOpacity={0.8}
                className="flex-row items-center px-8 py-4 rounded-button"
                style={{
                  backgroundColor: isFavorite(todayWord.id) ? Colors.articleColors.die.bg : Colors.primary,
                  borderWidth: 3,
                  borderColor: Colors.border,
                }}>
                <Heart
                  size={24}
                  color={Colors.border}
                  fill={isFavorite(todayWord.id) ? Colors.border : 'transparent'}
                  strokeWidth={2.5}
                />
                <Text
                  className="ml-3 font-bold text-base uppercase"
                  style={{
                    fontFamily: 'Rubik_900Black',
                    color: Colors.border
                  }}>
                  {isFavorite(todayWord.id) ? '❤️ Любимое' : '🤍 В избранное'}
                </Text>
              </TouchableOpacity>
            </View>
          </View>
        </Animated.View >


      </ScrollView>
    </ScreenLayout>
  );
}
