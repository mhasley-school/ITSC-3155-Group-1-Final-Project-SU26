import { money } from '../data';

export default function CartDrawer({
  isOpen,
  onClose,
  cart,
  onUpdateQuantity,
  onRemoveItem,
  onProceedToCheckout
}) {
  if (!isOpen) return null;
  const totalAmount = cart.reduce((sum, item) => sum + item.price * item.quantity, 0);

  return (
    <div className="cart-overlay">
      <div className="cart-drawer">
        <div className="cart-header">
          <h3>Your Order</h3>
          <button type="button" onClick={onClose} className="close-btn">
            ✕
          </button>
        </div>
        {cart.length === 0 ? (
          <p className="text-muted">Your cart is empty.</p>
        ) : (
          <div className="cart-items">
            {cart.map((item) => (
              <div key={item.id} className="cart-item">
                <div>
                  <strong>{item.name}</strong>
                  <div className="cart-item-price">{money(item.price)}</div>
                </div>
                <div className="cart-qty">
                  <button type="button" onClick={() => onUpdateQuantity(item.id, -1)}>
                    -
                  </button>
                  <span>{item.quantity}</span>
                  <button type="button" onClick={() => onUpdateQuantity(item.id, 1)}>
                    +
                  </button>
                  <button type="button" className="cart-remove" onClick={() => onRemoveItem(item.id)}>
                    Remove
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}
        <div className="cart-footer">
          <h4>Total: {money(totalAmount)}</h4>
          <button
            type="button"
            disabled={cart.length === 0}
            className="cart-checkout-btn"
            onClick={() => {
              onClose();
              onProceedToCheckout();
            }}
          >
            Proceed to Guest Checkout
          </button>
          <p className="cart-guest-note">No account required — guest checkout only.</p>
        </div>
      </div>
    </div>
  );
}
