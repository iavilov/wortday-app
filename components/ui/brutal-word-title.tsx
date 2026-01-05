import { BrutalButton } from '@/components/ui/brutal-button';
import { Colors } from '@/constants/design-tokens';
import { Volume2 } from 'lucide-react-native';
import React from 'react';
import { Text, View } from 'react-native';

interface BrutalWordTitleProps {
    word: string;
    onAudioPress?: () => void;
}

export function BrutalWordTitle({ word, onAudioPress }: BrutalWordTitleProps) {
    // Determine font size based on word length to prevent overflow
    const getFontSizeClass = (text: string) => {
        if (text.length > 18) return 'text-xl';
        if (text.length > 13) return 'text-2xl';
        if (text.length > 8) return 'text-3xl';
        return 'text-7xl';
    };

    return (
        <View className="flex-row items-center mb-6">
            <Text
                className={`${getFontSizeClass(word)} font-w-extrabold text-text-main flex-1 mr-3 flex-shrink`}
                numberOfLines={2}
                adjustsFontSizeToFit
            >
                {word}
            </Text>
            <BrutalButton
                onPress={onAudioPress}
                borderWidth={2}
                borderRadius={25}
                backgroundColor={Colors.accentYellow}
                style={{ width: 48, height: 48 }}
                contentContainerStyle={{ height: '100%' }}
            >
                <Volume2 size={24} color={Colors.border} strokeWidth={2.5} />
            </BrutalButton>
        </View>
    );
}
