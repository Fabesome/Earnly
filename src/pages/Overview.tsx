import { useState, useEffect, useMemo } from 'react';
import { useUser } from '@clerk/clerk-react';
import { ref, onValue } from 'firebase/database';
import { db } from '../config/firebase';
import { ComposedChart, Line, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from 'recharts';
import { useEarnings } from '../hooks/useEarnings';
import { Link } from 'react-router-dom';

interface EarningWithId {
  id: string;
  date: string;
  customerName: string;
  customerLocation: string;
  category: string;
  description: string;
  timeWorked: number;
  timeAmount: number;
  materialAmount: number;
  tips: number;
  totalEarnings: number;
}

interface ChartData {
  date: string;
  amount: number;
  cumulative: number;
  dailyTotal: number;
  fullDate: Date;
}

export function Overview() {
  const { user } = useUser();
  const [selectedYear, setSelectedYear] = useState(new Date().getFullYear());
  const [years, setYears] = useState<number[]>([]);
  const [isDeleteMode, setIsDeleteMode] = useState(false);
  const { earnings, isLoading, error, removeEarning } = useEarnings();

  useEffect(() => {
    if (earnings.length > 0) {
      const uniqueYears = [...new Set(earnings.map(earning => 
        new Date(earning.date).getFullYear()
      ))].sort((a, b) => b - a);
      setYears(uniqueYears);
    }
  }, [earnings]);

  const handleDelete = async (id: string) => {
    try {
      await removeEarning(id);
    } catch (error) {
      console.error('Error deleting earning:', error);
    }
  };

  const chartData = useMemo(() => {
    if (!earnings.length) return [];

    const yearData = earnings
      .filter(earning => new Date(earning.date).getFullYear() === selectedYear)
      .sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime());

    let cumulativeTotal = 0;
    const dailyTotals: { [key: string]: number } = {};

    // Calculate daily totals
    yearData.forEach(earning => {
      const date = earning.date;
      if (!dailyTotals[date]) {
        dailyTotals[date] = 0;
      }
      dailyTotals[date] += earning.totalEarnings;
    });

    return yearData.map(earning => {
      cumulativeTotal += earning.totalEarnings;
      return {
        date: new Date(earning.date).toLocaleDateString('en-US', { 
          month: 'short', 
          day: 'numeric',
          year: 'numeric'
        }),
        amount: earning.totalEarnings,
        cumulative: cumulativeTotal,
        dailyTotal: dailyTotals[earning.date],
        fullDate: new Date(earning.date)
      };
    });
  }, [earnings, selectedYear]);

  const formatCurrency = (value: number) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'EUR',
      currencyDisplay: 'symbol'
    }).format(value).replace('EUR', '€');
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-[60vh]">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-gray-900 dark:border-white"></div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="text-center py-8">
        <p className="text-red-600">Error loading earnings: {error}</p>
      </div>
    );
  }

  if (!earnings.length) {
    return (
      <div className="container mx-auto px-4 py-8">
        <div className="text-center">
          <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-4">No Earnings Yet</h2>
          <p className="text-gray-600 dark:text-gray-400 mb-6">Start tracking your earnings by adding your first entry!</p>
          <Link
            to="/add"
            className="inline-flex items-center px-4 py-2 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-indigo-600 hover:bg-indigo-700"
          >
            Add First Earning
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="mb-8 flex justify-between items-center">
        <div className="flex items-center space-x-4">
          <h1 className="text-3xl font-bold text-gray-900 dark:text-white">Earnings Overview</h1>
          <select
            value={selectedYear}
            onChange={(e) => setSelectedYear(Number(e.target.value))}
            className="rounded-md border-gray-300 py-2 pl-3 pr-10 text-base focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 dark:bg-gray-700 dark:border-gray-600"
          >
            {years.map(year => (
              <option key={year} value={year}>{year}</option>
            ))}
          </select>
        </div>
        <div className="flex items-center space-x-4">
          <button
            onClick={() => setIsDeleteMode(!isDeleteMode)}
            className="px-4 py-2 text-sm font-medium text-gray-700 dark:text-gray-300 hover:text-gray-900 dark:hover:text-white"
          >
            {isDeleteMode ? 'Done' : 'Edit'}
          </button>
          <Link
            to="/add"
            className="inline-flex items-center px-4 py-2 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-indigo-600 hover:bg-indigo-700"
          >
            Add Earning
          </Link>
        </div>
      </div>

      {/* Chart Section */}
      <div className="bg-white dark:bg-gray-800 rounded-ios shadow-ios p-6 mb-8">
        <div className="flex justify-between items-center mb-6">
          <h2 className="text-xl font-semibold text-gray-900 dark:text-white">Earnings Chart</h2>
        </div>
        
        <div className="h-[400px]">
          <ResponsiveContainer width="100%" height="100%">
            <ComposedChart data={chartData}>
              <CartesianGrid strokeDasharray="3 3" stroke="#374151" />
              <XAxis 
                dataKey="date"
                angle={-45}
                textAnchor="end"
                height={60}
                ticks={(() => {
                  if (chartData.length === 0) return [];
                  
                  // Create ticks for first day of each month
                  const ticks: string[] = [];
                  const months = new Set<number>();
                  
                  chartData.forEach(data => {
                    const month = data.fullDate.getMonth();
                    if (!months.has(month)) {
                      months.add(month);
                      ticks.push(new Date(selectedYear, month, 1).toLocaleDateString('en-US', {
                        month: 'short'
                      }));
                    }
                  });
                  
                  return ticks.sort((a, b) => {
                    const monthA = new Date(Date.parse(`1 ${a} ${selectedYear}`)).getMonth();
                    const monthB = new Date(Date.parse(`1 ${b} ${selectedYear}`)).getMonth();
                    return monthA - monthB;
                  });
                })()}
                tick={{ fill: '#9CA3AF' }}
              />
              <YAxis 
                yAxisId="left"
                orientation="left"
                tick={{ fill: '#9CA3AF' }}
                tickFormatter={(value) => `${value}€`}
              />
              <YAxis
                yAxisId="right"
                orientation="right"
                tick={{ fill: '#9CA3AF' }}
                tickFormatter={(value) => `${value}€`}
              />
              <Tooltip 
                contentStyle={{ 
                  backgroundColor: '#1F2937',
                  border: 'none',
                  borderRadius: '10px',
                  color: '#F3F4F6'
                }}
              />
              <Legend 
                wrapperStyle={{ color: '#9CA3AF' }}
              />
              <Bar
                dataKey="dailyTotal"
                yAxisId="left"
                fill="#0891b2"
                name="Daily Total"
                radius={[4, 4, 0, 0]}
              />
              <Line
                type="monotone"
                dataKey="cumulative"
                yAxisId="right"
                stroke="#22d3ee"
                strokeWidth={2}
                name="Cumulative"
                dot={false}
              />
            </ComposedChart>
          </ResponsiveContainer>
        </div>
      </div>

      {/* Earnings Table */}
      <div className="bg-white dark:bg-gray-800 shadow rounded-lg overflow-hidden">
        <div className="min-w-full divide-y divide-gray-200 dark:divide-gray-700">
          <div className="bg-gray-50 dark:bg-gray-900">
            <div className="grid grid-cols-10 gap-4 px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
              <div className="col-span-1">Date</div>
              <div className="col-span-1">Customer</div>
              <div className="col-span-1">Location</div>
              <div className="col-span-1">Category</div>
              <div className="col-span-1">Time Worked</div>
              <div className="col-span-1 text-right">Time Amount</div>
              <div className="col-span-1 text-right">Material</div>
              <div className="col-span-1 text-right">Tips</div>
              <div className="col-span-2 text-right">Total</div>
            </div>
          </div>
          <div className="divide-y divide-gray-200 dark:divide-gray-700">
            {earnings
              .filter(earning => new Date(earning.date).getFullYear() === selectedYear)
              .sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime())
              .map((earning) => (
                <div key={earning.id} className="grid grid-cols-10 gap-4 px-6 py-4 hover:bg-gray-50 dark:hover:bg-gray-700">
                  <div className="col-span-1 text-sm text-gray-900 dark:text-gray-300">
                    {new Date(earning.date).toLocaleDateString('en-US', { 
                      month: 'short', 
                      day: 'numeric',
                      year: 'numeric'
                    })}
                  </div>
                  <div className="col-span-1 text-sm text-gray-900 dark:text-gray-300">
                    {earning.customerName}
                  </div>
                  <div className="col-span-1 text-sm text-gray-900 dark:text-gray-300">
                    {earning.customerLocation}
                  </div>
                  <div className="col-span-1 text-sm text-gray-900 dark:text-gray-300">
                    {earning.category}
                  </div>
                  <div className="col-span-1 text-sm text-gray-900 dark:text-gray-300">
                    {earning.timeWorked}h
                  </div>
                  <div className="col-span-1 text-right text-sm text-gray-900 dark:text-gray-300">
                    {formatCurrency(earning.timeAmount)}
                  </div>
                  <div className="col-span-1 text-right text-sm text-gray-900 dark:text-gray-300">
                    {formatCurrency(earning.materialAmount)}
                  </div>
                  <div className="col-span-1 text-right text-sm text-gray-900 dark:text-gray-300">
                    {formatCurrency(earning.tips)}
                  </div>
                  <div className="col-span-2 text-right text-sm font-medium text-gray-900 dark:text-gray-300">
                    <div className="flex items-center justify-end space-x-3">
                      <span>{formatCurrency(earning.totalEarnings)}</span>
                      {isDeleteMode && (
                        <button
                          onClick={() => handleDelete(earning.id)}
                          className="text-red-600 hover:text-red-900 dark:text-red-400 dark:hover:text-red-300"
                        >
                          Delete
                        </button>
                      )}
                    </div>
                  </div>
                </div>
              ))}
          </div>
        </div>
      </div>
    </div>
  );
}
