import type { FoodItemClient, Language, CartItemClient } from '@shared/schema';

export type OfflineStatus = 'online' | 'offline';

export type FilterCategory = 
  // Food types
  'all' | 'fruits' | 'vegetables' | 'grains' | 'spices' | 'dairy' | 'seafood' | 
  'meat' | 'poultry' | 'nuts' | 'seeds' | 'legumes' | 
  
  // Regional
  'indian' | 'global' | 'mediterranean' | 'asian' | 'european' | 'american' |
  
  // Dietary preferences
  'protein' | 'vegan' | 'vegetarian' | 'non_vegetarian' | 'gluten-free' | 'keto' | 
  
  // Nutritional profiles
  'high_protein' | 'high_fiber' | 'low_carb' | 'low_fat' | 'high_vitamin_a' | 
  'high_vitamin_c' | 'high_vitamin_d' | 'high_calcium' | 'high_iron' | 'high_omega3' | 
  'antioxidant_rich' | 'probiotic' | 'superfood';

export interface LanguageOption {
  code: Language;
  name: string;
}

export const LANGUAGES: LanguageOption[] = [
  // English
  { code: 'en', name: 'English' },
  
  // Indian languages
  { code: 'hi', name: 'हिन्दी' },          // Hindi
  { code: 'ta', name: 'தமிழ்' },           // Tamil
  { code: 'bn', name: 'বাংলা' },           // Bengali
  { code: 'mr', name: 'मराठी' },           // Marathi
  { code: 'te', name: 'తెలుగు' },          // Telugu
  { code: 'gu', name: 'ગુજરાતી' },         // Gujarati
  { code: 'ur', name: 'اردو' },            // Urdu
  { code: 'kn', name: 'ಕನ್ನಡ' },           // Kannada
  { code: 'or', name: 'ଓଡ଼ିଆ' },           // Odia
  { code: 'ml', name: 'മലയാളം' },          // Malayalam
  { code: 'pa', name: 'ਪੰਜਾਬੀ' },          // Punjabi
  { code: 'as', name: 'অসমীয়া' },         // Assamese
  { code: 'mai', name: 'मैथिली' },         // Maithili
  { code: 'sat', name: 'संताली' },         // Santali
  { code: 'ks', name: 'कॉशुर' },           // Kashmiri
  { code: 'ne', name: 'नेपाली' },          // Nepali
  { code: 'sd', name: 'سنڌي' },            // Sindhi
  { code: 'kok', name: 'कोंकणी' },         // Konkani
  
  // International languages
  { code: 'es', name: 'Español' },         // Spanish
  { code: 'fr', name: 'Français' },        // French
  { code: 'ar', name: 'العربية' },         // Arabic
  { code: 'ru', name: 'Русский' },         // Russian
  { code: 'pt', name: 'Português' },       // Portuguese
  { code: 'id', name: 'Bahasa Indonesia' }, // Indonesian
  { code: 'de', name: 'Deutsch' },         // German
  { code: 'ja', name: '日本語' },           // Japanese
  { code: 'sw', name: 'Kiswahili' },       // Swahili
  { code: 'tr', name: 'Türkçe' },          // Turkish
  { code: 'yue', name: '粵語' },           // Cantonese
  { code: 'vi', name: 'Tiếng Việt' },      // Vietnamese
  { code: 'ko', name: '한국어' },           // Korean
  { code: 'it', name: 'Italiano' },        // Italian
  { code: 'fa', name: 'فارسی' },           // Persian (Farsi)
  { code: 'th', name: 'ไทย' },             // Thai
  { code: 'ha', name: 'Hausa' },           // Hausa
  { code: 'pl', name: 'Polski' },          // Polish
  { code: 'uk', name: 'Українська' },      // Ukrainian
  { code: 'ms', name: 'Bahasa Melayu' },   // Malay
  { code: 'ro', name: 'Română' },          // Romanian
  { code: 'nl', name: 'Nederlands' },      // Dutch
  { code: 'am', name: 'አማርኛ' },            // Amharic
  { code: 'fil', name: 'Filipino' },       // Filipino
  { code: 'my', name: 'မြန်မာစာ' },        // Burmese
  { code: 'om', name: 'Afaan Oromoo' },    // Oromo
  { code: 'zh', name: '中文' }             // Mandarin Chinese
];

export interface SearchFilters {
  query: string;
  category: FilterCategory;
}
