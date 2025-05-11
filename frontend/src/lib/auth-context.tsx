import { createContext, useState, useContext, useEffect, ReactNode, useCallback, useMemo } from 'react';
import { authAPI } from './api';

interface User {
  id: string;
  email: string;
  fullName: string;
  role: string;
  phoneNumber?: string;
  address?: string;
  avatarUrl?: string;
}

interface AuthContextType {
  user: User | null;
  isLoggedIn: boolean;
  login: (email: string, password: string) => Promise<boolean>;
  register: (userData: { 
    email: string;
    password: string;
    fullName: string;
    phoneNumber?: string;
    address?: string;
  }) => Promise<boolean>;
  logout: () => Promise<boolean>;
  updateProfile: (userData: {
    fullName: string;
    phoneNumber?: string;
    address?: string;
  }) => Promise<boolean>;
  loading: boolean;
  error: string | null;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider = ({ children }: { children: ReactNode }) => {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);
  const [initialized, setInitialized] = useState<boolean>(false);

  const isLoggedIn = user !== null;

  // Đăng nhập sử dụng API thực
  const login = useCallback(async (email: string, password: string): Promise<boolean> => {
    setLoading(true);
    setError(null);
    
    try {
      const response = await authAPI.login(email, password);
      
      if (response.status === 'success' && response.data && response.data.user) {
        setUser(response.data.user);
        return true;
      } else {
        setError(response.message || 'Đăng nhập thất bại');
        return false;
      }
    } catch (error: any) {
      const errorMsg = error.response?.data?.message || 'Đăng nhập thất bại';
      setError(errorMsg);
      return false;
    } finally {
      setLoading(false);
    }
  }, []);

  // Đăng ký sử dụng API thực
  const register = useCallback(async (userData: { 
    email: string;
    password: string;
    fullName: string;
    phoneNumber?: string;
    address?: string;
  }): Promise<boolean> => {
    setLoading(true);
    setError(null);
    
    try {
      const response = await authAPI.register(userData);
      
      if (response.status === 'success') {
        // Sau khi đăng ký thành công, thường sẽ tự động đăng nhập
        // hoặc chuyển người dùng đến trang đăng nhập
        return true;
      } else {
        setError(response.message || 'Đăng ký thất bại');
        return false;
      }
    } catch (error: any) {
      const errorMsg = error.response?.data?.message || 'Đăng ký thất bại';
      setError(errorMsg);
      return false;
    } finally {
      setLoading(false);
    }
  }, []);

  // Đăng xuất sử dụng API thực
  const logout = useCallback(async (): Promise<boolean> => {
    setLoading(true);
    setError(null);
    
    try {
      await authAPI.logout();
      setUser(null);
      return true;
    } catch (error: any) {
      const errorMsg = error.response?.data?.message || 'Đăng xuất thất bại';
      setError(errorMsg);
      // Ngay cả khi API bị lỗi, chúng ta vẫn muốn đăng xuất trên phía client
      setUser(null);
      return false;
    } finally {
      setLoading(false);
    }
  }, []);

  // Cập nhật thông tin profile người dùng
  const updateProfile = useCallback(async (userData: {
    fullName: string;
    phoneNumber?: string;
    address?: string;
  }): Promise<boolean> => {
    setLoading(true);
    setError(null);
    
    try {
      const response = await authAPI.updateProfile(userData);
      
      if (response.status === 'success' && response.data) {
        // Cập nhật thông tin người dùng trong state
        setUser(prev => prev ? { ...prev, ...response.data } : null);
        return true;
      } else {
        setError(response.message || 'Cập nhật thông tin thất bại');
        return false;
      }
    } catch (error: any) {
      const errorMsg = error.response?.data?.message || 'Cập nhật thông tin thất bại';
      setError(errorMsg);
      return false;
    } finally {
      setLoading(false);
    }
  }, []);

  // Lấy thông tin người dùng từ token lưu trong localStorage
  const fetchCurrentUser = useCallback(async () => {
    // Kiểm tra xem có token trong localStorage không
    const token = localStorage.getItem('token');
    if (!token) {
      setInitialized(true);
      return;
    }
    
    setLoading(true);
    
    try {
      const response = await authAPI.getProfile();
      
      if (response.status === 'success' && response.data) {
        setUser(response.data);
      }
    } catch (error) {
      console.error('Không thể lấy thông tin người dùng:', error);
      // Xóa token nếu không hợp lệ
      localStorage.removeItem('token');
    } finally {
      setLoading(false);
      setInitialized(true);
    }
  }, []);

  // Kiểm tra người dùng đã đăng nhập từ token khi khởi động
  useEffect(() => {
    fetchCurrentUser();
  }, [fetchCurrentUser]);

  const value = useMemo(() => ({
    user,
    isLoggedIn,
    login,
    register,
    logout,
    updateProfile,
    loading,
    error
  }), [user, isLoggedIn, login, register, logout, updateProfile, loading, error]);

  // Không render gì nếu chưa khởi tạo xong
  if (!initialized) {
    return null;
  }

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};

export const useAuth = (): AuthContextType => {
  const context = useContext(AuthContext);
  
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  
  return context;
}; 