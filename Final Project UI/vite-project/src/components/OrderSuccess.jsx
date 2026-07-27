import { useState } from 'react';
import Modal from './Modal';
import { money } from '../data';

export default function OrderSuccess({ order, onClose, onTrackOrder }) {
  const [copied, setCopied] = useState(false);
  if (!order) return null;

  const handleCopy = () => {
    navigator.clipboard.writeText(order.id);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <Modal open elevated className="narrow">
      <div className="icon-circle">✓</div>
      <h3 className="text-green" style={{ fontSize: '1.2rem', margin: '4px 0' }}>
        Order Placed!
      </h3>
      <p className="modal-hint">Save your tracking ID to track your order.</p>
      <div className="tracking-box">
        <span className="tracking-label">TRACKING ORDER ID</span>
        <div className="id-row">
          <span className="tracking-id">{order.id}</span>
          <button type="button" onClick={handleCopy} className="btn-copy">
            {copied ? 'Copied' : 'Copy'}
          </button>
        </div>
      </div>
      <div className="success-details">
        {[
          ['Customer', order.guestName],
          ['Type', order.orderType],
          ['Payment', order.paymentMethod],
          ['Total Paid', money(order.total)]
        ].map(([label, value]) => (
          <div key={label} className="detail-row">
            <span>{label}:</span>
            <strong>{value}</strong>
          </div>
        ))}
      </div>
      <div className="btn-group-equal">
        <button type="button" onClick={onClose} className="btn-cancel">
          Close
        </button>
        <button type="button" onClick={() => onTrackOrder(order.id)} className="btn-submit">
          Track Order
        </button>
      </div>
    </Modal>
  );
}
