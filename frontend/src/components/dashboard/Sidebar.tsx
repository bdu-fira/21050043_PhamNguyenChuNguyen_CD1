import { useState } from 'react';
import { Link, useLocation } from 'react-router-dom';
import { 
  LayoutDashboard, 
  Package, 
  ShoppingCart, 
  Users, 
  TicketCheck, 
  Settings, 
  LogOut, 
  ChevronDown, 
  ChevronRight,
  PanelLeft,
  Store,
  BarChart3
} from 'lucide-react';
import { cn } from '@/lib/utils';
import { useAuth } from '@/lib/auth-context';

interface SidebarProps {
  isCollapsed: boolean;
  toggleSidebar: () => void;
}

export default function Sidebar({ isCollapsed, toggleSidebar }: SidebarProps) {
  const location = useLocation();
  const { user, logout } = useAuth();
  const [openMenus, setOpenMenus] = useState<string[]>([]);

  const isAdmin = user?.role === 'admin';
  const dashboardPrefix = isAdmin ? '/admin' : '/seller';
  
  const toggleMenu = (menu: string) => {
    setOpenMenus(prev => 
      prev.includes(menu) 
        ? prev.filter(item => item !== menu) 
        : [...prev, menu]
    );
  };

  const isMenuOpen = (menu: string) => openMenus.includes(menu);
  
  const isActiveLink = (path: string) => {
    return location.pathname === path || location.pathname.startsWith(`${path}/`);
  };

  // Menu items with permissions
  const menuItems = [
    {
      title: "Tổng quan",
      icon: <LayoutDashboard size={20} />,
      path: `${dashboardPrefix}/dashboard`,
      permission: true, // Both admin and seller can access
    },
    {
      title: "Sản phẩm",
      icon: <Package size={20} />,
      path: `${dashboardPrefix}/products`,
      permission: true, // Both admin and seller can access
      subMenus: [
        {
          title: "Danh sách sản phẩm",
          path: `${dashboardPrefix}/products`,
          permission: true,
        },
        {
          title: "Thêm sản phẩm mới",
          path: `${dashboardPrefix}/products/new`,
          permission: true,
        }
      ],
    },
    {
      title: "Đơn hàng",
      icon: <ShoppingCart size={20} />,
      path: `${dashboardPrefix}/orders`,
      permission: true, // Both admin and seller can access
      subMenus: [
        {
          title: "Tất cả đơn hàng",
          path: `${dashboardPrefix}/orders`,
          permission: true,
        },
        {
          title: "Chờ xác nhận",
          path: `${dashboardPrefix}/orders/pending`,
          permission: true,
        },
        {
          title: "Đang xử lý",
          path: `${dashboardPrefix}/orders/processing`,
          permission: true,
        },
        {
          title: "Đã giao hàng",
          path: `${dashboardPrefix}/orders/delivered`,
          permission: true,
        },
        {
          title: "Đã hủy",
          path: `${dashboardPrefix}/orders/cancelled`,
          permission: true,
        },
      ],
    },
    {
      title: "Người dùng",
      icon: <Users size={20} />,
      path: `${dashboardPrefix}/users`,
      permission: isAdmin, // Only admin can manage all users
    },
    {
      title: "Thống kê",
      icon: <BarChart3 size={20} />,
      path: `${dashboardPrefix}/statistics`,
      permission: true, // Both admin and seller can access
      subMenus: [
        {
          title: "Doanh thu",
          path: `${dashboardPrefix}/statistics/revenue`,
          permission: true,
        },
        {
          title: "Sản phẩm bán chạy",
          path: `${dashboardPrefix}/statistics/top-products`,
          permission: true,
        },
      ],
    },
    {
      title: "Hỗ trợ khách hàng",
      icon: <TicketCheck size={20} />,
      path: `${dashboardPrefix}/support`,
      permission: true, // Both admin and seller can access support tickets
    },
    {
      title: "Cài đặt",
      icon: <Settings size={20} />,
      path: `${dashboardPrefix}/settings`,
      permission: true, // Both admin and seller can access settings
      subMenus: [
        {
          title: "Thông tin cửa hàng",
          path: `${dashboardPrefix}/settings/store`,
          permission: isAdmin, // Only admin can edit store settings
        },
        {
          title: "Thanh toán",
          path: `${dashboardPrefix}/settings/payment`,
          permission: isAdmin, // Only admin can edit payment settings
        },
        {
          title: "Vận chuyển",
          path: `${dashboardPrefix}/settings/shipping`,
          permission: isAdmin, // Only admin can edit shipping settings
        },
        {
          title: "Tài khoản",
          path: `${dashboardPrefix}/settings/account`,
          permission: true, // Both admin and seller can edit their own account
        },
        {
          title: "Giao diện",
          path: `${dashboardPrefix}/settings/appearance`,
          permission: true, // Both admin and seller can customize their UI
        },
      ],
    },
  ];

  return (
    <div className={cn(
      "h-screen bg-white border-r border-gray-200 flex flex-col transition-all duration-300",
      isCollapsed ? "w-20" : "w-64"
    )}>
      <div className="p-4 border-b border-gray-200 flex items-center justify-between">
        <div className={cn("flex items-center", isCollapsed ? "justify-center w-full" : "")}>
          <Store className="h-8 w-8 text-blue-600" />
          {!isCollapsed && <span className="ml-2 text-xl font-semibold text-gray-800">Admin Panel</span>}
        </div>
        <button 
          onClick={toggleSidebar} 
          className={cn(
            "text-gray-500 hover:text-gray-700 focus:outline-none",
            isCollapsed && "hidden"
          )}
        >
          <PanelLeft size={20} />
        </button>
      </div>

      <div className="flex-1 py-4 overflow-y-auto">
        <ul className="space-y-1">
          {menuItems.map((item, index) => 
            item.permission && (
              <li key={index}>
                {item.subMenus ? (
                  <div>
                    <button
                      className={cn(
                        "w-full flex items-center p-3 text-gray-700 hover:bg-gray-100 hover:text-blue-600 rounded-lg",
                        isActiveLink(item.path) && "bg-blue-50 text-blue-600",
                        isCollapsed && "justify-center"
                      )}
                      onClick={() => !isCollapsed && toggleMenu(item.title)}
                    >
                      <span className="flex-shrink-0">{item.icon}</span>
                      {!isCollapsed && (
                        <>
                          <span className="ml-3 flex-1 text-left">{item.title}</span>
                          {isMenuOpen(item.title) ? <ChevronDown size={16} /> : <ChevronRight size={16} />}
                        </>
                      )}
                    </button>
                    
                    {!isCollapsed && isMenuOpen(item.title) && (
                      <ul className="mt-1 pl-10 space-y-1">
                        {item.subMenus.filter(subItem => subItem.permission).map((subItem, subIndex) => (
                          <li key={subIndex}>
                            <Link
                              to={subItem.path}
                              className={cn(
                                "block p-2 text-sm text-gray-700 hover:text-blue-600 hover:bg-gray-50 rounded-md",
                                isActiveLink(subItem.path) && "bg-blue-50 text-blue-600"
                              )}
                            >
                              {subItem.title}
                            </Link>
                          </li>
                        ))}
                      </ul>
                    )}
                  </div>
                ) : (
                  <Link
                    to={item.path}
                    className={cn(
                      "flex items-center p-3 text-gray-700 hover:bg-gray-100 hover:text-blue-600 rounded-lg",
                      isActiveLink(item.path) && "bg-blue-50 text-blue-600",
                      isCollapsed && "justify-center"
                    )}
                  >
                    <span className="flex-shrink-0">{item.icon}</span>
                    {!isCollapsed && <span className="ml-3">{item.title}</span>}
                  </Link>
                )}
              </li>
            )
          )}
        </ul>
      </div>

      <div className="p-4 border-t border-gray-200">
        <button 
          onClick={logout}
          className={cn(
            "flex items-center p-3 text-gray-700 hover:bg-red-50 hover:text-red-600 rounded-lg w-full",
            isCollapsed && "justify-center"
          )}
        >
          <LogOut size={20} />
          {!isCollapsed && <span className="ml-3">Đăng xuất</span>}
        </button>
      </div>
    </div>
  );
} 