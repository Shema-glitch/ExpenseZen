import { useQuery } from '@tanstack/react-query';
import { Card, CardContent } from '@/components/ui/card';

interface SpendingInsight {
  message: string;
  suggestions: string[];
  budgetAlert?: string;
  trend: "increasing" | "decreasing" | "stable";
  confidence: number;
}

export function AIInsights() {
  const { data: insights, isLoading, error } = useQuery<SpendingInsight>({
    queryKey: ['/api/insights'],
    staleTime: 5 * 60 * 1000, // 5 minutes
    refetchInterval: 10 * 60 * 1000, // 10 minutes
  });

  if (isLoading) {
    return (
      <Card className="bg-gradient-to-r from-blue-50 to-green-50 border border-blue-100">
        <CardContent className="p-6">
          <div className="flex items-start space-x-4 animate-pulse">
            <div className="w-10 h-10 bg-gray-200 rounded-lg flex-shrink-0"></div>
            <div className="flex-1">
              <div className="h-4 w-32 bg-gray-200 rounded mb-2"></div>
              <div className="h-3 w-full bg-gray-200 rounded mb-2"></div>
              <div className="h-3 w-3/4 bg-gray-200 rounded mb-4"></div>
              <div className="flex flex-wrap gap-2">
                <div className="h-6 w-20 bg-gray-200 rounded-full"></div>
                <div className="h-6 w-24 bg-gray-200 rounded-full"></div>
                <div className="h-6 w-18 bg-gray-200 rounded-full"></div>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>
    );
  }

  if (error || !insights) {
    return (
      <Card className="bg-gradient-to-r from-gray-50 to-gray-100 border border-gray-200">
        <CardContent className="p-6">
          <div className="flex items-start space-x-4">
            <div className="w-10 h-10 bg-gray-200 rounded-lg flex items-center justify-center flex-shrink-0">
              <i className="fas fa-exclamation-triangle text-gray-500"></i>
            </div>
            <div className="flex-1">
              <h3 className="font-semibold text-gray-900 mb-2">
                <i className="fas fa-robot text-gray-500 mr-2"></i>
                AI Insights Unavailable
              </h3>
              <p className="text-gray-600">
                Unable to generate spending insights at the moment. Add more expenses to get personalized financial advice.
              </p>
            </div>
          </div>
        </CardContent>
      </Card>
    );
  }

  const getTrendIcon = (trend: string) => {
    switch (trend) {
      case 'increasing':
        return 'fas fa-arrow-trend-up text-red-500';
      case 'decreasing':
        return 'fas fa-arrow-trend-down text-green-500';
      default:
        return 'fas fa-minus text-blue-500';
    }
  };

  const getConfidenceColor = (confidence: number) => {
    if (confidence >= 0.8) return 'text-green-600';
    if (confidence >= 0.6) return 'text-yellow-600';
    return 'text-red-600';
  };

  return (
    <Card className="bg-gradient-to-r from-blue-50 to-green-50 border border-blue-100">
      <CardContent className="p-6">
        <div className="flex items-start space-x-4">
          <div className="w-10 h-10 bg-blue-100 rounded-lg flex items-center justify-center flex-shrink-0">
            <i className="fas fa-brain text-blue-600"></i>
          </div>
          <div className="flex-1">
            <div className="flex items-center justify-between mb-2">
              <h3 className="font-semibold text-gray-900">
                <i className="fas fa-sparkles text-yellow-500 mr-2"></i>
                AI Insights
              </h3>
              <div className="flex items-center space-x-2">
                <i className={getTrendIcon(insights.trend)}></i>
                <span className={`text-xs ${getConfidenceColor(insights.confidence)}`}>
                  {(insights.confidence * 100).toFixed(0)}% confidence
                </span>
              </div>
            </div>
            
            <p className="text-gray-700 mb-4 leading-relaxed">
              {insights.message}
            </p>

            {insights.budgetAlert && (
              <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-3 mb-4">
                <div className="flex items-start space-x-2">
                  <i className="fas fa-exclamation-triangle text-yellow-600 mt-0.5"></i>
                  <p className="text-yellow-800 text-sm">{insights.budgetAlert}</p>
                </div>
              </div>
            )}
            
            <div className="flex flex-wrap gap-2">
              {insights.suggestions.map((suggestion, index) => (
                <span 
                  key={index}
                  className="px-3 py-1 bg-white rounded-full text-sm text-gray-700 border border-gray-200 hover:bg-gray-50 transition-colors duration-200"
                >
                  💡 {suggestion}
                </span>
              ))}
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
