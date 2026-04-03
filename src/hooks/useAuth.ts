import { useSelector, useDispatch } from 'react-redux';
import { RootState, AppDispatch } from '../store';
import { logout } from '../store/slices/authSlice';
import { StorageService } from '../utils/storage';

export const useAuth = () => {
  const dispatch = useDispatch<AppDispatch>();
  const { isAuthenticated, username } = useSelector(
    (state: RootState) => state.auth
  );

  const handleLogout = async () => {
    await StorageService.clearAuth();
    dispatch(logout());
  };

  return { isAuthenticated, username, handleLogout };
};