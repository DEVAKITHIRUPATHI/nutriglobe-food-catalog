import React, { useState, useEffect, useRef, useContext, useMemo, useCallback } from 'react';
import { useLocation } from 'wouter';
import { AppContext } from '@/contexts/AppContext';
import { useTranslation } from '@/hooks/useTranslation';
import type { FoodItemClient } from '@shared/schema';
import { foodItems as fallbackFoodCatalog } from '@shared/mockData';
import { 
  searchAndRankFoods, 
  buildZeroResultsPayload, 
  sanitizeSearchQuery,
  CANONICAL_FOOD_SEARCH_METADATA,
  type SearchMatchResult 
} from '@shared/foodSearchEngine';
import { 
  Search, X, Flame, Sparkles, ChevronRight, Apple, ArrowRight, 
  Mic, MicOff, AlertCircle, Dumbbell, Carrot, Wheat, Milk, Fish, HelpCircle
} from 'lucide-react';
import { Badge } from '@/components/ui/badge';

interface HeaderSearchBarProps {
  className?: string;
  isMobileDrawer?: boolean;
  onItemSelect?: () => void;
}

function FoodThumbnail({ imageUrl, name, category }: { imageUrl?: string; name: string; category?: string }) {
  const [hasError, setHasError] = useState(false);
  const isInvalidUrl = !imageUrl || imageUrl.trim() === '' || imageUrl.includes('placeholder') || imageUrl.includes('undefined');

  if (isInvalidUrl || hasError) {
    const cat = (category || '').toLowerCase();
    let IconComponent = Apple;
    if (cat.includes('veg') || cat.includes('herb')) IconComponent = Carrot;
    else if (cat.includes('grain') || cat.includes('cereal') || cat.includes('wheat') || cat.includes('rice')) IconComponent = Wheat;
    else if (cat.includes('dairy') || cat.includes('milk') || cat.includes('cheese')) IconComponent = Milk;
    else if (cat.includes('fish') || cat.includes('sea') || cat.includes('salmon')) IconComponent = Fish;
    else if (cat.includes('meat') || cat.includes('poultry') || cat.includes('protein')) IconComponent = Dumbbell;

    return (
      <div 
        className="w-10 h-10 rounded-xl bg-slate-800/90 border border-slate-700/70 shrink-0 flex items-center justify-center text-emerald-400/80 shadow-inner"
        aria-label={`Image placeholder for ${name}`}
      >
        <IconComponent className="w-5 h-5" aria-hidden="true" />
      </div>
    );
  }

  return (
    <div className="w-10 h-10 rounded-xl bg-slate-800 border border-slate-700/70 overflow-hidden shrink-0 flex items-center justify-center">
      <img
        src={imageUrl}
        alt={name}
        className="w-full h-full object-cover transition-opacity duration-200"
        loading="lazy"
        onError={() => setHasError(true)}
      />
    </div>
  );
}

export function HeaderSearchBar({ className = '', isMobileDrawer = false, onItemSelect }: HeaderSearchBarProps) {
  const { foods, language } = useContext(AppContext);
  const { getLocalizedText } = useTranslation();
  const [, setLocation] = useLocation();

  const [query, setQuery] = useState('');
  const [isOpen, setIsOpen] = useState(false);
  const [selectedIndex, setSelectedIndex] = useState<number>(-1);
  const [isListening, setIsListening] = useState(false);
  const [voiceError, setVoiceError] = useState<string | null>(null);

  const containerRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);
  const speechRecognitionRef = useRef<any>(null);

  // Global shortcut (Ctrl+K, Cmd+K, or / when not typing)
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      const target = e.target as HTMLElement;
      const isInput = target.tagName === 'INPUT' || target.tagName === 'TEXTAREA' || target.isContentEditable;

      if ((e.metaKey || e.ctrlKey) && e.key.toLowerCase() === 'k') {
        e.preventDefault();
        inputRef.current?.focus();
        setIsOpen(true);
      } else if (e.key === '/' && !isInput) {
        e.preventDefault();
        inputRef.current?.focus();
        setIsOpen(true);
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, []);

  // Close dropdown on click outside or tabbing away
  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (containerRef.current && !containerRef.current.contains(e.target as Node)) {
        setIsOpen(false);
      }
    };

    const handleFocusOutside = (e: FocusEvent) => {
      if (containerRef.current && !containerRef.current.contains(e.target as Node)) {
        setIsOpen(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    document.addEventListener('focusin', handleFocusOutside);
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
      document.removeEventListener('focusin', handleFocusOutside);
    };
  }, []);

  // Map app language code to BCP-47 speech recognition locale
  const getSpeechLocale = useCallback((langCode: string): string => {
    const map: Record<string, string> = {
      en: 'en-US',
      hi: 'hi-IN',
      ta: 'ta-IN',
      te: 'te-IN',
      kn: 'kn-IN',
      ml: 'ml-IN',
      bn: 'bn-IN',
      mr: 'mr-IN',
      gu: 'gu-IN',
      pa: 'pa-IN',
      ur: 'ur-IN',
      es: 'es-ES',
      fr: 'fr-FR',
      de: 'de-DE',
      ar: 'ar-SA',
      ru: 'ru-RU',
      pt: 'pt-BR',
      zh: 'zh-CN',
      ja: 'ja-JP'
    };
    return map[langCode] || 'en-US';
  }, []);

  // Web Speech API Voice Search
  const toggleVoiceSearch = useCallback(() => {
    const SpeechRecognition = (window as any).SpeechRecognition || (window as any).webkitSpeechRecognition;

    if (!SpeechRecognition) {
      setVoiceError('Speech recognition is not supported in this browser. Please type to search.');
      setTimeout(() => setVoiceError(null), 4000);
      return;
    }

    if (isListening && speechRecognitionRef.current) {
      speechRecognitionRef.current.stop();
      setIsListening(false);
      return;
    }

    try {
      setVoiceError(null);
      const recognition = new SpeechRecognition();
      recognition.continuous = false;
      recognition.interimResults = false;
      recognition.lang = getSpeechLocale(language);

      recognition.onstart = () => {
        setIsListening(true);
      };

      recognition.onresult = (event: any) => {
        const transcript = event.results?.[0]?.[0]?.transcript;
        if (transcript) {
          const sanitized = sanitizeSearchQuery(transcript);
          setQuery(sanitized);
          setIsOpen(true);
          setSelectedIndex(-1);
          // Focus input
          inputRef.current?.focus();
        }
        setIsListening(false);
      };

      recognition.onerror = (event: any) => {
        console.warn('Speech recognition error:', event.error);
        setIsListening(false);
        if (event.error === 'not-allowed') {
          setVoiceError('Microphone access was denied. Please allow microphone permissions.');
        } else if (event.error === 'no-speech') {
          setVoiceError('No speech detected. Please try speaking again.');
        } else {
          setVoiceError('Voice recognition error. Please try again.');
        }
        setTimeout(() => setVoiceError(null), 4000);
      };

      recognition.onend = () => {
        setIsListening(false);
      };

      speechRecognitionRef.current = recognition;
      recognition.start();
    } catch (err: any) {
      console.warn('Failed to start speech recognition:', err);
      setIsListening(false);
      setVoiceError('Could not start voice search. Please try typing.');
      setTimeout(() => setVoiceError(null), 4000);
    }
  }, [isListening, language, getSpeechLocale]);

  // Clean up speech recognition on unmount
  useEffect(() => {
    return () => {
      if (speechRecognitionRef.current) {
        try {
          speechRecognitionRef.current.stop();
        } catch {}
      }
    };
  }, []);

  // Filtered and ranked matching foods using Universal Food Search Engine
  const { results: rankedResults, intent, suggestedSpelling } = useMemo(() => {
    const cleanQ = sanitizeSearchQuery(query);
    if (!cleanQ) return { results: [], intent: { isNutrientQuery: false } };

    const catalog = foods && foods.length > 0 ? foods : (fallbackFoodCatalog as FoodItemClient[]);
    return searchAndRankFoods(catalog, cleanQ, language, 8);
  }, [foods, query, language]);

  const filteredFoods = useMemo(() => rankedResults.map(r => r.item), [rankedResults]);

  // Zero-results recommendation payload
  const zeroResultsPayload = useMemo(() => {
    if (query.trim().length > 0 && filteredFoods.length === 0) {
      return buildZeroResultsPayload(query);
    }
    return null;
  }, [query, filteredFoods.length]);

  // Log search query telemetry (non-blocking)
  const logSearchTelemetry = useCallback((searchQuery: string, resultCount: number, selectedFoodId?: string) => {
    try {
      fetch('/api/analytics/search', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          query: searchQuery,
          language,
          resultCount,
          selectedFoodId
        })
      }).catch(() => {});
    } catch {}
  }, [language]);

  const handleSelectFood = (food: FoodItemClient) => {
    logSearchTelemetry(query, filteredFoods.length, food.id);
    setLocation(`/food/${food.id}`);
    setQuery('');
    setIsOpen(false);
    onItemSelect?.();
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (!isOpen || filteredFoods.length === 0) {
      if (e.key === 'Enter' && query.trim()) {
        logSearchTelemetry(query, filteredFoods.length);
        setLocation(`/foods?search=${encodeURIComponent(query.trim())}`);
        setIsOpen(false);
        onItemSelect?.();
      }
      return;
    }

    if (e.key === 'ArrowDown') {
      e.preventDefault();
      setSelectedIndex((prev) => (prev < filteredFoods.length - 1 ? prev + 1 : 0));
    } else if (e.key === 'ArrowUp') {
      e.preventDefault();
      setSelectedIndex((prev) => (prev > 0 ? prev - 1 : filteredFoods.length - 1));
    } else if (e.key === 'Enter') {
      e.preventDefault();
      if (selectedIndex >= 0 && selectedIndex < filteredFoods.length) {
        handleSelectFood(filteredFoods[selectedIndex]);
      } else if (query.trim()) {
        logSearchTelemetry(query, filteredFoods.length);
        setLocation(`/foods?search=${encodeURIComponent(query.trim())}`);
        setIsOpen(false);
        onItemSelect?.();
      }
    } else if (e.key === 'Escape') {
      setIsOpen(false);
      inputRef.current?.blur();
    }
  };

  const handleCategoryChipClick = (catId: string) => {
    setLocation(`/foods?category=${encodeURIComponent(catId)}`);
    setIsOpen(false);
    onItemSelect?.();
  };

  const handlePopularFoodClick = (foodId: string) => {
    setLocation(`/food/${foodId}`);
    setIsOpen(false);
    setQuery('');
    onItemSelect?.();
  };

  return (
    <div ref={containerRef} className={`relative ${className}`}>
      {/* Search Input Bar */}
      <div className="relative flex items-center">
        <Search className="absolute left-3 w-4 h-4 text-emerald-300/70 pointer-events-none" />
        <input
          ref={inputRef}
          type="text"
          value={query}
          onChange={(e) => {
            setQuery(e.target.value);
            setIsOpen(true);
            setSelectedIndex(-1);
          }}
          onFocus={() => {
            if (query.trim()) setIsOpen(true);
          }}
          onKeyDown={handleKeyDown}
          placeholder={
            isListening 
              ? "Listening... Speak food name now" 
              : (isMobileDrawer ? "Search 1,300+ foods, fruits, grains..." : "Search foods, Tamil, Hindi, nutrients...")
          }
          aria-label="Search foods from database"
          className={`w-full pl-9 pr-20 py-1.5 bg-emerald-950/70 hover:bg-emerald-950/90 focus:bg-emerald-950 text-white placeholder-emerald-300/60 text-xs sm:text-sm rounded-xl border ${
            isListening 
              ? 'border-rose-400 ring-2 ring-rose-400/40 animate-pulse' 
              : 'border-emerald-700/60 focus:border-emerald-400 focus:ring-2 focus:ring-emerald-400/30'
          } transition-all shadow-inner ${
            isMobileDrawer ? 'py-2.5 text-sm' : ''
          }`}
        />

        {/* Right Controls: Clear, Voice Search Microphone, Keyboard Hint */}
        <div className="absolute right-2 flex items-center gap-1">
          {/* Voice Search (Web Speech API) */}
          <button
            type="button"
            onClick={toggleVoiceSearch}
            className={`p-1.5 rounded-lg transition-all ${
              isListening 
                ? 'bg-rose-500 text-white shadow-lg shadow-rose-900/50 animate-bounce' 
                : 'text-emerald-300 hover:text-white hover:bg-emerald-800/60'
            }`}
            title={isListening ? "Listening... Click to stop" : "Search by Voice (Web Speech API)"}
            aria-label="Voice search microphone"
          >
            {isListening ? (
              <MicOff className="w-3.5 h-3.5" />
            ) : (
              <Mic className="w-3.5 h-3.5" />
            )}
          </button>

          {/* Clear query button */}
          {query ? (
            <button
              type="button"
              onClick={() => {
                setQuery('');
                setIsOpen(false);
                inputRef.current?.focus();
              }}
              className="p-1 rounded-md text-emerald-300 hover:text-white hover:bg-emerald-800/60 transition-colors"
              title="Clear search"
            >
              <X className="w-3.5 h-3.5" />
            </button>
          ) : !isMobileDrawer ? (
            <span className="hidden xl:inline-flex items-center px-1.5 py-0.5 text-[10px] font-bold text-emerald-300/70 bg-emerald-900/60 rounded border border-emerald-700/40 pointer-events-none">
              ⌘K
            </span>
          ) : null}
        </div>
      </div>

      {/* Voice Error Notification Banner */}
      {voiceError && (
        <div className="absolute left-0 right-0 top-full mt-1 p-2 bg-rose-950/95 border border-rose-500/50 text-rose-200 text-xs rounded-xl shadow-xl z-50 flex items-center gap-1.5 animate-in fade-in duration-150">
          <AlertCircle className="w-4 h-4 text-rose-400 shrink-0" />
          <span>{voiceError}</span>
        </div>
      )}

      {/* Dropdown Live Results */}
      {isOpen && query.trim().length > 0 && (
        <div className="absolute left-0 right-0 top-full mt-1.5 bg-slate-900/95 backdrop-blur-xl border border-emerald-600/40 rounded-2xl shadow-2xl overflow-hidden z-50 animate-in fade-in slide-in-from-top-2 duration-150">
          {/* Header Bar */}
          <div className="p-2 border-b border-slate-800 flex items-center justify-between text-[11px] text-slate-400">
            <span className="flex items-center gap-1 font-semibold text-emerald-400">
              <Sparkles className="w-3 h-3 text-emerald-400" />
              {intent.isNutrientQuery ? (
                <span>Nutrient Discovery: {intent.nutrientFilter || 'Custom Filter'}</span>
              ) : filteredFoods.length > 0 ? (
                `${filteredFoods.length} Matching Foods`
              ) : (
                'No direct matches'
              )}
            </span>
            <span className="text-[10px] text-slate-500">
              Use ↑↓ to navigate, Enter to select
            </span>
          </div>

          <div className="max-h-80 overflow-y-auto divide-y divide-slate-800/60">
            {filteredFoods.length > 0 ? (
              rankedResults.map(({ item, matchType, confidence }, index) => {
                const engName = typeof item.name === 'string' ? item.name : item.name?.en || item.id;
                let localizedName = typeof item.name === 'object' && item.name?.[language] && item.name[language] !== engName
                  ? item.name[language]
                  : null;

                if (!localizedName && language !== 'en') {
                  const meta = CANONICAL_FOOD_SEARCH_METADATA[item.id];
                  if (meta?.multilingual?.[language]?.[0]) {
                    localizedName = meta.multilingual[language]![0];
                  }
                }

                const isSelected = index === selectedIndex;
                const primaryCategory = item.category?.[0] || 'Whole Food';

                return (
                  <button
                    key={item.id}
                    type="button"
                    onClick={() => handleSelectFood(item)}
                    onMouseEnter={() => setSelectedIndex(index)}
                    className={`w-full text-left p-2.5 sm:p-3 flex items-center gap-3 transition-colors ${
                      isSelected ? 'bg-emerald-900/40 text-white' : 'hover:bg-slate-800/60 text-slate-200'
                    }`}
                  >
                    {/* Food Thumbnail Image with guaranteed fallback */}
                    <FoodThumbnail 
                      imageUrl={item.imageUrl} 
                      name={engName} 
                      category={primaryCategory} 
                    />

                    {/* Food Name & Localized Name */}
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-1.5 flex-wrap">
                        <span className="font-bold text-xs sm:text-sm text-white truncate">
                          {engName}
                        </span>
                        {localizedName && (
                          <span className="text-[11px] text-emerald-400 font-medium truncate">
                            ({localizedName})
                          </span>
                        )}
                        <Badge variant="outline" className="text-[9px] px-1.5 py-0 h-4 border-emerald-500/30 text-emerald-300 bg-emerald-950/40 shrink-0">
                          {primaryCategory}
                        </Badge>
                        {matchType === 'fuzzy' && (
                          <span className="text-[9px] bg-amber-500/20 text-amber-300 px-1 rounded border border-amber-500/30">
                            Typo Match ({Math.round(confidence * 100)}%)
                          </span>
                        )}
                        {matchType === 'scientific' && (
                          <span className="text-[9px] bg-indigo-500/20 text-indigo-300 px-1 rounded border border-indigo-500/30">
                            Scientific
                          </span>
                        )}
                      </div>

                      {/* Macronutrient Preview */}
                      <div className="flex items-center gap-3 mt-0.5 text-[11px] text-slate-400">
                        {item.nutrition?.calories !== undefined && (
                          <span className="flex items-center gap-0.5 text-amber-400/90 font-semibold">
                            <Flame className="w-3 h-3 text-amber-400" />
                            {item.nutrition.calories} kcal
                          </span>
                        )}
                        {item.nutrition?.protein !== undefined && (
                          <span className="text-sky-400">
                            {item.nutrition.protein}g protein
                          </span>
                        )}
                        {item.nutrition?.fiber !== undefined && (
                          <span className="text-emerald-400">
                            {item.nutrition.fiber}g fiber
                          </span>
                        )}
                        <span className="text-slate-500 text-[10px]">
                          per 100g
                        </span>
                      </div>
                    </div>

                    <ChevronRight className="w-4 h-4 text-slate-500 shrink-0" />
                  </button>
                );
              })
            ) : zeroResultsPayload ? (
              /* Rich Zero-Results Experience */
              <div className="p-4 sm:p-5 text-slate-300 space-y-4">
                <div className="text-center">
                  <Apple className="w-8 h-8 text-slate-600 mx-auto mb-1.5 opacity-60" />
                  <p className="text-xs sm:text-sm font-semibold text-white">
                    No foods found matching "{query}"
                  </p>
                  <p className="text-[11px] text-slate-400 mt-0.5">
                    We couldn't locate an exact record with this term.
                  </p>
                </div>

                {/* Did You Mean Spelling Suggestion */}
                {(suggestedSpelling || zeroResultsPayload.suggestedSpelling) && (
                  <div className="p-2.5 bg-emerald-950/40 border border-emerald-500/30 rounded-xl flex items-center justify-between text-xs">
                    <span className="text-slate-300 flex items-center gap-1.5">
                      <HelpCircle className="w-4 h-4 text-emerald-400 shrink-0" />
                      Did you mean:
                    </span>
                    <button
                      type="button"
                      onClick={() => {
                        const word = suggestedSpelling || zeroResultsPayload.suggestedSpelling;
                        if (word) {
                          setQuery(word);
                          inputRef.current?.focus();
                        }
                      }}
                      className="text-emerald-300 hover:text-white font-bold underline transition-colors"
                    >
                      {suggestedSpelling || zeroResultsPayload.suggestedSpelling}
                    </button>
                  </div>
                )}

                {/* Popular Food Suggestions */}
                <div>
                  <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400 block mb-1.5">
                    Popular Searches
                  </span>
                  <div className="flex flex-wrap gap-1.5">
                    {zeroResultsPayload.popularFoods.map(pf => (
                      <button
                        key={pf.id}
                        type="button"
                        onClick={() => handlePopularFoodClick(pf.id)}
                        className="px-2.5 py-1 bg-slate-800 hover:bg-emerald-900/60 text-slate-200 hover:text-white rounded-lg text-xs font-medium border border-slate-700/60 hover:border-emerald-500/50 transition-all flex items-center gap-1"
                      >
                        <span>{pf.name}</span>
                      </button>
                    ))}
                  </div>
                </div>

                {/* Quick Categories */}
                <div>
                  <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400 block mb-1.5">
                    Browse Categories
                  </span>
                  <div className="flex flex-wrap gap-1.5">
                    {zeroResultsPayload.suggestedCategories.map(cat => (
                      <button
                        key={cat.id}
                        type="button"
                        onClick={() => handleCategoryChipClick(cat.id)}
                        className="px-2.5 py-1 bg-emerald-950/50 hover:bg-emerald-800/60 text-emerald-200 hover:text-white rounded-lg text-xs font-medium border border-emerald-700/40 transition-all"
                      >
                        {cat.name}
                      </button>
                    ))}
                  </div>
                </div>
              </div>
            ) : null}
          </div>

          {/* View Full Catalog Search Link */}
          {query.trim().length > 0 && (
            <div className="p-2 bg-slate-950/90 border-t border-slate-800 text-center">
              <button
                type="button"
                onClick={() => {
                  logSearchTelemetry(query, filteredFoods.length);
                  setLocation(`/foods?search=${encodeURIComponent(query.trim())}`);
                  setIsOpen(false);
                  onItemSelect?.();
                }}
                className="w-full py-1.5 px-3 bg-emerald-600 hover:bg-emerald-500 text-white rounded-xl text-xs font-bold transition-all flex items-center justify-center gap-1.5 shadow-md shadow-emerald-900/40"
              >
                <span>View all results for "{query}"</span>
                <ArrowRight className="w-3.5 h-3.5" />
              </button>
            </div>
          )}
        </div>
      )}
    </div>
  );
}
