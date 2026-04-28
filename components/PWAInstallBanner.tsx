/**
 * PWA Install Banner Component
 * Shows install prompt for Progressive Web App
 */

import React, { useState, useEffect } from 'react';
import { View, Text, Pressable, Platform, StyleSheet } from 'react-native';
import { Download, X } from 'lucide-react-native';
import { usePWA } from '@/hooks/usePWA';
import { getInstallInstructions } from '@/lib/pwa-utils';
import { palette } from '@/constants/colors';

export function PWAInstallBanner() {
  const { isPWA, isInstallable, install } = usePWA();
  const [isDismissed, setIsDismissed] = useState(false);
  const [showInstructions, setShowInstructions] = useState(false);

  // Don't show on native platforms or if already installed
  if (Platform.OS !== 'web' || isPWA || !isInstallable || isDismissed) {
    return null;
  }

  const handleInstall = async () => {
    const success = await install();
    if (!success) {
      // If browser doesn't support prompt, show manual instructions
      setShowInstructions(true);
    }
  };

  const handleDismiss = () => {
    setIsDismissed(true);
  };

  if (showInstructions) {
    return (
      <View style={styles.banner}>
        <View style={styles.content}>
          <Text style={styles.title}>How to Install</Text>
          <Text style={styles.instructions}>{getInstallInstructions()}</Text>
          <Pressable onPress={() => setShowInstructions(false)} style={styles.button}>
            <Text style={styles.buttonText}>Got it</Text>
          </Pressable>
        </View>
        <Pressable onPress={handleDismiss} style={styles.closeButton}>
          <X size={20} color={palette.ink} />
        </Pressable>
      </View>
    );
  }

  return (
    <View style={styles.banner}>
      <View style={styles.content}>
        <Download size={24} color={palette.primary} style={styles.icon} />
        <View style={styles.textContainer}>
          <Text style={styles.title}>Install Wortday</Text>
          <Text style={styles.subtitle}>Add to your home screen for a better experience</Text>
        </View>
        <Pressable onPress={handleInstall} style={styles.button}>
          <Text style={styles.buttonText}>Install</Text>
        </Pressable>
      </View>
      <Pressable onPress={handleDismiss} style={styles.closeButton}>
        <X size={20} color={palette.ink} />
      </Pressable>
    </View>
  );
}

const styles = StyleSheet.create({
  banner: {
    backgroundColor: palette.cardBg,
    borderWidth: 2,
    borderColor: palette.ink,
    borderRadius: 12,
    padding: 16,
    margin: 16,
    shadowColor: palette.ink,
    shadowOffset: { width: 4, height: 4 },
    shadowOpacity: 1,
    shadowRadius: 0,
    elevation: 4,
  },
  content: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
  },
  icon: {
    flexShrink: 0,
  },
  textContainer: {
    flex: 1,
  },
  title: {
    fontSize: 16,
    fontWeight: '600',
    color: palette.ink,
    marginBottom: 4,
  },
  subtitle: {
    fontSize: 15,
    color: palette.gray[600],
  },
  instructions: {
    fontSize: 15,
    color: palette.ink,
    marginTop: 8,
    lineHeight: 22,
  },
  button: {
    backgroundColor: palette.primary,
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 8,
    borderWidth: 2,
    borderColor: palette.ink,
  },
  buttonText: {
    fontSize: 14,
    fontWeight: '600',
    color: palette.ink,
  },
  closeButton: {
    position: 'absolute',
    top: 8,
    right: 8,
    padding: 4,
  },
});
