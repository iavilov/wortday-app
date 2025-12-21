/**
 * History Screen
 * Shows all words and favorites with nested tabs
 */

import { ScreenLayout } from '@/components/ui/screen-layout';
import { Colors } from '@/constants/design-tokens';
import { useSettingsStore } from '@/store/settings-store';
import { useWordStore } from '@/store/word-store';
import { useRouter } from 'expo-router';
import { useEffect, useState } from 'react';
import { FlatList, Text, TouchableOpacity, View } from 'react-native';

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
    <ScreenLayout className="bg-background" withBottomPadding>
      {/* Header */}
      <View className="pt-8 pb-4 bg-background">
        <Text
          className="text-primary text-3xl font-extrabold mb-1"
          style={{ fontFamily: 'Rubik_800ExtraBold' }}
        >
          История
        </Text>
        <Text
          className="text-text-muted text-sm"
          style={{ fontFamily: 'Rubik_400Regular' }}
        >
          Все изученные слова
        </Text>
      </View>

      {/* Tab Navigation */}
      <View
        className="flex-row bg-surface rounded-lg p-1.5 mb-6"
        style={{
          marginHorizontal: 4,
          borderWidth: 2,
          borderColor: Colors.border,
        }}
      >
        <TouchableOpacity
          onPress={() => setActiveTab('all')}
          className={`flex-1 py-3 items-center rounded-lg transition-all ${activeTab === 'all' ? 'bg-primary' : 'bg-transparent'
            }`}
          style={activeTab === 'all' ? {
            borderWidth: 2,
            borderColor: Colors.border,
          } : {}}
        >
          <Text
            className={`font-bold text-sm uppercase ${activeTab === 'all' ? 'text-border' : 'text-text-muted'
              }`}
            style={{ fontFamily: 'Rubik_700Bold' }}
          >
            Все слова
          </Text>
        </TouchableOpacity>

        <TouchableOpacity
          onPress={() => setActiveTab('favorites')}
          className={`flex-1 py-3 items-center rounded-lg transition-all ${activeTab === 'favorites' ? 'bg-primary' : 'bg-transparent'
            }`}
          style={activeTab === 'favorites' ? {
            borderWidth: 2,
            borderColor: Colors.border,
          } : {}}
        >
          <Text
            className={`font-bold text-sm uppercase ${activeTab === 'favorites' ? 'text-border' : 'text-text-muted'
              }`}
            style={{ fontFamily: 'Rubik_700Bold' }}
          >
            Избранное
          </Text>
        </TouchableOpacity>
      </View>

      {/* Word List */}
      <FlatList
        data={displayWords}
        keyExtractor={(item) => item.id}
        contentContainerStyle={{ flexGrow: 1, paddingBottom: 20, paddingHorizontal: 4 }}
        showsVerticalScrollIndicator={false}
        ListEmptyComponent={
          <View className="flex-1 justify-center items-center py-12">
            <Text
              className="text-text-muted text-center text-base"
              style={{ fontFamily: 'Rubik_500Medium' }}
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
          const articleColors = hasArticle ? Colors.articleColors[item.article!] : null;

          const displayWord = item.part_of_speech === 'noun'
            ? item.word_de
            : item.word_de.toLowerCase();

          return (
            <TouchableOpacity
              onPress={() => router.push(`/word/${item.id}`)}
              activeOpacity={0.8}
              className="bg-surface mb-3 p-5 rounded-card flex-row items-center justify-between"
              style={{
                borderWidth: 3,
                borderColor: Colors.border,
              }}
            >
              <View className="flex-1">
                <Text
                  className="text-text-main text-lg font-bold mb-1"
                  style={{ fontFamily: 'Rubik_700Bold' }}
                >
                  {hasArticle && articleColors && (
                    <Text style={{ color: articleColors.text }}>
                      {item.article}{' '}
                    </Text>
                  )}
                  {displayWord}
                </Text>
                <Text
                  className="text-text-muted text-sm"
                  style={{ fontFamily: 'Rubik_400Regular' }}
                >
                  {translation.main}
                </Text>
              </View>

              <View
                className="w-10 h-10 bg-primary rounded-lg items-center justify-center"
                style={{
                  borderWidth: 2,
                  borderColor: Colors.border,
                }}
              >
                <Text className="text-border text-lg font-bold">→</Text>
              </View>
            </TouchableOpacity>
          );
        }}
      />
    </ScreenLayout>
  );
}
