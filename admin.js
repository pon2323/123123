const PASSWORD = "admin2026";

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

const DEFAULT_COUPONS = [{ code: "ROYAL15", type: "percent", value: 15, active: true }];

function getJSON(key, fallback) {
  try { return JSON.parse(localStorage.getItem(key)) || fallback; } catch { return fallback; }
}
function setJSON(key, value) { localStorage.setItem(key, JSON.stringify(value)); }

function initDefaults() {
  if (!localStorage.getItem("products")) setJSON("products", DEFAULT_PRODUCTS);
  if (!localStorage.getItem("promos")) setJSON("promos", DEFAULT_PROMOS);
  if (!localStorage.getItem("coupons")) setJSON("coupons", DEFAULT_COUPONS);
  if (!localStorage.getItem("orders")) setJSON("orders", []);
}
function uid(prefix){ return `${prefix}_${Date.now()}_${Math.floor(Math.random()*999)}`; }

function renderProductsAdmin() {
  const wrap = document.querySelector("#admin-products");
  const products = getJSON("products", DEFAULT_PRODUCTS);
  wrap.innerHTML = products.map((p, i) => `
    <div class="admin-row" data-product-index="${i}">
      <input value="${p.id}" data-field="id" placeholder="id">
      <input value="${p.name}" data-field="name" placeholder="Название">
      <textarea data-field="description" placeholder="Описание">${p.description}</textarea>
      <input type="number" value="${p.price}" data-field="price" placeholder="Цена">
      <input value="${p.color}" data-field="color" placeholder="RGB цвет: 246,199,96">
      <input value="${p.image || ""}" data-field="image" placeholder="URL фото">
      <button class="btn btn-glass small" data-delete-product="${i}">Удалить</button>
    </div>
  `).join("");
  bindEditable("#admin-products", "products", DEFAULT_PRODUCTS, "product-index");
}

function renderPromosAdmin() {
  const wrap = document.querySelector("#admin-promos");
  const promos = getJSON("promos", DEFAULT_PROMOS);
  wrap.innerHTML = promos.map((p, i) => `
    <div class="admin-row" data-promo-index="${i}">
      <input value="${p.big}" data-field="big" placeholder="-15%">
      <input value="${p.title}" data-field="title" placeholder="Заголовок">
      <textarea data-field="description" placeholder="Описание">${p.description}</textarea>
      <input value="${p.color}" data-field="color" placeholder="#F6C760">
      <input value="${p.id}" data-field="id" placeholder="id">
      <span></span>
      <button class="btn btn-glass small" data-delete-promo="${i}">Удалить</button>
    </div>
  `).join("");
  bindEditable("#admin-promos", "promos", DEFAULT_PROMOS, "promo-index");
}

function renderCouponsAdmin() {
  const wrap = document.querySelector("#admin-coupons");
  const coupons = getJSON("coupons", DEFAULT_COUPONS);
  wrap.innerHTML = coupons.map((c, i) => `
    <div class="admin-row" data-coupon-index="${i}">
      <input value="${c.code}" data-field="code" placeholder="Код">
      <input value="${c.type}" data-field="type" placeholder="percent/fixed">
      <input type="number" value="${c.value}" data-field="value" placeholder="Значение">
      <input value="${c.active}" data-field="active" placeholder="true/false">
      <span></span><span></span>
      <button class="btn btn-glass small" data-delete-coupon="${i}">Удалить</button>
    </div>
  `).join("");
  bindEditable("#admin-coupons", "coupons", DEFAULT_COUPONS, "coupon-index");
}

function renderOrdersAdmin() {
  const wrap = document.querySelector("#admin-orders");
  const orders = getJSON("orders", []);
  wrap.innerHTML = orders.length ? orders.map(o => `
    <div class="admin-order">
      <strong>Заявка #${o.id}</strong>
      <p>${o.createdAt} • ${o.name} • ${o.contact} • ${o.delivery}</p>
      <pre>${JSON.stringify(o, null, 2)}</pre>
    </div>
  `).join("") : `<p style="color:#BFC7D9">Заявок пока нет.</p>`;
}

function bindEditable(selector, key, fallback, indexAttr) {
  document.querySelector(selector).querySelectorAll("[data-field]").forEach(input => {
    input.addEventListener("change", () => {
      const row = input.closest(`[data-${indexAttr}]`);
      const index = Number(row.dataset[indexAttr]);
      const data = getJSON(key, fallback);
      const field = input.dataset.field;
      let value = input.value;
      if (field === "price" || field === "value") value = Number(value);
      if (field === "active") value = value === "true";
      data[index][field] = value;
      setJSON(key, data);
    });
  });
}

function bindActions() {
  document.querySelector("#login-btn").addEventListener("click", () => {
    if (document.querySelector("#admin-password").value === PASSWORD) {
      document.querySelector("#admin-login").classList.add("hidden");
      document.querySelector("#admin-panel").classList.remove("hidden");
    } else alert("Неверный пароль");
  });

  document.querySelector("#add-product").addEventListener("click", () => {
    const products = getJSON("products", DEFAULT_PRODUCTS);
    products.push({ id: uid("product"), name: "Новый товар", description: "Описание товара", price: 1000, color: "246,199,96", tag: "NEW", image: "" });
    setJSON("products", products);
    renderAll();
  });

  document.querySelector("#add-promo").addEventListener("click", () => {
    const promos = getJSON("promos", DEFAULT_PROMOS);
    promos.push({ id: uid("promo"), big: "NEW", title: "Новая акция", description: "Описание акции", color: "#F6C760" });
    setJSON("promos", promos);
    renderAll();
  });

  document.querySelector("#add-coupon").addEventListener("click", () => {
    const coupons = getJSON("coupons", DEFAULT_COUPONS);
    coupons.push({ code: "NEWCODE", type: "percent", value: 10, active: true });
    setJSON("coupons", coupons);
    renderAll();
  });

  document.querySelector("#clear-orders").addEventListener("click", () => {
    if (confirm("Очистить все заявки?")) {
      setJSON("orders", []);
      renderOrdersAdmin();
    }
  });

  document.addEventListener("click", e => {
    if (e.target.dataset.deleteProduct) {
      const data = getJSON("products", DEFAULT_PRODUCTS);
      data.splice(Number(e.target.dataset.deleteProduct), 1);
      setJSON("products", data);
      renderAll();
    }
    if (e.target.dataset.deletePromo) {
      const data = getJSON("promos", DEFAULT_PROMOS);
      data.splice(Number(e.target.dataset.deletePromo), 1);
      setJSON("promos", data);
      renderAll();
    }
    if (e.target.dataset.deleteCoupon) {
      const data = getJSON("coupons", DEFAULT_COUPONS);
      data.splice(Number(e.target.dataset.deleteCoupon), 1);
      setJSON("coupons", data);
      renderAll();
    }
  });
}

function renderAll() {
  renderProductsAdmin();
  renderPromosAdmin();
  renderCouponsAdmin();
  renderOrdersAdmin();
}

initDefaults();
renderAll();
bindActions();
