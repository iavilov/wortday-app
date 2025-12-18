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
        <Text className="text-primary text-3xl font-extrabold mb-2" 
              style={{ fontFamily: 'Rubik_800ExtraBold' }}>
          Настройки
        </Text>
        <Text className="text-text-muted text-sm" 
              style={{ fontFamily: 'Rubik_400Regular' }}>
          Параметры приложения
        </Text>
      </View>

      {/* Settings Content */}
      <View className="p-6">
        
        {/* Email Section */}
        <View className="bg-surface p-4 rounded-xl shadow-sm mb-4">
          <Text className="text-text-muted text-xs uppercase mb-2 tracking-wider" 
                style={{ fontFamily: 'Rubik_700Bold' }}>
            Email
          </Text>
          <Text className="text-text-main text-base" 
                style={{ fontFamily: 'Rubik_500Medium' }}>
            {userEmail}
          </Text>
        </View>

        {/* Language Selection */}
        <View className="bg-surface p-4 rounded-xl shadow-sm">
          <Text className="text-text-muted text-xs uppercase mb-3 tracking-wider" 
                style={{ fontFamily: 'Rubik_700Bold' }}>
            Язык перевода
          </Text>
          
          <TouchableOpacity
            onPress={() => setIsLanguageModalOpen(true)}
            activeOpacity={0.7}
            className="flex-row items-center justify-between p-3 bg-gray-50 rounded-lg">
            <Text className="text-text-main text-base flex-1" 
                  style={{ fontFamily: 'Rubik_500Medium' }}>
              {selectedLanguage?.nativeName}
            </Text>
            <ChevronDown size={20} color={Colors.textMuted} />
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
          
          <View className="bg-surface w-4/5 max-w-sm rounded-2xl p-6 shadow-lg">
            <Text className="text-primary text-xl font-bold mb-4" 
                  style={{ fontFamily: 'Rubik_700Bold' }}>
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
                  <Text className="text-text-main text-base font-bold mb-1" 
                        style={{ fontFamily: 'Rubik_600SemiBold' }}>
                    {language.nativeName}
                  </Text>
                  <Text className="text-text-muted text-xs" 
                        style={{ fontFamily: 'Rubik_400Regular' }}>
                    {language.name}
                  </Text>
                </View>
                
                {translationLanguage === language.code && (
                  <View className="w-6 h-6 rounded-full bg-accent-purple items-center justify-center">
                    <Text className="text-white text-sm font-bold">✓</Text>
                  </View>
                )}
              </TouchableOpacity>
            ))}

            <TouchableOpacity
              onPress={() => setIsLanguageModalOpen(false)}
              className="mt-4 py-3 bg-gray-100 rounded-full items-center">
              <Text className="text-text-main font-bold" 
                    style={{ fontFamily: 'Rubik_600SemiBold' }}>
                Закрыть
              </Text>
            </TouchableOpacity>
          </View>
        </TouchableOpacity>
      </Modal>
    </View>
  );
}
