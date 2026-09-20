import React, { useState, useContext } from 'react';
import { AppContext } from '@/contexts/AppContext';
import { SUPPORTED_LANGUAGES, LanguageMetadata, getLocalizedText, translateFoodName } from '@shared/translationUtils';
import { Language } from '@shared/schema';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
  DialogDescription
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Globe, Search, Check, Sparkles, Languages, ArrowRight, ShieldCheck, Tag } from 'lucide-react';

interface MultiLanguageInstantTesterProps {
  trigger?: React.ReactNode;
  isOpen?: boolean;
  onOpenChange?: (open: boolean) => void;
}

export function MultiLanguageInstantTester({
  trigger,
  isOpen,
  onOpenChange
}: MultiLanguageInstantTesterProps) {
  const { language, setLanguage, foods } = useContext(AppContext);
  const [internalOpen, setInternalOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [categoryFilter, setCategoryFilter] = useState<'all' | 'indian' | 'global'>('all');

  const open = isOpen !== undefined ? isOpen : internalOpen;
  const setOpen = onOpenChange !== undefined ? onOpenChange : setInternalOpen;

  const currentLangMeta = SUPPORTED_LANGUAGES.find((l: LanguageMetadata) => l.code === language) || SUPPORTED_LANGUAGES[0];

  // Sample food item for live preview
  const sampleFood = foods?.[0] || {
    id: 'sample_mango',
    name: {
      en: 'Alphonso Mango',
      hi: 'हापुस आम (Alphonso Mango)',
      ta: 'அல்போன்சா மாம்பழம் (Alphonso Mango)',
      te: 'ఆల్ఫోన్సో మామిడి',
      bn: 'আলফনসো আম',
      mr: 'हापूस आंबा',
      gu: 'હાફૂસ કેરી',
      kn: 'ಅಲ್ಫೋನ್ಸೋ ಮಾವು',
      ml: 'അൽഫോൻസോ മാമ്പഴം',
      es: 'Mango Alphonso',
      fr: 'Mangue Alphonso',
      de: 'Alphonso-Mango',
      ar: 'مانجو ألفونسو',
      zh: '阿尔芬索芒果',
      ja: 'アルフォンソマンゴー',
      ru: 'Манго Альфонсо'
    },
    category: ['Fruits', 'Indian Superfoods']
  };

  const filteredLanguages = SUPPORTED_LANGUAGES.filter((lang: LanguageMetadata) => {
    const query = searchQuery.toLowerCase().trim();
    const matchesSearch =
      !query ||
      lang.name.toLowerCase().includes(query) ||
      lang.nativeName.toLowerCase().includes(query) ||
      lang.code.toLowerCase().includes(query);

    if (!matchesSearch) return false;
    if (categoryFilter === 'indian') return lang.isIndianLanguage;
    if (categoryFilter === 'global') return !lang.isIndianLanguage;
    return true;
  });

  const handleSelectLanguage = (langCode: Language) => {
    setLanguage(langCode);
  };

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      {trigger ? (
        <DialogTrigger asChild>{trigger}</DialogTrigger>
      ) : (
        <Button
          variant="outline"
          size="sm"
          onClick={() => setOpen(true)}
          className="gap-1.5 h-8 text-xs font-semibold rounded-xl border-emerald-600/40 text-emerald-700 dark:text-emerald-300 hover:bg-emerald-50 dark:hover:bg-emerald-950/50"
        >
          <Languages className="w-3.5 h-3.5" />
          <span>45+ Languages Tester</span>
        </Button>
      )}

      <DialogContent className="max-w-3xl max-h-[90vh] overflow-hidden flex flex-col p-6 rounded-2xl bg-white dark:bg-slate-950 border border-slate-200 dark:border-slate-800 shadow-2xl">
        <DialogHeader className="pb-3 border-b border-slate-200 dark:border-slate-800">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <div className="p-2 bg-emerald-100 dark:bg-emerald-950 text-emerald-600 dark:text-emerald-400 rounded-xl">
                <Globe className="w-5 h-5" />
              </div>
              <div>
                <DialogTitle className="text-lg font-extrabold text-slate-900 dark:text-white flex items-center gap-2">
                  Multi-Language QA & Verification Tool
                  <Badge className="bg-emerald-600 text-white text-[10px] font-bold py-0.5">
                    {SUPPORTED_LANGUAGES.length} Supported Languages Active
                  </Badge>
                </DialogTitle>
                <DialogDescription className="text-xs text-slate-500 dark:text-slate-400">
                  Switch instantly between all 46 supported languages with zero page reload. Quality assurance diagnostic tool.
                </DialogDescription>
              </div>
            </div>
          </div>
        </DialogHeader>

        {/* Live Translation Preview Strip */}
        <div className="bg-slate-50 dark:bg-slate-900/80 rounded-xl p-3 border border-slate-200 dark:border-slate-800 mt-3">
          <div className="flex items-center justify-between text-[11px] font-semibold text-slate-500 mb-1.5">
            <span>Currently Active: <strong className="text-emerald-600 dark:text-emerald-400">{currentLangMeta.name} ({currentLangMeta.nativeName})</strong></span>
            <span className="font-mono uppercase text-[10px] bg-slate-200 dark:bg-slate-800 px-2 py-0.5 rounded">
              Direction: {currentLangMeta.direction.toUpperCase()}
            </span>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-2 text-xs">
            <div className="p-2 bg-white dark:bg-slate-950 rounded-lg border border-slate-200/80 dark:border-slate-800">
              <span className="text-[10px] uppercase font-bold text-slate-400 block mb-0.5">App Title</span>
              <p className="font-bold text-slate-900 dark:text-white truncate">
                {getLocalizedText('home.title', language)}
              </p>
            </div>
            <div className="p-2 bg-white dark:bg-slate-950 rounded-lg border border-slate-200/80 dark:border-slate-800">
              <span className="text-[10px] uppercase font-bold text-slate-400 block mb-0.5">Sample Food Name</span>
              <p className="font-bold text-slate-900 dark:text-white truncate">
                {translateFoodName(sampleFood as any, language)}
              </p>
            </div>
            <div className="p-2 bg-white dark:bg-slate-950 rounded-lg border border-slate-200/80 dark:border-slate-800">
              <span className="text-[10px] uppercase font-bold text-slate-400 block mb-0.5">Affiliate Ad Label</span>
              <p className="font-bold text-slate-900 dark:text-white truncate">
                {getLocalizedText('ad.amazon', language)}
              </p>
            </div>
          </div>
        </div>

        {/* Search & Tabs Filter */}
        <div className="flex flex-col sm:flex-row items-center gap-2 mt-3">
          <div className="relative flex-1 w-full">
            <Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
            <Input
              type="text"
              placeholder="Search by language (e.g. Hindi, தமிழ், French, Spanish, বাংলা)..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="pl-9 h-9 text-xs rounded-xl"
            />
          </div>

          <Tabs
            value={categoryFilter}
            onValueChange={(val: any) => setCategoryFilter(val)}
            className="w-full sm:w-auto"
          >
            <TabsList className="h-9 p-1 bg-slate-100 dark:bg-slate-900 rounded-xl grid grid-cols-3">
              <TabsTrigger value="all" className="text-xs px-3 py-1 rounded-lg">
                All ({SUPPORTED_LANGUAGES.length})
              </TabsTrigger>
              <TabsTrigger value="indian" className="text-xs px-3 py-1 rounded-lg">
                Indian (18)
              </TabsTrigger>
              <TabsTrigger value="global" className="text-xs px-3 py-1 rounded-lg">
                Global (28)
              </TabsTrigger>
            </TabsList>
          </Tabs>
        </div>

        {/* Language Grid */}
        <div className="flex-1 overflow-y-auto mt-3 pr-1">
          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-2">
            {filteredLanguages.map((lang: LanguageMetadata) => {
              const isSelected = language === lang.code;
              return (
                <button
                  key={lang.code}
                  type="button"
                  onClick={() => handleSelectLanguage(lang.code)}
                  className={`flex flex-col items-start p-2.5 rounded-xl border text-left transition-all duration-200 ${
                    isSelected
                      ? 'bg-emerald-50 dark:bg-emerald-950/60 border-emerald-500 shadow-xs ring-1 ring-emerald-500/50'
                      : 'bg-white dark:bg-slate-900/60 border-slate-200 dark:border-slate-800 hover:border-emerald-300 dark:hover:border-emerald-700'
                  }`}
                >
                  <div className="flex items-center justify-between w-full">
                    <span className="font-extrabold text-xs text-slate-900 dark:text-white truncate">
                      {lang.nativeName}
                    </span>
                    {isSelected ? (
                      <Check className="w-3.5 h-3.5 text-emerald-600 dark:text-emerald-400 shrink-0" />
                    ) : (
                      <span className="text-[10px] font-mono uppercase text-slate-400">{lang.code}</span>
                    )}
                  </div>
                  <div className="flex items-center justify-between w-full mt-1">
                    <span className="text-[11px] text-slate-500 dark:text-slate-400 truncate">
                      {lang.name}
                    </span>
                    {lang.direction === 'rtl' && (
                      <span className="text-[9px] font-bold px-1.5 py-0.2 bg-amber-100 dark:bg-amber-950 text-amber-700 dark:text-amber-400 rounded">
                        RTL
                      </span>
                    )}
                  </div>
                </button>
              );
            })}
          </div>

          {filteredLanguages.length === 0 && (
            <div className="py-12 text-center text-slate-400 text-xs">
              No language found matching "{searchQuery}"
            </div>
          )}
        </div>

        {/* Modal Footer */}
        <div className="pt-3 mt-3 border-t border-slate-200 dark:border-slate-800 flex items-center justify-between">
          <span className="text-xs text-slate-400">
            Click any language card to apply instantly
          </span>
          <Button
            size="sm"
            onClick={() => setOpen(false)}
            className="h-8 bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-bold rounded-xl px-4"
          >
            Done
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
}
