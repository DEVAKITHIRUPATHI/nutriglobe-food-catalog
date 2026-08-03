import { useQuery } from '@tanstack/react-query';
import { useRoute, Link } from 'wouter';
import { EditorialArticle } from '../../shared/editorialSchema';
import { 
  Calendar, User, Clock, ShieldCheck, Info, ExternalLink, Share2, 
  Sparkles, CheckCircle2, AlertTriangle, ArrowLeft, Heart, BookOpen, Flame 
} from 'lucide-react';
import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { AmazonAdBanner } from '@/components/ads/AmazonAdBanner';

import { useContext } from 'react';
import { AppContext } from '@/contexts/AppContext';
import { ArticlePageSkeleton } from '@/components/ui/PageSkeleton';

export default function ArticlePage() {
  const [, params] = useRoute('/blog/:slug');
  const slug = params?.slug;
  const { isLoading: appLoading } = useContext(AppContext);
  const [liked, setLiked] = useState(false);
  const [readingProgress, setReadingProgress] = useState(0);

  useEffect(() => {
    const handleScroll = () => {
      const totalHeight = document.documentElement.scrollHeight - window.innerHeight;
      if (totalHeight > 0) {
        const progress = (window.scrollY / totalHeight) * 100;
        setReadingProgress(Math.min(100, Math.max(0, progress)));
      }
    };

    window.addEventListener('scroll', handleScroll, { passive: true });
    handleScroll();
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  const { data: article, isLoading, error } = useQuery<EditorialArticle>({
    queryKey: [`/api/editorial/articles/${slug}`],
    queryFn: async () => {
      if (!slug) throw new Error('No slug provided');
      const res = await fetch(`/api/editorial/articles/${slug}`);
      if (!res.ok) throw new Error('Article not found');
      return res.json();
    },
    enabled: !!slug
  });

  if (isLoading || appLoading) {
    return <ArticlePageSkeleton />;
  }

  if (error || !article) {
    return (
      <div className="py-16 text-center space-y-4 max-w-md mx-auto">
        <AlertTriangle className="w-12 h-12 text-amber-500 mx-auto" />
        <h2 className="text-2xl font-bold text-gray-900 dark:text-white">Article Not Found</h2>
        <p className="text-gray-500 text-sm">The requested food article could not be located in our editorial catalog.</p>
        <Link href="/blog">
          <a className="inline-flex items-center gap-2 px-5 py-2.5 bg-emerald-600 text-white rounded-xl font-bold text-sm shadow-md">
            <ArrowLeft className="w-4 h-4" />
            Back to Blog Hub
          </a>
        </Link>
      </div>
    );
  }

  // Construct structured data JSON-LD for Google News & Search Eligibility
  const jsonLdSchema = {
    "@context": "https://schema.org",
    "@type": "Article",
    "headline": article.title,
    "description": article.summary,
    "image": [article.featuredImage],
    "datePublished": article.publishedAt,
    "dateModified": article.updatedAt,
    "author": [{
      "@type": "Person",
      "name": article.author.name,
      "jobTitle": article.author.role
    }],
    "publisher": {
      "@type": "Organization",
      "name": "Global Food Knowledge Platform",
      "logo": {
        "@type": "ImageObject",
        "url": "https://ais-dev-j534ely2q5d7bn4cdaracp-502319451108.asia-southeast1.run.app/favicon.ico"
      }
    },
    "mainEntityOfPage": {
      "@type": "WebPage",
      "@id": `https://ais-dev-j534ely2q5d7bn4cdaracp-502319451108.asia-southeast1.run.app/blog/${article.slug}`
    }
  };

  return (
    <div className="max-w-4xl mx-auto space-y-10 pb-16">
      {/* Top Fixed Reading Progress Indicator Bar */}
      <div className="fixed top-0 left-0 right-0 z-50 h-1.5 bg-slate-200/80 dark:bg-slate-800/80 backdrop-blur-xs">
        <motion.div 
          className="h-full bg-gradient-to-r from-emerald-500 via-teal-400 to-emerald-600 shadow-sm"
          style={{ width: `${readingProgress}%` }}
          transition={{ ease: "easeOut", duration: 0.1 }}
        />
      </div>

      {/* Floating Reading Progress Pill Badge */}
      <div className="fixed bottom-6 right-6 z-40 hidden sm:flex items-center gap-2 bg-slate-900/90 dark:bg-slate-800/90 text-white text-xs font-bold px-3.5 py-2 rounded-full shadow-xl border border-white/10 backdrop-blur-md">
        <BookOpen className="w-3.5 h-3.5 text-emerald-400 animate-pulse" />
        <span>Reading: {Math.round(readingProgress)}%</span>
      </div>

      {/* Inject Structured Data for SEO / Google News */}
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLdSchema) }}
      />

      {/* Back Button */}
      <div className="flex items-center justify-between pt-2">
        <Link href="/blog">
          <a className="inline-flex items-center gap-1.5 text-xs font-bold text-gray-500 hover:text-emerald-600 transition">
            <ArrowLeft className="w-4 h-4" />
            <span>Back to All Articles</span>
          </a>
        </Link>

        <span className="bg-emerald-100 dark:bg-emerald-950 text-emerald-800 dark:text-emerald-300 text-xs font-bold px-3 py-1 rounded-full border border-emerald-300 dark:border-emerald-800">
          {article.category}
        </span>
      </div>

      {/* Article Header */}
      <header className="space-y-6">
        <h1 className="text-3xl sm:text-5xl font-black text-gray-900 dark:text-white tracking-tight leading-tight">
          {article.title}
        </h1>

        {article.subtitle && (
          <p className="text-lg sm:text-xl text-gray-600 dark:text-gray-300 font-medium leading-relaxed">
            {article.subtitle}
          </p>
        )}

        {/* Author & Publication Byline Box */}
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 p-4 rounded-2xl bg-gray-50 dark:bg-gray-800/60 border border-gray-100 dark:border-gray-700">
          <div className="flex items-center gap-3">
            <img
              src={article.author.avatar}
              alt={article.author.name}
              className="w-12 h-12 rounded-full object-cover border-2 border-emerald-500 shadow-sm"
            />
            <div>
              <div className="font-extrabold text-sm text-gray-900 dark:text-white flex items-center gap-1.5">
                <span>{article.author.name}</span>
                <ShieldCheck className="w-4 h-4 text-emerald-600" />
              </div>
              <p className="text-xs text-gray-500 dark:text-gray-400">{article.author.role}</p>
            </div>
          </div>

          <div className="flex flex-wrap items-center gap-4 text-xs text-gray-500 dark:text-gray-400">
            <span className="flex items-center gap-1">
              <Calendar className="w-3.5 h-3.5 text-emerald-600" />
              Published: {new Date(article.publishedAt).toLocaleDateString()}
            </span>
            <span>•</span>
            <span className="flex items-center gap-1">
              <Clock className="w-3.5 h-3.5 text-emerald-600" />
              {article.readingTimeMinutes} min read
            </span>
          </div>
        </div>
      </header>

      {/* Featured Banner Image */}
      <div className="relative rounded-3xl overflow-hidden shadow-xl border border-gray-100 dark:border-gray-800">
        <img
          src={article.featuredImage}
          alt={article.imageAlt}
          className="w-full h-80 sm:h-96 object-cover"
        />
        {article.imageCaption && (
          <div className="p-3 bg-gray-900/80 text-gray-300 text-xs text-center backdrop-blur-sm">
            {article.imageCaption}
          </div>
        )}
      </div>

      {/* Transparent AI Disclosure Banner */}
      <div className="p-4 rounded-2xl bg-amber-50 dark:bg-amber-950/40 border border-amber-200 dark:border-amber-800/50 flex items-start gap-3">
        <Sparkles className="w-5 h-5 text-amber-600 shrink-0 mt-0.5" />
        <div className="text-xs text-amber-900 dark:text-amber-200 space-y-1">
          <p className="font-bold uppercase tracking-wider">AI Editorial Transparency Notice</p>
          <p>{article.aiDisclosureText}</p>
        </div>
      </div>

      {/* Why Selected & Introduction */}
      <section className="prose dark:prose-invert max-w-none space-y-4">
        <div className="p-5 rounded-2xl bg-emerald-50/60 dark:bg-emerald-950/40 border border-emerald-100 dark:border-emerald-800/40 text-emerald-950 dark:text-emerald-200 text-sm">
          <span className="font-extrabold uppercase tracking-wider text-xs block text-emerald-700 dark:text-emerald-400 mb-1">
            Why These 5 Foods Were Selected:
          </span>
          {article.whySelected}
        </div>

        <p className="text-base sm:text-lg text-gray-700 dark:text-gray-200 leading-relaxed font-normal">
          {article.introduction}
        </p>
      </section>

      {/* THE 5 FEATURED FOODS DETAILED CARDS */}
      <section className="space-y-12 pt-4">
        <div className="flex items-center gap-3 border-b-2 border-emerald-600 pb-3">
          <Flame className="w-6 h-6 text-amber-500" />
          <h2 className="text-2xl font-black text-gray-900 dark:text-white">
            The 5 Featured Foods Breakdown
          </h2>
        </div>

        {article.foods.map((food, index) => (
          <div
            key={food.foodId + index}
            id={food.foodId}
            className="bg-white dark:bg-gray-800 rounded-3xl p-6 sm:p-8 shadow-xl border border-gray-100 dark:border-gray-700 space-y-6 scroll-mt-24"
          >
            {/* Header Title & Number Badge */}
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-gray-100 dark:border-gray-700/80 pb-4">
              <div className="flex items-center gap-3">
                <span className="w-10 h-10 rounded-2xl bg-emerald-600 text-white font-extrabold text-lg flex items-center justify-center shadow-md shrink-0">
                  #{index + 1}
                </span>
                <div>
                  <h3 className="text-xl sm:text-2xl font-black text-gray-900 dark:text-white">
                    {food.foodName.en}
                  </h3>
                  <p className="text-xs font-semibold text-emerald-600 dark:text-emerald-400">
                    Origin: {food.origin}
                  </p>
                </div>
              </div>

              {/* Regional Names Box */}
              {Object.keys(food.regionalNames).length > 0 && (
                <div className="flex flex-wrap gap-1.5 text-xs">
                  {Object.entries(food.regionalNames).map(([lang, val]) => val ? (
                    <span key={lang} className="bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-300 px-2.5 py-1 rounded-lg font-medium">
                      {val}
                    </span>
                  ) : null)}
                </div>
              )}
            </div>

            {/* Image + Nutrition Grid */}
            <div className="grid grid-cols-1 md:grid-cols-12 gap-6 items-center">
              <div className="md:col-span-5 h-56 rounded-2xl overflow-hidden bg-gray-100">
                <img
                  src={food.image}
                  alt={food.foodName.en}
                  className="w-full h-full object-cover"
                />
              </div>

              {/* Nutrition Summary Table */}
              <div className="md:col-span-7 bg-gray-50 dark:bg-gray-900/60 rounded-2xl p-4 sm:p-5 border border-gray-100 dark:border-gray-800 space-y-3">
                <h4 className="text-xs font-extrabold uppercase text-gray-400 tracking-wider">
                  Nutritional Composition (Per 100g)
                </h4>

                <div className="grid grid-cols-4 gap-2 text-center">
                  <div className="p-2 bg-white dark:bg-gray-800 rounded-xl shadow-xs border border-gray-100 dark:border-gray-700">
                    <span className="block text-xs text-gray-400">Calories</span>
                    <span className="text-sm sm:text-base font-black text-emerald-600 dark:text-emerald-400">{food.nutritionSummary.calories} kcal</span>
                  </div>
                  <div className="p-2 bg-white dark:bg-gray-800 rounded-xl shadow-xs border border-gray-100 dark:border-gray-700">
                    <span className="block text-xs text-gray-400">Protein</span>
                    <span className="text-sm sm:text-base font-black text-gray-800 dark:text-gray-200">{food.nutritionSummary.protein}g</span>
                  </div>
                  <div className="p-2 bg-white dark:bg-gray-800 rounded-xl shadow-xs border border-gray-100 dark:border-gray-700">
                    <span className="block text-xs text-gray-400">Carbs</span>
                    <span className="text-sm sm:text-base font-black text-gray-800 dark:text-gray-200">{food.nutritionSummary.carbs}g</span>
                  </div>
                  <div className="p-2 bg-white dark:bg-gray-800 rounded-xl shadow-xs border border-gray-100 dark:border-gray-700">
                    <span className="block text-xs text-gray-400">Fat</span>
                    <span className="text-sm sm:text-base font-black text-gray-800 dark:text-gray-200">{food.nutritionSummary.fat}g</span>
                  </div>
                </div>

                {/* Key Nutrients Pills */}
                <div className="pt-1">
                  <span className="text-[11px] font-bold text-gray-500 dark:text-gray-400 block mb-1">Key Micro-Nutrients:</span>
                  <div className="flex flex-wrap gap-1.5">
                    {food.keyNutrients.map((n, i) => (
                      <span key={i} className="bg-emerald-100/70 dark:bg-emerald-950 text-emerald-800 dark:text-emerald-300 text-[11px] font-bold px-2 py-0.5 rounded-full">
                        {n}
                      </span>
                    ))}
                  </div>
                </div>
              </div>
            </div>

            {/* Evidence-Based Benefits */}
            <div className="space-y-2">
              <h4 className="text-sm font-extrabold text-gray-900 dark:text-white flex items-center gap-1.5">
                <CheckCircle2 className="w-4 h-4 text-emerald-600" />
                Evidence-Based Health & Biological Benefits
              </h4>
              <p className="text-sm text-gray-600 dark:text-gray-300 leading-relaxed">
                {food.evidenceBasedBenefits}
              </p>
            </div>

            {/* Culinary Uses */}
            <div className="space-y-2 bg-slate-50 dark:bg-gray-900/40 p-4 rounded-xl border border-gray-100 dark:border-gray-800 text-xs">
              <span className="font-bold text-gray-900 dark:text-white uppercase tracking-wider">Traditional & Modern Culinary Preparation:</span>
              <p className="text-gray-600 dark:text-gray-300">{food.culinaryUses}</p>
            </div>

            {/* Safety Caution if present */}
            {food.safetyCaution && (
              <div className="flex items-start gap-2.5 p-3.5 bg-amber-50 dark:bg-amber-950/30 rounded-xl border border-amber-200 dark:border-amber-800/40 text-xs text-amber-900 dark:text-amber-200">
                <AlertTriangle className="w-4 h-4 text-amber-600 shrink-0 mt-0.5" />
                <div>
                  <span className="font-bold">Nutritional Note & Caution: </span>
                  {food.safetyCaution}
                </div>
              </div>
            )}
          </div>
        ))}
      </section>

      {/* Amazon Recommended Products for Nutrition Readers */}
      <AmazonAdBanner 
        format="grid" 
        category="books" 
        maxItems={2} 
        title="Recommended Reading & Nutrition Appliances on Amazon" 
      />

      {/* Conclusion */}
      <section className="bg-gradient-to-br from-emerald-900 to-teal-950 text-white p-8 rounded-3xl shadow-lg space-y-3">
        <h3 className="text-xl font-bold">Summary & Conclusion</h3>
        <p className="text-emerald-100/90 text-sm leading-relaxed">
          {article.conclusion}
        </p>
      </section>

      {/* Sources & Citations */}
      {article.sources && article.sources.length > 0 && (
        <section className="p-6 rounded-2xl bg-white dark:bg-gray-800 border border-gray-100 dark:border-gray-700 space-y-3">
          <h4 className="text-xs font-bold text-gray-400 uppercase tracking-wider flex items-center gap-1.5">
            <BookOpen className="w-4 h-4 text-emerald-600" />
            Verified Scientific & Database Sources
          </h4>
          <ul className="space-y-2 text-xs">
            {article.sources.map((src, idx) => (
              <li key={idx} className="flex items-center justify-between text-gray-600 dark:text-gray-300">
                <span>{src.title} ({src.sourceType})</span>
                <a href={src.url} target="_blank" rel="noopener noreferrer" className="text-emerald-600 dark:text-emerald-400 hover:underline flex items-center gap-1 font-semibold">
                  Visit Source <ExternalLink className="w-3 h-3" />
                </a>
              </li>
            ))}
          </ul>
        </section>
      )}

      {/* Medical Disclaimer Notice */}
      <div className="p-4 rounded-xl bg-gray-100 dark:bg-gray-800 text-gray-500 dark:text-gray-400 text-xs text-center border border-gray-200 dark:border-gray-700">
        <p className="font-bold mb-0.5">Medical & Nutrition Disclaimer</p>
        <p>{article.medicalDisclaimer}</p>
      </div>
    </div>
  );
}
