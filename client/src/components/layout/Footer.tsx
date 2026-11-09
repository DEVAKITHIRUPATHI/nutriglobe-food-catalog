import { useTranslation } from '@/hooks/useTranslation';
import { Link } from 'wouter';
import { Facebook, Twitter, Instagram, Linkedin, Info, Database, Download } from 'lucide-react';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { NutriFactsLogo } from '@/components/layout/NutriFactsLogo';

export function Footer() {
  const { getLocalizedText } = useTranslation();

  return (
    <footer className="bg-gray-900 text-white py-10 border-t border-gray-800">
      <div className="container mx-auto px-4">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
          <div>
            <Link href="/" className="inline-block mb-3">
              <NutriFactsLogo variant="full" size="lg" className="bg-emerald-950/60 p-2 rounded-xl border border-emerald-800/60" />
            </Link>
            <p className="text-gray-400 text-sm mt-2 leading-relaxed">
              Global clinical food database & WHO/USDA nutrition facts calculator. Explore, nourish, and transform your health.
            </p>
          </div>
          
          <div>
            <h3 className="text-lg font-bold mb-3 text-emerald-400">
              {getLocalizedText('footer.quickLinks')}
            </h3>
            <ul className="space-y-2">
              <li>
                <Link href="/" className="text-gray-400 hover:text-white transition">
                  {getLocalizedText('nav.home')}
                </Link>
              </li>
              <li>
                <Link href="/about" className="text-emerald-300 font-bold hover:text-white transition flex items-center gap-1.5">
                  <Info className="w-3.5 h-3.5 text-emerald-400" />
                  <span>About NutriFacts</span>
                </Link>
              </li>
              <li>
                <Link href="/foods" className="text-gray-400 hover:text-white transition">
                  {getLocalizedText('nav.foods')}
                </Link>
              </li>
              <li>
                <Link href="/feed" className="text-gray-400 hover:text-white transition">
                  Food Knowledge & Feed
                </Link>
              </li>
              <li>
                <Link href="/contact" className="text-gray-400 hover:text-white transition">
                  {getLocalizedText('nav.contact')}
                </Link>
              </li>
              <li>
                <Link href="/quality" className="text-emerald-300 font-bold hover:text-white transition flex items-center gap-1.5">
                  <Database className="w-3.5 h-3.5 text-emerald-400" />
                  <span>Food Intelligence &amp; Quality</span>
                </Link>
              </li>
              <li>
                <Link href="/emergency-food" className="text-rose-400 font-bold hover:text-white transition flex items-center gap-1.5">
                  <span>🚨</span>
                  <span>Emergency &amp; Disaster Food Intelligence</span>
                </Link>
              </li>
            </ul>
          </div>
          
          <div>
            <h3 className="text-lg font-bold mb-3 text-emerald-400">
              {getLocalizedText('footer.features')}
            </h3>
            <ul className="space-y-2">
              <li>
                <Link href="/nutrition" className="text-gray-400 hover:text-white transition">
                  {getLocalizedText('feature.database')}
                </Link>
              </li>
              <li>
                <Link href="/calculator" className="text-emerald-400 hover:text-emerald-300 font-medium transition flex items-center gap-1.5">
                  <span>RDA & Calorie Calculator</span>
                  <span className="bg-indigo-900/80 text-indigo-300 px-1.5 py-0.5 rounded text-[10px] uppercase font-bold">Clinical</span>
                </Link>
              </li>
              <li>
                <Link href="/foods" className="text-gray-400 hover:text-white transition">
                  45+ Global Languages Catalog
                </Link>
              </li>
              <li>
                <Link href="/about" className="text-gray-400 hover:text-white transition">
                  Offline PWA &amp; WHO Standards
                </Link>
              </li>
            </ul>
          </div>
          
          <div>
            <h3 className="text-lg font-bold mb-3 text-emerald-400">
              {getLocalizedText('footer.newsletter')}
            </h3>
            <p className="text-gray-400 text-sm mb-3">
              {getLocalizedText('newsletter.description')}
            </p>
            <form className="flex" onSubmit={(e) => e.preventDefault()}>
              <Input 
                type="email" 
                className="flex-1 bg-gray-800 text-white text-sm rounded-l-md focus:outline-none border-gray-700" 
                placeholder="Email address"
              />
              <Button 
                type="submit"
                className="bg-emerald-600 hover:bg-emerald-500 px-3 py-2 rounded-r-md text-sm font-medium transition-colors"
              >
                {getLocalizedText('button.subscribe')}
              </Button>
            </form>
          </div>
        </div>
        
        <div className="mt-8 pt-6 border-t border-gray-800 flex flex-col md:flex-row justify-between items-center gap-4">
          <div className="text-gray-400 text-xs space-y-1 text-center md:text-left">
            <p>
              © 2026 NutriFacts™. All rights reserved.
              <span className="inline-block mx-2 text-gray-600">|</span>
              <span className="text-emerald-400 font-semibold">Designed &amp; Developed by SDSV Trade Tech</span>
            </p>
            <p className="text-[11px] text-gray-400 leading-relaxed max-w-3xl pt-1">
              <strong>Affiliate Disclosure:</strong> NutriFacts is a participant in the Amazon Services LLC Associates Program and Flipkart Affiliate Program. As an Amazon Associate I earn from qualifying purchases. Outbound partner links are clearly designated as sponsored/paid links and do not influence our independent nutritional data or WHO reference calculations.
            </p>
            <div className="flex flex-wrap items-center justify-center md:justify-start gap-x-3 gap-y-1 text-slate-400 pt-1 text-xs">
              <Link href="/about" className="hover:text-emerald-400 font-medium transition">About NutriFacts</Link>
              <span>•</span>
              <Link href="/privacy" className="hover:text-emerald-400 underline transition">Privacy Policy</Link>
              <span>•</span>
              <Link href="/terms" className="hover:text-emerald-400 underline transition">Terms of Service</Link>
              <span>•</span>
              <Link href="/editorial-policy" className="hover:text-emerald-400 underline transition">Editorial Policy</Link>
              <span>•</span>
              <Link href="/disclaimer" className="hover:text-emerald-400 underline transition">Medical Disclaimer</Link>
              <span>•</span>
              <Link href="/affiliate-disclosure" className="hover:text-emerald-400 underline transition">Affiliate Disclosure</Link>
              <span>•</span>
              <Link href="/cookie-policy" className="hover:text-emerald-400 underline transition">Cookie Policy</Link>
              <span>•</span>
              <Link href="/contact" className="hover:text-emerald-400 underline transition">Contact &amp; News Desk</Link>
              <span>•</span>
              <a href="/sitemap.xml" target="_blank" rel="noopener noreferrer" className="hover:text-emerald-400 underline transition">Sitemap XML</a>
              <span>•</span>
              <Link href="/quality" className="hover:text-emerald-400 underline transition">Data Quality Dashboard</Link>
              <span>•</span>
              <Link href="/emergency-food" className="hover:text-rose-400 underline transition font-bold text-rose-300">Emergency &amp; Disaster Hub</Link>
              <span>•</span>
              <a href="/api/foods/export/catalog-1379-csv" download="nutrifacts_food_catalog_1379.csv" className="hover:text-emerald-400 underline transition">Master 1,379 Catalog CSV</a>
            </div>
          </div>
          <div className="flex items-center space-x-3 mt-4 md:mt-0 text-xs text-slate-400">
            <span className="text-emerald-400 font-mono font-bold">www.nutrifacts.fun</span>
          </div>
        </div>
      </div>
    </footer>
  );
}
