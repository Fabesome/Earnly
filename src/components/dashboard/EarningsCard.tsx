interface EarningsCardProps {
  title: string;
  amount: number;
  trend?: {
    vsLastMonth: {
      amount: number;
      percentage: number;
    };
    vsAverage?: {
      amount: number;
      percentage: number;
    };
  };
  period: string;
  loading?: boolean;
}

export function EarningsCard({ title, amount, trend, period, loading = false }: EarningsCardProps) {
  const formatCurrency = (value: number) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'EUR',
      currencyDisplay: 'symbol'
    }).format(value).replace('EUR', '€');
  };

  const formatTrendText = (amount: number, percentage: number) => {
    const sign = amount >= 0 ? '+' : '';
    return `${sign}${formatCurrency(amount)} / ${sign}${percentage}%`;
  };

  if (loading) {
    return (
      <div className="bg-white dark:bg-gray-800 rounded-lg shadow-sm p-6 animate-pulse">
        <div className="h-5 bg-gray-200 dark:bg-gray-700 rounded w-1/2 mb-4"></div>
        <div className="h-8 bg-gray-200 dark:bg-gray-700 rounded w-3/4 mb-2"></div>
        <div className="h-4 bg-gray-200 dark:bg-gray-700 rounded w-1/4"></div>
      </div>
    );
  }

  return (
    <div className="bg-white dark:bg-gray-800 rounded-lg shadow-sm p-6">
      <h3 className="text-lg font-medium text-gray-900 dark:text-white mb-2">{title}</h3>
      <p className="text-3xl font-bold text-gray-900 dark:text-white mb-1">
        {formatCurrency(amount)}
      </p>
      {trend && period === 'Current Month' && (
        <div className="space-y-1">
          <div className="flex items-center">
            <span className={`text-sm font-medium mr-2 ${
              trend.vsLastMonth.amount > 0 ? 'text-green-600 dark:text-green-400' : 
              trend.vsLastMonth.amount < 0 ? 'text-red-600 dark:text-red-400' : 
              'text-gray-600 dark:text-gray-400'
            }`}>
              {formatTrendText(trend.vsLastMonth.amount, trend.vsLastMonth.percentage)}
            </span>
            <span className="text-sm text-gray-500 dark:text-gray-400">vs. last month</span>
          </div>
          {trend.vsAverage && (
            <div className="flex items-center">
              <span className={`text-sm font-medium mr-2 ${
                trend.vsAverage.amount > 0 ? 'text-green-600 dark:text-green-400' : 
                trend.vsAverage.amount < 0 ? 'text-red-600 dark:text-red-400' : 
                'text-gray-600 dark:text-gray-400'
              }`}>
                {formatTrendText(trend.vsAverage.amount, trend.vsAverage.percentage)}
              </span>
              <span className="text-sm text-gray-500 dark:text-gray-400">vs. average month</span>
            </div>
          )}
        </div>
      )}
    </div>
  );
}
