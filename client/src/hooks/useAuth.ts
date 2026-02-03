import { useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuthStore } from '../store';

export const useAuth = (requiredRole?: string) => {
  const { user, isAuthenticated, token } = useAuthStore();
  const navigate = useNavigate();

  useEffect(() => {
    if (!isAuthenticated || !token) {
      if (requiredRole === 'admin') {
        navigate('/admin/login');
      } else if (requiredRole === 'technician') {
        navigate('/technician/login');
      } else {
        navigate('/login');
      }
      return;
    }

    if (requiredRole && user?.role !== requiredRole) {
      navigate('/unauthorized');
    }
  }, [isAuthenticated, token, user, requiredRole, navigate]);

  return { user, isAuthenticated };
};
