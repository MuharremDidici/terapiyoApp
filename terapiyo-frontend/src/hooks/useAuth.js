import { useSelector, useDispatch } from 'react-redux';
import { logout as logoutAction } from '@/store/slices/authSlice';
import authService from '@/services/auth.service';

export const useAuth = () => {
  const dispatch = useDispatch();
  const { isAuthenticated, user, token } = useSelector((state) => state.auth);

  const logout = async () => {
    try {
      await authService.logout();
      dispatch(logoutAction());
    } catch (error) {
      console.error('Çıkış yapılırken bir hata oluştu:', error);
      throw error;
    }
  };

  return {
    isAuthenticated,
    user,
    token,
    logout,
  };
};

export default useAuth;
