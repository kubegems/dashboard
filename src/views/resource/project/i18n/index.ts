import VueI18n from 'vue-i18n';

import * as en from './en.json';
import * as ja from './ja.json';
import * as zhHans from './zh-Hans.json';
import * as zhHant from './zh-Hant.json';
import { useStore } from '@/store';

const store = useStore();

const i18n = new VueI18n({
  locale: store.state.Locale,
  fallbackLocale: store.state.Locale,
  messages: { 'zh-Hans': zhHans, en: en, ja: ja, 'zh-Hant': zhHant },
});

export const useI18n = () => i18n;

export default { 'zh-Hans': zhHans, en: en, ja: ja, 'zh-Hant': zhHant };
