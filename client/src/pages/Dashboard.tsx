import { useState, useMemo } from 'react';
import { useQuery } from '@tanstack/react-query';
import { Navigation } from '@/components/Navigation';
import { QuickStats } from '@/components/QuickStats';
import { FilterControls } from '@/components/FilterControls';
import { ExpenseList } from '@/components/ExpenseList';
import { ExpenseChart } from '@/components/ExpenseChart';
import { AIInsights } from '@/components/AIInsights';
import { AddExpenseModal } from '@/components/AddExpenseModal';
import { VoiceModal } from '@/components/VoiceModal';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import type { Expense } from '@shared/schema';

export function Dashboard() {
  const [view, setView] = useState<'list' | 'chart'>('list');
  const [filters, setFilters] = useState({
    search: '',
    category: 'all',
    dateRange: 'this-month',
  });
  const [addExpenseModalOpen, setAddExpenseModalOpen] = useState(false);
  const [voiceModalOpen, setVoiceModalOpen] = useState(false);
  const [voiceExpenseData, setVoiceExpenseData] = useState<any>(null);

  // Convert date range to actual dates
  const getDateRange = (range: string) => {
    const now = new Date();
    const year = now.getFullYear();
    const month = now.getMonth();

    switch (range) {
      case 'this-month':
        return {
          startDate: `${year}-${(month + 1).toString().padStart(2, '0')}-01`,
          endDate: `${year}-${(month + 1).toString().padStart(2, '0')}-31`,
        };
      case 'last-month':
        const lastMonth = month === 0 ? 11 : month - 1;
        const lastMonthYear = month === 0 ? year - 1 : year;
        return {
          startDate: `${lastMonthYear}-${(lastMonth + 1).toString().padStart(2, '0')}-01`,
          endDate: `${lastMonthYear}-${(lastMonth + 1).toString().padStart(2, '0')}-31`,
        };
      case 'last-3-months':
        const threeMonthsAgo = new Date(year, month - 3, 1);
        return {
          startDate: `${threeMonthsAgo.getFullYear()}-${(threeMonthsAgo.getMonth() + 1).toString().padStart(2, '0')}-01`,
          endDate: `${year}-${(month + 1).toString().padStart(2, '0')}-31`,
        };
      case 'this-year':
        return {
          startDate: `${year}-01-01`,
          endDate: `${year}-12-31`,
        };
      default:
        return {};
    }
  };

  const dateRange = getDateRange(filters.dateRange);
  
  const expenseQueryParams = new URLSearchParams({
    ...(filters.search && { search: filters.search }),
    ...(filters.category !== 'all' && { category: filters.category }),
    ...dateRange,
  });

  const { data: expenses = [], isLoading: expensesLoading } = useQuery<Expense[]>({
    queryKey: ['/api/expenses', expenseQueryParams.toString()],
  });

  const { data: categoryData = [], isLoading: categoryLoading } = useQuery<{
    category: string;
    total: string;
    count: number;
  }[]>({
    queryKey: ['/api/analytics/categories', dateRange.startDate, dateRange.endDate],
  });

  const handleVoiceExpenseParsed = (data: any) => {
    setVoiceExpenseData(data);
    setAddExpenseModalOpen(true);
  };

  const handleAddExpenseModalClose = () => {
    setAddExpenseModalOpen(false);
    setVoiceExpenseData(null);
  };

  return (
    <div className="min-h-screen bg-gray-50">
      <Navigation onVoiceClick={() => setVoiceModalOpen(true)} />
      
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
        <QuickStats />
        
        <FilterControls
          onFilterChange={setFilters}
          onViewChange={setView}
          currentView={view}
        />

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 mb-8">
          {/* Main Content */}
          <div>
            {view === 'list' ? (
              <ExpenseList 
                expenses={expenses}
                isLoading={expensesLoading}
              />
            ) : (
              <Card className="border border-gray-100 shadow-sm">
                <CardContent className="p-6">
                  <h3 className="text-lg font-semibold text-gray-900 mb-6">
                    Spending by Category
                  </h3>
                  <ExpenseChart data={categoryData} />
                </CardContent>
              </Card>
            )}
          </div>

          {/* Chart View (always visible on desktop) */}
          <div className={view === 'chart' ? 'hidden lg:block' : ''}>
            <Card className="border border-gray-100 shadow-sm">
              <CardContent className="p-6">
                <h3 className="text-lg font-semibold text-gray-900 mb-6">
                  Spending by Category
                </h3>
                <ExpenseChart data={categoryData} />
              </CardContent>
            </Card>
          </div>
        </div>

        <AIInsights />
      </div>

      {/* Floating Action Button */}
      <Button
        onClick={() => setAddExpenseModalOpen(true)}
        className="fixed bottom-6 right-6 w-14 h-14 rounded-full shadow-lg hover:shadow-xl transition-all duration-200 z-50 bg-blue-500 hover:bg-blue-600"
        size="sm"
      >
        <i className="fas fa-plus text-xl"></i>
      </Button>

      {/* Modals */}
      <AddExpenseModal
        open={addExpenseModalOpen}
        onOpenChange={handleAddExpenseModalClose}
        defaultValues={voiceExpenseData ? {
          amount: voiceExpenseData.amount?.toString() || '',
          category: voiceExpenseData.category || '',
          description: voiceExpenseData.description || '',
          date: new Date().toISOString().split('T')[0],
        } : undefined}
      />

      <VoiceModal
        open={voiceModalOpen}
        onOpenChange={setVoiceModalOpen}
        onExpenseParsed={handleVoiceExpenseParsed}
      />
    </div>
  );
}
