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

export const CATEGORIES = ['Appetizers', 'Mains', 'Drinks', 'Desserts', 'Kids'];
export const DIETARY_FILTERS = ['All', 'Vegetarian', 'Vegan', 'Gluten-Free'];
export const DIETARY_OPTIONS = ['Vegetarian', 'Vegan', 'Gluten-Free'];
export const ORDER_STATUSES = ['Preparing', 'Ready', 'Delivered', 'Cancelled'];
export const STAFF_TABS = [
  ['orders', 'Orders & Details'],
  ['menu', 'Menu CRUD'],
  ['ingredients', 'Ingredients'],
  ['promos', 'Promo Codes'],
  ['analytics', 'Revenue & Reviews']
];

export const EMPTY_DISH = {
  name: '',
  price: '',
  category: 'Mains',
  description: '',
  dietaryTags: []
};

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
