import { CATEGORIES, DIETARY_OPTIONS } from './data';

const API = 'http://127.0.0.1:8000';
const TAG_RE = /\n?\[dietary:(.*?)\]\s*$/i;
const PRIMARY = CATEGORIES.map((c) => c.toLowerCase());

async function api(path, options) {
  let res;
  try {
    res = await fetch(`${API}${path}`, {
      headers: { 'Content-Type': 'application/json' },
      ...options
    });
  } catch {
    throw new Error('Could not reach API. Is it running on port 8000?');
  }

  const text = await res.text();
  let data = null;
  if (text) {
    try {
      data = JSON.parse(text);
    } catch {
      data = null;
    }
  }

  if (!res.ok) {
    const detail = data?.detail;
    const message = Array.isArray(detail)
      ? detail.map((d) => d.msg || JSON.stringify(d)).join(', ')
      : detail || text || `API error ${res.status}`;
    throw new Error(typeof message === 'string' ? message : JSON.stringify(message));
  }

  return data;
}

function parseDescription(raw) {
  const text = raw || '';
  const match = text.match(TAG_RE);
  if (!match) return { description: text, tags: [] };
  return {
    description: text.replace(TAG_RE, '').trim(),
    tags: match[1]
      .split(',')
      .map((t) => t.trim())
      .filter((t) => DIETARY_OPTIONS.includes(t))
  };
}

function encodeDescription(description, tags = []) {
  const base = (description || '').replace(TAG_RE, '').trim();
  const clean = (tags || []).filter((t) => DIETARY_OPTIONS.includes(t));
  if (!clean.length) return base;
  return `${base}\n[dietary:${clean.join(',')}]`;
}

function normalizeCategory(rawCategory, tags) {
  const value = (rawCategory || '').trim();
  const lower = value.toLowerCase();
  if (PRIMARY.includes(lower)) {
    return { category: CATEGORIES[PRIMARY.indexOf(lower)], tags };
  }

  const nextTags = [...tags];
  if (lower.includes('vegan')) nextTags.push('Vegan');
  else if (lower.includes('veget')) nextTags.push('Vegetarian');
  if (lower.includes('gluten')) nextTags.push('Gluten-Free');

  return {
    category: 'Mains',
    tags: [...new Set(nextTags.filter((t) => DIETARY_OPTIONS.includes(t)))]
  };
}

export function toDish(item) {
  const parsed = parseDescription(item.description);
  const normalized = normalizeCategory(item.category, parsed.tags);
  return {
    id: item.id,
    name: item.name,
    description: parsed.description,
    price: item.price,
    category: normalized.category,
    dietaryTags: normalized.tags
  };
}

export const getMenu = () => api('/menu-items/').then((rows) => rows.map(toDish));

export const placeOrder = ({ guestName, phone, email, address, orderType, items, promoCodeUsed }) =>
  api('/orders/', {
    method: 'POST',
    body: JSON.stringify({
      customer: {
        name: guestName,
        email,
        phone_number: phone,
        address: orderType === 'Delivery' ? address : 'N/A (Takeout)'
      },
      order_type: orderType,
      order_items: items.map((i) => ({ menu_item_id: i.id, quantity: i.quantity })),
      promo_code: promoCodeUsed || null
    })
  });

export const trackOrder = (trackingNumber) => api(`/orders/track/${encodeURIComponent(trackingNumber)}`);

export const getOrders = () => api('/orders/');

export const getOrdersByDateRange = (startDate, endDate) => {
  const start = `${startDate}T00:00:00`;
  const end = `${endDate}T23:59:59`;
  const params = new URLSearchParams({ start_date: start, end_date: end });
  return api(`/orders/filter/date-range?${params}`);
};

export const getIngredients = () => api('/ingredients/');

export const updateIngredient = (id, data) =>
  api(`/ingredients/${id}`, {
    method: 'PUT',
    body: JSON.stringify(data)
  });

export const updateOrderStatus = (orderId, status) =>
  api(`/orders/${orderId}/status`, {
    method: 'PUT',
    body: JSON.stringify({ order_status: status })
  });

export const createMenuItem = (dish) =>
  api('/menu-items/', {
    method: 'POST',
    body: JSON.stringify({
      name: dish.name,
      description: encodeDescription(dish.description, dish.dietaryTags),
      price: Number(dish.price),
      category: dish.category
    })
  }).then(toDish);

export const updateMenuItem = (id, dish) =>
  api(`/menu-items/${id}`, {
    method: 'PUT',
    body: JSON.stringify({
      name: dish.name,
      description: encodeDescription(dish.description, dish.dietaryTags),
      price: Number(dish.price),
      category: dish.category
    })
  }).then(toDish);

export const deleteMenuItem = (id) => api(`/menu-items/${id}`, { method: 'DELETE' });

export function toReview(review, dishes = []) {
  const dish = dishes.find((d) => Number(d.id) === Number(review.menu_item_id));
  let customerName = 'Guest';
  let comment = review.review_text || '';
  const split = comment.match(/^([^:]+):\s*([\s\S]*)$/);
  if (split) {
    customerName = split[1].trim() || 'Guest';
    comment = split[2].trim();
  }
  return {
    id: review.id,
    dishId: review.menu_item_id,
    dishName: dish?.name || `Item #${review.menu_item_id}`,
    rating: Number(review.score) || 0,
    comment,
    customerName,
    date: new Date().toISOString().slice(0, 10)
  };
}

export const getReviews = () => api('/reviews/');

export const createReview = ({ menuItemId, score, reviewText, orderId = null }) => {
  const body = {
    menu_item_id: Number(menuItemId),
    score: Number(score),
    review_text: reviewText || null
  };
  if (orderId != null) body.order_id = Number(orderId);
  return api('/reviews/', {
    method: 'POST',
    body: JSON.stringify(body)
  });
};

export const deleteReview = (id) => api(`/reviews/${id}`, { method: 'DELETE' });
