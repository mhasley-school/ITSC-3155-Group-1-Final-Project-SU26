import { useMemo, useState } from 'react';
import Modal from './Modal';
import {
  DIETARY_OPTIONS,
  EMPTY_DISH,
  ORDER_STATUSES,
  STAFF_TABS,
  money,
  today
} from '../data';

export default function StaffPortal({
  dishes,
  onAddDish,
  onUpdateDish,
  onDeleteDish,
  orders,
  onUpdateOrderStatus,
  promoCodes,
  onAddPromo,
  onTogglePromo,
  reviews
}) {
  const [tab, setTab] = useState('orders');
  const [startDate, setStartDate] = useState('');
  const [endDate, setEndDate] = useState('');
  const [selectedOrder, setSelectedOrder] = useState(null);
  const [isDishOpen, setIsDishOpen] = useState(false);
  const [editingDish, setEditingDish] = useState(null);
  const [dishForm, setDishForm] = useState({ ...EMPTY_DISH, dietaryTags: [] });
  const [newPromo, setNewPromo] = useState({ code: '', discountPercent: 10, expiration: '' });
  const [revenueDate, setRevenueDate] = useState(today());

  const lowStock = useMemo(
    () => dishes.filter((d) => (d.ingredientsAvailable ?? 0) <= 3),
    [dishes]
  );
  const filteredOrders = useMemo(
    () =>
      orders.filter((o) => (!startDate || o.date >= startDate) && (!endDate || o.date <= endDate)),
    [orders, startDate, endDate]
  );
  const dailyOrders = useMemo(
    () => orders.filter((o) => o.date === revenueDate && o.status !== 'Cancelled'),
    [orders, revenueDate]
  );
  const dishAnalysis = useMemo(() => {
    const map = {};
    reviews.forEach((rev) => {
      const key = rev.dishName || 'Unknown';
      if (!map[key]) map[key] = { name: key, totalStars: 0, count: 0, complaints: [] };
      map[key].totalStars += rev.rating;
      map[key].count += 1;
      if (rev.rating <= 2) map[key].complaints.push(rev.comment);
    });
    return Object.values(map)
      .map((d) => ({ ...d, avgRating: (d.totalStars / d.count).toFixed(1) }))
      .sort((a, b) => Number(a.avgRating) - Number(b.avgRating));
  }, [reviews]);

  const setField = (key) => (e) => {
    const value = e.target.type === 'checkbox' ? e.target.checked : e.target.value;
    setDishForm((prev) => ({ ...prev, [key]: value }));
  };

  const openDish = (dish = null) => {
    setEditingDish(dish);
    setDishForm(
      dish
        ? {
            name: dish.name,
            price: String(dish.price),
            category: dish.category,
            description: dish.description || '',
            dietaryTags: [...(dish.dietaryTags || [])],
            ingredientsAvailable: dish.ingredientsAvailable ?? 10,
            isAvailable: dish.isAvailable !== false,
            image: dish.image || EMPTY_DISH.image
          }
        : { ...EMPTY_DISH, dietaryTags: [] }
    );
    setIsDishOpen(true);
  };

  const saveDish = (e) => {
    e.preventDefault();
    const qty = parseInt(dishForm.ingredientsAvailable, 10) || 0;
    const payload = {
      ...dishForm,
      price: parseFloat(dishForm.price),
      ingredientsAvailable: qty,
      isAvailable: dishForm.isAvailable && qty > 0
    };
    if (editingDish) onUpdateDish({ ...editingDish, ...payload });
    else onAddDish({ ...payload, id: Date.now() });
    setIsDishOpen(false);
  };

  const toggleDietary = (tag) =>
    setDishForm((prev) => ({
      ...prev,
      dietaryTags: prev.dietaryTags.includes(tag)
        ? prev.dietaryTags.filter((t) => t !== tag)
        : [...prev.dietaryTags, tag]
    }));

  return (
    <div className="admin-container">
      <div className="admin-header">
        <h2>Staff & Admin Dashboard</h2>
      </div>

      {lowStock.length > 0 && (
        <div className="alert-banner">
          <h4>Insufficient ingredients alert</h4>
          <ul>
            {lowStock.map((d) => (
              <li key={d.id}>
                <strong>{d.name}</strong> has only {d.ingredientsAvailable} portion(s) left
                {d.ingredientsAvailable <= 0 ? ' — cannot fulfill new orders for this dish.' : '.'}
              </li>
            ))}
          </ul>
        </div>
      )}

      <div className="admin-tabs">
        {STAFF_TABS.map(([id, label]) => (
          <button
            key={id}
            type="button"
            className={`tab-btn ${tab === id ? 'active' : ''}`}
            onClick={() => setTab(id)}
          >
            {label}
          </button>
        ))}
      </div>

      {tab === 'orders' && (
        <div>
          <div className="filter-bar">
            <span className="text-sm" style={{ fontWeight: 700 }}>
              Date range:
            </span>
            <input type="date" className="form-input w-auto" value={startDate} onChange={(e) => setStartDate(e.target.value)} />
            <span>to</span>
            <input type="date" className="form-input w-auto" value={endDate} onChange={(e) => setEndDate(e.target.value)} />
            {(startDate || endDate) && (
              <button type="button" className="btn-cancel" onClick={() => { setStartDate(''); setEndDate(''); }}>
                Clear
              </button>
            )}
          </div>
          <table className="data-table">
            <thead>
              <tr>
                <th>Order ID</th><th>Customer</th><th>Type</th><th>Date</th><th>Total</th><th>Status</th><th>Actions</th>
              </tr>
            </thead>
            <tbody>
              {filteredOrders.length === 0 ? (
                <tr><td colSpan="7" className="text-muted" style={{ textAlign: 'center' }}>No orders found for the selected range.</td></tr>
              ) : (
                filteredOrders.map((ord) => (
                  <tr key={ord.id}>
                    <td><strong>{ord.id}</strong></td>
                    <td>{ord.guestName}</td>
                    <td>{ord.orderType}</td>
                    <td>{ord.date}</td>
                    <td>{money(ord.total)}</td>
                    <td>
                      <select className="form-input compact" value={ord.status} onChange={(e) => onUpdateOrderStatus(ord.id, e.target.value)}>
                        {ORDER_STATUSES.map((s) => <option key={s} value={s}>{s}</option>)}
                      </select>
                    </td>
                    <td>
                      <button type="button" className="btn-apply" onClick={() => setSelectedOrder(ord)}>Details</button>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
          <Modal open={!!selectedOrder} title={selectedOrder ? `Order Details: ${selectedOrder.id}` : ''} onClose={() => setSelectedOrder(null)}>
            {selectedOrder && (
              <>
                <div className="order-detail-body">
                  {[
                    ['Customer', selectedOrder.guestName],
                    ['Phone', selectedOrder.phone || '—'],
                    ['Email', selectedOrder.email || '—'],
                    ['Type', selectedOrder.orderType],
                    ['Address', selectedOrder.address || '—'],
                    ['Payment', selectedOrder.paymentMethod || '—'],
                    ['Status', selectedOrder.status]
                  ].map(([label, value]) => (
                    <p key={label}><strong>{label}:</strong> {value}</p>
                  ))}
                  {selectedOrder.promoCodeUsed && <p><strong>Promo:</strong> {selectedOrder.promoCodeUsed}</p>}
                  <hr />
                  <h4>Items Ordered</h4>
                  <ul>
                    {(selectedOrder.items || []).map((item, i) => (
                      <li key={i}>{item.quantity}x {item.name}{item.price != null ? ` (${money(item.price)})` : ''}</li>
                    ))}
                  </ul>
                  <p><strong>Total:</strong> {money(selectedOrder.total)}</p>
                </div>
                <div className="btn-row">
                  <button type="button" className="btn-cancel" onClick={() => setSelectedOrder(null)}>Close</button>
                </div>
              </>
            )}
          </Modal>
        </div>
      )}

      {tab === 'menu' && (
        <div>
          <div className="section-toolbar">
            <h3>Create, Update & Delete Menu Items</h3>
            <button type="button" className="btn-submit" onClick={() => openDish()}>+ Add Menu Item</button>
          </div>
          <table className="data-table">
            <thead>
              <tr>
                <th>Item</th><th>Category</th><th>Price</th><th>Ingredients</th><th>Tags</th><th>Status</th><th>Actions</th>
              </tr>
            </thead>
            <tbody>
              {dishes.map((item) => (
                <tr key={item.id}>
                  <td><strong>{item.name}</strong></td>
                  <td>{item.category}</td>
                  <td>{money(item.price)}</td>
                  <td>
                    <span className={`badge ${(item.ingredientsAvailable ?? 0) <= 3 ? 'danger' : 'success'}`}>
                      {item.ingredientsAvailable ?? 0} left
                    </span>
                  </td>
                  <td>{(item.dietaryTags || []).join(', ') || '—'}</td>
                  <td>
                    <span className={`badge ${item.isAvailable ? 'success' : 'danger'}`}>
                      {item.isAvailable ? 'Available' : 'Unavailable'}
                    </span>
                  </td>
                  <td>
                    <button type="button" className="btn-cancel action-gap" onClick={() => openDish(item)}>Edit</button>
                    <button type="button" className="btn-copy danger" onClick={() => onDeleteDish(item.id)}>Delete</button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
          <Modal open={isDishOpen} title={editingDish ? 'Update Menu Item' : 'Create Menu Item'} onClose={() => setIsDishOpen(false)}>
            <form onSubmit={saveDish} className="modal-form">
              <label className="form-label">Item Name<input required className="form-input" value={dishForm.name} onChange={setField('name')} /></label>
              <label className="form-label">Description<input className="form-input" value={dishForm.description} onChange={setField('description')} /></label>
              <div className="form-row">
                <label className="form-label">
                  Category
                  <select className="form-input" value={dishForm.category} onChange={setField('category')}>
                    {['Appetizers', 'Mains', 'Drinks', 'Desserts', 'Kids'].map((c) => <option key={c} value={c}>{c}</option>)}
                  </select>
                </label>
                <label className="form-label">Price ($)<input required type="number" step="0.01" className="form-input" value={dishForm.price} onChange={setField('price')} /></label>
              </div>
              <label className="form-label">
                Ingredients Available (portions)
                <input required type="number" min="0" className="form-input" value={dishForm.ingredientsAvailable} onChange={setField('ingredientsAvailable')} />
              </label>
              <div className="form-label">
                Dietary Tags
                <div className="chip-row" style={{ marginTop: 6 }}>
                  {DIETARY_OPTIONS.map((tag) => (
                    <button key={tag} type="button" className={`chip-btn ${dishForm.dietaryTags.includes(tag) ? 'active' : ''}`} onClick={() => toggleDietary(tag)}>
                      {tag}
                    </button>
                  ))}
                </div>
              </div>
              <label className="form-label inline">
                <input type="checkbox" checked={dishForm.isAvailable} onChange={setField('isAvailable')} />
                Available for ordering
              </label>
              <div className="btn-row">
                <button type="button" className="btn-cancel" onClick={() => setIsDishOpen(false)}>Cancel</button>
                <button type="submit" className="btn-submit">Save Item</button>
              </div>
            </form>
          </Modal>
        </div>
      )}

      {tab === 'promos' && (
        <div>
          <h3 className="admin-section-title">Promotional Codes</h3>
          <form
            className="filter-bar"
            onSubmit={(e) => {
              e.preventDefault();
              onAddPromo({
                ...newPromo,
                code: newPromo.code.toUpperCase(),
                discountPercent: parseInt(newPromo.discountPercent, 10),
                isActive: true,
                usedBy: []
              });
              setNewPromo({ code: '', discountPercent: 10, expiration: '' });
            }}
          >
            <input required className="form-input promo-code-input" placeholder="Code (e.g. SAVE20)" value={newPromo.code} onChange={(e) => setNewPromo({ ...newPromo, code: e.target.value })} />
            <input required type="number" className="form-input promo-discount-input" placeholder="Discount %" value={newPromo.discountPercent} onChange={(e) => setNewPromo({ ...newPromo, discountPercent: e.target.value })} />
            <input required type="date" className="form-input promo-date-input" value={newPromo.expiration} onChange={(e) => setNewPromo({ ...newPromo, expiration: e.target.value })} />
            <button type="submit" className="btn-submit">Create Promo</button>
          </form>
          <table className="data-table">
            <thead>
              <tr><th>Code</th><th>Discount</th><th>Expiration</th><th>Status</th><th>Action</th></tr>
            </thead>
            <tbody>
              {promoCodes.map((p, i) => (
                <tr key={i}>
                  <td><strong>{p.code}</strong></td>
                  <td>{p.discountPercent}%</td>
                  <td>{p.expiration}</td>
                  <td><span className={`badge ${p.isActive ? 'success' : 'danger'}`}>{p.isActive ? 'Active' : 'Disabled'}</span></td>
                  <td>
                    <button type="button" className="btn-copy" onClick={() => onTogglePromo(p.code)}>
                      {p.isActive ? 'Disable' : 'Enable'}
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      {tab === 'analytics' && (
        <div>
          <h3 className="admin-section-title">Daily Revenue & Customer Feedback</h3>
          <div className="stats-grid">
            <div className="stat-card">
              <h4>Food Sales Revenue (Selected Day)</h4>
              <div className="stat-value">{money(dailyOrders.reduce((s, o) => s + Number(o.total || 0), 0))}</div>
              <div className="filter-bar bare">
                <span className="text-xs">Select date:</span>
                <input type="date" className="form-input text-xs" value={revenueDate} onChange={(e) => setRevenueDate(e.target.value)} />
              </div>
            </div>
            <div className="stat-card">
              <h4>Orders on Selected Day</h4>
              <div className="stat-value">{dailyOrders.length}</div>
            </div>
          </div>
          <h4 className="text-green">Less Popular Dishes & Complaints</h4>
          <p className="text-muted text-sm">Dishes sorted by lowest average rating. Low ratings (≤2 stars) include customer comments.</p>
          <table className="data-table">
            <thead>
              <tr><th>Dish</th><th>Avg Rating</th><th>Reviews</th><th>Complaint Reasons</th></tr>
            </thead>
            <tbody>
              {dishAnalysis.length === 0 ? (
                <tr><td colSpan="4" className="text-muted" style={{ textAlign: 'center' }}>No reviews yet.</td></tr>
              ) : (
                dishAnalysis.map((dish, i) => (
                  <tr key={i}>
                    <td><strong>{dish.name}</strong></td>
                    <td><span className={`badge ${Number(dish.avgRating) < 3.5 ? 'danger' : 'success'}`}>★ {dish.avgRating}</span></td>
                    <td>{dish.count}</td>
                    <td>
                      {dish.complaints.length > 0 ? (
                        <ul className="complaint-list">{dish.complaints.map((c, ci) => <li key={ci}>&ldquo;{c}&rdquo;</li>)}</ul>
                      ) : (
                        <span className="no-complaints">No complaints</span>
                      )}
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}
