/**
 * Settings Screen
 * User settings and language selection
 */

import { Colors } from '@/constants/design-tokens';
import { useSettingsStore } from '@/store/settings-store';
import { LANGUAGE_OPTIONS } from '@/types/settings';
import { ChevronDown } from 'lucide-react-native';
import { useState } from 'react';
import { Modal, Text, TouchableOpacity, View } from 'react-native';

export default function SettingsScreen() {
  const { translationLanguage, setTranslationLanguage, userEmail } = useSettingsStore();
  const [isLanguageModalOpen, setIsLanguageModalOpen] = useState(false);

  const selectedLanguage = LANGUAGE_OPTIONS.find(lang => lang.code === translationLanguage);

  return (
    <View className="flex-1 bg-background">
      {/* Header */}
      <View className="pt-12 pb-4 px-6 bg-surface">
        <Text className="text-primary text-3xl font-bold mb-2">
          Настройки
        </Text>
        <Text className="text-text-muted text-sm font-regular">
          Параметры приложения
        </Text>
      </View>

      {/* Settings Content */}
      <View className="p-6">

        {/* Email Section */}
        <View
          className="bg-surface p-4 rounded-xl mb-4"
          style={{
            borderWidth: 2,
            borderColor: Colors.border,
          }}
        >
          <Text className="text-text-muted text-xs uppercase mb-2 tracking-wider font-bold">
            Email
          </Text>
          <Text className="text-text-main text-base font-medium">
            {userEmail}
          </Text>
        </View>

        {/* Language Selection */}
        <View
          className="bg-surface p-4 rounded-xl"
          style={{
            borderWidth: 2,
            borderColor: Colors.border,
          }}
        >
          <Text className="text-text-muted text-xs uppercase mb-3 tracking-wider font-bold">
            Язык перевода
          </Text>

          <TouchableOpacity
            onPress={() => setIsLanguageModalOpen(true)}
            activeOpacity={0.8}
            className="flex-row items-center justify-between p-3 bg-primary rounded-lg"
            style={{
              borderWidth: 2,
              borderColor: Colors.border,
            }}>
            <Text className="text-border text-base flex-1 font-bold">
              {selectedLanguage?.nativeName}
            </Text>
            <ChevronDown size={20} color={Colors.border} strokeWidth={3} />
          </TouchableOpacity>
        </View>

      </View>

      {/* Language Selection Modal */}
      <Modal
        visible={isLanguageModalOpen}
        transparent
        animationType="fade"
        onRequestClose={() => setIsLanguageModalOpen(false)}>
        <TouchableOpacity
          activeOpacity={1}
          onPress={() => setIsLanguageModalOpen(false)}
          className="flex-1 justify-center items-center bg-black/50">

          <View
            className="bg-surface w-4/5 max-w-sm rounded-2xl p-6"
            style={{
              borderWidth: 3,
              borderColor: Colors.border,
            }}
          >
            <Text className="text-primary text-xl font-bold mb-4">
              Выберите язык
            </Text>

            {LANGUAGE_OPTIONS.map((language) => (
              <TouchableOpacity
                key={language.code}
                onPress={() => {
                  setTranslationLanguage(language.code);
                  setIsLanguageModalOpen(false);
                }}
                activeOpacity={0.7}
                className="py-4 border-b border-gray-100 flex-row items-center justify-between">
                <View>
                  <Text className="text-text-main text-base font-semibold mb-1">
                    {language.nativeName}
                  </Text>
                  <Text className="text-text-muted text-xs font">
                    {language.name}
                  </Text>
                </View>

                {translationLanguage === language.code && (
                  <View
                    className="w-6 h-6 rounded-lg bg-accent-yellow items-center justify-center"
                    style={{
                      borderWidth: 2,
                      borderColor: Colors.border,
                    }}
                  >
                    <Text className="text-border text-sm font-bold">✓</Text>
                  </View>
                )}
              </TouchableOpacity>
            ))}

            <TouchableOpacity
              onPress={() => setIsLanguageModalOpen(false)}
              className="mt-4 py-3 bg-primary rounded-lg items-center"
              style={{
                borderWidth: 2,
                borderColor: Colors.border,
              }}>
              <Text className="text-border font-bold uppercase">
                Закрыть
              </Text>
            </TouchableOpacity>
          </View>
        </TouchableOpacity>
      </Modal>
    </View>
  );
}
