import { useTranslation } from '@/hooks/useTranslation';
import { Link } from 'wouter';
import { Facebook, Twitter, Instagram, Linkedin, Info } from 'lucide-react';
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
                <a href="#" className="text-gray-400 hover:text-white transition">
                  45+ Global Languages
                </a>
              </li>
              <li>
                <a href="#" className="text-gray-400 hover:text-white transition">
                  Offline PWA & WHO Standards
                </a>
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
              <span className="text-emerald-400 font-semibold">Designed & Developed by SDSV Trade Tech</span>
            </p>
            <div className="flex flex-wrap items-center justify-center md:justify-start gap-3 text-slate-400 pt-1">
              <Link href="/about" className="hover:text-emerald-400 font-medium transition">About NutriFacts</Link>
              <span>•</span>
              <Link href="/privacy" className="hover:text-emerald-400 underline transition">Privacy Policy</Link>
              <span>•</span>
              <Link href="/terms" className="hover:text-emerald-400 underline transition">Terms of Service</Link>
              <span>•</span>
              <Link href="/editorial-policy" className="hover:text-emerald-400 underline transition">Editorial Policy</Link>
              <span>•</span>
              <Link href="/contact" className="hover:text-emerald-400 underline transition">Contact & News Desk</Link>
              <span>•</span>
              <a href="/sitemap.xml" target="_blank" className="hover:text-emerald-400 underline transition">Sitemap XML</a>
            </div>
          </div>
          <div className="flex space-x-4 mt-4 md:mt-0">
            <a href="#" className="text-gray-400 hover:text-white transition">
              <Facebook size={20} />
            </a>
            <a href="#" className="text-gray-400 hover:text-white transition">
              <Twitter size={20} />
            </a>
            <a href="#" className="text-gray-400 hover:text-white transition">
              <Instagram size={20} />
            </a>
            <a href="#" className="text-gray-400 hover:text-white transition">
              <Linkedin size={20} />
            </a>
          </div>
        </div>
      </div>
    </footer>
  );
}
