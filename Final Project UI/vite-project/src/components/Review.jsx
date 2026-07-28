import { useEffect, useState } from 'react';
import Modal from './Modal';

export default function Review({ isOpen, onClose, dishes = [], onSubmitReview }) {
  const [selectedDishId, setSelectedDishId] = useState('');
  const [rating, setRating] = useState(5);
  const [comment, setComment] = useState('');
  const [customerName, setCustomerName] = useState('');
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    if (isOpen && dishes.length && !selectedDishId) {
      setSelectedDishId(dishes[0].id);
    }
  }, [isOpen, dishes, selectedDishId]);

  if (!isOpen) return null;

  const handleSubmit = async (e) => {
    e.preventDefault();
    const dish = dishes.find((d) => String(d.id) === String(selectedDishId));
    setSubmitting(true);
    try {
      await onSubmitReview({
        dishId: Number(selectedDishId),
        dishName: dish?.name || 'General Experience',
        rating,
        comment,
        customerName: customerName || 'Anonymous'
      });
      setComment('');
      setRating(5);
      onClose();
    } catch {
    } finally {
      setSubmitting(false);
    }
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
          <button type="button" onClick={onClose} className="btn-cancel" disabled={submitting}>
            Cancel
          </button>
          <button type="submit" className="btn-submit" disabled={submitting || !dishes.length}>
            {submitting ? 'Submitting…' : 'Submit Review'}
          </button>
        </div>
      </form>
    </Modal>
  );
}
