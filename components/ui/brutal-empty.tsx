import { BrutalButton } from '@/components/ui/brutal-button';
import { Border, Colors, borderRadius } from '@/constants/design-tokens';
import { createBrutalShadow } from '@/utils/platform-styles';
import type { LucideIcon } from 'lucide-react-native';
import React from 'react';
import { Text, View, ViewStyle } from 'react-native';

interface BrutalEmptyProps {
    Icon: LucideIcon;
    title: string;
    description?: string;
    iconBackground?: string;
    actionLabel?: string;
    onAction?: () => void;
    style?: ViewStyle;
}

export const BrutalEmpty = ({
    Icon,
    title,
    description,
    iconBackground = Colors.accentYellow,
    actionLabel,
    onAction,
    style,
}: BrutalEmptyProps) => {
    return (
        <View
            style={[
                {
                    width: '100%',
                    alignItems: 'center',
                    paddingVertical: 32,
                    paddingHorizontal: 16,
                },
                style,
            ]}
        >
            <View
                style={{
                    width: 80,
                    height: 80,
                    backgroundColor: iconBackground,
                    borderWidth: Border.primary,
                    borderColor: Colors.border,
                    borderRadius: borderRadius.LARGE,
                    alignItems: 'center',
                    justifyContent: 'center',
                    marginBottom: 20,
                    ...createBrutalShadow(4, Colors.border),
                }}
            >
                <Icon size={36} color={Colors.border} strokeWidth={2.5} />
            </View>

            <Text
                style={{
                    fontSize: 20,
                    fontWeight: '700',
                    color: Colors.textMain,
                    textAlign: 'center',
                    marginBottom: 8,
                }}
            >
                {title}
            </Text>

            {description ? (
                <Text
                    style={{
                        fontSize: 16,
                        color: Colors.textMuted,
                        textAlign: 'center',
                        lineHeight: 22,
                        marginBottom: actionLabel ? 20 : 0,
                        maxWidth: 320,
                    }}
                >
                    {description}
                </Text>
            ) : null}

            {actionLabel && onAction ? (
                <BrutalButton
                    onPress={onAction}
                    backgroundColor={Colors.primary}
                    borderRadius={borderRadius.MEDIUM}
                    shadowOffset={4}
                    accessibilityLabel={actionLabel}
                    pressableStyle={{ paddingVertical: 12, paddingHorizontal: 24, minHeight: 44 }}
                >
                    <Text
                        style={{
                            fontSize: 16,
                            fontWeight: '700',
                            color: Colors.textMain,
                            textTransform: 'uppercase',
                            letterSpacing: 0.5,
                        }}
                    >
                        {actionLabel}
                    </Text>
                </BrutalButton>
            ) : null}
        </View>
    );
};
