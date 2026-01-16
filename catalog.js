// catalog.js
import { fetchGoodsPage } from './api.js';

let allGoods = [];          // все товары (для фильтрации)
let currentMode = 'pagination'; // 'pagination' или 'filtered'
let currentPage = 1;
let perPage = 10;
let currentSortOrder = 'rating_desc';
let currentFilters = {
  categories: [],
  priceFrom: 0,
  priceTo: 10000,
  discountOnly: false,
  query: ''
};

document.addEventListener('DOMContentLoaded', () => {
  loadInitialData();
  setupEventListeners();
  updateCartCount();
});

function setupEventListeners() {
  document.getElementById('sort-order')?.addEventListener('change', (e) => {
    currentSortOrder = e.target.value;
    if (currentMode === 'pagination') {
      resetPagination();
    } else {
      applyClientFilters();
    }
  });

  document.querySelector('.apply-button')?.addEventListener('click', applyFilters);
  document.querySelector('.search-bar button')?.addEventListener('click', () => {
    const query = document.querySelector('.search-bar input')?.value.trim();
    currentFilters.query = query;
    applyFilters();
  });
  document.querySelector('.search-bar input')?.addEventListener('keypress', (e) => {
    if (e.key === 'Enter') {
      currentFilters.query = e.target.value.trim();
      applyFilters();
    }
  });

  document.getElementById('load-more')?.addEventListener('click', () => {
    if (currentMode === 'pagination') {
      currentPage++;
      loadGoodsPage();
    }
  });

  document.getElementById('cart-icon')?.addEventListener('click', () => window.location.href = 'cart.html');
  document.getElementById('account-icon')?.addEventListener('click', () => window.location.href = 'orders.html');
  document.getElementById('notification-close')?.addEventListener('click', hideNotification);
}

async function loadInitialData() {
  // Загружаем первую страницу для пагинации
  await loadGoodsPage();
  // Также загружаем все товары для возможной фильтрации
  try {
    const data = await fetchGoodsPage(1, 100, 'rating_desc');
    allGoods = data.goods || [];
    updateCategoryFilter();
  } catch (e) {
    console.warn('Не удалось загрузить все товары для фильтрации');
  }
}

async function loadGoodsPage(page = currentPage, per_page = perPage, sort = currentSortOrder) {
  try {
    const data = await fetchGoodsPage(page, per_page, sort);
    const container = document.getElementById('goods-grid');
    
    if (page === 1) {
      container.innerHTML = '';
    }

    renderGoods(data.goods, page === 1 ? 'replace' : 'append');
    updateLoadMoreButton(data._pagination?.total_count || 0, page, per_page);
  } catch (error) {
    showNotification('Ошибка загрузки товаров', 'error');
  }
}

function updateLoadMoreButton(totalCount, page, perPage) {
  const totalPages = Math.ceil(totalCount / perPage);
  const btn = document.getElementById('load-more');
  if (btn) {
    btn.style.display = (page < totalPages) ? 'block' : 'none';
  }
}

function applyFilters() {
  // Сохраняем фильтры
  currentFilters.categories = Array.from(document.querySelectorAll('#categories-filter input[type="checkbox"]:checked'))
    .map(cb => cb.value);
  currentFilters.priceFrom = parseInt(document.getElementById('price-from')?.value) || 0;
  currentFilters.priceTo = parseInt(document.getElementById('price-to')?.value) || 10000;
  currentFilters.discountOnly = document.getElementById('discount-only')?.checked || false;

  // Переключаемся в режим фильтрации
  currentMode = 'filtered';
  applyClientFilters();
}

function applyClientFilters() {
  let filtered = [...allGoods];

  // Поиск
  if (currentFilters.query) {
    const q = currentFilters.query.toLowerCase();
    filtered = filtered.filter(g => g.name.toLowerCase().includes(q));
  }

  // Категории
  if (currentFilters.categories.length > 0) {
    filtered = filtered.filter(g =>
      currentFilters.categories.includes(g.main_category?.toLowerCase())
    );
  }

  // Цена
  filtered = filtered.filter(g => {
    const price = g.discount_price ?? g.actual_price;
    return price >= currentFilters.priceFrom && price <= currentFilters.priceTo;
  });

  // Скидка
  if (currentFilters.discountOnly) {
    filtered = filtered.filter(g =>
      g.discount_price != null && g.discount_price < g.actual_price
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

  renderGoods(filtered, 'replace');
  document.getElementById('load-more').style.display = 'none';
}

function renderGoods(goods, mode = 'replace') {
  const container = document.getElementById('goods-grid');
  if (!container) return;

  if (mode === 'replace') {
    container.innerHTML = '';
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

  // Обработчики кнопок
  document.querySelectorAll('.add-to-cart').forEach(btn => {
    if (!btn.dataset.attached) {
      btn.dataset.attached = 'true';
      btn.addEventListener('click', (e) => {
        const id = e.target.dataset.id;
        let cart = JSON.parse(localStorage.getItem('cart')) || [];
        if (!cart.includes(id)) {
          cart.push(id);
          localStorage.setItem('cart', JSON.stringify(cart));
          updateCartCount();
          showNotification('Товар добавлен в корзину', 'success');
        }
      });
    }
  });
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

function resetPagination() {
  currentPage = 1;
  currentMode = 'pagination';
  loadGoodsPage();
}

// ... остальные функции (updateCartCount, showNotification и т.д.)
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