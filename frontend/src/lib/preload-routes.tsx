import { useEffect } from 'react';
import { useLocation } from 'react-router-dom';

type ImportFn = () => Promise<any>;

// Định nghĩa các route và component tương ứng cần preload
const routeMapping: Record<string, ImportFn[]> = {
  '/': [
    () => import('../pages/home'),
    () => import('../components/layout/navbar')
  ],
  '/products': [
    () => import('../pages/products'),
    () => import('../components/layout/navbar')
  ],
  '/products/': [
    () => import('../pages/product-detail'),
    () => import('../components/layout/navbar')
  ],
  '/cart': [
    () => import('../pages/cart'),
    () => import('../components/layout/navbar')
  ],
  '/checkout': [
    () => import('../pages/checkout'),
    () => import('../components/layout/navbar')
  ],
  '/login': [
    () => import('../pages/auth/login'),
    () => import('../components/layout/navbar')
  ],
  '/register': [
    () => import('../pages/auth/register'),
    () => import('../components/layout/navbar')
  ],
  '/profile': [
    () => import('../pages/auth/profile'),
    () => import('../components/layout/navbar')
  ],
  '/admin': [
    () => import('../components/dashboard/DashboardLayout'),
    () => import('../components/dashboard/Sidebar'),
    () => import('../components/dashboard/Header')
  ],
  '/admin/dashboard': [
    () => import('../pages/admin/dashboard')
  ],
  '/admin/products': [
    () => import('../pages/admin/products')
  ],
  '/seller': [
    () => import('../components/dashboard/DashboardLayout'),
    () => import('../components/dashboard/Sidebar'),
    () => import('../components/dashboard/Header')
  ],
  '/seller/dashboard': [
    () => import('../pages/seller/dashboard')
  ]
};

// Hook để quản lý link preloading
export function useLinkPreload() {
  useEffect(() => {
    const preloadOnHover = (e: MouseEvent) => {
      const target = e.target as HTMLElement;
      const link = target.closest('a');
      
      if (link) {
        const path = link.getAttribute('href');
        if (path && path.startsWith('/')) {
          // Tìm route phù hợp nhất
          let matchedRoute = '';
          
          for (const route of Object.keys(routeMapping)) {
            if (path.startsWith(route) && route.length > matchedRoute.length) {
              matchedRoute = route;
            }
          }
          
          if (matchedRoute && routeMapping[matchedRoute]) {
            // Preload tất cả components cần thiết
            routeMapping[matchedRoute].forEach(importFn => {
              importFn().catch(err => {
                console.warn('Preload error:', err);
              });
            });
          }
        }
      }
    };
    
    document.addEventListener('mouseover', preloadOnHover);
    
    return () => {
      document.removeEventListener('mouseover', preloadOnHover);
    };
  }, []);
}

// Component để preload route hiện tại và route tiếp theo có khả năng cao được truy cập
export function RoutePreloader() {
  const location = useLocation();
  
  useEffect(() => {
    const currentPath = location.pathname;
    
    // Preload components cho route hiện tại
    let matchedRoute = '';
    for (const route of Object.keys(routeMapping)) {
      if (currentPath.startsWith(route) && route.length > matchedRoute.length) {
        matchedRoute = route;
      }
    }
    
    if (matchedRoute && routeMapping[matchedRoute]) {
      routeMapping[matchedRoute].forEach(importFn => {
        importFn().catch(err => {
          console.warn('Current route preload error:', err);
        });
      });
    }
    
    // Dựa vào route hiện tại, dự đoán và preload các route tiếp theo có khả năng cao sẽ được truy cập
    const predictNextRoutes = () => {
      if (currentPath === '/') {
        // Từ trang chủ, khả năng cao sẽ đi tới sản phẩm hoặc đăng nhập
        return ['/products', '/login'];
      } else if (currentPath === '/products') {
        // Từ trang sản phẩm, có thể sẽ xem chi tiết hoặc thêm vào giỏ hàng
        return ['/products/', '/cart'];
      } else if (currentPath.startsWith('/products/')) {
        // Từ trang chi tiết, có thể sẽ thêm vào giỏ hàng
        return ['/cart'];
      } else if (currentPath === '/cart') {
        // Từ giỏ hàng, khả năng cao sẽ thanh toán
        return ['/checkout'];
      } else if (currentPath === '/login') {
        // Từ đăng nhập, có thể sẽ đăng ký hoặc về trang chủ sau khi đăng nhập
        return ['/register', '/'];
      }
      return [];
    };
    
    // Preload các route có khả năng cao được truy cập tiếp theo
    const nextRoutesToPreload = predictNextRoutes();
    for (const nextRoute of nextRoutesToPreload) {
      if (routeMapping[nextRoute]) {
        // Sử dụng setTimeout để không cạnh tranh tài nguyên với route hiện tại
        setTimeout(() => {
          routeMapping[nextRoute].forEach(importFn => {
            importFn().catch(err => {
              console.warn('Next route preload error:', err);
            });
          });
        }, 1000);
      }
    }
  }, [location.pathname]);
  
  return null;
}

export default RoutePreloader; 