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
import { Image, ScrollView, Text, TouchableOpacity, View } from 'react-native';
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
        <Text className="text-text-main text-lg" style={{ fontFamily: 'Rubik_600SemiBold' }}>
          Слово не найдено
        </Text>
        <TouchableOpacity 
          onPress={() => router.back()}
          className="mt-4 px-6 py-3 bg-primary rounded-button">
          <Text className="text-white font-bold" style={{ fontFamily: 'Rubik_600SemiBold' }}>
            Назад
          </Text>
        </TouchableOpacity>
      </View>
    );
  }

  const articleColors = ARTICLE_COLORS[word.article];
  const content = getWordContent(word, translationLanguage);

  return (
    <ScrollView className="flex-1 bg-background">
      <View className="flex-1 items-center p-6 py-12">
        
        {/* Back Button */}
        <TouchableOpacity
          onPress={() => router.back()}
          className="self-start mb-4 px-4 py-2 bg-surface rounded-full shadow-sm">
          <Text className="text-primary font-bold" style={{ fontFamily: 'Rubik_600SemiBold' }}>
            ← Назад
          </Text>
        </TouchableOpacity>

        {/* Main Card */}
        <Animated.View 
          entering={FadeInDown.duration(600)}
          className="bg-surface w-full max-w-sm rounded-card shadow-soft overflow-hidden">
          
          {/* Image */}
          <Image 
            source={{ uri: word.media.image_path }}
            className="w-full h-48"
            style={{ backgroundColor: Colors.gray100 }}
            resizeMode="cover"
          />
          
          {/* Header: Level Badge */}
          <View className="px-6 pt-6 pb-2">
            <Text className="text-accent-purple font-bold tracking-widest uppercase text-xs" 
                  style={{ fontFamily: 'Rubik_700Bold' }}>
              {word.level} • {word.part_of_speech}
            </Text>
          </View>

          {/* Word with Article */}
          <View className="px-6 pb-4">
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
                  {word.article}
                </Text>
              </View>
              <Text className="text-primary text-4xl font-extrabold flex-1"
                    style={{ fontFamily: 'Rubik_800ExtraBold' }}>
                {word.word_de}
              </Text>
            </View>
            
            {/* Translation */}
            <Text className="text-text-muted text-2xl mt-2"
                  style={{ fontFamily: 'Rubik_500Medium' }}>
              {content.translation.main}
            </Text>
          </View>

          {/* Divider */}
          <View className="mx-6 mb-6 h-px bg-gray-200" />

          {/* Example Sentence */}
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

          {/* Etymology */}
          <View className="px-6 pb-6">
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

          {/* Divider */}
          <View className="mx-6 mb-4 h-px bg-gray-200" />

          {/* Favorite Button */}
          <View className="px-6 pb-6 flex-row items-center justify-center">
            <TouchableOpacity
              onPress={() => toggleFavorite(word.id)}
              activeOpacity={0.7}
              className="flex-row items-center px-6 py-3 rounded-full"
              style={{ 
                backgroundColor: isFavorite(word.id) ? Colors.articleColors.die.bg : Colors.gray100,
              }}>
              <Heart 
                size={20} 
                color={isFavorite(word.id) ? Colors.articleColors.die.accent : Colors.textMuted}
                fill={isFavorite(word.id) ? Colors.articleColors.die.accent : 'transparent'}
                strokeWidth={2.5}
              />
              <Text 
                className="ml-2 font-bold text-sm"
                style={{ 
                  fontFamily: 'Rubik_600SemiBold',
                  color: isFavorite(word.id) ? Colors.articleColors.die.accent : Colors.textMuted
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
