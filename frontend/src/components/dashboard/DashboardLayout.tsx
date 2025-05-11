import { useState, useEffect } from 'react';
import { Outlet, useNavigate } from 'react-router-dom';
import { useAuth } from '@/lib/auth-context';
import Sidebar from './Sidebar';
import Header from './Header';

interface DashboardLayoutProps {
  requiredRole?: 'admin' | 'seller';
}

export default function DashboardLayout({ requiredRole }: DashboardLayoutProps) {
  const { user, isLoggedIn } = useAuth();
  const navigate = useNavigate();
  const [isCollapsed, setIsCollapsed] = useState(false);
  const [isDarkMode, setIsDarkMode] = useState(false);
  
  const toggleSidebar = () => {
    setIsCollapsed(prevState => !prevState);
  };

  const toggleTheme = () => {
    setIsDarkMode(prevState => !prevState);
    // Apply dark mode to the document
    if (!isDarkMode) {
      document.documentElement.classList.add('dark');
    } else {
      document.documentElement.classList.remove('dark');
    }
  };

  // Check for authentication and correct role
  useEffect(() => {
    if (!isLoggedIn) {
      navigate('/login');
      return;
    }

    if (requiredRole && user?.role !== requiredRole) {
      if (user?.role === 'admin') {
        navigate('/admin/dashboard');
      } else if (user?.role === 'seller') {
        navigate('/seller/dashboard');
      } else {
        navigate('/');
      }
    }
  }, [isLoggedIn, user, requiredRole, navigate]);

  // Check for theme preference on mount
  useEffect(() => {
    const storedTheme = localStorage.getItem('theme');
    if (storedTheme === 'dark') {
      setIsDarkMode(true);
      document.documentElement.classList.add('dark');
    }
  }, []);

  // Save theme preference
  useEffect(() => {
    localStorage.setItem('theme', isDarkMode ? 'dark' : 'light');
  }, [isDarkMode]);

  if (!isLoggedIn || (requiredRole && user?.role !== requiredRole)) {
    return null; // Will redirect in useEffect
  }

  return (
    <div className={`flex h-screen bg-gray-50 ${isDarkMode ? 'dark' : ''}`}>
      <Sidebar isCollapsed={isCollapsed} toggleSidebar={toggleSidebar} />
      
      <div className="flex-1 flex flex-col overflow-hidden">
        <Header 
          toggleSidebar={toggleSidebar} 
          toggleTheme={toggleTheme} 
          isDarkMode={isDarkMode} 
        />
        
        <main className="flex-1 overflow-auto bg-gray-50 p-6">
          <Outlet />
        </main>

        <footer className="bg-white border-t border-gray-200 py-4 px-6 text-center text-sm text-gray-500">
          © {new Date().getFullYear()} Modern Stationery Store. Tất cả quyền được bảo lưu.
        </footer>
      </div>
    </div>
  );
} 