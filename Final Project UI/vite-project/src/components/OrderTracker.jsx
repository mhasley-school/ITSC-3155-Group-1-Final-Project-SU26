import { useEffect, useState } from 'react';
import { money } from '../data';
import { trackOrder } from '../api';

export default function OrderTracker({ initialTrackingId = '' }) {
  const [searchId, setSearchId] = useState(initialTrackingId);
  const [foundOrder, setFoundOrder] = useState(null);
  const [searched, setSearched] = useState(false);
  const [error, setError] = useState('');

  const lookup = async (id) => {
    setSearched(true);
    setError('');
    try {
      const o = await trackOrder(id.trim());
      setFoundOrder({
        id: o.tracking_number,
        status: o.order_status,
        guestName: 'Guest',
        orderType: o.order_type,
        paymentMethod: '—',
        items: (o.order_items || []).map((i) => ({
          name: `Item #${i.menu_item_id}`,
          quantity: i.quantity
        })),
        total: o.total_price
      });
    } catch (e) {
      setFoundOrder(null);
      setError(e.message);
    }
  };

  useEffect(() => {
    if (!initialTrackingId) return;
    setSearchId(initialTrackingId);
    lookup(initialTrackingId);
  }, [initialTrackingId]);

  return (
    <div className="tracker">
      <h2>Track Your Order</h2>
      <p className="text-muted text-sm">Enter the tracking number from your order confirmation.</p>
      <form
        onSubmit={(e) => {
          e.preventDefault();
          lookup(searchId);
        }}
        className="tracker-form"
      >
        <input
          className="tracker-input"
          placeholder="e.g. TRK-A1B2C3D4"
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
            <p>
              <strong>Tracking ID:</strong> {foundOrder.id}
            </p>
            <p>
              <strong>Type:</strong> {foundOrder.orderType}
            </p>
            <p>
              <strong>Items:</strong>{' '}
              {foundOrder.items.map((i) => `${i.name} (x${i.quantity})`).join(', ')}
            </p>
            <p>
              <strong>Total:</strong> {money(foundOrder.total)}
            </p>
          </div>
        ) : (
          <p className="text-danger">{error || 'Order not found.'}</p>
        ))}
    </div>
  );
}
