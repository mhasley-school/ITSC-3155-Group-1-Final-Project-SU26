import { useState } from 'react';
import Modal from './Modal';
import { today } from '../data';

export default function Review({ isOpen, onClose, dishes = [], onSubmitReview }) {
  const [selectedDishId, setSelectedDishId] = useState(dishes[0]?.id || '');
  const [rating, setRating] = useState(5);
  const [comment, setComment] = useState('');
  const [customerName, setCustomerName] = useState('');

  if (!isOpen) return null;

  const handleSubmit = (e) => {
    e.preventDefault();
    const dish = dishes.find((d) => String(d.id) === String(selectedDishId));
    onSubmitReview({
      id: Date.now(),
      dishId: selectedDishId,
      dishName: dish?.name || 'General Experience',
      rating,
      comment,
      customerName: customerName || 'Anonymous',
      date: today()
    });
    setComment('');
    setRating(5);
    onClose();
  };

  return (
    <Modal open title="Rate & Review" onClose={onClose} className="review">
      <form onSubmit={handleSubmit} className="modal-form">
        <label className="form-label">
          Select Dish:
          <select className="form-input" value={selectedDishId} onChange={(e) => setSelectedDishId(e.target.value)}>
            {dishes.map((dish) => (
              <option key={dish.id} value={dish.id}>
                {dish.name}
              </option>
            ))}
          </select>
        </label>
        <label className="form-label">
          Rating:
          <div className="star-rating-row">
            {[1, 2, 3, 4, 5].map((star) => (
              <span
                key={star}
                className={`star ${star <= rating ? 'filled' : ''}`}
                onClick={() => setRating(star)}
              >
                ★
              </span>
            ))}
          </div>
        </label>
        <label className="form-label">
          Your Name (Optional):
          <input className="form-input" value={customerName} onChange={(e) => setCustomerName(e.target.value)} placeholder="e.g. Alex M." />
        </label>
        <label className="form-label">
          Comments / Feedback:
          <textarea
            required
            rows="4"
            className="form-input"
            value={comment}
            onChange={(e) => setComment(e.target.value)}
            placeholder="How was the taste, portion size, or packaging?"
          />
        </label>
        <div className="btn-row">
          <button type="button" onClick={onClose} className="btn-cancel">
            Cancel
          </button>
          <button type="submit" className="btn-submit">
            Submit Review
          </button>
        </div>
      </form>
    </Modal>
  );
}
