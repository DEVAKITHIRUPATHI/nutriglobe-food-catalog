import React, { useEffect } from 'react';
import { UserDashboard } from '@/components/dashboard/UserDashboard';
import { usePageViewCounter } from '@/hooks/usePageViewCounter';

export default function DashboardPage() {
  usePageViewCounter('/dashboard', 'User Dashboard');

  useEffect(() => {
    document.title = 'My Daily Nutrition Tracker & Intake Trends | NutriFacts';
    // Strictly block search engine indexing of personal nutrition logs and meal history
    let robots = document.querySelector('meta[name="robots"]');
    if (!robots) {
      robots = document.createElement('meta');
      robots.setAttribute('name', 'robots');
      document.head.appendChild(robots);
    }
    robots.setAttribute('content', 'noindex, nofollow');

    return () => {
      // Restore default indexing policy on navigation away
      if (robots) {
        robots.setAttribute('content', 'index, follow, max-image-preview:large, max-snippet:-1');
      }
    };
  }, []);

  return (
    <div className="py-2">
      <UserDashboard />
    </div>
  );
}
