import { useMemo, useState } from 'react';
import Modal from './Modal';
import {
  CATEGORIES,
  DIETARY_OPTIONS,
  EMPTY_DISH,
  ORDER_STATUSES,
  STAFF_TABS,
  money,
  today
} from '../data';

export default function StaffPortal({
  dishes,
  ingredients = [],
  onUpdateIngredient,
  onFilterOrdersByDate,
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

  const lowIngredients = useMemo(
    () => ingredients.filter((ing) => Number(ing.quantity_in_stock) <= 50),
    [ingredients]
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
    setDishForm((prev) => ({ ...prev, [key]: e.target.value }));
  };

  const toggleDietary = (tag) =>
    setDishForm((prev) => ({
      ...prev,
      dietaryTags: prev.dietaryTags.includes(tag)
        ? prev.dietaryTags.filter((t) => t !== tag)
        : [...prev.dietaryTags, tag]
    }));

  const openDish = (dish = null) => {
    setEditingDish(dish);
    setDishForm(
      dish
        ? {
            name: dish.name,
            price: String(dish.price),
            category: CATEGORIES.includes(dish.category) ? dish.category : 'Mains',
            description: dish.description || '',
            dietaryTags: [...(dish.dietaryTags || [])]
          }
        : { ...EMPTY_DISH, dietaryTags: [] }
    );
    setIsDishOpen(true);
  };

  const saveDish = (e) => {
    e.preventDefault();
    const payload = {
      name: dishForm.name,
      description: dishForm.description,
      category: dishForm.category,
      price: parseFloat(dishForm.price),
      dietaryTags: dishForm.dietaryTags
    };
    if (editingDish) onUpdateDish({ ...editingDish, ...payload });
    else onAddDish(payload);
    setIsDishOpen(false);
  };

  return (
    <div className="admin-container">
      <div className="admin-header">
        <h2>Staff & Admin Dashboard</h2>
      </div>

      {lowIngredients.length > 0 && (
        <div className="alert-banner">
          <h4>Insufficient ingredients alert</h4>
          <p className="text-sm" style={{ margin: '4px 0 8px' }}>
            These ingredients are low or empty. Checkout will block orders that need more than available stock.
          </p>
          <ul>
            {lowIngredients.map((ing) => (
              <li key={ing.id}>
                <strong>{ing.name}</strong>: {ing.quantity_in_stock} {ing.unit}
                {Number(ing.quantity_in_stock) <= 0 ? ' — cannot fulfill related orders.' : ' — running low.'}
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
            <button
              type="button"
              className="btn-apply"
              onClick={() => onFilterOrdersByDate?.(startDate, endDate)}
              disabled={!startDate || !endDate}
            >
              Apply
            </button>
            <button
              type="button"
              className="btn-cancel"
              onClick={() => {
                setStartDate('');
                setEndDate('');
                onFilterOrdersByDate?.('', '');
              }}
            >
              Show All
            </button>
          </div>
          <table className="data-table">
            <thead>
              <tr>
                <th>Order ID</th><th>Customer</th><th>Type</th><th>Date</th><th>Total</th><th>Status</th><th>Actions</th>
              </tr>
            </thead>
            <tbody>
              {orders.length === 0 ? (
                <tr><td colSpan="7" className="text-muted" style={{ textAlign: 'center' }}>No orders found for the selected range.</td></tr>
              ) : (
                orders.map((ord) => (
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
                  <p><strong>Items:</strong></p>
                  <ul>
                    {(selectedOrder.items || []).map((item, i) => (
                      <li key={i}>
                        {item.quantity}x {item.name} — {money(item.price)}
                      </li>
                    ))}
                  </ul>
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
                <th>Item</th><th>Category</th><th>Price</th><th>Tags</th><th>Actions</th>
              </tr>
            </thead>
            <tbody>
              {dishes.map((item) => (
                <tr key={item.id}>
                  <td><strong>{item.name}</strong></td>
                  <td>{item.category}</td>
                  <td>{money(item.price)}</td>
                  <td>{(item.dietaryTags || []).join(', ') || '—'}</td>
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
                    {CATEGORIES.map((c) => <option key={c} value={c}>{c}</option>)}
                  </select>
                </label>
                <label className="form-label">Price ($)<input required type="number" step="0.01" className="form-input" value={dishForm.price} onChange={setField('price')} /></label>
              </div>
              <div className="form-label">
                Dietary Tags
                <div className="chip-row" style={{ marginTop: 6 }}>
                  {DIETARY_OPTIONS.map((tag) => (
                    <button
                      key={tag}
                      type="button"
                      className={`chip-btn ${dishForm.dietaryTags.includes(tag) ? 'active' : ''}`}
                      onClick={() => toggleDietary(tag)}
                    >
                      {tag}
                    </button>
                  ))}
                </div>
              </div>
              <div className="btn-row">
                <button type="button" className="btn-cancel" onClick={() => setIsDishOpen(false)}>Cancel</button>
                <button type="submit" className="btn-submit">Save Item</button>
              </div>
            </form>
          </Modal>
        </div>
      )}

      {tab === 'ingredients' && (
        <div>
          <h3 className="admin-section-title">Ingredient Stock</h3>
          <p className="text-muted text-sm">
            Orders are blocked at checkout if a recipe needs more than the stock shown here.
          </p>
          <table className="data-table">
            <thead>
              <tr>
                <th>Ingredient</th><th>Stock</th><th>Unit</th><th>Status</th><th>Update Stock</th>
              </tr>
            </thead>
            <tbody>
              {ingredients.length === 0 ? (
                <tr>
                  <td colSpan="5" className="text-muted" style={{ textAlign: 'center' }}>
                    No ingredients yet.
                  </td>
                </tr>
              ) : (
                ingredients.map((ing) => (
                  <tr key={ing.id}>
                    <td><strong>{ing.name}</strong></td>
                    <td>{ing.quantity_in_stock}</td>
                    <td>{ing.unit}</td>
                    <td>
                      <span className={`badge ${Number(ing.quantity_in_stock) <= 50 ? 'danger' : 'success'}`}>
                        {Number(ing.quantity_in_stock) <= 0
                          ? 'Empty'
                          : Number(ing.quantity_in_stock) <= 50
                            ? 'Low'
                            : 'OK'}
                      </span>
                    </td>
                    <td>
                      <form
                        className="row"
                        onSubmit={(e) => {
                          e.preventDefault();
                          const value = e.target.elements.stock.value;
                          onUpdateIngredient?.(ing.id, { quantity_in_stock: Number(value) });
                        }}
                      >
                        <input
                          name="stock"
                          type="number"
                          step="0.01"
                          min="0"
                          className="form-input w-auto"
                          defaultValue={ing.quantity_in_stock}
                          style={{ width: 110 }}
                        />
                        <button type="submit" className="btn-copy">Save</button>
                      </form>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
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

          <h4 className="text-green" style={{ marginTop: 20 }}>All Reviews ({reviews.length})</h4>
          <table className="data-table">
            <thead>
              <tr><th>Dish</th><th>Rating</th><th>Customer</th><th>Comment</th></tr>
            </thead>
            <tbody>
              {reviews.length === 0 ? (
                <tr><td colSpan="4" className="text-muted" style={{ textAlign: 'center' }}>No reviews yet.</td></tr>
              ) : (
                reviews.map((rev) => (
                  <tr key={rev.id}>
                    <td>{rev.dishName}</td>
                    <td>★ {rev.rating}</td>
                    <td>{rev.customerName}</td>
                    <td>{rev.comment || '—'}</td>
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
