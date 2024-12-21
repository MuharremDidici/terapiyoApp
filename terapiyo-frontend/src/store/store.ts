import { configureStore } from '@reduxjs/toolkit';
import authReducer from './slices/authSlice';
import { AuthState } from '@/types/auth.types';

// Başlangıç durumunu localStorage'dan al
const storedUser = localStorage.getItem('user');
const storedToken = localStorage.getItem('token');

const getInitialAuthState = (): AuthState => ({
  isAuthenticated: !!storedToken && !!storedUser,
  user: storedUser ? JSON.parse(storedUser) : null,
  token: storedToken,
  isLoading: false,
  error: null,
});

const store = configureStore({
  reducer: {
    auth: authReducer,
  },
  preloadedState: {
    auth: getInitialAuthState(),
  },
  middleware: (getDefaultMiddleware) =>
    getDefaultMiddleware({
      serializableCheck: false
    })
});

export type RootState = ReturnType<typeof store.getState>;
export type AppDispatch = typeof store.dispatch;

export default store;
