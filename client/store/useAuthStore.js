import { create } from 'zustand';
import api from '../lib/api';

export const useAuthStore = create((set) => ({
  user: null,
  token: null,
  isLoading: true,
  isAuthenticated: false,

  initialize: async () => {
    if (typeof window === 'undefined') return;
    const token = localStorage.getItem('agentic_hire_token');
    const storedUser = localStorage.getItem('agentic_hire_user');

    if (token && storedUser) {
      try {
        set({ token, user: JSON.parse(storedUser), isAuthenticated: true, isLoading: false });
        // Refresh profile in background
        const res = await api.getMe();
        if (res.success && res.data) {
          localStorage.setItem('agentic_hire_user', JSON.stringify(res.data));
          set({ user: res.data });
        }
      } catch (err) {
        localStorage.removeItem('agentic_hire_token');
        localStorage.removeItem('agentic_hire_user');
        set({ user: null, token: null, isAuthenticated: false, isLoading: false });
      }
    } else {
      set({ isLoading: false });
    }
  },

  login: async (email, password) => {
    const res = await api.login(email, password);
    if (res.success && res.data) {
      localStorage.setItem('agentic_hire_token', res.data.token);
      localStorage.setItem('agentic_hire_user', JSON.stringify(res.data));
      set({ user: res.data, token: res.data.token, isAuthenticated: true });
      return res.data;
    }
    throw new Error(res.error || 'Login failed');
  },

  signup: async (name, email, password, role) => {
    const res = await api.signup(name, email, password, role);
    if (res.success && res.data) {
      localStorage.setItem('agentic_hire_token', res.data.token);
      localStorage.setItem('agentic_hire_user', JSON.stringify(res.data));
      set({ user: res.data, token: res.data.token, isAuthenticated: true });
      return res.data;
    }
    throw new Error(res.error || 'Signup failed');
  },

  logout: () => {
    if (typeof window !== 'undefined') {
      localStorage.removeItem('agentic_hire_token');
      localStorage.removeItem('agentic_hire_user');
    }
    set({ user: null, token: null, isAuthenticated: false });
  },
}));

export default useAuthStore;
