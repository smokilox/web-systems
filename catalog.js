// catalog.js
import { fetchGoods, fetchGoodById } from './api.js';

let allGoods = [];
let currentSortOrder = 'rating_desc';

document.addEventListener('DOMContentLoaded', () => {
  loadAllGoods();
  setupEventListeners();
  updateCartCount();
});

function setupEventListeners() {
  document.querySelector('.apply-button')?.addEventListener('click', applyFiltersAndRender);
  document.getElementById('sort-order')?.addEventListener('change', (e) => {
    currentSortOrder = e.target.value;
    applyFiltersAndRender();
  });
  document.getElementById('cart-icon')?.addEventListener('click', () => window.location.href = 'cart.html');
  document.getElementById('account-icon')?.addEventListener('click', () => window.location.href = 'orders.html');
  document.getElementById('notification-close')?.addEventListener('click', hideNotification);
}

async function loadAllGoods() {
  try {
    const data = await fetchGoods({ page: 1, per_page: 100 });
    allGoods = data.goods || [];
    updateCategoryFilter();
    applyFiltersAndRender();
  } catch (error) {
    showNotification('Ошибка загрузки товаров', 'error');
  }
}

function updateCategoryFilter() {
  const categories = new Set();
  allGoods.forEach(good => {
    if (good.main_category) {
      categories.add(good.main_category.toLowerCase());
    }
  });

  const container = document.getElementById('categories-filter');
  if (!container) return;

  container.innerHTML = '';
  Array.from(categories).sort().forEach(cat => {
    const label = document.createElement('label');
    label.innerHTML = `<input type="checkbox" value="${cat}"> ${cat.charAt(0).toUpperCase() + cat.slice(1)}`;
    container.appendChild(label);
  });
}

function applyFiltersAndRender() {
  let filtered = [...allGoods];

  // Категории
  const selectedCategories = Array.from(document.querySelectorAll('#categories-filter input[type="checkbox"]:checked'))
    .map(cb => cb.value);
  if (selectedCategories.length > 0) {
    filtered = filtered.filter(good =>
      selectedCategories.includes(good.main_category?.toLowerCase())
    );
  }

  // Цена
  const priceFrom = parseInt(document.getElementById('price-from')?.value) || 0;
  const priceTo = parseInt(document.getElementById('price-to')?.value) || Infinity;
  filtered = filtered.filter(good => {
    const price = good.discount_price ?? good.actual_price;
    return price >= priceFrom && price <= priceTo;
  });

  // Только со скидкой
  const discountOnly = document.getElementById('discount-only')?.checked;
  if (discountOnly) {
    filtered = filtered.filter(good =>
      good.discount_price != null && good.discount_price < good.actual_price
    );
  }

  // Сортировка
  filtered.sort((a, b) => {
    const aPrice = a.discount_price ?? a.actual_price;
    const bPrice = b.discount_price ?? b.actual_price;
    const aRating = a.rating ?? 0;
    const bRating = b.rating ?? 0;

    switch (currentSortOrder) {
      case 'price_asc': return aPrice - bPrice;
      case 'price_desc': return bPrice - aPrice;
      case 'rating_asc': return aRating - bRating;
      case 'rating_desc':
      default: return bRating - aRating;
    }
  });

  renderGoods(filtered);
}

function renderGoods(goods) {
  const container = document.getElementById('goods-grid');
  if (!container) return;

  container.innerHTML = '';
  if (goods.length === 0) {
    container.innerHTML = '<p style="grid-column:1/-1;text-align:center;padding:40px;">Товары не найдены</p>';
    return;
  }

  goods.forEach(good => {
    const ratingStars = Array.from({length: 5}, (_, i) =>
      `<span class="${i < Math.floor(good.rating) ? 'star' : 'star empty'}">★</span>`
    ).join('');

    let priceHtml = '';
    if (good.discount_price && good.discount_price < good.actual_price) {
      const disc = Math.round(((good.actual_price - good.discount_price) / good.actual_price) * 100);
      priceHtml = `
        <div class="good-price">
          <span class="actual-price">${good.discount_price} ₽</span>
          <span class="discount-price">${good.actual_price} ₽</span>
          <span class="discount-percent">-${disc}%</span>
        </div>
      `;
    } else {
      priceHtml = `<div class="good-price"><span class="actual-price">${good.actual_price} ₽</span></div>`;
    }

    const card = document.createElement('div');
    card.className = 'good-card';
    card.innerHTML = `
      <img src="${good.image_url?.trim() || 'https://via.placeholder.com/200'}" alt="${good.name}" class="good-image">
      <div class="good-info">
        <h3 class="good-name">${good.name}</h3>
        <div class="good-rating">
          <span>${good.rating?.toFixed(1) || '0.0'}</span>
          <div class="rating-stars">${ratingStars}</div>
        </div>
        ${priceHtml}
        <button class="add-to-cart" data-id="${good.id}">Добавить</button>
      </div>
    `;
    container.appendChild(card);
  });

  document.querySelectorAll('.add-to-cart').forEach(btn =>
    btn.addEventListener('click', (e) => {
      const id = e.target.dataset.id;
      let cart = JSON.parse(localStorage.getItem('cart')) || [];
      if (!cart.includes(id)) {
        cart.push(id);
        localStorage.setItem('cart', JSON.stringify(cart));
        updateCartCount();
        showNotification('Товар добавлен в корзину', 'success');
      }
    })
  );
}

function updateCartCount() {
  const count = JSON.parse(localStorage.getItem('cart'))?.length || 0;
  const el = document.getElementById('cart-count');
  if (el) el.textContent = count;
}

function showNotification(message, type = 'info') {
  const n = document.getElementById('notification');
  if (!n) return;
  n.querySelector('#notification-message').textContent = message;
  n.className = `notification ${type} show`;
  setTimeout(hideNotification, 5000);
}

function hideNotification() {
  const n = document.getElementById('notification');
  if (n) n.classList.remove('show');
}