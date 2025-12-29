import { BrutalButton } from '@/components/ui/brutal-button';
import { ScreenLayout } from '@/components/ui/screen-layout';
import { Colors } from '@/constants/design-tokens';
import { t } from '@/constants/translations';
import { useSettingsStore } from '@/store/settings-store';
import { useWordStore } from '@/store/word-store';
import { ARTICLE_COLORS, Article, PART_OF_SPEECH_COLORS, PartOfSpeech } from '@/types/word';
import { createBrutalShadow } from '@/utils/platform-styles';
import { useRouter } from 'expo-router';
import { ArrowRight, Search } from 'lucide-react-native';
import { useEffect, useState } from 'react';
import { FlatList, Platform, ScrollView, Text, TextInput, View } from 'react-native';

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
        <View className="flex-row items-center justify-between pt-8 pb-6 w-full">
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
                {t('history.library', translationLanguage)}
              </Text>
            </View>
            <Text className="text-border text-3xl font-w-extrabold tracking-tight uppercase">
              {t('tabs.history', translationLanguage)}
            </Text>
          </View>
        </View>

        <View className="w-full mb-8 pr-1">
          <View
            style={{
              flexDirection: 'row',
              alignItems: 'center',
              backgroundColor: Colors.surface,
              borderWidth: 3,
              borderColor: Colors.border,
              borderRadius: 12,
              paddingHorizontal: 16,
              height: 56,
            }}
          >
            <Search size={22} color={Colors.border} strokeWidth={3} style={{ marginRight: 12 }} />
            <TextInput
              placeholder={t('history.search', translationLanguage).toUpperCase()}
              placeholderTextColor={Colors.textMuted}
              className="flex-1 text-border font-w-extrabold text-base"
              style={[
                { paddingVertical: 0 },
                Platform.OS === 'web' && ({ outlineStyle: 'none' } as any),
              ]}
            />
          </View>
        </View>

        <View className="flex-row gap-3 mb-6 w-full pr-1">
          <BrutalButton
            onPress={() => setActiveTab('all')}
            isActive={activeTab === 'all'}
            className="flex-1"
            contentContainerStyle={{ paddingVertical: 12, width: '100%' }}
            pressableStyle={{ width: '100%' }}
          >
            <Text
              className={`text-xs font-w-extrabold uppercase tracking-wide ${activeTab === 'all' ? 'text-border' : 'text-text-muted'
                }`}
            >
              {t('history.all', translationLanguage)}
            </Text>
            <View
              className="absolute -top-[4px] right-[3px] bg-white border-2 border-ink w-6 h-6 flex items-center justify-center rounded-full z-10"
              style={{ borderColor: Colors.border }}
            >
              <Text className="text-[10px] font-w-extrabold">{allWords.length}</Text>
            </View>
          </BrutalButton>

          <BrutalButton
            onPress={() => setActiveTab('favorites')}
            isActive={activeTab === 'favorites'}
            className="flex-1"
            contentContainerStyle={{ paddingVertical: 12, width: '100%' }}
            pressableStyle={{ width: '100%' }}
          >
            <Text
              className={`text-xs font-w-extrabold uppercase tracking-wide ${activeTab === 'favorites' ? 'text-border' : 'text-text-muted'
                }`}
            >
              {t('history.favorites', translationLanguage)}
            </Text>
          </BrutalButton>
        </View>

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
                  ? t('history.noFavorites', translationLanguage)
                  : t('history.noHistory', translationLanguage)}
              </Text>
            </View>
          }
          renderItem={({ item }) => {
            const translation = item.translations[translationLanguage];
            const hasArticle = !!item.article;

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
              <BrutalButton
                onPress={() => router.push(`/history/${item.id}`)}
                borderWidth={2}
                style={{ marginBottom: 16, width: '100%' }}
                contentContainerStyle={{ width: '100%' }}
                pressableStyle={{
                  flexDirection: 'row',
                  alignItems: 'stretch',
                  width: '100%',
                }}
              >
                <View
                  style={{
                    width: 12,
                    backgroundColor: stripColor,
                    borderRightWidth: 3,
                    borderRightColor: Colors.border,
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
                        {displayWord}
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
              </BrutalButton>
            );
          }}
        />
        <View className="flex-row justify-center">
          <View
            className="px-3 py-1 border border-dashed border-gray-400"
            style={{ backgroundColor: Colors.surface }}
          >
            <Text className="text-[10px] font-w-bold text-gray-500 uppercase tracking-widest text-center">
              {t('history.endOfList', translationLanguage)}
            </Text>
          </View>
        </View>
      </ScrollView>
    </ScreenLayout>
  );
}
