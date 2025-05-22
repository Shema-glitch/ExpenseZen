import { useQuery } from '@tanstack/react-query';
import { Card, CardContent } from '@/components/ui/card';

interface MonthlyStats {
  totalExpenses: string;
  totalIncome: string;
  expenseCount: number;
}

export function QuickStats() {
  const currentDate = new Date();
  const currentYear = currentDate.getFullYear();
  const currentMonth = currentDate.getMonth() + 1;

  const { data: stats, isLoading } = useQuery<MonthlyStats>({
    queryKey: [`/api/analytics/monthly/${currentYear}/${currentMonth}`],
  });

  const { data: prevStats } = useQuery<MonthlyStats>({
    queryKey: [`/api/analytics/monthly/${currentMonth === 1 ? currentYear - 1 : currentYear}/${currentMonth === 1 ? 12 : currentMonth - 1}`],
  });

  const formatCurrency = (amount: string) => {
    return new Intl.NumberFormat('en-NG', {
      style: 'currency',
      currency: 'NGN',
      minimumFractionDigits: 0,
    }).format(parseFloat(amount));
  };

  const calculatePercentageChange = (current: string, previous: string) => {
    const curr = parseFloat(current);
    const prev = parseFloat(previous);
    
    if (prev === 0) return curr > 0 ? 100 : 0;
    return ((curr - prev) / prev) * 100;
  };

  if (isLoading) {
    return (
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
        {[...Array(3)].map((_, index) => (
          <Card key={index} className="animate-pulse">
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <div className="h-4 w-20 bg-gray-200 rounded mb-2"></div>
                  <div className="h-8 w-24 bg-gray-200 rounded"></div>
                </div>
                <div className="w-12 h-12 bg-gray-200 rounded-lg"></div>
              </div>
              <div className="mt-4">
                <div className="h-3 w-16 bg-gray-200 rounded"></div>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>
    );
  }

  const currentExpenses = parseFloat(stats?.totalExpenses || '0');
  const previousExpenses = parseFloat(prevStats?.totalExpenses || '0');
  const expenseChange = calculatePercentageChange(stats?.totalExpenses || '0', prevStats?.totalExpenses || '0');

  // For demo purposes, using fixed income. In a real app, this would come from income tracking
  const monthlyIncome = 250000;
  const remainingBudget = monthlyIncome - currentExpenses;
  const budgetUsedPercentage = (currentExpenses / monthlyIncome) * 100;

  return (
    <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
      {/* Monthly Spending */}
      <Card className="border border-gray-100 shadow-sm">
        <CardContent className="p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-gray-600 text-sm font-medium">This Month</p>
              <p className="text-2xl font-semibold text-gray-900 mt-1">
                {formatCurrency(stats?.totalExpenses || '0')}
              </p>
            </div>
            <div className="w-12 h-12 bg-red-50 rounded-lg flex items-center justify-center">
              <i className="fas fa-arrow-down text-red-500 text-lg"></i>
            </div>
          </div>
          <div className="mt-4 flex items-center">
            <span className={`text-sm font-medium ${expenseChange >= 0 ? 'text-red-500' : 'text-green-500'}`}>
              {expenseChange >= 0 ? '+' : ''}{expenseChange.toFixed(1)}%
            </span>
            <span className="text-gray-600 text-sm ml-2">vs last month</span>
          </div>
        </CardContent>
      </Card>

      {/* Monthly Income */}
      <Card className="border border-gray-100 shadow-sm">
        <CardContent className="p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-gray-600 text-sm font-medium">Income</p>
              <p className="text-2xl font-semibold text-gray-900 mt-1">
                {formatCurrency(monthlyIncome.toString())}
              </p>
            </div>
            <div className="w-12 h-12 bg-green-50 rounded-lg flex items-center justify-center">
              <i className="fas fa-arrow-up text-green-500 text-lg"></i>
            </div>
          </div>
          <div className="mt-4 flex items-center">
            <span className="text-green-500 text-sm font-medium">+5%</span>
            <span className="text-gray-600 text-sm ml-2">vs last month</span>
          </div>
        </CardContent>
      </Card>

      {/* Remaining Budget */}
      <Card className="border border-gray-100 shadow-sm">
        <CardContent className="p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-gray-600 text-sm font-medium">Remaining</p>
              <p className="text-2xl font-semibold text-gray-900 mt-1">
                {formatCurrency(remainingBudget.toString())}
              </p>
            </div>
            <div className="w-12 h-12 bg-green-50 rounded-lg flex items-center justify-center">
              <i className="fas fa-piggy-bank text-green-500 text-lg"></i>
            </div>
          </div>
          <div className="mt-4">
            <div className="w-full bg-gray-200 rounded-full h-2">
              <div 
                className="bg-green-500 h-2 rounded-full transition-all duration-300" 
                style={{ width: `${Math.min(budgetUsedPercentage, 100)}%` }}
              ></div>
            </div>
            <span className="text-gray-600 text-sm mt-1">
              {budgetUsedPercentage.toFixed(0)}% of budget used
            </span>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
