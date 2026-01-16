import { BrutalButton } from '@/components/ui/brutal-button';
import { BrutalCard } from '@/components/ui/brutal-card';
import { BrutalTag } from '@/components/ui/brutal-tag';
import { BrutalWordTitle } from '@/components/ui/brutal-word-title';
import { HighlightedText } from '@/components/ui/highlighted-text';
import { Colors, borderRadius } from '@/constants/design-tokens';
import { t } from '@/constants/translations';
import { TranslationLanguage } from '@/lib/i18n-helpers';
import { ARTICLE_COLORS, PART_OF_SPEECH_COLORS, Word } from '@/types/word';
import { Heart, Share2 } from 'lucide-react-native';
import React from 'react';
import { Text, View } from 'react-native';

interface WordCardProps {
    word: Word;
    content: {
        translation: string;
        exampleSentence: {
            de: string;
            translation: string;
        };
        etymology: {
            text: string;
            rootWord?: string;
        };
    };
    translationLanguage: TranslationLanguage;
    isFavorite: boolean;
    onToggleFavorite: () => void;
    onAudioPress: () => void;
    onShare?: () => void;
}

export const WordCard = ({
    word,
    content,
    translationLanguage,
    isFavorite,
    onToggleFavorite,
    onAudioPress,
    onShare,
}: WordCardProps) => {
    const article = word.article;
    const hasArticle = !!article && article !== 'none';
    const articleColors = hasArticle ? ARTICLE_COLORS[article] : null;
    const partOfSpeechColor = PART_OF_SPEECH_COLORS[word.part_of_speech as keyof typeof PART_OF_SPEECH_COLORS];

    return (
        <BrutalCard>
            {/* Header Row: Favorite and optional Share */}
            <View className={`flex-row ${onShare ? 'justify-between' : 'justify-start'} items-center mb-8`}>
                <BrutalButton
                    onPress={onToggleFavorite}
                    borderWidth={2}
                    borderRadius={borderRadius.ROUND}
                    style={{ width: 44, height: 44 }}
                    contentContainerStyle={{ height: '100%' }}
                >
                    <Heart
                        size={22}
                        color={Colors.border}
                        fill={isFavorite ? Colors.border : 'transparent'}
                        strokeWidth={2.5}
                    />
                </BrutalButton>

                {onShare && (
                    <BrutalButton
                        onPress={onShare}
                        contentContainerStyle={{ paddingHorizontal: 16, paddingVertical: 8 }}
                        pressableStyle={{ flexDirection: 'row' }}
                        borderRadius={borderRadius.SMALL}
                        borderWidth={2}
                    >
                        <Share2 size={18} color={Colors.border} strokeWidth={3} style={{ marginRight: 8 }} />
                        <Text className="text-border font-w-bold uppercase text-xs">
                            {t('home.share', translationLanguage)}
                        </Text>
                    </BrutalButton>
                )}
            </View>

            <BrutalWordTitle
                word={word.word_de}
                onAudioPress={onAudioPress}
            />

            <View className="flex-row items-center flex-wrap gap-2 mb-5">
                {hasArticle && articleColors && article && (
                    <BrutalTag
                        text={article}
                        backgroundColor={articleColors.bg}
                        borderColor={articleColors.border}
                        textColor={articleColors.text}
                        borderWidth={2}
                        borderRadius={borderRadius.SMALL}
                        shadowOffset={0}
                        paddingHorizontal={12}
                        paddingVertical={6}
                        textClassName="text-sm"
                        style={{ marginRight: 4 }}
                    />
                )}
                <BrutalTag
                    text={word.transcription_de}
                    backgroundColor={Colors.surface}
                    textColor={Colors.textMain}
                    borderWidth={2}
                    borderRadius={borderRadius.SMALL}
                    shadowOffset={0}
                    paddingHorizontal={14}
                    paddingVertical={8}
                    textClassName="text-md"
                    uppercase={false}
                />
                {word.part_of_speech !== ('noun' as string) && (
                    <BrutalTag
                        text={word.part_of_speech}
                        backgroundColor={partOfSpeechColor?.bg || Colors.surface}
                        textColor={partOfSpeechColor?.text || Colors.border}
                        borderColor={Colors.border}
                        borderWidth={2}
                        borderRadius={borderRadius.SMALL}
                        shadowOffset={1}
                        paddingHorizontal={12}
                        paddingVertical={6}
                        textClassName="text-xs"
                    />
                )}
            </View>

            <View className="mb-6">
                <Text className="text-xl text-text-main font-w-semibold">
                    {content.translation}
                </Text>
            </View>

            <View className="h-0.5 w-full bg-border mb-6" />

            {/* Example Sentence */}
            <View
                className="p-4 my-6 relative"
                style={{
                    borderWidth: 2,
                    borderColor: Colors.border,
                    borderRadius: borderRadius.MEDIUM,
                    backgroundColor: Colors.gray50,
                }}
            >
                <BrutalTag
                    text={t('home.beispiel', translationLanguage)}
                    backgroundColor={Colors.surface}
                    borderWidth={2}
                    borderRadius={borderRadius.SHARP}
                    shadowOffset={1}
                    paddingHorizontal={12}
                    paddingVertical={6}
                    textClassName="text-[11px]"
                    style={{
                        position: 'absolute',
                        top: -18,
                        left: 16,
                    }}
                />

                <HighlightedText
                    text={content.exampleSentence.de}
                    textClassName="text-[16px] text-text-main font-w-medium leading-[22px] mt-3"
                    highlightClassName="text-[16px] font-w-semibold"
                />

                <View className="mt-4">
                    <Text
                        className="text-[14px] text-text-muted font-w-regular opacity-70"
                        style={{ fontStyle: 'italic' }}
                    >
                        {content.exampleSentence.translation}
                    </Text>
                </View>
            </View>

            {/* Etymology */}
            <View className="pb-6">
                <View
                    className="bg-green-50 p-4 mt-4 relative"
                    style={{
                        borderWidth: 2,
                        borderColor: Colors.border,
                        borderRadius: borderRadius.MEDIUM,
                    }}
                >
                    <BrutalTag
                        text={t('home.etymologie', translationLanguage)}
                        backgroundColor={Colors.surface}
                        borderWidth={2}
                        borderRadius={borderRadius.SHARP}
                        shadowOffset={1}
                        paddingHorizontal={12}
                        paddingVertical={6}
                        textClassName="text-[11px]"
                        style={{
                            position: 'absolute',
                            top: -18,
                            left: 16,
                        }}
                    />

                    <Text className="text-[14px] text-text-main font-w-regular leading-[20px] mt-2">
                        {content.etymology.text || t('common.notFound', translationLanguage)}
                    </Text>

                    {content.etymology.rootWord && (
                        <View className="mt-4 flex-row items-center">
                            <Text className="text-[12px] text-text-muted font-w-semibold uppercase tracking-[1.5px] opacity-60">
                                {t('home.root', translationLanguage)}:
                            </Text>
                            <View
                                className="bg-accent-yellow px-2 py-0.5"
                                style={{
                                    borderWidth: 2,
                                    borderColor: Colors.border,
                                    borderRadius: borderRadius.SMALL,
                                }}
                            >
                                <Text className="text-xs font-w-semibold text-text-main">
                                    {content.etymology.rootWord}
                                </Text>
                            </View>
                        </View>
                    )}
                </View>
            </View>
        </BrutalCard>
    );
}
