import { useContext } from 'react';
import { AppContext } from '@/contexts/AppContext';
import { NutritionCalculator } from '@/components/calculator/NutritionCalculator';
import { MacroIntakeChart } from '@/components/calculator/MacroIntakeChart';
import { DataSyncStatusIndicator } from '@/components/layout/DataSyncStatusIndicator';
import { CalculatorPageSkeleton } from '@/components/ui/PageSkeleton';

export default function CalculatorPage() {
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

      {/* Recharts 7-Day Macronutrient Intake Trends Chart */}
      <MacroIntakeChart />
    </div>
  );
}
