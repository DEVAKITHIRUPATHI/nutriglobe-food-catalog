import { useContext } from 'react';
import { AppContext } from '@/contexts/AppContext';
import type { Language, TranslatedContent } from '@shared/schema';
import {
  translateContent,
  getLocalizedText as getSharedLocalizedText,
  DEFAULT_TRANSLATIONS,
  SUPPORTED_LANGUAGES,
  translateFoodName,
  translateFoodDescription,
  isLanguageSupported,
  getLanguageMetadata,
  formatNutritionWithUnit,
  type LanguageMetadata
} from '@shared/translationUtils';

export function useTranslation() {
  const context = useContext(AppContext);
  const language = (context?.language || 'en') as Language;

  function t(content: TranslatedContent | Partial<Record<Language, string>> | Record<string, string>): string {
    return translateContent(content, language);
  }

  function getLocalizedText(key: string): string {
    return getSharedLocalizedText(key, language);
  }

  return { t, getLocalizedText, language };
}

// Re-export shared translation utilities for direct usage
export {
  translateContent,
  getSharedLocalizedText as getLocalizedText,
  DEFAULT_TRANSLATIONS,
  SUPPORTED_LANGUAGES,
  translateFoodName,
  translateFoodDescription,
  isLanguageSupported,
  getLanguageMetadata,
  formatNutritionWithUnit,
  type LanguageMetadata
};
