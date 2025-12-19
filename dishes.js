const dishes = [
  // --- Супы ---
  { id: 1, name: 'Гаспачо', price: 195, category: 'soup', count: '350 г', image: 'gaspach.jpg', kind: 'veg' },
  { id: 2, name: 'Грибной суп-пюре', price: 185, category: 'soup', count: '330 мл', image: 'suupGRIB.png', kind: 'fish' },
  { id: 3, name: 'Норвежский суп', price: 270, category: 'soup', count: '330 мл', image: 'supNorw.jpg', kind: 'veg' },
  { id: 4, name: 'Рамен', price: 375, category: 'soup', count: '425 г', image: 'ramen.jpeg', kind: 'meat' },
  { id: 5, name: 'Том ям с креветками', price: 650, category: 'soup', count: '500 мл', image: 'tomyam.jpg', kind: 'fish' },
  { id: 6, name: 'Куриный суп', price: 330, category: 'soup', count: '350 мл', image: 'soupKur.jpg', kind: 'meat' },

  // --- Главные блюда ---
  { id: 7, name: 'Жареная картошка с грибами', price: 150, category: 'main', count: '250 г', image: 'kartoshGri.jpg', kind: 'veg' },
  { id: 8, name: 'Лазанья', price: 385, category: 'main', count: '310 г', image: 'lazanya.jpg', kind: 'meat' },
  { id: 9, name: 'Котлеты из курицы с картофельным пюре', price: 225, category: 'main', count: '280 г', image: 'kartKotl.jpg', kind: 'meat' },
  { id: 10, name: 'Рыбная котлета с рисом и спаржей', price: 320, category: 'main', count: '270 г', image: 'fishrice.jpg', kind: 'fish' },
  { id: 11, name: 'Пицца Маргарита', price: 450, category: 'main', count: '470 г', image: 'pizzaMarg.jpg', kind: 'veg' },
  { id: 12, name: 'Паста с креветками', price: 340, category: 'main', count: '280 г', image: 'pastaKrev.jpg', kind: 'fish' },

  // --- Салаты и стартеры ---
  { id: 13, name: 'Корейский салат с овощами и яйцом', price: 330, category: 'starter', count: '250 г', image: 'koreasal.jpg', kind: 'veg' },
  { id: 14, name: 'Цезарь с цыплёнком', price: 370, category: 'starter', count: '220 г', image: 'cezar.jpg', kind: 'meat' },
  { id: 15, name: 'Капрезе с моцареллой', price: 350, category: 'starter', count: '235 г', image: 'koperze.jpg', kind: 'meat' },
  { id: 16, name: 'Салат с тунцом', price: 480, category: 'starter', count: '250 г', image: 'saladTun.jpg', kind: 'meat' },
  { id: 17, name: 'Картофель фри с соусом Цезарь', price: 280, category: 'starter', count: '235 г', image: 'free.jpg', kind: 'veg' },
  { id: 18, name: 'Картофель фри с кетчупом', price: 260, category: 'starter', count: '235 г', image: 'freeKet.jpg', kind: 'veg' },

  // --- Напитки ---
  { id: 19, name: 'Апельсиновый сок', price: 120, category: 'drink', count: '300 мл', image: 'sokA.jpg', kind: 'cold' },
  { id: 20, name: 'Яблочный сок', price: 90, category: 'drink', count: '300 мл', image: 'sokYA.jpg', kind: 'cold' },
  { id: 21, name: 'Морковный сок', price: 110, category: 'drink', count: '300 мл', image: 'sokM.jpg', kind: 'cold' },
  { id: 22, name: 'Капучино', price: 180, category: 'drink', count: '300 мл', image: 'kapuch.jpg', kind: 'hot' },
  { id: 23, name: 'Зеленый чай', price: 100, category: 'drink', count: '300 мл', image: 'teeGre.jpg', kind: 'hot' },
  { id: 24, name: 'Черный чай', price: 90, category: 'drink', count: '300 мл', image: 'tee.jpg', kind: 'hot' },

  // --- Десерты ---
  { id: 25, name: 'Пахлава', price: 220, category: 'dessert', count: '300 г', image: 'pahlav.jpg', kind: 'small' },
  { id: 26, name: 'Чизкейк', price: 240, category: 'dessert', count: '125 г', image: 'cheescake.jpg', kind: 'small' },
  { id: 27, name: 'Шоколадный чизкейк', price: 260, category: 'dessert', count: '125 г', image: 'chesChokkace.jpg', kind: 'small' },
  { id: 28, name: 'Шоколадный торт', price: 270, category: 'dessert', count: '140 г', image: 'cakeChok.jpg', kind: 'medium' },
  { id: 29, name: 'Пончики (3 штуки)', price: 410, category: 'dessert', count: '350 г', image: 'pon3.jpg', kind: 'medium' },
  { id: 30, name: 'Пончики (6 штук)', price: 650, category: 'dessert', count: '700 г', image: 'pon6.jpg', kind: 'large' }
];