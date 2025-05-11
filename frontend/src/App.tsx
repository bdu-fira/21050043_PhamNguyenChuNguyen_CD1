import { Routes, Route, Navigate, Outlet } from 'react-router-dom';
import { Suspense, lazy } from 'react';
import Navbar from './components/layout/navbar';
import { ToastContainer } from './components/ui/toast-container';
import { useAuth } from './lib/auth-context';
import {
  FullPageLoadingFallback,
  LazyLoginPage,
  LazyRegisterPage,
  LazyProfilePage,
  LazyHomePage,
  LazyProductsPage,
  LazyProductDetailPage,
  LazyCartPage,
  LazyCheckoutPage,
  LazyInvoicePage,
  LazyDashboardLayout,
  LazyAdminDashboard,
  LazySellerDashboard,
  LazyProductsManagement,
  LazyOrdersManagement,
  LazyPendingOrders,
  LazyProcessingOrders,
  LazyDeliveredOrders,
  LazyCancelledOrders,
  LazyProductsNew,
  LazyProductEdit
} from './lib/lazy-components';

// Component dùng để chuyển hướng dựa trên vai trò
function DashboardRedirect() {
  const { user } = useAuth();
  
  if (user?.role === 'admin') {
    return <Navigate to="/admin/dashboard" replace />;
  } else if (user?.role === 'seller') {
    return <Navigate to="/seller/dashboard" replace />;
  } else {
    return <Navigate to="/" replace />;
  }
}

function App() {
  return (
    <>
      {/* Public Routes - Hiển thị Navbar */}
      <Routes>
        {/* Public Routes */}
        <Route
          path="/"
          element={
            <>
              <Navbar />
              <Suspense fallback={<FullPageLoadingFallback />}>
                <Outlet />
              </Suspense>
              <ToastContainer />
            </>
          }
        >
          <Route index element={<LazyHomePage />} />
          <Route path="products" element={<LazyProductsPage />} />
          <Route path="products/:id" element={<LazyProductDetailPage />} />
          <Route path="cart" element={<LazyCartPage />} />
          <Route path="checkout" element={<LazyCheckoutPage />} />
          <Route path="invoice/:id" element={<LazyInvoicePage />} />
          <Route path="login" element={<LazyLoginPage />} />
          <Route path="register" element={<LazyRegisterPage />} />
          <Route path="profile" element={<LazyProfilePage />} />
          {/* Route mới để chuyển hướng đến dashboard dựa trên vai trò */}
          <Route path="dashboard" element={<DashboardRedirect />} />
        </Route>

        {/* Admin Dashboard Routes - Không hiển thị Navbar */}
        <Route 
          path="/admin" 
          element={
            <Suspense fallback={<FullPageLoadingFallback />}>
              <LazyDashboardLayout requiredRole="admin" />
            </Suspense>
          }
        >
          <Route index element={<Navigate to="/admin/dashboard" replace />} />
          <Route path="dashboard" element={<LazyAdminDashboard />} />
          <Route path="products" element={<LazyProductsManagement />} />
          <Route path="products/new" element={<LazyProductsNew />} />
          <Route path="products/:id/edit" element={<LazyProductEdit />} />
          <Route path="orders" element={<LazyOrdersManagement />} />
          <Route path="orders/pending" element={<LazyPendingOrders />} />
          <Route path="orders/processing" element={<LazyProcessingOrders />} />
          <Route path="orders/delivered" element={<LazyDeliveredOrders />} />
          <Route path="orders/cancelled" element={<LazyCancelledOrders />} />
          {/* Thêm các routes admin khác ở đây */}
        </Route>

        {/* Seller Dashboard Routes - Không hiển thị Navbar */}
        <Route 
          path="/seller" 
          element={
            <Suspense fallback={<FullPageLoadingFallback />}>
              <LazyDashboardLayout requiredRole="seller" />
            </Suspense>
          }
        >
          <Route index element={<Navigate to="/seller/dashboard" replace />} />
          <Route path="dashboard" element={<LazySellerDashboard />} />
          {/* Thêm các routes seller khác ở đây */}
        </Route>

        {/* Fallback route */}
        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>
    </>
  );
}

export default App;