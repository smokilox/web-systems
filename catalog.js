// catalog.js
import { fetchGoodsPage } from './api.js';

let currentPage = 1;
let totalItems = 0;
let perPage = 10;
let currentSortOrder = 'rating_desc';

document.addEventListener('DOMContentLoaded', () => {
  loadGoodsPage();
  setupEventListeners();
  updateCartCount();
});

function setupEventListeners() {
  document.getElementById('sort-order')?.addEventListener('change', (e) => {
    currentSortOrder = e.target.value;
    resetAndReload();
  });

  document.getElementById('load-more')?.addEventListener('click', () => {
    currentPage++;
    loadGoodsPage();
  });

  document.getElementById('cart-icon')?.addEventListener('click', () => window.location.href = 'cart.html');
  document.getElementById('account-icon')?.addEventListener('click', () => window.location.href = 'orders.html');
  document.getElementById('notification-close')?.addEventListener('click', hideNotification);
}

function resetAndReload() {
  currentPage = 1;
  totalItems = 0;
  document.getElementById('goods-grid').innerHTML = '<div class="loading">Загрузка...</div>';
  document.getElementById('load-more').style.display = 'block';
  loadGoodsPage();
}

async function loadGoodsPage() {
  try {
    const data = await fetchGoodsPage(currentPage, perPage, currentSortOrder);
    
    const { _pagination, goods } = data;
    if (_pagination) {
      totalItems = _pagination.total_count || 0;
    }

    const container = document.getElementById('goods-grid');
    if (currentPage === 1) {
      container.innerHTML = ''; // очищаем при первой загрузке или смене сортировки
    }

    // Добавляем товары
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

    // Обработчики для новых кнопок
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

    // Управление кнопкой "Загрузить ещё"
    const totalPages = Math.ceil(totalItems / perPage);
    const loadMoreBtn = document.getElementById('load-more');
    if (loadMoreBtn) {
      loadMoreBtn.style.display = (currentPage < totalPages) ? 'block' : 'none';
    }

  } catch (error) {
    showNotification('Ошибка загрузки товаров: ' + error.message, 'error');
  }
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