import { BrutalButton } from '@/components/ui/brutal-button';
import { BrutalTag } from '@/components/ui/brutal-tag';
import { ContentContainer } from '@/components/ui/content-container';
import { ScreenHeader } from '@/components/ui/screen-header';
import { ScreenLayout } from '@/components/ui/screen-layout';
import { Border, Colors, borderRadius } from '@/constants/design-tokens';
import { t } from '@/constants/translations';
import { useSettingsStore } from '@/store/settings-store';
import { useWordStore } from '@/store/word-store';
import { ARTICLE_COLORS, Article, PART_OF_SPEECH_COLORS } from '@/types/word';
import { createBrutalShadow } from '@/utils/platform-styles';
import { useRouter } from 'expo-router';
import { ArrowRight, Search } from 'lucide-react-native';
import { useEffect, useState } from 'react';
import { FlatList, Platform, ScrollView, Text, TextInput, View } from 'react-native';
import Animated, { FadeInDown } from 'react-native-reanimated';

type TabType = 'all' | 'favorites';

export default function HistoryScreen() {
  const router = useRouter();
  const { translationLanguage } = useSettingsStore();
  const { loadHistoryWords, historyWords, getFavoriteWords } = useWordStore();
  const [activeTab, setActiveTab] = useState<TabType>('all');

  useEffect(() => {
    loadHistoryWords();
  }, []);

  const displayWords = activeTab === 'all' ? historyWords : getFavoriteWords();

  return (
    <ScreenLayout>
      <ScrollView
        className="flex-1 w-full"
        showsVerticalScrollIndicator={false}
        contentContainerStyle={{
          paddingBottom: 160,
          alignItems: 'center'
        }}
      >
        <ScreenHeader
          title={t('tabs.history', translationLanguage)}
          badgeText={t('history.library', translationLanguage)}
          badgeColor={Colors.accentPink}
          titleAlign="left"
        />

        <ContentContainer className="mb-8">
          <View
            style={{
              flexDirection: 'row',
              alignItems: 'center',
              backgroundColor: Colors.surface,
              borderWidth: Border.primary,
              borderColor: Colors.border,
              borderRadius: borderRadius.SMALL,
              paddingHorizontal: 16,
              height: 56,
              ...createBrutalShadow(2, Colors.border),
            }}
          >
            <Search size={22} color={Colors.border} strokeWidth={3} style={{ marginRight: 12 }} />
            <TextInput
              placeholder={t('history.search', translationLanguage).toUpperCase()}
              placeholderTextColor={Colors.textMuted}
              className="flex-1 text-border font-w-bold text-base"
              style={[
                { paddingVertical: 0 },
                Platform.OS === 'web' && ({ outlineStyle: 'none' } as any),
              ]}
            />
          </View>
        </ContentContainer>

        <ContentContainer className="flex-row gap-3 mb-6">
          <BrutalButton
            onPress={() => setActiveTab('all')}
            isActive={activeTab === 'all'}
            className="flex-1"
            contentContainerStyle={{ paddingVertical: 12, width: '100%' }}
            pressableStyle={{ width: '100%' }}
            borderRadius={borderRadius.SMALL}
          >
            <Text
              className={`text-xs font-w-bold uppercase tracking-wide ${activeTab === 'all' ? 'text-border' : 'text-text-muted'
                }`}
            >
              {t('history.all', translationLanguage)}
            </Text>
            <View
              className="absolute -top-[6px] -right-[-6px] bg-white border-2 border-border h-7 min-w-[28px] items-center justify-center rounded-full z-10 px-1"
              style={{ borderColor: Colors.border }}
            >
              <Text className="text-[11px] font-w-bold">{historyWords.length}</Text>
            </View>
          </BrutalButton>

          <BrutalButton
            onPress={() => setActiveTab('favorites')}
            isActive={activeTab === 'favorites'}
            className="flex-1"
            contentContainerStyle={{ paddingVertical: 12, width: '100%' }}
            pressableStyle={{ width: '100%' }}
            borderRadius={borderRadius.SMALL}
          >
            <Text
              className={`text-xs font-w-bold uppercase tracking-wide ${activeTab === 'favorites' ? 'text-border' : 'text-text-muted'
                }`}
            >
              {t('history.favorites', translationLanguage)}
            </Text>
          </BrutalButton>
        </ContentContainer>

        <ContentContainer>
          <Animated.View
            key={activeTab}
            entering={FadeInDown.duration(300).springify().damping(100)}
          >
            <FlatList
              data={displayWords}
              keyExtractor={(item) => item.id}
              scrollEnabled={false}
              contentContainerStyle={{ paddingBottom: 20 }}
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
                } else if (item.part_of_speech && (PART_OF_SPEECH_COLORS as any)[item.part_of_speech]) {
                  stripColor = (PART_OF_SPEECH_COLORS as any)[item.part_of_speech].bg;
                }

                const displayWord = item.word_de;

                // Abbreviate "adjective" to "ADJ."
                const rawLabel = item.article || (item.part_of_speech !== 'noun' ? item.part_of_speech : '');
                const displayLabel = rawLabel?.toLowerCase() === 'adjective' ? 'ADJ.' : rawLabel;

                return (
                  <BrutalButton
                    onPress={() => router.push(`/history/${item.id}`)}
                    borderWidth={Border.primary}
                    borderRadius={borderRadius.LARGE}
                    shadowOffset={4}
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
                        borderRightWidth: Border.secondary,
                        borderRightColor: Colors.border,
                      }}
                    />

                    <View className="flex-1 p-4 flex-row items-center justify-between">
                      <View className="flex-1 mr-2">
                        <View className="flex-row items-center mb-1">
                          <BrutalTag
                            text={displayLabel || ''}
                            backgroundColor={stripColor}
                            textColor={Colors.border}
                            borderWidth={Border.secondary}
                            borderRadius={borderRadius.SMALL}
                            shadowOffset={0}
                            style={{ width: 60, marginRight: 12 }}
                            paddingHorizontal={4}
                            paddingVertical={4}
                            textClassName="text-[10px] text-center"
                          />
                          <Text className="text-text-main text-xl font-w-bold">
                            {displayWord}
                          </Text>
                        </View>
                        <Text className="text-text-main text-base font-w-medium opacity-80">
                          {translation.main}
                        </Text>
                      </View>

                      <View
                        className="w-10 h-10 items-center justify-center bg-background"
                        style={{
                          borderWidth: Border.secondary,
                          borderColor: Colors.border,
                          borderRadius: borderRadius.ROUND,
                        }}
                      >
                        <ArrowRight size={20} color={Colors.border} strokeWidth={2.5} />
                      </View>
                    </View>
                  </BrutalButton>
                );
              }}
            />
          </Animated.View>
        </ContentContainer>

        <ContentContainer className="flex-row justify-center">
          <View
            className="px-3 py-1 border border-dashed border-gray-400"
            style={{ backgroundColor: Colors.surface }}
          >
            <Text className="text-[10px] font-w-bold text-gray-500 uppercase tracking-widest text-center">
              {t('history.endOfList', translationLanguage)}
            </Text>
          </View>
        </ContentContainer>
      </ScrollView>
    </ScreenLayout>
  );
}
