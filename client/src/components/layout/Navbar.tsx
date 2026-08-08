import { useContext, useState, useEffect } from 'react';
import { Link, useLocation } from 'wouter';
import { LanguageSelector } from '@/components/ui/language-selector';
import { DataSyncStatusIndicator } from '@/components/layout/DataSyncStatusIndicator';
import { AppContext } from '@/contexts/AppContext';
import { CartContext } from '@/contexts/CartContext';
import { useTranslation } from '@/hooks/useTranslation';
import { NutriFactsLogo } from '@/components/layout/NutriFactsLogo';
import { 
  Leaf, Heart, Menu, X, Wifi, WifiOff, Home, Apple, Info, 
  ScrollText, Globe, ChevronRight, Calculator, ShieldCheck
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Sheet, SheetContent, SheetHeader, SheetTitle, SheetTrigger } from '@/components/ui/sheet';
import { useIsMobile } from '@/hooks/use-mobile';

export function Navbar() {
  const { offlineStatus, toggleOfflineMode, language } = useContext(AppContext);
  const { cartItems, openCart } = useContext(CartContext);
  const { getLocalizedText } = useTranslation();
  const [location] = useLocation();
  const [isOpen, setIsOpen] = useState(false);
  const isMobile = useIsMobile();
  
  // Close mobile menu when navigating to a new page
  useEffect(() => {
    setIsOpen(false);
  }, [location]);

  // Close mobile menu when switching to desktop view
  useEffect(() => {
    if (!isMobile) {
      setIsOpen(false);
    }
  }, [isMobile]);

  return (
    <nav className="bg-gradient-to-r from-emerald-950 via-teal-900 to-emerald-950 text-white shadow-xl sticky top-0 z-40 border-b border-emerald-700/40 backdrop-blur-md">
      <div className="container mx-auto px-4 py-2.5 flex items-center justify-between gap-3">
        {/* Logo */}
        <Link href="/" className="flex items-center gap-2 group shrink-0 py-0.5">
          <NutriFactsLogo variant="horizontal" size="md" />
          <span className="hidden xl:inline-block bg-amber-400/90 text-amber-950 text-[10px] font-black px-2 py-0.5 rounded-full shadow-sm uppercase tracking-wider shrink-0">
            100k+ Foods
          </span>
        </Link>
        
        {/* Desktop Navigation - Single Clean Horizontal Row */}
        <div className="hidden lg:flex items-center shrink-0">
          <nav className="flex items-center gap-1.5 bg-emerald-950/80 p-1.5 rounded-xl border border-emerald-700/50 backdrop-blur-md">
            {/* Home - Emerald */}
            <Link href="/">
              <span className={`px-3 py-1.5 rounded-lg text-xs font-extrabold cursor-pointer transition-all flex items-center gap-1.5 border whitespace-nowrap ${
                location === '/' 
                  ? 'bg-emerald-600 text-white border-emerald-400 shadow-md shadow-emerald-900/40' 
                  : 'bg-emerald-500/10 text-emerald-200 border-emerald-500/20 hover:bg-emerald-500/30 hover:text-white'
              }`}>
                <Home className="w-3.5 h-3.5 text-emerald-300 shrink-0" />
                <span>{getLocalizedText('nav.home')}</span>
              </span>
            </Link>

            {/* Foods - Sky Blue */}
            <Link href="/foods">
              <span className={`px-3 py-1.5 rounded-lg text-xs font-extrabold cursor-pointer transition-all flex items-center gap-1.5 border whitespace-nowrap ${
                location === '/foods' 
                  ? 'bg-sky-600 text-white border-sky-400 shadow-md shadow-sky-900/40' 
                  : 'bg-sky-500/10 text-sky-200 border-sky-500/20 hover:bg-sky-500/30 hover:text-white'
              }`}>
                <Apple className="w-3.5 h-3.5 text-sky-300 shrink-0" />
                <span>{getLocalizedText('nav.foods')}</span>
              </span>
            </Link>

            {/* Single Combined Nutrition Hub - Amber / Flame */}
            <Link href="/feed">
              <span className={`px-3 py-1.5 rounded-lg text-xs font-extrabold cursor-pointer transition-all flex items-center gap-1.5 border whitespace-nowrap ${
                location === '/feed' || location === '/blog' || location.startsWith('/blog/') 
                  ? 'bg-amber-600 text-white border-amber-400 shadow-md shadow-amber-900/40' 
                  : 'bg-amber-500/10 text-amber-200 border-amber-500/20 hover:bg-amber-500/30 hover:text-white'
              }`}>
                <ScrollText className="w-3.5 h-3.5 text-amber-300 shrink-0" />
                <span>Nutrition Hub & Feed</span>
                <span className="w-1.5 h-1.5 rounded-full bg-amber-400 animate-ping shrink-0"></span>
              </span>
            </Link>

            {/* Nutrition - Rose / Pink */}
            <Link href="/nutrition">
              <span className={`px-3 py-1.5 rounded-lg text-xs font-extrabold cursor-pointer transition-all flex items-center gap-1.5 border whitespace-nowrap ${
                location === '/nutrition' 
                  ? 'bg-rose-600 text-white border-rose-400 shadow-md shadow-rose-900/40' 
                  : 'bg-rose-500/10 text-rose-200 border-rose-500/20 hover:bg-rose-500/30 hover:text-white'
              }`}>
                <Leaf className="w-3.5 h-3.5 text-rose-300 shrink-0" />
                <span>{getLocalizedText('nav.nutrition')}</span>
              </span>
            </Link>

            {/* Calculator - Indigo / Cyan */}
            <Link href="/calculator">
              <span className={`px-3 py-1.5 rounded-lg text-xs font-extrabold cursor-pointer transition-all flex items-center gap-1.5 border whitespace-nowrap ${
                location === '/calculator' 
                  ? 'bg-indigo-600 text-white border-indigo-400 shadow-md shadow-indigo-900/40' 
                  : 'bg-indigo-500/10 text-indigo-200 border-indigo-500/20 hover:bg-indigo-500/30 hover:text-white'
              }`}>
                <Calculator className="w-3.5 h-3.5 text-indigo-300 shrink-0" />
                <span>RDA & Calorie Calculator</span>
              </span>
            </Link>
          </nav>
        </div>
        
        {/* Actions */}
        <div className="flex items-center space-x-3">
          {/* Language Selector */}
          <LanguageSelector />
          {/* End Language Selector */}
          
          {/* Favorites Button */}
          <button 
            onClick={openCart}
            className="relative p-2 text-emerald-100 hover:text-white bg-emerald-950/40 hover:bg-emerald-800/60 rounded-xl border border-emerald-700/40 transition-all"
            aria-label={getLocalizedText('button.favorites')}
          >
            <Heart 
              className="h-5 w-5 text-rose-400" 
              fill={cartItems.length > 0 ? "currentColor" : "none"} 
            />
            {cartItems.length > 0 && (
              <span className="absolute -top-1 -right-1 bg-rose-500 text-white text-[10px] font-black rounded-full h-4 w-4 flex items-center justify-center shadow-md">
                {cartItems.length}
              </span>
            )}
          </button>

          {/* Toggle offline - Desktop */}
          <Button 
            onClick={toggleOfflineMode} 
            variant="outline" 
            size="sm"
            className="hidden md:flex items-center space-x-1.5 bg-emerald-950/60 hover:bg-emerald-800/80 text-emerald-100 hover:text-white border-emerald-600/50 rounded-xl px-3 py-1.5 text-xs font-semibold h-auto backdrop-blur-sm transition-all"
          >
            {offlineStatus === 'offline' ? (
              <>
                <WifiOff className="h-3.5 w-3.5 text-rose-400 mr-1 animate-pulse" />
                {getLocalizedText('button.goOnline')}
              </>
            ) : (
              <>
                <Wifi className="h-3.5 w-3.5 text-emerald-300 mr-1" />
                {getLocalizedText('button.testOffline')}
              </>
            )}
          </Button>
          
          {/* Mobile menu */}
          <Sheet open={isOpen} onOpenChange={setIsOpen}>
            <SheetTrigger asChild>
              <button 
                className="md:hidden p-2 rounded-md text-gray-600 hover:text-primary-500 dark:text-gray-300 dark:hover:text-white"
                aria-label={getLocalizedText('button.menu')}
              >
                <Menu className="h-5 w-5" />
                {/* Mobile Menu Icon */}
              </button>
            </SheetTrigger>
            <SheetContent side="right" className="w-[85vw] sm:w-[385px] p-0">
              <div className="flex flex-col h-full">
                <SheetHeader className="p-4 border-b">
                  <div className="flex justify-between items-center">
                    <SheetTitle className="flex items-center">
                      <Leaf className="text-primary-500 mr-2" />
                      <span>{getLocalizedText('app.name')}</span>
                    </SheetTitle>
                    <button 
                      onClick={() => setIsOpen(false)} 
                      className="rounded-full p-1 hover:bg-gray-100 dark:hover:bg-gray-700"
                      aria-label={getLocalizedText('button.close')}
                    >
                      <X className="h-5 w-5" />
                    </button>
                  </div>
                </SheetHeader>
                
                <div className="overflow-y-auto flex-1 py-2">
                  {/* Navigation Links */}
                  <div className="px-4 py-2">
                    <h3 className="text-sm font-medium text-gray-500 dark:text-gray-400 mb-2">
                      {getLocalizedText('nav.main')}
                    </h3>
                    <nav className="space-y-1">
                      <Link href="/">
                        <div className={`flex items-center px-3 py-3 rounded-lg text-base font-medium ${location === '/' ? 'bg-primary-50 text-primary-600 dark:bg-primary-900/20 dark:text-primary-400' : 'hover:bg-gray-50 dark:hover:bg-gray-800'} cursor-pointer`}>
                          <Home className="h-5 w-5 mr-3" />
                          {getLocalizedText('nav.home')}
                          <ChevronRight className="h-4 w-4 ml-auto" />
                        </div>
                      </Link>
                      <Link href="/foods">
                        <div className={`flex items-center px-3 py-3 rounded-lg text-base font-medium ${location === '/foods' ? 'bg-primary-50 text-primary-600 dark:bg-primary-900/20 dark:text-primary-400' : 'hover:bg-gray-50 dark:hover:bg-gray-800'} cursor-pointer`}>
                          <Apple className="h-5 w-5 mr-3" />
                          {getLocalizedText('nav.foods')}
                          <ChevronRight className="h-4 w-4 ml-auto" />
                        </div>
                      </Link>
                      <Link href="/feed">
                        <div className={`flex items-center px-3 py-3 rounded-lg text-base font-medium ${location === '/feed' || location === '/blog' ? 'bg-primary-50 text-primary-600 dark:bg-primary-900/20 dark:text-primary-400' : 'hover:bg-gray-50 dark:hover:bg-gray-800'} cursor-pointer`}>
                          <ScrollText className="h-5 w-5 mr-3 text-emerald-600" />
                          Food Knowledge & Feed
                          <ChevronRight className="h-4 w-4 ml-auto" />
                        </div>
                      </Link>
                      <Link href="/editorial-policy">
                        <div className={`flex items-center px-3 py-3 rounded-lg text-base font-medium ${location === '/editorial-policy' ? 'bg-primary-50 text-primary-600 dark:bg-primary-900/20 dark:text-primary-400' : 'hover:bg-gray-50 dark:hover:bg-gray-800'} cursor-pointer`}>
                          <Info className="h-5 w-5 mr-3 text-emerald-600" />
                          Editorial & AI Policy
                          <ChevronRight className="h-4 w-4 ml-auto" />
                        </div>
                      </Link>
                      <Link href="/nutrition">
                        <div className={`flex items-center px-3 py-3 rounded-lg text-base font-medium ${location === '/nutrition' ? 'bg-primary-50 text-primary-600 dark:bg-primary-900/20 dark:text-primary-400' : 'hover:bg-gray-50 dark:hover:bg-gray-800'} cursor-pointer`}>
                          <ScrollText className="h-5 w-5 mr-3" />
                          {getLocalizedText('nav.nutrition')}
                          <ChevronRight className="h-4 w-4 ml-auto" />
                        </div>
                      </Link>
                      <Link href="/calculator">
                        <div className={`flex items-center px-3 py-3 rounded-lg text-base font-medium ${location === '/calculator' ? 'bg-primary-50 text-primary-600 dark:bg-primary-900/20 dark:text-primary-400' : 'hover:bg-gray-50 dark:hover:bg-gray-800'} cursor-pointer`}>
                          <Calculator className="h-5 w-5 mr-3 text-indigo-600" />
                          RDA & Calorie Calculator
                          <ChevronRight className="h-4 w-4 ml-auto" />
                        </div>
                      </Link>
                      <Link href="/about">
                        <div className={`flex items-center px-3 py-3 rounded-lg text-base font-medium ${location === '/about' ? 'bg-primary-50 text-primary-600 dark:bg-primary-900/20 dark:text-primary-400' : 'hover:bg-gray-50 dark:hover:bg-gray-800'} cursor-pointer`}>
                          <Info className="h-5 w-5 mr-3" />
                          {getLocalizedText('nav.about')}
                          <ChevronRight className="h-4 w-4 ml-auto" />
                        </div>
                      </Link>
                    </nav>
                  </div>
                  
                  {/* Current Language */}
                  <div className="px-4 py-2 mt-6">
                    <h3 className="text-sm font-medium text-gray-500 dark:text-gray-400 mb-2">
                      {getLocalizedText('language.current')}
                    </h3>
                    <div className="flex items-center px-3 py-3 rounded-lg bg-gray-50 dark:bg-gray-800">
                      <Globe className="h-5 w-5 mr-3 text-primary-500" />
                      <div>
                        <div className="font-medium">{language}</div>
                        <div className="text-sm text-gray-500 dark:text-gray-400">
                          {getLocalizedText('language.switchLanguage')}
                        </div>
                      </div>
                    </div>
                  </div>
                  
                  {/* Mobile Only Actions */}
                  <div className="px-4 py-2 mt-6">
                    <h3 className="text-sm font-medium text-gray-500 dark:text-gray-400 mb-2">
                      {getLocalizedText('actions.title')}
                    </h3>
                    <div className="space-y-3">
                      <button
                        onClick={() => {
                          toggleOfflineMode();
                          setIsOpen(false);
                        }}
                        className="w-full flex items-center px-3 py-3 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-800 font-medium"
                      >
                        {offlineStatus === 'offline' ? (
                          <>
                            <WifiOff className="h-5 w-5 text-red-500 mr-3" />
                            {getLocalizedText('button.goOnline')}
                          </>
                        ) : (
                          <>
                            <Wifi className="h-5 w-5 mr-3" />
                            {getLocalizedText('button.testOffline')}
                          </>
                        )}
                      </button>
                      <button
                        onClick={() => {
                          openCart();
                          setIsOpen(false);
                        }}
                        className="w-full flex items-center px-3 py-3 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-800 font-medium"
                      >
                        <Heart className="h-5 w-5 text-pink-500 mr-3" fill={cartItems.length > 0 ? "currentColor" : "none"} />
                        {getLocalizedText('nav.favorites')}
                        {cartItems.length > 0 && (
                          <span className="ml-2 bg-pink-500 text-white text-xs font-bold rounded-full h-5 w-5 flex items-center justify-center">
                            {cartItems.length}
                          </span>
                        )}
                      </button>
                    </div>
                  </div>
                </div>
                
                {/* Footer */}
                <div className="p-4 border-t mt-auto">
                  <div className="text-center text-sm text-gray-500 dark:text-gray-400">
                    NutriGlobe © {new Date().getFullYear()}
                  </div>
                </div>
              </div>
            </SheetContent>
          </Sheet>
        </div>
      </div>
    </nav>
  );
}
