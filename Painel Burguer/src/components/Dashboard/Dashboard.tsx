import React from 'react';
import { useStore } from '../../contexts/StoreContext';
import { StatsCards } from './StatsCards';
import { RevenueChart } from './RevenueChart';
import { TopSellingItems } from './TopSellingItems';
import { RecentOrders } from './RecentOrders';

export function Dashboard() {
  const { dashboardStats } = useStore();

  return (
    <div className="space-y-6">
      <StatsCards stats={dashboardStats} />
      
      <div className="grid grid-cols-1 xl:grid-cols-3 gap-6">
        <div className="xl:col-span-2">
          <RevenueChart 
            dailyRevenue={dashboardStats.dailyRevenue}
            weeklyRevenue={dashboardStats.weeklyRevenue}
            monthlyRevenue={dashboardStats.monthlyRevenue}
          />
        </div>
        <div>
          <TopSellingItems items={dashboardStats.topSellingItems} />
        </div>
      </div>
      
      <div>
        <RecentOrders orders={dashboardStats.recentOrders} />
      </div>
    </div>
  );
}