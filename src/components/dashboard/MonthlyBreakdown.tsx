import { useEffect, useState } from 'react';
import { ref, get } from 'firebase/database';
import { db } from '../../config/firebase';

interface MonthlyBreakdownProps {
  userId: string;
}

interface MonthlyData {
  [key: string]: {
    totalEarnings: number;
    count: number;
  };
}

export function MonthlyBreakdown({ userId }: MonthlyBreakdownProps) {
  const [monthlyData, setMonthlyData] = useState<MonthlyData>({});
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const fetchMonthlyData = async () => {
      setIsLoading(true);
      try {
        const earningsRef = ref(db, `users/${userId}/earnings`);
        const snapshot = await get(earningsRef);
        const earnings = snapshot.val() || {};
        
        // Process earnings into monthly data
        const monthlyTotals: MonthlyData = {};
        
        Object.values(earnings).forEach((earning: any) => {
          const date = new Date(earning.date);
          const monthKey = `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}`;
          
          if (!monthlyTotals[monthKey]) {
            monthlyTotals[monthKey] = {
              totalEarnings: 0,
              count: 0
            };
          }
          
          monthlyTotals[monthKey].totalEarnings += earning.totalEarnings;
          monthlyTotals[monthKey].count += 1;
        });
        
        setMonthlyData(monthlyTotals);
      } catch (error) {
        console.error('Error fetching monthly data:', error);
      }
      setIsLoading(false);
    };

    fetchMonthlyData();
  }, [userId]);

  const calculateMonthlyAverage = () => {
    const months = Object.values(monthlyData);
    if (months.length === 0) return 0;
    
    const total = months.reduce((sum, month) => sum + month.totalEarnings, 0);
    return total / months.length;
  };

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'EUR',
      currencyDisplay: 'symbol'
    }).format(amount).replace('EUR', '€');
  };

  const formatMonth = (monthKey: string) => {
    const [year, month] = monthKey.split('-');
    const date = new Date(parseInt(year), parseInt(month) - 1);
    return date.toLocaleString('en-US', { month: 'long', year: 'numeric' });
  };

  if (isLoading) {
    return (
      <div className="animate-pulse">
        <div className="h-8 bg-gray-200 dark:bg-gray-700 rounded w-full mb-4"></div>
        <div className="space-y-3">
          {[1, 2, 3].map((n) => (
            <div key={n} className="h-6 bg-gray-200 dark:bg-gray-700 rounded w-full"></div>
          ))}
        </div>
      </div>
    );
  }

  const sortedMonths = Object.entries(monthlyData)
    .sort(([a], [b]) => b.localeCompare(a))
    .slice(0, 12);

  if (sortedMonths.length === 0) {
    return (
      <div className="text-center py-8 text-gray-500 dark:text-gray-400">
        <p>No earnings data available yet</p>
      </div>
    );
  }

  return (
    <div className="bg-white dark:bg-gray-800 rounded-lg shadow-sm p-6">
      <div className="flex justify-between items-center mb-6">
        <h2 className="text-xl font-semibold text-gray-900 dark:text-white">Monthly Breakdown</h2>
        <div className="text-right">
          <p className="text-sm text-gray-500 dark:text-gray-400">Monthly Average</p>
          <p className="text-lg font-semibold text-gray-900 dark:text-white">
            {formatCurrency(calculateMonthlyAverage())}
          </p>
        </div>
      </div>
      
      <div className="space-y-4">
        {sortedMonths.map(([month, data]) => (
          <div key={month} className="flex justify-between items-center">
            <div>
              <p className="text-gray-900 dark:text-white font-medium">{formatMonth(month)}</p>
              <p className="text-sm text-gray-500 dark:text-gray-400">{data.count} entries</p>
            </div>
            <p className="text-gray-900 dark:text-white font-semibold">
              {formatCurrency(data.totalEarnings)}
            </p>
          </div>
        ))}
      </div>
    </div>
  );
}
