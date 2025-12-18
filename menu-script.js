document.addEventListener('DOMContentLoaded', function () {
  // === 1. ГЛОБАЛЬНЫЕ ПЕРЕМЕННЫЕ ===
  let dishes = []; // Сюда загрузятся блюда с API
  let selected = {
    soup: null,
    main: null,
    starter: null,
    drink: null,
    dessert: null
  };
  let activeFilters = {};

  // === 2. ПОДКЛЮЧЕНИЕ ЭЛЕМЕНТОВ СТРАНИЦЫ ===
  const grids = {
    soup: document.getElementById('soup-grid'),
    main: document.getElementById('main-grid'),
    starter: document.getElementById('starter-grid'),
    drink: document.getElementById('drink-grid'),
    dessert: document.getElementById('dessert-grid')
  };

  const orderMessage = document.getElementById('order-message');
  const selectedItems = document.getElementById('selected-items');
  const orderDisplay = {
    soup: document.getElementById('soup-item'),
    main: document.getElementById('main-item'),
    starter: document.getElementById('starter-item'),
    drink: document.getElementById('drink-item'),
    dessert: document.getElementById('dessert-item'),
    total: document.getElementById('total-price')
  };

  const orderForm = document.getElementById('order-form');
  const filterButtons = document.querySelectorAll('.filter-btn');

  // === 3. ФУНКЦИЯ ЗАГРУЗКИ ДАННЫХ С СЕРВЕРА ===
  async function loadDishes() {
    try {
      // !!! ВАЖНО: ВЫБЕРИТЕ ОДИН ИЗ ДВУХ URL !!!
      // Если вы размещаете сайт на Netlify или GitHub Pages:
      const apiUrl = 'https://edu.std-900.ist.mospolytech.ru/labs/api/dishes';
      
      // Если вы используете хостинг от Московского Политеха (раскомментируйте эту строку вместо предыдущей):
      //const apiUrl = 'http://lab7-api.std-900.ist.mospolytech.ru/api/dishes';

      const response = await fetch(apiUrl);
      
      if (!response.ok) {
        throw new Error(`Сервер вернул ошибку: ${response.status}`);
      }
      
      dishes = await response.json();
      console.log('✅ Блюда успешно загружены с API:', dishes);
      
      // Запускаем инициализацию после загрузки данных
      initializeApp();
    } catch (error) {
      console.error('❌ Ошибка при загрузке блюд:', error);
      // Создаем сообщение об ошибке прямо на странице
      const errorMsg = document.createElement('p');
      errorMsg.textContent = 'Не удалось загрузить меню. Пожалуйста, обновите страницу.';
      errorMsg.style.color = 'red';
      errorMsg.style.textAlign = 'center';
      errorMsg.style.padding = '20px';
      document.querySelector('main').prepend(errorMsg);
    }
  }

  // === 4. ФУНКЦИЯ ИНИЦИАЛИЗАЦИИ ПРИЛОЖЕНИЯ ===
  function initializeApp() {
    // Сортируем блюда по названию
    const sortedDishes = [...dishes].sort((a, b) => a.name.localeCompare(b.name));

    // Группируем блюда по категориям
    const groups = {
      soup: sortedDishes.filter(d => d.category === 'soup'),
      main: sortedDishes.filter(d => d.category === 'main'),
      starter: sortedDishes.filter(d => d.category === 'starter'),
      drink: sortedDishes.filter(d => d.category === 'drink'),
      dessert: sortedDishes.filter(d => d.category === 'dessert')
    };

    // === РЕНДЕР ОСНОВНОГО КОНТЕНТА ===
    renderAllCategories(groups);

    // === НАСТРОЙКА ОБРАБОТЧИКОВ СОБЫТИЙ ===
    // 1. Фильтры
    filterButtons.forEach(btn => {
      btn.addEventListener('click', () => handleFilterClick(btn, groups));
    });

    // 2. Форма заказа
    if (orderForm) {
      orderForm.addEventListener('submit', handleFormSubmit);
    }
  }

  // === 5. ФУНКЦИИ РЕНДЕРА ===
  function createDishCard(dish) {
    const div = document.createElement('div');
    div.className = 'dish-item';
    div.dataset.keyword = dish.keyword;

    // Формируем URL для изображения. API обычно не возвращает расширение, поэтому добавим его.
    let imageUrl = dish.image;
    if (!imageUrl.endsWith('.jpg') && !imageUrl.endsWith('.jpeg') && !imageUrl.endsWith('.png')) {
      imageUrl += '.jpg';
    }

    div.innerHTML = `
      <img src="${imageUrl}" alt="${dish.name}" onerror="this.src='placeholder.jpg'" />
      <p class="price">${dish.price}₽</p>
      <p class="name">${dish.name}</p>
      <p class="volume">${dish.count}</p>
      <button class="add-btn">Добавить</button>
    `;

    div.querySelector('.add-btn').addEventListener('click', () => selectDish(dish, div));
    return div;
  }

  function renderCategory(category, groups) {
    const grid = grids[category];
    const items = groups[category];
    const filter = activeFilters[category];

    grid.innerHTML = '';

    const filteredItems = filter ? items.filter(d => d.kind === filter) : items;
    
    filteredItems.forEach(dish => {
      const card = createDishCard(dish);
      if (selected[category] && selected[category].keyword === dish.keyword) {
        card.classList.add('selected');
      }
      grid.appendChild(card);
    });
  }

  function renderAllCategories(groups) {
    renderCategory('soup', groups);
    renderCategory('main', groups);
    renderCategory('starter', groups);
    renderCategory('drink', groups);
    renderCategory('dessert', groups);
  }

  // === 6. ОСНОВНАЯ ЛОГИКА ===
  function selectDish(dish, cardElement) {
    // Снимаем выделение со всех карточек в этой категории
    document.querySelectorAll(`#${dish.category}-grid .dish-item`).forEach(el => {
      el.classList.remove('selected');
    });

    // Обновляем глобальное состояние
    selected[dish.category] = dish;
    
    // Добавляем выделение на новую карточку
    cardElement.classList.add('selected');

    // Обновляем отображение заказа
    updateOrderDisplay();
  }

  function updateOrderDisplay() {
    const hasAny = Object.values(selected).some(item => item !== null);
    
    if (!hasAny) {
      orderMessage.textContent = 'Ничего не выбрано';
      selectedItems.style.display = 'none';
      return;
    }

    orderMessage.style.display = 'none';
    selectedItems.style.display = 'block';

    // Обновляем текст для каждого пункта
    for (const [category, element] of Object.entries(orderDisplay)) {
      if (category === 'total') continue;
      const dish = selected[category];
      element.textContent = dish 
        ? `${dish.name} ${dish.price}₽` 
        : `${category === 'soup' ? 'Суп' : category === 'main' ? 'Блюдо' : category === 'starter' ? 'Стартер' : category === 'drink' ? 'Напиток' : 'Десерт'} не выбран`;
    }

    // Считаем итоговую сумму
    const total = Object.values(selected)
      .filter(Boolean)
      .reduce((sum, dish) => sum + dish.price, 0);
    orderDisplay.total.textContent = `Стоимость заказа: ${total}₽`;
  }

  function handleFilterClick(button, groups) {
    const sectionId = button.closest('section').id; // Например, 'soup-section'
    const category = sectionId.replace('-section', ''); // 'soup'
    const kind = button.dataset.kind;

    // Убираем активный класс у всех кнопок в этой секции
    document.querySelectorAll(`#${sectionId} .filter-btn`).forEach(btn => {
      btn.classList.remove('active');
    });

    // Устанавливаем или снимаем фильтр
    if (activeFilters[category] === kind) {
      delete activeFilters[category];
    } else {
      activeFilters[category] = kind;
      button.classList.add('active');
    }

    // Перерисовываем категорию
    renderCategory(category, groups);
  }

  // === 7. ПРОВЕРКА ЗАКАЗА И УВЕДОМЛЕНИЯ ===
  function showPopup(message) {
    const overlay = document.createElement('div');
    overlay.className = 'popup-overlay';
    overlay.innerHTML = `
      <div class="popup-content">
        <p>${message}</p>
        <button class="popup-btn">Окей 👌</button>
      </div>
    `;
    document.body.appendChild(overlay);

    // Закрытие по кнопке или клику на оверлей
    overlay.querySelector('.popup-btn').addEventListener('click', () => overlay.remove());
    overlay.addEventListener('click', (e) => { if (e.target === overlay) overlay.remove(); });
  }

  function validateOrder() {
    const { soup, main, starter, drink, dessert } = selected;
    const hasAny = soup || main || starter || drink || dessert;
    
    if (!hasAny) {
      showPopup('Ничего не выбрано. Выберите блюда для заказа');
      return false;
    }
    if ((soup || main || starter) && !drink) {
      showPopup('Выберите напиток');
      return false;
    }
    if (soup && !main && !starter) {
      showPopup('Выберите главное блюдо/салат/стартер');
      return false;
    }
    if (starter && !soup && !main) {
      showPopup('Выберите суп или главное блюдо');
      return false;
    }
    if ((drink || dessert) && !main && !soup && !starter) {
      showPopup('Выберите главное блюдо');
      return false;
    }
    return true;
  }

  function handleFormSubmit(event) {
    event.preventDefault();
    if (validateOrder()) {
      alert('Заказ оформлен успешно! Спасибо за покупку!');
    }
  }

  // === 8. СТАРТ ПРИЛОЖЕНИЯ ===
  loadDishes();
});



