import { useEffect, useState } from 'react';
import { money } from '../data';

export default function OrderTracker({ orders, initialTrackingId = '' }) {
  const [searchId, setSearchId] = useState(initialTrackingId);
  const [foundOrder, setFoundOrder] = useState(null);
  const [searched, setSearched] = useState(false);

  useEffect(() => {
    if (!initialTrackingId) return;
    setSearchId(initialTrackingId);
    setFoundOrder(
      orders.find((o) => o.id.toLowerCase() === initialTrackingId.trim().toLowerCase()) || null
    );
    setSearched(true);
  }, [initialTrackingId, orders]);

  const handleSearch = (e) => {
    e.preventDefault();
    setFoundOrder(orders.find((o) => o.id.toLowerCase() === searchId.trim().toLowerCase()) || null);
    setSearched(true);
  };

  return (
    <div className="tracker">
      <h2>Track Your Order</h2>
      <p className="text-muted text-sm">Enter the tracking number from your order confirmation.</p>
      <form onSubmit={handleSearch} className="tracker-form">
        <input
          className="tracker-input"
          placeholder="Enter Tracking Number (e.g. ORD-100101)"
          value={searchId}
          onChange={(e) => setSearchId(e.target.value)}
        />
        <button type="submit" className="tracker-search-btn">
          Search
        </button>
      </form>
      {searched &&
        (foundOrder ? (
          <div className="tracker-result">
            <h3>
              Status: <span className="tracker-status">{foundOrder.status}</span>
            </h3>
            <p><strong>Tracking ID:</strong> {foundOrder.id}</p>
            <p><strong>Customer:</strong> {foundOrder.guestName}</p>
            <p><strong>Type:</strong> {foundOrder.orderType}</p>
            <p><strong>Payment:</strong> {foundOrder.paymentMethod || '—'}</p>
            <p>
              <strong>Items:</strong>{' '}
              {(foundOrder.items || []).map((i) => `${i.name} (x${i.quantity || 1})`).join(', ')}
            </p>
            <p><strong>Total:</strong> {money(foundOrder.total)}</p>
          </div>
        ) : (
          <p className="text-danger">
            No order found with tracking number &ldquo;{searchId}&rdquo;.
          </p>
        ))}
    </div>
  );
}
