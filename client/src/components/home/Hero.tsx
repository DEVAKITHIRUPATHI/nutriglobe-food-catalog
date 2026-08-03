import { useTranslation } from '@/hooks/useTranslation';
import { Link } from 'wouter';
import { Button } from '@/components/ui/button';

export function Hero() {
  const { getLocalizedText } = useTranslation();

  return (
    <section className="bg-gradient-to-r from-primary-500 to-primary-600 rounded-xl mb-8 overflow-hidden relative">
      <div className="md:flex items-center">
        <div className="p-6 md:p-10 md:w-1/2">
          <h1 className="text-white text-3xl md:text-4xl font-bold leading-tight">
            {getLocalizedText('home.title')}
          </h1>
          <p className="text-green-50 mt-4 text-lg max-w-md">
            {getLocalizedText('home.subtitle')}
          </p>
          <div className="mt-6 flex space-x-3">
            <Link href="/foods">
              <div className="inline-block">
                <Button className="bg-white text-primary-500 hover:bg-gray-100 px-6 py-2">
                  {getLocalizedText('button.exploreFoods')}
                </Button>
              </div>
            </Link>
            <Link href="/nutrition">
              <div className="inline-block">
                <Button variant="outline" className="border border-white text-white hover:bg-white hover:bg-opacity-10 px-6 py-2">
                  {getLocalizedText('button.learnMore')}
                </Button>
              </div>
            </Link>
          </div>
        </div>
        <div className="hidden md:block md:w-1/2 p-6">
          <img 
            src="https://images.unsplash.com/photo-1512621776951-a57141f2eefd?auto=format&fit=crop&q=80" 
            alt="Healthy food" 
            referrerPolicy="no-referrer"
            className="rounded-lg w-full h-64 object-cover shadow-lg"
          />
        </div>
      </div>
    </section>
  );
}
