import React, { useState, useEffect, useContext, useMemo } from 'react';
import { CartContext } from '@/contexts/CartContext';
import { AppContext } from '@/contexts/AppContext';
import { 
  getSearchHistory, 
  removeSearchHistoryItem, 
  clearSearchHistory, 
  getUserNutritionProfile, 
  SearchHistoryItem, 
  UserNutritionProfile 
} from '@/lib/idb';
import { PersonalizedNutritionInsights } from './PersonalizedNutritionInsights';
import { SavedFavoritesView } from './SavedFavoritesView';
import { HistoricalSearchData } from './HistoricalSearchData';
import { ClinicalRecommendationsView } from './ClinicalRecommendationsView';
import { PersonalizationGoalsModal } from './PersonalizationGoalsModal';
import { UserProfileView } from './UserProfileView';
import { CommunityForumView } from './CommunityForumView';
import { Tabs, TabsList, TabsTrigger, TabsContent } from '@/components/ui/tabs';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { 
  LayoutDashboard, Heart, History, Sparkles, Database, 
  Settings, Flame, Dumbbell, ShieldCheck, Download, RefreshCw, Zap,
  User, MessageSquare, ArrowRight
} from 'lucide-react';
import { useToast } from '@/hooks/use-toast';

export function UserDashboard() {
  const { cartItems, removeFromCart, clearCart } = useContext(CartContext);
  const { offlineStatus, foods } = useContext(AppContext);
  const { toast } = useToast();

  const [activeTab, setActiveTab] = useState<string>('nutrition');
  const [searchHistory, setSearchHistory] = useState<SearchHistoryItem[]>([]);
  const [profile, setProfile] = useState<UserNutritionProfile>({
    id: 'current-profile',
    displayName: 'Health Explorer',
    calorieTarget: 2000,
    proteinTarget: 75,
    carbsTarget: 250,
    fatTarget: 65,
    fiberTarget: 30,
    dietaryFocus: 'balanced',
    healthGoals: ['Maintain healthy energy', 'Improve gut microbiome'],
    allergens: [],
    updatedAt: Date.now()
  });
  const [isGoalModalOpen, setIsGoalModalOpen] = useState(false);
  const [isLoadingData, setIsLoadingData] = useState(true);

  // Load search history and nutrition profile from existing storage interface
  const loadDashboardData = async () => {
    try {
      setIsLoadingData(true);
      let loadedHistory: SearchHistoryItem[] = [];

      try {
        const histRes = await fetch('/api/user/history').then(r => r.json());
        if (histRes?.success && Array.isArray(histRes.history) && histRes.history.length > 0) {
          loadedHistory = histRes.history.map((h: any) => ({
            id: h.id,
            query: h.query || h.foodName || '',
            category: h.category,
            timestamp: h.timestamp || Date.now(),
            resultsCount: h.resultCount || 1,
            selectedFoodId: h.foodItemId,
            selectedFoodName: h.foodName
          }));
        }
      } catch (e) {
        // fallback to IDB
      }

      if (loadedHistory.length === 0) {
        loadedHistory = await getSearchHistory();
      }
      setSearchHistory(loadedHistory);

      const userProfile = await getUserNutritionProfile();
      if (userProfile) {
        setProfile(userProfile);
      }
    } catch (err) {
      console.error('Failed to load dashboard data from IDB:', err);
    } finally {
      setIsLoadingData(false);
    }
  };

  useEffect(() => {
    loadDashboardData();
  }, []);

  // Extract food items from cartItems
  const favoriteFoods = useMemo(() => {
    return cartItems.map(item => item.foodItem);
  }, [cartItems]);

  // Quick aggregate numbers for header
  const headerStats = useMemo(() => {
    let calories = 0;
    let protein = 0;
    cartItems.forEach(item => {
      const n = item.foodItem.nutrition || {};
      calories += Number(n.calories) || 0;
      protein += Number(n.protein) || 0;
    });
    return {
      totalFavorites: cartItems.length,
      totalCalories: Math.round(calories),
      totalProtein: Math.round(protein * 10) / 10,
      totalSearches: searchHistory.length
    };
  }, [cartItems, searchHistory]);

  // Remove single search item
  const handleRemoveSearch = async (id: string) => {
    try {
      await removeSearchHistoryItem(id);
      setSearchHistory(prev => prev.filter(item => item.id !== id));
      toast({
        title: 'Search Removed',
        description: 'Entry removed from historical search records.'
      });
    } catch (err) {
      console.error('Failed to remove search item:', err);
    }
  };

  // Clear all search history
  const handleClearSearchHistory = async () => {
    try {
      await clearSearchHistory();
      setSearchHistory([]);
      toast({
        title: 'History Cleared',
        description: 'All local search history entries have been reset.'
      });
    } catch (err) {
      console.error('Failed to clear search history:', err);
    }
  };

  // Export data as JSON backup
  const handleExportData = () => {
    try {
      const exportObject = {
        profile,
        favorites: cartItems.map(i => ({
          foodId: i.foodItem.id,
          foodName: i.foodItem.name,
          nutrition: i.foodItem.nutrition
        })),
        searchHistory,
        exportedAt: new Date().toISOString()
      };

      const dataStr = 'data:text/json;charset=utf-8,' + encodeURIComponent(JSON.stringify(exportObject, null, 2));
      const downloadAnchor = document.createElement('a');
      downloadAnchor.setAttribute('href', dataStr);
      downloadAnchor.setAttribute('download', `nutriglobe_dashboard_backup_${Date.now()}.json`);
      document.body.appendChild(downloadAnchor);
      downloadAnchor.click();
      downloadAnchor.remove();

      toast({
        title: 'Dashboard Exported',
        description: 'Saved your nutrition insights and history as a JSON backup.'
      });
    } catch (e) {
      console.error('Export failed:', e);
    }
  };

  return (
    <div id="user-dashboard-container" className="space-y-6 max-w-7xl mx-auto pb-12">
      {/* Header Bar */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 bg-white dark:bg-slate-900 p-5 rounded-2xl border border-slate-200/80 dark:border-slate-800 shadow-sm">
        <div className="space-y-1">
          <div className="flex items-center gap-2.5">
            <div className="p-2 rounded-xl bg-emerald-50 dark:bg-emerald-950/40 text-emerald-600 dark:text-emerald-400">
              <LayoutDashboard className="w-6 h-6" />
            </div>
            <div>
              <h1 className="text-xl sm:text-2xl font-black tracking-tight text-slate-900 dark:text-white flex items-center gap-2">
                User Dashboard & Nutrition Insights
              </h1>
              <p className="text-xs text-slate-500 dark:text-slate-400">
                Personalized analytics, saved favorites, and historical search data via local storage
              </p>
            </div>
          </div>
        </div>

        {/* Action Controls */}
        <div className="flex flex-wrap items-center gap-2">
          <Badge variant="outline" className="text-xs gap-1.5 py-1 px-2.5 bg-slate-50 dark:bg-slate-800 border-slate-200 dark:border-slate-700">
            <Database className="w-3.5 h-3.5 text-emerald-600" />
            <span>IDB Storage Active</span>
          </Badge>

          <Button
            size="sm"
            variant="outline"
            onClick={() => setIsGoalModalOpen(true)}
            className="h-8 text-xs gap-1.5 border-slate-200 dark:border-slate-700 hover:border-emerald-500"
          >
            <Settings className="w-3.5 h-3.5 text-slate-600 dark:text-slate-300" />
            <span>Goals & Profile</span>
          </Button>

          <Button
            size="sm"
            variant="outline"
            onClick={handleExportData}
            className="h-8 text-xs gap-1.5 border-slate-200 dark:border-slate-700"
          >
            <Download className="w-3.5 h-3.5 text-slate-600 dark:text-slate-300" />
            <span>Export Data</span>
          </Button>
        </div>
      </div>

      {/* Profile Summary Banner Bar */}
      <div className="bg-gradient-to-r from-emerald-950 via-slate-900 to-teal-950 text-white p-5 rounded-2xl border border-emerald-500/30 shadow-md flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
        <div className="flex items-center gap-3.5">
          <div className="w-12 h-12 rounded-2xl bg-gradient-to-br from-emerald-500 to-teal-400 flex items-center justify-center text-white text-xl font-black shadow-md border border-emerald-300/30 shrink-0">
            {profile.displayName.charAt(0).toUpperCase()}
          </div>
          <div>
            <div className="flex items-center gap-2">
              <span className="font-black text-white text-base sm:text-lg tracking-tight">
                {profile.displayName}
              </span>
              <Badge className="bg-emerald-500/20 text-emerald-300 border border-emerald-500/40 text-[10px] font-bold uppercase tracking-wider">
                {profile.dietaryFocus.replace('-', ' ')}
              </Badge>
            </div>
            <div className="flex flex-wrap items-center gap-2 text-xs text-emerald-200/80 mt-1 font-medium">
              <span>Goal: <strong className="text-white">{profile.calorieTarget} kcal</strong></span>
              <span>•</span>
              <span className="text-blue-300">P: {profile.proteinTarget}g</span>
              <span>•</span>
              <span className="text-amber-300">C: {profile.carbsTarget}g</span>
              <span>•</span>
              <span className="text-rose-300">F: {profile.fatTarget}g</span>
            </div>
          </div>
        </div>

        <div className="flex items-center gap-2 self-stretch md:self-auto">
          <Button
            size="sm"
            onClick={() => setActiveTab('profile')}
            className="bg-emerald-500 hover:bg-emerald-600 text-slate-950 font-black text-xs rounded-xl shadow-sm h-9 px-3 gap-1.5 flex-1 md:flex-initial"
          >
            <User className="w-3.5 h-3.5" />
            <span>Edit Profile &amp; Biometrics</span>
          </Button>

          <Button
            size="sm"
            onClick={() => setActiveTab('forum')}
            variant="outline"
            className="border-emerald-500/40 text-emerald-300 hover:bg-emerald-950/60 font-bold text-xs rounded-xl h-9 px-3 gap-1.5 flex-1 md:flex-initial"
          >
            <MessageSquare className="w-3.5 h-3.5" />
            <span>Care Forum</span>
          </Button>
        </div>
      </div>

      {/* 4 Quick Stat Summary Cards */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3">
        <Card className="border border-slate-200/80 dark:border-slate-800 shadow-sm bg-white dark:bg-slate-900 rounded-2xl">
          <CardContent className="p-3.5 flex items-center gap-3">
            <div className="p-2.5 rounded-xl bg-rose-50 dark:bg-rose-950/40 text-rose-500 shrink-0">
              <Heart className="w-5 h-5" />
            </div>
            <div>
              <div className="text-[11px] font-medium text-slate-500">Saved Favorites</div>
              <div className="text-lg font-black text-slate-900 dark:text-white">
                {headerStats.totalFavorites} Foods
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="border border-slate-200/80 dark:border-slate-800 shadow-sm bg-white dark:bg-slate-900 rounded-2xl">
          <CardContent className="p-3.5 flex items-center gap-3">
            <div className="p-2.5 rounded-xl bg-amber-50 dark:bg-amber-950/40 text-amber-500 shrink-0">
              <Flame className="w-5 h-5" />
            </div>
            <div>
              <div className="text-[11px] font-medium text-slate-500">Total Calories</div>
              <div className="text-lg font-black text-slate-900 dark:text-white">
                {headerStats.totalCalories} kcal
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="border border-slate-200/80 dark:border-slate-800 shadow-sm bg-white dark:bg-slate-900 rounded-2xl">
          <CardContent className="p-3.5 flex items-center gap-3">
            <div className="p-2.5 rounded-xl bg-blue-50 dark:bg-blue-950/40 text-blue-500 shrink-0">
              <Dumbbell className="w-5 h-5" />
            </div>
            <div>
              <div className="text-[11px] font-medium text-slate-500">Total Protein</div>
              <div className="text-lg font-black text-slate-900 dark:text-white">
                {headerStats.totalProtein}g
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="border border-slate-200/80 dark:border-slate-800 shadow-sm bg-white dark:bg-slate-900 rounded-2xl">
          <CardContent className="p-3.5 flex items-center gap-3">
            <div className="p-2.5 rounded-xl bg-purple-50 dark:bg-purple-950/40 text-purple-500 shrink-0">
              <History className="w-5 h-5" />
            </div>
            <div>
              <div className="text-[11px] font-medium text-slate-500">Search History</div>
              <div className="text-lg font-black text-slate-900 dark:text-white">
                {headerStats.totalSearches} Queries
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Main Tabbed Sections */}
      <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-4">
        <div className="overflow-x-auto pb-1">
          <TabsList className="bg-slate-200/70 dark:bg-slate-800/70 p-1 rounded-xl h-auto flex gap-1 w-max sm:w-auto">
            <TabsTrigger 
              value="profile" 
              className="rounded-lg text-xs font-bold gap-1.5 data-[state=active]:bg-white dark:data-[state=active]:bg-slate-900 data-[state=active]:shadow-sm px-3 py-2"
            >
              <User className="w-3.5 h-3.5 text-teal-600" />
              <span>Profile &amp; Biometrics</span>
            </TabsTrigger>

            <TabsTrigger 
              value="nutrition" 
              className="rounded-lg text-xs font-bold gap-1.5 data-[state=active]:bg-white dark:data-[state=active]:bg-slate-900 data-[state=active]:shadow-sm px-3 py-2"
            >
              <Sparkles className="w-3.5 h-3.5 text-emerald-600" />
              <span>Nutrition Insights</span>
            </TabsTrigger>

            <TabsTrigger 
              value="favorites" 
              className="rounded-lg text-xs font-bold gap-1.5 data-[state=active]:bg-white dark:data-[state=active]:bg-slate-900 data-[state=active]:shadow-sm px-3 py-2"
            >
              <Heart className="w-3.5 h-3.5 text-rose-500" />
              <span>Saved Favorites ({cartItems.length})</span>
            </TabsTrigger>

            <TabsTrigger 
              value="forum" 
              className="rounded-lg text-xs font-bold gap-1.5 data-[state=active]:bg-white dark:data-[state=active]:bg-slate-900 data-[state=active]:shadow-sm px-3 py-2"
            >
              <MessageSquare className="w-3.5 h-3.5 text-teal-500" />
              <span>Care &amp; Community Forum</span>
            </TabsTrigger>

            <TabsTrigger 
              value="recommendations" 
              className="rounded-lg text-xs font-bold gap-1.5 data-[state=active]:bg-white dark:data-[state=active]:bg-slate-900 data-[state=active]:shadow-sm px-3 py-2"
            >
              <Zap className="w-3.5 h-3.5 text-amber-500" />
              <span>Recommendations</span>
            </TabsTrigger>

            <TabsTrigger 
              value="history" 
              className="rounded-lg text-xs font-bold gap-1.5 data-[state=active]:bg-white dark:data-[state=active]:bg-slate-900 data-[state=active]:shadow-sm px-3 py-2"
            >
              <History className="w-3.5 h-3.5 text-blue-500" />
              <span>Search History ({searchHistory.length})</span>
            </TabsTrigger>
          </TabsList>
        </div>

        {/* Tab 0: User Profile & Biometrics */}
        <TabsContent value="profile" className="outline-none">
          <UserProfileView
            profile={profile}
            onProfileUpdated={(updated) => setProfile(updated)}
          />
        </TabsContent>

        {/* Tab 1: Personalized Nutrition Insights */}
        <TabsContent value="nutrition" className="outline-none">
          <PersonalizedNutritionInsights
            favoriteFoods={favoriteFoods}
            profile={profile}
            onOpenGoalModal={() => setIsGoalModalOpen(true)}
          />
        </TabsContent>

        {/* Tab 2: Saved Favorite Foods */}
        <TabsContent value="favorites" className="outline-none">
          <SavedFavoritesView
            favoriteItems={cartItems}
            onRemoveFavorite={removeFromCart}
            onClearAll={clearCart}
          />
        </TabsContent>

        {/* Tab 3: Care & Community Forum */}
        <TabsContent value="forum" className="outline-none">
          <CommunityForumView />
        </TabsContent>

        {/* Tab 4: Clinical Algorithmic Recommendations */}
        <TabsContent value="recommendations" className="outline-none">
          <ClinicalRecommendationsView
            currentFocus={profile.dietaryFocus}
            onFocusChange={(f) => setProfile(prev => ({ ...prev, dietaryFocus: f as any }))}
          />
        </TabsContent>

        {/* Tab 5: Historical Search Data */}
        <TabsContent value="history" className="outline-none">
          <HistoricalSearchData
            searchHistory={searchHistory}
            onRemoveItem={handleRemoveSearch}
            onClearHistory={handleClearSearchHistory}
          />
        </TabsContent>
      </Tabs>

      {/* Goal Customization Modal */}
      <PersonalizationGoalsModal
        isOpen={isGoalModalOpen}
        onClose={() => setIsGoalModalOpen(false)}
        currentProfile={profile}
        onProfileUpdated={(updated) => setProfile(updated)}
      />
    </div>
  );
}
export default UserDashboard;
