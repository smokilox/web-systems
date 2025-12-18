// dishes.js
const dishes = [
  // --- Супы ---
  { keyword: 'gazpacho', name: 'Гаспачо', price: 195, category: 'soup', count: '350 г', image: 'gaspach.jpg', kind: 'veg' },
  { keyword: 'mushroom_soup', name: 'Грибной суп-пюре', price: 185, category: 'soup', count: '330 мл', image: 'suupGRIB.png', kind: 'fish' },
  { keyword: 'norwegian_soup', name: 'Норвежский суп', price: 270, category: 'soup', count: '330 мл', image: 'supNorw.jpg', kind: 'veg' },
  { keyword: 'ramen', name: 'Рамен', price: 375, category: 'soup', count: '425 г', image: 'ramen.jpeg', kind: 'meat' },
  { keyword: 'tom_yam', name: 'Том ям с креветками', price: 650, category: 'soup', count: '500 мл', image: 'tomyam.jpg', kind: 'fish' },
  { keyword: 'chicken_soup', name: 'Куриный суп', price: 330, category: 'soup', count: '350 мл', image: 'soupKur.jpg', kind: 'meat' },

  // --- Главные блюда ---
  { keyword: 'potatoes_with_mushrooms', name: 'Жареная картошка с грибами', price: 150, category: 'main', count: '250 г', image: 'kartoshGri.jpg', kind: 'veg' },
  { keyword: 'lasagna', name: 'Лазанья', price: 385, category: 'main', count: '310 г', image: 'lazanya.jpg', kind: 'meat' },
  { keyword: 'chicken_cutlets', name: 'Котлеты из курицы с картофельным пюре', price: 225, category: 'main', count: '280 г', image: 'kartKotl.jpg', kind: 'meat' },
  { keyword: 'fish_cutlet_rice', name: 'Рыбная котлета с рисом и спаржей', price: 320, category: 'main', count: '270 г', image: 'fishrice.jpg', kind: 'fish' },
  { keyword: 'margarita_pizza', name: 'Пицца Маргарита', price: 450, category: 'main', count: '470 г', image: 'pizzaMarg.jpg', kind: 'veg' },
  { keyword: 'pasta_shrimp', name: 'Паста с креветками', price: 340, category: 'main', count: '280 г', image: 'pastaKrev.jpg', kind: 'fish' },

  // --- Салаты и стартеры ---
  { keyword: 'korean_salad', name: 'Корейский салат с овощами и яйцом', price: 330, category: 'starter', count: '250 г', image: 'koreasal.jpg', kind: 'veg' },
  { keyword: 'cesar', name: 'Цезарь с цыплёнком', price: 370, category: 'starter', count: '220 г', image: 'cezar.jpg', kind: 'meat' },
  { keyword: 'caprese', name: 'Капрезе с моцареллой', price: 350, category: 'starter', count: '235 г', image: 'koperze.jpg', kind: 'meat' },
  { keyword: 'tuna_salad', name: 'Салат с тунцом', price: 480, category: 'starter', count: '250 г', image: 'saladTun.jpg', kind: 'meat' },
  { keyword: 'fries_caesar', name: 'Картофель фри с соусом Цезарь', price: 280, category: 'starter', count: '235 г', image: 'free.jpg', kind: 'veg' },
  { keyword: 'fries_ketchup', name: 'Картофель фри с кетчупом', price: 260, category: 'starter', count: '235 г', image: 'freeKet.jpg', kind: 'veg' },

  // --- Напитки ---
  { keyword: 'orange_juice', name: 'Апельсиновый сок', price: 120, category: 'drink', count: '300 мл', image: 'sokA.jpg', kind: 'cold' },
  { keyword: 'apple_juice', name: 'Яблочный сок', price: 90, category: 'drink', count: '300 мл', image: 'sokYA.jpg', kind: 'cold' },
  { keyword: 'carrot_juice', name: 'Морковный сок', price: 110, category: 'drink', count: '300 мл', image: 'sokM.jpg', kind: 'cold' },
  { keyword: 'cappuccino', name: 'Капучино', price: 180, category: 'drink', count: '300 мл', image: 'kapuch.jpg', kind: 'hot' },
  { keyword: 'green_tea', name: 'Зеленый чай', price: 100, category: 'drink', count: '300 мл', image: 'teeGre.jpg', kind: 'hot' },
  { keyword: 'black_tea', name: 'Черный чай', price: 90, category: 'drink', count: '300 мл', image: 'tee.jpg', kind: 'hot' },

  // --- Десерты ---
  { keyword: 'baklava', name: 'Пахлава', price: 220, category: 'dessert', count: '300 г', image: 'pahlav.jpg', kind: 'small' },
  { keyword: 'cheesecake', name: 'Чизкейк', price: 240, category: 'dessert', count: '125 г', image: 'cheescake.jpg', kind: 'small' },
  { keyword: 'chocolate_cheesecake', name: 'Шоколадный чизкейк', price: 260, category: 'dessert', count: '125 г', image: 'chesChokkace.jpg', kind: 'small' },
  { keyword: 'chocolate_cake', name: 'Шоколадный торт', price: 270, category: 'dessert', count: '140 г', image: 'cakeChok.jpg', kind: 'medium' },
  { keyword: 'donuts_3', name: 'Пончики (3 штуки)', price: 410, category: 'dessert', count: '350 г', image: 'pon3.jpg', kind: 'medium' },
  { keyword: 'donuts_6', name: 'Пончики (6 штук)', price: 650, category: 'dessert', count: '700 г', image: 'pon6.jpg', kind: 'large' }
];