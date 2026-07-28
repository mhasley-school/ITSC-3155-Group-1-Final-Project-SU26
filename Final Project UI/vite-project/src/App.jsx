import { useEffect, useMemo, useState } from 'react';
import {
  CATEGORIES,
  DIETARY_FILTERS,
  INITIAL_ORDERS,
  INITIAL_PROMOS,
  useLocalStorage,
  useToast
} from './data';
import * as api from './api';
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

function ChipRow({ options, selected, onSelect, className = '' }) {
  return (
    <div className={`chip-row ${className}`.trim()}>
      {options.map((opt) => (
        <button
          key={opt}
          type="button"
          className={`chip-btn ${selected === opt ? 'active' : ''}`}
          onClick={() => onSelect(opt)}
        >
          {opt}
        </button>
      ))}
    </div>
  );
}

function mapApiOrder(o) {
  return {
    id: o.tracking_number,
    dbId: o.id,
    guestName: 'Guest',
    phone: '',
    email: '',
    orderType: o.order_type,
    address: '',
    paymentMethod: '—',
    items: (o.order_items || []).map((i) => ({
      id: i.menu_item_id,
      name: `Item #${i.menu_item_id}`,
      quantity: i.quantity,
      price: i.unit_price
    })),
    total: o.total_price,
    status: o.order_status === 'Pending' ? 'Preparing' : o.order_status,
    date: (o.order_date || '').slice(0, 10)
  };
}

export default function App() {
  const [activeView, setActiveView] = useState('menu');
  const [dishes, setDishes] = useState([]);
  const [orders, setOrders] = useState(INITIAL_ORDERS);
  const [cart, setCart] = useLocalStorage('restaurant_cart', []);
  const [promoCodes, setPromoCodes] = useState(INITIAL_PROMOS);
  const [reviews, setReviews] = useState([]);
  const [toastMessage, showToast] = useToast();
  const [isCartOpen, setIsCartOpen] = useState(false);
  const [isCheckoutOpen, setIsCheckoutOpen] = useState(false);
  const [isReviewOpen, setIsReviewOpen] = useState(false);
  const [latestOrder, setLatestOrder] = useState(null);
  const [trackPrefill, setTrackPrefill] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('All');
  const [selectedDietary, setSelectedDietary] = useState('All');
  const [ingredients, setIngredients] = useState([]);

  useEffect(() => {
    let cancelled = false;

    async function loadAll() {
      let menu = [];
      try {
        menu = await api.getMenu();
        if (!cancelled) setDishes(menu);
      } catch (e) {
        if (!cancelled) showToast(`Could not load menu: ${e.message}`);
      }

      try {
        const rows = await api.getReviews();
        if (!cancelled) setReviews(rows.map((r) => api.toReview(r, menu)));
      } catch (e) {
        if (!cancelled) showToast(`Could not load reviews: ${e.message}`);
      }

      try {
        const rows = await api.getOrders();
        if (!cancelled) setOrders(rows.map(mapApiOrder));
      } catch {}

      try {
        const rows = await api.getIngredients();
        if (!cancelled) setIngredients(rows);
      } catch {}
    }

    loadAll();
    return () => {
      cancelled = true;
    };
  }, [activeView]);

  const filteredDishes = useMemo(
    () =>
      dishes.filter((d) => {
        const catOk =
          selectedCategory === 'All' ||
          (d.category || '').toLowerCase() === selectedCategory.toLowerCase();
        const dietOk =
          selectedDietary === 'All' ||
          (d.dietaryTags || []).includes(selectedDietary);
        return catOk && dietOk;
      }),
    [dishes, selectedCategory, selectedDietary]
  );

  const handleAddToCart = (dish) => {
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

  const handleCompleteOrder = async (formOrder) => {
    try {
      const created = await api.placeOrder(formOrder);
      const uiOrder = {
        ...mapApiOrder(created),
        guestName: formOrder.guestName,
        phone: formOrder.phone,
        email: formOrder.email,
        address: formOrder.address,
        paymentMethod: formOrder.paymentMethod,
        items: formOrder.items,
        promoCodeUsed: formOrder.promoCodeUsed
      };
      setOrders((prev) => [uiOrder, ...prev]);
      setCart([]);
      setIsCheckoutOpen(false);
      setIsCartOpen(false);
      setLatestOrder(uiOrder);
      showToast('Order placed!');
    } catch (e) {
      const msg = e.message || '';
      if (/insufficient ingredient/i.test(msg)) {
        showToast('Order blocked: insufficient ingredients to fulfill this order.');
      } else {
        showToast(`Checkout failed: ${msg}`);
      }
    }
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
              <ChipRow
                className="spaced"
                options={['All', ...CATEGORIES]}
                selected={selectedCategory}
                onSelect={setSelectedCategory}
              />
              <ChipRow
                options={DIETARY_FILTERS}
                selected={selectedDietary}
                onSelect={setSelectedDietary}
              />
            </div>
            <button type="button" className="review-cta" onClick={() => setIsReviewOpen(true)}>
              Rate & Review Dishes
            </button>
          </div>
          <main className="dish-grid">
            {filteredDishes.length === 0 ? (
              <p className="text-muted">
                {dishes.length === 0 ? 'No dishes yet.' : 'No dishes match the filter.'}
              </p>
            ) : (
              filteredDishes.map((dish) => (
                <DishCard key={dish.id} dish={dish} onAddToCart={handleAddToCart} />
              ))
            )}
          </main>

          <section className="reviews-section">
            <h3 className="admin-section-title">Customer Reviews</h3>
            {reviews.length === 0 ? (
              <p className="text-muted">No reviews yet.</p>
            ) : (
              <ul className="review-list">
                {reviews.map((rev) => (
                  <li key={rev.id} className="panel review-item">
                    <div className="between">
                      <strong>{rev.dishName}</strong>
                      <span className="badge">★ {rev.rating}</span>
                    </div>
                    <p className="text-sm text-muted" style={{ margin: '4px 0' }}>
                      {rev.customerName}
                    </p>
                    <p className="text-sm" style={{ margin: 0 }}>
                      {rev.comment || 'No comment'}
                    </p>
                  </li>
                ))}
              </ul>
            )}
          </section>
        </div>
      )}

      {activeView === 'track' && <OrderTracker initialTrackingId={trackPrefill} />}

      {activeView === 'staff' && (
        <StaffPortal
          dishes={dishes}
          ingredients={ingredients}
          onUpdateIngredient={async (id, data) => {
            try {
              const saved = await api.updateIngredient(id, data);
              setIngredients((prev) => prev.map((i) => (i.id === saved.id ? saved : i)));
              showToast('Ingredient stock updated.');
            } catch (e) {
              showToast(e.message);
            }
          }}
          onFilterOrdersByDate={async (start, end) => {
            try {
              if (!start || !end) {
                const rows = await api.getOrders();
                setOrders(rows.map(mapApiOrder));
                return;
              }
              const rows = await api.getOrdersByDateRange(start, end);
              setOrders(rows.map(mapApiOrder));
            } catch (e) {
              showToast(`Could not filter orders: ${e.message}`);
            }
          }}
          onAddDish={async (d) => {
            try {
              const created = await api.createMenuItem(d);
              setDishes((prev) => [...prev, created]);
            } catch (e) {
              showToast(e.message);
            }
          }}
          onUpdateDish={async (updated) => {
            try {
              const saved = await api.updateMenuItem(updated.id, updated);
              setDishes((prev) => prev.map((d) => (d.id === saved.id ? saved : d)));
            } catch (e) {
              showToast(e.message);
            }
          }}
          onDeleteDish={async (id) => {
            try {
              await api.deleteMenuItem(id);
              setDishes((prev) => prev.filter((d) => d.id !== id));
            } catch (e) {
              showToast(e.message);
            }
          }}
          orders={orders}
          onUpdateOrderStatus={async (trackingId, status) => {
            const order = orders.find((o) => o.id === trackingId);
            if (!order?.dbId) return;
            try {
              await api.updateOrderStatus(order.dbId, status);
              setOrders((prev) =>
                prev.map((o) => (o.id === trackingId ? { ...o, status } : o))
              );
            } catch (e) {
              showToast(e.message);
            }
          }}
          promoCodes={promoCodes}
          onAddPromo={(p) => setPromoCodes((prev) => [...prev, p])}
          onTogglePromo={(code) =>
            setPromoCodes((prev) =>
              prev.map((p) =>
                p.code.toUpperCase() === code.toUpperCase()
                  ? { ...p, isActive: !p.isActive }
                  : p
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
        onSubmitReview={async (review) => {
          try {
            const created = await api.createReview({
              menuItemId: review.dishId,
              score: review.rating,
              reviewText: review.customerName
                ? `${review.customerName}: ${review.comment}`
                : review.comment
            });
            setReviews((prev) => [api.toReview(created, dishes), ...prev]);
            showToast('Thank you for your review!');
          } catch (e) {
            showToast(`Review failed: ${e.message}`);
            throw e;
          }
        }}
      />
    </div>
  );
}
