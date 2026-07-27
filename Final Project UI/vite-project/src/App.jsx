import { useMemo, useState } from 'react';
import {
  CATEGORIES,
  DIETARY_FILTERS,
  INITIAL_DISHES,
  INITIAL_ORDERS,
  INITIAL_PROMOS,
  INITIAL_REVIEWS,
  useLocalStorage,
  useToast
} from './data';
import Header from './components/Header';
import DishCard from './components/DishCard';
import CartDrawer from './components/CartDrawer';
import Checkout from './components/Checkout.jsx';
import OrderSuccess from './components/OrderSuccess.jsx';
import Review from './components/Review.jsx';
import OrderTracker from './components/OrderTracker';
import StaffPortal from './components/StaffPortal';
import Toast from './components/Toast';
import './styles.css';

function ChipRow({ options, selected, onSelect, labelMap, className = '' }) {
  return (
    <div className={`chip-row ${className}`.trim()}>
      {options.map((opt) => (
        <button
          key={opt}
          type="button"
          className={`chip-btn ${selected === opt ? 'active' : ''}`}
          onClick={() => onSelect(opt)}
        >
          {labelMap?.[opt] ?? opt}
        </button>
      ))}
    </div>
  );
}

export default function App() {
  const [activeView, setActiveView] = useState('menu');
  const [dishes, setDishes] = useState(INITIAL_DISHES);
  const [orders, setOrders] = useLocalStorage('restaurant_orders', INITIAL_ORDERS);
  const [cart, setCart] = useLocalStorage('restaurant_cart', []);
  const [promoCodes, setPromoCodes] = useState(INITIAL_PROMOS);
  const [reviews, setReviews] = useState(INITIAL_REVIEWS);
  const [toastMessage, showToast] = useToast();
  const [isCartOpen, setIsCartOpen] = useState(false);
  const [isCheckoutOpen, setIsCheckoutOpen] = useState(false);
  const [isReviewOpen, setIsReviewOpen] = useState(false);
  const [latestOrder, setLatestOrder] = useState(null);
  const [trackPrefill, setTrackPrefill] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('All');
  const [selectedDietary, setSelectedDietary] = useState('All');

  const filteredDishes = useMemo(
    () =>
      dishes.filter((d) => {
        const catOk = selectedCategory === 'All' || d.category === selectedCategory;
        const dietOk =
          selectedDietary === 'All' || (d.dietaryTags || []).includes(selectedDietary);
        return catOk && dietOk;
      }),
    [dishes, selectedCategory, selectedDietary]
  );

  const handleAddToCart = (dish) => {
    if (!dish.isAvailable || (dish.ingredientsAvailable ?? 0) <= 0) {
      showToast(`Cannot add ${dish.name}: insufficient ingredients.`);
      return;
    }
    setCart((prev) => {
      const idx = prev.findIndex((i) => i.id === dish.id);
      if (idx > -1) {
        const copy = [...prev];
        copy[idx] = { ...copy[idx], quantity: copy[idx].quantity + 1 };
        return copy;
      }
      return [...prev, { ...dish, quantity: 1 }];
    });
    showToast(`Added ${dish.name} to cart!`);
  };

  const handleCompleteOrder = (newOrder) => {
    setDishes((prev) =>
      prev.map((dish) => {
        const ordered = newOrder.items.find((i) => i.id === dish.id);
        if (!ordered) return dish;
        const remaining = Math.max(0, (dish.ingredientsAvailable ?? 0) - ordered.quantity);
        return {
          ...dish,
          ingredientsAvailable: remaining,
          isAvailable: remaining > 0 && dish.isAvailable
        };
      })
    );
    setOrders((prev) => [newOrder, ...prev]);
    setCart([]);
    setIsCheckoutOpen(false);
    setIsCartOpen(false);
    if (newOrder.promoCodeUsed) {
      setPromoCodes((prev) =>
        prev.map((p) =>
          p.code.toUpperCase() === newOrder.promoCodeUsed.toUpperCase()
            ? { ...p, usedBy: [...(p.usedBy || []), (newOrder.email || '').toLowerCase()] }
            : p
        )
      );
    }
    setLatestOrder(newOrder);
  };

  const totalCartCount = cart.reduce((sum, item) => sum + item.quantity, 0);

  return (
    <div>
      <Header
        totalCartCount={totalCartCount}
        onOpenCart={() => setIsCartOpen(true)}
        activeView={activeView}
        setActiveView={setActiveView}
      />

      {activeView === 'menu' && (
        <div className="page-shell">
          <div className="menu-toolbar">
            <div>
              <ChipRow className="spaced" options={CATEGORIES} selected={selectedCategory} onSelect={setSelectedCategory} />
              <ChipRow
                options={DIETARY_FILTERS}
                selected={selectedDietary}
                onSelect={setSelectedDietary}
                labelMap={{ All: 'All Food Types' }}
              />
            </div>
            <button type="button" className="review-cta" onClick={() => setIsReviewOpen(true)}>
              Rate & Review Dishes
            </button>
          </div>
          <main className="dish-grid">
            {filteredDishes.length === 0 ? (
              <p className="text-muted">No dishes match your filters.</p>
            ) : (
              filteredDishes.map((dish) => (
                <DishCard key={dish.id} dish={dish} onAddToCart={handleAddToCart} />
              ))
            )}
          </main>
        </div>
      )}

      {activeView === 'track' && <OrderTracker orders={orders} initialTrackingId={trackPrefill} />}

      {activeView === 'staff' && (
        <StaffPortal
          dishes={dishes}
          onAddDish={(d) => setDishes((prev) => [...prev, d])}
          onUpdateDish={(updated) =>
            setDishes((prev) => prev.map((d) => (d.id === updated.id ? updated : d)))
          }
          onDeleteDish={(id) => setDishes((prev) => prev.filter((d) => d.id !== id))}
          orders={orders}
          onUpdateOrderStatus={(id, status) =>
            setOrders((prev) => prev.map((o) => (o.id === id ? { ...o, status } : o)))
          }
          promoCodes={promoCodes}
          onAddPromo={(p) => setPromoCodes((prev) => [...prev, p])}
          onTogglePromo={(code) =>
            setPromoCodes((prev) =>
              prev.map((p) =>
                p.code.toUpperCase() === code.toUpperCase() ? { ...p, isActive: !p.isActive } : p
              )
            )
          }
          reviews={reviews}
        />
      )}

      <Toast message={toastMessage} />
      <CartDrawer
        isOpen={isCartOpen}
        onClose={() => setIsCartOpen(false)}
        cart={cart}
        onUpdateQuantity={(id, amt) =>
          setCart((prev) =>
            prev
              .map((item) => (item.id === id ? { ...item, quantity: item.quantity + amt } : item))
              .filter((item) => item.quantity > 0)
          )
        }
        onRemoveItem={(id) => setCart((prev) => prev.filter((i) => i.id !== id))}
        onProceedToCheckout={() => setIsCheckoutOpen(true)}
      />
      <Checkout
        isOpen={isCheckoutOpen}
        onClose={() => setIsCheckoutOpen(false)}
        cart={cart}
        authenticatedPromos={promoCodes}
        onCompleteOrder={handleCompleteOrder}
      />
      <OrderSuccess
        order={latestOrder}
        onClose={() => setLatestOrder(null)}
        onTrackOrder={(id) => {
          setTrackPrefill(id || latestOrder?.id || '');
          setLatestOrder(null);
          setActiveView('track');
        }}
      />
      <Review
        isOpen={isReviewOpen}
        onClose={() => setIsReviewOpen(false)}
        dishes={dishes}
        onSubmitReview={(review) => {
          setReviews((prev) => [review, ...prev]);
          showToast('Thank you for your review!');
        }}
      />
    </div>
  );
}
