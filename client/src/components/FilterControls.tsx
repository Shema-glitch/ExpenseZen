import { useState } from 'react';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';

interface FilterControlsProps {
  onFilterChange: (filters: {
    search: string;
    category: string;
    dateRange: string;
  }) => void;
  onViewChange: (view: 'list' | 'chart') => void;
  currentView: 'list' | 'chart';
}

const categories = [
  'all',
  'Food & Dining',
  'Transport',
  'Shopping',
  'Entertainment',
  'Bills & Utilities',
  'Health',
  'Education',
  'Other'
];

const dateRanges = [
  { value: 'this-month', label: 'This Month' },
  { value: 'last-month', label: 'Last Month' },
  { value: 'last-3-months', label: 'Last 3 Months' },
  { value: 'this-year', label: 'This Year' },
  { value: 'custom', label: 'Custom Range' },
];

export function FilterControls({ onFilterChange, onViewChange, currentView }: FilterControlsProps) {
  const [search, setSearch] = useState('');
  const [category, setCategory] = useState('all');
  const [dateRange, setDateRange] = useState('this-month');

  const handleFilterChange = (newFilters: Partial<{
    search: string;
    category: string;
    dateRange: string;
  }>) => {
    const updatedFilters = {
      search,
      category,
      dateRange,
      ...newFilters,
    };

    if (newFilters.search !== undefined) setSearch(newFilters.search);
    if (newFilters.category !== undefined) setCategory(newFilters.category);
    if (newFilters.dateRange !== undefined) setDateRange(newFilters.dateRange);

    onFilterChange(updatedFilters);
  };

  return (
    <Card className="border border-gray-100 shadow-sm mb-8">
      <CardContent className="p-6">
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between space-y-4 sm:space-y-0 sm:space-x-4">
          <div className="flex items-center space-x-4">
            <h2 className="text-lg font-semibold text-gray-900">Expenses</h2>
            
            {/* View Toggle */}
            <div className="flex bg-gray-100 rounded-lg p-1">
              <Button
                variant={currentView === 'list' ? 'default' : 'ghost'}
                size="sm"
                onClick={() => onViewChange('list')}
                className={`px-3 py-1 text-sm font-medium transition-colors duration-200 ${
                  currentView === 'list' 
                    ? 'bg-white text-gray-900 shadow-sm' 
                    : 'text-gray-600 hover:text-gray-900'
                }`}
              >
                <i className="fas fa-list mr-1"></i> List
              </Button>
              <Button
                variant={currentView === 'chart' ? 'default' : 'ghost'}
                size="sm"
                onClick={() => onViewChange('chart')}
                className={`px-3 py-1 text-sm font-medium transition-colors duration-200 ${
                  currentView === 'chart' 
                    ? 'bg-white text-gray-900 shadow-sm' 
                    : 'text-gray-600 hover:text-gray-900'
                }`}
              >
                <i className="fas fa-chart-pie mr-1"></i> Chart
              </Button>
            </div>
          </div>
          
          <div className="flex flex-col sm:flex-row space-y-2 sm:space-y-0 sm:space-x-3">
            {/* Search */}
            <div className="relative">
              <i className="fas fa-search absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-500 text-sm"></i>
              <Input
                type="text"
                placeholder="Search expenses..."
                value={search}
                onChange={(e) => handleFilterChange({ search: e.target.value })}
                className="pl-10 pr-4 w-full sm:w-48"
              />
            </div>
            
            {/* Category Filter */}
            <Select
              value={category}
              onValueChange={(value) => handleFilterChange({ category: value })}
            >
              <SelectTrigger className="w-full sm:w-40">
                <SelectValue placeholder="All Categories" />
              </SelectTrigger>
              <SelectContent>
                {categories.map((cat) => (
                  <SelectItem key={cat} value={cat}>
                    {cat === 'all' ? 'All Categories' : cat}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
            
            {/* Date Filter */}
            <Select
              value={dateRange}
              onValueChange={(value) => handleFilterChange({ dateRange: value })}
            >
              <SelectTrigger className="w-full sm:w-40">
                <SelectValue placeholder="This Month" />
              </SelectTrigger>
              <SelectContent>
                {dateRanges.map((range) => (
                  <SelectItem key={range.value} value={range.value}>
                    {range.label}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
