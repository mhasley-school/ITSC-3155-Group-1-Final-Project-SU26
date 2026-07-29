const NAV = [
  { id: 'menu', label: 'Menu & Order' },
  { id: 'track', label: 'Track Order' },
  { id: 'staff', label: 'Staff Portal', staff: true }
];

export default function Header({ totalCartCount, onOpenCart, activeView, setActiveView }) {
  return (
    <header className="app-header">
      <div className="header-content">
        <div className="brand-group">
          <h2 className="brand-title">Breadsticks</h2>
          <div className="nav-tabs">
            {NAV.map(({ id, label, staff }) => (
              <button
                key={id}
                type="button"
                className={`nav-btn${staff ? ' staff' : ''}${activeView === id ? ' active' : ''}`}
                onClick={() => setActiveView(id)}
              >
                {label}
              </button>
            ))}
          </div>
        </div>

        {activeView === 'menu' && (
          <button type="button" onClick={onOpenCart} className="cart-badge-btn">
            Order Cart ({totalCartCount})
          </button>
        )}
      </div>
    </header>
  );
}
