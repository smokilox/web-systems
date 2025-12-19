document.addEventListener('DOMContentLoaded', async function () {
  const API_KEY = window.API_KEY || '0e55ab01-f559-4713-9470-81feb98eb9b7';
  const API_BASE = 'https://edu.std-900.ist.mospolytech.ru';

  const container = document.getElementById('orders-container');

  async function fetchOrders() {
    try {
      const response = await fetch(`${API_BASE}/labs/api/orders?api_key=${API_KEY}`);
      if (!response.ok) throw new Error('Не удалось загрузить заказы');
      const orders = await response.json();
      return orders.sort((a, b) => new Date(b.created_at) - new Date(a.created_at));
    } catch (err) {
      showError(err.message);
      return [];
    }
  }

  async function fetchDish(id) {
    try {
      const response = await fetch(`${API_BASE}/labs/api/dishes/${id}?api_key=${API_KEY}`);
      if (!response.ok) throw new Error(`Не удалось загрузить блюдо ${id}`);
      return await response.json();
    } catch (err) {
      console.warn(err.message);
      return { name: 'Неизвестное блюдо' };
    }
  }

  async function renderOrders() {
    const orders = await fetchOrders();
    if (orders.length === 0) {
      container.innerHTML = '<p>У вас пока нет заказов.</p>';
      return;
    }

    let html = `
      <table class="orders-table">
        <thead>
          <tr>
            <th>№</th>
            <th>Дата оформления</th>
            <th>Состав заказа</th>
            <th>Стоимость</th>
            <th>Время доставки</th>
            <th>Действия</th>
          </tr>
        </thead>
        <tbody>
    `;

    for (let i = 0; i < orders.length; i++) {
      const order = orders[i];
      const dishIds = [
        order.soup_id, order.main_course_id, order.salad_id,
        order.drink_id, order.dessert_id
      ].filter(Boolean);

      // Получаем названия блюд
      const dishNames = [];
      for (const id of dishIds) {
        const dish = await fetchDish(id);
        dishNames.push(dish.name);
      }

      const deliveryTime = order.delivery_type === 'by_time'
        ? order.delivery_time
        : 'Как можно скорее (с 07:00 до 23:00)';

      html += `
        <tr>
          <td>${i + 1}</td>
          <td>${new Date(order.created_at).toLocaleString()}</td>
          <td>${dishNames.join(', ')}</td>
          <td>${calculateTotal(order)}₽</td>
          <td>${deliveryTime}</td>
          <td class="actions">
            <button class="btn-icon view-btn" data-id="${order.id}">👁️</button>
            <button class="btn-icon edit-btn" data-id="${order.id}">✏️</button>
            <button class="btn-icon delete-btn" data-id="${order.id}">🗑️</button>
          </td>
        </tr>
      `;
    }

    html += '</tbody></table>';
    container.innerHTML = html;

    addEventListeners();
  }

  function calculateTotal(order) {
    // В реальном проекте нужно получать цены с сервера.
    // Здесь упрощённо: сумма ID * 10 (для демонстрации).
    // В вашем случае лучше хранить цену в заказе или получать с сервера.
    let total = 0;
    if (order.soup_id) total += 195;
    if (order.main_course_id) total += 150;
    if (order.salad_id) total += 330;
    if (order.drink_id) total += 120;
    if (order.dessert_id) total += 220;
    return total;
  }

  function addEventListeners() {
    document.querySelectorAll('.view-btn').forEach(btn => {
      btn.addEventListener('click', () => showOrderDetails(btn.dataset.id));
    });

    document.querySelectorAll('.edit-btn').forEach(btn => {
      btn.addEventListener('click', () => showEditModal(btn.dataset.id));
    });

    document.querySelectorAll('.delete-btn').forEach(btn => {
      btn.addEventListener('click', () => showDeleteConfirm(btn.dataset.id));
    });
  }

  async function showOrderDetails(orderId) {
    const order = await fetchOrder(orderId);
    if (!order) return;

    const modal = createModal(`
      <div class="modal-header">
        <h3>Заказ №${order.id}</h3>
        <button class="close-btn">&times;</button>
      </div>
      <div>
        <p><strong>ФИО:</strong> ${order.full_name}</p>
        <p><strong>Email:</strong> ${order.email}</p>
        <p><strong>Телефон:</strong> ${order.phone}</p>
        <p><strong>Адрес:</strong> ${order.delivery_address}</p>
        <p><strong>Тип доставки:</strong> ${order.delivery_type === 'now' ? 'Как можно скорее' : 'К указанному времени'}</p>
        ${order.delivery_type === 'by_time' ? `<p><strong>Время доставки:</strong> ${order.delivery_time}</p>` : ''}
        <p><strong>Комментарий:</strong> ${order.comment || '—'}</p>
        <p><strong>Дата создания:</strong> ${new Date(order.created_at).toLocaleString()}</p>
        <p><strong>Дата изменения:</strong> ${new Date(order.updated_at).toLocaleString()}</p>
        <p><strong>Состав:</strong> ${getDishNames(order)}</p>
        <p><strong>Стоимость:</strong> ${calculateTotal(order)}₽</p>
      </div>
      <div class="modal-footer">
        <button class="btn-secondary close-modal">Ок</button>
      </div>
    `);

    document.body.appendChild(modal);
    setupModalClose(modal);
  }

  async function showEditModal(orderId) {
    const order = await fetchOrder(orderId);
    if (!order) return;

    const modal = createModal(`
      <div class="modal-header">
        <h3>Редактировать заказ №${order.id}</h3>
        <button class="close-btn">&times;</button>
      </div>
      <form id="edit-form">
        <input type="hidden" name="id" value="${order.id}" />
        <div class="form-group">
          <label>ФИО *</label>
          <input type="text" name="full_name" value="${order.full_name}" required />
        </div>
        <div class="form-group">
          <label>Email *</label>
          <input type="email" name="email" value="${order.email}" required />
        </div>
        <div class="form-group">
          <label>Телефон *</label>
          <input type="tel" name="phone" value="${order.phone}" required />
        </div>
        <div class="form-group">
          <label>Адрес доставки *</label>
          <input type="text" name="delivery_address" value="${order.delivery_address}" required />
        </div>
        <div class="form-group">
          <label>Тип доставки</label>
          <select name="delivery_type" required>
            <option value="now" ${order.delivery_type === 'now' ? 'selected' : ''}>Как можно скорее</option>
            <option value="by_time" ${order.delivery_type === 'by_time' ? 'selected' : ''}>К указанному времени</option>
          </select>
        </div>
        <div class="form-group" id="time-field" style="${order.delivery_type === 'by_time' ? '' : 'display:none'}">
          <label>Время доставки</label>
          <input type="time" name="delivery_time" min="07:00" max="23:00" value="${order.delivery_time || ''}" />
        </div>
        <div class="form-group">
          <label>Комментарий</label>
          <textarea name="comment">${order.comment || ''}</textarea>
        </div>
        <div class="modal-footer">
          <button type="button" class="btn-secondary cancel-edit">Отмена</button>
          <button type="submit" class="btn-primary save-edit">Сохранить</button>
        </div>
      </form>
    `);

    document.body.appendChild(modal);
    setupModalClose(modal);

    // Обработчик изменения типа доставки
    const typeSelect = modal.querySelector('[name="delivery_type"]');
    const timeField = modal.querySelector('#time-field');
    typeSelect.addEventListener('change', () => {
      timeField.style.display = typeSelect.value === 'by_time' ? 'block' : 'none';
    });

    // Обработчик формы
    modal.querySelector('#edit-form').addEventListener('submit', async (e) => {
      e.preventDefault();
      const formData = new FormData(e.target);
      const data = Object.fromEntries(formData.entries());

      try {
        const resp = await fetch(`${API_BASE}/labs/api/orders/${order.id}?api_key=${API_KEY}`, {
          method: 'PUT',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(data)
        });

        if (!resp.ok) throw new Error('Ошибка при редактировании');

        showModalMessage('Заказ успешно изменён!');
        setTimeout(() => {
          modal.remove();
          renderOrders(); // Обновляем список
        }, 1500);

      } catch (err) {
        showError(err.message);
      }
    });

    modal.querySelector('.cancel-edit').addEventListener('click', () => modal.remove());
  }

  async function showDeleteConfirm(orderId) {
    const modal = createModal(`
      <div class="modal-header">
        <h3>Удалить заказ?</h3>
        <button class="close-btn">&times;</button>
      </div>
      <p>Вы уверены, что хотите удалить этот заказ? Это действие нельзя отменить.</p>
      <div class="modal-footer">
        <button class="btn-secondary cancel-delete">Отмена</button>
        <button class="btn-danger confirm-delete">Да, удалить</button>
      </div>
    `);

    document.body.appendChild(modal);
    setupModalClose(modal);

    modal.querySelector('.confirm-delete').addEventListener('click', async () => {
      try {
        const resp = await fetch(`${API_BASE}/labs/api/orders/${orderId}?api_key=${API_KEY}`, {
          method: 'DELETE'
        });

        if (!resp.ok) throw new Error('Ошибка при удалении');

        showModalMessage('Заказ успешно удалён!');
        setTimeout(() => {
          modal.remove();
          renderOrders(); // Обновляем список
        }, 1500);

      } catch (err) {
        showError(err.message);
      }
    });

    modal.querySelector('.cancel-delete').addEventListener('click', () => modal.remove());
  }

  async function fetchOrder(id) {
    try {
      const response = await fetch(`${API_BASE}/labs/api/orders/${id}?api_key=${API_KEY}`);
      if (!response.ok) throw new Error('Не удалось загрузить заказ');
      return await response.json();
    } catch (err) {
      showError(err.message);
      return null;
    }
  }

  function getDishNames(order) {
    const names = [];
    if (order.soup_id) names.push('Суп');
    if (order.main_course_id) names.push('Главное блюдо');
    if (order.salad_id) names.push('Салат');
    if (order.drink_id) names.push('Напиток');
    if (order.dessert_id) names.push('Десерт');
    return names.join(', ') || '—';
  }

  function createModal(html) {
    const overlay = document.createElement('div');
    overlay.className = 'modal-overlay';
    overlay.innerHTML = `<div class="modal-content">${html}</div>`;
    return overlay;
  }

  function setupModalClose(modal) {
    modal.querySelector('.close-btn').addEventListener('click', () => modal.remove());
    modal.addEventListener('click', (e) => {
      if (e.target === modal) modal.remove();
    });
  }

  function showModalMessage(message) {
    const msg = document.createElement('div');
    msg.style.cssText = `
      position: fixed;
      top: 20px;
      left: 50%;
      transform: translateX(-50%);
      background: #27ae60;
      color: white;
      padding: 15px 25px;
      border-radius: 6px;
      z-index: 1001;
      box-shadow: 0 4px 12px rgba(0,0,0,0.2);
    `;
    msg.textContent = message;
    document.body.appendChild(msg);
    setTimeout(() => msg.remove(), 3000);
  }

  function showError(message) {
    alert(`Ошибка: ${message}`);
  }

  renderOrders();
});