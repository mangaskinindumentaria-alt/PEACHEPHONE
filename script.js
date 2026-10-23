"use strict";

/*
 * PEACHEPHONE - tienda demostrativa de frontend.
 * Para vender en producción: backend, base de datos y autenticación segura.
 */

// Cambiá el valor por tu número en formato internacional, solo dígitos.
// Ejemplo Argentina: 54911XXXXXXXX (sin +, espacios ni guiones).
const WHATSAPP_NUMBER = "54911XXXXXXXX";

const STORAGE = {
  products: "peachephone-products-v1",
  cart: "peachephone-cart-v1",
  user: "peachephone-demo-user"
};

const seedProducts = [
  {id:1,name:"iPhone 15 Pro Max",brand:"Apple",range:"premium",description:"256 GB · Cámara Pro · Titanio",price:1099990,discount:15,image:"https://images.unsplash.com/photo-1592899677977-9c10ca588bbd?auto=format&fit=crop&w=700&q=85"},
  {id:2,name:"Samsung Galaxy S23",brand:"Samsung",range:"premium",description:"256 GB · AMOLED · Alto rendimiento",price:799990,discount:20,image:"https://images.unsplash.com/photo-1610945265064-0e34e5519bbf?auto=format&fit=crop&w=700&q=85"},
  {id:3,name:"Xiaomi 13 Pro",brand:"Xiaomi",range:"premium",description:"256 GB · Cámara de alta resolución",price:699990,discount:10,image:"https://images.unsplash.com/photo-1511707171634-5f897ff02aa9?auto=format&fit=crop&w=700&q=85"},
  {id:4,name:"iPhone 14",brand:"Apple",range:"media",description:"128 GB · Cámara dual · Diseño clásico",price:749990,discount:12,image:"https://images.unsplash.com/photo-1592899677977-9c10ca588bbd?auto=format&fit=crop&w=700&q=85"},
  {id:5,name:"Samsung Galaxy A54",brand:"Samsung",range:"media",description:"128 GB · Pantalla Super AMOLED",price:499990,discount:8,image:"https://images.unsplash.com/photo-1610945265064-0e34e5519bbf?auto=format&fit=crop&w=700&q=85"},
  {id:6,name:"Motorola Edge 40",brand:"Motorola",range:"media",description:"256 GB · Diseño delgado · 5G",price:449990,discount:10,image:"https://images.unsplash.com/photo-1598327105666-5b89351aff97?auto=format&fit=crop&w=700&q=85"},
  {id:7,name:"Xiaomi Redmi Note 13",brand:"Xiaomi",range:"entrada",description:"128 GB · Gran batería · Pantalla amplia",price:329990,discount:5,image:"https://images.unsplash.com/photo-1511707171634-5f897ff02aa9?auto=format&fit=crop&w=700&q=85"},
  {id:8,name:"Moto G84",brand:"Motorola",range:"entrada",description:"256 GB · Uso diario · Diseño liviano",price:299990,discount:7,image:"https://images.unsplash.com/photo-1598327105666-5b89351aff97?auto=format&fit=crop&w=700&q=85"}
];

const $ = (selector) => document.querySelector(selector);
const $$ = (selector) => [...document.querySelectorAll(selector)];

function readStorage(key, fallback) {
  try {
    const raw = localStorage.getItem(key);
    return raw ? JSON.parse(raw) : fallback;
  } catch {
    return fallback;
  }
}
function writeStorage(key, value) {
  try { localStorage.setItem(key, JSON.stringify(value)); }
  catch { showToast("No se pudo guardar en este navegador."); }
}
function safeText(value) {
  return String(value ?? "").replace(/[&<>"']/g, char => ({
    "&":"&amp;","<":"&lt;",">":"&gt;",'"':"&quot;","'":"&#39;"
  })[char]);
}
function money(value) {
  return new Intl.NumberFormat("es-AR", {
    style:"currency", currency:"ARS", maximumFractionDigits:0
  }).format(value);
}
function finalPrice(product) {
  return Math.round(product.price * (1 - (product.discount || 0) / 100));
}
function rangeName(range) {
  return ({premium:"Premium",media:"Gama media",entrada:"Entrada"})[range] || "Smartphone";
}
function productImage(product) {
  return product.image || "https://images.unsplash.com/photo-1511707171634-5f897ff02aa9?auto=format&fit=crop&w=700&q=80";
}

let products = readStorage(STORAGE.products, seedProducts);
let cart = readStorage(STORAGE.cart, []);
let activeBrand = "todos";
let activeRange = "todos";
let toastTimer;

function showToast(message) {
  const toast = $("#toast");
  toast.textContent = message;
  toast.classList.add("show");
  clearTimeout(toastTimer);
  toastTimer = setTimeout(() => toast.classList.remove("show"), 2300);
}

function persistProducts() { writeStorage(STORAGE.products, products); }
function persistCart() { writeStorage(STORAGE.cart, cart); }

function productCard(product) {
  const discounted = product.discount > 0;
  return `
    <article class="product-card">
      <div class="product-visual">
        ${discounted ? `<span class="discount-tag">-${product.discount}%</span>` : ""}
        <span class="range-tag">${safeText(rangeName(product.range))}</span>
        <img src="${safeText(productImage(product))}" alt="${safeText(product.name)}" loading="lazy"
             onerror="this.onerror=null;this.src='https://images.unsplash.com/photo-1511707171634-5f897ff02aa9?auto=format&fit=crop&w=700&q=80'">
      </div>
      <div class="product-info">
        <span class="product-brand">${safeText(product.brand)}</span>
        <h3>${safeText(product.name)}</h3>
        <p class="product-desc">${safeText(product.description || "Consultá las características del equipo.")}</p>
        <div class="price-row">
          <span class="price">${money(finalPrice(product))}</span>
          ${discounted ? `<span class="old-price">${money(product.price)}</span>` : ""}
        </div>
        <button class="add-button" data-add="${Number(product.id)}">＋ Agregar al carrito</button>
      </div>
    </article>`;
}

function renderProducts() {
  const query = $("#search").value.trim().toLocaleLowerCase("es-AR");
  let filtered = products.filter(p => {
    const matchesQuery = `${p.name} ${p.brand} ${p.description}`.toLocaleLowerCase("es-AR").includes(query);
    const matchesBrand = activeBrand === "todos" || p.brand === activeBrand;
    const matchesRange = activeRange === "todos" || p.range === activeRange;
    return matchesQuery && matchesBrand && matchesRange;
  });
  const sort = $("#sort").value;
  if (sort === "low") filtered.sort((a,b) => finalPrice(a)-finalPrice(b));
  if (sort === "high") filtered.sort((a,b) => finalPrice(b)-finalPrice(a));
  if (sort === "discount") filtered.sort((a,b) => (b.discount||0)-(a.discount||0));

  $("#product-grid").innerHTML = filtered.map(productCard).join("");
  $("#empty-state").hidden = filtered.length > 0;
  $("#offers-grid").innerHTML = products.filter(p => p.discount > 0).slice(0,4).map(productCard).join("");
}

function openPanel(panel) {
  $("#scrim").classList.add("visible");
  $("#scrim").dataset.panel = panel;
  document.body.classList.add("locked");
  if (panel === "cart") {
    $("#cart-panel").classList.add("open");
    $("#cart-panel").setAttribute("aria-hidden","false");
  }
}
function closePanels() {
  $("#scrim").classList.remove("visible");
  $("#cart-panel").classList.remove("open");
  $("#cart-panel").setAttribute("aria-hidden","true");
  $("#login-modal").hidden = true;
  $("#admin-modal").hidden = true;
  document.body.classList.remove("locked");
}
function openModal(id) {
  closePanels();
  $("#"+id).hidden = false;
  document.body.classList.add("locked");
}
$("#scrim").addEventListener("click", closePanels);
$$("[data-close]").forEach(button => button.addEventListener("click", closePanels));
document.addEventListener("keydown", event => { if (event.key === "Escape") closePanels(); });

function addToCart(id) {
  const product = products.find(p => p.id === id);
  if (!product) return;
  const existing = cart.find(item => item.id === id);
  if (existing) existing.quantity = Math.min(99, existing.quantity + 1);
  else cart.push({id,quantity:1});
  persistCart();
  renderCart();
  openPanel("cart");
  showToast(`${product.name} agregado al carrito`);
}
function changeQty(id, delta) {
  const item = cart.find(entry => entry.id === id);
  if (!item) return;
  item.quantity += delta;
  if (item.quantity <= 0) cart = cart.filter(entry => entry.id !== id);
  if (item.quantity > 99) item.quantity = 99;
  persistCart();
  renderCart();
}
function removeCartItem(id) {
  cart = cart.filter(item => item.id !== id);
  persistCart();
  renderCart();
}
function renderCart() {
  cart = cart.filter(item => products.some(p => p.id === item.id) && item.quantity > 0);
  const count = cart.reduce((sum,item) => sum + item.quantity,0);
  const total = cart.reduce((sum,item) => {
    const product = products.find(p => p.id === item.id);
    return sum + finalPrice(product) * item.quantity;
  },0);
  $("#cart-count").textContent = count;
  $("#cart-heading-count").textContent = `(${count})`;
  $("#cart-total").textContent = money(total);
  $("#cart-items").innerHTML = cart.length ? cart.map(item => {
    const p = products.find(product => product.id === item.id);
    return `<div class="cart-row">
      <div><h3>${safeText(p.name)}</h3><p>${money(finalPrice(p))} c/u</p>
      <div class="qty-controls">
        <button data-qty="-1" data-id="${p.id}" aria-label="Restar">−</button>
        <span>${item.quantity}</span>
        <button data-qty="1" data-id="${p.id}" aria-label="Sumar">+</button>
      </div></div>
      <button class="remove-button" data-remove="${p.id}">Eliminar</button>
    </div>`;
  }).join("") : '<p class="empty-state">Tu carrito está vacío. ¡Encontrá tu próximo smartphone!</p>';
  persistCart();
}
$("#cart-items").addEventListener("click", event => {
  const qty = event.target.closest("[data-qty]");
  const remove = event.target.closest("[data-remove]");
  if (qty) changeQty(Number(qty.dataset.id), Number(qty.dataset.qty));
  if (remove) removeCartItem(Number(remove.dataset.remove));
});
$("#cart-open").addEventListener("click", () => openPanel("cart"));
$("#login-open").addEventListener("click", () => openModal("login-modal"));
$("#admin-open").addEventListener("click", () => { renderAdminProducts(); openModal("admin-modal"); });
$("#search").addEventListener("input", renderProducts);
$("#sort").addEventListener("change", renderProducts);
$("#menu-toggle").addEventListener("click", () => $(".main-nav").classList.toggle("show"));

$$("[data-brand]").forEach(button => button.addEventListener("click", () => {
  activeBrand = button.dataset.brand;
  activeRange = "todos";
  updateChips(button);
  renderProducts();
}));
$$("[data-range]").forEach(button => button.addEventListener("click", () => {
  activeRange = button.dataset.range;
  activeBrand = "todos";
  updateChips(button);
  renderProducts();
}));
function updateChips(active) {
  $$(".category-chip").forEach(chip => chip.classList.toggle("active", chip === active));
}
$("#product-grid").addEventListener("click", event => {
  const button = event.target.closest("[data-add]");
  if (button) addToCart(Number(button.dataset.add));
});
$("#offers-grid").addEventListener("click", event => {
  const button = event.target.closest("[data-add]");
  if (button) addToCart(Number(button.dataset.add));
});

// Demo de login: NO es autenticación real y no almacena la contraseña.
$("#login-form").addEventListener("submit", event => {
  event.preventDefault();
  const email = $("#login-email").value.trim();
  if (!email) return;
  writeStorage(STORAGE.user, {email, demo:true});
  $("#login-message").textContent = `Sesión de demostración iniciada como ${email}.`;
  showToast("Sesión de demostración iniciada");
});

// Panel de administración local: solo en este navegador.
function renderAdminProducts() {
  $("#admin-products").innerHTML = products.map(p => `
    <div class="admin-product-row">
      <div><strong>${safeText(p.name)}</strong><small>${safeText(p.brand)} · ${money(finalPrice(p))} · Stock no conectado</small></div>
      <button type="button" data-delete-product="${p.id}">Eliminar</button>
    </div>`).join("");
}
$("#product-form").addEventListener("submit", event => {
  event.preventDefault();
  const name = $("#new-name").value.trim();
  const price = Number($("#new-price").value);
  const discount = Number($("#new-discount").value || 0);
  if (!name || !Number.isFinite(price) || price <= 0 || discount < 0 || discount > 80) {
    showToast("Revisá el nombre, el precio y el descuento.");
    return;
  }
  const brand = $("#new-brand").value;
  const range = $("#new-range").value;
  products.unshift({
    id: Math.max(0,...products.map(p => Number(p.id)||0))+1,
    name, brand, range, price, discount,
    image: $("#new-image").value.trim() || "",
    description: $("#new-description").value.trim()
  });
  persistProducts();
  renderProducts();
  renderAdminProducts();
  event.target.reset();
  $("#new-discount").value = 0;
  showToast("Producto agregado al catálogo local");
});
$("#admin-products").addEventListener("click", event => {
  const button = event.target.closest("[data-delete-product]");
  if (!button) return;
  const id = Number(button.dataset.deleteProduct);
  products = products.filter(p => p.id !== id);
  cart = cart.filter(item => item.id !== id);
  persistProducts();
  persistCart();
  renderProducts();
  renderCart();
  renderAdminProducts();
  showToast("Producto eliminado");
});
$("#reset-products").addEventListener("click", () => {
  if (!confirm("¿Restaurar el catálogo de demostración? Se perderán los cambios locales.")) return;
  products = seedProducts.map(p => ({...p}));
  cart = [];
  persistProducts();
  persistCart();
  renderProducts();
  renderCart();
  renderAdminProducts();
  showToast("Catálogo de demostración restaurado");
});

// Generar consulta de pedido por WhatsApp.
$("#whatsapp-checkout").addEventListener("click", () => {
  if (!cart.length) {
    showToast("Primero agregá un producto al carrito.");
    return;
  }
  if (!/^\d{10,15}$/.test(WHATSAPP_NUMBER) || WHATSAPP_NUMBER.includes("X")) {
    alert("Configurá WHATSAPP_NUMBER al inicio de script.js con tu número real, incluyendo código de país y área, sin + ni espacios.");
    return;
  }
  let message = "¡Hola PEACHEPHONE! Quiero consultar este pedido:%0A%0A";
  const lines = cart.map(item => {
    const p = products.find(product => product.id === item.id);
    return `• ${p.name} x ${item.quantity} — ${money(finalPrice(p)*item.quantity)}`;
  });
  const total = cart.reduce((sum,item) => sum + finalPrice(products.find(p => p.id === item.id))*item.quantity,0);
  message = `¡Hola PEACHEPHONE! Quiero consultar este pedido:\n\n${lines.join("\n")}\n\nTotal estimado: ${money(total)}\n\n¿Me confirman stock, envío y medios de pago?`;
  const url = `https://wa.me/${WHATSAPP_NUMBER}?text=${encodeURIComponent(message)}`;
  window.open(url, "_blank", "noopener,noreferrer");
});

 // Acceso oculto al panel de administración:
 // presioná Alt + Shift + P
document.addEventListener("keydown", event => {
  if (
    event.altKey &&
    event.shiftKey &&
    event.key.toLowerCase() === "p" &&
    !event.repeat
  ) {
    event.preventDefault();
    renderAdminProducts();
    openModal("admin-modal");
  }
});


$("#year").textContent = new Date().getFullYear();
renderProducts();
renderCart();
