// orders.js
import { fetchOrders, updateOrder, deleteOrder } from './api.js';

document.addEventListener('DOMContentLoaded', () => {
    loadOrders();
    setupEventListeners();
});

function setupEventListeners() {
    document.getElementById('home-icon')?.addEventListener('click', () => window.location.href = 'index.html');
    document.getElementById('cart-icon')?.addEventListener('click', () => window.location.href = 'cart.html');
    document.getElementById('view-order-close')?.addEventListener('click', closeViewOrderModal);
    document.getElementById('view-order-ok')?.addEventListener('click', closeViewOrderModal);
    document.getElementById('edit-order-close')?.addEventListener('click', closeEditOrderModal);
    document.getElementById('edit-order-cancel')?.addEventListener('click', closeEditOrderModal);
    document.getElementById('edit-order-save')?.addEventListener(saveEditedOrder);
    document.getElementById('delete-order-close')?.addEventListener('click', closeDeleteOrderModal);
    document.getElementById('delete-order-no')?.addEventListener('click', closeDeleteOrderModal);
    document.getElementById('delete-order-yes')?.addEventListener(confirmDeleteOrder);
    document.getElementById('notification-close')?.addEventListener('click', hideNotification);
}

async function loadOrders() {
    try {
        const orders = await fetchOrders();
        displayOrders(orders);
    } catch (error) {
        showNotification('Ошибка загрузки заказов', 'error');
    }
}

function displayOrders(orders) {
    const tbody = document.getElementById('orders-body');
    if (!tbody) return;
    tbody.innerHTML = '';

    orders.forEach((order, idx) => {
        const row = document.createElement('tr');
        row.innerHTML = `
            <td>${idx + 1}</td>
            <td>${formatDate(order.created_at)}</td>
            <td>${order.items?.map(i => i.name).join(', ') || ''}</td>
            <td>${order.total_cost} ₽</td>
            <td>${formatDate(order.delivery_date)}<br>${order.delivery_time}</td>
            <td class="order-actions">
                <span class="action-icon view" data-id="${order.id}">👁️</span>
                <span class="action-icon edit" data-id="${order.id}">✏️</span>
                <span class="action-icon delete" data-id="${order.id}">🗑️</span>
            </td>
        `;
        tbody.appendChild(row);
    });

    document.querySelectorAll('.action-icon.view').forEach(btn =>
        btn.addEventListener('click', (e) => showOrderDetails(e.target.closest('tr'), orders))
    );
    document.querySelectorAll('.action-icon.edit').forEach(btn =>
        btn.addEventListener('click', (e) => showEditOrderModal(e.target.closest('tr'), orders))
    );
    document.querySelectorAll('.action-icon.delete').forEach(btn =>
        btn.addEventListener('click', (e) => showDeleteOrderModal(e.target.dataset.id))
    );
}

function formatDate(isoString) {
    if (!isoString) return '';
    const d = new Date(isoString);
    return `${d.getDate().toString().padStart(2,'0')}.${(d.getMonth()+1).toString().padStart(2,'0')}.${d.getFullYear()} ${d.getHours().toString().padStart(2,'0')}:${d.getMinutes().toString().padStart(2,'0')}`;
}

function findOrderById(orders, id) {
    return orders.find(o => o.id == id);
}

function showOrderDetails(row, orders) {
    const cells = row.cells;
    const order = findOrderById(orders, row.querySelector('.action-icon').dataset.id);
    if (!order) return;

    document.getElementById('view-order-date').textContent = formatDate(order.created_at);
    document.getElementById('view-order-name').textContent = order.name || '-';
    document.getElementById('view-order-phone').textContent = order.phone || '-';
    document.getElementById('view-order-email').textContent = order.email || '-';
    document.getElementById('view-order-address').textContent = order.address || '-';
    document.getElementById('view-order-delivery-date').textContent = formatDate(order.delivery_date);
    document.getElementById('view-order-delivery-time').textContent = order.delivery_time || '-';
    document.getElementById('view-order-items').textContent = (order.items?.map(i => i.name).join(', ')) || '-';
    document.getElementById('view-order-total').textContent = `${order.total_cost} ₽`;
    document.getElementById('view-order-comment').textContent = order.comment || '-';
    document.getElementById('view-order-modal').classList.add('active');
}

function showEditOrderModal(row, orders) {
    const order = findOrderById(orders, row.querySelector('.action-icon').dataset.id);
    if (!order) return;

    document.getElementById('edit-order-date').textContent = formatDate(order.created_at);
    document.getElementById('edit-order-name').value = order.name || '';
    document.getElementById('edit-order-phone').value = order.phone || '';
    document.getElementById('edit-order-email').value = order.email || '';
    document.getElementById('edit-order-address').value = order.address || '';
    document.getElementById('edit-order-delivery-date').value = order.delivery_date ? order.delivery_date.split('T')[0] : '';
    document.getElementById('edit-order-delivery-time').value = order.delivery_time || '08:00-12:00';
    document.getElementById('edit-order-items').textContent = (order.items?.map(i => i.name).join(', ')) || '-';
    document.getElementById('edit-order-total').textContent = `${order.total_cost} ₽`;
    document.getElementById('edit-order-comment').value = order.comment || '';

    document.getElementById('edit-order-modal').dataset.orderId = order.id;
    document.getElementById('edit-order-modal').classList.add('active');
}

async function saveEditedOrder() {
    const id = document.getElementById('edit-order-modal').dataset.orderId;
    const data = {
        name: document.getElementById('edit-order-name').value.trim(),
        phone: document.getElementById('edit-order-phone').value.trim(),
        email: document.getElementById('edit-order-email').value.trim(),
        address: document.getElementById('edit-order-address').value.trim(),
        delivery_date: document.getElementById('edit-order-delivery-date').value,
        delivery_time: document.getElementById('edit-order-delivery-time').value,
        comment: document.getElementById('edit-order-comment').value.trim()
    };

    try {
        await updateOrder(id, data);
        showNotification('Заказ обновлён', 'success');
        closeEditOrderModal();
        loadOrders(); // перезагрузка
    } catch (error) {
        showNotification('Ошибка сохранения: ' + error.message, 'error');
    }
}

function showDeleteOrderModal(id) {
    document.getElementById('delete-order-modal').dataset.orderId = id;
    document.getElementById('delete-order-modal').classList.add('active');
}

async function confirmDeleteOrder() {
    const id = document.getElementById('delete-order-modal').dataset.orderId;
    try {
        await deleteOrder(id);
        showNotification('Заказ удалён', 'success');
        closeDeleteOrderModal();
        loadOrders();
    } catch (error) {
        showNotification('Ошибка удаления: ' + error.message, 'error');
    }
}

// Закрытие модалок
function closeViewOrderModal() { document.getElementById('view-order-modal').classList.remove('active'); }
function closeEditOrderModal() { document.getElementById('edit-order-modal').classList.remove('active'); }
function closeDeleteOrderModal() { document.getElementById('delete-order-modal').classList.remove('active'); }

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