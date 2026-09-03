import React from 'react';
import { UserDashboard } from '@/components/dashboard/UserDashboard';
import { usePageViewCounter } from '@/hooks/usePageViewCounter';

export default function DashboardPage() {
  usePageViewCounter('/dashboard', 'User Dashboard');

  return (
    <div className="py-2">
      <UserDashboard />
    </div>
  );
}
