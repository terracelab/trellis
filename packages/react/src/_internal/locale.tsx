// locale 컨텍스트(D-65). TrellisProvider가 없으면 ko.
import {
  formatMessage,
  type Locale,
  type MessageKey,
  type MessageVars,
} from '@terracelab/trellis-contracts';
import { createContext, useCallback, useContext } from 'react';

export const LocaleContext = createContext<Locale>('ko');

/** 지금 locale */
export function useLocale(): Locale {
  return useContext(LocaleContext);
}

export type Translate = (key: MessageKey, vars?: MessageVars) => string;

/** 문구 꺼내기: t('common.close') · t('filterBar.showResults', { count: '837' }) */
export function useMessages(): Translate {
  const locale = useLocale();
  return useCallback((key, vars) => formatMessage(locale, key, vars), [locale]);
}
