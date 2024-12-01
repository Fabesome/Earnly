import { useUser } from '@clerk/clerk-react';
import { useEffect, useState } from 'react';
import { ref, onValue, get } from 'firebase/database';
import { db } from '../config/firebase';
import { EarningsCard } from '../components/dashboard/EarningsCard';
import { ActionButton } from '../components/common/ActionButton';
import { MonthlyBreakdown } from '../components/dashboard/MonthlyBreakdown';

interface UserMetadata {
  totalCurrentMonthEarnings: number;
  totalPreviousMonthEarnings: number;
  totalCurrentYearEarnings: number;
}

interface MonthlyData {
  [key: string]: {
    totalEarnings: number;
    count: number;
  };
}

export function Dashboard() {
  const { user } = useUser();
  const [isLoading, setIsLoading] = useState(true);
  const [monthlyData, setMonthlyData] = useState<MonthlyData>({});
  const [metadata, setMetadata] = useState<UserMetadata>({
    totalCurrentMonthEarnings: 0,
    totalPreviousMonthEarnings: 0,
    totalCurrentYearEarnings: 0,
  });

  useEffect(() => {
    if (!user) return;

    setIsLoading(true);
    const metadataRef = ref(db, `users/${user.id}/metadata`);
    const earningsRef = ref(db, `users/${user.id}/earnings`);
    
    // Fetch metadata
    const unsubscribeMetadata = onValue(metadataRef, (snapshot) => {
      const data = snapshot.val();
      if (data) {
        setMetadata(data);
      } else {
        setMetadata({
          totalCurrentMonthEarnings: 0,
          totalPreviousMonthEarnings: 0,
          totalCurrentYearEarnings: 0,
        });
      }
    }, (error) => {
      console.error('Error fetching metadata:', error);
    });

    // Fetch earnings data for average calculation
    const unsubscribeEarnings = onValue(earningsRef, (snapshot) => {
      const earnings = snapshot.val() || {};
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
      setIsLoading(false);
    }, (error) => {
      console.error('Error fetching earnings:', error);
      setIsLoading(false);
    });

    return () => {
      unsubscribeMetadata();
      unsubscribeEarnings();
    };
  }, [user]);

  const calculateMonthlyAverage = () => {
    const months = Object.values(monthlyData);
    if (months.length === 0) return 0;
    const total = months.reduce((sum, month) => sum + month.totalEarnings, 0);
    return total / months.length;
  };

  const calculateTrends = () => {
    const vsLastMonth = {
      amount: metadata.totalCurrentMonthEarnings - metadata.totalPreviousMonthEarnings,
      percentage: metadata.totalPreviousMonthEarnings === 0 ? 0 : 
        Math.round(((metadata.totalCurrentMonthEarnings - metadata.totalPreviousMonthEarnings) / 
          metadata.totalPreviousMonthEarnings) * 100)
    };

    const average = calculateMonthlyAverage();
    const vsAverage = {
      amount: metadata.totalCurrentMonthEarnings - average,
      percentage: average === 0 ? 0 : 
        Math.round(((metadata.totalCurrentMonthEarnings - average) / average) * 100)
    };

    return {
      vsLastMonth,
      vsAverage
    };
  };

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="flex justify-between items-center mb-8">
        <h1 className="text-3xl font-bold text-gray-900 dark:text-white">Dashboard</h1>
        <ActionButton to="/add" />
      </div>

      {isLoading ? (
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <EarningsCard
            title="Current Month"
            amount={0}
            loading={true}
            period="Current Month"
          />
          <EarningsCard
            title="Last Month"
            amount={0}
            loading={true}
            period="Last Month"
          />
          <EarningsCard
            title="This Year"
            amount={0}
            loading={true}
            period="This Year"
          />
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <EarningsCard
            title="Current Month"
            amount={metadata.totalCurrentMonthEarnings}
            trend={calculateTrends()}
            period="Current Month"
          />
          <EarningsCard
            title="Last Month"
            amount={metadata.totalPreviousMonthEarnings}
            period="Last Month"
          />
          <EarningsCard
            title="This Year"
            amount={metadata.totalCurrentYearEarnings}
            period="This Year"
          />
        </div>
      )}

      <div className="mt-8">
        <MonthlyBreakdown userId={user?.id || ''} />
      </div>
    </div>
  );
}
