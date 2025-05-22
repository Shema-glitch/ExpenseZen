import { Button } from '@/components/ui/button';
import { useAuth } from '@/hooks/useAuth';

interface NavigationProps {
  onVoiceClick: () => void;
}

export function Navigation({ onVoiceClick }: NavigationProps) {
  const { user, isAuthenticated } = useAuth();

  if (!isAuthenticated) {
    return null;
  }

  return (
    <header className="bg-white shadow-sm border-b border-gray-100 sticky top-0 z-40">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center h-16">
          <div className="flex items-center space-x-3">
            <div className="w-8 h-8 bg-blue-500 rounded-lg flex items-center justify-center">
              <i className="fas fa-wallet text-white text-sm"></i>
            </div>
            <h1 className="text-xl font-semibold text-gray-900">ZenSpend</h1>
          </div>
          
          <div className="flex items-center space-x-4">
            {/* Voice Input Button */}
            <Button
              variant="ghost"
              size="sm"
              onClick={onVoiceClick}
              className="p-2 text-gray-600 hover:text-blue-500 transition-colors duration-200"
            >
              <i className="fas fa-microphone text-lg"></i>
            </Button>
            
            {/* Profile */}
            <div className="flex items-center space-x-2">
              {user?.profileImageUrl ? (
                <img 
                  src={user.profileImageUrl} 
                  alt="User profile" 
                  className="w-8 h-8 rounded-full object-cover"
                />
              ) : (
                <div className="w-8 h-8 bg-gray-200 rounded-full flex items-center justify-center">
                  <i className="fas fa-user text-gray-500 text-sm"></i>
                </div>
              )}
              <span className="text-sm font-medium text-gray-900 hidden sm:block">
                {user?.firstName && user?.lastName 
                  ? `${user.firstName} ${user.lastName}`
                  : user?.email || 'User'
                }
              </span>
              
              {/* Logout Button */}
              <Button 
                variant="ghost" 
                size="sm"
                onClick={() => window.location.href = '/api/logout'}
                className="text-gray-600 hover:text-red-500 ml-2"
              >
                <i className="fas fa-sign-out-alt"></i>
              </Button>
            </div>
          </div>
        </div>
      </div>
    </header>
  );
}
