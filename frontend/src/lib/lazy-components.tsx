import { lazy, Suspense, ComponentProps, ComponentType } from 'react';

// Lazy loading components
export const LazyNavbar = lazy(() => import('../components/layout/navbar'));
export const LazySidebar = lazy(() => import('../components/dashboard/Sidebar'));
export const LazyHeader = lazy(() => import('../components/dashboard/Header'));

// Component loading fallback đơn giản
export const SimpleLoadingFallback = () => (
  <div className="flex items-center justify-center p-4">
    <div className="w-8 h-8 border-4 border-t-transparent border-blue-500 rounded-full animate-spin"></div>
  </div>
);

// Component loading fallback đầy đủ
export const FullPageLoadingFallback = () => (
  <div className="flex items-center justify-center w-full min-h-screen">
    <div className="flex flex-col items-center">
      <div className="w-12 h-12 border-4 border-t-transparent border-blue-500 rounded-full animate-spin"></div>
      <p className="mt-4 text-lg text-gray-700">Đang tải...</p>
    </div>
  </div>
);

// HOC (Higher Order Component) để wrap một component với Suspense
export function withSuspense<T extends object>(
  Component: ComponentType<T>,
  Fallback: ComponentType = SimpleLoadingFallback
) {
  return (props: ComponentProps<typeof Component>) => (
    <Suspense fallback={<Fallback />}>
      <Component {...props} />
    </Suspense>
  );
}

// Lazy loading pages
export const LazyLoginPage = lazy(() => import('../pages/auth/login'));
export const LazyRegisterPage = lazy(() => import('../pages/auth/register'));
export const LazyProfilePage = lazy(() => import('../pages/auth/profile'));
export const LazyHomePage = lazy(() => import('../pages/home'));
export const LazyProductsPage = lazy(() => import('../pages/products'));
export const LazyProductDetailPage = lazy(() => import('../pages/product-detail'));
export const LazyCartPage = lazy(() => import('../pages/cart'));
export const LazyCheckoutPage = lazy(() => import('../pages/checkout'));
export const LazyInvoicePage = lazy(() => import('../pages/invoice/[id]'));
export const LazyDashboardLayout = lazy(() => import('../components/dashboard/DashboardLayout'));
export const LazyAdminDashboard = lazy(() => import('../pages/admin/dashboard'));
export const LazySellerDashboard = lazy(() => import('../pages/seller/dashboard'));
export const LazyProductsManagement = lazy(() => import('../pages/admin/products'));
export const LazyOrdersManagement = lazy(() => import('../pages/admin/orders'));
export const LazyPendingOrders = lazy(() => import('../pages/admin/orders/pending'));
export const LazyProcessingOrders = lazy(() => import('../pages/admin/orders/processing'));
export const LazyDeliveredOrders = lazy(() => import('../pages/admin/orders/delivered'));
export const LazyCancelledOrders = lazy(() => import('../pages/admin/orders/cancelled'));
export const LazyProductsNew = lazy(() => import('../pages/admin/products/new'));
export const LazyProductEdit = lazy(() => import('../pages/admin/products/edit'));

// Pre-wrapped components với Suspense
export const SuspendedNavbar = withSuspense(LazyNavbar);
export const SuspendedSidebar = withSuspense(LazySidebar);
export const SuspendedHeader = withSuspense(LazyHeader); 