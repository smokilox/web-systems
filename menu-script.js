// menu-script.js
document.addEventListener('DOMContentLoaded', function () {
  // Контейнеры
  const soupGrid = document.getElementById('soup-grid');
  const mainGrid = document.getElementById('main-grid');
  const drinkGrid = document.getElementById('drink-grid');

  // Элементы заказа
  const orderMessage = document.getElementById('order-message');
  const selectedItems = document.getElementById('selected-items');
  const soupItem = document.getElementById('soup-item');
  const mainItem = document.getElementById('main-item');
  const drinkItem = document.getElementById('drink-item');
  const totalPrice = document.getElementById('total-price');

  // Выбранные блюда
  let selected = { soup: null, main: null, drink: null };

  // Сортировка по алфавиту
  const sorted = [...dishes].sort((a, b) => a.name.localeCompare(b.name));
  const soups = sorted.filter(d => d.category === 'soup');
  const mains = sorted.filter(d => d.category === 'main');
  const drinks = sorted.filter(d => d.category === 'drink');

  // Создание карточки
  function createCard(dish) {
    const div = document.createElement('div');
    div.className = 'dish-item';
    div.dataset.keyword = dish.keyword;
    div.innerHTML = `
      <img src="${dish.image}" alt="${dish.name}" />
      <p class="price">${dish.price}₽</p>
      <p class="name">${dish.name}</p>
      <p class="volume">${dish.count}</p>
      <button class="add-btn">Добавить</button>
    `;
    div.querySelector('.add-btn').addEventListener('click', () => selectDish(dish));
    return div;
  }

  // Выбор блюда
  function selectDish(dish) {
    selected[dish.category] = dish;
    updateOrderDisplay();
    highlightSelected(dish.keyword);
  }

  // Обновление отображения заказа
  function updateOrderDisplay() {
    const hasSoup = selected.soup !== null;
    const hasMain = selected.main !== null;
    const hasDrink = selected.drink !== null;
    const hasAny = hasSoup || hasMain || hasDrink;

    if (!hasAny) {
      orderMessage.textContent = 'Ничего не выбрано';
      selectedItems.style.display = 'none';
      return;
    }

    orderMessage.style.display = 'none';
    selectedItems.style.display = 'block';

    soupItem.textContent = hasSoup ? `${selected.soup.name} ${selected.soup.price}₽` : 'Суп не выбран';
    mainItem.textContent = hasMain ? `${selected.main.name} ${selected.main.price}₽` : 'Блюдо не выбрано';
    drinkItem.textContent = hasDrink ? `${selected.drink.name} ${selected.drink.price}₽` : 'Напиток не выбран';

    const total = (selected.soup?.price || 0) + (selected.main?.price || 0) + (selected.drink?.price || 0);
    totalPrice.textContent = `Стоимость заказа: ${total}₽`;
  }

  // Выделение выбранной карточки
  function highlightSelected(keyword) {
    document.querySelectorAll('.dish-item').forEach(el => {
      el.style.border = el.dataset.keyword === keyword ? '2px solid tomato' : '';
    });
  }

  // Рендер карточек
  soups.forEach(d => soupGrid.appendChild(createCard(d)));
  mains.forEach(d => mainGrid.appendChild(createCard(d)));
  drinks.forEach(d => drinkGrid.appendChild(createCard(d)));
});