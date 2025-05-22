import { useMemo } from 'react';
import { PieChart, Pie, Cell, ResponsiveContainer, Tooltip, Legend } from 'recharts';

interface CategoryData {
  category: string;
  total: string;
  count: number;
}

interface ExpenseChartProps {
  data: CategoryData[];
}

const COLORS = [
  '#EF4444', // Red
  '#3B82F6', // Blue
  '#8B5CF6', // Purple
  '#10B981', // Green
  '#F59E0B', // Yellow
  '#EC4899', // Pink
  '#6366F1', // Indigo
  '#84CC16', // Lime
];

const RADIAN = Math.PI / 180;
const renderCustomizedLabel = ({
  cx, cy, midAngle, innerRadius, outerRadius, percent
}: any) => {
  const radius = innerRadius + (outerRadius - innerRadius) * 0.5;
  const x = cx + radius * Math.cos(-midAngle * RADIAN);
  const y = cy + radius * Math.sin(-midAngle * RADIAN);

  if (percent < 0.05) return null; // Don't show labels for very small slices

  return (
    <text 
      x={x} 
      y={y} 
      fill="white" 
      textAnchor={x > cx ? 'start' : 'end'} 
      dominantBaseline="central"
      fontSize={12}
      fontWeight="600"
    >
      {`${(percent * 100).toFixed(0)}%`}
    </text>
  );
};

export function ExpenseChart({ data }: ExpenseChartProps) {
  const chartData = useMemo(() => {
    return data.map((item) => ({
      name: item.category,
      value: parseFloat(item.total),
      count: item.count,
    }));
  }, [data]);

  const totalAmount = useMemo(() => {
    return chartData.reduce((sum, item) => sum + item.value, 0);
  }, [chartData]);

  const formatCurrency = (value: number) => {
    return new Intl.NumberFormat('en-NG', {
      style: 'currency',
      currency: 'NGN',
      minimumFractionDigits: 0,
    }).format(value);
  };

  if (chartData.length === 0) {
    return (
      <div className="h-80 flex items-center justify-center text-gray-500">
        <div className="text-center">
          <div className="w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-4">
            <i className="fas fa-chart-pie text-gray-400 text-xl"></i>
          </div>
          <p>No expenses to display</p>
          <p className="text-sm mt-1">Add some expenses to see your spending breakdown</p>
        </div>
      </div>
    );
  }

  return (
    <div>
      <div className="relative h-80">
        <ResponsiveContainer width="100%" height="100%">
          <PieChart>
            <Pie
              data={chartData}
              cx="50%"
              cy="50%"
              labelLine={false}
              label={renderCustomizedLabel}
              outerRadius={120}
              innerRadius={60}
              fill="#8884d8"
              dataKey="value"
              animationBegin={0}
              animationDuration={800}
            >
              {chartData.map((entry, index) => (
                <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
              ))}
            </Pie>
            <Tooltip
              formatter={(value: number) => [formatCurrency(value), 'Amount']}
              labelFormatter={(label) => `Category: ${label}`}
            />
          </PieChart>
        </ResponsiveContainer>
      </div>
      
      {/* Chart Legend */}
      <div className="mt-6 space-y-3">
        {chartData.map((item, index) => {
          const percentage = ((item.value / totalAmount) * 100).toFixed(1);
          return (
            <div key={item.name} className="flex items-center justify-between">
              <div className="flex items-center space-x-3">
                <div 
                  className="w-3 h-3 rounded-full"
                  style={{ backgroundColor: COLORS[index % COLORS.length] }}
                ></div>
                <span className="text-gray-600 text-sm">{item.name}</span>
              </div>
              <span className="font-medium text-gray-900">
                {formatCurrency(item.value)} ({percentage}%)
              </span>
            </div>
          );
        })}
      </div>
    </div>
  );
}
