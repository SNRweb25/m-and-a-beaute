// ============================================================
//  MnAbeaute — app.js
//  This single file powers all three pages.
//  It figures out which page it's on and runs the right code.
// ============================================================

// ---- ADMIN PASSWORD ----------------------------------------
const ADMIN_PASSWORD = 'soap2026';

// ============================================================
//  SITE SETTINGS  (name, tagline, colours)
//  Stored in localStorage so every page picks them up.
// ============================================================

const DEFAULT_SETTINGS = {
  siteName: 'MnAbeaute',
  tagline:  'Handcrafted Natural Soaps',
  colors: {
    primary: '#5c4a32',   // header, buttons, titles
    accent:  '#8b7355',   // secondary text, borders
    green:   '#6b7c5a',   // live badge, hover highlight
    bg:      '#faf7f2',   // page background
    text:    '#3d2e1e',   // body text
  },
};

function getSiteSettings() {
  const saved = localStorage.getItem('mn_settings');
  if (!saved) return DEFAULT_SETTINGS;
  // Merge saved over defaults so new keys always exist
  const parsed = JSON.parse(saved);
  return {
    ...DEFAULT_SETTINGS,
    ...parsed,
    colors: { ...DEFAULT_SETTINGS.colors, ...(parsed.colors || {}) },
  };
}

function saveSiteSettings(settings) {
  localStorage.setItem('mn_settings', JSON.stringify(settings));
}

// ---- Colour math helpers ----

function hexToRgb(hex) {
  const h = hex.replace('#', '');
  return [parseInt(h.slice(0,2),16), parseInt(h.slice(2,4),16), parseInt(h.slice(4,6),16)];
}

function rgbToHex(r, g, b) {
  return '#' + [r, g, b]
    .map(x => Math.max(0, Math.min(255, Math.round(x))).toString(16).padStart(2, '0'))
    .join('');
}

function darkenHex(hex, amt) {
  const [r,g,b] = hexToRgb(hex);
  return rgbToHex(r - amt, g - amt, b - amt);
}

function lightenHex(hex, amt) {
  const [r,g,b] = hexToRgb(hex);
  return rgbToHex(r + amt, g + amt, b + amt);
}

function mixHex(hex1, hex2, t) {   // t=0 → hex1, t=1 → hex2
  const [r1,g1,b1] = hexToRgb(hex1);
  const [r2,g2,b2] = hexToRgb(hex2);
  return rgbToHex(r1+(r2-r1)*t, g1+(g2-g1)*t, b1+(b2-b1)*t);
}

// Returns '#fff' or '#111' — whichever is more readable on top of hex
function contrastColor(hex) {
  const [r,g,b] = hexToRgb(hex);
  return (0.299*r + 0.587*g + 0.114*b) / 255 > 0.55 ? '#1a0f00' : '#faf7f2';
}

// ---- Build the CSS override block ----

function buildThemeCSS(colors) {
  const { primary, accent, green, bg, text } = colors;

  const primaryDk = darkenHex(primary, 22);
  const accentLt  = lightenHex(accent, 48);
  const card      = lightenHex(bg, 4);
  const border    = mixHex(bg, accent, 0.35);
  const surface   = mixHex(bg, accent, 0.18);
  const heroBg    = mixHex(bg, accent, 0.22);
  const heroEnd   = mixHex(bg, accent, 0.42);
  const footerBg  = darkenHex(text, 8);
  const greenLt   = lightenHex(green, 48);
  const greenDk   = darkenHex(green, 18);
  const headerTxt = contrastColor(primary);

  return `
/* ===== MnAbeaute Dynamic Theme ===== */
body { background-color: ${bg} !important; color: ${text} !important; }
a    { color: ${primary}; }

/* Header & nav */
header { background-color: ${primary} !important; }
.logo h1 { color: ${headerTxt} !important; }
.tagline  { color: ${accentLt}  !important; }
nav a               { color: ${accentLt}  !important; }
nav a:hover,
nav a.active        { color: ${headerTxt} !important; background: rgba(255,255,255,0.12) !important; }

/* Buttons */
.btn-primary, .owner-btn-login
  { background-color: ${primary} !important; color: ${headerTxt} !important; }
.btn-primary:hover, .owner-btn-login:hover
  { background-color: ${primaryDk} !important; }
.btn-outline { border-color: ${accentLt} !important; color: ${accentLt} !important; }
.cart-btn       { background: ${accent}  !important; }
.cart-btn:hover { background: ${green}   !important; }

/* Hero banner */
.hero { background: linear-gradient(135deg, ${heroBg} 0%, ${heroEnd} 100%) !important; }
.hero h2 { color: ${text}    !important; }
.hero p  { color: ${primary} !important; }

/* Product grid */
.section-title { color: ${primary} !important; border-bottom-color: ${border} !important; }
.product-card  { background: ${card} !important; border-color: ${border} !important; }
.product-card:hover { box-shadow: 0 6px 20px rgba(0,0,0,0.10) !important; }
.product-name  { color: ${text}    !important; }
.product-price { color: ${primary} !important; }
.product-desc, .product-stock { color: ${accent} !important; }

/* Cart sidebar */
.cart-panel   { background: ${card}    !important; }
.cart-header,
.cart-footer  { background: ${surface} !important; border-color: ${border} !important; }
.cart-header h2, .cart-total { color: ${text} !important; }
.cart-item-name  { color: ${text}   !important; }
.cart-item-price { color: ${accent} !important; }
.cart-empty      { color: ${accent} !important; }
.qty-btn         { border-color: ${border} !important; background: ${bg} !important; }
.qty-btn:hover   { background: ${border} !important; }

/* Inventory page */
.live-badge { background: ${green} !important; }
.page-header h2 { color: ${text} !important; }
.inventory-table th { background: ${primary} !important; color: ${headerTxt} !important; }
.inventory-table td { color: ${text} !important; }
.inventory-table tr:hover td { background: ${surface} !important; }
.inventory-table-wrap { border-color: ${border} !important; }
.status-ok  { background: ${greenLt} !important; color: ${greenDk}   !important; }
.status-low { background: ${lightenHex(accent,42)} !important; color: ${darkenHex(accent,15)} !important; }

/* Footer */
footer { background: ${footerBg} !important; color: ${accentLt} !important; }

/* Login cards (admin & owner) */
.login-card, .owner-login-card
  { background: ${card} !important; border-color: ${border} !important; }
.login-card h2, .owner-login-card h2 { color: ${text}   !important; }
.login-card p,  .owner-login-card p  { color: ${accent} !important; }
.back-link, .owner-back-link         { color: ${accent} !important; }
.owner-login-divider { background: ${border} !important; }
.owner-input-wrap    { border-color: ${border} !important; background: ${bg} !important; }
.owner-input-wrap:focus-within { border-color: ${primary} !important; }

/* Admin dashboard */
.admin-section  { background: ${card} !important; border-color: ${border} !important; }
.admin-section h2 { color: ${text} !important; border-color: ${border} !important; }
.admin-product-card { background: ${bg} !important; border-color: ${border} !important; }
.admin-product-name { color: ${text}   !important; }
.admin-product-desc { color: ${accent} !important; }
.form-row label, .editable-field label { color: ${primary} !important; }
.form-row input, .editable-field input
  { background: ${bg} !important; border-color: ${border} !important; color: ${text} !important; }

/* Owner dashboard */
.owner-topbar { background: ${footerBg} !important; }
.owner-panel  { background: ${card}     !important; border-color: ${border} !important; }
.owner-panel-header { background: ${surface} !important; border-color: ${border} !important; }
.owner-panel-header h2 { color: ${text} !important; }
.owner-stat-card { background: ${card} !important; border-color: ${border} !important; }
.owner-stat-value { color: ${text}   !important; }
.owner-stat-label { color: ${accent} !important; }
.owner-form-row label { color: ${primary} !important; }
.owner-form-row input,
.owner-form-row textarea,
.owner-search-wrap input
  { background: ${bg} !important; border-color: ${border} !important; color: ${text} !important; }
.db-table thead th { background: ${primary} !important; color: ${headerTxt} !important; }
.db-table td { color: ${text} !important; border-color: ${border} !important; }
.db-table tr:hover td { background: ${surface} !important; }
.db-table-scroll { background: ${card} !important; }
.db-editable { color: ${text} !important; background: transparent !important; }
.db-editable:focus { border-color: ${primary} !important; background: ${bg} !important; }
.db-thumb-placeholder { border-color: ${border} !important; }
.photo-upload-box { border-color: ${border} !important; background: ${bg} !important; }
.photo-upload-box:hover { border-color: ${primary} !important; background: ${surface} !important; }
`.trim();
}

// ---- Apply theme + site name to the current page ----

function applyTheme() {
  const s = getSiteSettings();

  // Swap in the site name and tagline wherever the data attributes appear
  document.querySelectorAll('[data-site-name]').forEach(el => {
    el.textContent = s.siteName;
  });
  document.querySelectorAll('[data-site-tagline]').forEach(el => {
    el.textContent = s.tagline;
  });

  // Update the browser tab title  (keep the page suffix after ·)
  const parts = document.title.split('·');
  document.title = parts.length > 1
    ? s.siteName + ' · ' + parts.slice(1).join('·').trim()
    : s.siteName;

  // Inject (or replace) the theme <style> block
  let styleEl = document.getElementById('mn-theme');
  if (!styleEl) {
    styleEl = document.createElement('style');
    styleEl.id = 'mn-theme';
    document.head.appendChild(styleEl);
  }
  styleEl.textContent = buildThemeCSS(s.colors);
}

// Also re-apply when another tab saves new settings
window.addEventListener('storage', (e) => {
  if (e.key === 'mn_settings') applyTheme();
});

// ---- DEFAULT PRODUCTS --------------------------------------
// These are the soaps loaded the very first time the site opens.
// After that, changes are saved to localStorage so they persist.
const DEFAULT_PRODUCTS = [
  {
    id: 1,
    name: 'Lavender Dreams',
    desc: 'Calming lavender with oat milk & honey',
    emoji: '💜',
    price: 10.00,
    stock: 50,
  },
  {
    id: 2,
    name: 'Citrus Burst',
    desc: 'Zesty lemon & orange peel, energising start to your day',
    emoji: '🍊',
    price: 10.00,
    stock: 50,
  },
  {
    id: 3,
    name: 'Forest Rain',
    desc: 'Cedarwood & eucalyptus for a fresh forest feel',
    emoji: '🌲',
    price: 10.00,
    stock: 50,
  },
  {
    id: 4,
    name: 'Rose Petal',
    desc: 'Gentle rose & jojoba oil, perfect for sensitive skin',
    emoji: '🌹',
    price: 10.00,
    stock: 50,
  },
  {
    id: 5,
    name: 'Peppermint Chill',
    desc: 'Cool peppermint & tea tree, refreshing and invigorating',
    emoji: '🌿',
    price: 10.00,
    stock: 50,
  },
  {
    id: 6,
    name: 'Coconut Dream',
    desc: 'Rich coconut milk & vanilla for deeply moisturised skin',
    emoji: '🥥',
    price: 10.00,
    stock: 50,
  },
];

// ============================================================
//  DATA HELPERS
//  Products are stored in the browser's localStorage so they
//  persist across page refreshes and are shared across all tabs.
// ============================================================

function getProducts() {
  const saved = localStorage.getItem('bl_products');
  // If nothing saved yet, use our defaults and save them
  if (!saved) {
    saveProducts(DEFAULT_PRODUCTS);
    return DEFAULT_PRODUCTS;
  }
  return JSON.parse(saved);
}

function saveProducts(products) {
  localStorage.setItem('bl_products', JSON.stringify(products));
}

// Cart is also stored in localStorage so it survives a refresh
function getCart() {
  const saved = localStorage.getItem('bl_cart');
  return saved ? JSON.parse(saved) : {};
}

function saveCart(cart) {
  localStorage.setItem('bl_cart', JSON.stringify(cart));
}

// ============================================================
//  PAGE ROUTER
//  Reads the data-page attribute on <body> to decide what to run
// ============================================================
const page = document.body.dataset.page;

// Apply theme colours + site name on every page immediately
applyTheme();

// Show the owner quick-nav bar on every page when logged in as owner/admin
injectOwnerBar();

if (page === 'shop')      initShop();
if (page === 'inventory') initInventory();
if (page === 'admin')     initAdmin();

// ============================================================
//  OWNER QUICK-NAV BAR
//  A small floating bar visible only when the owner is logged in.
//  Lets them jump between Admin, Owner Database, Shop and
//  Inventory without typing a password each time.
//  Disappears completely for regular customers.
// ============================================================
function injectOwnerBar() {
  const auth = sessionStorage.getItem('mn_auth');
  // Only show if logged in as admin or owner
  if (auth !== 'admin' && auth !== 'owner') return;
  // Don't add twice
  if (document.getElementById('ownerBar')) return;

  const isOwner = auth === 'owner';

  const bar = document.createElement('div');
  bar.id = 'ownerBar';
  bar.innerHTML = `
    <span class="owner-bar-label">🔑 Owner</span>
    <a href="index.html"     class="owner-bar-link ${page === 'shop'      ? 'active' : ''}">🛒 Shop</a>
    <a href="inventory.html" class="owner-bar-link ${page === 'inventory' ? 'active' : ''}">📦 Stock</a>
    <a href="admin.html"     class="owner-bar-link ${page === 'admin'     ? 'active' : ''}">⚙️ Admin</a>
    ${isOwner
      ? `<a href="owner.html" class="owner-bar-link ${page === 'owner' ? 'active' : ''}">🗄️ Database</a>`
      : ''}
    <button class="owner-bar-logout" onclick="ownerBarLogout()">Logout</button>
  `;
  document.body.appendChild(bar);
}

function ownerBarLogout() {
  sessionStorage.removeItem('mn_auth');
  window.location.href = 'index.html';
}

// ============================================================
//  SHOP PAGE
// ============================================================

function initShop() {
  renderProducts();
  renderCart();

  // Open / close cart sidebar
  document.getElementById('cartBtn').addEventListener('click', openCart);
  document.getElementById('closeCart').addEventListener('click', closeCart);
  document.getElementById('cartOverlay').addEventListener('click', closeCart);

  // Purchase button
  document.getElementById('checkoutBtn').addEventListener('click', checkout);

  // Listen for stock changes made in another tab (e.g. admin page)
  window.addEventListener('storage', (e) => {
    if (e.key === 'bl_products') renderProducts();
  });
}

// Build and display all product cards
function renderProducts() {
  const products = getProducts();
  const grid = document.getElementById('productGrid');
  grid.innerHTML = '';

  products.forEach(product => {
    const outOfStock = product.stock === 0;
    const lowStock   = product.stock > 0 && product.stock <= 5;

    let stockLabel = `${product.stock} in stock`;
    if (outOfStock) stockLabel = 'Out of stock';
    if (lowStock)   stockLabel = `Only ${product.stock} left!`;

    const stockClass = outOfStock ? 'out' : lowStock ? 'low' : '';

    // Show uploaded photo if available, otherwise show the emoji
    const photoHtml = product.photo
      ? `<img class="product-photo" src="${product.photo}" alt="${product.name}" />`
      : `<div class="product-emoji">${product.emoji}</div>`;

    const card = document.createElement('div');
    card.className = 'product-card';
    card.innerHTML = `
      ${photoHtml}
      <div class="product-name">${product.name}</div>
      <div class="product-desc">${product.desc}</div>
      <div class="product-price">$${product.price.toFixed(2)}</div>
      <div class="product-stock ${stockClass}">${stockLabel}</div>
      <button
        class="btn btn-primary"
        onclick="addToCart(${product.id})"
        ${outOfStock ? 'disabled' : ''}
      >
        ${outOfStock ? 'Out of Stock' : 'Add to Cart'}
      </button>
    `;
    grid.appendChild(card);
  });
}

// Add one unit of a product to the cart
function addToCart(productId) {
  const products = getProducts();
  const product  = products.find(p => p.id === productId);
  if (!product || product.stock === 0) return;

  const cart = getCart();

  // Check we aren't trying to add more than what's in stock
  const currentQty = cart[productId] ? cart[productId].qty : 0;
  if (currentQty >= product.stock) {
    showToast(`Sorry, only ${product.stock} in stock!`);
    return;
  }

  if (cart[productId]) {
    cart[productId].qty += 1;
  } else {
    cart[productId] = { qty: 1, name: product.name, price: product.price, emoji: product.emoji };
  }

  saveCart(cart);
  renderCart();
  showToast(`${product.emoji} ${product.name} added to cart!`);
}

// Draw the cart sidebar contents
function renderCart() {
  const cart     = getCart();
  const itemsDiv = document.getElementById('cartItems');
  const footer   = document.getElementById('cartFooter');
  const countEl  = document.getElementById('cartCount');

  const entries = Object.entries(cart); // [[id, {qty, name, price}], ...]

  // Update the item count shown on the cart button
  const totalItems = entries.reduce((sum, [, item]) => sum + item.qty, 0);
  countEl.textContent = totalItems;

  if (entries.length === 0) {
    itemsDiv.innerHTML = '<p class="cart-empty">Your cart is empty.</p>';
    footer.style.display = 'none';
    return;
  }

  footer.style.display = 'block';

  let html = '';
  let total = 0;

  entries.forEach(([id, item]) => {
    const lineTotal = item.price * item.qty;
    total += lineTotal;
    html += `
      <div class="cart-item">
        <div class="cart-item-info">
          <div class="cart-item-name">${item.emoji} ${item.name}</div>
          <div class="cart-item-price">$${item.price.toFixed(2)} each</div>
        </div>
        <div class="cart-item-controls">
          <button class="qty-btn" onclick="changeQty(${id}, -1)">−</button>
          <span class="cart-item-qty">${item.qty}</span>
          <button class="qty-btn" onclick="changeQty(${id}, 1)">+</button>
        </div>
      </div>
    `;
  });

  itemsDiv.innerHTML = html;
  document.getElementById('cartTotal').textContent = total.toFixed(2);
}

// Increase or decrease a cart item's quantity
function changeQty(productId, delta) {
  const cart     = getCart();
  const products = getProducts();
  const product  = products.find(p => p.id === Number(productId));

  if (!cart[productId]) return;

  cart[productId].qty += delta;

  // If quantity drops to 0 or below, remove the item from the cart
  if (cart[productId].qty <= 0) {
    delete cart[productId];
  }

  // Don't let quantity exceed available stock
  if (product && cart[productId] && cart[productId].qty > product.stock) {
    cart[productId].qty = product.stock;
    showToast(`Only ${product.stock} in stock!`);
  }

  saveCart(cart);
  renderCart();
}

// Complete the purchase: deduct stock and clear the cart
function checkout() {
  const cart     = getCart();
  const products = getProducts();
  const entries  = Object.entries(cart);

  if (entries.length === 0) return;

  // Check stock is still available before processing
  for (const [id, item] of entries) {
    const product = products.find(p => p.id === Number(id));
    if (!product || product.stock < item.qty) {
      showToast(`Sorry! ${item.name} is no longer available in that quantity.`);
      return;
    }
  }

  // Deduct purchased quantities from stock
  entries.forEach(([id, item]) => {
    const product = products.find(p => p.id === Number(id));
    if (product) product.stock -= item.qty;
  });

  saveProducts(products);   // save updated stock
  saveCart({});             // clear the cart

  closeCart();
  renderProducts();         // refresh product cards with new stock numbers
  renderCart();             // refresh cart (now empty)
  showToast('🎉 Thank you for your purchase!');
}

function openCart() {
  document.getElementById('cartPanel').classList.add('open');
  document.getElementById('cartOverlay').classList.add('open');
}

function closeCart() {
  document.getElementById('cartPanel').classList.remove('open');
  document.getElementById('cartOverlay').classList.remove('open');
}

// Show a brief pop-up message at the bottom of the screen
function showToast(message) {
  const toast = document.getElementById('toast');
  toast.textContent = message;
  toast.classList.add('show');
  setTimeout(() => toast.classList.remove('show'), 2800);
}

// ============================================================
//  INVENTORY PAGE
// ============================================================

function initInventory() {
  renderInventory();

  // Update the table whenever localStorage changes in another tab
  // (e.g. a purchase on the shop page, or admin edits)
  window.addEventListener('storage', (e) => {
    if (e.key === 'bl_products') renderInventory();
  });

  // Also refresh every 5 seconds as a fallback
  setInterval(renderInventory, 5000);
}

function renderInventory() {
  const products = getProducts();
  const tbody    = document.getElementById('inventoryBody');

  tbody.innerHTML = '';

  products.forEach(product => {
    let statusClass, statusLabel;

    if (product.stock === 0) {
      statusClass = 'status-out'; statusLabel = 'Out of Stock';
    } else if (product.stock <= 5) {
      statusClass = 'status-low'; statusLabel = 'Low Stock';
    } else {
      statusClass = 'status-ok';  statusLabel = 'In Stock';
    }

    const row = document.createElement('tr');
    row.innerHTML = `
      <td>${product.emoji} <strong>${product.name}</strong></td>
      <td>${product.desc}</td>
      <td>$${product.price.toFixed(2)}</td>
      <td><strong>${product.stock}</strong></td>
      <td><span class="status-badge ${statusClass}">${statusLabel}</span></td>
    `;
    tbody.appendChild(row);
  });
}

// ============================================================
//  ADMIN PAGE
// ============================================================

function initAdmin() {
  const loginScreen    = document.getElementById('loginScreen');
  const adminDashboard = document.getElementById('adminDashboard');

  // ---- Unified session auth ----
  // Admin is accessible if logged in as 'admin' OR 'owner' (owner has full access).
  // sessionStorage clears automatically when the browser tab is closed — so
  // you only need to log in once per browsing session, not per page visit.
  const auth = sessionStorage.getItem('mn_auth');
  if (auth === 'admin' || auth === 'owner') {
    loginScreen.style.display    = 'none';
    adminDashboard.style.display = 'block';
    renderAdminProducts();
  }

  document.getElementById('loginForm').addEventListener('submit', (e) => {
    e.preventDefault();
    const entered = document.getElementById('passwordInput').value;
    const errorEl = document.getElementById('loginError');

    if (entered === ADMIN_PASSWORD) {
      // Only upgrade to 'admin' if not already 'owner'
      if (sessionStorage.getItem('mn_auth') !== 'owner') {
        sessionStorage.setItem('mn_auth', 'admin');
      }
      loginScreen.style.display    = 'none';
      adminDashboard.style.display = 'block';
      renderAdminProducts();
    } else {
      errorEl.textContent = 'Incorrect password. Please try again.';
      document.getElementById('passwordInput').value = '';
    }
  });

  document.getElementById('logoutBtn').addEventListener('click', () => {
    sessionStorage.removeItem('mn_auth');
    adminDashboard.style.display = 'none';
    loginScreen.style.display    = 'flex';
    document.getElementById('passwordInput').value = '';
    document.getElementById('loginError').textContent = '';
  });

  document.getElementById('addSoapForm').addEventListener('submit', (e) => {
    e.preventDefault();
    addNewSoap();
  });
}

// Show all products as editable cards in the admin dashboard
function renderAdminProducts() {
  const products = getProducts();
  const list     = document.getElementById('adminProductList');
  list.innerHTML = '';

  if (products.length === 0) {
    list.innerHTML = '<p style="color:#8b7355; font-style:italic;">No soaps yet. Add one above!</p>';
    return;
  }

  products.forEach(product => {
    const card = document.createElement('div');
    card.className = 'admin-product-card';
    card.id = `admin-card-${product.id}`;

    card.innerHTML = `
      <div class="admin-product-emoji">${product.emoji}</div>
      <div class="admin-product-info">
        <div class="admin-product-name">${product.name}</div>
        <div class="admin-product-desc">${product.desc}</div>
      </div>

      <!-- Editable price field -->
      <div class="editable-field">
        <label>Price $</label>
        <input
          type="number"
          value="${product.price.toFixed(2)}"
          step="0.01"
          min="0.01"
          onchange="updateField(${product.id}, 'price', this.value)"
        />
      </div>

      <!-- Editable stock field -->
      <div class="editable-field">
        <label>Stock</label>
        <input
          type="number"
          value="${product.stock}"
          min="0"
          onchange="updateField(${product.id}, 'stock', this.value)"
        />
      </div>

      <!-- Delete button -->
      <div class="admin-product-actions">
        <button class="btn btn-danger btn-sm" onclick="deleteProduct(${product.id})">
          🗑 Remove
        </button>
      </div>
    `;

    list.appendChild(card);
  });
}

// Save a changed price or stock value
function updateField(productId, field, rawValue) {
  const products = getProducts();
  const product  = products.find(p => p.id === productId);
  if (!product) return;

  if (field === 'price') {
    const newPrice = parseFloat(rawValue);
    if (isNaN(newPrice) || newPrice < 0) return;
    product.price = Math.round(newPrice * 100) / 100; // keep to 2 decimal places
  }

  if (field === 'stock') {
    const newStock = parseInt(rawValue, 10);
    if (isNaN(newStock) || newStock < 0) return;
    product.stock = newStock;
  }

  saveProducts(products);
  // No need to re-render the admin list — the input fields already show the new value
}

// Delete a soap from the shop entirely
function deleteProduct(productId) {
  const confirmed = window.confirm('Remove this soap from the shop? This cannot be undone.');
  if (!confirmed) return;

  const products = getProducts().filter(p => p.id !== productId);
  saveProducts(products);

  // Also remove it from any open cart
  const cart = getCart();
  delete cart[productId];
  saveCart(cart);

  renderAdminProducts();
}

// Add a brand-new soap from the form fields
function addNewSoap() {
  const name  = document.getElementById('newName').value.trim();
  const desc  = document.getElementById('newDesc').value.trim();
  const emoji = document.getElementById('newEmoji').value.trim() || '🧼';
  const price = parseFloat(document.getElementById('newPrice').value);
  const stock = parseInt(document.getElementById('newStock').value, 10);

  if (!name || !desc || isNaN(price) || isNaN(stock)) return;

  const products = getProducts();

  // Generate a unique ID (highest existing id + 1)
  const newId = products.length > 0 ? Math.max(...products.map(p => p.id)) + 1 : 1;

  products.push({ id: newId, name, desc, emoji, price, stock });
  saveProducts(products);

  // Clear the form fields
  document.getElementById('addSoapForm').reset();
  document.getElementById('newEmoji').value = '🧼';

  renderAdminProducts();
}
