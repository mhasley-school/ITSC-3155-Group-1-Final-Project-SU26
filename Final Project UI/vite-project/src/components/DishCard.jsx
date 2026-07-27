import { money } from '../data';

export default function DishCard({ dish, onAddToCart }) {
  const { name, description, price, dietaryTags = [], isAvailable, image, ingredientsAvailable } =
    dish;
  const canOrder = isAvailable && (ingredientsAvailable ?? 0) > 0;

  return (
    <div className="dish-card">
      <div className="dish-image-wrap">
        {image ? (
          <img src={image} alt={name} className="dish-image" />
        ) : (
          <div className="dish-image-placeholder">Photo coming soon</div>
        )}
        {!canOrder && <span className="out-of-stock-badge">Out of Stock</span>}
      </div>
      <div className="dish-body">
        <div className="dish-header">
          <h3 className="dish-title">{name}</h3>
          <span className="dish-price">{money(price)}</span>
        </div>
        <p className="dish-desc">{description}</p>
        <div className="dish-tags">
          {dietaryTags.map((tag) => (
            <span key={tag} className="dish-tag">
              {tag}
            </span>
          ))}
        </div>
        <button
          type="button"
          onClick={() => onAddToCart(dish)}
          disabled={!canOrder}
          className="dish-add-btn"
        >
          {canOrder ? 'Add to Order' : 'Unavailable'}
        </button>
      </div>
    </div>
  );
}
