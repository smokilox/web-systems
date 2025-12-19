// menu-script.js
document.addEventListener('DOMContentLoaded', function () {
  // Контейнеры (можно убрать, если используем getElementById)
  const soupGrid = document.getElementById('soup-grid');
  const mainGrid = document.getElementById('main-grid');
  const starterGrid = document.getElementById('starter-grid');
  const drinkGrid = document.getElementById('drink-grid');
  const dessertGrid = document.getElementById('dessert-grid');

  // Элементы заказа
  const orderMessage = document.getElementById('order-message');
  const selectedItems = document.getElementById('selected-items');
  const soupItem = document.getElementById('soup-item');
  const mainItem = document.getElementById('main-item');
  const starterItem = document.getElementById('starter-item');
  const drinkItem = document.getElementById('drink-item');
  const dessertItem = document.getElementById('dessert-item');
  const totalPrice = document.getElementById('total-price');

  // Выбранные блюда
  let selected = {
    soup: null,
    main: null,
    starter: null,
    drink: null,
    dessert: null
  };

  // Фильтры
  const filterButtons = document.querySelectorAll('.filter-btn');
  let activeFilters = {};

  // Инициализация фильтров
  filterButtons.forEach(btn => {
    btn.addEventListener('click', () => toggleFilter(btn));
  });

  // Сортировка по алфавиту
  const sorted = [...dishes].sort((a, b) => a.name.localeCompare(b.name));

  // Группировка по категориям
  const soups = sorted.filter(d => d.category === 'soup');
  const mains = sorted.filter(d => d.category === 'main');
  const starters = sorted.filter(d => d.category === 'starter');
  const drinks = sorted.filter(d => d.category === 'drink');
  const desserts = sorted.filter(d => d.category === 'dessert');

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
    // Снимаем выделение со всех карточек
    document.querySelectorAll('.dish-item').forEach(el => el.classList.remove('selected'));
    // Устанавливаем новое блюдо
    selected[dish.category] = dish;
    updateOrderDisplay();
    // Выделяем карточку
    const card = document.querySelector(`[data-keyword="${dish.keyword}"]`);
    if (card) card.classList.add('selected');
  }

  // Обновление отображения заказа
  function updateOrderDisplay() {
    const hasSoup = selected.soup !== null;
    const hasMain = selected.main !== null;
    const hasStarter = selected.starter !== null;
    const hasDrink = selected.drink !== null;
    const hasDessert = selected.dessert !== null;
    const hasAny = hasSoup || hasMain || hasStarter || hasDrink || hasDessert;

    if (!hasAny) {
      orderMessage.textContent = 'Ничего не выбрано';
      selectedItems.style.display = 'none';
      return;
    }

    orderMessage.style.display = 'none';
    selectedItems.style.display = 'block';

    soupItem.textContent = hasSoup ? `${selected.soup.name} ${selected.soup.price}₽` : 'Суп не выбран';
    mainItem.textContent = hasMain ? `${selected.main.name} ${selected.main.price}₽` : 'Блюдо не выбрано';
    starterItem.textContent = hasStarter ? `${selected.starter.name} ${selected.starter.price}₽` : 'Стартер не выбран';
    drinkItem.textContent = hasDrink ? `${selected.drink.name} ${selected.drink.price}₽` : 'Напиток не выбран';
    dessertItem.textContent = hasDessert ? `${selected.dessert.name} ${selected.dessert.price}₽` : 'Десерт не выбран';

    const total = Object.values(selected)
      .filter(Boolean)
      .reduce((sum, dish) => sum + dish.price, 0);
    totalPrice.textContent = `Стоимость заказа: ${total}₽`;
  }

  // Переключение фильтра
  function toggleFilter(button) {
    const category = button.closest('section').id.replace('-section', '');
    const kind = button.dataset.kind;

    // Удаляем активный класс у всех кнопок этой категории
    document.querySelectorAll(`#${category}-section .filter-btn`).forEach(btn => {
      btn.classList.remove('active');
    });

    // Если кнопка уже была активна — снимаем фильтр
    if (activeFilters[category] === kind) {
      delete activeFilters[category];
      button.classList.remove('active');
    } else {
      // Устанавливаем новый фильтр
      activeFilters[category] = kind;
      button.classList.add('active');
    }

    // Рендерим заново с учётом фильтров
    renderCategory(category);
  }

  // Рендер одной категории
  function renderCategory(category) {
    let grid;
    let items;

    switch (category) {
      case 'soup':
        grid = document.getElementById('soup-grid');
        items = soups;
        break;
      case 'main':
        grid = document.getElementById('main-grid');
        items = mains;
        break;
      case 'starter':
        grid = document.getElementById('starter-grid');
        items = starters;
        break;
      case 'drink':
        grid = document.getElementById('drink-grid');
        items = drinks;
        break;
      case 'dessert':
        grid = document.getElementById('dessert-grid');
        items = desserts;
        break;
      default:
        return;
    }

    // Очищаем контейнер
    grid.innerHTML = '';

    // Применяем фильтр
    let filtered = items;
    if (activeFilters[category]) {
      filtered = items.filter(d => d.kind === activeFilters[category]);
    }

    // Выводим карточки
    filtered.forEach(d => {
      const card = createCard(d);
      // Если это выбранное блюдо — добавляем класс selected
      if (selected[category] && selected[category].keyword === d.keyword) {
        card.classList.add('selected');
      }
      grid.appendChild(card);
    });
  }

  // Рендер всех категорий
  function renderAll() {
    renderCategory('soup');
    renderCategory('main');
    renderCategory('starter');
    renderCategory('drink');
    renderCategory('dessert');
  }

  // Инициализация
  renderAll();
  updateOrderDisplay();
});