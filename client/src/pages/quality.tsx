import React, { useEffect } from 'react';
import { FoodQualityDashboard } from '@/components/dashboard/FoodQualityDashboard';
import { usePageViewCounter } from '@/hooks/usePageViewCounter';

export default function QualityPage() {
  usePageViewCounter('/quality', 'Food Intelligence & Data Quality Dashboard');

  useEffect(() => {
    document.title = 'Food Intelligence & Data Completeness Quality Dashboard | NutriFacts';
    
    // Set indexing tags
    let meta = document.querySelector('meta[name="description"]');
    if (!meta) {
      meta = document.createElement('meta');
      meta.setAttribute('name', 'description');
      document.head.appendChild(meta);
    }
    meta.setAttribute('content', 'Comprehensive data completeness, Atwater calorie integrity, and laboratory provenance audit across all 1,379 canonical foods in NutriFacts.');
  }, []);

  return (
    <div className="py-4">
      <FoodQualityDashboard />
    </div>
  );
}
