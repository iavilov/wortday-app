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
import { FlatList, Platform, Text, TouchableOpacity, View } from 'react-native';

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
      <View className="flex-row bg-surface rounded-xl p-1 mb-4 shadow-sm border border-gray-100">
        <TouchableOpacity
          onPress={() => setActiveTab('all')}
          className={`flex-1 py-2 items-center rounded-lg transition-all ${activeTab === 'all' ? 'bg-primary' : 'bg-transparent'
            }`}
        >
          <Text
            className={`font-bold text-sm ${activeTab === 'all' ? 'text-white' : 'text-text-muted'
              }`}
            style={{ fontFamily: 'Rubik_600SemiBold' }}
          >
            Все слова
          </Text>
        </TouchableOpacity>

        <TouchableOpacity
          onPress={() => setActiveTab('favorites')}
          className={`flex-1 py-2 items-center rounded-lg transition-all ${activeTab === 'favorites' ? 'bg-primary' : 'bg-transparent'
            }`}
        >
          <Text
            className={`font-bold text-sm ${activeTab === 'favorites' ? 'text-white' : 'text-text-muted'
              }`}
            style={{ fontFamily: 'Rubik_600SemiBold' }}
          >
            Избранное
          </Text>
        </TouchableOpacity>
      </View>

      {/* Word List */}
      <FlatList
        data={displayWords}
        keyExtractor={(item) => item.id}
        contentContainerStyle={{ flexGrow: 1, paddingBottom: 20 }}
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
              activeOpacity={0.7}
              className="bg-surface mb-3 p-4 rounded-2xl flex-row items-center justify-between border border-gray-100"
              style={Platform.select({
                ios: {
                  shadowColor: '#000',
                  shadowOffset: { width: 0, height: 2 },
                  shadowOpacity: 0.05,
                  shadowRadius: 8,
                },
                android: {
                  elevation: 2,
                },
                web: {
                  boxShadow: '0 4px 12px rgba(0,0,0,0.05)',
                }
              })}
            >
              <View className="flex-1">
                <Text
                  className="text-primary text-lg font-bold mb-1"
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

              <View className="w-8 h-8 bg-gray-50 rounded-full items-center justify-center">
                <Text className="text-gray-300 text-sm">→</Text>
              </View>
            </TouchableOpacity>
          );
        }}
      />
    </ScreenLayout>
  );
}
