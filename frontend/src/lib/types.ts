export interface Product {
  id: string;
  name: string;
  price: number;
  description: string;
  category: string;
  imageUrl: string;
  stock: number;
  rating: number;
  reviews: number;
  features?: string[];
  comments?: ProductComment[];
}

export interface CartItem {
  product: Product;
  quantity: number;
}

export interface ProductComment {
  id: string;
  userId: string;
  rating: number;
  comment: string;
  date: Date;
}

export interface FilterOptions {
  category?: string;
  minPrice?: number;
  maxPrice?: number;
  sortBy?: 'price_asc' | 'price_desc' | 'newest' | 'popular';
} 