import { Link, NavLink, useNavigate } from 'react-router-dom';
import { ShoppingCart, User, LogOut, Menu, X, ChevronDown, LayoutDashboard } from 'lucide-react';
import { useState, useEffect } from 'react';
import { useCart } from '@/lib/cart-context';
import { useAuth } from '@/lib/auth-context';

export default function Navbar() {
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [scrolled, setScrolled] = useState(false);
  const [dropdownOpen, setDropdownOpen] = useState(false);
  const navigate = useNavigate();
  const { totalItems } = useCart();
  const { isLoggedIn, logout, user } = useAuth();

  // Quan sát sự kiện scroll để thay đổi hiệu ứng
  useEffect(() => {
    const handleScroll = () => {
      if (window.scrollY > 10) {
        setScrolled(true);
      } else {
        setScrolled(false);
      }
    };

    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  // Đóng dropdown khi click ra ngoài
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      const target = event.target as HTMLElement;
      if (dropdownOpen && !target.closest('.user-dropdown')) {
        setDropdownOpen(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, [dropdownOpen]);

  const handleLogout = async () => {
    await logout();
    navigate('/login');
  };

  // Hiển thị tên ngắn gọn hoặc tên đầy đủ
  const displayName = () => {
    if (!user) return '';
    
    // Xử lý trường hợp fullName không tồn tại
    if (!user.fullName) {
      // Lấy tên từ email nếu có
      if (user.email) {
        const emailName = user.email.split('@')[0];
        return emailName;
      }
      return 'User';
    }
    
    const names = user.fullName.split(' ');
    if (names.length > 1) {
      return names[names.length - 1]; // Lấy tên cuối cùng
    }
    return user.fullName;
  };

  // Kiểm tra xem người dùng có phải là admin hoặc seller không
  const canAccessDashboard = user && (user.role === 'admin' || user.role === 'seller');

  return (
    <nav
      className={`fixed w-full top-0 z-50 transition-all duration-300 ${
        scrolled ? 'bg-white shadow-md py-2' : 'bg-white/80 backdrop-blur-md py-4'
      }`}
    >
      <div className="container mx-auto px-4">
        <div className="flex justify-between items-center">
          {/* Logo */}
          <Link to="/" className="text-2xl font-bold text-blue-600">E-Shop</Link>

          {/* Desktop menu */}
          <div className="hidden md:flex items-center space-x-8">
            <NavLink
              to="/"
              className={({ isActive }) =>
                isActive ? 'text-blue-600 font-medium' : 'text-gray-700 hover:text-blue-600'
              }
            >
              Trang chủ
            </NavLink>
            <NavLink
              to="/products"
              className={({ isActive }) =>
                isActive ? 'text-blue-600 font-medium' : 'text-gray-700 hover:text-blue-600'
              }
            >
              Sản phẩm
            </NavLink>
          </div>

          {/* Actions */}
          <div className="hidden md:flex items-center space-x-4">
            <NavLink to="/cart" className="text-gray-700 hover:text-blue-600 relative">
              <ShoppingCart size={24} />
              <span className="absolute -top-2 -right-2 bg-blue-600 text-white text-xs rounded-full w-5 h-5 flex items-center justify-center">
                {totalItems || 0}
                  </span>
            </NavLink>
            
            {isLoggedIn ? (
              <div className="relative user-dropdown">
                <button 
                  className="flex items-center space-x-1 text-gray-700 hover:text-blue-600 focus:outline-none"
                  onClick={() => setDropdownOpen(!dropdownOpen)}
                >
                  <div className="w-8 h-8 rounded-full bg-blue-100 flex items-center justify-center">
                    <User size={18} className="text-blue-600" />
                  </div>
                  <span className="text-sm font-medium">{displayName()}</span>
                  <ChevronDown size={16} className={`transition-transform ${dropdownOpen ? 'rotate-180' : ''}`} />
                </button>
                
                {dropdownOpen && (
                  <div className="absolute right-0 mt-2 w-56 bg-white rounded-md shadow-lg overflow-hidden z-20 border border-gray-200 py-1">
                    <div className="px-4 py-3 border-b border-gray-100">
                      <p className="text-sm font-medium text-gray-900 truncate">{user?.fullName}</p>
                      <p className="text-xs text-gray-500 truncate">{user?.email}</p>
                    </div>
                    {canAccessDashboard && (
                      <Link 
                        to="/dashboard" 
                        className="flex items-center px-4 py-2 text-sm text-gray-700 hover:bg-blue-50 transition-colors"
                        onClick={() => setDropdownOpen(false)}
                      >
                        <LayoutDashboard size={16} className="mr-2" />
                        Dashboard
                      </Link>
                    )}
                    <Link 
                      to="/profile" 
                      className="flex items-center px-4 py-2 text-sm text-gray-700 hover:bg-blue-50 transition-colors"
                      onClick={() => setDropdownOpen(false)}
                    >
                      <User size={16} className="mr-2" />
                      Tài khoản của tôi
                    </Link>
                    <button
                      onClick={() => {
                        handleLogout();
                        setDropdownOpen(false);
                      }}
                      className="flex items-center w-full text-left px-4 py-2 text-sm text-gray-700 hover:bg-blue-50 transition-colors"
                    >
                      <LogOut size={16} className="mr-2" />
                      Đăng xuất
                    </button>
                  </div>
                )}
              </div>
            ) : (
              <div className="flex items-center space-x-2">
                <Link
                  to="/login"
                  className="px-4 py-2 text-sm text-gray-700 hover:text-blue-600 transition-colors"
                >
                  Đăng nhập
                </Link>
                <Link
                  to="/register"
                  className="px-4 py-2 bg-blue-600 text-white text-sm rounded-md hover:bg-blue-700 transition-colors"
                >
                  Đăng ký
                </Link>
              </div>
            )}
          </div>

          {/* Mobile menu button */}
          <div className="md:hidden flex items-center space-x-4">
            <NavLink to="/cart" className="text-gray-700 hover:text-blue-600 relative">
              <ShoppingCart size={24} />
              <span className="absolute -top-2 -right-2 bg-blue-600 text-white text-xs rounded-full w-5 h-5 flex items-center justify-center">
                {totalItems || 0}
                  </span>
            </NavLink>
            {isLoggedIn && (
              <Link to="/profile" className="text-gray-700 hover:text-blue-600">
                <User size={24} />
              </Link>
            )}
            <button
              onClick={() => setIsMenuOpen(!isMenuOpen)}
              className="text-gray-700 hover:text-blue-600 focus:outline-none"
            >
              {isMenuOpen ? <X size={24} /> : <Menu size={24} />}
            </button>
        </div>
      </div>

        {/* Mobile menu */}
      {isMenuOpen && (
          <div className="md:hidden pt-4 pb-2">
            <div className="flex flex-col space-y-3">
              <NavLink
                to="/"
                className={({ isActive }) =>
                  isActive ? 'text-blue-600 font-medium' : 'text-gray-700 hover:text-blue-600'
                }
                onClick={() => setIsMenuOpen(false)}
              >
                Trang chủ
              </NavLink>
              <NavLink
              to="/products"
                className={({ isActive }) =>
                  isActive ? 'text-blue-600 font-medium' : 'text-gray-700 hover:text-blue-600'
                }
                onClick={() => setIsMenuOpen(false)}
            >
              Sản phẩm
              </NavLink>
              
            {isLoggedIn ? (
              <>
                  {canAccessDashboard && (
                    <NavLink
                  to="/dashboard"
                      className={({ isActive }) =>
                        isActive ? 'text-blue-600 font-medium' : 'text-gray-700 hover:text-blue-600'
                      }
                      onClick={() => setIsMenuOpen(false)}
                    >
                      Dashboard
                    </NavLink>
                  )}
                  <NavLink
                    to="/profile"
                    className={({ isActive }) =>
                      isActive ? 'text-blue-600 font-medium' : 'text-gray-700 hover:text-blue-600'
                    }
                    onClick={() => setIsMenuOpen(false)}
                  >
                    Tài khoản của tôi
                  </NavLink>
                <button
                    onClick={() => {
                      handleLogout();
                      setIsMenuOpen(false);
                    }}
                    className="text-left text-gray-700 hover:text-blue-600"
                >
                  Đăng xuất
                </button>
              </>
            ) : (
                <div className="flex flex-col space-y-2 pt-2">
                <Link
                  to="/login"
                    className="px-4 py-2 text-sm text-gray-700 hover:text-blue-600 border border-gray-300 rounded text-center"
                    onClick={() => setIsMenuOpen(false)}
                >
                  Đăng nhập
                </Link>
                <Link
                  to="/register"
                    className="px-4 py-2 bg-blue-600 text-white text-sm rounded hover:bg-blue-700 text-center"
                    onClick={() => setIsMenuOpen(false)}
                >
                  Đăng ký
                </Link>
                </div>
            )}
          </div>
        </div>
      )}
      </div>
    </nav>
  );
}