import React, { useEffect, useContext } from 'react';
import { Switch, Route, useLocation } from "wouter";
import { QueryClientProvider } from "@tanstack/react-query";
import { queryClient } from "./lib/queryClient";
import { Toaster } from "@/components/ui/toaster";
import { AppProvider, AppContext } from "@/contexts/AppContext";
import { CartProvider } from "@/contexts/CartContext";
import { Navbar } from "@/components/layout/Navbar";
import { Footer } from "@/components/layout/Footer";
import { ShoppingCart } from "@/components/cart/ShoppingCart";
import { OfflineBanner } from "@/components/layout/OfflineBanner";
import { GlobalLoadingIndicator } from "@/components/ui/GlobalLoadingIndicator";
import { PageSkeleton } from "@/components/ui/PageSkeleton";
import { motion, AnimatePresence } from "framer-motion";

import Home from "@/pages/home";
import Foods from "@/pages/foods";
import FoodDetailPage from "@/pages/food-detail";
import Nutrition from "@/pages/nutrition";
import CalculatorPage from "@/pages/calculator";
import About from "@/pages/about";
import AdminPage from "@/pages/admin";
import FeedPage from "@/pages/feed";
import BlogPage from "@/pages/blog";
import ArticlePage from "@/pages/article";
import EditorialPolicyPage from "@/pages/editorialPolicy";
import PrivacyPage from "@/pages/privacy";
import TermsPage from "@/pages/terms";
import ContactPage from "@/pages/contact";
import DashboardPage from "@/pages/dashboard";
import NotFound from "@/pages/not-found";
import { CookieConsentBanner } from "@/components/ads/CookieConsentBanner";

function Layout({ children }: { children: React.ReactNode }) {
  const [location] = useLocation();
  const { isLoading: isAppLoading } = useContext(AppContext);

  useEffect(() => {
    // Log IP visitor telemetry on page transition
    fetch('/api/analytics/log-visit', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ path: location || window.location.pathname })
    }).catch(() => {});
  }, [location]);

  // Route-aware skeleton type matcher
  const getSkeletonVariant = (path: string): 'food' | 'calculator' | 'feed' | 'blog' | 'article' | 'generic' => {
    if (path === '/' || path === '/foods' || path.startsWith('/food/') || path.startsWith('/foods/')) return 'food';
    if (path === '/calculator') return 'calculator';
    if (path === '/feed') return 'feed';
    if (path === '/blog') return 'blog';
    if (path.startsWith('/blog/')) return 'article';
    return 'generic';
  };

  return (
    // Main layout container with flexbox
    <div id="nutriglobe-app-root" className="min-h-screen flex flex-col relative bg-slate-50/50 dark:bg-slate-950">
      <GlobalLoadingIndicator />
      <OfflineBanner />
      <Navbar />
      
      {/* Main content area that grows to fill space with Framer Motion transitions */}
      <main id="main-content-region" className="container mx-auto flex-1 px-4 py-6">
        <AnimatePresence mode="wait">
          {isAppLoading ? (
            <motion.div
              key={`skeleton-${location}`}
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              transition={{ duration: 0.2 }}
              className="w-full"
            >
              <PageSkeleton variant={getSkeletonVariant(location)} />
            </motion.div>
          ) : (
            <motion.div
              key={location}
              initial={{ opacity: 0, y: 6 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -6 }}
              transition={{ duration: 0.22, ease: 'easeOut' }}
              className="w-full"
            >
              {children}
            </motion.div>
          )}
        </AnimatePresence>
      </main>

      <Footer />
      <ShoppingCart />
      <CookieConsentBanner />
    </div>
  );
}


function Router() {
  return (
    <Switch>
      <Route path="/">
        <Layout>
          <Home />
        </Layout>
      </Route>
      <Route path="/foods">
        <Layout>
          <Foods />
        </Layout>
      </Route>
      <Route path="/foods/:id">
        <Layout>
          <FoodDetailPage />
        </Layout>
      </Route>
      <Route path="/food/:id">
        <Layout>
          <FoodDetailPage />
        </Layout>
      </Route>
      <Route path="/feed">
        <Layout>
          <FeedPage />
        </Layout>
      </Route>
      <Route path="/blog">
        <Layout>
          <FeedPage />
        </Layout>
      </Route>
      <Route path="/blog/:slug">
        <Layout>
          <ArticlePage />
        </Layout>
      </Route>
      <Route path="/editorial-policy">
        <Layout>
          <EditorialPolicyPage />
        </Layout>
      </Route>
      <Route path="/privacy">
        <Layout>
          <PrivacyPage />
        </Layout>
      </Route>
      <Route path="/terms">
        <Layout>
          <TermsPage />
        </Layout>
      </Route>
      <Route path="/contact">
        <Layout>
          <ContactPage />
        </Layout>
      </Route>
      <Route path="/nutrition">
        <Layout>
          <Nutrition />
        </Layout>
      </Route>
      <Route path="/calculator">
        <Layout>
          <CalculatorPage />
        </Layout>
      </Route>
      <Route path="/about">
        <Layout>
          <About />
        </Layout>
      </Route>
      <Route path="/admin">
        <Layout>
          <AdminPage />
        </Layout>
      </Route>
      <Route path="/dashboard">
        <Layout>
          <DashboardPage />
        </Layout>
      </Route>
      <Route>
        <Layout>
          <NotFound />
        </Layout>
      </Route>
    </Switch>
  );
}

function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <AppProvider>
        <CartProvider>
          <Router />
          <Toaster />
        </CartProvider>
      </AppProvider>
    </QueryClientProvider>
  );
}

export default App;
