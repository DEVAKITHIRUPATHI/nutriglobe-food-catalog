import { useContext } from 'react';
import { AppContext } from '@/contexts/AppContext';
import { NutritionCalculator } from '@/components/calculator/NutritionCalculator';
import { MacroIntakeChart } from '@/components/calculator/MacroIntakeChart';
import { DataSyncStatusIndicator } from '@/components/layout/DataSyncStatusIndicator';
import { CalculatorPageSkeleton } from '@/components/ui/PageSkeleton';
import { usePageViewCounter } from '@/hooks/usePageViewCounter';
import { AdBanner } from '@/components/ads/AdBanner';

export default function CalculatorPage() {
  usePageViewCounter('/calculator', 'RDA & Calorie Calculator');
  const { isLoading: appLoading } = useContext(AppContext);

  if (appLoading) {
    return <CalculatorPageSkeleton />;
  }

  return (
    <div className="container mx-auto px-4 py-6 space-y-8 max-w-6xl">
      {/* Offline & Cloud Data Sync Status Indicator */}
      <DataSyncStatusIndicator variant="card" />

      {/* Main Clinical Calculator */}
      <NutritionCalculator />

      {/* Google AdSense Responsive Banner */}
      <AdBanner slot="3004005006" format="auto" className="my-6" />

      {/* Recharts 7-Day Macronutrient Intake Trends Chart */}
      <MacroIntakeChart />
    </div>
  );
}
