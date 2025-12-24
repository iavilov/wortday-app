import { ScreenLayout } from '@/components/ui/screen-layout';
import { Colors } from '@/constants/design-tokens';
import { getWordContent } from '@/lib/i18n-helpers';
import { useSettingsStore } from '@/store/settings-store';
import { useWordStore } from '@/store/word-store';
import { ARTICLE_COLORS, PART_OF_SPEECH_COLORS } from '@/types/word';
import { createBrutalShadow } from '@/utils/platform-styles';
import { Heart, Share2, Volume2 } from 'lucide-react-native';
import { useEffect } from 'react';
import { ActivityIndicator, ScrollView, Share, Text, TouchableOpacity, View } from 'react-native';
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
        <ActivityIndicator size="large" color={Colors.primary} />
        <Text className="text-text-muted mt-4 font-w-medium">
          Загрузка...
        </Text>
      </View>
    );
  }

  if (!todayWord) {
    return (
      <View className="flex-1 justify-center items-center bg-background p-6">
        <Text className="text-text-main font-w-semibold text-lg">
          Слово дня не найдено
        </Text>
      </View>
    );
  }

  const hasArticle = !!todayWord.article;
  const articleColors = hasArticle ? ARTICLE_COLORS[todayWord.article!] : null;
  const content = getWordContent(todayWord, translationLanguage);

  const displayWord = todayWord.part_of_speech === 'noun'
    ? todayWord.word_de
    : todayWord.word_de.toLowerCase();

  const publishDate = todayWord.publish_date ? new Date(todayWord.publish_date) : new Date();
  const day = publishDate.getDate();
  const month = publishDate.toLocaleString('de-DE', { month: 'short' }).toUpperCase().replace('.', '');
  const dateString = `${day}. ${month}`;

  const onShare = async () => {
    try {
      await Share.share({
        message: `Wort des Tages: ${displayWord} - ${content.translation.main}. Lerne Deutsch mit Vocade!`,
      });
    } catch (error) {
      console.error(error);
    }
  };

  return (
    <ScreenLayout>
      <ScrollView
        className="flex-1 w-full"
        showsVerticalScrollIndicator={false}
        contentContainerStyle={{
          paddingBottom: 80,
          alignItems: 'center'
        }}
      >
        <View className="flex-row items-center justify-between pt-8 pb-10 w-full max-w-sm">
          <View className="flex-col">
            <View
              style={{
                backgroundColor: Colors.accentYellow,
                borderWidth: 2,
                borderColor: Colors.border,
                ...createBrutalShadow(2, Colors.border),
                transform: [{ rotate: '-2deg' }],
              }}
              className="px-2 py-0.5 mb-2 self-start"
            >
              <Text className="text-border font-w-bold uppercase tracking-widest text-[10px]">
                Heute
              </Text>
            </View>
            <Text className="text-border text-2xl font-w-extrabold tracking-tight uppercase">
              {dateString}
            </Text>
          </View>

          <TouchableOpacity
            onPress={onShare}
            className="flex-row items-center px-4 py-2 mr-1"
            style={{
              backgroundColor: Colors.surface,
              borderWidth: 3,
              borderColor: Colors.border,
              borderRadius: 8,
              ...createBrutalShadow(3, Colors.border),
            }}
          >
            <Share2 size={18} color={Colors.border} strokeWidth={3} className="mr-2" />
            <Text className="text-border font-w-extrabold uppercase text-xs">
              Share
            </Text>
          </TouchableOpacity>
        </View>

        <Animated.View
          entering={FadeInDown.duration(800).delay(200)}
        >
          {/* Word of the Day Badge */}
          <View
            className="absolute -top-4 right-3 px-3 py-1 z-50"
            style={{
              backgroundColor: Colors.accentPink,
              borderWidth: 2,
              borderColor: Colors.border,
              ...createBrutalShadow(2, Colors.border),
              transform: [{ rotate: '3deg' }],
            }}
          >
            <Text className="text-md font-w-extrabold uppercase text-border">
              Word of the day
            </Text>
          </View>

          <View
            className='bg-surface rounded-card p-5 relative mr-2'
            style={{
              borderWidth: 3,
              borderColor: Colors.border,
              ...createBrutalShadow(4, Colors.border),
            }}
          >

            {/* Favorite Button Row */}
            <View className="flex-row justify-start mb-8">
              <TouchableOpacity
                onPress={() => toggleFavorite(todayWord.id)}
                activeOpacity={0.7}
                className="w-10 h-10 items-center justify-center"
                style={{
                  backgroundColor: Colors.surface,
                  borderWidth: 2,
                  borderColor: Colors.border,
                  borderRadius: 8,
                  ...createBrutalShadow(3, Colors.border),
                }}
              >
                <Heart
                  size={20}
                  color={Colors.border}
                  fill={isFavorite(todayWord.id) ? Colors.border : 'transparent'}
                  strokeWidth={2.5}
                />
              </TouchableOpacity>
            </View>

            {/* Word + Audio Row */}
            <View className="flex-row items-center mb-3">
              <Text
                className="text-5xl font-w-extrabold text-text-main flex-1 mr-3"
                numberOfLines={2}
                adjustsFontSizeToFit
              >
                {displayWord}
              </Text>
              <TouchableOpacity
                className="w-12 h-12 items-center justify-center"
                style={{
                  backgroundColor: Colors.accentYellow,
                  borderWidth: 2,
                  borderColor: Colors.border,
                  borderRadius: 8,
                  ...createBrutalShadow(3, Colors.border),
                }}
              >
                <Volume2 size={24} color={Colors.border} strokeWidth={2.5} />
              </TouchableOpacity>
            </View>

            {/* Transcription & Part of Speech Row */}
            <View className="flex-row items-center flex-wrap gap-2 mb-5">
              {hasArticle && articleColors && (
                <View
                  className="px-4 py-1 mr-1"
                  style={{
                    backgroundColor: articleColors.bg,
                    borderWidth: 3,
                    borderColor: articleColors.border,
                    ...createBrutalShadow(2, Colors.border),
                  }}>
                  <Text
                    className="font-w-extrabold text-sm uppercase"
                    style={{
                      color: articleColors.text
                    }}>
                    {todayWord.article}
                  </Text>

                </View>
              )}
              <View
                className="bg-gray-200 px-2 py-0.5"
                style={{
                  borderWidth: 1,
                  borderColor: Colors.border,
                }}
              >
                <Text className="text-xs font-w-bold text-text-main">
                  {todayWord.transcription_de}
                </Text>
              </View>
              <View
                className="px-3 py-1"
                style={{
                  backgroundColor: PART_OF_SPEECH_COLORS[todayWord.part_of_speech]?.bg || Colors.surface,
                  borderWidth: 1,
                  borderColor: Colors.border,
                }}
              >
                <Text className="text-xs font-w-bold text-border uppercase">
                  {todayWord.part_of_speech}
                </Text>
              </View>

            </View>

            {/* Translation */}
            <View className="mb-6 pl-4 border-l-4 border-accent-pink">
              <Text className="text-xl text-text-muted font-w-bold italic">
                {content.translation.main}
              </Text>
            </View>

            <View className="h-0.5 w-full bg-border mb-6" />
            <View
              className="p-5 my-6 relative bg-purple-50"
              style={{
                borderWidth: 3,
                borderColor: Colors.border,
                ...createBrutalShadow(4, Colors.border),
              }}
            >
              {/* Badge Label */}
              <View
                className="bg-white absolute -top-4 left-4 px-3 py-1 flex-row items-center"
                style={{
                  borderWidth: 3,
                  borderColor: Colors.border,
                }}
              >
                <View
                  className="mr-2"
                  style={{
                    width: 8,
                    height: 8,
                    backgroundColor: Colors.accentYellow,
                    borderWidth: 1.5,
                    borderColor: Colors.border,
                  }}
                />
                <Text
                  className="text-[10px] font-w-extrabold text-text-main uppercase tracking-widest"
                >
                  Beispiel
                </Text>
              </View>

              {/* German Sentence */}
              <Text
                className="text-lg text-text-main font-w-bold leading-7 mt-2"
              >
                {content.exampleSentence.de}
              </Text>

              {/* Translation */}
              <View
                className="mt-4 pl-3"
                style={{
                  borderLeftWidth: 3,
                  borderLeftColor: Colors.border,
                }}
              >
                <Text
                  className="text-sm text-text-muted font-w-medium italic"
                >
                  {content.exampleSentence.translation}
                </Text>
              </View>
            </View>


            {/* Etymology */}
            <View className="pb-6">
              <View
                className="bg-green-50 p-5 mt-4 relative"
                style={{
                  borderWidth: 3,
                  borderColor: Colors.border,
                  ...createBrutalShadow(4, Colors.border),
                }}
              >
                {/* Badge Label */}
                <View
                  className="bg-white absolute -top-4 left-4 px-3 py-1 flex-row items-center"
                  style={{
                    borderWidth: 3,
                    borderColor: Colors.border,
                  }}
                >
                  <View
                    className="bg-primary mr-2"
                    style={{
                      width: 8,
                      height: 8,
                      borderWidth: 1.5,
                      borderColor: Colors.border,
                    }}
                  />
                  <Text
                    className="text-[10px] font-w-extrabold text-text-main uppercase tracking-widest"
                  >
                    Etymologie
                  </Text>
                </View>

                {/* Content */}
                <Text
                  className="text-sm text-text-main font-w-medium leading-relaxed mt-2"
                >
                  {content.etymology.text ? content.etymology.text : 'Этимология скоро будет добавлена...'}
                </Text>

                {content.etymology.rootWord && (
                  <View className="mt-4 flex-row items-center">
                    <Text className="text-xs text-text-muted font-w-bold uppercase tracking-wider mr-2">
                      Корень:
                    </Text>
                    <View
                      className="bg-accent-yellow px-2 py-0.5"
                      style={{
                        borderWidth: 2,
                        borderColor: Colors.border,
                      }}
                    >
                      <Text className="text-xs font-w-bold text-text-main">
                        {content.etymology.rootWord}
                      </Text>
                    </View>
                  </View>
                )}
              </View>
            </View>
          </View>
        </Animated.View >
      </ScrollView>
    </ScreenLayout>
  );
}
