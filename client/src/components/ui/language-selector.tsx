import React, { useContext } from 'react';
import { AppContext } from '@/contexts/AppContext';
import { useTranslation } from '@/hooks/useTranslation';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Globe } from 'lucide-react';

export interface Language {
  code: string;
  name: string;
  nativeName?: string;
}

const LANGUAGES: Language[] = [
  // Primary
  { code: 'en', name: 'English', nativeName: 'English' },

  // Indian Official & Regional Languages (22 Official + Major Regional)
  { code: 'hi', name: 'Hindi', nativeName: 'हिन्दी' },
  { code: 'ta', name: 'Tamil', nativeName: 'தமிழ்' },
  { code: 'te', name: 'Telugu', nativeName: 'తెలుగు' },
  { code: 'bn', name: 'Bengali', nativeName: 'বাংলা' },
  { code: 'mr', name: 'Marathi', nativeName: 'मराठी' },
  { code: 'gu', name: 'Gujarati', nativeName: 'ગુજરાતી' },
  { code: 'kn', name: 'Kannada', nativeName: 'ಕನ್ನಡ' },
  { code: 'ml', name: 'Malayalam', nativeName: 'മലയാളം' },
  { code: 'or', name: 'Odia', nativeName: 'ଓଡ଼ିଆ' },
  { code: 'pa', name: 'Punjabi', nativeName: 'ਪੰਜਾਬੀ' },
  { code: 'as', name: 'Assamese', nativeName: 'অসমীয়া' },
  { code: 'ur', name: 'Urdu', nativeName: 'اردو' },
  { code: 'sa', name: 'Sanskrit', nativeName: 'संस्कृतम्' },
  { code: 'mai', name: 'Maithili', nativeName: 'मैथिली' },
  { code: 'sat', name: 'Santali', nativeName: 'ᱥᱟᱱᱛᱟᱲᱤ' },
  { code: 'ks', name: 'Kashmiri', nativeName: 'कॉशुर / کٲشُر' },
  { code: 'ne', name: 'Nepali', nativeName: 'नेपाली' },
  { code: 'kok', name: 'Konkani', nativeName: 'कोंकणी' },
  { code: 'sd', name: 'Sindhi', nativeName: 'سنڌي' },
  { code: 'doi', name: 'Dogri', nativeName: 'डोगरी' },
  { code: 'brx', name: 'Bodo', nativeName: 'बर’' },
  { code: 'mni', name: 'Manipuri', nativeName: 'মৈতৈলোন্' },
  { code: 'bh', name: 'Bhojpuri', nativeName: 'भोजपुरी' },

  // Major International Languages
  { code: 'es', name: 'Spanish', nativeName: 'Español' },
  { code: 'fr', name: 'French', nativeName: 'Français' },
  { code: 'de', name: 'German', nativeName: 'Deutsch' },
  { code: 'zh', name: 'Chinese (Simplified)', nativeName: '简体中文' },
  { code: 'zh-TW', name: 'Chinese (Traditional)', nativeName: '繁體中文' },
  { code: 'ja', name: 'Japanese', nativeName: '日本語' },
  { code: 'ko', name: 'Korean', nativeName: '한국어' },
  { code: 'ar', name: 'Arabic', nativeName: 'العربية' },
  { code: 'ru', name: 'Russian', nativeName: 'Русский' },
  { code: 'pt', name: 'Portuguese', nativeName: 'Português' },
  { code: 'it', name: 'Italian', nativeName: 'Italiano' },
  { code: 'nl', name: 'Dutch', nativeName: 'Nederlands' },
  { code: 'sv', name: 'Swedish', nativeName: 'Svenska' },
  { code: 'tr', name: 'Turkish', nativeName: 'Türkçe' },
  { code: 'pl', name: 'Polish', nativeName: 'Polski' },
  { code: 'da', name: 'Danish', nativeName: 'Dansk' },
  { code: 'fi', name: 'Finnish', nativeName: 'Suomi' },
  { code: 'no', name: 'Norwegian', nativeName: 'Norsk' },
  { code: 'cs', name: 'Czech', nativeName: 'Čeština' },
  { code: 'hu', name: 'Hungarian', nativeName: 'Magyar' },
  { code: 'el', name: 'Greek', nativeName: 'Ελληνικά' },
  { code: 'ro', name: 'Romanian', nativeName: 'Română' },
  { code: 'sk', name: 'Slovak', nativeName: 'Slovenčina' },
  { code: 'uk', name: 'Ukrainian', nativeName: 'Українська' },
  { code: 'bg', name: 'Bulgarian', nativeName: 'Български' },
  { code: 'hr', name: 'Croatian', nativeName: 'Hrvatski' },
  { code: 'sr', name: 'Serbian', nativeName: 'Српски' },
  { code: 'vi', name: 'Vietnamese', nativeName: 'Tiếng Việt' },
  { code: 'id', name: 'Indonesian', nativeName: 'Bahasa Indonesia' },
  { code: 'ms', name: 'Malay', nativeName: 'Bahasa Melayu' },
  { code: 'th', name: 'Thai', nativeName: 'ภาษาไทย' },
  { code: 'fa', name: 'Persian', nativeName: 'فارسی' },
  { code: 'he', name: 'Hebrew', nativeName: 'עברית' },
  { code: 'sw', name: 'Swahili', nativeName: 'Kiswahili' },
  { code: 'af', name: 'Afrikaans', nativeName: 'Afrikaans' },
  { code: 'et', name: 'Estonian', nativeName: 'Eesti' },
  { code: 'lv', name: 'Latvian', nativeName: 'Latviešu' },
  { code: 'lt', name: 'Lithuanian', nativeName: 'Lietuvių' },
  { code: 'sl', name: 'Slovenian', nativeName: 'Slovenščina' },
  { code: 'sq', name: 'Albanian', nativeName: 'Shqip' },
  { code: 'is', name: 'Icelandic', nativeName: 'Íslenska' },
  { code: 'ga', name: 'Irish', nativeName: 'Gaeilge' },
  { code: 'mt', name: 'Maltese', nativeName: 'Malti' },
  { code: 'yi', name: 'Yiddish', nativeName: 'ייִדיש' },
  { code: 'ka', name: 'Georgian', nativeName: 'ქართული' },
  { code: 'hy', name: 'Armenian', nativeName: 'Հայերեն' },
  { code: 'az', name: 'Azerbaijani', nativeName: 'Azərbaycan' },
  { code: 'kk', name: 'Kazakh', nativeName: 'Қазақша' },
  { code: 'uz', name: 'Uzbek', nativeName: 'Oʻzbekcha' },
  { code: 'mn', name: 'Mongolian', nativeName: 'Монгол' },
  { code: 'km', name: 'Khmer', nativeName: 'ខ្មែរ' },
  { code: 'lo', name: 'Lao', nativeName: 'ລາວ' },
  { code: 'my', name: 'Burmese', nativeName: 'ဗမာစာ' },
  { code: 'si', name: 'Sinhala', nativeName: 'සිංහල' },
  { code: 'am', name: 'Amharic', nativeName: 'አማርኛ' },
  { code: 'so', name: 'Somali', nativeName: 'Soomaali' },
  { code: 'ha', name: 'Hausa', nativeName: 'Harshen Hausa' },
  { code: 'yo', name: 'Yoruba', nativeName: 'Yorùbá' },
  { code: 'ig', name: 'Igbo', nativeName: 'Asụsụ Igbo' },
  { code: 'zu', name: 'Zulu', nativeName: 'isiZulu' },
  { code: 'xh', name: 'Xhosa', nativeName: 'isiXhosa' },
  { code: 'ps', name: 'Pashto', nativeName: 'پښتو' },
  { code: 'fil', name: 'Filipino / Tagalog', nativeName: 'Wikang Filipino' },
  { code: 'yue', name: 'Cantonese', nativeName: '粵語' },
  { code: 'om', name: 'Oromo', nativeName: 'Afaan Oromoo' },
  { code: 'cy', name: 'Welsh', nativeName: 'Cymraeg' },
  { code: 'eu', name: 'Basque', nativeName: 'Euskara' },
  { code: 'gl', name: 'Galician', nativeName: 'Galego' },
  { code: 'ca', name: 'Catalan', nativeName: 'Català' },
  { code: 'be', name: 'Belarusian', nativeName: 'Беларуская' },
  { code: 'mk', name: 'Macedonian', nativeName: 'Македонски' },
  { code: 'bs', name: 'Bosnian', nativeName: 'Bosanski' },
  { code: 'bo', name: 'Tibetan', nativeName: 'བོད་སྐད་' },
  { code: 'ku', name: 'Kurdish', nativeName: 'Kurdî / کوردی' },
  { code: 'tg', name: 'Tajik', nativeName: 'Тоҷикӣ' },
  { code: 'tk', name: 'Turkmen', nativeName: 'Türkmençe' },
  { code: 'ky', name: 'Kyrgyz', nativeName: 'Кыргызча' },
  { code: 'tt', name: 'Tatar', nativeName: 'Татарча' },
  { code: 'haw', name: 'Hawaiian', nativeName: 'ʻŌlelo Hawaiʻi' },
  { code: 'sm', name: 'Samoan', nativeName: 'Gagana Samoa' },
  { code: 'mi', name: 'Maori', nativeName: 'Te Reo Māori' },
  { code: 'la', name: 'Latin', nativeName: 'Latīna' },
  { code: 'eo', name: 'Esperanto', nativeName: 'Esperanto' }
];

function LanguageSelector({ className }: { className?: string }) {
  const { language, setLanguage } = useContext(AppContext);
  const { getLocalizedText } = useTranslation();

  const currentLang = LANGUAGES.find((l) => l.code === language) || LANGUAGES[0];

  const handleLanguageChange = (value: string) => {
    if (value && typeof setLanguage === 'function') {
      setLanguage(value as any);
    }
  };

  return (
    <div className={`relative inline-flex items-center ${className || ''}`}>
      <Select value={language} onValueChange={handleLanguageChange}>
        <SelectTrigger
          className="h-8 md:h-9 bg-emerald-950/80 hover:bg-emerald-900/90 text-white rounded-xl border border-emerald-600/50 shadow-md text-xs font-semibold px-2.5 py-1.5 focus:ring-1 focus:ring-emerald-400 gap-1.5 min-w-[110px] sm:min-w-[130px]"
          aria-label={getLocalizedText('nav.language') || 'Select Language'}
        >
          <div className="flex items-center gap-1.5 truncate">
            <Globe className="w-3.5 h-3.5 text-emerald-300 shrink-0" />
            <span className="truncate font-bold">{currentLang.nativeName || currentLang.name}</span>
          </div>
        </SelectTrigger>
        <SelectContent className="max-h-72 overflow-y-auto bg-slate-900 text-white border border-emerald-800 shadow-2xl rounded-xl z-50 min-w-[210px]">
          {LANGUAGES.map((lang) => (
            <SelectItem
              key={lang.code}
              value={lang.code}
              className="text-xs focus:bg-emerald-800 focus:text-white hover:bg-slate-800 text-slate-200 cursor-pointer py-1.5 px-2.5 rounded-lg"
            >
              <div className="flex items-center justify-between w-full gap-2">
                <span className="font-semibold">{lang.nativeName || lang.name}</span>
                {lang.nativeName && lang.nativeName !== lang.name && (
                  <span className="text-[10px] text-slate-400">({lang.name})</span>
                )}
              </div>
            </SelectItem>
          ))}
        </SelectContent>
      </Select>
    </div>
  );
}

export { LanguageSelector, LANGUAGES };
export default LanguageSelector;
