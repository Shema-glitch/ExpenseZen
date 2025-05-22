import { format } from 'date-fns';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import type { Expense } from '@shared/schema';

interface ExpenseListProps {
  expenses: Expense[];
  onEdit?: (expense: Expense) => void;
  onDelete?: (id: number) => void;
  isLoading?: boolean;
}

const categoryIcons: Record<string, { icon: string; color: string }> = {
  'Food & Dining': { icon: 'fas fa-utensils', color: 'text-red-500 bg-red-50' },
  'Transport': { icon: 'fas fa-car', color: 'text-blue-500 bg-blue-50' },
  'Shopping': { icon: 'fas fa-shopping-bag', color: 'text-purple-500 bg-purple-50' },
  'Entertainment': { icon: 'fas fa-film', color: 'text-green-500 bg-green-50' },
  'Bills & Utilities': { icon: 'fas fa-bolt', color: 'text-yellow-500 bg-yellow-50' },
  'Health': { icon: 'fas fa-heart', color: 'text-pink-500 bg-pink-50' },
  'Education': { icon: 'fas fa-graduation-cap', color: 'text-indigo-500 bg-indigo-50' },
  'Other': { icon: 'fas fa-ellipsis-h', color: 'text-gray-500 bg-gray-50' },
};

export function ExpenseList({ expenses, onEdit, onDelete, isLoading }: ExpenseListProps) {
  const formatCurrency = (amount: string) => {
    return new Intl.NumberFormat('en-NG', {
      style: 'currency',
      currency: 'NGN',
      minimumFractionDigits: 0,
    }).format(parseFloat(amount));
  };

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    const today = new Date();
    const yesterday = new Date(today);
    yesterday.setDate(yesterday.getDate() - 1);

    if (format(date, 'yyyy-MM-dd') === format(today, 'yyyy-MM-dd')) {
      return 'Today';
    } else if (format(date, 'yyyy-MM-dd') === format(yesterday, 'yyyy-MM-dd')) {
      return 'Yesterday';
    } else {
      return format(date, 'MMM d, yyyy');
    }
  };

  if (isLoading) {
    return (
      <div className="space-y-4">
        {[...Array(5)].map((_, index) => (
          <Card key={index} className="p-4 animate-pulse">
            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-4">
                <div className="w-12 h-12 bg-gray-200 rounded-lg"></div>
                <div>
                  <div className="h-4 w-32 bg-gray-200 rounded mb-2"></div>
                  <div className="h-3 w-20 bg-gray-200 rounded mb-1"></div>
                  <div className="h-3 w-16 bg-gray-200 rounded"></div>
                </div>
              </div>
              <div className="text-right">
                <div className="h-4 w-20 bg-gray-200 rounded mb-2"></div>
                <div className="h-6 w-6 bg-gray-200 rounded"></div>
              </div>
            </div>
          </Card>
        ))}
      </div>
    );
  }

  if (expenses.length === 0) {
    return (
      <div className="text-center py-12">
        <div className="w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-4">
          <i className="fas fa-receipt text-gray-400 text-xl"></i>
        </div>
        <h3 className="text-lg font-medium text-gray-900 mb-2">No expenses found</h3>
        <p className="text-gray-500">Start tracking your expenses by adding your first entry.</p>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      {expenses.map((expense) => {
        const categoryInfo = categoryIcons[expense.category] || categoryIcons['Other'];
        
        return (
          <Card 
            key={expense.id} 
            className="p-4 transition-all duration-200 hover:shadow-md hover:-translate-y-0.5"
          >
            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-4">
                <div className={`w-12 h-12 rounded-lg flex items-center justify-center ${categoryInfo.color}`}>
                  <i className={`${categoryInfo.icon} ${categoryInfo.color.split(' ')[0]}`}></i>
                </div>
                <div>
                  <h3 className="font-medium text-gray-900">{expense.description}</h3>
                  <p className="text-gray-600 text-sm">{expense.category}</p>
                  <p className="text-gray-500 text-xs">{formatDate(expense.date)}</p>
                </div>
              </div>
              <div className="text-right flex items-center space-x-2">
                <div>
                  <p className="font-semibold text-gray-900">
                    {formatCurrency(expense.amount)}
                  </p>
                </div>
                {(onEdit || onDelete) && (
                  <div className="flex flex-col space-y-1">
                    {onEdit && (
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => onEdit(expense)}
                        className="h-6 w-6 p-0 hover:bg-blue-50"
                      >
                        <i className="fas fa-edit text-xs text-blue-600"></i>
                      </Button>
                    )}
                    {onDelete && (
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => onDelete(expense.id)}
                        className="h-6 w-6 p-0 hover:bg-red-50"
                      >
                        <i className="fas fa-trash text-xs text-red-600"></i>
                      </Button>
                    )}
                  </div>
                )}
              </div>
            </div>
          </Card>
        );
      })}
    </div>
  );
}
