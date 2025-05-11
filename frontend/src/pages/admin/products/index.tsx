import { useState, useEffect, useCallback } from 'react';
import { Link } from 'react-router-dom';
import { Package, Search, Edit, Trash2, RefreshCw, ExternalLink, AlertCircle } from 'lucide-react';
import { cn } from '@/lib/utils';
import { getProductsForDashboard } from '@/lib/data';

interface Product {
  id: string;
  name: string;
  category: string;
  price: number;
  stock: number;
  status: 'active' | 'draft' | 'outOfStock';
  createdAt: string;
  imageUrl?: string;
  categoryId?: number;
}

export default function ProductsManagement() {
  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedCategory, setSelectedCategory] = useState<string>('');
  const [selectedStatus, setSelectedStatus] = useState<string>('');
  const [sortBy, setSortBy] = useState<string>('');
  const [currentPage, setCurrentPage] = useState(1);
  const [pagination, setPagination] = useState({
    totalItems: 0,
    totalPages: 1,
    currentPage: 1,
    itemsPerPage: 8,
    nextPage: null,
    prevPage: null
  });
  const [categories, setCategories] = useState<{id: number, name: string}[]>([]);

  const fetchProducts = useCallback(async (page = currentPage) => {
    setLoading(true);
    try {
      const response = await getProductsForDashboard({
        keyword: searchTerm,
        categoryId: selectedCategory ? parseInt(selectedCategory) : undefined,
        status: selectedStatus,
        sortBy,
        page: page,
        limit: 8
      });
      
      console.log('API response:', response);
      
      // Kiểm tra cấu trúc response
      if (response.status === 'success' && response.data) {
        console.log('Products data:', response.data.products);
        
        // Cấu trúc dữ liệu API backend có thể khác nhau tùy theo endpoint
        // Đảm bảo chúng ta xử lý đúng cấu trúc
        if (Array.isArray(response.data.products)) {
          setProducts(response.data.products);
          setPagination(response.data.pagination || {
            totalItems: response.data.products.length,
            totalPages: 1,
            currentPage: page,
            itemsPerPage: 8,
            nextPage: null,
            prevPage: null
          });
          
          if (response.data.products.length > 0) {
            // Lấy danh sách danh mục độc đáo từ sản phẩm
            const uniqueCategories = Array.from(
              new Set(response.data.products.map((product: Product) => 
                JSON.stringify({id: product.categoryId, name: product.category} as {id: number, name: string})
              ))
            ).map(str => JSON.parse(str as string));
            
            setCategories(uniqueCategories);
          } else {
            console.warn('Mảng sản phẩm rỗng');
            setCategories([]);
          }
        } else {
          console.warn('Dữ liệu sản phẩm không phải là mảng:', response.data.products);
          setProducts([]);
          setCategories([]);
        }
      } else {
        console.error('Response không thành công hoặc không có dữ liệu:', response);
        setProducts([]);
        setCategories([]);
      }
    } catch (error) {
      console.error('Lỗi khi tải dữ liệu sản phẩm:', error);
      setProducts([]);
      setCategories([]);
    } finally {
      setLoading(false);
    }
  }, [searchTerm, selectedCategory, selectedStatus, sortBy]);

  // Component mount - load initial data
  useEffect(() => {
    console.log('Component mounted, loading initial data');
    
    // Hàm tải dữ liệu ban đầu
    const loadInitialData = async () => {
      setLoading(true);
      try {
        console.log('Calling API with default params');
        const response = await getProductsForDashboard({
          page: 1,
          limit: 8
        });
        
        console.log('Initial API response:', response);
        
        if (response.status === 'success' && response.data) {
          console.log('Initial products data:', response.data);
          setProducts(response.data.products || []);
          setPagination(response.data.pagination || {
            totalItems: (response.data.products || []).length,
            totalPages: 1,
            currentPage: 1,
            itemsPerPage: 8,
            nextPage: null,
            prevPage: null
          });
          
          if (response.data.products && response.data.products.length > 0) {
            // Lấy danh sách danh mục độc đáo từ sản phẩm
            const uniqueCategories = Array.from(
              new Set(response.data.products.map((product: Product) => 
                JSON.stringify({id: product.categoryId, name: product.category} as {id: number, name: string})
              ))
            ).map(str => JSON.parse(str as string));
            
            setCategories(uniqueCategories);
          }
        }
      } catch (error) {
        console.error('Error loading initial data:', error);
      } finally {
        setLoading(false);
      }
    };
    
    // Sử dụng fetchProducts với trang 1
    fetchProducts(1);
  }, []);

  // Gọi API khi các filter thay đổi
  useEffect(() => {
    // Tránh gọi API khi component vừa mount
    if (currentPage !== 1 || searchTerm !== '' || selectedCategory !== '' || 
        selectedStatus !== '' || sortBy !== '') {
      console.log('Filters changed, fetching products with new filters');
      fetchProducts(currentPage);
    }
  }, [fetchProducts, searchTerm, selectedCategory, selectedStatus, sortBy, currentPage]);

  // Debugging: Kiểm tra dữ liệu products và pagination mỗi khi chúng thay đổi
  useEffect(() => {
    console.log('Products state:', products);
    console.log('Pagination state:', pagination);
  }, [products, pagination]);

  const formatCurrency = (price: number) => {
    return new Intl.NumberFormat('vi-VN', { 
      style: 'currency', 
      currency: 'VND',
      minimumFractionDigits: 0
    }).format(price);
  };

  // Xử lý xóa sản phẩm
  const handleDeleteProduct = (productId: string) => {
    // Thực tế sẽ gọi API để xóa sản phẩm
    console.log(`Xóa sản phẩm có ID: ${productId}`);
    // Sau đó cập nhật lại danh sách sản phẩm
  };

  // Nếu đang tải dữ liệu, hiển thị trạng thái loading
  if (loading) {
    return (
      <div className="flex justify-center items-center h-screen">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-blue-500"></div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h1 className="text-2xl font-bold text-gray-900">Quản lý sản phẩm</h1>
        <button 
          onClick={() => {
            // Reset state và làm mới dữ liệu
            setSearchTerm('');
            setSelectedCategory('');
            setSelectedStatus('');
            setSortBy('');
            setCurrentPage(1);
            // Gọi fetchProducts với trang đầu tiên
            fetchProducts(1);
          }}
          className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-md flex items-center"
        >
          <RefreshCw className="h-5 w-5 mr-2" />
          Làm mới
        </button>
      </div>

      {/* Search and filter bar */}
      <div className="bg-white p-6 rounded-lg shadow">
        <div className="flex flex-col md:flex-row gap-4 mb-4">
          <div className="relative flex-grow">
            <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
              <Search className="h-5 w-5 text-gray-400" />
            </div>
            <input
              type="text"
              className="block w-full pl-10 pr-3 py-2 border border-gray-300 rounded-md leading-5 bg-white placeholder-gray-500 focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm"
              placeholder="Tìm kiếm sản phẩm..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              onKeyDown={(e) => e.key === 'Enter' && fetchProducts()}
            />
          </div>
          
          <div className="flex gap-2 flex-wrap md:flex-nowrap">
            <select
              className="block border border-gray-300 rounded-md px-3 py-2 text-sm w-full md:w-auto"
              value={selectedCategory}
              onChange={(e) => {
                setSelectedCategory(e.target.value);
                setCurrentPage(1);
              }}
            >
              <option value="">Tất cả danh mục</option>
              {categories.map((category, index) => (
                <option key={index} value={category.id}>{category.name}</option>
              ))}
            </select>
            
            <select
              className="block border border-gray-300 rounded-md px-3 py-2 text-sm w-full md:w-auto"
              value={selectedStatus}
              onChange={(e) => {
                setSelectedStatus(e.target.value);
                setCurrentPage(1);
              }}
            >
              <option value="">Tất cả trạng thái</option>
              <option value="active">Đang bán</option>
              <option value="outOfStock">Hết hàng</option>
            </select>
            
            <select
              className="block border border-gray-300 rounded-md px-3 py-2 text-sm w-full md:w-auto"
              value={sortBy}
              onChange={(e) => {
                setSortBy(e.target.value);
                setCurrentPage(1);
              }}
            >
              <option value="">Sắp xếp</option>
              <option value="name-asc">Tên (A-Z)</option>
              <option value="name-desc">Tên (Z-A)</option>
              <option value="price-asc">Giá (Thấp-Cao)</option>
              <option value="price-desc">Giá (Cao-Thấp)</option>
              <option value="stock-asc">Tồn kho (Thấp-Cao)</option>
              <option value="stock-desc">Tồn kho (Cao-Thấp)</option>
              <option value="date-desc">Ngày tạo (Mới nhất)</option>
              <option value="date-asc">Ngày tạo (Cũ nhất)</option>
            </select>
          </div>
        </div>

        {/* Products Table */}
        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-gray-200">
            <thead className="bg-gray-50">
              <tr>
                <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Sản phẩm
                </th>
                <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Danh mục
                </th>
                <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Giá
                </th>
                <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Tồn kho
                </th>
                <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Trạng thái
                </th>
                <th scope="col" className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Thao tác
                </th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {Array.isArray(products) && products.length > 0 ? (
                products.map((product) => (
                <tr key={product.id} className="hover:bg-gray-50">
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="flex items-center">
                        <div className="flex-shrink-0 h-10 w-10 bg-gray-100 rounded-md flex items-center justify-center overflow-hidden">
                          {product.imageUrl ? (
                            <img src={product.imageUrl} alt={product.name} className="h-10 w-10 object-cover" />
                          ) : (
                        <Package className="h-6 w-6 text-gray-400" />
                          )}
                      </div>
                      <div className="ml-4">
                        <div className="text-sm font-medium text-gray-900">{product.name}</div>
                        <div className="text-sm text-gray-500">ID: {product.id}</div>
                      </div>
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="text-sm text-gray-900">{product.category}</div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="text-sm text-gray-900">{formatCurrency(product.price)}</div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className={cn(
                      "text-sm",
                      product.stock === 0 ? "text-red-600" : 
                      product.stock < 10 ? "text-yellow-600" : "text-gray-900"
                    )}>
                      {product.stock === 0 ? (
                        <div className="flex items-center">
                          <AlertCircle className="h-4 w-4 mr-1" />
                          Hết hàng
                        </div>
                      ) : product.stock < 10 ? (
                        <div className="flex items-center">
                          <AlertCircle className="h-4 w-4 mr-1" />
                          {product.stock} cái
                        </div>
                      ) : (
                        `${product.stock} cái`
                      )}
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <span className={cn(
                      "px-2 inline-flex text-xs leading-5 font-semibold rounded-full",
                      product.status === 'active' && "bg-green-100 text-green-800",
                      product.status === 'draft' && "bg-gray-100 text-gray-800",
                      product.status === 'outOfStock' && "bg-red-100 text-red-800",
                    )}>
                      {product.status === 'active' && 'Đang bán'}
                      {product.status === 'draft' && 'Nháp'}
                      {product.status === 'outOfStock' && 'Hết hàng'}
                    </span>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                    <div className="flex justify-end space-x-2">
                      <Link
                        to={`/products/${product.id}`}
                        className="text-gray-600 hover:text-gray-900"
                        target="_blank" 
                        rel="noopener noreferrer"
                      >
                        <ExternalLink className="h-5 w-5" />
                      </Link>
                      <Link
                        to={`/admin/products/${product.id}/edit`}
                        className="text-blue-600 hover:text-blue-900"
                      >
                        <Edit className="h-5 w-5" />
                      </Link>
                    </div>
                  </td>
                </tr>
                ))
              ) : (
                <tr>
                  <td colSpan={6} className="px-6 py-4 text-center text-sm text-gray-500">
                    Không có sản phẩm nào{Array.isArray(products) ? ` (${products.length})` : ' (products không phải là mảng)'}
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>

        {/* Pagination */}
        {pagination.totalPages > 1 && (
          <div className="flex justify-between items-center mt-6">
            <div className="text-sm text-gray-700">
              Hiển thị <span className="font-medium">{(pagination.currentPage - 1) * pagination.itemsPerPage + 1}</span> đến <span className="font-medium">{Math.min(pagination.currentPage * pagination.itemsPerPage, pagination.totalItems)}</span> trong số <span className="font-medium">{pagination.totalItems}</span> sản phẩm
            </div>
            <div className="flex space-x-1">
              <button
                onClick={() => {
                  if (currentPage > 1) {
                    const newPage = currentPage - 1;
                    setCurrentPage(newPage);
                    // Gọi fetchProducts với trang mới
                    fetchProducts(newPage);
                  }
                }}
                disabled={currentPage === 1}
                className={cn(
                  "px-3 py-1 rounded-md text-sm",
                  currentPage === 1 
                    ? "bg-gray-100 text-gray-400 cursor-not-allowed" 
                    : "bg-gray-200 text-gray-700 hover:bg-gray-300"
                )}
              >
                Trước
              </button>
              
              {Array.from({ length: Math.min(pagination.totalPages, 5) }).map((_, i) => {
                // Hiển thị 5 nút phân trang xung quanh trang hiện tại
                let pageNum = currentPage;
                if (currentPage <= 3) {
                  pageNum = i + 1;
                } else if (currentPage >= pagination.totalPages - 2) {
                  pageNum = pagination.totalPages - 4 + i;
                } else {
                  pageNum = currentPage - 2 + i;
                }
                
                if (pageNum > 0 && pageNum <= pagination.totalPages) {
                  return (
                    <button
                      key={i}
                      onClick={() => {
                        setCurrentPage(pageNum);
                        // Gọi fetchProducts với pageNum
                        fetchProducts(pageNum);
                      }}
                      className={cn(
                        "px-3 py-1 rounded-md text-sm",
                        currentPage === pageNum
                          ? "bg-blue-600 text-white"
                          : "bg-gray-200 text-gray-700 hover:bg-gray-300"
                      )}
                    >
                      {pageNum}
                    </button>
                  );
                }
                return null;
              })}
              
              <button
                onClick={() => {
                  if (currentPage < pagination.totalPages) {
                    const newPage = currentPage + 1;
                    setCurrentPage(newPage);
                    // Gọi fetchProducts với trang mới
                    fetchProducts(newPage);
                  }
                }}
                disabled={currentPage === pagination.totalPages}
                className={cn(
                  "px-3 py-1 rounded-md text-sm",
                  currentPage === pagination.totalPages 
                    ? "bg-gray-100 text-gray-400 cursor-not-allowed" 
                    : "bg-gray-200 text-gray-700 hover:bg-gray-300"
                )}
              >
                Tiếp
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
} 