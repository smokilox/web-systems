document.addEventListener('DOMContentLoaded', function () {
  const soupGrid = document.getElementById('soup-grid');
  const mainGrid = document.getElementById('main-grid');
  const starterGrid = document.getElementById('starter-grid');
  const drinkGrid = document.getElementById('drink-grid');
  const dessertGrid = document.getElementById('dessert-grid');

  const goToOrderPanel = document.getElementById('go-to-order-panel');
  const panelTotal = document.getElementById('panel-total');
  const goToOrderLink = document.getElementById('go-to-order-link');

  // Загрузка из localStorage
  function loadSelectedFromStorage() {
    const saved = localStorage.getItem('selectedDishes');
    return saved ? JSON.parse(saved) : {};
  }

  function saveSelectedToStorage(selected) {
    localStorage.setItem('selectedDishes', JSON.stringify(selected));
  }

  let selected = loadSelectedFromStorage();

  const filterButtons = document.querySelectorAll('.filter-btn');
  let activeFilters = {};

  filterButtons.forEach(btn => {
    btn.addEventListener('click', () => toggleFilter(btn));
  });

  const sorted = [...dishes].sort((a, b) => a.name.localeCompare(b.name));
  const soups = sorted.filter(d => d.category === 'soup');
  const mains = sorted.filter(d => d.category === 'main');
  const starters = sorted.filter(d => d.category === 'starter');
  const drinks = sorted.filter(d => d.category === 'drink');
  const desserts = sorted.filter(d => d.category === 'dessert');

  function createCard(dish) {
    const div = document.createElement('div');
    div.className = 'dish-item';
    div.dataset.id = dish.id;
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

  function selectDish(dish) {
    document.querySelectorAll('.dish-item').forEach(el => el.classList.remove('selected'));
    selected[dish.category] = { id: dish.id, ...dish };
    saveSelectedToStorage(selected);
    updateOrderDisplay();
    const card = document.querySelector(`[data-id="${dish.id}"]`);
    if (card) card.classList.add('selected');
  }

  function isValidCombo(selected) {
    const hasSoup = !!selected.soup;
    const hasMain = !!selected.main;
    const hasStarter = !!selected.starter;
    const hasDrink = !!selected.drink;
    if (!hasDrink) return false;
    if (hasSoup && hasMain && hasStarter) return true;
    if (hasSoup && hasMain) return true;
    if (hasSoup && hasStarter) return true;
    if (hasMain && hasStarter) return true;
    if (hasMain) return true;
    return false;
  }

  function updateOrderDisplay() {
    const hasAny = Object.values(selected).some(Boolean);
    if (!hasAny) {
      goToOrderPanel.style.display = 'none';
      return;
    }

    goToOrderPanel.style.display = 'flex';
    const total = Object.values(selected).reduce((sum, dish) => sum + dish.price, 0);
    panelTotal.textContent = `${total} ₽`;

    if (isValidCombo(selected)) {
      goToOrderLink.classList.remove('disabled');
    } else {
      goToOrderLink.classList.add('disabled');
    }
  }

  function toggleFilter(button) {
    const sectionId = button.closest('section').id;
    const category = sectionId.replace('-section', '');
    const kind = button.dataset.kind;

    document.querySelectorAll(`#${sectionId} .filter-btn`).forEach(btn => {
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
    let grid, items;
    switch (category) {
      case 'soup': grid = soupGrid; items = soups; break;
      case 'main': grid = mainGrid; items = mains; break;
      case 'starter': grid = starterGrid; items = starters; break;
      case 'drink': grid = drinkGrid; items = drinks; break;
      case 'dessert': grid = dessertGrid; items = desserts; break;
      default: return;
    }

    grid.innerHTML = '';
    let filtered = activeFilters[category] ? items.filter(d => d.kind === activeFilters[category]) : items;
    filtered.forEach(d => {
      const card = createCard(d);
      if (selected[category]?.id === d.id) card.classList.add('selected');
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

  renderAll();
  updateOrderDisplay();
});