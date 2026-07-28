import { money } from '../data';

export default function DishCard({ dish, onAddToCart }) {
  const { name, description, price, category, dietaryTags = [] } = dish;

  return (
    <div className="dish-card">
      <div className="dish-body">
        <div className="dish-header">
          <h3 className="dish-title">{name}</h3>
          <span className="dish-price">{money(price)}</span>
        </div>
        <p className="dish-desc">{description}</p>
        <div className="dish-tags">
          {category && <span className="dish-tag">{category}</span>}
          {dietaryTags.map((tag) => (
            <span key={tag} className="dish-tag dietary">
              {tag}
            </span>
          ))}
        </div>
        <button type="button" onClick={() => onAddToCart(dish)} className="dish-add-btn">
          Add to Order
        </button>
      </div>
    </div>
  );
}
