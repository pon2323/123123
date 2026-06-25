const DEFAULT_PRODUCTS = [
  { id: "bunny", name: "Мягкий зайка", description: "Плюшевая игрушка ручной работы для ребёнка или подарка.", price: 1490, color: "246,199,96", tag: "ХИТ", image: "" },
  { id: "shoes", name: "Пинетки Royal Baby", description: "Мягкие пинетки для новорождённых в подарочной упаковке.", price: 990, color: "154,239,255", tag: "ХИТ", image: "" },
  { id: "hat", name: "Шапка Aurora", description: "Тёплая шапка ручной вязки в нежных цветах.", price: 1790, color: "255,120,200", tag: "ХИТ", image: "" },
  { id: "scarf", name: "Шарф Север", description: "Унисекс-шарф из плотной пряжи для холодной погоды.", price: 2190, color: "185,138,255", tag: "ХИТ", image: "" }
];

const DEFAULT_PROMOS = [
  { id: "p1", big: "-15%", title: "На первый заказ", description: "Для новых покупателей, чтобы первый подарок заказать было проще.", color: "#F6C760" },
  { id: "p2", big: "BOX", title: "Упаковка бесплатно", description: "Крафт, лента и карточка ухода при заказе от 1 990 ₽.", color: "#9AEFFF" },
  { id: "p3", big: "2+1", title: "Комплекты выгоднее", description: "При заказе комплекта можно сделать скидку или подарок.", color: "#FF8AD8" }
];

const DEFAULT_COUPONS = [
  { code: "ROYAL15", type: "percent", value: 15, active: true }
];

const TERMS = {
  terms: `
    <h2>Условия и правила</h2>
    <p>Petelka Royal — демонстрационный магазин изделий ручной работы. На сайте представлены товары, которые могут изготавливаться вручную и отличаться по оттенку, фактуре и небольшим деталям.</p>
    <ul>
      <li>Заказ считается принятым после подтверждения менеджером.</li>
      <li>Срок изготовления зависит от сложности изделия и загруженности мастера.</li>
      <li>Доступные способы доставки: СДЭК и Почта России.</li>
      <li>Индивидуальные изделия обсуждаются отдельно перед оплатой.</li>
      <li>Цены на сайте могут быть изменены до подтверждения заказа.</li>
    </ul>
  `,
  privacy: `
    <h2>Политика конфиденциальности</h2>
    <p>Мы используем данные, которые покупатель сам оставляет в форме заказа: имя, контакт, способ доставки, комментарий и состав корзины.</p>
    <ul>
      <li>Данные нужны только для связи, уточнения заказа и доставки.</li>
      <li>Мы не передаём данные третьим лицам, кроме случаев, необходимых для доставки заказа.</li>
      <li>Покупатель может запросить удаление своих данных.</li>
      <li>В демо-версии данные сохраняются локально в браузере через localStorage.</li>
    </ul>
  `,
  help: `
    <h2>Помощь</h2>
    <p>Как оформить заказ:</p>
    <ul>
      <li>Выберите товар и добавьте его в корзину.</li>
      <li>Нажмите “Оформить”.</li>
      <li>Заполните имя, контакт и выберите доставку: СДЭК или Почта России.</li>
      <li>Укажите цвет, размер или пожелания к упаковке.</li>
      <li>После отправки заявки менеджер свяжется с вами для подтверждения.</li>
    </ul>
  `
};

const currency = new Intl.NumberFormat("ru-RU");

function getJSON(key, fallback) {
  try {
    const value = localStorage.getItem(key);
    return value ? JSON.parse(value) : fallback;
  } catch {
    return fallback;
  }
}

function setJSON(key, value) {
  localStorage.setItem(key, JSON.stringify(value));
}

function initDefaults() {
  if (!localStorage.getItem("products")) setJSON("products", DEFAULT_PRODUCTS);
  if (!localStorage.getItem("promos")) setJSON("promos", DEFAULT_PROMOS);
  if (!localStorage.getItem("coupons")) setJSON("coupons", DEFAULT_COUPONS);
  if (!localStorage.getItem("orders")) setJSON("orders", []);
  if (!localStorage.getItem("cart")) setJSON("cart", []);
}

function formatPrice(price) {
  return `${currency.format(Number(price || 0))} ₽`;
}

function renderPromos() {
  const list = document.querySelector("#promo-list");
  if (!list) return;
  const promos = getJSON("promos", DEFAULT_PROMOS);
  list.innerHTML = promos.map(p => `
    <article class="promo-card" style="--promo-color:${p.color || "#F6C760"}">
      <div class="big">${p.big}</div>
      <div>
        <h3>${p.title}</h3>
        <p>${p.description}</p>
      </div>
    </article>
  `).join("");
}

function renderProducts() {
  const list = document.querySelector("#product-list");
  if (!list) return;
  const products = getJSON("products", DEFAULT_PRODUCTS);
  list.innerHTML = products.map(p => `
    <article class="product-card" style="--accent-rgb:${p.color || "246,199,96"}">
      <div class="product-image">
        <span class="hit">${p.tag || "ХИТ"}</span>
        ${p.image ? `<img src="${p.image}" alt="${p.name}" style="width:100%;height:100%;object-fit:cover;border-radius:24px;">` : `<div class="toy-shape"></div>`}
      </div>
      <h3>${p.name}</h3>
      <p>${p.description}</p>
      <div class="product-bottom">
        <strong>${formatPrice(p.price)}</strong>
        <button class="add-to-cart" data-add="${p.id}">В корзину</button>
      </div>
    </article>
  `).join("");

  document.querySelectorAll("[data-add]").forEach(btn => {
    btn.addEventListener("click", () => addToCart(btn.dataset.add));
  });
}

function getCartProducts() {
  const cart = getJSON("cart", []);
  const products = getJSON("products", DEFAULT_PRODUCTS);
  return cart.map(item => {
    const product = products.find(p => p.id === item.id);
    return product ? { ...product, qty: item.qty } : null;
  }).filter(Boolean);
}

function updateCart() {
  const cartItems = document.querySelector("#cart-items");
  const count = document.querySelector("#cart-count");
  const totalEl = document.querySelector("#cart-total");
  const items = getCartProducts();
  const totalQty = items.reduce((sum, item) => sum + item.qty, 0);
  const total = items.reduce((sum, item) => sum + item.price * item.qty, 0);

  if (count) count.textContent = totalQty;
  if (totalEl) totalEl.textContent = formatPrice(total);

  if (!cartItems) return;
  cartItems.innerHTML = items.length ? items.map(item => `
    <div class="cart-item">
      <div>
        <strong>${item.name}</strong>
        <p>${item.qty} × ${formatPrice(item.price)}</p>
      </div>
      <button data-remove="${item.id}">Удалить</button>
    </div>
  `).join("") : `<p style="color:#BFC7D9">Корзина пока пустая.</p>`;

  document.querySelectorAll("[data-remove]").forEach(btn => {
    btn.addEventListener("click", () => removeFromCart(btn.dataset.remove));
  });
}

function addToCart(id) {
  const cart = getJSON("cart", []);
  const existing = cart.find(item => item.id === id);
  if (existing) existing.qty += 1;
  else cart.push({ id, qty: 1 });
  setJSON("cart", cart);
  updateCart();
  document.querySelector("#cart-drawer")?.classList.add("open");
}

function removeFromCart(id) {
  const cart = getJSON("cart", []).filter(item => item.id !== id);
  setJSON("cart", cart);
  updateCart();
}

function setupUI() {
  document.querySelectorAll("[data-open-cart]").forEach(el => el.addEventListener("click", () => document.querySelector("#cart-drawer").classList.add("open")));
  document.querySelectorAll("[data-close-cart]").forEach(el => el.addEventListener("click", () => document.querySelector("#cart-drawer").classList.remove("open")));

  document.querySelector("[data-open-menu]")?.addEventListener("click", () => document.querySelector("#mobile-menu").classList.add("open"));
  document.querySelector("[data-close-menu]")?.addEventListener("click", () => document.querySelector("#mobile-menu").classList.remove("open"));
  document.querySelectorAll("#mobile-menu a").forEach(a => a.addEventListener("click", () => document.querySelector("#mobile-menu").classList.remove("open")));

  document.querySelector("[data-featured-add]")?.addEventListener("click", () => addToCart("bunny"));

  const modal = document.querySelector("#content-modal");
  const modalContent = document.querySelector("#modal-content");
  document.querySelectorAll("[data-open-modal]").forEach(link => {
    link.addEventListener("click", (e) => {
      e.preventDefault();
      modalContent.innerHTML = TERMS[link.dataset.openModal] || TERMS.help;
      modal.classList.add("open");
    });
  });
  document.querySelector("[data-close-modal]")?.addEventListener("click", () => modal.classList.remove("open"));
  modal?.addEventListener("click", e => {
    if (e.target === modal) modal.classList.remove("open");
  });

  const form = document.querySelector("#order-form");
  form?.addEventListener("submit", (e) => {
    e.preventDefault();
    const data = Object.fromEntries(new FormData(form).entries());
    const order = {
      id: Date.now(),
      createdAt: new Date().toLocaleString("ru-RU"),
      ...data,
      items: getCartProducts()
    };
    const orders = getJSON("orders", []);
    orders.unshift(order);
    setJSON("orders", orders);
    setJSON("cart", []);
    updateCart();
    form.reset();
    alert("Заявка сохранена в демо-заказы админки. Для реального магазина подключим backend и оплату.");
  });

  const observer = new IntersectionObserver(entries => {
    entries.forEach(entry => {
      if (entry.isIntersecting) entry.target.classList.add("visible");
    });
  }, { threshold: .12 });
  document.querySelectorAll(".reveal").forEach(el => observer.observe(el));
}

initDefaults();
renderPromos();
renderProducts();
updateCart();
setupUI();
