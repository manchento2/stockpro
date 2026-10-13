/**
 * ═══════════════════════════════════════════════════════════
 * STOCKPRO – PANEL DE CONTROL DE STOCK E INVENTARIO
 * app.js – Vanilla JavaScript con LocalStorage
 * SPA completa: Dashboard, Categorías, Reportes,
 * Configuración, Notificaciones y Perfil de Administrador
 * ═══════════════════════════════════════════════════════════
 */

'use strict';

// ── 1. CONSTANTES Y CONFIGURACIÓN ──
const STORAGE_KEYS = {
  products:   'stockpro_inventory_data_v1',
  settings:   'stockpro_settings_v1',
  categories: 'stockpro_categories_v1',
  profile:    'stockpro_profile_v1'
};

const DEFAULT_SETTINGS = {
  companyName: 'StockPro San Luis',
  lowStockThreshold: 5,
  currency: '$',
  showBanner: true
};

const DEFAULT_PROFILE = {
  name: 'Marcelo Admin',
  email: 'admin@stockpro.io',
  role: 'Administrador General',
  loginTime: new Date().toLocaleTimeString('es-AR', { hour: '2-digit', minute: '2-digit' })
};

const INITIAL_CATEGORIES = [
  { name: 'Electrónica',  icon: 'fa-laptop' },
  { name: 'Herramientas', icon: 'fa-wrench' },
  { name: 'Insumos',      icon: 'fa-box-archive' },
  { name: 'Mobiliario',   icon: 'fa-chair' },
  { name: 'Informática',  icon: 'fa-desktop' },
  { name: 'Limpieza',     icon: 'fa-spray-can-sparkles' },
  { name: 'Otros',        icon: 'fa-cubes' }
];

const INITIAL_PRODUCTS = [
  {
    id: 1,
    name: 'Laptop Dell Inspiron 15',
    category: 'Electrónica',
    quantity: 12,
    price: 850.00,
    desc: 'Intel Core i5, 16GB RAM, SSD 512GB'
  },
  {
    id: 2,
    name: 'Mouse Inalámbrico Logitech M170',
    category: 'Electrónica',
    quantity: 3,
    price: 18.50,
    desc: 'Conexión 2.4 GHz USB nano receptor'
  },
  {
    id: 3,
    name: 'Taladro Percutor DeWalt 20V',
    category: 'Herramientas',
    quantity: 2,
    price: 195.00,
    desc: 'Motor brushless con 2 baterías de litio'
  },
  {
    id: 4,
    name: 'Juego de Destornilladores Stanley (6 pcs)',
    category: 'Herramientas',
    quantity: 18,
    price: 24.90,
    desc: 'Puntas magnéticas templadas cromo-vanadio'
  },
  {
    id: 5,
    name: 'Papel Fotocopia A4 Chambril 75g (Resma)',
    category: 'Insumos',
    quantity: 45,
    price: 7.20,
    desc: 'Caja x 5 resmas de 500 hojas c/u'
  },
  {
    id: 6,
    name: 'Tóner Láser HP 85A Negro Original',
    category: 'Insumos',
    quantity: 4,
    price: 68.00,
    desc: 'Rendimiento estándar aprox. 1.600 páginas'
  },
  {
    id: 7,
    name: 'Silla Ergonómica Ejecutiva Mesh',
    category: 'Mobiliario',
    quantity: 8,
    price: 230.00,
    desc: 'Soporte lumbar ajustable y apoyabrazos 3D'
  },
  {
    id: 8,
    name: 'Monitor LG UltraWide 29" IPS',
    category: 'Informática',
    quantity: 1,
    price: 310.00,
    desc: 'Resolución Full HD 2560x1080 75Hz HDR10'
  }
];

const CATEGORY_CLASS_MAP = {
  'Electrónica':  'cat--electronica',
  'Herramientas': 'cat--herramientas',
  'Insumos':      'cat--insumos',
  'Mobiliario':   'cat--mobiliario',
  'Informática':  'cat--informatica',
  'Limpieza':     'cat--limpieza',
  'Otros':        'cat--otros'
};

const PICON_CLASS_MAP = {
  'Electrónica':  'picon--electronica',
  'Herramientas': 'picon--herramientas',
  'Insumos':      'picon--insumos',
  'Mobiliario':   'picon--mobiliario',
  'Informática':  'picon--informatica',
  'Limpieza':     'picon--limpieza',
  'Otros':        'picon--otros'
};

// ── 2. ESTADO GLOBAL DE LA APLICACIÓN ──
let state = {
  currentView: 'dashboard',
  products: [],
  categories: [],
  settings: { ...DEFAULT_SETTINGS },
  profile: { ...DEFAULT_PROFILE },
  filters: {
    search: '',
    category: '',
    stockStatus: ''
  },
  sort: {
    column: 'id',
    ascending: true
  },
  editingId: null,
  deletingId: null
};

// ── 3. REFERENCIAS DEL DOM ──
const elements = {
  // Navegación y Vistas
  views: {
    dashboard:  document.getElementById('view-dashboard'),
    categories: document.getElementById('view-categories'),
    reports:    document.getElementById('view-reports'),
    settings:   document.getElementById('view-settings')
  },
  navItems: {
    dashboard:  document.getElementById('nav-dashboard'),
    inventory:  document.getElementById('nav-inventory'),
    alerts:     document.getElementById('nav-alerts'),
    categories: document.getElementById('nav-categories'),
    reports:    document.getElementById('nav-reports'),
    settings:   document.getElementById('nav-settings')
  },
  pageTitle:          document.getElementById('page-title'),
  breadcrumbCurrent:  document.getElementById('breadcrumb-current'),

  // KPIs Dashboard
  kpiProducts:        document.getElementById('kpi-products-val'),
  kpiUnits:           document.getElementById('kpi-units-val'),
  kpiAlerts:          document.getElementById('kpi-alerts-val'),
  kpiValue:           document.getElementById('kpi-value-val'),
  sidebarAlertCount:  document.getElementById('sidebar-alert-count'),
  notifBadge:         document.getElementById('notif-badge'),
  alertBanner:        document.getElementById('alert-banner'),
  alertCountInline:   document.getElementById('alert-count-inline'),
  alertBannerClose:   document.getElementById('alert-banner-close'),

  // Filtros y Tabla
  searchInput:        document.getElementById('search-input'),
  searchClear:        document.getElementById('search-clear'),
  categoryFilter:     document.getElementById('category-filter'),
  stockFilter:        document.getElementById('stock-filter'),
  topbarSearchInput:  document.getElementById('topbar-search-input'),
  btnClearFilters:    document.getElementById('btn-clear-filters'),
  tableBody:          document.getElementById('table-body'),
  tableCount:         document.getElementById('table-count'),
  tableShowing:       document.getElementById('table-showing'),
  tableEmpty:         document.getElementById('table-empty'),
  emptyMessage:       document.getElementById('empty-message'),
  btnAddProduct:      document.getElementById('btn-add-product'),
  btnExport:          document.getElementById('btn-export'),
  btnResetData:       document.getElementById('btn-reset-data'),

  // Notificaciones Dropdown
  notificationBtn:    document.getElementById('notification-btn'),
  notifDropdown:      document.getElementById('notif-dropdown'),
  notifDropdownCount: document.getElementById('notif-dropdown-count'),
  notifClearBtn:      document.getElementById('notif-clear-btn'),
  notifList:          document.getElementById('notif-list'),
  notifViewAll:       document.getElementById('notif-view-all'),

  // Vista Categorías
  categoriesGrid:     document.getElementById('categories-grid'),
  catKpiCount:        document.getElementById('cat-kpi-count'),
  catKpiTopValue:     document.getElementById('cat-kpi-top-value'),
  catKpiTopValueSub:  document.getElementById('cat-kpi-top-value-sub'),
  catKpiTopUnits:     document.getElementById('cat-kpi-top-units'),
  catKpiTopUnitsSub:  document.getElementById('cat-kpi-top-units-sub'),
  btnAddCategory:     document.getElementById('btn-add-category'),

  // Modal Nueva Categoría
  categoryModalBackdrop: document.getElementById('category-modal-backdrop'),
  categoryModalClose:    document.getElementById('category-modal-close'),
  categoryModalCancel:   document.getElementById('category-modal-cancel'),
  categoryModalSave:     document.getElementById('category-modal-save'),
  categoryForm:          document.getElementById('category-form'),
  newCatName:            document.getElementById('new-cat-name'),
  newCatIcon:            document.getElementById('new-cat-icon'),
  errCatName:            document.getElementById('err-cat-name'),

  // Vista Reportes
  repKpiAvgPrice:     document.getElementById('rep-kpi-avg-price'),
  repKpiTopProduct:   document.getElementById('rep-kpi-top-product'),
  repKpiTopProductSub:document.getElementById('rep-kpi-top-product-sub'),
  repKpiHealth:       document.getElementById('rep-kpi-health'),
  repKpiRiskCount:    document.getElementById('rep-kpi-risk-count'),
  repCategoryBars:    document.getElementById('rep-category-bars'),
  repTopProductsList: document.getElementById('rep-top-products-list'),
  repRestockPanel:    document.getElementById('rep-restock-panel'),
  btnPrintReport:     document.getElementById('btn-print-report'),
  btnExportReports:   document.getElementById('btn-export-reports'),

  // Vista Configuración
  settingsForm:          document.getElementById('settings-form'),
  settingCompanyName:    document.getElementById('setting-company-name'),
  settingLowThreshold:   document.getElementById('setting-low-threshold'),
  settingCurrency:       document.getElementById('setting-currency'),
  settingShowBanner:     document.getElementById('setting-show-banner'),
  btnBackupExport:       document.getElementById('btn-backup-export'),
  inputBackupImport:     document.getElementById('input-backup-import'),
  btnSettingsResetDemo:  document.getElementById('btn-settings-reset-demo'),
  btnClearAllData:       document.getElementById('btn-clear-all-data'),

  // Modal Producto (CRUD)
  modalBackdrop:      document.getElementById('modal-backdrop'),
  modalTitle:         document.getElementById('modal-title'),
  modalSubtitle:      document.getElementById('modal-subtitle'),
  modalClose:         document.getElementById('modal-close'),
  modalCancel:        document.getElementById('modal-cancel'),
  modalSave:          document.getElementById('modal-save'),
  modalSaveText:      document.getElementById('modal-save-text'),
  modalHeaderIcon:    document.getElementById('modal-header-icon'),
  productForm:        document.getElementById('product-form'),
  productId:          document.getElementById('product-id'),
  fieldName:          document.getElementById('field-name'),
  fieldCategory:      document.getElementById('field-category'),
  fieldQuantity:      document.getElementById('field-quantity'),
  fieldPrice:         document.getElementById('field-price'),
  fieldDesc:          document.getElementById('field-desc'),
  descCount:          document.getElementById('desc-count'),
  qtyMinus:           document.getElementById('qty-minus'),
  qtyPlus:            document.getElementById('qty-plus'),
  modalPreviewBadge:  document.getElementById('modal-preview-badge'),
  modalPreviewValue:  document.getElementById('modal-preview-value'),
  errName:            document.getElementById('err-name'),
  errCategory:        document.getElementById('err-category'),
  errQuantity:        document.getElementById('err-quantity'),
  errPrice:           document.getElementById('err-price'),

  // Modal Confirmación Eliminación
  confirmBackdrop:    document.getElementById('confirm-backdrop'),
  confirmProductName: document.getElementById('confirm-product-name'),
  confirmClose:       document.getElementById('confirm-close'),
  confirmCancel:      document.getElementById('confirm-cancel'),
  confirmDelete:      document.getElementById('confirm-delete'),

  // Modal Perfil de Administrador
  profileBackdrop:    document.getElementById('profile-backdrop'),
  profileClose:       document.getElementById('profile-close'),
  profileDisplayName: document.getElementById('profile-display-name'),
  profileNameInput:   document.getElementById('profile-name-input'),
  profileEmailInput:  document.getElementById('profile-email-input'),
  profileLastLogin:   document.getElementById('profile-last-login'),
  btnSaveProfile:     document.getElementById('btn-save-profile'),
  btnLogout:          document.getElementById('btn-logout'),
  sidebarUser:        document.getElementById('sidebar-user'),
  sidebarUserName:    document.getElementById('sidebar-user-name'),
  sidebarUserRole:    document.getElementById('sidebar-user-role'),
  topbarAvatar:       document.getElementById('topbar-avatar'),

  // Shell Layout
  toastContainer:     document.getElementById('toast-container'),
  sidebar:            document.getElementById('sidebar'),
  sidebarToggle:      document.getElementById('sidebar-toggle'),
  sidebarOverlay:     document.getElementById('sidebar-overlay'),
  topbarDate:         document.getElementById('topbar-date')
};

// ── 4. INICIALIZACIÓN ──
document.addEventListener('DOMContentLoaded', () => {
  loadStoredData();
  initDateDisplay();
  populateCategorySelects();
  bindEvents();
  renderAll();
});

// Cargar estado desde LocalStorage
function loadStoredData() {
  // 1. Productos
  try {
    const rawProducts = localStorage.getItem(STORAGE_KEYS.products);
    if (!rawProducts) {
      state.products = [...INITIAL_PRODUCTS];
      saveStorage(STORAGE_KEYS.products, state.products);
    } else {
      state.products = JSON.parse(rawProducts);
      if (!Array.isArray(state.products)) state.products = [...INITIAL_PRODUCTS];
    }
  } catch {
    state.products = [...INITIAL_PRODUCTS];
  }

  // 2. Configuración
  try {
    const rawSettings = localStorage.getItem(STORAGE_KEYS.settings);
    if (rawSettings) {
      state.settings = { ...DEFAULT_SETTINGS, ...JSON.parse(rawSettings) };
    } else {
      state.settings = { ...DEFAULT_SETTINGS };
      saveStorage(STORAGE_KEYS.settings, state.settings);
    }
  } catch {
    state.settings = { ...DEFAULT_SETTINGS };
  }

  // 3. Categorías
  try {
    const rawCats = localStorage.getItem(STORAGE_KEYS.categories);
    if (rawCats) {
      state.categories = JSON.parse(rawCats);
    } else {
      state.categories = [...INITIAL_CATEGORIES];
      saveStorage(STORAGE_KEYS.categories, state.categories);
    }
  } catch {
    state.categories = [...INITIAL_CATEGORIES];
  }

  // 4. Perfil
  try {
    const rawProfile = localStorage.getItem(STORAGE_KEYS.profile);
    if (rawProfile) {
      state.profile = { ...DEFAULT_PROFILE, ...JSON.parse(rawProfile) };
    } else {
      state.profile = { ...DEFAULT_PROFILE };
      saveStorage(STORAGE_KEYS.profile, state.profile);
    }
  } catch {
    state.profile = { ...DEFAULT_PROFILE };
  }

  // Aplicar datos iniciales en controles de UI
  applySettingsToUI();
  applyProfileToUI();
}

function saveStorage(key, data) {
  try {
    localStorage.setItem(key, JSON.stringify(data));
  } catch (err) {
    console.error(`Error guardando en ${key}:`, err);
  }
}

// ── 5. FORMATEO Y MONEDA ──
function formatCurrency(num) {
  const symbol = state.settings.currency || '$';
  const val = Number(num || 0).toLocaleString('es-AR', {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2
  });
  return `${symbol} ${val}`;
}

function formatNumber(num) {
  return new Intl.NumberFormat('es-AR').format(num || 0);
}

function formatProductId(id) {
  return `#PRD-${String(id).padStart(3, '0')}`;
}

function initDateDisplay() {
  if (!elements.topbarDate) return;
  const now = new Date();
  elements.topbarDate.textContent = now.toLocaleDateString('es-ES', {
    weekday: 'short', day: 'numeric', month: 'short', year: 'numeric'
  });
}

// ── 6. NAVEGACIÓN ENTRE VISTAS (SPA ROUTER) ──
function switchView(viewName) {
  state.currentView = viewName;

  // Ocultar todas las vistas
  Object.values(elements.views).forEach(v => {
    if (v) v.style.display = 'none';
  });

  // Mostrar la vista activa
  if (elements.views[viewName]) {
    elements.views[viewName].style.display = 'block';
  }

  // Actualizar menú lateral
  Object.values(elements.navItems).forEach(item => {
    if (item) item.classList.remove('sidebar__item--active');
  });

  // Títulos y migas de pan
  const titles = {
    dashboard:  { title: 'Dashboard',   crumb: 'Dashboard' },
    categories: { title: 'Categorías',  crumb: 'Categorías' },
    reports:    { title: 'Reportes',    crumb: 'Reportes y Métricas' },
    settings:   { title: 'Configuración', crumb: 'Configuración del Sistema' }
  };

  const info = titles[viewName] || titles.dashboard;
  if (elements.pageTitle) elements.pageTitle.textContent = info.title;
  if (elements.breadcrumbCurrent) elements.breadcrumbCurrent.textContent = info.crumb;

  // Marcar ítem activo
  if (viewName === 'dashboard' && elements.navItems.dashboard) {
    elements.navItems.dashboard.classList.add('sidebar__item--active');
  } else if (elements.navItems[viewName]) {
    elements.navItems[viewName].classList.add('sidebar__item--active');
  }

  // Renderizar la vista correspondiente
  if (viewName === 'dashboard') {
    renderDashboard();
  } else if (viewName === 'categories') {
    renderCategoriesView();
  } else if (viewName === 'reports') {
    renderReportsView();
  } else if (viewName === 'settings') {
    applySettingsToUI();
  }

  // Cerrar sidebar en pantallas táctiles
  if (window.innerWidth <= 768 && elements.sidebar) {
    elements.sidebar.classList.remove('mobile-open');
    if (elements.sidebarOverlay) elements.sidebarOverlay.classList.remove('active');
  }
}

// ── 7. RENDERIZADO GLOBAL ──
function renderAll() {
  updateNotifications();
  if (state.currentView === 'dashboard') {
    renderDashboard();
  } else if (state.currentView === 'categories') {
    renderCategoriesView();
  } else if (state.currentView === 'reports') {
    renderReportsView();
  }
}

// ── 8. RENDERIZADO DE DASHBOARD (KPIS + TABLA) ──
function renderDashboard() {
  updateKPIs();
  renderTable();
}

function updateKPIs() {
  const threshold = state.settings.lowStockThreshold;
  const totalProducts = state.products.length;
  const totalUnits = state.products.reduce((acc, p) => acc + Number(p.quantity), 0);
  const lowStockCount = state.products.filter(p => Number(p.quantity) < threshold).length;
  const totalValue = state.products.reduce((acc, p) => acc + (Number(p.quantity) * Number(p.price)), 0);

  // Valores numéricos animados
  animateVal(elements.kpiProducts, totalProducts);
  animateVal(elements.kpiUnits, totalUnits);
  animateVal(elements.kpiAlerts, lowStockCount);
  if (elements.kpiValue) elements.kpiValue.textContent = formatCurrency(totalValue);

  // Badges y alertas
  if (elements.sidebarAlertCount) {
    elements.sidebarAlertCount.textContent = lowStockCount;
    elements.sidebarAlertCount.setAttribute('data-zero', lowStockCount === 0 ? 'true' : 'false');
  }

  if (elements.notifBadge) {
    elements.notifBadge.textContent = lowStockCount;
    elements.notifBadge.setAttribute('data-zero', lowStockCount === 0 ? 'true' : 'false');
  }

  if (elements.alertBanner && elements.alertCountInline) {
    if (lowStockCount > 0 && state.settings.showBanner) {
      elements.alertBanner.style.display = 'flex';
      elements.alertCountInline.textContent = lowStockCount;
    } else {
      elements.alertBanner.style.display = 'none';
    }
  }
}

function animateVal(el, val) {
  if (!el) return;
  el.textContent = formatNumber(val);
  el.classList.remove('kpi-pop');
  void el.offsetWidth;
  el.classList.add('kpi-pop');
}

// Tabla dinámica con filtros
function getFilteredProducts() {
  let list = [...state.products];
  const threshold = state.settings.lowStockThreshold;

  // Búsqueda
  if (state.filters.search.trim()) {
    const term = state.filters.search.trim().toLowerCase();
    list = list.filter(p =>
      p.name.toLowerCase().includes(term) ||
      (p.desc && p.desc.toLowerCase().includes(term)) ||
      p.category.toLowerCase().includes(term) ||
      formatProductId(p.id).toLowerCase().includes(term)
    );
  }

  // Categoría
  if (state.filters.category) {
    list = list.filter(p => p.category === state.filters.category);
  }

  // Stock
  if (state.filters.stockStatus === 'low') {
    list = list.filter(p => Number(p.quantity) < threshold);
  } else if (state.filters.stockStatus === 'ok') {
    list = list.filter(p => Number(p.quantity) >= threshold);
  }

  // Ordenamiento
  const col = state.sort.column;
  const asc = state.sort.ascending;
  list.sort((a, b) => {
    let valA = a[col];
    let valB = b[col];

    if (typeof valA === 'string') {
      valA = valA.toLowerCase();
      valB = valB.toLowerCase();
      return asc ? valA.localeCompare(valB) : valB.localeCompare(valA);
    }
    return asc ? (valA - valB) : (valB - valA);
  });

  return list;
}

function renderTable() {
  const filtered = getFilteredProducts();
  const total = state.products.length;
  const threshold = state.settings.lowStockThreshold;

  if (elements.tableCount) {
    elements.tableCount.textContent = `${total} producto${total !== 1 ? 's' : ''}`;
  }
  if (elements.tableShowing) {
    elements.tableShowing.textContent = `Mostrando ${filtered.length} de ${total} producto${total !== 1 ? 's' : ''}`;
  }

  if (filtered.length === 0) {
    elements.tableBody.innerHTML = '';
    elements.tableEmpty.style.display = 'block';
    elements.emptyMessage.textContent = total === 0
      ? 'El inventario está vacío. Agregá tu primer producto.'
      : 'No se encontraron productos con los filtros seleccionados.';
    return;
  }

  elements.tableEmpty.style.display = 'none';

  const rowsHtml = filtered.map(product => {
    const isLow = Number(product.quantity) < threshold;
    const catObj = state.categories.find(c => c.name === product.category);
    const catIcon = catObj ? catObj.icon : 'fa-tag';
    const catClass = CATEGORY_CLASS_MAP[product.category] || 'cat--otros';
    const piconClass = PICON_CLASS_MAP[product.category] || 'picon--otros';
    const totalRowValue = Number(product.quantity) * Number(product.price);

    return `
      <tr class="row-enter ${isLow ? 'row--low-stock' : ''}" data-id="${product.id}">
        <td class="td--id">${formatProductId(product.id)}</td>
        <td>
          <div class="product-cell">
            <div class="product-icon ${piconClass}">
              <i class="fa-solid ${catIcon}"></i>
            </div>
            <div>
              <div class="product-name">${escapeHtml(product.name)}</div>
              ${product.desc ? `<div class="product-desc" title="${escapeHtml(product.desc)}">${escapeHtml(product.desc)}</div>` : ''}
            </div>
          </div>
        </td>
        <td>
          <span class="category-badge ${catClass}">
            <i class="fa-solid ${catIcon}"></i>
            ${escapeHtml(product.category)}
          </span>
        </td>
        <td class="td--center">
          <div class="qty-cell">
            <button class="qty-btn" onclick="quickAdjustQty(${product.id}, -1)" title="Restar 1">
              <i class="fa-solid fa-minus"></i>
            </button>
            <span class="qty-value ${isLow ? 'qty-value--low' : ''}">${product.quantity}</span>
            <button class="qty-btn" onclick="quickAdjustQty(${product.id}, 1)" title="Sumar 1">
              <i class="fa-solid fa-plus"></i>
            </button>
          </div>
        </td>
        <td class="price-cell">${formatCurrency(product.price)}</td>
        <td class="value-cell">${formatCurrency(totalRowValue)}</td>
        <td class="td--center">
          ${isLow
            ? `<span class="status-badge status-badge--low" title="Menos de ${threshold} unidades"><i class="fa-solid fa-triangle-exclamation"></i> Stock Bajo</span>`
            : `<span class="status-badge status-badge--ok"><i class="fa-solid fa-circle-check"></i> En Stock</span>`
          }
        </td>
        <td class="td--center">
          <div class="actions-cell">
            <button class="action-btn action-btn--edit" onclick="openEditModal(${product.id})" title="Editar producto">
              <i class="fa-solid fa-pen-to-square"></i>
            </button>
            <button class="action-btn action-btn--delete" onclick="openDeleteConfirm(${product.id})" title="Eliminar producto">
              <i class="fa-solid fa-trash-can"></i>
            </button>
          </div>
        </td>
      </tr>
    `;
  }).join('');

  elements.tableBody.innerHTML = rowsHtml;
  updateSortIndicators();
}

function updateSortIndicators() {
  const headers = document.querySelectorAll('.inventory-table th.sortable');
  headers.forEach(th => {
    const col = th.dataset.col;
    th.classList.remove('sort-asc', 'sort-desc');
    const icon = th.querySelector('i');
    if (col === state.sort.column) {
      if (state.sort.ascending) {
        th.classList.add('sort-asc');
        if (icon) icon.className = 'fa-solid fa-sort-up';
      } else {
        th.classList.add('sort-desc');
        if (icon) icon.className = 'fa-solid fa-sort-down';
      }
    } else {
      if (icon) icon.className = 'fa-solid fa-sort';
    }
  });
}

// ── 9. NOTIFICACIONES (CAMPANITA) ──
function toggleNotificationDropdown() {
  if (!elements.notifDropdown) return;
  const isActive = elements.notifDropdown.classList.contains('active');
  if (isActive) {
    closeNotificationDropdown();
  } else {
    updateNotifications();
    elements.notifDropdown.classList.add('active');
    elements.notifDropdown.setAttribute('aria-hidden', 'false');
  }
}

function closeNotificationDropdown() {
  if (!elements.notifDropdown) return;
  elements.notifDropdown.classList.remove('active');
  elements.notifDropdown.setAttribute('aria-hidden', 'true');
}

function updateNotifications() {
  const threshold = state.settings.lowStockThreshold;
  const lowStockItems = state.products.filter(p => Number(p.quantity) < threshold);
  const count = lowStockItems.length;

  if (elements.notifBadge) {
    elements.notifBadge.textContent = count;
    elements.notifBadge.setAttribute('data-zero', count === 0 ? 'true' : 'false');
  }
  if (elements.notifDropdownCount) {
    elements.notifDropdownCount.textContent = count;
  }

  if (!elements.notifList) return;

  if (count === 0) {
    elements.notifList.innerHTML = `
      <div class="notif-dropdown__empty">
        <i class="fa-solid fa-circle-check"></i>
        <p><strong>¡Todo al día!</strong></p>
        <p>No hay alertas de stock bajo pendientes en el depósito.</p>
      </div>
    `;
    return;
  }

  elements.notifList.innerHTML = lowStockItems.map(item => `
    <div class="notif-item notif-item--danger">
      <div class="notif-item__icon">
        <i class="fa-solid fa-triangle-exclamation"></i>
      </div>
      <div class="notif-item__content">
        <div class="notif-item__title">${escapeHtml(item.name)}</div>
        <div class="notif-item__desc">Quedan solo <strong>${item.quantity} unidades</strong> (mínimo: ${threshold}).</div>
        <div class="notif-item__actions">
          <button class="notif-item__btn" onclick="quickRestock(${item.id}, 5); closeNotificationDropdown();">
            <i class="fa-solid fa-plus"></i> Reponer +5
          </button>
          <button class="notif-item__btn" onclick="filterByProduct(${item.id}); closeNotificationDropdown();">
            <i class="fa-solid fa-eye"></i> Ver en tabla
          </button>
        </div>
      </div>
    </div>
  `).join('');
}

function quickRestock(id, amount) {
  const prod = state.products.find(p => p.id === Number(id));
  if (!prod) return;
  prod.quantity = Number(prod.quantity) + amount;
  saveStorage(STORAGE_KEYS.products, state.products);
  renderAll();
  showToast('success', 'Stock Repuesto', `Se sumaron +${amount} unidades a "${prod.name}".`);
}

function filterByProduct(id) {
  const prod = state.products.find(p => p.id === Number(id));
  if (!prod) return;
  switchView('dashboard');
  state.filters.search = prod.name;
  elements.searchInput.value = prod.name;
  elements.searchClear.style.display = 'grid';
  renderTable();
  highlightRow(prod.id);
}

// ── 10. VISTA DE CATEGORÍAS ──
function renderCategoriesView() {
  const totalStockUnits = state.products.reduce((acc, p) => acc + Number(p.quantity), 0);
  const catsMap = {};

  // Inicializar todas las categorías existentes
  state.categories.forEach(c => {
    catsMap[c.name] = { name: c.name, icon: c.icon, count: 0, units: 0, value: 0 };
  });

  // Sumar productos
  state.products.forEach(p => {
    if (!catsMap[p.category]) {
      catsMap[p.category] = { name: p.category, icon: 'fa-tags', count: 0, units: 0, value: 0 };
    }
    catsMap[p.category].count += 1;
    catsMap[p.category].units += Number(p.quantity);
    catsMap[p.category].value += (Number(p.quantity) * Number(p.price));
  });

  const catsList = Object.values(catsMap);

  // KPIs superiores de categorías
  if (elements.catKpiCount) elements.catKpiCount.textContent = catsList.length;

  let topValCat = catsList[0];
  let topUnitsCat = catsList[0];
  catsList.forEach(c => {
    if (c.value > (topValCat?.value || 0)) topValCat = c;
    if (c.units > (topUnitsCat?.units || 0)) topUnitsCat = c;
  });

  if (elements.catKpiTopValue && topValCat) {
    elements.catKpiTopValue.textContent = topValCat.name;
    if (elements.catKpiTopValueSub) elements.catKpiTopValueSub.textContent = formatCurrency(topValCat.value);
  }

  if (elements.catKpiTopUnits && topUnitsCat) {
    elements.catKpiTopUnits.textContent = topUnitsCat.name;
    if (elements.catKpiTopUnitsSub) elements.catKpiTopUnitsSub.textContent = `${topUnitsCat.units} unidades físicas`;
  }

  // Grilla de tarjetas
  if (!elements.categoriesGrid) return;

  elements.categoriesGrid.innerHTML = catsList.map(cat => {
    const percentUnits = totalStockUnits > 0 ? ((cat.units / totalStockUnits) * 100).toFixed(1) : 0;
    const catClass = CATEGORY_CLASS_MAP[cat.name] || 'cat--otros';
    const piconClass = PICON_CLASS_MAP[cat.name] || 'picon--otros';

    return `
      <div class="category-card">
        <div class="category-card__header">
          <div class="category-card__icon-wrap ${piconClass}">
            <i class="fa-solid ${cat.icon || 'fa-tag'}"></i>
          </div>
          <span class="category-badge ${catClass}">${cat.count} producto${cat.count !== 1 ? 's' : ''}</span>
        </div>
        <h3 class="category-card__name">${escapeHtml(cat.name)}</h3>
        <p class="category-card__count">Departamento de catálogo activo</p>

        <div class="category-card__stats">
          <div>
            <span class="category-card__stat-label">Stock Físico</span>
            <span class="category-card__stat-val">${formatNumber(cat.units)} uds</span>
          </div>
          <div>
            <span class="category-card__stat-label">Valor Total</span>
            <span class="category-card__stat-val">${formatCurrency(cat.value)}</span>
          </div>
        </div>

        <div class="category-card__progress-wrap">
          <div class="category-card__progress-info">
            <span>Cuota de inventario</span>
            <span>${percentUnits}%</span>
          </div>
          <div class="category-card__progress-bar">
            <div class="category-card__progress-fill" style="width: ${percentUnits}%"></div>
          </div>
        </div>

        <button class="category-card__btn" onclick="filterByCategoryDirect('${escapeHtml(cat.name)}')">
          <i class="fa-solid fa-arrow-right"></i> Ver Productos (${cat.count})
        </button>
      </div>
    `;
  }).join('');
}

function filterByCategoryDirect(catName) {
  switchView('dashboard');
  state.filters.category = catName;
  elements.categoryFilter.value = catName;
  renderTable();
}

// Modal Agregar Categoría
function openAddCategoryModal() {
  if (elements.newCatName) elements.newCatName.value = '';
  if (elements.errCatName) elements.errCatName.textContent = '';
  if (elements.categoryModalBackdrop) {
    elements.categoryModalBackdrop.classList.add('active');
    setTimeout(() => elements.newCatName.focus(), 150);
  }
}

function closeAddCategoryModal() {
  if (elements.categoryModalBackdrop) {
    elements.categoryModalBackdrop.classList.remove('active');
  }
}

function saveNewCategory() {
  const name = elements.newCatName.value.trim();
  const icon = elements.newCatIcon.value;

  if (!name) {
    elements.errCatName.textContent = 'El nombre de la categoría es obligatorio.';
    return;
  }

  const exists = state.categories.some(c => c.name.toLowerCase() === name.toLowerCase());
  if (exists) {
    elements.errCatName.textContent = 'Esta categoría ya existe.';
    return;
  }

  const newCat = { name, icon };
  state.categories.push(newCat);
  saveStorage(STORAGE_KEYS.categories, state.categories);

  populateCategorySelects();
  closeAddCategoryModal();
  renderCategoriesView();
  showToast('success', 'Categoría Creada', `Se agregó "${name}" al sistema.`);
}

function populateCategorySelects() {
  // 1. Selector de formulario
  if (elements.fieldCategory) {
    const currentVal = elements.fieldCategory.value;
    elements.fieldCategory.innerHTML = `
      <option value="" disabled selected>Seleccioná una categoría…</option>
      ${state.categories.map(c => `<option value="${escapeHtml(c.name)}">${escapeHtml(c.name)}</option>`).join('')}
    `;
    if (currentVal) elements.fieldCategory.value = currentVal;
  }

  // 2. Selector de filtro en tabla
  if (elements.categoryFilter) {
    const currentVal = elements.categoryFilter.value;
    elements.categoryFilter.innerHTML = `
      <option value="">Todas las categorías</option>
      ${state.categories.map(c => `<option value="${escapeHtml(c.name)}">${escapeHtml(c.name)}</option>`).join('')}
    `;
    if (currentVal) elements.categoryFilter.value = currentVal;
  }
}

// ── 11. VISTA DE REPORTES Y ANALÍTICA ──
function renderReportsView() {
  const threshold = state.settings.lowStockThreshold;
  const total = state.products.length;
  const totalUnits = state.products.reduce((acc, p) => acc + Number(p.quantity), 0);
  const totalValue = state.products.reduce((acc, p) => acc + (Number(p.quantity) * Number(p.price)), 0);
  const lowStockItems = state.products.filter(p => Number(p.quantity) < threshold);
  const healthyItemsCount = total - lowStockItems.length;
  const healthRate = total > 0 ? Math.round((healthyItemsCount / total) * 100) : 100;
  const avgPrice = total > 0 ? (totalValue / (totalUnits || 1)) : 0;

  // Producto con mayor inversión monetaria (precio * cantidad)
  let topValuedProd = state.products[0];
  state.products.forEach(p => {
    const pVal = Number(p.quantity) * Number(p.price);
    const topVal = topValuedProd ? (Number(topValuedProd.quantity) * Number(topValuedProd.price)) : 0;
    if (pVal > topVal) topValuedProd = p;
  });

  // KPIs
  if (elements.repKpiAvgPrice) elements.repKpiAvgPrice.textContent = formatCurrency(avgPrice);
  if (elements.repKpiTopProduct && topValuedProd) {
    elements.repKpiTopProduct.textContent = topValuedProd.name;
    if (elements.repKpiTopProductSub) {
      elements.repKpiTopProductSub.textContent = formatCurrency(topValuedProd.quantity * topValuedProd.price);
    }
  }
  if (elements.repKpiHealth) elements.repKpiHealth.textContent = `${healthRate}%`;
  if (elements.repKpiRiskCount) elements.repKpiRiskCount.textContent = lowStockItems.length;

  // Gráfico de Capital por Categoría (Barras CSS)
  if (elements.repCategoryBars) {
    const catTotals = {};
    state.products.forEach(p => {
      catTotals[p.category] = (catTotals[p.category] || 0) + (Number(p.quantity) * Number(p.price));
    });

    const entries = Object.entries(catTotals).sort((a, b) => b[1] - a[1]);
    elements.repCategoryBars.innerHTML = entries.map(([cat, val]) => {
      const pct = totalValue > 0 ? ((val / totalValue) * 100).toFixed(1) : 0;
      return `
        <div class="cat-bar-item">
          <div class="cat-bar-item__info">
            <span class="cat-bar-item__label">${escapeHtml(cat)} (${pct}%)</span>
            <span class="cat-bar-item__val">${formatCurrency(val)}</span>
          </div>
          <div class="cat-bar-item__track">
            <div class="cat-bar-item__fill" style="width: ${pct}%"></div>
          </div>
        </div>
      `;
    }).join('');
  }

  // Top 5 Productos con Mayor Valor
  if (elements.repTopProductsList) {
    const sortedByVal = [...state.products]
      .sort((a, b) => (b.quantity * b.price) - (a.quantity * a.price))
      .slice(0, 5);

    elements.repTopProductsList.innerHTML = sortedByVal.map((p, idx) => `
      <li class="ranking-item">
        <span class="ranking-item__pos">${idx + 1}</span>
        <span class="ranking-item__name" title="${escapeHtml(p.name)}">${escapeHtml(p.name)}</span>
        <span class="ranking-item__price">${formatCurrency(p.quantity * p.price)}</span>
      </li>
    `).join('');
  }

  // Semáforo de Urgencia de Reposición
  if (elements.repRestockPanel) {
    if (lowStockItems.length === 0) {
      elements.repRestockPanel.innerHTML = `
        <div style="padding: 1.5rem; text-align: center; color: var(--gray-400);">
          <i class="fa-solid fa-circle-check" style="color: var(--green-500); font-size: 1.8rem; margin-bottom: 0.5rem; display: block;"></i>
          <strong>Excelente: No hay productos con stock crítico en este momento.</strong>
        </div>
      `;
    } else {
      elements.repRestockPanel.innerHTML = `
        <div class="restock-grid">
          ${lowStockItems.map(p => `
            <div class="restock-card">
              <div>
                <div class="restock-card__name">${escapeHtml(p.name)}</div>
                <div class="restock-card__meta">${p.quantity} unidades restantes (mínimo: ${threshold})</div>
              </div>
              <button class="restock-card__btn" onclick="quickRestock(${p.id}, 10)">
                <i class="fa-solid fa-plus"></i> Reponer +10
              </button>
            </div>
          `).join('')}
        </div>
      `;
    }
  }
}

function exportAnalyticsReport() {
  if (state.products.length === 0) {
    showToast('info', 'Reportes', 'No hay datos suficientes para exportar.');
    return;
  }

  const rows = [
    ['Métrica', 'Valor'],
    ['Total Productos Registrados', state.products.length],
    ['Unidades Físicas Totales', state.products.reduce((a, p) => a + Number(p.quantity), 0)],
    ['Valor Monetario Total', formatCurrency(state.products.reduce((a, p) => a + (p.quantity * p.price), 0))],
    ['Productos con Stock Bajo', state.products.filter(p => Number(p.quantity) < state.settings.lowStockThreshold).length],
    ['Umbral Configurado de Alerta', state.settings.lowStockThreshold],
    ['Fecha de Generación', new Date().toLocaleString('es-AR')]
  ];

  const csvContent = '\uFEFF' + rows.map(r => r.join(',')).join('\r\n');
  const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = `StockPro_Reporte_Analitico_${new Date().toISOString().slice(0, 10)}.csv`;
  a.click();
  URL.revokeObjectURL(url);
  showToast('success', 'Descarga Completada', 'Reporte analítico generado en CSV.');
}

// ── 12. VISTA DE CONFIGURACIÓN ──
function applySettingsToUI() {
  if (elements.settingCompanyName) elements.settingCompanyName.value = state.settings.companyName;
  if (elements.settingLowThreshold) elements.settingLowThreshold.value = state.settings.lowStockThreshold;
  if (elements.settingCurrency) elements.settingCurrency.value = state.settings.currency;
  if (elements.settingShowBanner) elements.settingShowBanner.checked = state.settings.showBanner;
}

function saveSettingsForm(e) {
  if (e) e.preventDefault();

  const companyName = elements.settingCompanyName.value.trim() || 'StockPro';
  const lowStockThreshold = Math.max(1, parseInt(elements.settingLowThreshold.value, 10) || 5);
  const currency = elements.settingCurrency.value;
  const showBanner = elements.settingShowBanner.checked;

  state.settings = { companyName, lowStockThreshold, currency, showBanner };
  saveStorage(STORAGE_KEYS.settings, state.settings);

  renderAll();
  showToast('success', 'Configuración Guardada', 'Se actualizaron los parámetros operativos del sistema.');
}

// Respaldo JSON completo
function exportJSONBackup() {
  const fullBackup = {
    version: '2.0',
    exportDate: new Date().toISOString(),
    settings: state.settings,
    profile: state.profile,
    categories: state.categories,
    products: state.products
  };

  const jsonStr = JSON.stringify(fullBackup, null, 2);
  const blob = new Blob([jsonStr], { type: 'application/json' });
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = `StockPro_Backup_${new Date().toISOString().slice(0, 10)}.json`;
  a.click();
  URL.revokeObjectURL(url);
  showToast('success', 'Copia de Seguridad', 'Archivo JSON generado y descargado correctamente.');
}

function importJSONBackup(event) {
  const file = event.target.files && event.target.files[0];
  if (!file) return;

  const reader = new FileReader();
  reader.onload = (e) => {
    try {
      const data = JSON.parse(e.target.result);
      if (data && Array.isArray(data.products)) {
        state.products = data.products;
        if (data.settings) state.settings = { ...DEFAULT_SETTINGS, ...data.settings };
        if (data.categories) state.categories = data.categories;
        if (data.profile) state.profile = data.profile;

        saveStorage(STORAGE_KEYS.products, state.products);
        saveStorage(STORAGE_KEYS.settings, state.settings);
        saveStorage(STORAGE_KEYS.categories, state.categories);
        saveStorage(STORAGE_KEYS.profile, state.profile);

        populateCategorySelects();
        applySettingsToUI();
        applyProfileToUI();
        renderAll();
        showToast('success', 'Importación Exitosa', 'Todos los datos del respaldo fueron cargados.');
      } else {
        showToast('error', 'Formato Inválido', 'El archivo no contiene un respaldo válido de StockPro.');
      }
    } catch {
      showToast('error', 'Error', 'No se pudo procesar el archivo JSON seleccionado.');
    }
  };
  reader.readAsText(file);
  event.target.value = '';
}

function clearAllDatabase() {
  if (confirm('⚠️ ¡PELIGRO! ¿Estás completamente seguro de vaciar todo el inventario? Esta acción borrará todos los productos registrados.')) {
    state.products = [];
    saveStorage(STORAGE_KEYS.products, state.products);
    renderAll();
    showToast('info', 'Inventario Vaciado', 'Se eliminaron todos los productos de la base de datos.');
  }
}

// ── 13. PERFIL DE ADMINISTRADOR ──
function applyProfileToUI() {
  if (elements.profileDisplayName) elements.profileDisplayName.textContent = state.profile.name;
  if (elements.sidebarUserName) elements.sidebarUserName.textContent = state.profile.name;
  if (elements.sidebarUserRole) elements.sidebarUserRole.textContent = state.profile.role;
  if (elements.profileNameInput) elements.profileNameInput.value = state.profile.name;
  if (elements.profileEmailInput) elements.profileEmailInput.value = state.profile.email;
  if (elements.profileLastLogin) elements.profileLastLogin.value = state.profile.loginTime;
}

function openProfileModal() {
  applyProfileToUI();
  if (elements.profileBackdrop) {
    elements.profileBackdrop.classList.add('active');
    elements.profileBackdrop.setAttribute('aria-hidden', 'false');
  }
}

function closeProfileModal() {
  if (elements.profileBackdrop) {
    elements.profileBackdrop.classList.remove('active');
    elements.profileBackdrop.setAttribute('aria-hidden', 'true');
  }
}

function saveProfile() {
  const name = elements.profileNameInput.value.trim() || 'Admin';
  const email = elements.profileEmailInput.value.trim() || 'admin@stockpro.io';

  state.profile.name = name;
  state.profile.email = email;
  saveStorage(STORAGE_KEYS.profile, state.profile);

  applyProfileToUI();
  closeProfileModal();
  showToast('success', 'Perfil Guardado', `Información de "${name}" actualizada correctamente.`);
}

function handleLogout() {
  if (confirm('¿Deseás cerrar la sesión administrativa de StockPro?')) {
    closeProfileModal();
    showToast('info', 'Sesión Finalizada', 'Has cerrado sesión. Modo demostración activo.');
  }
}

// ── 14. MODAL CRUD DE PRODUCTO (AGREGAR / EDITAR) ──
function openAddModal() {
  state.editingId = null;
  clearErrors();
  elements.productForm.reset();
  elements.productId.value = '';
  elements.fieldQuantity.value = '1';
  elements.fieldPrice.value = '';
  elements.descCount.textContent = '0';
  elements.modalTitle.textContent = 'Nuevo Producto';
  elements.modalSubtitle.textContent = 'Completá los datos para registrar un nuevo producto';
  elements.modalSaveText.textContent = 'Guardar Producto';
  elements.modalHeaderIcon.className = 'fa-solid fa-box-open';
  updateModalPreview();

  elements.modalBackdrop.classList.add('active');
  elements.modalBackdrop.setAttribute('aria-hidden', 'false');
  setTimeout(() => elements.fieldName.focus(), 150);
}

function openEditModal(id) {
  const product = state.products.find(p => p.id === Number(id));
  if (!product) return;

  state.editingId = Number(id);
  clearErrors();

  elements.productId.value = product.id;
  elements.fieldName.value = product.name;
  elements.fieldCategory.value = product.category;
  elements.fieldQuantity.value = product.quantity;
  elements.fieldPrice.value = product.price;
  elements.fieldDesc.value = product.desc || '';
  elements.descCount.textContent = String(elements.fieldDesc.value.length);

  elements.modalTitle.textContent = 'Editar Producto';
  elements.modalSubtitle.textContent = `Actualizando información de ${product.name}`;
  elements.modalSaveText.textContent = 'Actualizar Cambios';
  elements.modalHeaderIcon.className = 'fa-solid fa-pen-to-square';
  updateModalPreview();

  elements.modalBackdrop.classList.add('active');
  elements.modalBackdrop.setAttribute('aria-hidden', 'false');
  setTimeout(() => elements.fieldName.focus(), 150);
}

function closeModal() {
  elements.modalBackdrop.classList.remove('active');
  elements.modalBackdrop.setAttribute('aria-hidden', 'true');
  state.editingId = null;
  clearErrors();
}

function updateModalPreview() {
  const threshold = state.settings.lowStockThreshold;
  const qty = parseInt(elements.fieldQuantity.value, 10) || 0;
  const price = parseFloat(elements.fieldPrice.value) || 0;
  const total = qty * price;

  if (elements.modalPreviewBadge) {
    if (qty <= 0) {
      elements.modalPreviewBadge.innerHTML = `<span class="status-badge status-badge--critical">Sin Stock (0)</span>`;
    } else if (qty < threshold) {
      elements.modalPreviewBadge.innerHTML = `<span class="status-badge status-badge--low">Stock Bajo (${qty})</span>`;
    } else {
      elements.modalPreviewBadge.innerHTML = `<span class="status-badge status-badge--ok">Stock Normal (${qty})</span>`;
    }
  }

  if (elements.modalPreviewValue) {
    elements.modalPreviewValue.textContent = `Valor total: ${formatCurrency(total)}`;
  }
}

function saveProduct() {
  clearErrors();

  const nameVal = elements.fieldName.value.trim();
  const categoryVal = elements.fieldCategory.value;
  const quantityVal = elements.fieldQuantity.value.trim();
  const priceVal = elements.fieldPrice.value.trim();
  const descVal = elements.fieldDesc.value.trim();

  let hasError = false;

  if (!nameVal) {
    setError('errName', elements.fieldName, 'El nombre del producto es obligatorio.');
    hasError = true;
  } else if (nameVal.length < 2) {
    setError('errName', elements.fieldName, 'Debe contener al menos 2 caracteres.');
    hasError = true;
  }

  if (!categoryVal) {
    setError('errCategory', elements.fieldCategory, 'Seleccioná una categoría válida.');
    hasError = true;
  }

  const qtyNum = parseInt(quantityVal, 10);
  if (quantityVal === '' || isNaN(qtyNum) || qtyNum < 0) {
    setError('errQuantity', elements.fieldQuantity, 'Ingresá una cantidad entera mayor o igual a 0.');
    hasError = true;
  }

  const priceNum = parseFloat(priceVal);
  if (priceVal === '' || isNaN(priceNum) || priceNum < 0) {
    setError('errPrice', elements.fieldPrice, 'Ingresá un precio unitario válido.');
    hasError = true;
  }

  if (hasError) return;

  if (state.editingId !== null) {
    const idx = state.products.findIndex(p => p.id === state.editingId);
    if (idx !== -1) {
      state.products[idx] = {
        ...state.products[idx],
        name: nameVal,
        category: categoryVal,
        quantity: qtyNum,
        price: priceNum,
        desc: descVal
      };
      saveStorage(STORAGE_KEYS.products, state.products);
      renderAll();
      closeModal();
      showToast('success', 'Producto Actualizado', `"${nameVal}" fue modificado correctamente.`);
      highlightRow(state.editingId);
    }
  } else {
    const newId = state.products.length > 0
      ? Math.max(...state.products.map(p => p.id)) + 1
      : 1;

    const newProduct = {
      id: newId,
      name: nameVal,
      category: categoryVal,
      quantity: qtyNum,
      price: priceNum,
      desc: descVal
    };

    state.products.unshift(newProduct);
    saveStorage(STORAGE_KEYS.products, state.products);
    renderAll();
    closeModal();
    showToast('success', 'Producto Agregado', `"${nameVal}" ingresó al inventario.`);
    highlightRow(newId);
  }
}

function highlightRow(id) {
  setTimeout(() => {
    const row = document.querySelector(`tr[data-id="${id}"]`);
    if (row) {
      row.classList.add('row-updated');
      row.scrollIntoView({ behavior: 'smooth', block: 'nearest' });
    }
  }, 100);
}

function setError(errId, inputEl, message) {
  const errEl = document.getElementById(errId);
  if (errEl) errEl.innerHTML = `<i class="fa-solid fa-circle-exclamation"></i> ${message}`;
  if (inputEl) inputEl.classList.add('is-error');
}

function clearErrors() {
  ['errName', 'errCategory', 'errQuantity', 'errPrice'].forEach(id => {
    const el = document.getElementById(id);
    if (el) el.innerHTML = '';
  });
  [elements.fieldName, elements.fieldCategory, elements.fieldQuantity, elements.fieldPrice].forEach(input => {
    if (input) input.classList.remove('is-error');
  });
}

// ── 15. ELIMINACIÓN DE PRODUCTO ──
function openDeleteConfirm(id) {
  const product = state.products.find(p => p.id === Number(id));
  if (!product) return;
  state.deletingId = Number(id);
  elements.confirmProductName.textContent = `"${product.name}"`;
  elements.confirmBackdrop.classList.add('active');
  elements.confirmBackdrop.setAttribute('aria-hidden', 'false');
}

function closeDeleteConfirm() {
  elements.confirmBackdrop.classList.remove('active');
  elements.confirmBackdrop.setAttribute('aria-hidden', 'true');
  state.deletingId = null;
}

function confirmDeleteProduct() {
  if (state.deletingId === null) return;
  const product = state.products.find(p => p.id === state.deletingId);
  const deletedName = product ? product.name : 'Producto';

  state.products = state.products.filter(p => p.id !== state.deletingId);
  saveStorage(STORAGE_KEYS.products, state.products);
  closeDeleteConfirm();
  renderAll();
  showToast('info', 'Producto Eliminado', `"${deletedName}" fue removido del inventario.`);
}

function quickAdjustQty(id, delta) {
  const index = state.products.findIndex(p => p.id === Number(id));
  if (index === -1) return;

  const threshold = state.settings.lowStockThreshold;
  const current = Number(state.products[index].quantity);
  const newQty = Math.max(0, current + delta);
  if (current === newQty) return;

  state.products[index].quantity = newQty;
  saveStorage(STORAGE_KEYS.products, state.products);
  renderAll();

  if (newQty < threshold && current >= threshold) {
    showToast('warning', 'Alerta de Stock', `"${state.products[index].name}" entró en stock bajo (${newQty} uds).`);
  }
}

// ── 16. EXPORTAR A CSV (TABLA) ──
function exportToCSV() {
  if (state.products.length === 0) {
    showToast('info', 'Exportar', 'No hay productos para exportar.');
    return;
  }

  const headers = ['ID', 'Producto', 'Categoría', 'Stock', 'Precio_Unitario', 'Valor_Total', 'Descripción'];
  const rows = state.products.map(p => [
    formatProductId(p.id),
    `"${(p.name || '').replace(/"/g, '""')}"`,
    `"${(p.category || '').replace(/"/g, '""')}"`,
    p.quantity,
    p.price.toFixed(2),
    (p.quantity * p.price).toFixed(2),
    `"${(p.desc || '').replace(/"/g, '""')}"`
  ]);

  const csvContent = '\uFEFF' + [headers.join(','), ...rows.map(r => r.join(','))].join('\r\n');
  const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
  const url = URL.createObjectURL(blob);
  const link = document.createElement('a');
  link.setAttribute('href', url);
  link.setAttribute('download', `StockPro_Inventario_${new Date().toISOString().slice(0, 10)}.csv`);
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
  URL.revokeObjectURL(url);
  showToast('success', 'Descarga Completada', 'El archivo CSV de inventario se generó con éxito.');
}

function resetDemoData() {
  if (confirm('¿Querés restaurar los 8 productos iniciales de ejemplo?')) {
    state.products = [...INITIAL_PRODUCTS];
    state.categories = [...INITIAL_CATEGORIES];
    saveStorage(STORAGE_KEYS.products, state.products);
    saveStorage(STORAGE_KEYS.categories, state.categories);
    populateCategorySelects();
    renderAll();
    showToast('info', 'Datos Reiniciados', 'Se cargaron los 8 productos y categorías de prueba.');
  }
}

// ── 17. TOAST NOTIFICATIONS ──
function showToast(type, title, message) {
  const icons = {
    success: 'fa-circle-check',
    error:   'fa-circle-xmark',
    info:    'fa-circle-info',
    warning: 'fa-triangle-exclamation'
  };

  const toast = document.createElement('div');
  toast.className = `toast toast--${type}`;
  toast.innerHTML = `
    <div class="toast__icon">
      <i class="fa-solid ${icons[type] || 'fa-bell'}"></i>
    </div>
    <div class="toast__body">
      <div class="toast__title">${escapeHtml(title)}</div>
      <div class="toast__msg">${escapeHtml(message)}</div>
    </div>
    <div class="toast__progress"></div>
  `;

  if (elements.toastContainer) {
    elements.toastContainer.appendChild(toast);
    setTimeout(() => {
      toast.classList.add('removing');
      setTimeout(() => {
        if (toast.parentNode) toast.parentNode.removeChild(toast);
      }, 250);
    }, 3500);
  }
}

// ── 18. ASIGNACIÓN DE EVENTOS (EVENT LISTENERS) ──
function bindEvents() {
  // Navegación Sidebar
  if (elements.navItems.dashboard) {
    elements.navItems.dashboard.addEventListener('click', (e) => {
      e.preventDefault();
      state.filters.search = '';
      state.filters.category = '';
      state.filters.stockStatus = '';
      elements.searchInput.value = '';
      elements.categoryFilter.value = '';
      elements.stockFilter.value = '';
      switchView('dashboard');
    });
  }

  if (elements.navItems.inventory) {
    elements.navItems.inventory.addEventListener('click', (e) => {
      e.preventDefault();
      state.filters.stockStatus = '';
      elements.stockFilter.value = '';
      switchView('dashboard');
    });
  }

  if (elements.navItems.alerts) {
    elements.navItems.alerts.addEventListener('click', (e) => {
      e.preventDefault();
      state.filters.stockStatus = 'low';
      elements.stockFilter.value = 'low';
      switchView('dashboard');
    });
  }

  if (elements.navItems.categories) {
    elements.navItems.categories.addEventListener('click', (e) => {
      e.preventDefault();
      switchView('categories');
    });
  }

  if (elements.navItems.reports) {
    elements.navItems.reports.addEventListener('click', (e) => {
      e.preventDefault();
      switchView('reports');
    });
  }

  if (elements.navItems.settings) {
    elements.navItems.settings.addEventListener('click', (e) => {
      e.preventDefault();
      switchView('settings');
    });
  }

  // Notificaciones (Campanita)
  if (elements.notificationBtn) {
    elements.notificationBtn.addEventListener('click', (e) => {
      e.stopPropagation();
      toggleNotificationDropdown();
    });
  }

  if (elements.notifClearBtn) {
    elements.notifClearBtn.addEventListener('click', (e) => {
      e.stopPropagation();
      closeNotificationDropdown();
      showToast('info', 'Notificaciones', 'Alertas marcadas como revisadas.');
    });
  }

  if (elements.notifViewAll) {
    elements.notifViewAll.addEventListener('click', (e) => {
      e.stopPropagation();
      closeNotificationDropdown();
      switchView('dashboard');
      state.filters.stockStatus = 'low';
      elements.stockFilter.value = 'low';
      renderTable();
    });
  }

  // Cerrar dropdown al hacer click fuera
  document.addEventListener('click', (e) => {
    if (elements.notifDropdown && !elements.notifDropdown.contains(e.target) && e.target !== elements.notificationBtn) {
      closeNotificationDropdown();
    }
  });

  // Perfil de Administrador (Click en sidebar y avatar)
  if (elements.sidebarUser) elements.sidebarUser.addEventListener('click', openProfileModal);
  if (elements.topbarAvatar) elements.topbarAvatar.addEventListener('click', openProfileModal);
  if (elements.profileClose) elements.profileClose.addEventListener('click', closeProfileModal);
  if (elements.btnSaveProfile) elements.btnSaveProfile.addEventListener('click', saveProfile);
  if (elements.btnLogout) elements.btnLogout.addEventListener('click', handleLogout);

  if (elements.profileBackdrop) {
    elements.profileBackdrop.addEventListener('click', (e) => {
      if (e.target === elements.profileBackdrop) closeProfileModal();
    });
  }

  // Categorías
  if (elements.btnAddCategory) elements.btnAddCategory.addEventListener('click', openAddCategoryModal);
  if (elements.categoryModalClose) elements.categoryModalClose.addEventListener('click', closeAddCategoryModal);
  if (elements.categoryModalCancel) elements.categoryModalCancel.addEventListener('click', closeAddCategoryModal);
  if (elements.categoryModalSave) elements.categoryModalSave.addEventListener('click', saveNewCategory);
  if (elements.categoryForm) {
    elements.categoryForm.addEventListener('submit', (e) => {
      e.preventDefault();
      saveNewCategory();
    });
  }
  if (elements.categoryModalBackdrop) {
    elements.categoryModalBackdrop.addEventListener('click', (e) => {
      if (e.target === elements.categoryModalBackdrop) closeAddCategoryModal();
    });
  }

  // Reportes
  if (elements.btnPrintReport) {
    elements.btnPrintReport.addEventListener('click', () => window.print());
  }
  if (elements.btnExportReports) {
    elements.btnExportReports.addEventListener('click', exportAnalyticsReport);
  }

  // Configuración
  if (elements.settingsForm) {
    elements.settingsForm.addEventListener('submit', saveSettingsForm);
  }
  if (elements.btnBackupExport) elements.btnBackupExport.addEventListener('click', exportJSONBackup);
  if (elements.inputBackupImport) elements.inputBackupImport.addEventListener('change', importJSONBackup);
  if (elements.btnSettingsResetDemo) elements.btnSettingsResetDemo.addEventListener('click', resetDemoData);
  if (elements.btnClearAllData) elements.btnClearAllData.addEventListener('click', clearAllDatabase);

  // Búsqueda en tiempo real
  elements.searchInput.addEventListener('input', (e) => {
    state.filters.search = e.target.value;
    elements.searchClear.style.display = e.target.value ? 'grid' : 'none';
    if (elements.topbarSearchInput) elements.topbarSearchInput.value = e.target.value;
    renderTable();
  });

  elements.searchClear.addEventListener('click', () => {
    elements.searchInput.value = '';
    elements.searchClear.style.display = 'none';
    state.filters.search = '';
    if (elements.topbarSearchInput) elements.topbarSearchInput.value = '';
    renderTable();
    elements.searchInput.focus();
  });

  if (elements.topbarSearchInput) {
    elements.topbarSearchInput.addEventListener('input', (e) => {
      if (state.currentView !== 'dashboard') switchView('dashboard');
      state.filters.search = e.target.value;
      elements.searchInput.value = e.target.value;
      elements.searchClear.style.display = e.target.value ? 'grid' : 'none';
      renderTable();
    });
  }

  // Filtros
  elements.categoryFilter.addEventListener('change', (e) => {
    state.filters.category = e.target.value;
    renderTable();
  });

  elements.stockFilter.addEventListener('change', (e) => {
    state.filters.stockStatus = e.target.value;
    renderTable();
  });

  if (elements.btnClearFilters) {
    elements.btnClearFilters.addEventListener('click', () => {
      state.filters.search = '';
      state.filters.category = '';
      state.filters.stockStatus = '';
      elements.searchInput.value = '';
      elements.searchClear.style.display = 'none';
      if (elements.topbarSearchInput) elements.topbarSearchInput.value = '';
      elements.categoryFilter.value = '';
      elements.stockFilter.value = '';
      renderTable();
    });
  }

  // Ordenamiento de columnas
  const headers = document.querySelectorAll('.inventory-table th.sortable');
  headers.forEach(th => {
    th.addEventListener('click', () => {
      const col = th.dataset.col;
      if (state.sort.column === col) {
        state.sort.ascending = !state.sort.ascending;
      } else {
        state.sort.column = col;
        state.sort.ascending = true;
      }
      renderTable();
    });
  });

  // Modal Producto (Agregar / Editar)
  elements.btnAddProduct.addEventListener('click', openAddModal);
  elements.modalClose.addEventListener('click', closeModal);
  elements.modalCancel.addEventListener('click', closeModal);
  elements.modalSave.addEventListener('click', saveProduct);
  elements.productForm.addEventListener('submit', (e) => {
    e.preventDefault();
    saveProduct();
  });

  elements.fieldDesc.addEventListener('input', (e) => {
    elements.descCount.textContent = String(e.target.value.length);
  });

  elements.fieldQuantity.addEventListener('input', updateModalPreview);
  elements.fieldPrice.addEventListener('input', updateModalPreview);

  elements.qtyMinus.addEventListener('click', () => {
    const cur = parseInt(elements.fieldQuantity.value, 10) || 0;
    elements.fieldQuantity.value = Math.max(0, cur - 1);
    updateModalPreview();
  });

  elements.qtyPlus.addEventListener('click', () => {
    const cur = parseInt(elements.fieldQuantity.value, 10) || 0;
    elements.fieldQuantity.value = cur + 1;
    updateModalPreview();
  });

  // Modal Confirmación Eliminar
  elements.confirmClose.addEventListener('click', closeDeleteConfirm);
  elements.confirmCancel.addEventListener('click', closeDeleteConfirm);
  elements.confirmDelete.addEventListener('click', confirmDeleteProduct);

  // Tecla Escape general
  document.addEventListener('keydown', (e) => {
    if (e.key === 'Escape') {
      if (elements.modalBackdrop.classList.contains('active')) closeModal();
      if (elements.confirmBackdrop.classList.contains('active')) closeDeleteConfirm();
      if (elements.profileBackdrop && elements.profileBackdrop.classList.contains('active')) closeProfileModal();
      if (elements.categoryModalBackdrop && elements.categoryModalBackdrop.classList.contains('active')) closeAddCategoryModal();
      closeNotificationDropdown();
    }
  });

  elements.modalBackdrop.addEventListener('click', (e) => {
    if (e.target === elements.modalBackdrop) closeModal();
  });
  elements.confirmBackdrop.addEventListener('click', (e) => {
    if (e.target === elements.confirmBackdrop) closeDeleteConfirm();
  });

  // Exportar y Reset tabla
  if (elements.btnExport) elements.btnExport.addEventListener('click', exportToCSV);
  if (elements.btnResetData) elements.btnResetData.addEventListener('click', resetDemoData);

  // Alerta Banner
  if (elements.alertBannerClose) {
    elements.alertBannerClose.addEventListener('click', () => {
      elements.alertBanner.style.display = 'none';
    });
  }

  // Sidebar móvil
  if (elements.sidebarToggle && elements.sidebar) {
    elements.sidebarToggle.addEventListener('click', () => {
      elements.sidebar.classList.toggle('mobile-open');
      elements.sidebarOverlay.classList.toggle('active');
    });
  }

  if (elements.sidebarOverlay) {
    elements.sidebarOverlay.addEventListener('click', () => {
      elements.sidebar.classList.remove('mobile-open');
      elements.sidebarOverlay.classList.remove('active');
    });
  }
}

// Sanitizar cadenas
function escapeHtml(str) {
  if (!str) return '';
  return String(str)
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#039;');
}

// Exponer funciones necesarias en el scope global para atributos onclick
window.openEditModal = openEditModal;
window.openDeleteConfirm = openDeleteConfirm;
window.quickAdjustQty = quickAdjustQty;
window.quickRestock = quickRestock;
window.filterByProduct = filterByProduct;
window.filterByCategoryDirect = filterByCategoryDirect;
window.closeNotificationDropdown = closeNotificationDropdown;
