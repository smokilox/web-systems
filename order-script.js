document.addEventListener('DOMContentLoaded', async function () {
  const API_KEY = window.API_KEY || '0e55ab01-f559-4713-9470-81feb98eb9b7';
  const API_BASE = 'https://edu.std-900.ist.mospolytech.ru';

  const saved = JSON.parse(localStorage.getItem('selectedDishes') || '{}');
  if (!Object.keys(saved).length) {
    document.getElementById('empty-message').style.display = 'block';
    document.getElementById('order-dishes').style.display = 'none';
    return;
  }

  try {
    const response = await fetch(`${API_BASE}/labs/api/dishes?api_key=${API_KEY}`);
    if (!response.ok) throw new Error('Ошибка загрузки блюд');
    const serverDishes = await response.json();
    const dishMap = {};
    serverDishes.forEach(d => {
      dishMap[d.id] = d;
    });

    const categories = ['soup', 'main', 'starter', 'drink', 'dessert'];
    const selectedDishes = {};

    categories.forEach(cat => {
      if (saved[cat]) {
        selectedDishes[cat] = dishMap[saved[cat].id];
      }
    });

    const container = document.getElementById('order-dishes');
    container.innerHTML = '';

    categories.forEach(cat => {
      if (selectedDishes[cat]) {
        const d = selectedDishes[cat];
        const card = document.createElement('div');
        card.className = 'dish-item';
        card.innerHTML = `
          <img src="${d.image || 'placeholder.jpg'}" alt="${d.name}" />
          <p class="price">${d.price}₽</p>
          <p class="name">${d.name}</p>
          <button class="remove-btn" data-category="${cat}">Удалить</button>
        `;
        container.appendChild(card);
      }
    });

    updateSummary(selectedDishes);

    document.querySelectorAll('.remove-btn').forEach(btn => {
      btn.addEventListener('click', () => {
        const cat = btn.dataset.category;
        const current = JSON.parse(localStorage.getItem('selectedDishes') || '{}');
        delete current[cat];
        localStorage.setItem('selectedDishes', JSON.stringify(current));
        location.reload();
      });
    });

    document.getElementById('checkout-form').addEventListener('submit', async (e) => {
      e.preventDefault();

      if (!isValidCombo(selectedDishes)) {
        alert('Состав заказа не соответствует ни одному из доступных комбо.');
        return;
      }

      const form = e.target;
      const deliveryType = form.delivery_type.value;
      const deliveryTime = form.delivery_time.value;

      if (deliveryType === 'by_time' && !deliveryTime) {
        alert('Укажите время доставки');
        return;
      }

      const orderData = {
        full_name: form.full_name.value,
        email: form.email.value,
        phone: form.phone.value,
        delivery_address: form.delivery_address.value,
        delivery_type: deliveryType,
        subscribe: form.subscribe.checked ? 1 : 0,
        comment: form.comment.value || '',
        drink_id: selectedDishes.drink?.id || null,
        soup_id: selectedDishes.soup?.id || null,
        main_course_id: selectedDishes.main?.id || null,
        salad_id: selectedDishes.starter?.id || null,
        dessert_id: selectedDishes.dessert?.id || null,
      };

      if (deliveryType === 'by_time') {
        orderData.delivery_time = deliveryTime;
      }

      try {
        const resp = await fetch(`${API_BASE}/labs/api/orders?api_key=${API_KEY}`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(orderData)
        });

        const result = await resp.json();
        if (!resp.ok) throw new Error(result.error || 'Ошибка сервера');

        alert('Заказ успешно оформлен!');
        localStorage.removeItem('selectedDishes');
        window.location.href = 'menu.html';

      } catch (err) {
        alert('Ошибка: ' + err.message);
      }
    });

  } catch (err) {
    alert('Не удалось загрузить данные: ' + err.message);
  }
});

function isValidCombo(selected) {
  const hasSoup = !!selected.soup;
  const hasMain = !!selected.main;
  const hasStarter = !!selected.starter;
  const hasDrink = !!selected.drink;
  if (!hasDrink) return false;
  return (hasSoup && hasMain && hasStarter) ||
         (hasSoup && hasMain) ||
         (hasSoup && hasStarter) ||
         (hasMain && hasStarter) ||
         (hasMain);
}

function updateSummary(selected) {
  const labels = {
    soup: 'Суп',
    main: 'Главное блюдо',
    starter: 'Салат/стартер',
    drink: 'Напиток',
    dessert: 'Десерт'
  };

  let total = 0;
  ['soup', 'main', 'starter', 'drink', 'dessert'].forEach(cat => {
    const el = document.getElementById(`${cat}-summary`);
    if (selected[cat]) {
      el.textContent = `${labels[cat]}: ${selected[cat].name} ${selected[cat].price}₽`;
      total += selected[cat].price;
    } else {
      const ph = cat === 'main' ? 'Не выбрано' : 'Не выбран';
      el.textContent = `${labels[cat]}: ${ph}`;
    }
  });
  document.getElementById('summary-total').textContent = `Итого: ${total} ₽`;
}