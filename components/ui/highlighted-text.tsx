import { Colors } from '@/constants/design-tokens';
import React from 'react';
import { Platform, Text } from 'react-native';

interface HighlightedTextProps {
    text: string;
    textClassName?: string;
    highlightClassName?: string;
}

/**
 * Renders text with **highlighted** parts in a neo-brutalist style.
 * Uses a View inside a Text to achieve the inline block look.
 */
export const HighlightedText = ({ text, textClassName = '', highlightClassName = '' }: HighlightedTextProps) => {
    const parts = text.split(/(\*\*.*?\*\*)/g);

    return (
        <Text className={textClassName}>
            {parts.map((part, index) => {
                if (part.startsWith('**') && part.endsWith('**')) {
                    const word = part.slice(2, -2);
                    return (
                        <Text
                            key={index}
                            className={`text-border font-w-semibold ${highlightClassName}`}
                            style={{
                                backgroundColor: Colors.accentYellow,
                                borderWidth: 1.5,
                                borderColor: Colors.border,
                                borderRadius: 6,
                                paddingHorizontal: 6,
                                paddingVertical: Platform.select({ web: 2, default: 1 }),
                                marginHorizontal: 2,
                            }}
                        >
                            {word}
                        </Text>
                    );
                }
                return <Text key={index}>{part}</Text>;
            })}
        </Text>
    );
}
