import { BrutalButton } from '@/components/ui/brutal-button';
import { ScreenLayout } from '@/components/ui/screen-layout';
import { Colors } from '@/constants/design-tokens';
import { getWordContent, t } from '@/lib/i18n-helpers';
import { getWordById } from '@/lib/mock-data';
import { useSettingsStore } from '@/store/settings-store';
import { useWordStore } from '@/store/word-store';
import { ARTICLE_COLORS, PART_OF_SPEECH_COLORS } from '@/types/word';
import { createBrutalShadow } from '@/utils/platform-styles';
import { useLocalSearchParams, useRouter } from 'expo-router';
import { ArrowLeft, Heart, Share2, Volume2 } from 'lucide-react-native';
import { ScrollView, Share, Text, TouchableOpacity, View } from 'react-native';
import Animated from 'react-native-reanimated';

export default function WordDetailPage() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const router = useRouter();
  const { translationLanguage } = useSettingsStore();
  const { toggleFavorite, isFavorite } = useWordStore();

  const word = getWordById(id as string);

  const handleBack = () => {
    if (router.canGoBack()) {
      router.back();
    } else {
      router.replace('/history');
    }
  };

  if (!word) {
    return (
      <ScreenLayout>
        <div className="flex-1 justify-center items-center bg-background p-6">
          <Text className="text-text-main font-w-semibold text-lg mb-6">
            {t('common.notFound', translationLanguage)}
          </Text>
          <TouchableOpacity
            onPress={handleBack}
            className="flex-row items-center px-6 py-3"
            style={{
              backgroundColor: Colors.surface,
              borderWidth: 3,
              borderColor: Colors.border,
              borderRadius: 8,
              ...createBrutalShadow(3, Colors.border),
            }}
          >
            <ArrowLeft size={20} color={Colors.border} strokeWidth={3} className="mr-2" />
            <Text className="text-border font-w-extrabold uppercase text-sm">
              {t('history.back', translationLanguage)}
            </Text>
          </TouchableOpacity>
        </div>
      </ScreenLayout>
    );
  }

  const hasArticle = !!word.article;
  const articleColors = hasArticle ? ARTICLE_COLORS[word.article!] : null;
  const content = getWordContent(word, translationLanguage);

  const displayWord = word.part_of_speech === 'noun'
    ? word.word_de
    : word.word_de.toLowerCase();

  const publishDate = new Date(); // Текущий день
  const day = publishDate.getDate();
  const locale = translationLanguage === 'en' ? 'en-US' :
    translationLanguage === 'uk' ? 'uk-UA' :
      translationLanguage === 'de' ? 'de-DE' : 'ru-RU';

  const month = publishDate.toLocaleString(locale, { month: 'short' }).toUpperCase().replace('.', '');
  const dateString = `${day}. ${month}`;

  const onShare = async () => {
    try {
      const shareTemplate = t('home.shareMessage', translationLanguage);
      const message = shareTemplate
        .replace('{word}', displayWord)
        .replace('{translation}', content.translation);

      await Share.share({
        message: `${message} 🚀 Vocade`,
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
        {/* Header with Back button and Date */}
        <View className="flex-row items-end justify-between pt-8 pb-10 w-full" style={{ maxWidth: 400 }}>
          <BrutalButton
            onPress={handleBack}
            style={{ width: 48, height: 48, marginRight: 4 }}
            contentContainerStyle={{ height: '100%' }}
          >
            <ArrowLeft size={24} color={Colors.border} strokeWidth={3} />
          </BrutalButton>

          <View className="flex-col items-end">
            <View
              style={{
                backgroundColor: Colors.accentYellow,
                borderWidth: 2,
                borderColor: Colors.border,
                ...createBrutalShadow(2, Colors.border),
                transform: [{ rotate: '-2deg' }],
              }}
              className="px-2 py-0.5 mb-2 self-end"
            >
              <Text className="text-border font-w-bold uppercase tracking-widest text-[10px]">
                {t('history.datum', translationLanguage)}
              </Text>
            </View>
            <Text className="text-border text-2xl font-w-extrabold tracking-tight uppercase">
              {dateString}
            </Text>
          </View>
        </View>

        <Animated.View>


          <View
            className='bg-surface rounded-card p-5 relative mr-2'
            style={{
              borderWidth: 3,
              borderColor: Colors.border,
              ...createBrutalShadow(4, Colors.border),
              maxWidth: 380,
            }}
          >
            {/* Header Row: Share and Favorite */}
            <View className="flex-row justify-between mb-8">
              <BrutalButton
                onPress={() => toggleFavorite(word.id)}
                borderWidth={2}
                style={{ width: 40, height: 40 }}
                contentContainerStyle={{ height: '100%' }}
              >
                <Heart
                  size={20}
                  color={Colors.border}
                  fill={isFavorite(word.id) ? Colors.border : 'transparent'}
                  strokeWidth={2.5}
                />
              </BrutalButton>

              <BrutalButton
                onPress={onShare}
                contentContainerStyle={{ paddingHorizontal: 16, paddingVertical: 8 }}
                pressableStyle={{ flexDirection: 'row' }}
              >
                <Share2 size={18} color={Colors.border} strokeWidth={3} style={{ marginRight: 8 }} />
                <Text className="text-border font-w-extrabold uppercase text-xs">
                  {t('home.share', translationLanguage)}
                </Text>
              </BrutalButton>
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
              <BrutalButton
                borderWidth={2}
                borderRadius={12}
                backgroundColor={Colors.accentYellow}
                style={{ width: 48, height: 48 }}
                contentContainerStyle={{ height: '100%' }}
              >
                <Volume2 size={24} color={Colors.border} strokeWidth={2.5} />
              </BrutalButton>
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
                    {word.article}
                  </Text>
                </View>
              )}
              <View
                className="bg-gray-200 px-2 py-0.5"
                style={{
                  borderWidth: 2,
                  borderColor: Colors.border,
                }}
              >
                <Text className="text-xs font-w-bold text-text-main">
                  {word.transcription_de}
                </Text>
              </View>
              <View
                className="px-3 py-1"
                style={{
                  backgroundColor: PART_OF_SPEECH_COLORS[word.part_of_speech as keyof typeof PART_OF_SPEECH_COLORS]?.bg || Colors.surface,
                  borderWidth: 2,
                  borderColor: Colors.border,
                }}
              >
                <Text className="text-xs font-w-bold text-border uppercase">
                  {word.part_of_speech}
                </Text>
              </View>
            </View>

            {/* Translation */}
            <View className="mb-6 pl-4 border-l-4 border-accent-pink">
              <Text className="text-xl text-text-muted font-w-bold italic">
                {content.translation}
              </Text>
            </View>

            <View className="h-0.5 w-full bg-border mb-6" />

            {/* Example Section */}
            <View
              className="p-5 my-6 relative bg-purple-50"
              style={{
                borderWidth: 2,
                borderColor: Colors.border,
              }}
            >
              <View
                className="bg-white absolute -top-4 left-4 px-3 py-1 flex-row items-center"
                style={{
                  borderWidth: 2,
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
                  {t('home.beispiel', translationLanguage)}
                </Text>
              </View>

              <Text className="text-lg text-text-main font-w-bold leading-7 mt-2">
                {content.exampleSentence.de}
              </Text>

              <View
                className="mt-4 pl-3"
                style={{
                  borderLeftWidth: 3,
                  borderLeftColor: Colors.border,
                }}
              >
                <Text className="text-sm text-text-muted font-w-medium italic">
                  {content.exampleSentence.translation}
                </Text>
              </View>
            </View>

            {/* Etymology Section */}
            <View className="pb-6">
              <View
                className="bg-green-50 p-5 mt-4 relative"
                style={{
                  borderWidth: 2,
                  borderColor: Colors.border,
                }}
              >
                <View
                  className="bg-white absolute -top-4 left-4 px-3 py-1 flex-row items-center"
                  style={{
                    borderWidth: 2,
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
                    {t('home.etymologie', translationLanguage)}
                  </Text>
                </View>

                <Text className="text-sm text-text-main font-w-medium leading-relaxed mt-2">
                  {content.etymology.text || t('common.notFound', translationLanguage)}
                </Text>

                {content.etymology.rootWord && (
                  <View className="mt-4 flex-row items-center">
                    <Text className="text-xs text-text-muted font-w-bold uppercase tracking-wider mr-2">
                      {t('home.root', translationLanguage)}:
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
        </Animated.View>
      </ScrollView>
    </ScreenLayout>
  );
}
