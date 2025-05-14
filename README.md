# Modern Stationery Store - Frontend

Frontend cho ứng dụng E-commerce phân phối văn phòng phẩm hiện đại, được xây dựng với React, TypeScript và Tailwind CSS.


## Công nghệ sử dụng

- **Framework**: React với TypeScript
- **Routing**: React Router v6
- **Styling**: Tailwind CSS
- **Forms**: React Hook Form với Zod validation
- **Animations**: Framer Motion
- **HTTP Client**: Axios
- **Icons**: Lucide React
- **Build Tool**: Vite

## Cấu trúc thư mục chi tiết

```
frontend/
├── src/
│   ├── components/              # Các thành phần UI có thể tái sử dụng
│   │   ├── ui/                  # Các thành phần UI cơ bản
│   │   │   ├── alert-dialog.tsx # Dialog hiển thị cảnh báo
│   │   │   ├── breadcrumb.tsx   # Điều hướng breadcrumb
│   │   │   ├── button.tsx       # Component nút
│   │   │   ├── input.tsx        # Form input
│   │   │   ├── toast.tsx        # Thông báo nổi
│   │   │   └── toast-container.tsx # Container cho toast
│   │   │
│   │   ├── layout/              # Các thành phần bố cục
│   │   │   └── navbar.tsx       # Thanh điều hướng chính
│   │   │
│   │   └── dashboard/           # Các thành phần cho dashboard
│   │       ├── DashboardLayout.tsx # Layout tổng thể cho dashboard
│   │       ├── Header.tsx       # Phần header của dashboard
│   │       └── Sidebar.tsx      # Thanh bên cho dashboard
│   │
│   ├── lib/                     # Tiện ích, context và các service
│   │   ├── api.ts               # Tương tác với API backend
│   │   ├── auth-context.tsx     # Context quản lý xác thực
│   │   ├── cart-context.tsx     # Context quản lý giỏ hàng
│   │   ├── data.ts              # Dữ liệu tĩnh và mẫu
│   │   ├── lazy-components.tsx  # Tải lazy các component
│   │   ├── notification-context.tsx # Context quản lý thông báo
│   │   ├── preload-routes.tsx   # Preload các routes
│   │   ├── toast.ts             # Tiện ích cho toast
│   │   ├── types.ts             # Định nghĩa TypeScript
│   │   └── utils.ts             # Các hàm tiện ích
│   │
│   ├── pages/                   # Các trang của ứng dụng
│   │   ├── auth/                # Trang xác thực
│   │   │   ├── login.tsx        # Trang đăng nhập
│   │   │   ├── profile.tsx      # Trang hồ sơ người dùng
│   │   │   └── register.tsx     # Trang đăng ký
│   │   │
│   │   ├── admin/               # Trang quản trị
│   │   │   ├── dashboard.tsx    # Dashboard quản trị
│   │   │   └── products.tsx     # Quản lý sản phẩm
│   │   │
│   │   ├── seller/              # Trang dành cho người bán
│   │   │   └── dashboard.tsx    # Dashboard người bán
│   │   │
│   │   ├── home.tsx             # Trang chủ
│   │   ├── products.tsx         # Trang danh sách sản phẩm
│   │   ├── product-detail.tsx   # Trang chi tiết sản phẩm
│   │   ├── cart.tsx             # Trang giỏ hàng
│   │   ├── checkout.tsx         # Trang thanh toán
│   │   └── invoice/[id].tsx     # Trang hóa đơn
│   │
│   ├── styles/                  # CSS và style
│   │   └── home.module.css      # CSS module cho trang chủ
│   │   └── products.module.css  # CSS module cho trang sản phẩm
│   │
│   ├── animations/              # Hiệu ứng chuyển động
│   │   └── variants.ts          # Các variants cho Framer Motion
│   │
│   ├── App.tsx                  # Component chính
│   ├── main.tsx                 # Entry point
│   └── index.css                # CSS toàn cục
│
├── public/                     # Tài nguyên tĩnh
├── node_modules/               # Thư viện npm
├── package.json                # Cấu hình npm
├── package-lock.json           # Lock file npm
├── vite.config.ts              # Cấu hình Vite
├── tailwind.config.js          # Cấu hình Tailwind CSS
├── postcss.config.js           # Cấu hình PostCSS
├── eslint.config.js            # Cấu hình ESLint
├── tsconfig.json               # Cấu hình TypeScript chính
├── tsconfig.app.json           # Cấu hình TypeScript cho ứng dụng
├── tsconfig.node.json          # Cấu hình TypeScript cho Node
├── .gitignore                  # Cấu hình Git
└── README.md                   # Tài liệu
```

## Chi tiết triển khai

### Context API và Quản lý State

Frontend sử dụng React Context API để quản lý state toàn cục, giúp chia sẻ dữ liệu giữa các components mà không cần prop drilling:

1. **AuthContext**: Quản lý xác thực người dùng
   - Lưu trữ thông tin đăng nhập và token JWT
   - Xử lý đăng nhập, đăng ký, đăng xuất
   - Tự động khôi phục phiên đăng nhập từ localStorage
   - Phân quyền người dùng (admin, nhân viên, khách hàng)
   - Cung cấp thông tin người dùng hiện tại cho toàn bộ ứng dụng

2. **CartContext**: Quản lý giỏ hàng
   - Thêm, xóa, cập nhật sản phẩm trong giỏ hàng
   - Tính toán số lượng và tổng giá trị giỏ hàng
   - Kiểm tra số lượng tồn kho
   - Xóa toàn bộ giỏ hàng sau khi đặt hàng thành công

3. **NotificationContext**: Quản lý thông báo
   - Hiển thị toast messages sau các thao tác
   - Hỗ trợ các loại thông báo: success, error, warning, info
   - Tự động ẩn thông báo sau một khoảng thời gian
   - API đơn giản để sử dụng trong toàn bộ ứng dụng

### API Communication

Tương tác với backend được xử lý thông qua module api.ts tập trung:

1. **Axios Instance**: Cấu hình chung cho tất cả API requests
   - Tự động gắn token JWT vào header
   - Xử lý lỗi chung
   - Định dạng response

2. **API Services**:
   - **authAPI**: Xử lý các yêu cầu xác thực (đăng nhập, đăng ký, lấy thông tin)
   - **productAPI**: Tương tác với các endpoint sản phẩm (danh sách, chi tiết)
   - **categoryAPI**: Quản lý danh mục sản phẩm
   - **orderAPI**: Quản lý đơn hàng (tạo, cập nhật, hủy)
   - **reviewAPI**: Quản lý đánh giá sản phẩm
   - **customerAPI**: Quản lý thông tin khách hàng
   - **staffAPI**: Quản lý nhân viên (admin only)
   - **dashboardAPI**: Lấy dữ liệu cho dashboard

### Routing và Navigation

Điều hướng được xử lý bởi React Router v6 với các tính năng:

1. **Route Protection**: Bảo vệ các route yêu cầu đăng nhập hoặc quyền cụ thể
   - Chuyển hướng người dùng chưa đăng nhập đến trang login
   - Kiểm tra quyền truy cập dựa trên vai trò người dùng

2. **Lazy Loading**: Cải thiện hiệu suất tải trang
   - Tải không đồng bộ các components khi cần thiết
   - Hiển thị loading state trong quá trình tải

3. **Tổ chức Route**:
   - Routes công khai: Home, Products, Cart,...
   - Routes yêu cầu đăng nhập: Profile, Checkout, Invoice
   - Routes Admin: Dashboard, quản lý sản phẩm, đơn hàng
   - Routes Nhân viên: Dashboard bán hàng

### UI Components và Styling

Frontend sử dụng Tailwind CSS kết hợp với các components tùy chỉnh:

1. **Component Libraries**:
   - Các components UI cơ bản được xây dựng từ đầu
   - Tùy chỉnh hoàn toàn theo thiết kế và brand identity
   - Responsive trên mọi kích thước màn hình

2. **Animations**:
   - Sử dụng Framer Motion cho hiệu ứng chuyển động mượt mà
   - Tối ưu hóa hiệu suất với các lazy animations
   - Các variants cho các loại chuyển động khác nhau

3. **CSS Modules**:
   - Styling cụ thể cho từng trang/component
   - Tránh xung đột CSS giữa các components
   - Kết hợp với Tailwind để tạo UI nhất quán

### Trang Người Dùng

1. **Home (home.tsx)**:
   - Hiển thị banner hero với hiệu ứng parallax
   - Giới thiệu danh mục sản phẩm với animations
   - Các phần call-to-action để chuyển hướng đến sản phẩm

2. **Product Listing (products.tsx)**:
   - Hiển thị danh sách sản phẩm với bộ lọc
   - Tìm kiếm sản phẩm theo từ khóa
   - Lọc theo danh mục, giá
   - Sắp xếp theo giá, mức độ phổ biến
   - Hiệu ứng loading và empty state

3. **Product Detail (product-detail.tsx)**:
   - Hiển thị chi tiết sản phẩm với hình ảnh
   - Thông tin giá, số lượng tồn kho
   - Đánh giá sản phẩm
   - Thêm vào giỏ hàng với hiệu ứng animation

4. **Cart (cart.tsx)**:
   - Hiển thị sản phẩm trong giỏ hàng
   - Cập nhật số lượng sản phẩm
   - Xóa sản phẩm khỏi giỏ hàng
   - Tính toán tổng tiền, phí vận chuyển
   - Áp dụng mã giảm giá
   - Nút chuyển đến trang thanh toán

5. **Checkout (checkout.tsx)**:
   - Form thông tin giao hàng
   - Chọn phương thức thanh toán (COD hoặc ví điện tử)
   - Xác nhận đơn hàng
   - Validation thông tin người dùng
   - Tóm tắt đơn hàng trước khi thanh toán

6. **Invoice (invoice/[id].tsx)**:
   - Hiển thị chi tiết hóa đơn sau khi đặt hàng
   - Thông tin người nhận, sản phẩm, giá
   - Trạng thái đơn hàng
   - In hóa đơn hoặc tải xuống PDF
   - Thông tin dự kiến giao hàng

7. **Authentication (auth/*)**: 
   - Đăng nhập (login.tsx): Form đăng nhập với validation
   - Đăng ký (register.tsx): Form đăng ký tài khoản mới
   - Hồ sơ (profile.tsx): Xem và cập nhật thông tin cá nhân

### Tính năng Dashboard

1. **Admin Dashboard**:
   - Tổng quan về doanh số, đơn hàng
   - Quản lý sản phẩm (thêm, sửa, xóa)
   - Quản lý đơn hàng (xem, cập nhật trạng thái)
   - Quản lý người dùng/khách hàng

2. **Seller Dashboard**:
   - Tổng quan về bán hàng
   - Xem và xử lý đơn hàng mới
   - Quản lý sản phẩm được phân công

## Cài đặt và Sử dụng

### Yêu cầu

- Node.js (>= 14)
- NPM hoặc Yarn

### Bước 1: Cài đặt dependencies

```bash
cd frontend
# Tiếp theo
npm install
```

### Bước 2: Cấu hình biến môi trường

Tạo file `.env` trong thư mục gốc với nội dung:

```
VITE_API_URL=http://localhost:5000/api
```

### Bước 3: Chạy ứng dụng

Development mode:

```bash
npm run dev
# hoặc
yarn dev
```

Production build:

```bash
npm run build
npm run preview
# hoặc
yarn build
yarn preview
```

## Tài khoản mẫu

Dưới đây là một số tài khoản mẫu để test ứng dụng:

1. **Admin**:
   - Email: admin@example.com
   - Password: Admin123!

2. **Nhân viên**:
   - Email: nhanvien1@example.com
   - Password: Nhanvien1!

3. **Khách hàng**:
   - Email: khachhang@example.com
   - Password: Khachhang1!

## Tính năng nổi bật

1. **UI/UX Hiện đại**: 
   - Animations mượt mà với Framer Motion
   - Responsive trên tất cả thiết bị
   - Giao diện trực quan, dễ sử dụng

2. **Hiệu suất**:
   - Lazy loading các components
   - Code-splitting để giảm kích thước bundle
   - Tối ưu hóa rendering với React hooks

3. **Tích hợp Backend**:
   - API chuẩn hóa, dễ mở rộng
   - Xử lý lỗi thông minh
   - Caching dữ liệu để tối ưu hiệu suất

4. **Bảo mật**:
   - JWT Authentication
   - Route protection
   - Input validation

5. **Tính năng E-commerce**:
   - Giỏ hàng đầy đủ tính năng
   - Quy trình thanh toán mượt mà
   - Đánh giá sản phẩm
   - Lọc và tìm kiếm sản phẩm
   - Theo dõi đơn hàng

## Liên kết với Backend

Frontend này được thiết kế để làm việc cùng với backend API Node.js + Express. API endpoints được định nghĩa trong file `api.ts` và phù hợp với cấu trúc backend.

Tất cả các API calls đều thông qua Axios instance được cấu hình. Backend cần cung cấp các endpoints sau:

1. **Authentication**: /api/auth/*, /api/khach-hang/*, /api/nhan-vien/*
2. **Products**: /api/san-pham/*, /api/danh-muc/*
3. **Orders**: /api/don-hang/*
4. **Reviews**: /api/danh-gia/*

Vui lòng tham khảo tài liệu backend để biết thêm chi tiết về API. 