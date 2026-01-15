// catalog.js
import { fetchGoods } from './api.js';

let currentPage = 1;
let totalItems = 0;
let itemsPerPage = 10;
let currentSortOrder = 'rating_desc';
let currentFilters = {
    categories: [],
    priceFrom: 100,
    priceTo: 5000,
    discountOnly: false
};

document.addEventListener('DOMContentLoaded', () => {
    loadGoods();
    setupEventListeners();
});

function setupEventListeners() {
    document.querySelector('.search-bar button')?.addEventListener('click', searchGoods);
    document.getElementById('sort-order')?.addEventListener('change', (e) => {
        currentSortOrder = e.target.value;
        resetAndReload();
    });
    document.querySelector('.apply-button')?.addEventListener('click', applyFilters);
    document.getElementById('load-more')?.addEventListener('click', loadMoreGoods);
    document.getElementById('cart-icon')?.addEventListener('click', () => window.location.href = 'cart.html');
    document.getElementById('account-icon')?.addEventListener('click', () => window.location.href = 'orders.html');
    document.getElementById('notification-close')?.addEventListener('click', hideNotification);
}

async function loadGoods() {
    try {
        const params = {
            page: currentPage,
            per_page: itemsPerPage,
            sort_order: currentSortOrder
        };

        if (currentFilters.categories.length > 0) {
            params.category = currentFilters.categories;
        }
        if (currentFilters.priceFrom) params.price_from = currentFilters.priceFrom;
        if (currentFilters.priceTo < Infinity) params.price_to = currentFilters.priceTo;
        if (currentFilters.discountOnly) params.discount_only = true;

        const data = await fetchGoods(params);

        if (data._pagination) {
            totalItems = data._pagination.total_count;
            itemsPerPage = data._pagination.per_page;
        }

        displayGoods(data.goods);
        updateLoadMoreButton();
    } catch (error) {
        showNotification('Ошибка загрузки товаров: ' + error.message, 'error');
    }
}

function displayGoods(goods) {
    const container = document.getElementById('goods-grid');
    if (!container) return;

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
            <img src="${good.image_url || 'https://via.placeholder.com/200'}" alt="${good.name}" class="good-image">
            <div class="good-info">
                <h3 class="good-name">${good.name}</h3>
                <div class="good-rating">
                    <span>${good.rating.toFixed(1)}</span>
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
                showNotification('Товар добавлен в корзину', 'success');
            }
        })
    );
}

function updateLoadMoreButton() {
    const btn = document.getElementById('load-more');
    if (!btn) return;
    const totalPages = Math.ceil(totalItems / itemsPerPage);
    btn.style.display = (currentPage < totalPages) ? 'block' : 'none';
}

function loadMoreGoods() {
    currentPage++;
    loadGoods();
}

function applyFilters() {
    currentFilters.categories = Array.from(document.querySelectorAll('input[type="checkbox"][value]'))
        .filter(cb => cb.checked && ['electronics','computers','phones','tablets','accessories'].includes(cb.value))
        .map(cb => cb.value);
    
    currentFilters.priceFrom = parseInt(document.getElementById('price-from')?.value) || 0;
    currentFilters.priceTo = parseInt(document.getElementById('price-to')?.value) || Infinity;
    currentFilters.discountOnly = document.getElementById('discount-only')?.checked || false;

    resetAndReload();
}

function resetAndReload() {
    currentPage = 1;
    document.getElementById('goods-grid').innerHTML = '';
    loadGoods();
}

function searchGoods() {
    const term = document.querySelector('.search-bar input')?.value.trim();
    if (term) showNotification(`Поиск: "${term}"`, 'info');
}

// Уведомления
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