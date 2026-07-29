export type UserRole = 'guest' | 'buyer' | 'seller' | 'admin';

export interface NotificationPreferences {
  orderStatus: boolean;
  promotions: boolean;
  stockAlerts: boolean;
  sellerUpdates: boolean;
}

export interface User {
  id: string;
  name: string;
  email: string;
  role: UserRole;
  avatar?: string;
  verified?: boolean;
  phone?: string;
  address?: string;
  city?: string;
  notificationPreferences?: NotificationPreferences;
}

export interface Product {
  id: string;
  name: string;
  description: string;
  price: number;
  originalPrice?: number;
  sellerId: string;
  sellerName: string;
  category: string;
  images: string[];
  stock: number;
  rating: number;
  reviewsCount: number;
  isVerifiedSeller?: boolean;
}

export interface CartItem {
  product: Product;
  quantity: number;
}

export interface Category {
  name: string;
  image: string;
}

export const mockCategories: Category[] = [
  { name: 'Electronics', image: 'https://images.unsplash.com/photo-1526738549149-8e07eca6c147?w=600&q=80' },
  { name: 'Fashion', image: 'https://images.unsplash.com/photo-1445205170230-053b83016050?w=600&q=80' },
  { name: 'Home & Kitchen', image: 'https://images.unsplash.com/photo-1556911220-e15b29be8c8f?w=600&q=80' },
  { name: 'Beauty', image: 'https://images.unsplash.com/photo-1596462502278-27bfdc403348?w=600&q=80' },
  { name: 'Sports', image: 'https://images.unsplash.com/photo-1517649763962-0c623066013b?w=600&q=80' },
  { name: 'Automotive', image: 'https://images.unsplash.com/photo-1503376780353-7e6692767b70?w=600&q=80' },
  { name: 'Books', image: 'https://images.unsplash.com/photo-1512820790803-83ca734da794?w=600&q=80' },
  { name: 'Toys & Games', image: 'https://images.unsplash.com/photo-1566576912321-d58ddd7a6088?w=600&q=80' },
  { name: 'Health & Personal Care', image: 'https://images.unsplash.com/photo-1584308666744-24d5c474f2ae?w=600&q=80' },
  { name: 'Groceries', image: 'https://images.unsplash.com/photo-1542838132-92c53300491e?w=600&q=80' },
  { name: 'Phone Accessories', image: 'https://images.unsplash.com/photo-1584438784894-089d6a62b8fa?w=600&q=80' },
];

export const mockUsers: User[] = [
  { id: 'u1', name: 'John Doe', email: 'john@example.com', role: 'buyer' },
  { id: 's1', name: 'Tech Store Mw', email: 'tech@example.com', role: 'seller', verified: true },
  { id: 's2', name: 'Fashion Hub', email: 'fashion@example.com', role: 'seller', verified: false },
];

export const mockProducts: Product[] = [
  // --- ELECTRONICS (6 products) ---
  {
    id: 'p1',
    name: 'Smartphone X Pro',
    description: 'Latest smartphone with amazing camera and battery life.',
    price: 850000,
    originalPrice: 900000,
    sellerId: 's1',
    sellerName: 'Tech Store Mw',
    category: 'Electronics',
    images: [
      'https://images.unsplash.com/photo-1511707171634-5f897ff02aa9?w=800&q=80',
      'https://images.unsplash.com/photo-1505740420928-5e560c06d30e?w=800&q=80',
      'https://images.unsplash.com/photo-1546868871-7041f2a55e12?w=800&q=80',
      'https://images.unsplash.com/photo-1527443195645-1133f7f28990?w=800&q=80',
      'https://images.unsplash.com/photo-1595225476474-87563907a212?w=800&q=80'
    ],
    stock: 15,
    rating: 4.8,
    reviewsCount: 124,
    isVerifiedSeller: true,
  },
  {
    id: 'p2',
    name: 'Wireless Noise-Cancelling Headphones',
    description: 'High-quality sound with active noise cancellation.',
    price: 150000,
    sellerId: 's1',
    sellerName: 'Tech Store Mw',
    category: 'Electronics',
    images: [
      'https://images.unsplash.com/photo-1505740420928-5e560c06d30e?w=800&q=80',
      'https://images.unsplash.com/photo-1511707171634-5f897ff02aa9?w=800&q=80',
      'https://images.unsplash.com/photo-1546868871-7041f2a55e12?w=800&q=80',
      'https://images.unsplash.com/photo-1527443195645-1133f7f28990?w=800&q=80',
      'https://images.unsplash.com/photo-1595225476474-87563907a212?w=800&q=80'
    ],
    stock: 30,
    rating: 4.5,
    reviewsCount: 89,
    isVerifiedSeller: true,
  },
  {
    id: 'p4',
    name: 'Smart Watch Series 5',
    description: 'Fitness tracker and smartwatch with heart rate monitor.',
    price: 120000,
    sellerId: 's1',
    sellerName: 'Tech Store Mw',
    category: 'Electronics',
    images: [
      'https://images.unsplash.com/photo-1546868871-7041f2a55e12?w=800&q=80',
      'https://images.unsplash.com/photo-1511707171634-5f897ff02aa9?w=800&q=80',
      'https://images.unsplash.com/photo-1505740420928-5e560c06d30e?w=800&q=80',
      'https://images.unsplash.com/photo-1527443195645-1133f7f28990?w=800&q=80',
      'https://images.unsplash.com/photo-1595225476474-87563907a212?w=800&q=80'
    ],
    stock: 20,
    rating: 4.7,
    reviewsCount: 210,
    isVerifiedSeller: true,
  },
  {
    id: 'p11',
    name: 'UltraWide 4K Gaming Monitor',
    description: '34-inch curved gaming monitor with 144Hz refresh rate.',
    price: 450000,
    originalPrice: 520000,
    sellerId: 's1',
    sellerName: 'Tech Store Mw',
    category: 'Electronics',
    images: [
      'https://images.unsplash.com/photo-1527443195645-1133f7f28990?w=800&q=80',
      'https://images.unsplash.com/photo-1511707171634-5f897ff02aa9?w=800&q=80',
      'https://images.unsplash.com/photo-1505740420928-5e560c06d30e?w=800&q=80',
      'https://images.unsplash.com/photo-1546868871-7041f2a55e12?w=800&q=80',
      'https://images.unsplash.com/photo-1595225476474-87563907a212?w=800&q=80'
    ],
    stock: 15,
    rating: 4.8,
    reviewsCount: 124,
    isVerifiedSeller: true,
  },
  {
    id: 'p12',
    name: 'Mechanical Wireless Keyboard',
    description: 'RGB backlit mechanical keyboard with tactile switches.',
    price: 85000,
    sellerId: 's1',
    sellerName: 'Tech Store Mw',
    category: 'Electronics',
    images: [
      'https://images.unsplash.com/photo-1595225476474-87563907a212?w=800&q=80',
      'https://images.unsplash.com/photo-1511707171634-5f897ff02aa9?w=800&q=80',
      'https://images.unsplash.com/photo-1505740420928-5e560c06d30e?w=800&q=80',
      'https://images.unsplash.com/photo-1546868871-7041f2a55e12?w=800&q=80',
      'https://images.unsplash.com/photo-1527443195645-1133f7f28990?w=800&q=80'
    ],
    stock: 40,
    rating: 4.5,
    reviewsCount: 89,
    isVerifiedSeller: true,
  },
  {
    id: 'p13',
    name: 'Professional DSLR Camera',
    description: '24.2 MP full-frame sensor, 4K video recording, built-in Wi-Fi.',
    price: 1200000,
    sellerId: 's1',
    sellerName: 'Tech Store Mw',
    category: 'Electronics',
    images: [
      'https://images.unsplash.com/photo-1516035069371-29a1b244cc32?w=800&q=80',
      'https://images.unsplash.com/photo-1511707171634-5f897ff02aa9?w=800&q=80',
      'https://images.unsplash.com/photo-1505740420928-5e560c06d30e?w=800&q=80',
      'https://images.unsplash.com/photo-1546868871-7041f2a55e12?w=800&q=80',
      'https://images.unsplash.com/photo-1527443195645-1133f7f28990?w=800&q=80'
    ],
    stock: 5,
    rating: 4.9,
    reviewsCount: 18,
    isVerifiedSeller: true,
  },

  // --- FASHION (6 products) ---
  {
    id: 'p3',
    name: "Men's Casual Sneakers",
    description: 'Comfortable and stylish sneakers for everyday wear.',
    price: 45000,
    originalPrice: 60000,
    sellerId: 's2',
    sellerName: 'Fashion Hub',
    category: 'Fashion',
    images: [
      'https://images.unsplash.com/photo-1542291026-7eec264c27ff?w=800&q=80',
      'https://images.unsplash.com/photo-1511499767150-a48a237f0083?w=800&q=80',
      'https://images.unsplash.com/photo-1553062407-98eeb64c6a62?w=800&q=80',
      'https://images.unsplash.com/photo-1548036328-c9fa89d128fa?w=800&q=80',
      'https://images.unsplash.com/photo-1576995853123-5a10305d93c0?w=800&q=80'
    ],
    stock: 50,
    rating: 4.2,
    reviewsCount: 45,
    isVerifiedSeller: false,
  },
  {
    id: 'p5',
    name: 'Designer Sunglasses',
    description: 'UV protection sunglasses for men and women.',
    price: 25000,
    sellerId: 's2',
    sellerName: 'Fashion Hub',
    category: 'Fashion',
    images: [
      'https://images.unsplash.com/photo-1511499767150-a48a237f0083?w=800&q=80',
      'https://images.unsplash.com/photo-1542291026-7eec264c27ff?w=800&q=80',
      'https://images.unsplash.com/photo-1553062407-98eeb64c6a62?w=800&q=80',
      'https://images.unsplash.com/photo-1548036328-c9fa89d128fa?w=800&q=80',
      'https://images.unsplash.com/photo-1576995853123-5a10305d93c0?w=800&q=80'
    ],
    stock: 100,
    rating: 4.0,
    reviewsCount: 32,
    isVerifiedSeller: false,
  },
  {
    id: 'p6',
    name: 'Laptop Backpack',
    description: 'Water-resistant backpack with anti-theft design.',
    price: 35000,
    originalPrice: 50000,
    sellerId: 's2',
    sellerName: 'Fashion Hub',
    category: 'Fashion',
    images: [
      'https://images.unsplash.com/photo-1553062407-98eeb64c6a62?w=800&q=80',
      'https://images.unsplash.com/photo-1542291026-7eec264c27ff?w=800&q=80',
      'https://images.unsplash.com/photo-1511499767150-a48a237f0083?w=800&q=80',
      'https://images.unsplash.com/photo-1548036328-c9fa89d128fa?w=800&q=80',
      'https://images.unsplash.com/photo-1576995853123-5a10305d93c0?w=800&q=80'
    ],
    stock: 40,
    rating: 4.6,
    reviewsCount: 78,
    isVerifiedSeller: false,
  },
  {
    id: 'p14',
    name: 'Vintage Leather Crossbody Bag',
    description: 'Genuine leather vintage-style bag with adjustable straps.',
    price: 95000,
    sellerId: 's2',
    sellerName: 'Fashion Hub',
    category: 'Fashion',
    images: [
      'https://images.unsplash.com/photo-1548036328-c9fa89d128fa?w=800&q=80',
      'https://images.unsplash.com/photo-1542291026-7eec264c27ff?w=800&q=80',
      'https://images.unsplash.com/photo-1511499767150-a48a237f0083?w=800&q=80',
      'https://images.unsplash.com/photo-1553062407-98eeb64c6a62?w=800&q=80',
      'https://images.unsplash.com/photo-1576995853123-5a10305d93c0?w=800&q=80'
    ],
    stock: 8,
    rating: 4.3,
    reviewsCount: 38,
    isVerifiedSeller: false,
  },
  {
    id: 'p15',
    name: "Men's Denim Jacket",
    description: 'Classic fit blue denim jacket pre-washed for vintage feel.',
    price: 55000,
    originalPrice: 75000,
    sellerId: 's2',
    sellerName: 'Fashion Hub',
    category: 'Fashion',
    images: [
      'https://images.unsplash.com/photo-1576995853123-5a10305d93c0?w=800&q=80',
      'https://images.unsplash.com/photo-1542291026-7eec264c27ff?w=800&q=80',
      'https://images.unsplash.com/photo-1511499767150-a48a237f0083?w=800&q=80',
      'https://images.unsplash.com/photo-1553062407-98eeb64c6a62?w=800&q=80',
      'https://images.unsplash.com/photo-1548036328-c9fa89d128fa?w=800&q=80'
    ],
    stock: 30,
    rating: 4.6,
    reviewsCount: 55,
    isVerifiedSeller: false,
  },
  {
    id: 'p16',
    name: 'Floral Summer Dress',
    description: 'Lightweight breathable floral print dress perfect for warm days.',
    price: 38000,
    sellerId: 's2',
    sellerName: 'Fashion Hub',
    category: 'Fashion',
    images: [
      'https://images.unsplash.com/photo-1572804013309-59a88b7e92f1?w=800&q=80',
      'https://images.unsplash.com/photo-1542291026-7eec264c27ff?w=800&q=80',
      'https://images.unsplash.com/photo-1511499767150-a48a237f0083?w=800&q=80',
      'https://images.unsplash.com/photo-1553062407-98eeb64c6a62?w=800&q=80',
      'https://images.unsplash.com/photo-1548036328-c9fa89d128fa?w=800&q=80'
    ],
    stock: 25,
    rating: 4.7,
    reviewsCount: 61,
    isVerifiedSeller: false,
  },

  // --- HOME & KITCHEN (6 products) ---
  {
    id: 'p17',
    name: 'Handwoven Boho Throw Blanket',
    description: 'Cozy and stylish handwoven blanket made of 100% natural cotton.',
    price: 32000,
    originalPrice: 40000,
    sellerId: 's2',
    sellerName: 'Fashion Hub',
    category: 'Home & Kitchen',
    images: [
      'https://images.unsplash.com/photo-1583847268964-b28dc8f51f92?w=800&q=80',
      'https://images.unsplash.com/photo-1612196808214-b8e1d6145a8c?w=800&q=80',
      'https://images.unsplash.com/photo-1514432324607-a09d9b4aefdd?w=800&q=80',
      'https://images.unsplash.com/photo-1584992236310-6edddc08acff?w=800&q=80',
      'https://images.unsplash.com/photo-1585515320310-259814833e62?w=800&q=80'
    ],
    stock: 25,
    rating: 4.9,
    reviewsCount: 42,
    isVerifiedSeller: false,
  },
  {
    id: 'p18',
    name: 'Ceramic Minimalist Vase Set',
    description: 'Set of 3 matte ceramic vases for dry flowers or modern Scandinavian decor.',
    price: 45000,
    sellerId: 's2',
    sellerName: 'Fashion Hub',
    category: 'Home & Kitchen',
    images: [
      'https://images.unsplash.com/photo-1612196808214-b8e1d6145a8c?w=800&q=80',
      'https://images.unsplash.com/photo-1583847268964-b28dc8f51f92?w=800&q=80',
      'https://images.unsplash.com/photo-1514432324607-a09d9b4aefdd?w=800&q=80',
      'https://images.unsplash.com/photo-1584992236310-6edddc08acff?w=800&q=80',
      'https://images.unsplash.com/photo-1585515320310-259814833e62?w=800&q=80'
    ],
    stock: 10,
    rating: 4.7,
    reviewsCount: 15,
    isVerifiedSeller: false,
  },
  {
    id: 'p19',
    name: 'Stainless Steel Espresso Coffee Maker',
    description: 'Classic stovetop espresso maker for rich aromatic coffee.',
    price: 28000,
    sellerId: 's1',
    sellerName: 'Tech Store Mw',
    category: 'Home & Kitchen',
    images: [
      'https://images.unsplash.com/photo-1514432324607-a09d9b4aefdd?w=800&q=80',
      'https://images.unsplash.com/photo-1583847268964-b28dc8f51f92?w=800&q=80',
      'https://images.unsplash.com/photo-1612196808214-b8e1d6145a8c?w=800&q=80',
      'https://images.unsplash.com/photo-1584992236310-6edddc08acff?w=800&q=80',
      'https://images.unsplash.com/photo-1585515320310-259814833e62?w=800&q=80'
    ],
    stock: 18,
    rating: 4.8,
    reviewsCount: 73,
    isVerifiedSeller: true,
  },
  {
    id: 'p20',
    name: 'Non-Stick Granite Cookware Set (12 Pcs)',
    description: 'Durable eco-friendly non-stick pots and pans set.',
    price: 110000,
    originalPrice: 135000,
    sellerId: 's2',
    sellerName: 'Fashion Hub',
    category: 'Home & Kitchen',
    images: [
      'https://images.unsplash.com/photo-1584992236310-6edddc08acff?w=800&q=80',
      'https://images.unsplash.com/photo-1583847268964-b28dc8f51f92?w=800&q=80',
      'https://images.unsplash.com/photo-1612196808214-b8e1d6145a8c?w=800&q=80',
      'https://images.unsplash.com/photo-1514432324607-a09d9b4aefdd?w=800&q=80',
      'https://images.unsplash.com/photo-1585515320310-259814833e62?w=800&q=80'
    ],
    stock: 12,
    rating: 4.9,
    reviewsCount: 94,
    isVerifiedSeller: false,
  },
  {
    id: 'p21',
    name: 'Digital Air Fryer Touchscreen 5.5L',
    description: 'Oil-free rapid air circulation cooker with 8 presets.',
    price: 125000,
    sellerId: 's1',
    sellerName: 'Tech Store Mw',
    category: 'Home & Kitchen',
    images: [
      'https://images.unsplash.com/photo-1585515320310-259814833e62?w=800&q=80',
      'https://images.unsplash.com/photo-1583847268964-b28dc8f51f92?w=800&q=80',
      'https://images.unsplash.com/photo-1612196808214-b8e1d6145a8c?w=800&q=80',
      'https://images.unsplash.com/photo-1514432324607-a09d9b4aefdd?w=800&q=80',
      'https://images.unsplash.com/photo-1584992236310-6edddc08acff?w=800&q=80'
    ],
    stock: 14,
    rating: 4.8,
    reviewsCount: 108,
    isVerifiedSeller: true,
  },
  {
    id: 'p22',
    name: 'Electric Stainless Steel Water Kettle',
    description: '1.7L quick boiling cordless water kettle with auto shut-off.',
    price: 32000,
    sellerId: 's1',
    sellerName: 'Tech Store Mw',
    category: 'Home & Kitchen',
    images: [
      'https://images.unsplash.com/photo-1594212699903-ec8a3eca50f6?w=800&q=80',
      'https://images.unsplash.com/photo-1583847268964-b28dc8f51f92?w=800&q=80',
      'https://images.unsplash.com/photo-1612196808214-b8e1d6145a8c?w=800&q=80',
      'https://images.unsplash.com/photo-1514432324607-a09d9b4aefdd?w=800&q=80',
      'https://images.unsplash.com/photo-1584992236310-6edddc08acff?w=800&q=80'
    ],
    stock: 30,
    rating: 4.6,
    reviewsCount: 82,
    isVerifiedSeller: true,
  },

  // --- BEAUTY (6 products) ---
  {
    id: 'p23',
    name: 'Organic Vitamin C Serum',
    description: 'Brightening daily serum with natural Vitamin C, Hyaluronic acid and Vitamin E.',
    price: 28000,
    sellerId: 's2',
    sellerName: 'Fashion Hub',
    category: 'Beauty',
    images: [
      'https://images.unsplash.com/photo-1620916566398-39f1143ab7be?w=800&q=80',
      'https://images.unsplash.com/photo-1598440947619-2c35fc9aa908?w=800&q=80',
      'https://images.unsplash.com/photo-1586495777744-4413f21062fa?w=800&q=80',
      'https://images.unsplash.com/photo-1608248597261-83325805435f?w=800&q=80',
      'https://images.unsplash.com/photo-1608248543803-ba4f8c70ae0b?w=800&q=80'
    ],
    stock: 100,
    rating: 4.8,
    reviewsCount: 215,
    isVerifiedSeller: false,
  },
  {
    id: 'p24',
    name: 'Rose Quartz Facial Roller',
    description: 'Natural stone roller for depuffing and skin massage.',
    price: 15000,
    sellerId: 's2',
    sellerName: 'Fashion Hub',
    category: 'Beauty',
    images: [
      'https://images.unsplash.com/photo-1598440947619-2c35fc9aa908?w=800&q=80',
      'https://images.unsplash.com/photo-1620916566398-39f1143ab7be?w=800&q=80',
      'https://images.unsplash.com/photo-1586495777744-4413f21062fa?w=800&q=80',
      'https://images.unsplash.com/photo-1608248597261-83325805435f?w=800&q=80',
      'https://images.unsplash.com/photo-1608248543803-ba4f8c70ae0b?w=800&q=80'
    ],
    stock: 50,
    rating: 4.4,
    reviewsCount: 92,
    isVerifiedSeller: false,
  },
  {
    id: 'p25',
    name: 'Matte Liquid Lipstick Trio',
    description: 'Long-lasting non-drying waterproof liquid lip colors.',
    price: 22000,
    sellerId: 's2',
    sellerName: 'Fashion Hub',
    category: 'Beauty',
    images: [
      'https://images.unsplash.com/photo-1586495777744-4413f21062fa?w=800&q=80',
      'https://images.unsplash.com/photo-1620916566398-39f1143ab7be?w=800&q=80',
      'https://images.unsplash.com/photo-1598440947619-2c35fc9aa908?w=800&q=80',
      'https://images.unsplash.com/photo-1608248597261-83325805435f?w=800&q=80',
      'https://images.unsplash.com/photo-1608248543803-ba4f8c70ae0b?w=800&q=80'
    ],
    stock: 45,
    rating: 4.5,
    reviewsCount: 67,
    isVerifiedSeller: false,
  },
  {
    id: 'p26',
    name: 'Hydrating Face Cream Moisturizer',
    description: 'Deep nourishing moisture barrier cream for dry skin.',
    price: 34000,
    sellerId: 's2',
    sellerName: 'Fashion Hub',
    category: 'Beauty',
    images: [
      'https://images.unsplash.com/photo-1608248597261-83325805435f?w=800&q=80',
      'https://images.unsplash.com/photo-1620916566398-39f1143ab7be?w=800&q=80',
      'https://images.unsplash.com/photo-1598440947619-2c35fc9aa908?w=800&q=80',
      'https://images.unsplash.com/photo-1586495777744-4413f21062fa?w=800&q=80',
      'https://images.unsplash.com/photo-1608248543803-ba4f8c70ae0b?w=800&q=80'
    ],
    stock: 60,
    rating: 4.7,
    reviewsCount: 112,
    isVerifiedSeller: false,
  },
  {
    id: 'p27',
    name: 'Argan Oil Hair Repair Serum',
    description: 'Pure Moroccan argan oil for silky smooth frizz-free hair.',
    price: 26000,
    sellerId: 's2',
    sellerName: 'Fashion Hub',
    category: 'Beauty',
    images: [
      'https://images.unsplash.com/photo-1608248543803-ba4f8c70ae0b?w=800&q=80',
      'https://images.unsplash.com/photo-1620916566398-39f1143ab7be?w=800&q=80',
      'https://images.unsplash.com/photo-1598440947619-2c35fc9aa908?w=800&q=80',
      'https://images.unsplash.com/photo-1586495777744-4413f21062fa?w=800&q=80',
      'https://images.unsplash.com/photo-1608248597261-83325805435f?w=800&q=80'
    ],
    stock: 35,
    rating: 4.9,
    reviewsCount: 130,
    isVerifiedSeller: false,
  },
  {
    id: 'p28',
    name: 'Natural Clay Exfoliating Face Mask',
    description: 'Pore detoxifying bentonite clay mask for clear radiant skin.',
    price: 19000,
    sellerId: 's2',
    sellerName: 'Fashion Hub',
    category: 'Beauty',
    images: [
      'https://images.unsplash.com/photo-1567928269937-ae146e45b428?w=800&q=80',
      'https://images.unsplash.com/photo-1620916566398-39f1143ab7be?w=800&q=80',
      'https://images.unsplash.com/photo-1598440947619-2c35fc9aa908?w=800&q=80',
      'https://images.unsplash.com/photo-1586495777744-4413f21062fa?w=800&q=80',
      'https://images.unsplash.com/photo-1608248597261-83325805435f?w=800&q=80'
    ],
    stock: 40,
    rating: 4.6,
    reviewsCount: 84,
    isVerifiedSeller: false,
  },

  // --- SPORTS (6 products) ---
  {
    id: 'p29',
    name: 'Premium Non-Slip Yoga Mat',
    description: 'Eco-friendly, non-slip, extra thick yoga mat for workouts.',
    price: 32000,
    sellerId: 's2',
    sellerName: 'Fashion Hub',
    category: 'Sports',
    images: [
      'https://images.unsplash.com/photo-1592432678016-e910b06b384e?w=800&q=80',
      'https://images.unsplash.com/photo-1583454110551-21f2fa2afe61?w=800&q=80',
      'https://images.unsplash.com/photo-1614632537197-38a17061c2bd?w=800&q=80',
      'https://images.unsplash.com/photo-1598289431512-b97b0917affc?w=800&q=80',
      'https://images.unsplash.com/photo-1602143407151-7111542de6e8?w=800&q=80'
    ],
    stock: 20,
    rating: 4.7,
    reviewsCount: 64,
    isVerifiedSeller: false,
  },
  {
    id: 'p30',
    name: 'Adjustable Dumbbell Set (20kg)',
    description: 'Versatile home gym strength training weight plates set.',
    price: 120000,
    originalPrice: 140000,
    sellerId: 's1',
    sellerName: 'Tech Store Mw',
    category: 'Sports',
    images: [
      'https://images.unsplash.com/photo-1583454110551-21f2fa2afe61?w=800&q=80',
      'https://images.unsplash.com/photo-1592432678016-e910b06b384e?w=800&q=80',
      'https://images.unsplash.com/photo-1614632537197-38a17061c2bd?w=800&q=80',
      'https://images.unsplash.com/photo-1598289431512-b97b0917affc?w=800&q=80',
      'https://images.unsplash.com/photo-1602143407151-7111542de6e8?w=800&q=80'
    ],
    stock: 12,
    rating: 4.8,
    reviewsCount: 51,
    isVerifiedSeller: true,
  },
  {
    id: 'p31',
    name: 'Professional Match Soccer Ball',
    description: 'FIFA quality outdoor training and match football.',
    price: 25000,
    sellerId: 's2',
    sellerName: 'Fashion Hub',
    category: 'Sports',
    images: [
      'https://images.unsplash.com/photo-1614632537197-38a17061c2bd?w=800&q=80',
      'https://images.unsplash.com/photo-1592432678016-e910b06b384e?w=800&q=80',
      'https://images.unsplash.com/photo-1583454110551-21f2fa2afe61?w=800&q=80',
      'https://images.unsplash.com/photo-1598289431512-b97b0917affc?w=800&q=80',
      'https://images.unsplash.com/photo-1602143407151-7111542de6e8?w=800&q=80'
    ],
    stock: 50,
    rating: 4.9,
    reviewsCount: 120,
    isVerifiedSeller: false,
  },
  {
    id: 'p32',
    name: 'Fitness Resistance Bands (Set of 5)',
    description: 'Latex loop bands for physical therapy, yoga, and gym workouts.',
    price: 18000,
    sellerId: 's2',
    sellerName: 'Fashion Hub',
    category: 'Sports',
    images: [
      'https://images.unsplash.com/photo-1598289431512-b97b0917affc?w=800&q=80',
      'https://images.unsplash.com/photo-1592432678016-e910b06b384e?w=800&q=80',
      'https://images.unsplash.com/photo-1583454110551-21f2fa2afe61?w=800&q=80',
      'https://images.unsplash.com/photo-1614632537197-38a17061c2bd?w=800&q=80',
      'https://images.unsplash.com/photo-1602143407151-7111542de6e8?w=800&q=80'
    ],
    stock: 80,
    rating: 4.6,
    reviewsCount: 95,
    isVerifiedSeller: false,
  },
  {
    id: 'p33',
    name: 'Insulated Stainless Steel Sports Water Bottle',
    description: '1L double-wall vacuum insulated flask keeps drinks cold for 24h.',
    price: 22000,
    sellerId: 's1',
    sellerName: 'Tech Store Mw',
    category: 'Sports',
    images: [
      'https://images.unsplash.com/photo-1602143407151-7111542de6e8?w=800&q=80',
      'https://images.unsplash.com/photo-1592432678016-e910b06b384e?w=800&q=80',
      'https://images.unsplash.com/photo-1583454110551-21f2fa2afe61?w=800&q=80',
      'https://images.unsplash.com/photo-1614632537197-38a17061c2bd?w=800&q=80',
      'https://images.unsplash.com/photo-1598289431512-b97b0917affc?w=800&q=80'
    ],
    stock: 45,
    rating: 4.8,
    reviewsCount: 88,
    isVerifiedSeller: true,
  },
  {
    id: 'p34',
    name: 'Speed Jump Rope with Ball Bearings',
    description: 'Adjustable tangle-free steel wire skipping rope for cardio.',
    price: 12000,
    sellerId: 's2',
    sellerName: 'Fashion Hub',
    category: 'Sports',
    images: [
      'https://images.unsplash.com/photo-1518611012118-696072aa579a?w=800&q=80',
      'https://images.unsplash.com/photo-1592432678016-e910b06b384e?w=800&q=80',
      'https://images.unsplash.com/photo-1583454110551-21f2fa2afe61?w=800&q=80',
      'https://images.unsplash.com/photo-1614632537197-38a17061c2bd?w=800&q=80',
      'https://images.unsplash.com/photo-1598289431512-b97b0917affc?w=800&q=80'
    ],
    stock: 65,
    rating: 4.5,
    reviewsCount: 42,
    isVerifiedSeller: false,
  },

  // --- AUTOMOTIVE (6 products) ---
  {
    id: 'p9',
    name: 'Car Dash Cam 4K Ultra HD',
    description: 'Dual lens dash camera with night vision and emergency lock.',
    price: 85000,
    originalPrice: 110000,
    sellerId: 's1',
    sellerName: 'Tech Store Mw',
    category: 'Automotive',
    images: [
      'https://images.unsplash.com/photo-1503376780353-7e6692767b70?w=800&q=80',
      'https://images.unsplash.com/photo-1580273916550-e323be2ae537?w=800&q=80',
      'https://images.unsplash.com/photo-1520340356584-f9917d1eea6f?w=800&q=80',
      'https://images.unsplash.com/photo-1549399542-7e3f8b79c341?w=800&q=80',
      'https://images.unsplash.com/photo-1563720223185-11003d516935?w=800&q=80'
    ],
    stock: 22,
    rating: 4.7,
    reviewsCount: 56,
    isVerifiedSeller: true,
  },
  {
    id: 'p35',
    name: 'Portable Digital Car Tire Inflator',
    description: '12V cordless air compressor pump with digital pressure gauge.',
    price: 45000,
    sellerId: 's1',
    sellerName: 'Tech Store Mw',
    category: 'Automotive',
    images: [
      'https://images.unsplash.com/photo-1580273916550-e323be2ae537?w=800&q=80',
      'https://images.unsplash.com/photo-1503376780353-7e6692767b70?w=800&q=80',
      'https://images.unsplash.com/photo-1520340356584-f9917d1eea6f?w=800&q=80',
      'https://images.unsplash.com/photo-1549399542-7e3f8b79c341?w=800&q=80',
      'https://images.unsplash.com/photo-1563720223185-11003d516935?w=800&q=80'
    ],
    stock: 18,
    rating: 4.6,
    reviewsCount: 39,
    isVerifiedSeller: true,
  },
  {
    id: 'p36',
    name: 'High-Pressure Car Wash Spray Gun',
    description: 'Multifunctional nozzle foam cannon washer attachment.',
    price: 28000,
    sellerId: 's1',
    sellerName: 'Tech Store Mw',
    category: 'Automotive',
    images: [
      'https://images.unsplash.com/photo-1520340356584-f9917d1eea6f?w=800&q=80',
      'https://images.unsplash.com/photo-1503376780353-7e6692767b70?w=800&q=80',
      'https://images.unsplash.com/photo-1580273916550-e323be2ae537?w=800&q=80',
      'https://images.unsplash.com/photo-1549399542-7e3f8b79c341?w=800&q=80',
      'https://images.unsplash.com/photo-1563720223185-11003d516935?w=800&q=80'
    ],
    stock: 25,
    rating: 4.4,
    reviewsCount: 28,
    isVerifiedSeller: true,
  },
  {
    id: 'p37',
    name: 'Emergency Car Jump Starter Power Bank',
    description: '1200A peak portable battery jump pack with LED flashlight.',
    price: 95000,
    originalPrice: 115000,
    sellerId: 's1',
    sellerName: 'Tech Store Mw',
    category: 'Automotive',
    images: [
      'https://images.unsplash.com/photo-1549399542-7e3f8b79c341?w=800&q=80',
      'https://images.unsplash.com/photo-1503376780353-7e6692767b70?w=800&q=80',
      'https://images.unsplash.com/photo-1580273916550-e323be2ae537?w=800&q=80',
      'https://images.unsplash.com/photo-1520340356584-f9917d1eea6f?w=800&q=80',
      'https://images.unsplash.com/photo-1563720223185-11003d516935?w=800&q=80'
    ],
    stock: 10,
    rating: 4.9,
    reviewsCount: 77,
    isVerifiedSeller: true,
  },
  {
    id: 'p38',
    name: 'Leather Car Seat Covers Full Set',
    description: 'Universal waterproof PU leather interior seat cushion pads.',
    price: 110000,
    sellerId: 's2',
    sellerName: 'Fashion Hub',
    category: 'Automotive',
    images: [
      'https://images.unsplash.com/photo-1563720223185-11003d516935?w=800&q=80',
      'https://images.unsplash.com/photo-1503376780353-7e6692767b70?w=800&q=80',
      'https://images.unsplash.com/photo-1580273916550-e323be2ae537?w=800&q=80',
      'https://images.unsplash.com/photo-1520340356584-f9917d1eea6f?w=800&q=80',
      'https://images.unsplash.com/photo-1549399542-7e3f8b79c341?w=800&q=80'
    ],
    stock: 15,
    rating: 4.5,
    reviewsCount: 34,
    isVerifiedSeller: false,
  },
  {
    id: 'p39',
    name: 'Bluetooth OBD2 Car Diagnostic Scanner',
    description: 'Engine code reader tool compatible with iOS and Android devices.',
    price: 32000,
    sellerId: 's1',
    sellerName: 'Tech Store Mw',
    category: 'Automotive',
    images: [
      'https://images.unsplash.com/photo-1486006920555-c77dce18193b?w=800&q=80',
      'https://images.unsplash.com/photo-1503376780353-7e6692767b70?w=800&q=80',
      'https://images.unsplash.com/photo-1580273916550-e323be2ae537?w=800&q=80',
      'https://images.unsplash.com/photo-1520340356584-f9917d1eea6f?w=800&q=80',
      'https://images.unsplash.com/photo-1549399542-7e3f8b79c341?w=800&q=80'
    ],
    stock: 30,
    rating: 4.7,
    reviewsCount: 91,
    isVerifiedSeller: true,
  },

  // --- BOOKS (6 products) ---
  {
    id: 'p7',
    name: 'The Pragmatic Programmer',
    description: 'A classic book on software engineering and best practices.',
    price: 35000,
    sellerId: 's1',
    sellerName: 'Tech Store Mw',
    category: 'Books',
    images: [
      'https://images.unsplash.com/photo-1532012197267-da84d127e765?w=800&q=80',
      'https://images.unsplash.com/photo-1544716278-ca5e3f4abd8c?w=800&q=80',
      'https://images.unsplash.com/photo-1512820790803-83ca734da794?w=800&q=80',
      'https://images.unsplash.com/photo-1497633762265-9d179a990aa6?w=800&q=80',
      'https://images.unsplash.com/photo-1554415707-6e8cfc93fe23?w=800&q=80'
    ],
    stock: 20,
    rating: 4.9,
    reviewsCount: 350,
    isVerifiedSeller: true,
  },
  {
    id: 'p40',
    name: 'Atomic Habits by James Clear',
    description: 'An easy and proven way to build good habits and break bad ones.',
    price: 28000,
    sellerId: 's1',
    sellerName: 'Tech Store Mw',
    category: 'Books',
    images: [
      'https://images.unsplash.com/photo-1544716278-ca5e3f4abd8c?w=800&q=80',
      'https://images.unsplash.com/photo-1532012197267-da84d127e765?w=800&q=80',
      'https://images.unsplash.com/photo-1512820790803-83ca734da794?w=800&q=80',
      'https://images.unsplash.com/photo-1497633762265-9d179a990aa6?w=800&q=80',
      'https://images.unsplash.com/photo-1554415707-6e8cfc93fe23?w=800&q=80'
    ],
    stock: 45,
    rating: 5.0,
    reviewsCount: 420,
    isVerifiedSeller: true,
  },
  {
    id: 'p41',
    name: 'Rich Dad Poor Dad',
    description: 'What the rich teach their kids about money that the poor and middle class do not!',
    price: 24000,
    sellerId: 's1',
    sellerName: 'Tech Store Mw',
    category: 'Books',
    images: [
      'https://images.unsplash.com/photo-1512820790803-83ca734da794?w=800&q=80',
      'https://images.unsplash.com/photo-1532012197267-da84d127e765?w=800&q=80',
      'https://images.unsplash.com/photo-1544716278-ca5e3f4abd8c?w=800&q=80',
      'https://images.unsplash.com/photo-1497633762265-9d179a990aa6?w=800&q=80',
      'https://images.unsplash.com/photo-1554415707-6e8cfc93fe23?w=800&q=80'
    ],
    stock: 50,
    rating: 4.8,
    reviewsCount: 310,
    isVerifiedSeller: true,
  },
  {
    id: 'p42',
    name: 'Deep Work by Cal Newport',
    description: 'Rules for focused success in a distracted world.',
    price: 30000,
    sellerId: 's1',
    sellerName: 'Tech Store Mw',
    category: 'Books',
    images: [
      'https://images.unsplash.com/photo-1497633762265-9d179a990aa6?w=800&q=80',
      'https://images.unsplash.com/photo-1532012197267-da84d127e765?w=800&q=80',
      'https://images.unsplash.com/photo-1544716278-ca5e3f4abd8c?w=800&q=80',
      'https://images.unsplash.com/photo-1512820790803-83ca734da794?w=800&q=80',
      'https://images.unsplash.com/photo-1554415707-6e8cfc93fe23?w=800&q=80'
    ],
    stock: 25,
    rating: 4.7,
    reviewsCount: 180,
    isVerifiedSeller: true,
  },
  {
    id: 'p43',
    name: 'The Psychology of Money',
    description: 'Timeless lessons on wealth, greed, and happiness by Morgan Housel.',
    price: 29000,
    sellerId: 's1',
    sellerName: 'Tech Store Mw',
    category: 'Books',
    images: [
      'https://images.unsplash.com/photo-1554415707-6e8cfc93fe23?w=800&q=80',
      'https://images.unsplash.com/photo-1532012197267-da84d127e765?w=800&q=80',
      'https://images.unsplash.com/photo-1544716278-ca5e3f4abd8c?w=800&q=80',
      'https://images.unsplash.com/photo-1512820790803-83ca734da794?w=800&q=80',
      'https://images.unsplash.com/photo-1497633762265-9d179a990aa6?w=800&q=80'
    ],
    stock: 35,
    rating: 4.9,
    reviewsCount: 260,
    isVerifiedSeller: true,
  },
  {
    id: 'p44',
    name: 'Clean Code: Agile Software Craftsmanship',
    description: 'Even bad code can function. But if code isn\'t clean, it can bring a development organization to its knees.',
    price: 42000,
    sellerId: 's1',
    sellerName: 'Tech Store Mw',
    category: 'Books',
    images: [
      'https://images.unsplash.com/photo-1526374965328-7f61d4dc18c5?w=800&q=80',
      'https://images.unsplash.com/photo-1532012197267-da84d127e765?w=800&q=80',
      'https://images.unsplash.com/photo-1544716278-ca5e3f4abd8c?w=800&q=80',
      'https://images.unsplash.com/photo-1512820790803-83ca734da794?w=800&q=80',
      'https://images.unsplash.com/photo-1497633762265-9d179a990aa6?w=800&q=80'
    ],
    stock: 15,
    rating: 4.8,
    reviewsCount: 145,
    isVerifiedSeller: true,
  },

  // --- TOYS & GAMES (6 products) ---
  {
    id: 'p10',
    name: 'Educational Building Blocks Toy Set',
    description: 'Creative STEM building set for kids. Encourages spatial imagination.',
    price: 38000,
    sellerId: 's2',
    sellerName: 'Fashion Hub',
    category: 'Toys & Games',
    images: [
      'https://images.unsplash.com/photo-1566576912321-d58ddd7a6088?w=800&q=80',
      'https://images.unsplash.com/photo-1594787318286-3d835c1d207f?w=800&q=80',
      'https://images.unsplash.com/photo-1529699211952-734e80c4d42b?w=800&q=80',
      'https://images.unsplash.com/photo-1618843479313-40f8afb4b4d8?w=800&q=80',
      'https://images.unsplash.com/photo-1513883049090-d0b7439799bf?w=800&q=80'
    ],
    stock: 35,
    rating: 4.9,
    reviewsCount: 88,
    isVerifiedSeller: false,
  },
  {
    id: 'p45',
    name: 'Remote Control High-Speed Stunt Car',
    description: '360 degree rotating double-sided RC car with rechargeable batteries.',
    price: 32000,
    sellerId: 's1',
    sellerName: 'Tech Store Mw',
    category: 'Toys & Games',
    images: [
      'https://images.unsplash.com/photo-1594787318286-3d835c1d207f?w=800&q=80',
      'https://images.unsplash.com/photo-1566576912321-d58ddd7a6088?w=800&q=80',
      'https://images.unsplash.com/photo-1529699211952-734e80c4d42b?w=800&q=80',
      'https://images.unsplash.com/photo-1618843479313-40f8afb4b4d8?w=800&q=80',
      'https://images.unsplash.com/photo-1513883049090-d0b7439799bf?w=800&q=80'
    ],
    stock: 20,
    rating: 4.7,
    reviewsCount: 54,
    isVerifiedSeller: true,
  },
  {
    id: 'p46',
    name: 'Wooden Chess & Checkers Board Game',
    description: 'Handcrafted folding wooden chess set with magnetic pieces.',
    price: 25000,
    sellerId: 's2',
    sellerName: 'Fashion Hub',
    category: 'Toys & Games',
    images: [
      'https://images.unsplash.com/photo-1529699211952-734e80c4d42b?w=800&q=80',
      'https://images.unsplash.com/photo-1566576912321-d58ddd7a6088?w=800&q=80',
      'https://images.unsplash.com/photo-1594787318286-3d835c1d207f?w=800&q=80',
      'https://images.unsplash.com/photo-1618843479313-40f8afb4b4d8?w=800&q=80',
      'https://images.unsplash.com/photo-1513883049090-d0b7439799bf?w=800&q=80'
    ],
    stock: 30,
    rating: 4.8,
    reviewsCount: 72,
    isVerifiedSeller: false,
  },
  {
    id: 'p47',
    name: '1000-Piece Landscape Jigsaw Puzzle',
    description: 'Challenging premium cardboard puzzle featuring beautiful nature vistas.',
    price: 18000,
    sellerId: 's2',
    sellerName: 'Fashion Hub',
    category: 'Toys & Games',
    images: [
      'https://images.unsplash.com/photo-1618843479313-40f8afb4b4d8?w=800&q=80',
      'https://images.unsplash.com/photo-1566576912321-d58ddd7a6088?w=800&q=80',
      'https://images.unsplash.com/photo-1594787318286-3d835c1d207f?w=800&q=80',
      'https://images.unsplash.com/photo-1529699211952-734e80c4d42b?w=800&q=80',
      'https://images.unsplash.com/photo-1513883049090-d0b7439799bf?w=800&q=80'
    ],
    stock: 40,
    rating: 4.6,
    reviewsCount: 38,
    isVerifiedSeller: false,
  },
  {
    id: 'p48',
    name: 'Interactive Musical Keyboard Toy',
    description: 'Kids electronic piano with microphones and demo songs.',
    price: 29000,
    sellerId: 's1',
    sellerName: 'Tech Store Mw',
    category: 'Toys & Games',
    images: [
      'https://images.unsplash.com/photo-1513883049090-d0b7439799bf?w=800&q=80',
      'https://images.unsplash.com/photo-1566576912321-d58ddd7a6088?w=800&q=80',
      'https://images.unsplash.com/photo-1594787318286-3d835c1d207f?w=800&q=80',
      'https://images.unsplash.com/photo-1529699211952-734e80c4d42b?w=800&q=80',
      'https://images.unsplash.com/photo-1618843479313-40f8afb4b4d8?w=800&q=80'
    ],
    stock: 22,
    rating: 4.5,
    reviewsCount: 49,
    isVerifiedSeller: true,
  },
  {
    id: 'p49',
    name: 'Plush Teddy Bear Giant Soft Toy',
    description: 'Super soft plush stuffed animal bear, hypoallergenic gift for all ages.',
    price: 22000,
    sellerId: 's2',
    sellerName: 'Fashion Hub',
    category: 'Toys & Games',
    images: [
      'https://images.unsplash.com/photo-1559454403-b8fb88521f11?w=800&q=80',
      'https://images.unsplash.com/photo-1566576912321-d58ddd7a6088?w=800&q=80',
      'https://images.unsplash.com/photo-1594787318286-3d835c1d207f?w=800&q=80',
      'https://images.unsplash.com/photo-1529699211952-734e80c4d42b?w=800&q=80',
      'https://images.unsplash.com/photo-1618843479313-40f8afb4b4d8?w=800&q=80'
    ],
    stock: 50,
    rating: 4.9,
    reviewsCount: 110,
    isVerifiedSeller: false,
  },

  // --- HEALTH & PERSONAL CARE (6 products) ---
  {
    id: 'p50',
    name: 'Sonic Electric Toothbrush with 4 Heads',
    description: 'Rechargeable toothbrush with 5 modes and smart timer.',
    price: 32000,
    sellerId: 's1',
    sellerName: 'Tech Store Mw',
    category: 'Health & Personal Care',
    images: [
      'https://images.unsplash.com/photo-1559591937-e58cf18f5227?w=800&q=80',
      'https://images.unsplash.com/photo-1576091160399-112ba8d25d1d?w=800&q=80',
      'https://images.unsplash.com/photo-1584036561566-baf8f5f1b144?w=800&q=80',
      'https://images.unsplash.com/photo-1544161515-4ab6ce6db874?w=800&q=80',
      'https://images.unsplash.com/photo-1584308666744-24d5c474f2ae?w=800&q=80'
    ],
    stock: 30,
    rating: 4.8,
    reviewsCount: 95,
    isVerifiedSeller: true,
  },
  {
    id: 'p51',
    name: 'Digital Arm Blood Pressure Monitor',
    description: 'Automatic BP cuff machine with LCD screen memory recall.',
    price: 48000,
    sellerId: 's1',
    sellerName: 'Tech Store Mw',
    category: 'Health & Personal Care',
    images: [
      'https://images.unsplash.com/photo-1576091160399-112ba8d25d1d?w=800&q=80',
      'https://images.unsplash.com/photo-1559591937-e58cf18f5227?w=800&q=80',
      'https://images.unsplash.com/photo-1584036561566-baf8f5f1b144?w=800&q=80',
      'https://images.unsplash.com/photo-1544161515-4ab6ce6db874?w=800&q=80',
      'https://images.unsplash.com/photo-1584308666744-24d5c474f2ae?w=800&q=80'
    ],
    stock: 20,
    rating: 4.7,
    reviewsCount: 63,
    isVerifiedSeller: true,
  },
  {
    id: 'p52',
    name: 'Infrared Forehead Thermometer',
    description: 'Non-contact digital medical thermometer for fever detection.',
    price: 25000,
    sellerId: 's1',
    sellerName: 'Tech Store Mw',
    category: 'Health & Personal Care',
    images: [
      'https://images.unsplash.com/photo-1584036561566-baf8f5f1b144?w=800&q=80',
      'https://images.unsplash.com/photo-1559591937-e58cf18f5227?w=800&q=80',
      'https://images.unsplash.com/photo-1576091160399-112ba8d25d1d?w=800&q=80',
      'https://images.unsplash.com/photo-1544161515-4ab6ce6db874?w=800&q=80',
      'https://images.unsplash.com/photo-1584308666744-24d5c474f2ae?w=800&q=80'
    ],
    stock: 45,
    rating: 4.6,
    reviewsCount: 82,
    isVerifiedSeller: true,
  },
  {
    id: 'p53',
    name: 'Shiatsu Back and Neck Massager Pillow',
    description: 'Deep tissue kneading massage with soothing heat function.',
    price: 65000,
    originalPrice: 80000,
    sellerId: 's1',
    sellerName: 'Tech Store Mw',
    category: 'Health & Personal Care',
    images: [
      'https://images.unsplash.com/photo-1544161515-4ab6ce6db874?w=800&q=80',
      'https://images.unsplash.com/photo-1559591937-e58cf18f5227?w=800&q=80',
      'https://images.unsplash.com/photo-1576091160399-112ba8d25d1d?w=800&q=80',
      'https://images.unsplash.com/photo-1584036561566-baf8f5f1b144?w=800&q=80',
      'https://images.unsplash.com/photo-1584308666744-24d5c474f2ae?w=800&q=80'
    ],
    stock: 15,
    rating: 4.9,
    reviewsCount: 104,
    isVerifiedSeller: true,
  },
  {
    id: 'p54',
    name: 'Multivitamin Softgels (60 Count)',
    description: 'Essential daily vitamins and minerals for energy and immunity.',
    price: 22000,
    sellerId: 's2',
    sellerName: 'Fashion Hub',
    category: 'Health & Personal Care',
    images: [
      'https://images.unsplash.com/photo-1584308666744-24d5c474f2ae?w=800&q=80',
      'https://images.unsplash.com/photo-1559591937-e58cf18f5227?w=800&q=80',
      'https://images.unsplash.com/photo-1576091160399-112ba8d25d1d?w=800&q=80',
      'https://images.unsplash.com/photo-1584036561566-baf8f5f1b144?w=800&q=80',
      'https://images.unsplash.com/photo-1544161515-4ab6ce6db874?w=800&q=80'
    ],
    stock: 60,
    rating: 4.8,
    reviewsCount: 140,
    isVerifiedSeller: false,
  },
  {
    id: 'p55',
    name: 'Compact First Aid Kit (100 Pieces)',
    description: 'Emergency medical supplies pouch for home, car, or travel.',
    price: 28000,
    sellerId: 's2',
    sellerName: 'Fashion Hub',
    category: 'Health & Personal Care',
    images: [
      'https://images.unsplash.com/photo-1603398938378-e54eab446dde?w=800&q=80',
      'https://images.unsplash.com/photo-1559591937-e58cf18f5227?w=800&q=80',
      'https://images.unsplash.com/photo-1576091160399-112ba8d25d1d?w=800&q=80',
      'https://images.unsplash.com/photo-1584036561566-baf8f5f1b144?w=800&q=80',
      'https://images.unsplash.com/photo-1544161515-4ab6ce6db874?w=800&q=80'
    ],
    stock: 35,
    rating: 4.7,
    reviewsCount: 58,
    isVerifiedSeller: false,
  },

  // --- GROCERIES (6 products) ---
  {
    id: 'p8',
    name: 'Organic Honey (500g)',
    description: 'Pure, raw organic honey sourced locally from local farmers.',
    price: 15000,
    originalPrice: 18000,
    sellerId: 's2',
    sellerName: 'Fashion Hub',
    category: 'Groceries',
    images: [
      'https://images.unsplash.com/photo-1587049352847-4d4554abde95?w=800&q=80',
      'https://images.unsplash.com/photo-1586201375761-83865001e31c?w=800&q=80',
      'https://images.unsplash.com/photo-1474979266404-7eaacbcd87c5?w=800&q=80',
      'https://images.unsplash.com/photo-1599599810769-bcde5a160d32?w=800&q=80',
      'https://images.unsplash.com/photo-1576092768241-dec231879fc3?w=800&q=80'
    ],
    stock: 120,
    rating: 4.8,
    reviewsCount: 42,
    isVerifiedSeller: false,
  },
  {
    id: 'p56',
    name: 'Premium Kilombero Rice (10kg)',
    description: 'Aromatic long-grain white rice grown in fertile soils.',
    price: 28000,
    sellerId: 's2',
    sellerName: 'Fashion Hub',
    category: 'Groceries',
    images: [
      'https://images.unsplash.com/photo-1586201375761-83865001e31c?w=800&q=80',
      'https://images.unsplash.com/photo-1587049352847-4d4554abde95?w=800&q=80',
      'https://images.unsplash.com/photo-1474979266404-7eaacbcd87c5?w=800&q=80',
      'https://images.unsplash.com/photo-1599599810769-bcde5a160d32?w=800&q=80',
      'https://images.unsplash.com/photo-1576092768241-dec231879fc3?w=800&q=80'
    ],
    stock: 80,
    rating: 4.9,
    reviewsCount: 165,
    isVerifiedSeller: false,
  },
  {
    id: 'p57',
    name: 'Pure Extra Virgin Olive Oil (1L)',
    description: 'Cold-pressed extra virgin olive oil ideal for cooking & salads.',
    price: 24000,
    sellerId: 's2',
    sellerName: 'Fashion Hub',
    category: 'Groceries',
    images: [
      'https://images.unsplash.com/photo-1474979266404-7eaacbcd87c5?w=800&q=80',
      'https://images.unsplash.com/photo-1587049352847-4d4554abde95?w=800&q=80',
      'https://images.unsplash.com/photo-1586201375761-83865001e31c?w=800&q=80',
      'https://images.unsplash.com/photo-1599599810769-bcde5a160d32?w=800&q=80',
      'https://images.unsplash.com/photo-1576092768241-dec231879fc3?w=800&q=80'
    ],
    stock: 50,
    rating: 4.8,
    reviewsCount: 89,
    isVerifiedSeller: false,
  },
  {
    id: 'p58',
    name: 'Roasted Whole Macadamia Nuts (250g)',
    description: 'Crispy lightly salted macadamia nuts rich in healthy fats.',
    price: 16000,
    sellerId: 's2',
    sellerName: 'Fashion Hub',
    category: 'Groceries',
    images: [
      'https://images.unsplash.com/photo-1599599810769-bcde5a160d32?w=800&q=80',
      'https://images.unsplash.com/photo-1587049352847-4d4554abde95?w=800&q=80',
      'https://images.unsplash.com/photo-1586201375761-83865001e31c?w=800&q=80',
      'https://images.unsplash.com/photo-1474979266404-7eaacbcd87c5?w=800&q=80',
      'https://images.unsplash.com/photo-1576092768241-dec231879fc3?w=800&q=80'
    ],
    stock: 90,
    rating: 4.9,
    reviewsCount: 78,
    isVerifiedSeller: false,
  },
  {
    id: 'p59',
    name: 'Premium Malawian Black Tea (500g)',
    description: 'Rich full-bodied loose leaf black tea from Thyolo tea estates.',
    price: 12000,
    sellerId: 's2',
    sellerName: 'Fashion Hub',
    category: 'Groceries',
    images: [
      'https://images.unsplash.com/photo-1576092768241-dec231879fc3?w=800&q=80',
      'https://images.unsplash.com/photo-1587049352847-4d4554abde95?w=800&q=80',
      'https://images.unsplash.com/photo-1586201375761-83865001e31c?w=800&q=80',
      'https://images.unsplash.com/photo-1474979266404-7eaacbcd87c5?w=800&q=80',
      'https://images.unsplash.com/photo-1599599810769-bcde5a160d32?w=800&q=80'
    ],
    stock: 150,
    rating: 5.0,
    reviewsCount: 210,
    isVerifiedSeller: false,
  },
  {
    id: 'p60',
    name: 'Organic Whole Coffee Beans (1kg)',
    description: 'Medium roast Arabica single-origin coffee beans with chocolate notes.',
    price: 32000,
    sellerId: 's2',
    sellerName: 'Fashion Hub',
    category: 'Groceries',
    images: [
      'https://images.unsplash.com/photo-1559056199-641a0ac8b55e?w=800&q=80',
      'https://images.unsplash.com/photo-1587049352847-4d4554abde95?w=800&q=80',
      'https://images.unsplash.com/photo-1586201375761-83865001e31c?w=800&q=80',
      'https://images.unsplash.com/photo-1474979266404-7eaacbcd87c5?w=800&q=80',
      'https://images.unsplash.com/photo-1599599810769-bcde5a160d32?w=800&q=80'
    ],
    stock: 40,
    rating: 4.8,
    reviewsCount: 115,
    isVerifiedSeller: false,
  },

  // --- PHONE ACCESSORIES (6 products) ---
  {
    id: 'p61',
    name: 'MagSafe Wireless Fast Charging Stand',
    description: '15W magnetic wireless charger with aluminum desktop stand.',
    price: 35000,
    originalPrice: 42000,
    sellerId: 's1',
    sellerName: 'Tech Store Mw',
    category: 'Phone Accessories',
    images: [
      'https://images.unsplash.com/photo-1586953208448-b95a79798f07?w=800&q=80',
      'https://images.unsplash.com/photo-1601784551446-20c9e07cdbdb?w=800&q=80',
      'https://images.unsplash.com/photo-1541877944-ac82a091518a?w=800&q=80',
      'https://images.unsplash.com/photo-1584438784894-089d6a62b8fa?w=800&q=80',
      'https://images.unsplash.com/photo-1583863788434-e58a36330cf0?w=800&q=80'
    ],
    stock: 35,
    rating: 4.8,
    reviewsCount: 94,
    isVerifiedSeller: true,
  },
  {
    id: 'p62',
    name: 'Tempered Glass Screen Protector (3-Pack)',
    description: '9H hardness anti-scratch bubble-free ultra-clear tempered glass.',
    price: 12000,
    sellerId: 's1',
    sellerName: 'Tech Store Mw',
    category: 'Phone Accessories',
    images: [
      'https://images.unsplash.com/photo-1601784551446-20c9e07cdbdb?w=800&q=80',
      'https://images.unsplash.com/photo-1586953208448-b95a79798f07?w=800&q=80',
      'https://images.unsplash.com/photo-1541877944-ac82a091518a?w=800&q=80',
      'https://images.unsplash.com/photo-1584438784894-089d6a62b8fa?w=800&q=80',
      'https://images.unsplash.com/photo-1583863788434-e58a36330cf0?w=800&q=80'
    ],
    stock: 100,
    rating: 4.7,
    reviewsCount: 142,
    isVerifiedSeller: true,
  },
  {
    id: 'p63',
    name: 'Shockproof Armor Clear Phone Case',
    description: 'Military-grade drop protection translucent magnetic case.',
    price: 18000,
    sellerId: 's1',
    sellerName: 'Tech Store Mw',
    category: 'Phone Accessories',
    images: [
      'https://images.unsplash.com/photo-1541877944-ac82a091518a?w=800&q=80',
      'https://images.unsplash.com/photo-1586953208448-b95a79798f07?w=800&q=80',
      'https://images.unsplash.com/photo-1601784551446-20c9e07cdbdb?w=800&q=80',
      'https://images.unsplash.com/photo-1584438784894-089d6a62b8fa?w=800&q=80',
      'https://images.unsplash.com/photo-1583863788434-e58a36330cf0?w=800&q=80'
    ],
    stock: 60,
    rating: 4.6,
    reviewsCount: 88,
    isVerifiedSeller: true,
  },
  {
    id: 'p64',
    name: 'Adjustable Metal Desktop Phone Holder',
    description: 'Foldable aluminum smartphone and tablet stand with non-slip pads.',
    price: 15000,
    sellerId: 's1',
    sellerName: 'Tech Store Mw',
    category: 'Phone Accessories',
    images: [
      'https://images.unsplash.com/photo-1584438784894-089d6a62b8fa?w=800&q=80',
      'https://images.unsplash.com/photo-1586953208448-b95a79798f07?w=800&q=80',
      'https://images.unsplash.com/photo-1601784551446-20c9e07cdbdb?w=800&q=80',
      'https://images.unsplash.com/photo-1541877944-ac82a091518a?w=800&q=80',
      'https://images.unsplash.com/photo-1583863788434-e58a36330cf0?w=800&q=80'
    ],
    stock: 45,
    rating: 4.9,
    reviewsCount: 110,
    isVerifiedSeller: true,
  },
  {
    id: 'p65',
    name: 'Heavy-Duty Braided USB-C Fast Cable (2m)',
    description: 'Durable 60W nylon braided USB-C fast charging data cable.',
    price: 10000,
    sellerId: 's1',
    sellerName: 'Tech Store Mw',
    category: 'Phone Accessories',
    images: [
      'https://images.unsplash.com/photo-1583863788434-e58a36330cf0?w=800&q=80',
      'https://images.unsplash.com/photo-1586953208448-b95a79798f07?w=800&q=80',
      'https://images.unsplash.com/photo-1601784551446-20c9e07cdbdb?w=800&q=80',
      'https://images.unsplash.com/photo-1541877944-ac82a091518a?w=800&q=80',
      'https://images.unsplash.com/photo-1584438784894-089d6a62b8fa?w=800&q=80'
    ],
    stock: 80,
    rating: 4.8,
    reviewsCount: 165,
    isVerifiedSeller: true,
  },
  {
    id: 'p66',
    name: 'Magnetic Car Phone Mount & Air Vent Clip',
    description: 'Strong magnet car phone holder 360 degree rotation air vent mount.',
    price: 16000,
    originalPrice: 20000,
    sellerId: 's1',
    sellerName: 'Tech Store Mw',
    category: 'Phone Accessories',
    images: [
      'https://images.unsplash.com/photo-1585338107529-13afc5f02586?w=800&q=80',
      'https://images.unsplash.com/photo-1586953208448-b95a79798f07?w=800&q=80',
      'https://images.unsplash.com/photo-1601784551446-20c9e07cdbdb?w=800&q=80',
      'https://images.unsplash.com/photo-1541877944-ac82a091518a?w=800&q=80',
      'https://images.unsplash.com/photo-1584438784894-089d6a62b8fa?w=800&q=80'
    ],
    stock: 40,
    rating: 4.7,
    reviewsCount: 76,
    isVerifiedSeller: true,
  },
];


export const CATEGORY_IMAGE_POOLS: Record<string, string[]> = {
  Electronics: [
    'https://images.unsplash.com/photo-1511707171634-5f897ff02aa9?w=800&q=80',
    'https://images.unsplash.com/photo-1505740420928-5e560c06d30e?w=800&q=80',
    'https://images.unsplash.com/photo-1546868871-7041f2a55e12?w=800&q=80',
    'https://images.unsplash.com/photo-1527443195645-1133f7f28990?w=800&q=80',
    'https://images.unsplash.com/photo-1595225476474-87563907a212?w=800&q=80',
    'https://images.unsplash.com/photo-1516035069371-29a1b244cc32?w=800&q=80',
  ],
  Fashion: [
    'https://images.unsplash.com/photo-1542291026-7eec264c27ff?w=800&q=80',
    'https://images.unsplash.com/photo-1511499767150-a48a237f0083?w=800&q=80',
    'https://images.unsplash.com/photo-1553062407-98eeb64c6a62?w=800&q=80',
    'https://images.unsplash.com/photo-1548036328-c9fa89d128fa?w=800&q=80',
    'https://images.unsplash.com/photo-1576995853123-5a10305d93c0?w=800&q=80',
  ],
  'Home & Kitchen': [
    'https://images.unsplash.com/photo-1583847268964-b28dc8f51f92?w=800&q=80',
    'https://images.unsplash.com/photo-1612196808214-b8e1d6145a8c?w=800&q=80',
    'https://images.unsplash.com/photo-1514432324607-a09d9b4aefdd?w=800&q=80',
    'https://images.unsplash.com/photo-1584992236310-6edddc08acff?w=800&q=80',
    'https://images.unsplash.com/photo-1585515320310-259814833e62?w=800&q=80',
  ],
  Beauty: [
    'https://images.unsplash.com/photo-1620916566398-39f1143ab7be?w=800&q=80',
    'https://images.unsplash.com/photo-1598440947619-2c35fc9aa908?w=800&q=80',
    'https://images.unsplash.com/photo-1586495777744-4413f21062fa?w=800&q=80',
    'https://images.unsplash.com/photo-1608248597261-83325805435f?w=800&q=80',
    'https://images.unsplash.com/photo-1608248543803-ba4f8c70ae0b?w=800&q=80',
  ],
  General: [
    'https://images.unsplash.com/photo-1526738549149-8e07eca6c147?w=800&q=80',
    'https://images.unsplash.com/photo-1505740420928-5e560c06d30e?w=800&q=80',
    'https://images.unsplash.com/photo-1542291026-7eec264c27ff?w=800&q=80',
    'https://images.unsplash.com/photo-1583847268964-b28dc8f51f92?w=800&q=80',
    'https://images.unsplash.com/photo-1532012197267-da84d127e765?w=800&q=80',
  ],
};

export function ensureFiveImages<T extends { category?: string; images?: string[] }>(product: T): T {
  if (!product) return product;
  const existing = Array.isArray(product.images) ? product.images.filter((img) => typeof img === 'string' && img.trim().length > 0) : [];
  
  if (existing.length >= 5) {
    return { ...product, images: existing };
  }

  const mainImg = existing[0] || 'https://images.unsplash.com/photo-1526738549149-8e07eca6c147?w=800&q=80';
  const pool = CATEGORY_IMAGE_POOLS[product.category || 'General'] || CATEGORY_IMAGE_POOLS.General;

  const result = [...existing];
  let poolIdx = 0;
  while (result.length < 5) {
    const candidate = pool[poolIdx % pool.length];
    if (!result.includes(candidate)) {
      result.push(candidate);
    } else {
      result.push();
    }
    poolIdx++;
  }

  return {
    ...product,
    images: result,
  };
}
