import { BrutalButton } from '@/components/ui/brutal-button';
import { ScreenLayout } from '@/components/ui/screen-layout';
import { Colors } from '@/constants/design-tokens';
import { useSettingsStore } from '@/store/settings-store';
import { useWordStore } from '@/store/word-store';
import { Article, ARTICLE_COLORS, PART_OF_SPEECH_COLORS, PartOfSpeech } from '@/types/word';
import { createBrutalShadow, createOverflowStyle } from '@/utils/platform-styles';
import { useRouter } from 'expo-router';
import { ArrowRight, Search } from 'lucide-react-native';
import { useEffect, useState } from 'react';
import { FlatList, ScrollView, Text, TouchableOpacity, View } from 'react-native';

type TabType = 'all' | 'favorites';

export default function HistoryScreen() {
  const router = useRouter();
  const { translationLanguage } = useSettingsStore();
  const { loadAllWords, allWords, getFavoriteWords } = useWordStore();
  const [activeTab, setActiveTab] = useState<TabType>('all');

  useEffect(() => {
    loadAllWords();
  }, []);

  const displayWords = activeTab === 'all' ? allWords : getFavoriteWords();

  return (
    <ScreenLayout>
      <ScrollView
        className="flex-1 w-full"
        showsVerticalScrollIndicator={false}
        contentContainerStyle={{
          paddingBottom: 80,
        }}
      >
        {/* Header */}
        <View className="flex-row items-center justify-between pt-8 pb-10 w-full">
          <View className="flex-col">
            <View
              style={{
                backgroundColor: Colors.accentPink,
                borderWidth: 2,
                borderColor: Colors.border,
                ...createBrutalShadow(2, Colors.border),
                transform: [{ rotate: '-1deg' }],
              }}
              className="px-2 py-0.5 mb-2 self-start"
            >
              <Text className="text-border font-w-bold uppercase tracking-widest text-[10px]">
                My Library
              </Text>
            </View>
            <Text className="text-border text-3xl font-w-extrabold tracking-tight uppercase">
              History
            </Text>
          </View>

          <TouchableOpacity
            className="w-12 h-12 items-center justify-center bg-surface mr-1"
            style={{
              borderWidth: 3,
              borderColor: Colors.border,
              borderRadius: 8,
              ...createBrutalShadow(3, Colors.border),
            }}
          >
            <Search size={24} color={Colors.border} strokeWidth={3} />
          </TouchableOpacity>
        </View>

        {/* Tab Navigation */}
        <View className="flex-row gap-3 mb-6 w-full pr-1">
          <BrutalButton
            onPress={() => setActiveTab('all')}
            isActive={activeTab === 'all'}
            shadowOffset={3}
            className="flex-1"
            contentContainerStyle={{ paddingVertical: 12 }}
          >
            <Text
              className={`text-xs font-w-extrabold uppercase tracking-wide ${activeTab === 'all' ? 'text-border' : 'text-text-muted'
                }`}
            >
              All Learned Words
            </Text>
            {activeTab === 'all' && allWords.length > 0 && (
              <View
                className="absolute -top-2 -right-2 bg-white border-2 border-ink w-6 h-6 flex items-center justify-center rounded-full z-10"
                style={{ borderColor: Colors.border }}
              >
                <Text className="text-[10px] font-w-extrabold">{allWords.length}</Text>
              </View>
            )}
          </BrutalButton>

          <BrutalButton
            onPress={() => setActiveTab('favorites')}
            isActive={activeTab === 'favorites'}
            shadowOffset={3}
            className="flex-1"
            contentContainerStyle={{ paddingVertical: 12 }}
          >
            <Text
              className={`text-xs font-w-extrabold uppercase tracking-wide ${activeTab === 'favorites' ? 'text-border' : 'text-text-muted'
                }`}
            >
              Favorite Words
            </Text>
          </BrutalButton>
        </View>

        {/* Word List */}
        <FlatList
          data={displayWords}
          keyExtractor={(item) => item.id}
          scrollEnabled={false}
          contentContainerStyle={{ paddingBottom: 20 }}
          className="w-full pr-1"
          ListEmptyComponent={
            <View className="flex-1 justify-center items-center py-12">
              <Text
                className="text-text-muted text-center text-base font-medium"
              >
                {activeTab === 'favorites'
                  ? 'Нет избранных слов'
                  : 'Нет слов в истории'}
              </Text>
            </View>
          }
          renderItem={({ item }) => {
            const translation = item.translations[translationLanguage];
            const hasArticle = !!item.article;

            // Определяем цвет полоски: если есть артикль - цвет артикля, если нет - цвет части речи (или primary если не определено)
            let stripColor = Colors.primary;
            if (hasArticle && item.article && ARTICLE_COLORS[item.article as NonNullable<Article>]) {
              stripColor = ARTICLE_COLORS[item.article as NonNullable<Article>].bg;
            } else if (item.part_of_speech && PART_OF_SPEECH_COLORS[item.part_of_speech as PartOfSpeech]) {
              stripColor = PART_OF_SPEECH_COLORS[item.part_of_speech as PartOfSpeech].bg;
            }

            const displayWord = item.part_of_speech === 'noun'
              ? item.word_de
              : item.word_de.toLowerCase();

            return (

              <TouchableOpacity
                onPress={() => router.push(`/word/${item.id}`)}
                activeOpacity={0.8}
                className="bg-surface mb-4 flex-row"
                style={{
                  borderWidth: 2,
                  borderColor: Colors.border,
                  borderRadius: 8,
                  ...createBrutalShadow(4, Colors.border),
                  ...createOverflowStyle(),
                }}
              >
                {/* Side Strip */}
                <View
                  style={{
                    width: 12,
                    backgroundColor: stripColor,
                    borderRightWidth: 3,
                    borderRightColor: Colors.border,
                    borderTopLeftRadius: 7,
                    borderBottomLeftRadius: 7,
                  }}
                />

                <View className="flex-1 p-4 flex-row items-center justify-between">
                  <View className="flex-1 mr-2">
                    <View className="flex-row items-center gap-2 mb-1">
                      <View
                        className="px-1.5 py-0.5"
                        style={{
                          backgroundColor: stripColor,
                          borderWidth: 1,
                          borderColor: Colors.border,
                          borderRadius: 2
                        }}
                      >
                        <Text className="text-[10px] font-w-extrabold uppercase text-border">
                          {item.article || item.part_of_speech}
                        </Text>
                      </View>
                      <Text className="text-text-main text-xl font-w-extrabold">
                        {hasArticle ? displayWord : displayWord}
                      </Text>

                    </View>
                    <Text className="text-text-muted text-base font-w-medium italic">
                      {translation.main}
                    </Text>
                  </View>

                  <View
                    className="w-10 h-10 rounded-full items-center justify-center bg-background"
                    style={{
                      borderWidth: 2,
                      borderColor: Colors.border,
                    }}
                  >
                    <ArrowRight size={20} color={Colors.border} strokeWidth={2.5} />
                  </View>
                </View>
              </TouchableOpacity>

            );
          }}
        />
        <View className="mt-8 mb-4 flex-row justify-center">
          <View
            className="px-3 py-1 border border-dashed border-gray-400"
            style={{ backgroundColor: Colors.surface }}
          >
            <Text className="text-[10px] font-w-bold text-gray-500 uppercase tracking-widest text-center">
              End of list
            </Text>
          </View>
        </View>
      </ScrollView>
    </ScreenLayout>
  );
}
