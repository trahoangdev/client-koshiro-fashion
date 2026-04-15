import { useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth, getUserRoleName, isAdminUser } from '@/contexts';

interface ProtectedAdminRouteProps {
  children: React.ReactNode;
}

export default function ProtectedAdminRoute({ children }: ProtectedAdminRouteProps) {
  const { user, isAuthenticated, isLoading } = useAuth();
  const navigate = useNavigate();

  useEffect(() => {
    if (!isLoading) {
      if (!isAuthenticated) {
        navigate('/admin/login');
      } else {
        if (!isAdminUser(user)) {
          navigate('/');
        }
      }
    }
  }, [user, isAuthenticated, isLoading, navigate]);

  // Add a check to prevent redirect loop
  useEffect(() => {
    const currentPath = window.location.pathname;
    
    if (currentPath === '/admin/login' && isAuthenticated) {
      if (isAdminUser(user)) {
        navigate('/admin');
      }
    }
  }, [isAuthenticated, user, navigate]);

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-primary mx-auto"></div>
          <p className="mt-4 text-muted-foreground">Loading...</p>
        </div>
      </div>
    );
  }

  if (!isAuthenticated) {
    return null;
  }
  
  if (!isAdminUser(user)) {
    return null;
  }

  return <>{children}</>;
} 