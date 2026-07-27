import { useEffect, useState } from 'react';

export const money = (n) => `$${Number(n || 0).toFixed(2)}`;
export const today = () => new Date().toISOString().split('T')[0];

export function useLocalStorage(key, initialValue) {
  const [value, setValue] = useState(() => {
    try {
      const saved = localStorage.getItem(key);
      return saved ? JSON.parse(saved) : initialValue;
    } catch {
      return initialValue;
    }
  });
  useEffect(() => localStorage.setItem(key, JSON.stringify(value)), [key, value]);
  return [value, setValue];
}

export function useToast(ms = 3000) {
  const [message, setMessage] = useState(null);
  const showToast = (msg) => {
    setMessage(msg);
    setTimeout(() => setMessage(null), ms);
  };
  return [message, showToast];
}

export const CATEGORIES = ['All', 'Appetizers', 'Mains', 'Drinks', 'Desserts', 'Kids'];
export const DIETARY_FILTERS = ['All', 'Vegetarian', 'Vegan', 'Gluten-Free'];
export const DIETARY_OPTIONS = ['Vegetarian', 'Vegan', 'Gluten-Free'];
export const ORDER_STATUSES = ['Preparing', 'Ready', 'Delivered', 'Cancelled'];
export const STAFF_TABS = [
  ['orders', 'Orders & Details'],
  ['menu', 'Menu CRUD'],
  ['promos', 'Promo Codes'],
  ['analytics', 'Revenue & Reviews']
];

export const EMPTY_DISH = {
  name: '',
  price: '',
  category: 'Mains',
  description: '',
  dietaryTags: [],
  ingredientsAvailable: 10,
  isAvailable: true,
  image: '/breadsticks.jpg'
};

const dish = (id, name, description, price, category, dietaryTags, ingredientsAvailable, image) => ({
  id,
  name,
  description,
  price,
  category,
  dietaryTags,
  isAvailable: true,
  ingredientsAvailable,
  image
});

export const INITIAL_DISHES = [
  dish(1, 'Breadsticks', 'Warm soft breadsticks served with marinara.', 5.99, 'Appetizers', ['Vegetarian'], 20, '/breadsticks.jpg'),
  dish(2, 'Breadsticks (Gluten-Free)', 'Gluten-free breadsticks served with marinara.', 6.99, 'Appetizers', ['Vegetarian', 'Gluten-Free'], 12, '/breadsticks.jpg'),
  dish(3, 'Spaghetti and Meatballs', 'Classic spaghetti topped with house meatballs and marinara.', 14.99, 'Mains', [], 18, '/spaghetti-and-meatballs.jpg'),
  dish(4, 'Spaghetti and Meatballs (Gluten-Free)', 'Gluten-free spaghetti topped with house meatballs and marinara.', 15.99, 'Mains', ['Gluten-Free'], 10, '/spaghetti-and-meatballs.jpg'),
  dish(5, 'Lasagna', 'Layered pasta with meat sauce, ricotta, and mozzarella.', 15.49, 'Mains', [], 14, '/lasagna.jpg'),
  dish(6, 'Lasagna (Gluten-Free)', 'Gluten-free layered pasta with meat sauce, ricotta, and mozzarella.', 16.49, 'Mains', ['Gluten-Free'], 8, '/lasagna.jpg'),
  dish(7, 'Fanta', 'Chilled orange Fanta.', 2.99, 'Drinks', [], 30, '/fanta.jpg'),
  dish(8, 'Cherry Coke', 'Chilled cherry Coca-Cola.', 2.99, 'Drinks', [], 30, '/cherry-coke.jpg'),
  dish(9, 'Lemonade', 'Fresh-squeezed classic lemonade.', 3.49, 'Drinks', [], 25, '/lemonade.jpg'),
  dish(10, 'Strawberry Lemonade', 'Fresh lemonade blended with strawberry puree.', 3.99, 'Drinks', [], 25, '/strawberry-lemonade.jpg'),
  dish(11, 'Cheesecake', 'Creamy New York–style cheesecake.', 6.99, 'Desserts', ['Vegetarian'], 10, '/cheesecake.jpg'),
  dish(12, 'Kids Chicken Tenders and Fries', 'Crispy chicken tenders with a side of fries. Kids portion.', 7.99, 'Kids', [], 15, '/kids-chicken-tenders.avif'),
  dish(13, 'Kids Mac and Cheese', 'Creamy macaroni and cheese. Kids portion.', 6.99, 'Kids', ['Vegetarian'], 15, '/kids-mac-and-cheese.jpg')
];

export const INITIAL_ORDERS = [
  {
    id: 'ORD-100101',
    guestName: 'Sample Guest',
    phone: '(555) 010-0101',
    email: 'guest@example.com',
    orderType: 'Delivery',
    address: '12 Oak Street',
    paymentMethod: 'Credit Card',
    items: [{ name: 'Spaghetti and Meatballs', quantity: 1, price: 14.99 }],
    total: 14.99,
    status: 'Preparing',
    date: today()
  }
];

export const INITIAL_PROMOS = [
  { code: 'discount10', discountPercent: 10, expiration: '2026-12-31', isActive: true, usedBy: [] },
  { code: 'discount20', discountPercent: 20, expiration: '2026-12-31', isActive: true, usedBy: ['alreadyused@example.com'] }
];

export const INITIAL_REVIEWS = [
  { id: 1, dishName: 'Lasagna', rating: 2, comment: 'Too salty and small portion.', customerName: 'Spongebob.', date: '2026-07-20' },
  { id: 2, dishName: 'Strawberry Lemonade', rating: 5, comment: 'Perfectly balanced and refreshing.', customerName: 'Patrick.', date: '2026-07-21' },
  { id: 3, dishName: 'Spaghetti and Meatballs', rating: 3, comment: 'Sauce was a bit watery.', customerName: 'Sandy.', date: '2026-07-22' }
];
