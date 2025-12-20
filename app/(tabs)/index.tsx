import { ScreenLayout } from '@/components/ui/screen-layout';
import { EtymologyAccordion } from '@/components/word-card/etymology-accordion';
import { Colors } from '@/constants/design-tokens';
import { getWordContent } from '@/lib/i18n-helpers';
import { useSettingsStore } from '@/store/settings-store';
import { useWordStore } from '@/store/word-store';
import { ARTICLE_COLORS } from '@/types/word';
import { Heart } from 'lucide-react-native';
import { useEffect } from 'react';
import { ActivityIndicator, Image, ScrollView, Text, TouchableOpacity, View } from 'react-native';
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
        <ActivityIndicator size="large" color={Colors.accentPurple} />
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

  const articleColors = ARTICLE_COLORS[todayWord.article];
  const content = getWordContent(todayWord, translationLanguage);

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
          className=" w-full max-w-sm   my-6"
        >
          <View className='bg-surface rounded-card overflow-hidden'>
            <Image
              source={{ uri: todayWord.media.image_path }}
              className="w-full h-48"
              style={{ backgroundColor: Colors.gray100 }}
              resizeMode="cover"
            />

            <View className="px-6 pb-4 pt-4">
              <View className="flex-row items-center mb-2">
                <View
                  className="px-3 py-1 rounded-full mr-3"
                  style={{
                    backgroundColor: articleColors.bg,
                    borderWidth: 2,
                    borderColor: articleColors.border
                  }}>
                  <Text
                    className="font-bold text-sm"
                    style={{
                      fontFamily: 'Rubik_700Bold',
                      color: articleColors.text
                    }}>
                    {todayWord.article}
                  </Text>
                </View>
                <Text className="text-primary text-4xl flex-1"
                  style={{ fontFamily: 'Rubik_500Medium' }}>
                  {todayWord.word_de}
                </Text>
              </View>

              <Text className="text-text-muted text-2xl mt-2"
                style={{ fontFamily: 'Rubik_500Medium' }}>
                {content.translation.main}
              </Text>
            </View>

            <View className="mx-6 mb-6 h-px bg-gray-200" />
            <View className="px-6 pb-6">
              <Text className="text-text-main font-bold text-xs uppercase mb-3 tracking-wider"
                style={{ fontFamily: 'Rubik_700Bold' }}>
                Пример использования
              </Text>
              <View className="bg-gray-50 p-4 rounded-xl">
                <Text className="text-text-main text-base mb-2"
                  style={{ fontFamily: 'Rubik_600SemiBold' }}>
                  {content.exampleSentence.de}
                </Text>
                <Text className="text-text-muted text-sm"
                  style={{ fontFamily: 'Rubik_400Regular' }}>
                  {content.exampleSentence.translation}
                </Text>
              </View>
            </View>

            <View className="px-6 pb-6 max-w-md">
              <EtymologyAccordion title="📚 Этимология" defaultOpen={false}>
                <Text className="text-text-muted text-sm leading-5"
                  style={{ fontFamily: 'Rubik_400Regular' }}>
                  {content.etymology.text}
                </Text>
                {content.etymology.rootWord && (
                  <Text className="text-text-muted text-xs mt-2 italic"
                    style={{ fontFamily: 'Rubik_400Regular' }}>
                    Корень: {content.etymology.rootWord}
                  </Text>
                )}
              </EtymologyAccordion>
            </View>

            <View className="mx-6 mb-4 h-px bg-gray-200" />

            <View className="px-6 pb-6 flex-row items-center justify-center">
              <TouchableOpacity
                onPress={() => toggleFavorite(todayWord.id)}
                activeOpacity={0.7}
                className="flex-row items-center px-6 py-3 rounded-full"
                style={{
                  backgroundColor: isFavorite(todayWord.id) ? Colors.articleColors.die.bg : Colors.gray100,
                }}>
                <Heart
                  size={20}
                  color={isFavorite(todayWord.id) ? Colors.articleColors.die.accent : Colors.textMuted}
                  fill={isFavorite(todayWord.id) ? Colors.articleColors.die.accent : 'transparent'}
                  strokeWidth={2.5}
                />
                <Text
                  className="ml-2 font-bold text-sm"
                  style={{
                    fontFamily: 'Rubik_600SemiBold',
                    color: isFavorite(todayWord.id) ? Colors.articleColors.die.accent : Colors.textMuted
                  }}>
                  {isFavorite(todayWord.id) ? 'В избранном' : 'В избранное'}
                </Text>
              </TouchableOpacity>
            </View>
          </View>
        </Animated.View >


      </ScrollView>
    </ScreenLayout>
  );
}
