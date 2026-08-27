import { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { Link } from 'wouter';
import type { EditorialArticle } from '@shared/editorialSchema';
import { Sparkles, Calendar, BookOpen, ExternalLink, Share2, Heart, ShieldCheck, Flame, ChevronRight, Search } from 'lucide-react';
import { useTranslation } from '@/hooks/useTranslation';

import { useContext } from 'react';
import { AppContext } from '@/contexts/AppContext';
import { FeedPageSkeleton } from '@/components/ui/PageSkeleton';
import { usePageViewCounter } from '@/hooks/usePageViewCounter';

export default function FeedPage() {
  usePageViewCounter('/feed', 'Nutrition Hub & Feed');
  const { getLocalizedText } = useTranslation();
  const { isLoading: appLoading } = useContext(AppContext);
  const [selectedCategory, setSelectedCategory] = useState<string>('all');
  const [searchQuery, setSearchQuery] = useState<string>('');

  const { data: articles = [], isLoading } = useQuery<EditorialArticle[]>({
    queryKey: ['/api/editorial/articles?status=published'],
    queryFn: async () => {
      const res = await fetch('/api/editorial/articles?status=published');
      if (!res.ok) throw new Error('Failed to fetch published feed articles');
      return res.json();
    }
  });

  const categories = [
    'all',
    'Regional Heritage',
    'Nutritional Focus',
    'Discovery & Exotics',
    'Ancient Grains',
    'Medicinal Herbs & Spices'
  ];

  const filteredArticles = articles.filter(art => {
    const matchesCat = selectedCategory === 'all' || art.category === selectedCategory;
    const matchesSearch = !searchQuery || 
      art.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
      art.summary.toLowerCase().includes(searchQuery.toLowerCase()) ||
      art.foods.some(f => f.foodName.en.toLowerCase().includes(searchQuery.toLowerCase()));
    return matchesCat && matchesSearch;
  });

  return (
    <div className="space-y-8 max-w-7xl mx-auto pb-12">
      {/* Feed Hero Banner */}
      <div className="relative overflow-hidden rounded-3xl bg-gradient-to-br from-emerald-900 via-teal-900 to-slate-900 text-white p-8 md:p-12 shadow-2xl border border-emerald-700/40">
        <div className="absolute top-0 right-0 -mt-8 -mr-8 w-64 h-64 rounded-full bg-emerald-500/10 blur-3xl pointer-events-none" />
        
        <div className="relative z-10 max-w-3xl space-y-4">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-emerald-500/20 border border-emerald-400/30 text-emerald-300 text-xs font-bold uppercase tracking-wider">
            <Sparkles className="w-4 h-4 text-amber-300" />
            <span>Daily Food Discovery Feed</span>
          </div>
          
          <h1 className="text-3xl sm:text-5xl font-black tracking-tight leading-tight">
            Curated 5-Food Collections & Global Food Knowledge
          </h1>
          
          <p className="text-emerald-100/80 text-base sm:text-lg">
            Daily evidence-backed food knowledge articles drawn from our master 100,000+ food database. Verified nutrition, regional cultivars, and culinary science.
          </p>

          <div className="flex flex-wrap items-center gap-4 pt-2 text-xs font-semibold text-emerald-200">
            <span className="flex items-center gap-1.5 bg-emerald-950/60 px-3 py-1.5 rounded-lg border border-emerald-700/50">
              <ShieldCheck className="w-4 h-4 text-emerald-400" />
              100% Database Verified
            </span>
            <span className="flex items-center gap-1.5 bg-emerald-950/60 px-3 py-1.5 rounded-lg border border-emerald-700/50">
              <Flame className="w-4 h-4 text-amber-400" />
              Daily 5-Food Features
            </span>
            <Link href="/editorial-policy">
              <a className="text-emerald-300 hover:underline flex items-center gap-1">
                AI Editorial Policy
                <ExternalLink className="w-3 h-3" />
              </a>
            </Link>
          </div>
        </div>
      </div>

      {/* Filter and Search Bar */}
      <div className="flex flex-col md:flex-row gap-4 items-center justify-between bg-white dark:bg-gray-800 p-4 rounded-2xl shadow-sm border border-gray-100 dark:border-gray-700">
        {/* Category Pills */}
        <div className="flex items-center gap-2 overflow-x-auto w-full md:w-auto pb-2 md:pb-0 scrollbar-none">
          {categories.map((cat) => (
            <button
              key={cat}
              onClick={() => setSelectedCategory(cat)}
              className={`px-4 py-2 rounded-xl text-xs font-bold whitespace-nowrap transition-all ${
                selectedCategory === cat
                  ? 'bg-emerald-600 text-white shadow-md'
                  : 'bg-gray-100 dark:bg-gray-700 text-gray-600 dark:text-gray-300 hover:bg-gray-200'
              }`}
            >
              {cat === 'all' ? 'All Collections' : cat}
            </button>
          ))}
        </div>

        {/* Search Input */}
        <div className="relative w-full md:w-72">
          <Search className="absolute left-3.5 top-2.5 h-4 w-4 text-gray-400" />
          <input
            type="text"
            placeholder="Search 5-food articles..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full pl-10 pr-4 py-2 bg-gray-50 dark:bg-gray-900 border border-gray-200 dark:border-gray-700 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-emerald-500"
          />
        </div>
      </div>

      {/* Articles Feed Stream */}
      {isLoading || appLoading ? (
        <FeedPageSkeleton />
      ) : filteredArticles.length === 0 ? (
        <div className="p-12 text-center bg-white dark:bg-gray-800 rounded-3xl border border-gray-100 dark:border-gray-700">
          <p className="text-gray-500 font-medium">No published feed articles found matching your criteria.</p>
        </div>
      ) : (
        <div className="space-y-8">
          {filteredArticles.map((article) => (
            <article 
              key={article.id}
              className="bg-white dark:bg-gray-800 rounded-3xl overflow-hidden shadow-lg border border-gray-100 dark:border-gray-700 hover:border-emerald-500/50 transition-all group"
            >
              <div className="grid grid-cols-1 lg:grid-cols-12 gap-0">
                {/* Featured Banner / Image Column */}
                <div className="lg:col-span-5 relative h-64 lg:h-auto overflow-hidden bg-gray-100">
                  <img
                    src={article.featuredImage}
                    alt={article.imageAlt}
                    className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                  />
                  <div className="absolute top-4 left-4 bg-emerald-950/80 backdrop-blur-md text-emerald-300 text-xs font-bold px-3 py-1.5 rounded-full border border-emerald-500/30 shadow-md">
                    {article.category}
                  </div>
                  <div className="absolute bottom-4 left-4 right-4 bg-black/60 backdrop-blur-md text-white text-[11px] p-2 rounded-xl flex items-center justify-between">
                    <span className="font-semibold text-emerald-300">5 Featured Foods Included</span>
                    <span>{article.readingTimeMinutes} min read</span>
                  </div>
                </div>

                {/* Article Info Column */}
                <div className="lg:col-span-7 p-6 sm:p-8 flex flex-col justify-between space-y-6">
                  <div className="space-y-4">
                    <div className="flex items-center gap-3 text-xs text-gray-500 dark:text-gray-400">
                      <span className="flex items-center gap-1">
                        <Calendar className="w-3.5 h-3.5 text-emerald-600" />
                        {new Date(article.publishedAt).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })}
                      </span>
                      <span>•</span>
                      <span>By {article.author.name}</span>
                    </div>

                    <Link href={`/blog/${article.slug}`}>
                      <a className="block group-hover:text-emerald-600 dark:group-hover:text-emerald-400 transition-colors">
                        <h2 className="text-xl sm:text-2xl font-black text-gray-900 dark:text-white leading-snug">
                          {article.title}
                        </h2>
                      </a>
                    </Link>

                    <p className="text-gray-600 dark:text-gray-300 text-sm line-clamp-2">
                      {article.summary}
                    </p>

                    {/* The 5 Foods Grid Pill Cards */}
                    <div className="space-y-2 pt-2">
                      <span className="text-xs font-bold text-gray-400 uppercase tracking-wider">The 5 Foods in this Collection:</span>
                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                        {article.foods.slice(0, 5).map((f, idx) => (
                          <div 
                            key={f.foodId + idx}
                            className="flex items-center gap-2 p-2 bg-emerald-50/60 dark:bg-emerald-950/40 rounded-xl border border-emerald-100 dark:border-emerald-800/40 text-xs font-semibold text-emerald-900 dark:text-emerald-200"
                          >
                            <span className="w-5 h-5 rounded-full bg-emerald-600 text-white font-bold flex items-center justify-center text-[10px]">
                              {idx + 1}
                            </span>
                            <span className="truncate">{f.foodName.en}</span>
                          </div>
                        ))}
                      </div>
                    </div>
                  </div>

                  {/* Card Actions */}
                  <div className="flex items-center justify-between pt-4 border-t border-gray-100 dark:border-gray-700/60 text-xs">
                    <div className="flex items-center gap-4 text-gray-500">
                      <span className="flex items-center gap-1 font-medium">
                        <Heart className="w-4 h-4 text-rose-500" fill="currentColor" />
                        {article.likesCount}
                      </span>
                      <span className="flex items-center gap-1 font-medium">
                        <BookOpen className="w-4 h-4 text-emerald-600" />
                        {article.viewsCount} reads
                      </span>
                    </div>

                    <Link href={`/blog/${article.slug}`}>
                      <a className="inline-flex items-center gap-1.5 px-4 py-2 bg-emerald-600 hover:bg-emerald-700 text-white font-bold rounded-xl shadow-md transition-all text-xs">
                        <span>Read Full Collection</span>
                        <ChevronRight className="w-3.5 h-3.5" />
                      </a>
                    </Link>
                  </div>
                </div>
              </div>
            </article>
          ))}
        </div>
      )}
    </div>
  );
}
