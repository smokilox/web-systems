// cart.js
import { fetchGoodById, createOrder } from './api.js';

document.addEventListener('DOMContentLoaded', () => {
    loadCartItems();
    setupEventListeners();
});

function setupEventListeners() {
    document.getElementById('home-icon')?.addEventListener('click', () => window.location.href = 'index.html');
    document.getElementById('account-icon')?.addEventListener('click', () => window.location.href = 'orders.html');
    document.getElementById('order-delivery-date')?.addEventListener('change', updateTotalCost);
    document.getElementById('order-delivery-time')?.addEventListener('change', updateTotalCost);
    document.getElementById('reset-button')?.addEventListener('click', resetForm);
    document.getElementById('place-order-button')?.addEventListener('click', placeOrder);
    document.getElementById('notification-close')?.addEventListener('click', hideNotification);
}

async function loadCartItems() {
    const cart = JSON.parse(localStorage.getItem('cart')) || [];
    const container = document.getElementById('cart-items');
    if (!container) return;

    if (cart.length === 0) {
        container.innerHTML = '<div class="empty-cart">Корзина пуста. Перейдите в каталог, чтобы добавить товары.</div>';
        updateTotalCost();
        return;
    }

    try {
        const goods = await Promise.all(cart.map(id => fetchGoodById(id)));
        displayCartItems(goods);
        updateTotalCost();
    } catch (error) {
        showNotification('Ошибка загрузки корзины', 'error');
    }
}

function displayCartItems(goods) {
    const container = document.getElementById('cart-items');
    container.innerHTML = '';

    goods.forEach(good => {
        if (!good) return;
        const ratingStars = Array.from({length: 5}, (_, i) =>
            `<span class="${i < Math.floor(good.rating) ? 'star' : 'star empty'}">★</span>`
        ).join('');

        let priceHtml = '';
        if (good.discount_price && good.discount_price < good.actual_price) {
            const disc = Math.round(((good.actual_price - good.discount_price) / good.actual_price) * 100);
            priceHtml = `
                <div class="cart-item-price">
                    <span class="cart-item-actual-price">${good.discount_price} ₽</span>
                    <span class="cart-item-discount-price">${good.actual_price} ₽</span>
                    <span class="cart-item-discount-percent">-${disc}%</span>
                </div>
            `;
        } else {
            priceHtml = `<div class="cart-item-price"><span class="cart-item-actual-price">${good.actual_price} ₽</span></div>`;
        }

        const item = document.createElement('div');
        item.className = 'cart-item';
        item.innerHTML = `
            <img src="${good.image_url || 'https://via.placeholder.com/200'}" class="cart-item-image">
            <div class="cart-item-info">
                <h3 class="cart-item-name">${good.name}</h3>
                <div class="cart-item-rating">
                    <span>${good.rating.toFixed(1)}</span>
                    <div class="cart-item-stars">${ratingStars}</div>
                </div>
                ${priceHtml}
                <button class="remove-from-cart" data-id="${good.id}">Удалить</button>
            </div>
        `;
        container.appendChild(item);
    });

    document.querySelectorAll('.remove-from-cart').forEach(btn =>
        btn.addEventListener('click', (e) => {
            const id = e.target.dataset.id;
            let cart = JSON.parse(localStorage.getItem('cart')) || [];
            const idx = cart.indexOf(id);
            if (idx > -1) {
                cart.splice(idx, 1);
                localStorage.setItem('cart', JSON.stringify(cart));
                showNotification('Товар удалён', 'success');
                loadCartItems();
            }
        })
    );
}

function updateTotalCost() {
    const cart = JSON.parse(localStorage.getItem('cart')) || [];
    if (cart.length === 0) {
        document.getElementById('total-cost').textContent = 'Итоговая стоимость: 0 ₽';
        document.getElementById('delivery-cost').textContent = '(стоимость доставки 0 ₽)';
        return;
    }

    // Здесь можно сделать запрос за ценами, но для простоты — оставим как есть
    // В реальном проекте нужно пересчитывать по данным из API
    // Для демонстрации — фиктивный расчёт
    let baseCost = 0;
    // Предположим, что все товары по 1000 ₽
    baseCost = cart.length * 1000;

    let delivery = 200;
    const dateInput = document.getElementById('order-delivery-date');
    const timeSelect = document.getElementById('order-delivery-time');
    if (dateInput?.value) {
        const date = new Date(dateInput.value);
        const day = date.getDay();
        if (day === 0 || day === 6) {
            delivery += 300;
        } else if (timeSelect?.value?.startsWith('18')) {
            delivery += 200;
        }
    }

    const total = baseCost + delivery;
    document.getElementById('total-cost').textContent = `Итоговая стоимость: ${total} ₽`;
    document.getElementById('delivery-cost').textContent = `(стоимость доставки ${delivery} ₽)`;
}

function resetForm() {
    const fields = ['order-name', 'order-phone', 'order-email', 'order-address', 'order-comment'];
    fields.forEach(id => { const el = document.getElementById(id); if (el) el.value = ''; });
    document.getElementById('subscribe-checkbox').checked = false;
    document.getElementById('order-delivery-date').value = '';
    document.getElementById('order-delivery-time').value = '08:00-12:00';
    updateTotalCost();
}

async function placeOrder() {
    const cart = JSON.parse(localStorage.getItem('cart')) || [];
    if (cart.length === 0) {
        showNotification('Корзина пуста', 'info');
        return;
    }

    const data = {
        name: document.getElementById('order-name')?.value.trim(),
        phone: document.getElementById('order-phone')?.value.trim(),
        email: document.getElementById('order-email')?.value.trim(),
        address: document.getElementById('order-address')?.value.trim(),
        delivery_date: document.getElementById('order-delivery-date')?.value,
        delivery_time: document.getElementById('order-delivery-time')?.value,
        comment: document.getElementById('order-comment')?.value.trim(),
        subscribe: document.getElementById('subscribe-checkbox')?.checked,
        goods_ids: cart
    };

    if (!data.name || !data.phone || !data.email || !data.address || !data.delivery_date) {
        showNotification('Заполните все поля', 'error');
        return;
    }

    try {
        await createOrder(data);
        localStorage.removeItem('cart');
        showNotification('Заказ оформлен!', 'success');
        setTimeout(() => window.location.href = 'index.html', 2000);
    } catch (error) {
        showNotification('Ошибка оформления: ' + error.message, 'error');
    }
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