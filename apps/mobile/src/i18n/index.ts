import { I18n } from 'i18n-js';
import en from './locales/en.json';
import rw from './locales/rw.json';
import fr from './locales/fr.json';

export const i18n = new I18n({ en, rw, fr });
i18n.defaultLocale = 'en';
i18n.locale = 'en';
i18n.enableFallback = true;

export function t(key: string, options?: object): string {
  return i18n.t(key, options);
}

export function setLocale(locale: 'en' | 'rw' | 'fr') {
  i18n.locale = locale;
}
