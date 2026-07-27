import { useState } from 'react';
import Modal from './Modal';
import { money, today } from '../data';

const emptyForm = {
  orderType: 'Takeout',
  guestName: '',
  phone: '',
  email: '',
  address: '',
  paymentMethod: 'Credit Card',
  promoInput: ''
};

export default function Checkout({
  isOpen,
  onClose,
  cart,
  authenticatedPromos = [],
  onCompleteOrder
}) {
  const [form, setForm] = useState(emptyForm);
  const [appliedPromo, setAppliedPromo] = useState(null);
  const [promoMessage, setPromoMessage] = useState({ text: '', isError: false });

  if (!isOpen) return null;

  const set = (key) => (e) => setForm((prev) => ({ ...prev, [key]: e.target.value }));
  const subtotal = cart.reduce((sum, item) => sum + item.price * item.quantity, 0);
  const discountPercent = appliedPromo?.discountPercent || 0;
  const discountAmount = subtotal * (discountPercent / 100);
  const finalTotal = subtotal - discountAmount;

  const handleAuthenticatePromo = () => {
    const cleanCode = form.promoInput.trim().toUpperCase();
    if (!cleanCode) return;
    const promo = authenticatedPromos.find((p) => p.code.toUpperCase() === cleanCode);

    if (!promo?.isActive) {
      setPromoMessage({ text: 'Invalid or inactive promo code.', isError: true });
      setAppliedPromo(null);
      return;
    }
    if (new Date(promo.expiration) < new Date(new Date().toDateString())) {
      setPromoMessage({ text: 'Promo code has expired.', isError: true });
      setAppliedPromo(null);
      return;
    }
    setAppliedPromo(promo);
    setPromoMessage({ text: `${promo.discountPercent}% discount applied!`, isError: false });
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    onCompleteOrder({
      id: 'ORD-' + Math.floor(100000 + Math.random() * 900000),
      guestName: form.guestName,
      phone: form.phone,
      email: form.email,
      orderType: form.orderType,
      address: form.orderType === 'Delivery' ? form.address : 'N/A (Takeout)',
      items: cart,
      subtotal,
      discountPercent,
      promoCodeUsed: appliedPromo?.code || null,
      total: finalTotal,
      status: 'Preparing',
      date: today(),
      paymentMethod: form.paymentMethod
    });
  };

  return (
    <Modal open title="Guest Checkout" onClose={onClose}>
      <p className="modal-hint">
        No account needed. Choose takeout or delivery, pay, and get a tracking number.
      </p>
      <form onSubmit={handleSubmit} className="modal-form">
        <div className="toggle-group">
          {['Takeout', 'Delivery'].map((type) => (
            <button
              key={type}
              type="button"
              className={`type-btn ${form.orderType === type ? 'active' : ''}`}
              onClick={() => setForm((prev) => ({ ...prev, orderType: type }))}
            >
              {type}
            </button>
          ))}
        </div>
        <label className="form-label">
          Full Name
          <input required className="form-input" value={form.guestName} onChange={set('guestName')} placeholder="Jane Doe" />
        </label>
        <div className="form-row">
          <label className="form-label">
            Phone
            <input required type="tel" className="form-input" value={form.phone} onChange={set('phone')} placeholder="(555) 000-0000" />
          </label>
          <label className="form-label">
            Email
            <input required type="email" className="form-input" value={form.email} onChange={set('email')} placeholder="jane@example.com" />
          </label>
        </div>
        {form.orderType === 'Delivery' && (
          <label className="form-label">
            Delivery Address
            <input required className="form-input" value={form.address} onChange={set('address')} placeholder="123 Main St, Apt 4B" />
          </label>
        )}
        <label className="form-label">
          Payment Method
          <select className="form-input" value={form.paymentMethod} onChange={set('paymentMethod')}>
            <option value="Credit Card">Credit / Debit Card</option>
            <option value="Cash">Cash on Delivery/Pickup</option>
          </select>
        </label>
        <div className="form-label">
          Promo Code
          <div className="promo-inline">
            <input className="form-input" placeholder="e.g. WELCOME10" value={form.promoInput} onChange={set('promoInput')} />
            <button type="button" onClick={handleAuthenticatePromo} className="btn-apply">
              Apply
            </button>
          </div>
        </div>
        {promoMessage.text && (
          <p className={`promo-msg ${promoMessage.isError ? 'error' : 'success'}`}>{promoMessage.text}</p>
        )}
        <div className="total-summary">
          <div className="summary-row">
            <span>Subtotal:</span>
            <span>{money(subtotal)}</span>
          </div>
          {discountPercent > 0 && (
            <div className="summary-row discount">
              <span>Discount ({discountPercent}%):</span>
              <span>-{money(discountAmount)}</span>
            </div>
          )}
          <div className="summary-row final">
            <span>Total:</span>
            <span>{money(finalTotal)}</span>
          </div>
        </div>
        <div className="btn-row">
          <button type="button" onClick={onClose} className="btn-cancel">
            Cancel
          </button>
          <button type="submit" className="btn-submit">
            Place & Pay Order
          </button>
        </div>
      </form>
    </Modal>
  );
}
