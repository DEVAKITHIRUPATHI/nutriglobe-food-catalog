import { useTranslation } from '@/hooks/useTranslation';
import { Link } from 'wouter';
import { Facebook, Twitter, Instagram, Linkedin } from 'lucide-react';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';

export function Footer() {
  const { getLocalizedText } = useTranslation();

  return (
    <footer className="bg-gray-800 text-white py-8">
      <div className="container mx-auto px-4">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
          <div>
            <h3 className="text-lg font-semibold mb-3">{getLocalizedText('app.name')}</h3>
            <p className="text-gray-400 text-sm">
              {getLocalizedText('footer.description')}
            </p>
          </div>
          
          <div>
            <h3 className="text-lg font-semibold mb-3">
              {getLocalizedText('footer.quickLinks')}
            </h3>
            <ul className="space-y-2">
              <li>
                <Link href="/" className="text-gray-400 hover:text-white transition">
                  {getLocalizedText('nav.home')}
                </Link>
              </li>
              <li>
                <Link href="/about" className="text-gray-400 hover:text-white transition">
                  {getLocalizedText('nav.about')}
                </Link>
              </li>
              <li>
                <Link href="/foods" className="text-gray-400 hover:text-white transition">
                  {getLocalizedText('nav.foods')}
                </Link>
              </li>
              <li>
                <Link href="/contact" className="text-gray-400 hover:text-white transition">
                  {getLocalizedText('nav.contact')}
                </Link>
              </li>
              <li className="pt-2 border-t border-gray-700/60">
                <Link href="/admin" className="text-emerald-400 hover:text-emerald-300 font-medium transition flex items-center gap-1.5 text-xs">
                  <span>Admin Portal</span>
                  <span className="bg-emerald-900/60 text-emerald-300 px-1.5 py-0.5 rounded text-[10px] uppercase">Staff</span>
                </Link>
              </li>
            </ul>
          </div>
          
          <div>
            <h3 className="text-lg font-semibold mb-3">
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
                  <span className="bg-indigo-900/60 text-indigo-300 px-1.5 py-0.5 rounded text-[10px] uppercase font-bold">New</span>
                </Link>
              </li>
              <li>
                <a href="#" className="text-gray-400 hover:text-white transition">
                  {getLocalizedText('feature.multilingual')}
                </a>
              </li>
              <li>
                <a href="#" className="text-gray-400 hover:text-white transition">
                  {getLocalizedText('feature.offline')}
                </a>
              </li>
            </ul>
          </div>
          
          <div>
            <h3 className="text-lg font-semibold mb-3">
              {getLocalizedText('footer.newsletter')}
            </h3>
            <p className="text-gray-400 text-sm mb-3">
              {getLocalizedText('newsletter.description')}
            </p>
            <form className="flex">
              <Input 
                type="email" 
                className="flex-1 bg-gray-700 text-white text-sm rounded-l-md focus:outline-none border-0" 
                placeholder="Email address"
              />
              <Button 
                type="submit"
                className="bg-primary-500 hover:bg-primary-600 px-3 py-2 rounded-r-md text-sm font-medium transition-colors"
              >
                {getLocalizedText('button.subscribe')}
              </Button>
            </form>
          </div>
        </div>
        
        <div className="mt-8 pt-6 border-t border-gray-700 flex flex-col md:flex-row justify-between items-center gap-4">
          <div className="text-gray-400 text-xs space-y-1 text-center md:text-left">
            <p>
              © 2026 NutriGlobe. {getLocalizedText('footer.copyright')}
              <span className="inline-block mx-2 text-gray-500">|</span>
              <span className="text-emerald-400 font-semibold">Designed & Developed by SDSV Trade Tech</span>
            </p>
            <div className="flex flex-wrap items-center justify-center md:justify-start gap-3 text-slate-400 pt-1">
              <Link href="/privacy" className="hover:text-emerald-400 underline transition">Privacy Policy</Link>
              <span>•</span>
              <Link href="/terms" className="hover:text-emerald-400 underline transition">Terms of Service</Link>
              <span>•</span>
              <Link href="/editorial-policy" className="hover:text-emerald-400 underline transition">Editorial Policy</Link>
              <span>•</span>
              <Link href="/contact" className="hover:text-emerald-400 underline transition">Contact & Google News Desk</Link>
              <span>•</span>
              <a href="/sitemap.xml" target="_blank" className="hover:text-emerald-400 underline transition">Sitemap XML</a>
              <span>•</span>
              <a href="/rss.xml" target="_blank" className="hover:text-emerald-400 underline transition">RSS Feed</a>
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
