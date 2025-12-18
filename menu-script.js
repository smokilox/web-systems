document.addEventListener('DOMContentLoaded', function () {
  // === Глобальные переменные ===
  let dishes = []; // Будет заполнен после загрузки с API
  let selected = {
    soup: null,
    main: null,
    starter: null,
    drink: null,
    dessert: null
  };
  let activeFilters = {};

  // === Получаем DOM-элементы ===
  const soupGrid = document.getElementById('soup-grid');
  const mainGrid = document.getElementById('main-grid');
  const starterGrid = document.getElementById('starter-grid');
  const drinkGrid = document.getElementById('drink-grid');
  const dessertGrid = document.getElementById('dessert-grid');

  const orderMessage = document.getElementById('order-message');
  const selectedItems = document.getElementById('selected-items');
  const soupItem = document.getElementById('soup-item');
  const mainItem = document.getElementById('main-item');
  const starterItem = document.getElementById('starter-item');
  const drinkItem = document.getElementById('drink-item');
  const dessertItem = document.getElementById('dessert-item');
  const totalPrice = document.getElementById('total-price');

  const orderForm = document.getElementById('order-form');
  const filterButtons = document.querySelectorAll('.filter-btn');

  // === Функция загрузки блюд с API ===
  async function loadDishes() {
    try {
      // Для Netlify/GitHub Pages используем этот URL
      const response = await fetch('https://edu.std-900.ist.mospolytech.ru/labs/api/dishes');
      
      // Если вы используете хостинг Московского Политеха, раскомментируйте эту строку вместо предыдущей:
      // const response = await fetch('http://lab7-api.std-900.ist.mospolytech.ru/api/dishes');

      if (!response.ok) {
        throw new Error(`Ошибка HTTP: ${response.status}`);
      }
      
      dishes = await response.json();
      
      // После загрузки данных инициализируем страницу
      initializePage();
    } catch (error) {
      console.error('Не удалось загрузить список блюд:', error);
      alert('Произошла ошибка при загрузке меню. Пожалуйста, обновите страницу.');
    }
  }

  // === Инициализация страницы (вызывается после загрузки данных) ===
  function initializePage() {
    // Инициализация фильтров
    filterButtons.forEach(btn => {
      btn.addEventListener('click', () => toggleFilter(btn));
    });

    // Сортировка и группировка
    const sorted = [...dishes].sort((a, b) => a.name.localeCompare(b.name));
    const soups = sorted.filter(d => d.category === 'soup');
    const mains = sorted.filter(d => d.category === 'main');
    const starters = sorted.filter(d => d.category === 'starter');
    const drinks = sorted.filter(d => d.category === 'drink');
    const desserts = sorted.filter(d => d.category === 'dessert');

    // Сохраняем группы в глобальной области видимости для функции renderCategory
    window.dishGroups = { soups, mains, starters, drinks, desserts };

    // Рендерим все категории
    renderAll();
    updateOrderDisplay();
  }

  // === Остальная логика (без изменений, кроме получения групп блюд из window) ===

  function createCard(dish) {
    const div = document.createElement('div');
    div.className = 'dish-item';
    div.dataset.keyword = dish.keyword;
    // Заменяем расширение, так как API отдает изображения без него
    const imageUrl = dish.image.endsWith('.jpg') || dish.image.endsWith('.png') || dish.image.endsWith('.jpeg')
      ? dish.image
      : dish.image + '.jpg';
    div.innerHTML = `
      <img src="${imageUrl}" alt="${dish.name}" onerror="this.src='https://via.placeholder.com/300?text=Нет+изображения'" />
      <p class="price">${dish.price}₽</p>
      <p class="name">${dish.name}</p>
      <p class="volume">${dish.count}</p>
      <button class="add-btn">Добавить</button>
    `;
    div.querySelector('.add-btn').addEventListener('click', () => selectDish(dish));
    return div;
  }

  function selectDish(dish) {
    document.querySelectorAll('.dish-item').forEach(el => el.classList.remove('selected'));
    selected[dish.category] = dish;
    updateOrderDisplay();
    const card = document.querySelector(`[data-keyword="${dish.keyword}"]`);
    if (card) card.classList.add('selected');
  }

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

  function toggleFilter(button) {
    const category = button.closest('section').id.replace('-section', '');
    const kind = button.dataset.kind;

    document.querySelectorAll(`#${category}-section .filter-btn`).forEach(btn => {
      btn.classList.remove('active');
    });

    if (activeFilters[category] === kind) {
      delete activeFilters[category];
      button.classList.remove('active');
    } else {
      activeFilters[category] = kind;
      button.classList.add('active');
    }

    renderCategory(category);
  }

  function renderCategory(category) {
    let grid;
    let items;

    switch (category) {
      case 'soup':
        grid = soupGrid;
        items = window.dishGroups.soups;
        break;
      case 'main':
        grid = mainGrid;
        items = window.dishGroups.mains;
        break;
      case 'starter':
        grid = starterGrid;
        items = window.dishGroups.starters;
        break;
      case 'drink':
        grid = drinkGrid;
        items = window.dishGroups.drinks;
        break;
      case 'dessert':
        grid = dessertGrid;
        items = window.dishGroups.desserts;
        break;
      default:
        return;
    }

    grid.innerHTML = '';
    let filtered = items;
    if (activeFilters[category]) {
      filtered = items.filter(d => d.kind === activeFilters[category]);
    }

    filtered.forEach(d => {
      const card = createCard(d);
      if (selected[category] && selected[category].keyword === d.keyword) {
        card.classList.add('selected');
      }
      grid.appendChild(card);
    });
  }

  function renderAll() {
    renderCategory('soup');
    renderCategory('main');
    renderCategory('starter');
    renderCategory('drink');
    renderCategory('dessert');
  }

  // === Логика проверки заказа и отправки формы (без изменений) ===

  function showPopup(message) {
    const overlay = document.createElement('div');
    overlay.className = 'popup-overlay';
    const content = document.createElement('div');
    content.className = 'popup-content';
    const text = document.createElement('p');
    text.textContent = message;
    const button = document.createElement('button');
    button.className = 'popup-btn';
    button.textContent = 'Окей 👌';
    button.addEventListener('click', () => overlay.remove());
    content.appendChild(text);
    content.appendChild(button);
    overlay.appendChild(content);
    document.body.appendChild(overlay);
    overlay.addEventListener('click', (e) => {
      if (e.target === overlay) overlay.remove();
    });
  }

  function validateOrder() {
    const hasSoup = selected.soup !== null;
    const hasMain = selected.main !== null;
    const hasStarter = selected.starter !== null;
    const hasDrink = selected.drink !== null;
    const hasDessert = selected.dessert !== null;
    const hasAny = hasSoup || hasMain || hasStarter || hasDrink || hasDessert;

    if (!hasAny) {
      showPopup('Ничего не выбрано. Выберите блюда для заказа');
      return false;
    }
    if ((hasSoup || hasMain || hasStarter) && !hasDrink) {
      showPopup('Выберите напиток');
      return false;
    }
    if (hasSoup && !hasMain && !hasStarter) {
      showPopup('Выберите главное блюдо/салат/стартер');
      return false;
    }
    if (hasStarter && !hasSoup && !hasMain) {
      showPopup('Выберите суп или главное блюдо');
      return false;
    }
    if ((hasDrink || hasDessert) && !hasMain && !hasSoup && !hasStarter) {
      showPopup('Выберите главное блюдо');
      return false;
    }
    return true;
  }

  // Обработчик отправки формы
  if (orderForm) {
    orderForm.addEventListener('submit', function (event) {
      event.preventDefault();
      if (validateOrder()) {
        alert('Заказ оформлен успешно! Спасибо за покупку!');
      }
    });
  }

  // === ЗАПУСК ЗАГРУЗКИ ===
  loadDishes();
});