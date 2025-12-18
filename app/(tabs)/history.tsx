/**
 * History Screen
 * Shows all words and favorites with nested tabs
 */

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
    <View className="flex-1 bg-background">
      {/* Header */}
      <View className="pt-12 pb-4 px-6 bg-surface">
        <Text className="text-primary text-3xl font-extrabold mb-2" 
              style={{ fontFamily: 'Rubik_800ExtraBold' }}>
          История
        </Text>
        <Text className="text-text-muted text-sm" 
              style={{ fontFamily: 'Rubik_400Regular' }}>
          Все изученные слова
        </Text>
      </View>

      {/* Tab Navigation */}
      <View className="flex-row bg-surface border-b border-gray-200">
        <TouchableOpacity
          onPress={() => setActiveTab('all')}
          className="flex-1 py-4 items-center"
          style={{
            borderBottomWidth: activeTab === 'all' ? 2 : 0,
            borderBottomColor: '#8B5CF6',
          }}>
          <Text 
            className="font-bold text-sm"
            style={{ 
              fontFamily: 'Rubik_600SemiBold',
              color: activeTab === 'all' ? '#8B5CF6' : '#6B7280'
            }}>
            Все слова ({allWords.length})
          </Text>
        </TouchableOpacity>

        <TouchableOpacity
          onPress={() => setActiveTab('favorites')}
          className="flex-1 py-4 items-center"
          style={{
            borderBottomWidth: activeTab === 'favorites' ? 2 : 0,
            borderBottomColor: '#8B5CF6',
          }}>
          <Text 
            className="font-bold text-sm"
            style={{ 
              fontFamily: 'Rubik_600SemiBold',
              color: activeTab === 'favorites' ? '#8B5CF6' : '#6B7280'
            }}>
            Избранное ({getFavoriteWords().length})
          </Text>
        </TouchableOpacity>
      </View>

      {/* Word List */}
      <FlatList
        data={displayWords}
        keyExtractor={(item) => item.id}
        contentContainerStyle={{ padding: 16 }}
        ListEmptyComponent={
          <View className="flex-1 justify-center items-center py-12">
            <Text className="text-text-muted text-center text-base" 
                  style={{ fontFamily: 'Rubik_500Medium' }}>
              {activeTab === 'favorites' 
                ? 'Нет избранных слов' 
                : 'Нет слов в истории'}
            </Text>
          </View>
        }
        renderItem={({ item }) => {
          const translation = item.translations[translationLanguage];
          
          return (
            <TouchableOpacity
              onPress={() => router.push(`/word/${item.id}`)}
              activeOpacity={0.7}
              className="bg-surface mb-3 p-4 rounded-xl shadow-sm flex-row items-center justify-between">
              
              <View className="flex-1">
                <Text className="text-primary text-xl font-bold mb-1" 
                      style={{ fontFamily: 'Rubik_700Bold' }}>
                  {item.article} {item.word_de}
                </Text>
                <Text className="text-text-muted text-sm" 
                      style={{ fontFamily: 'Rubik_400Regular' }}>
                  {translation.main}
                </Text>
              </View>

              <Text className="text-text-muted text-2xl">→</Text>
            </TouchableOpacity>
          );
        }}
      />
    </View>
  );
}
