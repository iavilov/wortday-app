import { useWordStore } from '@/store/word-store';
import { ARTICLE_COLORS } from '@/types/word';
import { useEffect } from 'react';
import { ActivityIndicator, ScrollView, Text, View } from 'react-native';

export default function Index() {
  const { todayWord, isLoading, loadTodayWord, streak } = useWordStore();

  useEffect(() => {
    loadTodayWord();
  }, []);

  if (isLoading) {
    return (
      <View className="flex-1 justify-center items-center bg-background">
        <ActivityIndicator size="large" color="#8B5CF6" />
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
  console.log('articleColors', articleColors)


  return (
    <ScrollView className="flex-1 bg-background">
      <View className="flex-1 justify-center items-center p-6 py-12">
        
        {/* Main Card */}
        <View className="bg-surface w-full max-w-sm rounded-card shadow-soft overflow-hidden">
          
          {/* Header: Level Badge */}
          <View className="px-6 pt-6 pb-2">
            <Text className="text-accent-purple font-bold tracking-widest uppercase text-xs" 
                  style={{ fontFamily: 'Rubik_700Bold' }}>
              {todayWord.level} • {todayWord.part_of_speech}
            </Text>
          </View>

          {/* Word with Article (Color Coded) */}
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
                  {todayWord.article}
                </Text>
              </View>
              <Text className="text-primary text-4xl font-extrabold flex-1"
                    style={{ fontFamily: 'Rubik_800ExtraBold' }}>
                {todayWord.word_de}
              </Text>
            </View>
            
            {/* Russian Translation */}
            <Text className="text-text-muted text-2xl mt-2"
                  style={{ fontFamily: 'Rubik_500Medium' }}>
              {todayWord.translations.ru.main}
            </Text>
          </View>

          {/* Example Sentence */}
          <View className="px-6 pb-6">
            <View className="bg-gray-50 p-4 rounded-xl">
              <Text className="text-text-main text-base mb-2"
                    style={{ fontFamily: 'Rubik_600SemiBold' }}>
                {todayWord.content.example_sentence.de}
              </Text>
              <Text className="text-text-muted text-sm"
                    style={{ fontFamily: 'Rubik_400Regular' }}>
                {todayWord.content.example_sentence.ru}
              </Text>
            </View>
          </View>

          {/* Etymology */}
          <View className="px-6 pb-6">
            <Text className="text-accent-purple font-bold text-xs uppercase mb-2"
                  style={{ fontFamily: 'Rubik_700Bold' }}>
              📚 Этимология
            </Text>
            <Text className="text-text-muted text-sm leading-5"
                  style={{ fontFamily: 'Rubik_400Regular' }}>
              {todayWord.content.etymology.text_ru}
            </Text>
          </View>

        </View>

        {/* Test Info */}
        <View className="mt-6 px-6">
          <Text className="text-text-muted text-center text-xs"
                style={{ fontFamily: 'Rubik_400Regular' }}>
            Итерация 1: Тестирование моковых данных ✅
          </Text>
        </View>

      </View>
    </ScrollView>
  );
}
