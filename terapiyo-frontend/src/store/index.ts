import { configureStore } from '@reduxjs/toolkit';
import authReducer, { setUser, setToken } from './slices/authSlice';

// localStorage'dan kullanıcı bilgilerini al
const user = localStorage.getItem('user');
const token = localStorage.getItem('token');

export const store = configureStore({
  reducer: {
    auth: authReducer,
  },
});

// Eğer localStorage'da kullanıcı bilgileri varsa store'u güncelle
if (user && token) {
  store.dispatch(setUser(JSON.parse(user)));
  store.dispatch(setToken(token));
}

export type RootState = ReturnType<typeof store.getState>;
export type AppDispatch = typeof store.dispatch;
