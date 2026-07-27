export default function Modal({ open, onClose, title, children, className = '', elevated }) {
  if (!open) return null;
  return (
    <div className={`modal-overlay${elevated ? ' elevated' : ''}`}>
      <div className={`modal-card ${className}`.trim()}>
        {title && (
          <div className="modal-header">
            <h3>{title}</h3>
            {onClose && (
              <button type="button" onClick={onClose} className="close-btn">
                ✕
              </button>
            )}
          </div>
        )}
        {children}
      </div>
    </div>
  );
}
