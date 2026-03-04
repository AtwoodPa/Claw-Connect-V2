import en from './en.json';
import zhCN from './zh-CN.json';

export const localeMessages = {
  en,
  'zh-CN': zhCN
};

export type SupportedLocale = keyof typeof localeMessages;
