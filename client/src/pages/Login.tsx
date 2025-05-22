import { useEffect } from 'react';
import { useAuth } from '@/hooks/useAuth';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';

export function Login() {
  const { isAuthenticated, isLoading } = useAuth();

  useEffect(() => {
    if (isAuthenticated) {
      window.location.href = '/';
    }
  }, [isAuthenticated]);

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-500"></div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 flex items-center justify-center p-4">
      <Card className="w-full max-w-md">
        <CardHeader className="text-center">
          <div className="w-16 h-16 bg-blue-500 rounded-2xl flex items-center justify-center mx-auto mb-4">
            <i className="fas fa-wallet text-white text-2xl"></i>
          </div>
          <CardTitle className="text-2xl font-bold text-gray-900">
            Welcome to ZenSpend
          </CardTitle>
          <p className="text-gray-600 mt-2">
            Your minimalist expense tracker for peaceful money management
          </p>
        </CardHeader>
        
        <CardContent className="space-y-6">
          <div className="space-y-4">
            <div className="flex items-center space-x-3 text-sm text-gray-600">
              <i className="fas fa-check-circle text-green-500"></i>
              <span>Track expenses with voice input</span>
            </div>
            <div className="flex items-center space-x-3 text-sm text-gray-600">
              <i className="fas fa-check-circle text-green-500"></i>
              <span>Get AI-powered spending insights</span>
            </div>
            <div className="flex items-center space-x-3 text-sm text-gray-600">
              <i className="fas fa-check-circle text-green-500"></i>
              <span>Beautiful charts and analytics</span>
            </div>
            <div className="flex items-center space-x-3 text-sm text-gray-600">
              <i className="fas fa-check-circle text-green-500"></i>
              <span>Mobile-optimized design</span>
            </div>
          </div>
          
          <Button
            onClick={() => window.location.href = '/api/login'}
            className="w-full bg-blue-500 hover:bg-blue-600 text-white py-3"
            size="lg"
          >
            <i className="fas fa-sign-in-alt mr-2"></i>
            Sign in to get started
          </Button>
          
          <p className="text-xs text-gray-500 text-center">
            By signing in, you agree to our terms of service and privacy policy.
          </p>
        </CardContent>
      </Card>
    </div>
  );
}
