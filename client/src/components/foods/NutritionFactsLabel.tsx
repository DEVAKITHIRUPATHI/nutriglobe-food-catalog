import React from 'react';
import { FoodItemClient } from '@shared/schema';
import { Button } from '@/components/ui/button';
import { Printer, ShieldCheck, Sparkles, Scale } from 'lucide-react';
import { useTranslation } from '@/hooks/useTranslation';

interface NutritionFactsLabelProps {
  item: FoodItemClient;
  onPrint?: () => void;
  showPrintButton?: boolean;
}

export function NutritionFactsLabel({ item, onPrint, showPrintButton = true }: NutritionFactsLabelProps) {
  const { t } = useTranslation();

  const handlePrint = () => {
    if (onPrint) {
      onPrint();
    } else {
      window.print();
    }
  };

  const calories = item.nutrition.calories || 0;
  const fat = item.nutrition.fat || 0;
  const carbs = item.nutrition.carbs || 0;
  const fiber = item.nutrition.fiber || 0;
  const protein = item.nutrition.protein || 0;

  // FDA / ICMR % Daily Value calculations based on 2,000 kcal standard diet
  const fatDV = Math.round((fat / 78) * 100);
  const carbsDV = Math.round((carbs / 275) * 100);
  const fiberDV = Math.round((fiber / 28) * 100);
  const proteinDV = Math.round((protein / 50) * 100);

  const vitamins = item.nutrition.vitamins || {};
  const minerals = item.nutrition.minerals || {};

  return (
    <div className="space-y-4">
      {/* On-screen action bar (hidden during print) */}
      {showPrintButton && (
        <div className="no-print flex items-center justify-between bg-slate-100 dark:bg-slate-800 p-3 rounded-xl border border-slate-200 dark:border-slate-700">
          <div className="flex items-center gap-2 text-xs font-semibold text-slate-700 dark:text-slate-200">
            <Sparkles className="h-4 w-4 text-emerald-600 dark:text-emerald-400" />
            <span>FDA & ICMR Standard Nutrition Label</span>
          </div>
          <Button
            onClick={handlePrint}
            className="bg-emerald-700 hover:bg-emerald-800 text-white text-xs font-bold px-4 py-2 rounded-lg shadow-sm flex items-center gap-2 transition-all hover:scale-[1.02] active:scale-[0.98]"
            id="print-nutrition-facts-btn"
          >
            <Printer className="h-4 w-4" />
            <span>Print Nutrition Facts</span>
          </Button>
        </div>
      )}

      {/* Standard Nutrition Facts Box (FDA / WHO standard style) */}
      <div 
        id="printable-nutrition-facts"
        className="printable-nutrition-card bg-white text-black p-5 rounded-xl border-4 border-black shadow-lg font-sans max-w-md mx-auto select-none dark:bg-white dark:text-black"
      >
        {/* Header */}
        <div className="border-b-[10px] border-black pb-1">
          <div className="flex justify-between items-baseline">
            <h2 className="text-3xl font-black uppercase tracking-tight leading-none text-black">
              Nutrition Facts
            </h2>
            <span className="text-[10px] font-bold text-gray-700 uppercase">Verified</span>
          </div>
          <p className="text-xs font-semibold text-black mt-1">
            Food Item: <span className="font-extrabold text-emerald-800">{t(item.name)}</span>
          </p>
        </div>

        {/* Serving Size & Servings */}
        <div className="border-b-[6px] border-black py-1.5 text-xs text-black">
          <div className="flex justify-between font-bold">
            <span>Serving Size</span>
            <span>100g (3.5 oz)</span>
          </div>
          <div className="text-[11px] text-gray-700">
            Origin: {item.origin} | Category: {item.category.join(', ')}
          </div>
        </div>

        {/* Calories */}
        <div className="border-b-[10px] border-black py-2 flex justify-between items-end text-black">
          <div>
            <div className="text-[11px] font-extrabold uppercase tracking-wider">Amount Per Serving</div>
            <div className="text-3xl font-black leading-none">Calories</div>
          </div>
          <div className="text-4xl font-black leading-none">{calories}</div>
        </div>

        {/* % Daily Value Header */}
        <div className="border-b border-black py-1 text-right text-xs font-bold text-black">
          % Daily Value*
        </div>

        {/* Nutrients List */}
        <div className="divide-y divide-black text-xs text-black">
          {/* Total Fat */}
          <div className="py-1 flex justify-between">
            <div>
              <span className="font-extrabold">Total Fat</span> {fat}g
            </div>
            <span className="font-bold">{fatDV}%</span>
          </div>

          {/* Total Carbohydrate */}
          <div className="py-1 flex justify-between">
            <div>
              <span className="font-extrabold">Total Carbohydrate</span> {carbs}g
            </div>
            <span className="font-bold">{carbsDV}%</span>
          </div>

          {/* Dietary Fiber */}
          <div className="py-1 pl-4 flex justify-between">
            <div>
              Dietary Fiber {fiber}g
            </div>
            <span className="font-bold">{fiberDV}%</span>
          </div>

          {/* Protein */}
          <div className="py-1 flex justify-between border-t-4 border-black">
            <div>
              <span className="font-extrabold">Protein</span> {protein}g
            </div>
            <span className="font-bold">{proteinDV}%</span>
          </div>
        </div>

        {/* Thick Border */}
        <div className="border-t-[8px] border-black my-1" />

        {/* Vitamins & Minerals Table */}
        <div className="py-1.5 text-[11px] space-y-1 text-black">
          <div className="font-extrabold text-xs uppercase border-b border-black pb-0.5 mb-1 flex justify-between items-center">
            <span>Vitamins & Minerals</span>
            <span className="text-[10px] font-normal text-gray-600">Per 100g</span>
          </div>
          
          <div className="grid grid-cols-2 gap-x-4 gap-y-1">
            {Object.entries(vitamins).map(([v, val]) => (
              <div key={v} className="flex justify-between border-b border-gray-200 pb-0.5">
                <span>Vitamin {v}</span>
                <span className="font-bold">{val}</span>
              </div>
            ))}
            {Object.entries(minerals).map(([m, val]) => (
              <div key={m} className="flex justify-between border-b border-gray-200 pb-0.5">
                <span>{m}</span>
                <span className="font-bold">{val}</span>
              </div>
            ))}
          </div>
        </div>

        {/* Glycemic Index if available */}
        {(item.nutrition.glycemicIndex !== undefined || item.nutrition.glycemicLoad !== undefined) && (
          <div className="border-t-2 border-black pt-1.5 mt-1.5 text-[11px] flex justify-between font-bold text-black">
            <span>Glycemic Index (GI): {item.nutrition.glycemicIndex || 'N/A'}</span>
            <span>Glycemic Load (GL): {item.nutrition.glycemicLoad || 'N/A'}</span>
          </div>
        )}

        {/* Footnote */}
        <div className="border-t-[4px] border-black pt-2 mt-2 text-[9px] text-gray-800 leading-tight">
          <p>
            * The % Daily Value (DV) tells you how much a nutrient in a serving of food contributes to a daily diet. 2,000 calories a day is used for general nutrition advice.
          </p>
          <div className="mt-2 pt-1 border-t border-gray-300 flex items-center justify-between text-[8px] text-gray-600">
            <span className="flex items-center gap-1 font-bold text-emerald-900">
              <ShieldCheck className="h-3 w-3 text-emerald-700 inline" />
              NutriGlobe Clinical Food & Nutrition Intelligence
            </span>
            <span>Date: {new Date().toLocaleDateString()}</span>
          </div>
        </div>
      </div>
    </div>
  );
}
