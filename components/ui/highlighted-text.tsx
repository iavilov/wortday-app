import { Colors } from '@/constants/design-tokens';
import React from 'react';
import { Platform, Text, View } from 'react-native';

interface HighlightedTextProps {
    text: string;
    textClassName?: string;
    highlightClassName?: string;
}

/**
 * Renders text with **highlighted** parts in a neo-brutalist style.
 * Uses a View inside a Text to achieve the inline block look.
 */
export function HighlightedText({ text, textClassName = '', highlightClassName = '' }: HighlightedTextProps) {
    const parts = text.split(/(\*\*.*?\*\*)/g);

    return (
        <Text className={textClassName}>
            {parts.map((part, index) => {
                if (part.startsWith('**') && part.endsWith('**')) {
                    const word = part.slice(2, -2);
                    return (
                        <View
                            key={index}
                            style={{
                                backgroundColor: Colors.accentYellow,
                                borderWidth: 1,
                                borderColor: Colors.border,
                                borderRadius: 4,
                                paddingHorizontal: 6,
                                paddingVertical: 0,
                                marginHorizontal: 2,
                                transform: [{
                                    translateY: Platform.select({
                                        ios: 11,
                                        android: 11,
                                        web: 0,
                                        default: 0
                                    })
                                }],
                            }}
                        >
                            <Text className={`text-border font-w-semibold ${highlightClassName}`}>
                                {word}
                            </Text>
                        </View>
                    );
                }
                return <Text key={index}>{part}</Text>;
            })}
        </Text>
    );
}
