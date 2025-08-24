import { useAuthContext } from '../../providers/AuthProvider';

export const useAuth = () => {
  const context = useAuthContext();
  
  const { user, token, login, logout } = context;
  
  return {
    user,
    token,
    login,
    logout,
    isAuthenticated: !!token && !!user,
  };
};
