import { useTranslation } from '@/hooks/useTranslation';
import { Link } from 'wouter';
import { CheckCircle2 } from 'lucide-react';

export function NutritionGuide() {
  const { getLocalizedText } = useTranslation();

  return (
    <section className="mb-12 bg-gray-50 dark:bg-gray-800 rounded-xl p-6 md:p-8">
      <div className="md:flex items-center gap-8">
        <div className="md:w-1/2 mb-6 md:mb-0">
          <h2 className="text-2xl font-semibold mb-3">
            {getLocalizedText('nutrition.understanding')}
          </h2>
          <p className="text-gray-600 mb-4 dark:text-gray-300">
            {getLocalizedText('nutrition.description')}
          </p>
          <div className="space-y-3">
            <div className="flex items-start">
              <CheckCircle2 className="h-5 w-5 text-primary-500 mt-1 mr-2" />
              <div>
                <h3 className="font-medium">
                  {getLocalizedText('nutrition.servingSize')}
                </h3>
                <p className="text-sm text-gray-600 dark:text-gray-400">
                  {getLocalizedText('nutrition.servingDescription')}
                </p>
              </div>
            </div>
            <div className="flex items-start">
              <CheckCircle2 className="h-5 w-5 text-primary-500 mt-1 mr-2" />
              <div>
                <h3 className="font-medium">
                  {getLocalizedText('nutrition.macronutrients')}
                </h3>
                <p className="text-sm text-gray-600 dark:text-gray-400">
                  {getLocalizedText('nutrition.macronutrientsDescription')}
                </p>
              </div>
            </div>
            <div className="flex items-start">
              <CheckCircle2 className="h-5 w-5 text-primary-500 mt-1 mr-2" />
              <div>
                <h3 className="font-medium">
                  {getLocalizedText('nutrition.vitamins')}
                </h3>
                <p className="text-sm text-gray-600 dark:text-gray-400">
                  {getLocalizedText('nutrition.vitaminsDescription')}
                </p>
              </div>
            </div>
          </div>
          <Link href="/nutrition">
            <span className="inline-block mt-5 text-primary-500 hover:underline font-medium cursor-pointer">
              {getLocalizedText('nutrition.readGuide')} <span aria-hidden="true">→</span>
            </span>
          </Link>
        </div>
        <div className="md:w-1/2">
          <img 
            src="https://images.unsplash.com/photo-1514218985930-e96ab5eead25?auto=format&fit=crop&q=80" 
            alt="Nutrition label example" 
            className="w-full rounded-lg shadow-md"
          />
        </div>
      </div>
    </section>
  );
}
