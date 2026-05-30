import { create } from 'zustand';
import { persist, createJSONStorage } from 'zustand/middleware';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { setLocale } from '../i18n';

type Language = 'en' | 'rw' | 'fr';

interface SettingsState {
  language: Language;
  notificationsEnabled: boolean;
  setLanguage: (lang: Language) => void;
  setNotifications: (enabled: boolean) => void;
}

export const useSettingsStore = create<SettingsState>()(
  persist(
    (set) => ({
      language: 'en',
      notificationsEnabled: true,
      setLanguage: (language) => {
        setLocale(language);
        set({ language });
      },
      setNotifications: (notificationsEnabled) => set({ notificationsEnabled }),
    }),
    {
      name: 'settings-storage',
      storage: createJSONStorage(() => AsyncStorage),
    }
  )
);
