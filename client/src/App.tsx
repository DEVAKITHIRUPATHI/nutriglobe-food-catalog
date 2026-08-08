import { useEffect } from 'react';
import { Switch, Route, useLocation } from "wouter";
import { QueryClientProvider } from "@tanstack/react-query";
import { queryClient } from "./lib/queryClient";
import { Toaster } from "@/components/ui/toaster";
import { AppProvider } from "@/contexts/AppContext";
import { CartProvider } from "@/contexts/CartContext";
import { Navbar } from "@/components/layout/Navbar";
import { Footer } from "@/components/layout/Footer";
import { ShoppingCart } from "@/components/cart/ShoppingCart";
import { OfflineBanner } from "@/components/layout/OfflineBanner";

import Home from "@/pages/home";
import Foods from "@/pages/foods";
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
import NotFound from "@/pages/not-found";
import { CookieConsentBanner } from "@/components/ads/CookieConsentBanner";

function Layout({ children }: { children: React.ReactNode }) {
  const [location] = useLocation();

  useEffect(() => {
    // Log IP visitor telemetry on page transition
    fetch('/api/analytics/log-visit', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ path: location || window.location.pathname })
    }).catch(() => {});
  }, [location]);

  return (
    // Main layout container with flexbox
    <div className="min-h-screen flex flex-col">
      <OfflineBanner />
      <Navbar />
       {/* Main content area that grows to fill space */}
      <main className="container mx-auto flex-1 px-4 py-6 ">
        {children}

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
