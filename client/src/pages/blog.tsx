import { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { Link } from 'wouter';
import { EditorialArticle } from '../../shared/editorialSchema';
import { Search, Calendar, User, BookOpen, Clock, Tag, ArrowRight, ShieldCheck, Sparkles } from 'lucide-react';

import { useContext } from 'react';
import { AppContext } from '@/contexts/AppContext';
import { BlogPageSkeleton } from '@/components/ui/PageSkeleton';

export default function BlogPage() {
  const { isLoading: appLoading } = useContext(AppContext);
  const [activeTab, setActiveTab] = useState<string>('all');
  const [searchTerm, setSearchTerm] = useState<string>('');

  const { data: articles = [], isLoading } = useQuery<EditorialArticle[]>({
    queryKey: ['/api/editorial/articles?status=published'],
    queryFn: async () => {
      const res = await fetch('/api/editorial/articles?status=published');
      if (!res.ok) throw new Error('Failed to fetch blog articles');
      return res.json();
    }
  });

  const categories = ['all', 'Regional Heritage', 'Nutritional Focus', 'Discovery & Exotics', 'Ancient Grains'];

  const filtered = articles.filter(art => {
    const matchCat = activeTab === 'all' || art.category === activeTab;
    const matchSearch = !searchTerm || 
      art.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
      art.summary.toLowerCase().includes(searchTerm.toLowerCase());
    return matchCat && matchSearch;
  });

  const featured = articles[0];

  return (
    <div className="space-y-10 max-w-7xl mx-auto pb-12">
      {/* Blog Header */}
      <div className="text-center space-y-3 py-6">
        <div className="inline-flex items-center gap-2 px-3.5 py-1 rounded-full bg-emerald-100 dark:bg-emerald-950 text-emerald-800 dark:text-emerald-300 text-xs font-bold uppercase tracking-wider">
          <BookOpen className="w-3.5 h-3.5" />
          <span>Food Knowledge & Editorial Hub</span>
        </div>
        <h1 className="text-4xl font-black text-gray-900 dark:text-white tracking-tight">
          Evidence-Based Food Science & Nutrition Articles
        </h1>
        <p className="text-gray-600 dark:text-gray-300 max-w-2xl mx-auto text-sm sm:text-base">
          In-depth 5-food comparisons, regional agricultural cultivars, and evidence-backed nutritional guides derived directly from our 100,000+ master food database.
        </p>
      </div>

      {/* Featured Hero Article */}
      {featured && !searchTerm && activeTab === 'all' && (
        <div className="relative overflow-hidden rounded-3xl bg-slate-900 text-white shadow-xl border border-gray-800 group">
          <div className="grid grid-cols-1 lg:grid-cols-12">
            <div className="lg:col-span-7 p-8 sm:p-12 flex flex-col justify-between space-y-6">
              <div className="space-y-4">
                <span className="bg-emerald-500/20 text-emerald-300 text-xs font-bold px-3 py-1 rounded-full border border-emerald-400/30">
                  Featured Article
                </span>
                <Link href={`/blog/${featured.slug}`}>
                  <a className="block group-hover:text-emerald-400 transition-colors">
                    <h2 className="text-2xl sm:text-4xl font-extrabold leading-tight">
                      {featured.title}
                    </h2>
                  </a>
                </Link>
                <p className="text-gray-300 text-sm sm:text-base line-clamp-3">
                  {featured.summary}
                </p>
              </div>

              <div className="flex flex-wrap items-center justify-between gap-4 pt-4 border-t border-gray-800 text-xs text-gray-400">
                <div className="flex items-center gap-3">
                  <span className="flex items-center gap-1">
                    <User className="w-3.5 h-3.5 text-emerald-400" />
                    {featured.author.name}
                  </span>
                  <span>•</span>
                  <span className="flex items-center gap-1">
                    <Clock className="w-3.5 h-3.5 text-emerald-400" />
                    {featured.readingTimeMinutes} min read
                  </span>
                </div>

                <Link href={`/blog/${featured.slug}`}>
                  <a className="inline-flex items-center gap-2 px-5 py-2.5 bg-emerald-600 hover:bg-emerald-500 text-white font-bold rounded-xl transition-all shadow-lg text-xs">
                    <span>Read Article</span>
                    <ArrowRight className="w-4 h-4" />
                  </a>
                </Link>
              </div>
            </div>

            <div className="lg:col-span-5 h-64 lg:h-auto relative overflow-hidden">
              <img
                src={featured.featuredImage}
                alt={featured.imageAlt}
                className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-700"
              />
            </div>
          </div>
        </div>
      )}

      {/* Filter and Search Bar */}
      <div className="flex flex-col sm:flex-row items-center justify-between gap-4 border-b border-gray-200 dark:border-gray-800 pb-4">
        <div className="flex items-center gap-2 overflow-x-auto w-full sm:w-auto">
          {categories.map(cat => (
            <button
              key={cat}
              onClick={() => setActiveTab(cat)}
              className={`px-4 py-2 rounded-xl text-xs font-bold transition-all ${
                activeTab === cat
                  ? 'bg-emerald-600 text-white shadow-md'
                  : 'bg-gray-100 dark:bg-gray-800 text-gray-600 dark:text-gray-300 hover:bg-gray-200'
              }`}
            >
              {cat === 'all' ? 'All Articles' : cat}
            </button>
          ))}
        </div>

        <div className="relative w-full sm:w-72">
          <Search className="absolute left-3.5 top-2.5 h-4 w-4 text-gray-400" />
          <input
            type="text"
            placeholder="Search food articles..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full pl-10 pr-4 py-2 bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-emerald-500"
          />
        </div>
      </div>

      {/* Blog Grid */}
      {isLoading || appLoading ? (
        <BlogPageSkeleton />
      ) : filtered.length === 0 ? (
        <div className="text-center py-12 text-gray-500">No matching articles found.</div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
          {filtered.map(art => (
            <div
              key={art.id}
              className="bg-white dark:bg-gray-800 rounded-2xl overflow-hidden border border-gray-100 dark:border-gray-700/80 shadow-md hover:shadow-xl transition-all flex flex-col justify-between group"
            >
              <div>
                <div className="relative h-48 overflow-hidden bg-gray-100">
                  <img
                    src={art.featuredImage}
                    alt={art.imageAlt}
                    className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                  />
                  <div className="absolute top-3 left-3 bg-emerald-900/80 text-emerald-200 text-[10px] font-bold px-2.5 py-1 rounded-full backdrop-blur-sm">
                    {art.category}
                  </div>
                </div>

                <div className="p-6 space-y-3">
                  <div className="flex items-center gap-2 text-xs text-gray-400">
                    <Calendar className="w-3.5 h-3.5 text-emerald-500" />
                    <span>{new Date(art.publishedAt).toLocaleDateString()}</span>
                    <span>•</span>
                    <span>{art.readingTimeMinutes} min</span>
                  </div>

                  <Link href={`/blog/${art.slug}`}>
                    <a className="block group-hover:text-emerald-600 dark:group-hover:text-emerald-400 transition-colors">
                      <h3 className="text-lg font-bold text-gray-900 dark:text-white line-clamp-2 leading-snug">
                        {art.title}
                      </h3>
                    </a>
                  </Link>

                  <p className="text-gray-600 dark:text-gray-300 text-xs line-clamp-3">
                    {art.summary}
                  </p>
                </div>
              </div>

              <div className="p-6 pt-0 border-t border-gray-50 dark:border-gray-700/50 flex items-center justify-between text-xs mt-4">
                <span className="text-gray-500 font-medium truncate max-w-[150px]">
                  {art.author.name}
                </span>
                <Link href={`/blog/${art.slug}`}>
                  <a className="text-emerald-600 dark:text-emerald-400 font-bold hover:underline flex items-center gap-1">
                    <span>Read</span>
                    <ArrowRight className="w-3.5 h-3.5" />
                  </a>
                </Link>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
