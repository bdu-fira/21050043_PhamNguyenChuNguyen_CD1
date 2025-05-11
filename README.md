# Modern Stationery Store - Frontend and Backend

### Yêu cầu

- Node.js (>= 14)

## Tham chiếu đến thư mục frontend bằng cách:

```bash
cd frontend
```

## Sau đó thiết lập thư viện cần thiết (yêu cầu có ứng dụng Node.js trong máy):

```bash
npm install
```

## Sau đó quay về thư mục gốc:

```bash
cd ..
```

## Tham chiếu đến thư mục backend bằng cách:

```bash
cd backend
```

## Sau đó thiết lập thư viện cần thiết (yêu cầu có ứng dụng Node.js trong máy):

```bash
npm install
```

## cuối cùng khởi chạy cả 2 frontend và backend:
- ở Console Terminal frontend (cd frontend):

```bash
npm run dev
```

- ở Console Terminal backend (cd backend): 

```bash
npm run dev
```

### backend sẽ chạy ở http://localhost:5000/
### frontend sẽ chạy ở http://localhost:5173/

# Lưu ý quan trọng nếu muón kết nối SQL Server data:
- Chỉnh sửa tên tệp .env.example trong thư mục backend (\backend\.env.example) thành .env
- Sau đó đặt các thông tin trong tệp .env đó như sau:

```bash
DB_HOST=DELL5580\SQLEXPRESS
DB_PORT=1433
DB_NAME=shopdungcuhoctap
DB_USER=sa
DB_PASSWORD=21050043
```
