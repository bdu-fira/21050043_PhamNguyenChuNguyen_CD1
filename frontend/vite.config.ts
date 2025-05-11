import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';
import path from 'path';

export default defineConfig({
  plugins: [react()],
  resolve: {
    alias: {
      '@': path.resolve(__dirname, './src'),
    },
  },
  optimizeDeps: {
    exclude: ['lucide-react'],
  },
  build: {
    rollupOptions: {
      output: {
        manualChunks: {
          'vendor': [
            'react', 
            'react-dom', 
            'react-router-dom'
          ],
          'ui': [
            './src/components/ui/alert-dialog.tsx',
            './src/components/ui/toast.tsx',
            './src/components/ui/breadcrumb.tsx',
            './src/components/ui/toast-container.tsx',
            './src/components/ui/button.tsx',
            './src/components/ui/input.tsx'
          ],
          'layout': [
            './src/components/layout/navbar.tsx'
          ],
          'dashboard': [
            './src/components/dashboard/Sidebar.tsx',
            './src/components/dashboard/Header.tsx',
            './src/components/dashboard/DashboardLayout.tsx'
          ],
          'auth': [
            './src/pages/auth/login.tsx',
            './src/pages/auth/register.tsx',
            './src/pages/auth/profile.tsx'
          ],
          'shop': [
            './src/pages/products.tsx',
            './src/pages/product-detail.tsx',
            './src/pages/cart.tsx',
            './src/pages/checkout.tsx'
          ],
          'admin': [
            './src/pages/admin/dashboard.tsx',
            './src/pages/admin/products.tsx'
          ],
          'seller': [
            './src/pages/seller/dashboard.tsx'
          ]
        }
      }
    },
    sourcemap: true,
    chunkSizeWarningLimit: 1000,
    // Thêm hỗ trợ tối ưu hóa hình ảnh
    assetsInlineLimit: 4096,
  }
});