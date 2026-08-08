import { useState, useEffect, useContext } from 'react';
import { useTranslation } from '@/hooks/useTranslation';
import { AppContext } from '@/contexts/AppContext';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Tabs, TabsList, TabsTrigger, TabsContent } from '@/components/ui/tabs';
import { 
  Search, Apple, Carrot, Wheat, Utensils, Milk, Fish, Drumstick, Egg, Globe, 
  Heart, Leaf, Dumbbell, Star, Filter, Flame, AlertCircle, ChefHat, Sparkles, Send, Loader2
} from 'lucide-react';
import type { FilterCategory, SearchFilters } from '@/types';
import { foodItems } from '@shared/mockData';
import { matchesCategory } from '@/lib/categoryUtils';

interface SearchFilterProps {
  onSearch: (filters: SearchFilters) => void;
}

export function SearchFilter({ onSearch }: SearchFilterProps) {
  const { getLocalizedText } = useTranslation();
  const { foods: contextFoods } = useContext(AppContext);
  const [query, setQuery] = useState('');
  const [category, setCategory] = useState<FilterCategory>('all');
  const [activeTab, setActiveTab] = useState('food-types');
  const [aiPrompt, setAiPrompt] = useState('');
  const [isAiSearching, setIsAiSearching] = useState(false);

  const activeCatalog = (contextFoods && contextFoods.length > 0) ? contextFoods : foodItems;

  // Compute category counts dynamically directly from active database data
  const getCategoryCount = (cat: string) => {
    if (cat === 'all') return activeCatalog.length;
    return activeCatalog.filter(item => matchesCategory(item, cat)).length;
  };

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    onSearch({ query, category });
  };

  const handleFilterClick = (newCategory: FilterCategory) => {
    setCategory(newCategory);
    onSearch({ query, category: newCategory });
  };

  const handleAiSearch = async (promptOverride?: string) => {
    const textToSearch = promptOverride || aiPrompt;
    if (!textToSearch.trim()) return;

    try {
      setIsAiSearching(true);
      const res = await fetch('/api/ai/advanced-search', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ prompt: textToSearch })
      });
      const data = await res.json();
      if (data.interpretedCategory) {
        setCategory(data.interpretedCategory as FilterCategory);
        setQuery(data.interpretedQuery || '');
        onSearch({ query: data.interpretedQuery || '', category: data.interpretedCategory as FilterCategory });
      }
    } catch (err) {
      console.error(err);
    } finally {
      setIsAiSearching(false);
    }
  };

  return (
    <section className="mb-8 space-y-4">
      {/* Search Input Bar */}
      <form onSubmit={handleSearch} className="relative w-full md:max-w-xl mx-auto">
        <Input 
          type="text" 
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          className="w-full pl-11 pr-24 py-3 rounded-full text-sm border-emerald-200 dark:border-emerald-900 shadow-sm hover:border-emerald-400 focus:border-emerald-500 transition-all duration-200"
          placeholder="Search food by name, regional name, or nutrient..."
        />
        <Search className="absolute left-4 top-3.5 h-4 w-4 text-emerald-600" />
        <Button 
          type="submit" 
          size="sm"
          className="absolute right-1.5 top-1.5 bg-emerald-600 hover:bg-emerald-700 text-white rounded-full px-4 text-xs h-8"
        >
          Search
        </Button>
      </form>

      {/* 9 Main Category Navigation Tabs */}
      <Tabs defaultValue="food-types" value={activeTab} onValueChange={setActiveTab} className="w-full">
        <TabsList className="flex flex-wrap w-full gap-1 p-1 bg-gray-100 dark:bg-gray-800 rounded-xl overflow-x-auto">
          <TabsTrigger value="food-types" className="flex-1 text-xs py-2 px-3 hover:scale-[1.02] transition-transform">
            🍎 Food Types
          </TabsTrigger>
          <TabsTrigger value="regional" className="flex-1 text-xs py-2 px-3 hover:scale-[1.02] transition-transform">
            🌍 Regional
          </TabsTrigger>
          <TabsTrigger value="dietary" className="flex-1 text-xs py-2 px-3 hover:scale-[1.02] transition-transform">
            🌿 Dietary
          </TabsTrigger>
          <TabsTrigger value="nutritional" className="flex-1 text-xs py-2 px-3 hover:scale-[1.02] transition-transform">
            🧬 Nutritional
          </TabsTrigger>
          <TabsTrigger value="health-goals" className="flex-1 text-xs py-2 px-3 hover:scale-[1.02] transition-transform">
            ❤️ Health Goals
          </TabsTrigger>
          <TabsTrigger value="allergens" className="flex-1 text-xs py-2 px-3 hover:scale-[1.02] transition-transform">
            ⚠️ Allergens
          </TabsTrigger>
          <TabsTrigger value="preparation" className="flex-1 text-xs py-2 px-3 hover:scale-[1.02] transition-transform">
            🍳 Preparation
          </TabsTrigger>
          <TabsTrigger value="meals" className="flex-1 text-xs py-2 px-3 hover:scale-[1.02] transition-transform">
            🍽️ Meals
          </TabsTrigger>
          <TabsTrigger value="ai-search" className="flex-1 text-xs py-2 px-3 hover:scale-[1.02] transition-transform text-emerald-600 font-bold">
            🔍 AI Search
          </TabsTrigger>
        </TabsList>

        {/* 1. Food Types */}
        <TabsContent value="food-types" className="pt-3">
          <div className="flex flex-wrap gap-2">
            <FilterButton active={category === 'all'} count={getCategoryCount('all')} onClick={() => handleFilterClick('all')}>
              All Foods
            </FilterButton>
            <FilterButton active={category === 'fruits'} count={getCategoryCount('fruits')} onClick={() => handleFilterClick('fruits')}>
              Fruits
            </FilterButton>
            <FilterButton active={category === 'vegetables'} count={getCategoryCount('vegetables')} onClick={() => handleFilterClick('vegetables')}>
              Vegetables
            </FilterButton>
            <FilterButton active={category === 'grains'} count={getCategoryCount('grains')} onClick={() => handleFilterClick('grains')}>
              Grains
            </FilterButton>
            <FilterButton active={category === 'spices'} count={getCategoryCount('spices')} onClick={() => handleFilterClick('spices')}>
              Spices
            </FilterButton>
            <FilterButton active={category === 'dairy'} count={getCategoryCount('dairy')} onClick={() => handleFilterClick('dairy')}>
              Dairy
            </FilterButton>
            <FilterButton active={category === 'seafood'} count={getCategoryCount('seafood')} onClick={() => handleFilterClick('seafood')}>
              Seafood
            </FilterButton>
            <FilterButton active={category === 'meat'} count={getCategoryCount('meat')} onClick={() => handleFilterClick('meat')}>
              Meat
            </FilterButton>
            <FilterButton active={category === 'poultry'} count={getCategoryCount('poultry')} onClick={() => handleFilterClick('poultry')}>
              Poultry
            </FilterButton>
            <FilterButton active={category === 'nuts'} count={getCategoryCount('nuts')} onClick={() => handleFilterClick('nuts')}>
              Nuts
            </FilterButton>
            <FilterButton active={category === 'seeds'} count={getCategoryCount('seeds')} onClick={() => handleFilterClick('seeds')}>
              Seeds
            </FilterButton>
            <FilterButton active={category === 'legumes'} count={getCategoryCount('legumes')} onClick={() => handleFilterClick('legumes')}>
              Legumes
            </FilterButton>
          </div>
        </TabsContent>

        {/* 2. Regional */}
        <TabsContent value="regional" className="pt-3">
          <div className="flex flex-wrap gap-2">
            <FilterButton active={category === 'all'} count={getCategoryCount('all')} onClick={() => handleFilterClick('all')}>
              All Regions
            </FilterButton>
            <FilterButton active={category === 'indian'} count={getCategoryCount('indian')} onClick={() => handleFilterClick('indian')}>
              Indian Subcontinent
            </FilterButton>
            <FilterButton active={category === 'asian'} count={getCategoryCount('asian')} onClick={() => handleFilterClick('asian')}>
              East & Southeast Asian
            </FilterButton>
            <FilterButton active={category === 'mediterranean'} count={getCategoryCount('mediterranean')} onClick={() => handleFilterClick('mediterranean')}>
              Mediterranean
            </FilterButton>
            <FilterButton active={category === 'european'} count={getCategoryCount('european')} onClick={() => handleFilterClick('european')}>
              European
            </FilterButton>
            <FilterButton active={category === 'american'} count={getCategoryCount('american')} onClick={() => handleFilterClick('american')}>
              American
            </FilterButton>
          </div>
        </TabsContent>

        {/* 3. Dietary */}
        <TabsContent value="dietary" className="pt-3">
          <div className="flex flex-wrap gap-2">
            <FilterButton active={category === 'all'} count={getCategoryCount('all')} onClick={() => handleFilterClick('all')}>
              All Diets
            </FilterButton>
            <FilterButton active={category === 'vegan'} count={getCategoryCount('vegan')} onClick={() => handleFilterClick('vegan')}>
              Vegan
            </FilterButton>
            <FilterButton active={category === 'vegetarian'} count={getCategoryCount('vegetarian')} onClick={() => handleFilterClick('vegetarian')}>
              Vegetarian
            </FilterButton>
            <FilterButton active={category === 'gluten-free'} count={getCategoryCount('gluten-free')} onClick={() => handleFilterClick('gluten-free')}>
              Gluten-Free
            </FilterButton>
            <FilterButton active={category === 'keto'} count={getCategoryCount('keto')} onClick={() => handleFilterClick('keto')}>
              Keto
            </FilterButton>
          </div>
        </TabsContent>

        {/* 4. Nutritional */}
        <TabsContent value="nutritional" className="pt-3">
          <div className="flex flex-wrap gap-2">
            <FilterButton active={category === 'high_protein'} count={getCategoryCount('high_protein')} onClick={() => handleFilterClick('high_protein')}>
              High Protein (&gt;10g)
            </FilterButton>
            <FilterButton active={category === 'high_fiber'} count={getCategoryCount('high_fiber')} onClick={() => handleFilterClick('high_fiber')}>
              High Fiber (&gt;4g)
            </FilterButton>
            <FilterButton active={category === 'high_vitamin_c'} count={getCategoryCount('high_vitamin_c')} onClick={() => handleFilterClick('high_vitamin_c')}>
              Vitamin C Rich
            </FilterButton>
            <FilterButton active={category === 'high_iron'} count={getCategoryCount('high_iron')} onClick={() => handleFilterClick('high_iron')}>
              Iron Rich
            </FilterButton>
          </div>
        </TabsContent>

        {/* 5. Health Goals */}
        <TabsContent value="health-goals" className="pt-3">
          <div className="flex flex-wrap gap-2">
            <FilterButton active={category === 'muscle'} count={getCategoryCount('muscle')} onClick={() => handleFilterClick('muscle')}>
              Muscle Recovery & Repair
            </FilterButton>
            <FilterButton active={category === 'immunity'} count={getCategoryCount('immunity')} onClick={() => handleFilterClick('immunity')}>
              Immunity Boost
            </FilterButton>
            <FilterButton active={category === 'gut'} count={getCategoryCount('gut')} onClick={() => handleFilterClick('gut')}>
              Gut Health & Digestion
            </FilterButton>
            <FilterButton active={category === 'energy'} count={getCategoryCount('energy')} onClick={() => handleFilterClick('energy')}>
              Energy & Hemoglobin Support
            </FilterButton>
          </div>
        </TabsContent>

        {/* 6. Allergens */}
        <TabsContent value="allergens" className="pt-3">
          <div className="flex flex-wrap gap-2">
            <FilterButton active={category === 'dairy-free'} count={getCategoryCount('dairy-free')} onClick={() => handleFilterClick('dairy-free')}>
              Dairy-Free
            </FilterButton>
            <FilterButton active={category === 'nut-free'} count={getCategoryCount('nut-free')} onClick={() => handleFilterClick('nut-free')}>
              Nut-Free Options
            </FilterButton>
            <FilterButton active={category === 'soy-free'} count={getCategoryCount('soy-free')} onClick={() => handleFilterClick('soy-free')}>
              Soy-Free
            </FilterButton>
            <FilterButton active={category === 'gluten-free'} count={getCategoryCount('gluten-free')} onClick={() => handleFilterClick('gluten-free')}>
              Gluten-Free
            </FilterButton>
          </div>
        </TabsContent>

        {/* 7. Preparation */}
        <TabsContent value="preparation" className="pt-3">
          <div className="flex flex-wrap gap-2">
            <FilterButton active={category === 'raw'} count={getCategoryCount('raw')} onClick={() => handleFilterClick('raw')}>
              Raw & Fresh
            </FilterButton>
            <FilterButton active={category === 'boiled'} count={getCategoryCount('boiled')} onClick={() => handleFilterClick('boiled')}>
              Boiled & Steamed
            </FilterButton>
            <FilterButton active={category === 'dried'} count={getCategoryCount('dried')} onClick={() => handleFilterClick('dried')}>
              Sun-Dried & Ground
            </FilterButton>
            <FilterButton active={category === 'fermented'} count={getCategoryCount('fermented')} onClick={() => handleFilterClick('fermented')}>
              Fermented & Cultured
            </FilterButton>
          </div>
        </TabsContent>

        {/* 8. Meals */}
        <TabsContent value="meals" className="pt-3">
          <div className="flex flex-wrap gap-2">
            <FilterButton active={category === 'breakfast'} count={getCategoryCount('breakfast')} onClick={() => handleFilterClick('breakfast')}>
              Breakfast & Smoothies
            </FilterButton>
            <FilterButton active={category === 'lunch'} count={getCategoryCount('lunch')} onClick={() => handleFilterClick('lunch')}>
              Lunch Bowls & Curries
            </FilterButton>
            <FilterButton active={category === 'snack'} count={getCategoryCount('snack')} onClick={() => handleFilterClick('snack')}>
              Healthy Snacks
            </FilterButton>
            <FilterButton active={category === 'dinner'} count={getCategoryCount('dinner')} onClick={() => handleFilterClick('dinner')}>
              Dinner & Soups
            </FilterButton>
          </div>
        </TabsContent>

        {/* 9. Gemini Natural Language Search */}
        <TabsContent value="ai-search" className="pt-3">
          <div className="p-4 bg-emerald-50/70 dark:bg-emerald-950/30 border border-emerald-200 dark:border-emerald-800 rounded-xl space-y-3">
            <div className="flex items-center gap-2 text-xs font-semibold text-emerald-800 dark:text-emerald-300">
              <Sparkles className="h-4 w-4 text-emerald-600" /> Natural-Language Gemini Search:
            </div>
            <div className="flex gap-2">
              <Input
                type="text"
                placeholder='Try: "Show me high-protein vegetarian foods from Tamil Nadu"'
                value={aiPrompt}
                onChange={(e) => setAiPrompt(e.target.value)}
                onKeyDown={(e) => e.key === 'Enter' && handleAiSearch()}
                className="bg-white dark:bg-gray-800 text-xs"
              />
              <Button 
                onClick={() => handleAiSearch()}
                disabled={isAiSearching || !aiPrompt.trim()}
                className="bg-emerald-600 hover:bg-emerald-700 text-white text-xs px-4"
              >
                {isAiSearching ? <Loader2 className="h-4 w-4 animate-spin" /> : <Send className="h-4 w-4" />}
              </Button>
            </div>
            <div className="flex flex-wrap gap-1.5 text-[11px]">
              <span className="text-gray-500 font-medium">Try:</span>
              <button onClick={() => handleAiSearch("Find iron-rich foods that are vegan")} className="bg-white dark:bg-gray-800 border px-2 py-0.5 rounded hover:bg-emerald-100 text-gray-700 dark:text-gray-300">
                "Find iron-rich foods that are vegan"
              </button>
              <button onClick={() => handleAiSearch("Show fruits with high vitamin C")} className="bg-white dark:bg-gray-800 border px-2 py-0.5 rounded hover:bg-emerald-100 text-gray-700 dark:text-gray-300">
                "Show fruits with high vitamin C"
              </button>
            </div>
          </div>
        </TabsContent>
      </Tabs>
    </section>
  );
}

interface FilterButtonProps {
  active: boolean;
  count?: number;
  onClick: () => void;
  children: React.ReactNode;
}

function FilterButton({ active, count, onClick, children }: FilterButtonProps) {
  return (
    <Button 
      type="button"
      onClick={onClick}
      variant={active ? 'default' : 'outline'}
      className={`px-3.5 py-1.5 text-xs rounded-full transition-all duration-200 h-auto flex items-center gap-1.5 cursor-pointer ${
        active 
          ? 'bg-emerald-600 hover:bg-emerald-700 text-white shadow-sm' 
          : 'hover:border-emerald-400 hover:bg-emerald-50 dark:hover:bg-emerald-950/30'
      }`}
    >
      <span>{children}</span>
      {count !== undefined && (
        <span className={`text-[10px] px-1.5 py-0.2 rounded-full font-bold ${
          active ? 'bg-emerald-800 text-white' : 'bg-gray-200 dark:bg-gray-700 text-gray-700 dark:text-gray-300'
        }`}>
          {count}
        </span>
      )}
    </Button>
  );
}

