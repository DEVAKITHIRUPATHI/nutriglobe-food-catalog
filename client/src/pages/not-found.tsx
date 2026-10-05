import React, { useState, useEffect } from 'react';
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { AlertCircle, Search, Home, Utensils, Calculator, ArrowRight, Sprout } from "lucide-react";
import { Link, useLocation } from "wouter";

const POPULAR_FOODS = [
  { name: 'Banana', slug: 'banana' },
  { name: 'Fuji Apple', slug: 'fuji-apple' },
  { name: 'Tender Coconut', slug: 'tender-coconut' },
  { name: 'Dragon Fruit', slug: 'dragon-fruit' },
  { name: 'Spinach', slug: 'spinach' },
  { name: 'Almonds', slug: 'almonds' },
];

export default function NotFound() {
  const [, setLocation] = useLocation();
  const [searchQuery, setSearchQuery] = useState('');

  useEffect(() => {
    document.title = 'Page Not Found (404) | NutriFacts';
    let robots = document.querySelector('meta[name="robots"]');
    if (!robots) {
      robots = document.createElement('meta');
      robots.setAttribute('name', 'robots');
      document.head.appendChild(robots);
    }
    robots.setAttribute('content', 'noindex, nofollow');
  }, []);

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    if (searchQuery.trim()) {
      setLocation(`/foods?search=${encodeURIComponent(searchQuery.trim())}`);
    } else {
      setLocation('/foods');
    }
  };

  return (
    <div className="min-h-[70vh] w-full flex items-center justify-center py-12 px-4">
      <Card className="w-full max-w-2xl bg-white dark:bg-slate-900 border-slate-200 dark:border-slate-800 rounded-3xl shadow-lg overflow-hidden">
        <CardContent className="p-8 sm:p-10 space-y-6 text-center sm:text-left">
          {/* Header Badge & Title */}
          <div className="space-y-3">
            <div className="inline-flex items-center gap-2 px-3 py-1 bg-rose-500/10 text-rose-600 dark:text-rose-400 border border-rose-500/20 text-xs font-black rounded-full uppercase tracking-wider">
              <AlertCircle className="h-4 w-4" />
              <span>Error 404 • Resource Not Found</span>
            </div>
            <h1 className="text-3xl sm:text-4xl font-extrabold text-slate-900 dark:text-white tracking-tight">
              We Couldn't Find That Food Page
            </h1>
            <p className="text-sm text-slate-600 dark:text-slate-400 leading-relaxed max-w-xl">
              The food cultivar, article, or resource URL you requested may have been relocated, renamed to its canonical botanical slug, or does not exist in our catalog.
            </p>
          </div>

          {/* Quick Catalog Search Bar */}
          <form onSubmit={handleSearch} className="flex flex-col sm:flex-row gap-2 pt-2">
            <div className="relative flex-1">
              <Search className="absolute left-3.5 top-3 h-4 w-4 text-slate-400" />
              <Input
                type="text"
                placeholder="Search 1,379 foods (e.g. apple, coconut, ragi)..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="pl-10 rounded-xl border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800/80 text-sm h-11"
              />
            </div>
            <Button
              type="submit"
              className="bg-emerald-600 hover:bg-emerald-500 text-white font-bold rounded-xl h-11 px-6 shadow-sm"
            >
              Search Catalog
            </Button>
          </form>

          {/* Popular Food Suggestions */}
          <div className="space-y-2 pt-2 text-left">
            <span className="text-xs font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wider block">
              Popular Verified Food Records:
            </span>
            <div className="flex flex-wrap gap-2">
              {POPULAR_FOODS.map(food => (
                <Link key={food.slug} href={`/food/${food.slug}`}>
                  <span className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-slate-100 hover:bg-emerald-50 dark:bg-slate-800 dark:hover:bg-emerald-950/60 border border-slate-200 dark:border-slate-700 text-xs font-semibold text-slate-700 dark:text-slate-300 hover:text-emerald-600 dark:hover:text-emerald-400 transition-colors cursor-pointer">
                    <Sprout className="w-3.5 h-3.5 text-emerald-500" />
                    <span>{food.name}</span>
                  </span>
                </Link>
              ))}
            </div>
          </div>

          {/* Core Navigation Recovery Links */}
          <div className="pt-4 border-t border-slate-100 dark:border-slate-800 flex flex-wrap items-center justify-between gap-3 text-xs">
            <div className="flex flex-wrap gap-2">
              <Link href="/">
                <Button variant="outline" size="sm" className="rounded-xl gap-1.5 border-slate-200 dark:border-slate-700">
                  <Home className="w-3.5 h-3.5 text-emerald-600" />
                  <span>Home</span>
                </Button>
              </Link>
              <Link href="/foods">
                <Button variant="outline" size="sm" className="rounded-xl gap-1.5 border-slate-200 dark:border-slate-700">
                  <Utensils className="w-3.5 h-3.5 text-emerald-600" />
                  <span>All 1,379 Foods</span>
                </Button>
              </Link>
              <Link href="/calculator">
                <Button variant="outline" size="sm" className="rounded-xl gap-1.5 border-slate-200 dark:border-slate-700">
                  <Calculator className="w-3.5 h-3.5 text-emerald-600" />
                  <span>RDA Calculator</span>
                </Button>
              </Link>
            </div>

            <Link href="/contact">
              <span className="text-emerald-600 dark:text-emerald-400 hover:underline font-bold inline-flex items-center gap-1 cursor-pointer">
                Report Broken Link <ArrowRight className="w-3 h-3" />
              </span>
            </Link>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
