import React from 'react';
import { Skeleton } from '@/components/ui/skeleton';

export function FoodGridSkeleton({ count = 8 }: { count?: number }) {
  return (
    <div className="space-y-6 animate-fadeIn">
      {/* Category Pills & Search Filter Skeleton */}
      <div className="bg-white dark:bg-gray-800 p-4 rounded-2xl border border-gray-100 dark:border-gray-700 shadow-sm space-y-4">
        <div className="flex flex-col sm:flex-row gap-3">
          <Skeleton className="h-10 flex-1 rounded-xl" />
          <Skeleton className="h-10 w-32 rounded-xl" />
        </div>
        <div className="flex gap-2 overflow-x-auto pb-1">
          {Array.from({ length: 6 }).map((_, i) => (
            <Skeleton key={i} className="h-8 w-24 rounded-full shrink-0" />
          ))}
        </div>
      </div>

      {/* Grid of Food Cards Skeleton */}
      <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
        {Array.from({ length: count }).map((_, i) => (
          <div
            key={i}
            className="bg-white dark:bg-gray-800 rounded-2xl overflow-hidden border border-gray-100 dark:border-gray-700 p-4 space-y-3 shadow-sm"
          >
            <Skeleton className="h-44 w-full rounded-xl" />
            <div className="space-y-2">
              <div className="flex items-center justify-between">
                <Skeleton className="h-3 w-16 rounded-full" />
                <Skeleton className="h-3 w-12 rounded-full" />
              </div>
              <Skeleton className="h-5 w-3/4 rounded-md" />
              <Skeleton className="h-3.5 w-full rounded-md" />
            </div>
            <div className="pt-2 border-t border-gray-100 dark:border-gray-700 flex items-center justify-between">
              <Skeleton className="h-6 w-16 rounded-lg" />
              <Skeleton className="h-6 w-20 rounded-lg" />
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

export function CalculatorPageSkeleton() {
  return (
    <div className="space-y-8 max-w-6xl mx-auto py-6 animate-fadeIn">
      {/* Sync Banner Skeleton */}
      <Skeleton className="h-14 w-full rounded-2xl" />

      {/* Calculator Header & Controls Skeleton */}
      <div className="bg-slate-900 rounded-3xl p-6 md:p-8 space-y-6 border border-slate-800">
        <div className="flex items-center justify-between">
          <div className="space-y-2">
            <Skeleton className="h-7 w-64 bg-slate-800 rounded-lg" />
            <Skeleton className="h-4 w-96 bg-slate-800/60 rounded-md" />
          </div>
          <Skeleton className="h-10 w-28 bg-slate-800 rounded-xl" />
        </div>

        {/* Input Form Controls Grid Skeleton */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          {Array.from({ length: 4 }).map((_, i) => (
            <div key={i} className="space-y-2 bg-slate-950/60 p-4 rounded-2xl border border-slate-800">
              <Skeleton className="h-3.5 w-20 bg-slate-800 rounded" />
              <Skeleton className="h-9 w-full bg-slate-800 rounded-xl" />
            </div>
          ))}
        </div>
      </div>

      {/* Results Macro Cards Skeleton */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        {Array.from({ length: 4 }).map((_, i) => (
          <div key={i} className="bg-white dark:bg-gray-800 p-5 rounded-2xl border border-gray-100 dark:border-gray-700 space-y-3">
            <Skeleton className="h-4 w-24 rounded" />
            <Skeleton className="h-8 w-20 rounded-md" />
            <Skeleton className="h-2 w-full rounded-full" />
          </div>
        ))}
      </div>

      {/* Chart Skeleton Container */}
      <div className="bg-white dark:bg-gray-800 p-6 rounded-3xl border border-gray-100 dark:border-gray-700 space-y-4">
        <Skeleton className="h-6 w-48 rounded-md" />
        <Skeleton className="h-64 w-full rounded-2xl" />
      </div>
    </div>
  );
}

export function FeedPageSkeleton() {
  return (
    <div className="space-y-8 max-w-7xl mx-auto pb-12 animate-fadeIn">
      {/* Feed Hero Skeleton */}
      <div className="rounded-3xl bg-slate-900 p-8 md:p-12 space-y-4 border border-slate-800">
        <Skeleton className="h-6 w-44 bg-slate-800 rounded-full" />
        <Skeleton className="h-10 w-3/4 bg-slate-800 rounded-xl" />
        <Skeleton className="h-4 w-1/2 bg-slate-800/60 rounded-md" />
      </div>

      {/* Filter Tabs Skeleton */}
      <div className="flex gap-2 overflow-x-auto pb-2">
        {Array.from({ length: 5 }).map((_, i) => (
          <Skeleton key={i} className="h-9 w-32 rounded-full shrink-0" />
        ))}
      </div>

      {/* Feed Cards Stream Skeleton */}
      <div className="space-y-6">
        {Array.from({ length: 3 }).map((_, i) => (
          <div key={i} className="bg-white dark:bg-gray-800 rounded-3xl p-6 border border-gray-100 dark:border-gray-700 grid grid-cols-1 lg:grid-cols-12 gap-6">
            <Skeleton className="lg:col-span-5 h-60 rounded-2xl" />
            <div className="lg:col-span-7 space-y-4 flex flex-col justify-between">
              <div className="space-y-3">
                <Skeleton className="h-4 w-28 rounded-full" />
                <Skeleton className="h-7 w-4/5 rounded-lg" />
                <Skeleton className="h-4 w-full rounded-md" />
                <Skeleton className="h-4 w-2/3 rounded-md" />
              </div>
              <div className="flex gap-2">
                {Array.from({ length: 5 }).map((_, j) => (
                  <Skeleton key={j} className="h-6 w-16 rounded-lg" />
                ))}
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

export function BlogPageSkeleton() {
  return (
    <div className="space-y-10 max-w-7xl mx-auto pb-12 animate-fadeIn">
      {/* Blog Title Skeleton */}
      <div className="text-center space-y-3 py-6">
        <Skeleton className="h-6 w-48 mx-auto rounded-full" />
        <Skeleton className="h-10 w-2/3 mx-auto rounded-xl" />
        <Skeleton className="h-4 w-1/2 mx-auto rounded-md" />
      </div>

      {/* Featured Article Skeleton */}
      <div className="rounded-3xl bg-slate-900 p-8 grid grid-cols-1 lg:grid-cols-12 gap-6 border border-slate-800">
        <div className="lg:col-span-7 space-y-4">
          <Skeleton className="h-5 w-32 bg-slate-800 rounded-full" />
          <Skeleton className="h-8 w-4/5 bg-slate-800 rounded-xl" />
          <Skeleton className="h-4 w-full bg-slate-800/60 rounded-md" />
        </div>
        <Skeleton className="lg:col-span-5 h-64 bg-slate-800 rounded-2xl" />
      </div>

      {/* Grid of Articles Skeleton */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {Array.from({ length: 6 }).map((_, i) => (
          <div key={i} className="bg-white dark:bg-gray-800 rounded-2xl p-5 border border-gray-100 dark:border-gray-700 space-y-3">
            <Skeleton className="h-48 w-full rounded-xl" />
            <Skeleton className="h-4 w-20 rounded-full" />
            <Skeleton className="h-6 w-3/4 rounded-lg" />
            <Skeleton className="h-4 w-full rounded-md" />
          </div>
        ))}
      </div>
    </div>
  );
}

export function ArticlePageSkeleton() {
  return (
    <div className="max-w-4xl mx-auto py-8 space-y-8 animate-fadeIn">
      <Skeleton className="h-6 w-32 rounded-full" />
      <Skeleton className="h-10 w-4/5 rounded-xl" />
      <div className="flex items-center gap-4">
        <Skeleton className="h-10 w-10 rounded-full" />
        <div className="space-y-1">
          <Skeleton className="h-4 w-32 rounded" />
          <Skeleton className="h-3 w-24 rounded" />
        </div>
      </div>
      <Skeleton className="h-96 w-full rounded-3xl" />
      <div className="space-y-4">
        <Skeleton className="h-4 w-full rounded" />
        <Skeleton className="h-4 w-full rounded" />
        <Skeleton className="h-4 w-3/4 rounded" />
      </div>
    </div>
  );
}

export function GenericPageSkeleton() {
  return (
    <div className="max-w-5xl mx-auto py-10 space-y-6 animate-fadeIn">
      <Skeleton className="h-10 w-64 rounded-xl" />
      <Skeleton className="h-4 w-3/4 rounded-md" />
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 pt-4">
        {Array.from({ length: 3 }).map((_, i) => (
          <div key={i} className="bg-white dark:bg-gray-800 p-6 rounded-2xl border border-gray-100 dark:border-gray-700 space-y-4">
            <Skeleton className="h-6 w-32 rounded-md" />
            <Skeleton className="h-4 w-full rounded" />
            <Skeleton className="h-4 w-5/6 rounded" />
            <Skeleton className="h-20 w-full rounded-xl" />
          </div>
        ))}
      </div>
    </div>
  );
}

export function PageSkeleton({ variant = 'generic' }: { variant?: 'food' | 'calculator' | 'feed' | 'blog' | 'article' | 'generic' }) {
  switch (variant) {
    case 'food':
      return <FoodGridSkeleton />;
    case 'calculator':
      return <CalculatorPageSkeleton />;
    case 'feed':
      return <FeedPageSkeleton />;
    case 'blog':
      return <BlogPageSkeleton />;
    case 'article':
      return <ArticlePageSkeleton />;
    default:
      return <GenericPageSkeleton />;
  }
}
