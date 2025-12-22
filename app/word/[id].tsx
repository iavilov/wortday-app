/**
 * Word Detail Page
 * Shows full information about a specific word
 */

import { EtymologyAccordion } from '@/components/word-card/etymology-accordion';
import { Colors } from '@/constants/design-tokens';
import { getWordContent } from '@/lib/i18n-helpers';
import { getWordById } from '@/lib/mock-data';
import { useSettingsStore } from '@/store/settings-store';
import { useWordStore } from '@/store/word-store';
import { ARTICLE_COLORS } from '@/types/word';
import { useLocalSearchParams, useRouter } from 'expo-router';
import { Heart } from 'lucide-react-native';
import { Image, Platform, ScrollView, Text, TouchableOpacity, View } from 'react-native';
import Animated, { FadeInDown } from 'react-native-reanimated';

export default function WordDetailPage() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const router = useRouter();
  const { translationLanguage } = useSettingsStore();
  const { toggleFavorite, isFavorite } = useWordStore();

  const word = getWordById(id as string);

  if (!word) {
    return (
      <View className="flex-1 justify-center items-center bg-background">
        <Text className="text-text-main text-lg font-semibold">
          Слово не найдено
        </Text>
        <TouchableOpacity
          onPress={() => router.back()}
          className="mt-4 px-6 py-3 bg-primary rounded-button">
          <Text className="text-white font-semibold">
            Назад
          </Text>
        </TouchableOpacity>
      </View>
    );
  }

  const hasArticle = !!word.article;
  const articleColors = hasArticle ? ARTICLE_COLORS[word.article!] : null;
  const content = getWordContent(word, translationLanguage);

  const displayWord = word.part_of_speech === 'noun'
    ? word.word_de
    : word.word_de.toLowerCase();

  return (
    <ScrollView className="flex-1 bg-background">
      <View className="flex-1 items-center p-6 py-12">

        <TouchableOpacity
          onPress={() => router.back()}
          className="self-start mb-4 px-4 py-2 bg-surface rounded-full shadow-sm">
          <Text className="text-primary font-semibold">
            ← Назад
          </Text>
        </TouchableOpacity>

        <Animated.View
          entering={FadeInDown.duration(600)}
          className="bg-surface w-full max-w-sm rounded-card shadow-soft-colored overflow-hidden"
          style={Platform.select({
            ios: {
              shadowColor: '#6C5CE7',
              shadowOffset: { width: 0, height: 10 },
              shadowOpacity: 0.15,
              shadowRadius: 20,
            },
            android: {
              elevation: 10,
            },
          })}
        >

          <Image
            source={{ uri: word.media.image_path }}
            className="w-full h-64"
            style={{ backgroundColor: Colors.gray100 }}
            resizeMode="cover"
          />

          <View className="px-6 pt-6 pb-2">
            <Text className="text-secondary-foreground font-bold tracking-widest uppercase text-xs">
              {word.level} • {word.part_of_speech}
            </Text>
          </View>

          <View className="px-6 pb-4">
            <View className="flex-row items-center mb-2">
              {hasArticle && articleColors && (
                <View
                  className="px-4 py-1.5 rounded-full mr-3"
                  style={{
                    backgroundColor: articleColors.bg,
                  }}>
                  <Text
                    className="font-bold text-sm"
                    style={{
                      color: articleColors.text
                    }}>
                    {word.article}
                  </Text>
                </View>
              )}
              <Text className="text-text-main text-4xl flex-1 font-bold">
                {displayWord}
              </Text>
            </View>

            <Text className="text-text-muted text-2xl mt-1 font-medium">
              {content.translation.main}
            </Text>
          </View>

          <View className="mx-6 mb-6 h-px bg-gray-100" />

          <View className="px-6 pb-6">
            <Text className="text-text-main font-bold text-xs uppercase mb-3 tracking-wider"
              style={{ opacity: 0.5 }}>
              Пример использования
            </Text>
            <View className="bg-gray-50 p-5 rounded-2xl">
              <Text className="text-text-main text-lg mb-2 font-medium">
                {content.exampleSentence.de}
              </Text>
              <Text className="text-text-muted text-base font">
                {content.exampleSentence.translation}
              </Text>
            </View>
          </View>

          <View className="px-6 pb-6">
            <EtymologyAccordion title="📚 Этимология" defaultOpen={false}>
              <Text className="text-text-muted text-base leading-6 font">
                {content.etymology.text}
              </Text>
              {content.etymology.rootWord && (
                <Text className="text-text-muted text-sm mt-3 italic font-medium">
                  Корень: {content.etymology.rootWord}
                </Text>
              )}
            </EtymologyAccordion>
          </View>

          <View className="px-6 pb-8 flex-row items-center justify-center">
            <TouchableOpacity
              onPress={() => toggleFavorite(word.id)}
              activeOpacity={0.7}
              className="flex-row items-center px-8 py-4 rounded-button shadow-sm"
              style={{
                backgroundColor: isFavorite(word.id) ? Colors.articleColors.die.bg : Colors.primary,
              }}>
              <Heart
                size={24}
                color={isFavorite(word.id) ? Colors.articleColors.die.accent : '#FFF'}
                fill={isFavorite(word.id) ? Colors.articleColors.die.accent : 'transparent'}
                strokeWidth={2.5}
              />
              <Text
                className="ml-3 font-bold text-base"
                style={{
                  color: isFavorite(word.id) ? Colors.articleColors.die.accent : '#FFF'
                }}>
                {isFavorite(word.id) ? 'В избранном' : 'В избранное'}
              </Text>
            </TouchableOpacity>
          </View>

        </Animated.View>

      </View>
    </ScrollView>
  );
}
