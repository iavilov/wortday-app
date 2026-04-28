import { BrutalButton } from '@/components/ui/brutal-button';
import { Border, Colors, borderRadius } from '@/constants/design-tokens';
import { createBrutalShadow } from '@/utils/platform-styles';
import { AlertTriangle, type LucideIcon } from 'lucide-react-native';
import React from 'react';
import { Text, View, ViewStyle } from 'react-native';

interface BrutalErrorProps {
    Icon?: LucideIcon;
    title: string;
    description?: string;
    retryLabel?: string;
    onRetry?: () => void;
    style?: ViewStyle;
}

export const BrutalError = ({
    Icon = AlertTriangle,
    title,
    description,
    retryLabel,
    onRetry,
    style,
}: BrutalErrorProps) => {
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
                    backgroundColor: Colors.destructiveSoft,
                    borderWidth: Border.primary,
                    borderColor: Colors.destructive,
                    borderRadius: borderRadius.LARGE,
                    alignItems: 'center',
                    justifyContent: 'center',
                    marginBottom: 20,
                    ...createBrutalShadow(4, Colors.destructive),
                }}
            >
                <Icon size={36} color={Colors.destructive} strokeWidth={2.5} />
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
                        marginBottom: retryLabel ? 20 : 0,
                        maxWidth: 320,
                    }}
                >
                    {description}
                </Text>
            ) : null}

            {retryLabel && onRetry ? (
                <BrutalButton
                    onPress={onRetry}
                    backgroundColor={Colors.surface}
                    borderColor={Colors.destructive}
                    borderWidth={Border.primary}
                    borderRadius={borderRadius.MEDIUM}
                    shadowOffset={4}
                    accessibilityLabel={retryLabel}
                    pressableStyle={{ paddingVertical: 12, paddingHorizontal: 24, minHeight: 44 }}
                >
                    <Text
                        style={{
                            fontSize: 16,
                            fontWeight: '700',
                            color: Colors.destructive,
                            textTransform: 'uppercase',
                            letterSpacing: 0.5,
                        }}
                    >
                        {retryLabel}
                    </Text>
                </BrutalButton>
            ) : null}
        </View>
    );
};
