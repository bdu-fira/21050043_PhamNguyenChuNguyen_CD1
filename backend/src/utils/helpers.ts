/**
 * Các tiện ích hỗ trợ cho ứng dụng
 */

/**
 * Tạo slug từ chuỗi - dùng cho URL thân thiện
 * @param text Chuỗi cần chuyển đổi thành slug
 * @returns Chuỗi slug
 */
export const slugify = (text: string): string => {
  return text
    .toString()
    .normalize('NFD') // tách các ký tự có dấu thành ký tự + dấu
    .replace(/[\u0300-\u036f]/g, '') // loại bỏ các dấu
    .toLowerCase()
    .trim()
    .replace(/\s+/g, '-') // thay thế khoảng trắng bằng dấu gạch ngang
    .replace(/[^\w\-]+/g, '') // loại bỏ các ký tự không phải chữ cái, số, gạch ngang
    .replace(/\-\-+/g, '-') // thay thế nhiều gạch ngang liên tiếp thành một gạch ngang
    .replace(/^-+/, '') // cắt bỏ gạch ngang ở đầu
    .replace(/-+$/, ''); // cắt bỏ gạch ngang ở cuối
};

/**
 * Tạo mã đơn hàng ngẫu nhiên
 * @returns Chuỗi mã đơn hàng
 */
export const generateOrderNumber = (): string => {
  const date = new Date();
  const year = date.getFullYear().toString().substr(-2);
  const month = String(date.getMonth() + 1).padStart(2, '0');
  const day = String(date.getDate()).padStart(2, '0');
  const random = Math.floor(Math.random() * 10000).toString().padStart(4, '0');
  
  return `ORD-${year}${month}${day}-${random}`;
};

/**
 * Định dạng tiền tệ VND
 * @param amount Số tiền
 * @returns Chuỗi đã được định dạng
 */
export const formatCurrency = (amount: number): string => {
  return new Intl.NumberFormat('vi-VN', {
    style: 'currency',
    currency: 'VND'
  }).format(amount);
}; 