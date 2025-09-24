import { ref, computed } from 'vue';
import { AuthService } from '../services/api';

// Global authentication state
const isAuthenticated = ref(AuthService.isAuthenticated());

export function useAuth() {
  const login = async (credentials: { username: string; password: string }) => {
    try {
      const response = await AuthService.login(credentials);
      AuthService.setToken(response.access_token);
      isAuthenticated.value = true;
      return response;
    } catch (error) {
      throw error;
    }
  };

  const logout = () => {
    AuthService.logout();
    isAuthenticated.value = false;
  };

  const checkAuth = () => {
    isAuthenticated.value = AuthService.isAuthenticated();
    return isAuthenticated.value;
  };

  return {
    isAuthenticated: computed(() => isAuthenticated.value),
    login,
    logout,
    checkAuth,
  };
}
