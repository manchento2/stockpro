/**
 * ═══════════════════════════════════════════════════════════
 * STOCKPRO – PANEL DE CONTROL DE STOCK E INVENTARIO
 * app.js – Vanilla JavaScript con LocalStorage
 * ═══════════════════════════════════════════════════════════
 */

'use strict';

// ── 1. CONSTANTES Y CONFIGURACIÓN ──
const STORAGE_KEY = 'stockpro_inventory_data_v1';
const LOW_STOCK_THRESHOLD = 5;

// Datos iniciales precargados (Semilla demostrativa profesional)
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

// Íconos según categoría para visualización atractiva
const CATEGORY_ICONS = {
  'Electrónica':  'fa-laptop',
  'Herramientas': 'fa-wrench',
  'Insumos':      'fa-box-archive',
  'Mobiliario':   'fa-chair',
  'Informática':  'fa-desktop',
  'Limpieza':     'fa-spray-can-sparkles',
  'Otros':        'fa-cubes'
};

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

// ── 2. ESTADO DE LA APLICACIÓN ──
let state = {
  products: [],
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

// ── 3. DOM ELEMENTS ──
const elements = {
  // KPIs
  kpiProducts: document.getElementById('kpi-products-val'),
  kpiUnits: document.getElementById('kpi-units-val'),
  kpiAlerts: document.getElementById('kpi-alerts-val'),
  kpiValue: document.getElementById('kpi-value-val'),
  sidebarAlertCount: document.getElementById('sidebar-alert-count'),
  notifBadge: document.getElementById('notif-badge'),
  alertBanner: document.getElementById('alert-banner'),
  alertCountInline: document.getElementById('alert-count-inline'),
  alertBannerClose: document.getElementById('alert-banner-close'),

  // Filtros y búsqueda
  searchInput: document.getElementById('search-input'),
  searchClear: document.getElementById('search-clear'),
  categoryFilter: document.getElementById('category-filter'),
  stockFilter: document.getElementById('stock-filter'),
  topbarSearchInput: document.getElementById('topbar-search-input'),
  btnClearFilters: document.getElementById('btn-clear-filters'),

  // Tabla
  tableBody: document.getElementById('table-body'),
  tableCount: document.getElementById('table-count'),
  tableShowing: document.getElementById('table-showing'),
  tableEmpty: document.getElementById('table-empty'),
  emptyMessage: document.getElementById('empty-message'),
  btnAddProduct: document.getElementById('btn-add-product'),
  btnExport: document.getElementById('btn-export'),
  btnResetData: document.getElementById('btn-reset-data'),

  // Modal Producto
  modalBackdrop: document.getElementById('modal-backdrop'),
  modalTitle: document.getElementById('modal-title'),
  modalSubtitle: document.getElementById('modal-subtitle'),
  modalClose: document.getElementById('modal-close'),
  modalCancel: document.getElementById('modal-cancel'),
  modalSave: document.getElementById('modal-save'),
  modalSaveText: document.getElementById('modal-save-text'),
  modalHeaderIcon: document.getElementById('modal-header-icon'),
  productForm: document.getElementById('product-form'),
  productId: document.getElementById('product-id'),
  fieldName: document.getElementById('field-name'),
  fieldCategory: document.getElementById('field-category'),
  fieldQuantity: document.getElementById('field-quantity'),
  fieldPrice: document.getElementById('field-price'),
  fieldDesc: document.getElementById('field-desc'),
  descCount: document.getElementById('desc-count'),
  qtyMinus: document.getElementById('qty-minus'),
  qtyPlus: document.getElementById('qty-plus'),
  modalPreviewBadge: document.getElementById('modal-preview-badge'),
  modalPreviewValue: document.getElementById('modal-preview-value'),

  // Errores de validación
  errName: document.getElementById('err-name'),
  errCategory: document.getElementById('err-category'),
  errQuantity: document.getElementById('err-quantity'),
  errPrice: document.getElementById('err-price'),

  // Modal Confirmación Eliminación
  confirmBackdrop: document.getElementById('confirm-backdrop'),
  confirmProductName: document.getElementById('confirm-product-name'),
  confirmClose: document.getElementById('confirm-close'),
  confirmCancel: document.getElementById('confirm-cancel'),
  confirmDelete: document.getElementById('confirm-delete'),

  // Notificaciones y Layout
  toastContainer: document.getElementById('toast-container'),
  sidebar: document.getElementById('sidebar'),
  sidebarToggle: document.getElementById('sidebar-toggle'),
  sidebarOverlay: document.getElementById('sidebar-overlay'),
  topbarDate: document.getElementById('topbar-date')
};

// ── 4. INICIALIZACIÓN ──
document.addEventListener('DOMContentLoaded', () => {
  initStorage();
  initDateDisplay();
  bindEvents();
  renderAll();
});

// Inicializar almacenamiento con validación
function initStorage() {
  try {
    const rawData = localStorage.getItem(STORAGE_KEY);
    if (!rawData) {
      saveToStorage(INITIAL_PRODUCTS);
      state.products = [...INITIAL_PRODUCTS];
    } else {
      state.products = JSON.parse(rawData);
      if (!Array.isArray(state.products)) {
        state.products = [...INITIAL_PRODUCTS];
        saveToStorage(state.products);
      }
    }
  } catch (err) {
    console.error('Error cargando datos de LocalStorage:', err);
    state.products = [...INITIAL_PRODUCTS];
  }
}

function saveToStorage(products) {
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(products));
  } catch (err) {
    console.error('Error guardando en LocalStorage:', err);
    showToast('error', 'Error de almacenamiento', 'No se pudieron guardar los cambios en el navegador.');
  }
}

// ── 5. FECHA Y HORA EN EL TOPBAR ──
function initDateDisplay() {
  if (!elements.topbarDate) return;
  const now = new Date();
  const options = { weekday: 'short', day: 'numeric', month: 'short', year: 'numeric' };
  elements.topbarDate.textContent = now.toLocaleDateString('es-ES', options);
}

// ── 6. FORMATOS Y HELPERS ──
function formatCurrency(num) {
  return new Intl.NumberFormat('es-AR', {
    style: 'currency',
    currency: 'USD',
    minimumFractionDigits: 2,
    maximumFractionDigits: 2
  }).format(num);
}

function formatNumber(num) {
  return new Intl.NumberFormat('es-AR').format(num);
}

function formatProductId(id) {
  return `#PRD-${String(id).padStart(3, '0')}`;
}

// ── 7. RENDERIZADO COMPLETO ──
function renderAll() {
  updateKPIs();
  renderTable();
}

// ── 8. CÁLCULO Y RENDERIZADO DE KPIS ──
function updateKPIs() {
  const totalProducts = state.products.length;
  const totalUnits = state.products.reduce((acc, p) => acc + Number(p.quantity), 0);
  const lowStockCount = state.products.filter(p => Number(p.quantity) < LOW_STOCK_THRESHOLD).length;
  const totalValue = state.products.reduce((acc, p) => acc + (Number(p.quantity) * Number(p.price)), 0);

  // Animar KPIs numéricos
  animateValue(elements.kpiProducts, totalProducts);
  animateValue(elements.kpiUnits, totalUnits);
  animateValue(elements.kpiAlerts, lowStockCount);
  elements.kpiValue.textContent = formatCurrency(totalValue);

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
    if (lowStockCount > 0) {
      elements.alertBanner.style.display = 'flex';
      elements.alertCountInline.textContent = lowStockCount;
    } else {
      elements.alertBanner.style.display = 'none';
    }
  }
}

function animateValue(element, endVal) {
  if (!element) return;
  element.textContent = formatNumber(endVal);
  element.classList.remove('kpi-pop');
  // Trigger reflow para reiniciar la animación
  void element.offsetWidth;
  element.classList.add('kpi-pop');
}

// ── 9. FILTRADO, ORDENAMIENTO Y TABLA ──
function getFilteredProducts() {
  let list = [...state.products];

  // Búsqueda por texto (nombre y descripción)
  if (state.filters.search.trim()) {
    const term = state.filters.search.trim().toLowerCase();
    list = list.filter(p =>
      p.name.toLowerCase().includes(term) ||
      (p.desc && p.desc.toLowerCase().includes(term)) ||
      p.category.toLowerCase().includes(term) ||
      formatProductId(p.id).toLowerCase().includes(term)
    );
  }

  // Filtro por categoría
  if (state.filters.category) {
    list = list.filter(p => p.category === state.filters.category);
  }

  // Filtro por estado de stock
  if (state.filters.stockStatus === 'low') {
    list = list.filter(p => Number(p.quantity) < LOW_STOCK_THRESHOLD);
  } else if (state.filters.stockStatus === 'ok') {
    list = list.filter(p => Number(p.quantity) >= LOW_STOCK_THRESHOLD);
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

  // Actualizar conteos
  if (elements.tableCount) {
    elements.tableCount.textContent = `${total} producto${total !== 1 ? 's' : ''}`;
  }
  if (elements.tableShowing) {
    elements.tableShowing.textContent = `Mostrando ${filtered.length} de ${total} producto${total !== 1 ? 's' : ''}`;
  }

  // Si no hay resultados
  if (filtered.length === 0) {
    elements.tableBody.innerHTML = '';
    elements.tableEmpty.style.display = 'block';

    if (total === 0) {
      elements.emptyMessage.textContent = 'El inventario está vacío. Agregá tu primer producto con el botón "Nuevo Producto".';
    } else {
      elements.emptyMessage.textContent = 'No se encontraron productos con los filtros o búsqueda actuales.';
    }
    return;
  }

  elements.tableEmpty.style.display = 'none';

  // Renderizar filas
  const rowsHtml = filtered.map(product => {
    const isLow = Number(product.quantity) < LOW_STOCK_THRESHOLD;
    const catIcon = CATEGORY_ICONS[product.category] || 'fa-tag';
    const catClass = CATEGORY_CLASS_MAP[product.category] || 'cat--otros';
    const piconClass = PICON_CLASS_MAP[product.category] || 'picon--otros';
    const totalRowValue = Number(product.quantity) * Number(product.price);

    return `
      <tr class="row-enter ${isLow ? 'row--low-stock' : ''}" data-id="${product.id}">
        <!-- ID -->
        <td class="td--id">${formatProductId(product.id)}</td>

        <!-- Producto -->
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

        <!-- Categoría -->
        <td>
          <span class="category-badge ${catClass}">
            <i class="fa-solid ${catIcon}"></i>
            ${escapeHtml(product.category)}
          </span>
        </td>

        <!-- Stock con ajuste rápido -->
        <td class="td--center">
          <div class="qty-cell">
            <button class="qty-btn" onclick="quickAdjustQty(${product.id}, -1)" title="Disminuir stock en 1">
              <i class="fa-solid fa-minus"></i>
            </button>
            <span class="qty-value ${isLow ? 'qty-value--low' : ''}">${product.quantity}</span>
            <button class="qty-btn" onclick="quickAdjustQty(${product.id}, 1)" title="Aumentar stock en 1">
              <i class="fa-solid fa-plus"></i>
            </button>
          </div>
        </td>

        <!-- Precio Unitario -->
        <td class="price-cell">${formatCurrency(product.price)}</td>

        <!-- Valor Total -->
        <td class="value-cell">${formatCurrency(totalRowValue)}</td>

        <!-- Estado Badge -->
        <td class="td--center">
          ${isLow
            ? `<span class="status-badge status-badge--low" title="Menos de 5 unidades"><i class="fa-solid fa-triangle-exclamation"></i> Stock Bajo</span>`
            : `<span class="status-badge status-badge--ok"><i class="fa-solid fa-circle-check"></i> En Stock</span>`
          }
        </td>

        <!-- Acciones -->
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

// ── 10. MODALES (ABRIR, CERRAR, GUARDAR) ──
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
  const qty = parseInt(elements.fieldQuantity.value, 10) || 0;
  const price = parseFloat(elements.fieldPrice.value) || 0;
  const total = qty * price;

  if (elements.modalPreviewBadge) {
    if (qty <= 0) {
      elements.modalPreviewBadge.innerHTML = `<span class="status-badge status-badge--critical">Sin Stock (0)</span>`;
    } else if (qty < LOW_STOCK_THRESHOLD) {
      elements.modalPreviewBadge.innerHTML = `<span class="status-badge status-badge--low">Stock Bajo (${qty})</span>`;
    } else {
      elements.modalPreviewBadge.innerHTML = `<span class="status-badge status-badge--ok">Stock Normal (${qty})</span>`;
    }
  }

  if (elements.modalPreviewValue) {
    elements.modalPreviewValue.textContent = `Valor total: ${formatCurrency(total)}`;
  }
}

// Validación y Guardado
function saveProduct() {
  clearErrors();

  const nameVal = elements.fieldName.value.trim();
  const categoryVal = elements.fieldCategory.value;
  const quantityVal = elements.fieldQuantity.value.trim();
  const priceVal = elements.fieldPrice.value.trim();
  const descVal = elements.fieldDesc.value.trim();

  let hasError = false;

  // 1. Nombre
  if (!nameVal) {
    setError('errName', elements.fieldName, 'El nombre del producto es obligatorio.');
    hasError = true;
  } else if (nameVal.length < 2) {
    setError('errName', elements.fieldName, 'Debe contener al menos 2 caracteres.');
    hasError = true;
  }

  // 2. Categoría
  if (!categoryVal) {
    setError('errCategory', elements.fieldCategory, 'Seleccioná una categoría válida.');
    hasError = true;
  }

  // 3. Cantidad
  const qtyNum = parseInt(quantityVal, 10);
  if (quantityVal === '' || isNaN(qtyNum) || qtyNum < 0) {
    setError('errQuantity', elements.fieldQuantity, 'Ingresá una cantidad entera mayor o igual a 0.');
    hasError = true;
  }

  // 4. Precio
  const priceNum = parseFloat(priceVal);
  if (priceVal === '' || isNaN(priceNum) || priceNum < 0) {
    setError('errPrice', elements.fieldPrice, 'Ingresá un precio unitario válido.');
    hasError = true;
  }

  if (hasError) return;

  if (state.editingId !== null) {
    // ── EDITAR PRODUCTO EXISTENTE ──
    const index = state.products.findIndex(p => p.id === state.editingId);
    if (index !== -1) {
      state.products[index] = {
        ...state.products[index],
        name: nameVal,
        category: categoryVal,
        quantity: qtyNum,
        price: priceNum,
        desc: descVal
      };

      saveToStorage(state.products);
      renderAll();
      closeModal();
      showToast('success', 'Producto actualizado', `Se guardaron los cambios de "${nameVal}".`);

      // Resaltar fila actualizada
      highlightRow(state.editingId);
    }
  } else {
    // ── AGREGAR NUEVO PRODUCTO ──
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
    saveToStorage(state.products);
    renderAll();
    closeModal();
    showToast('success', 'Producto agregado', `"${nameVal}" fue registrado con éxito.`);

    // Resaltar nueva fila
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
  if (errEl) {
    errEl.innerHTML = `<i class="fa-solid fa-circle-exclamation"></i> ${message}`;
  }
  if (inputEl) {
    inputEl.classList.add('is-error');
  }
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

// ── 11. CONFIRMAR Y ELIMINAR ──
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
  saveToStorage(state.products);
  closeDeleteConfirm();
  renderAll();
  showToast('info', 'Producto eliminado', `"${deletedName}" fue removido del inventario.`);
}

// ── 12. AJUSTE RÁPIDO DE STOCK EN TABLA ──
function quickAdjustQty(id, delta) {
  const index = state.products.findIndex(p => p.id === Number(id));
  if (index === -1) return;

  const current = Number(state.products[index].quantity);
  const newQty = Math.max(0, current + delta);

  if (current === newQty) return; // ya era 0

  state.products[index].quantity = newQty;
  saveToStorage(state.products);
  renderAll();

  if (newQty < LOW_STOCK_THRESHOLD && current >= LOW_STOCK_THRESHOLD) {
    showToast('warning', 'Alerta de Stock', `"${state.products[index].name}" tiene stock bajo (${newQty} uds).`);
  }
}

// ── 13. EXPORTAR A CSV ──
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

  showToast('success', 'Descarga completada', 'El archivo CSV de inventario se generó con éxito.');
}

// ── 14. REINICIAR DEMO ──
function resetDemoData() {
  if (confirm('¿Querés restaurar los productos iniciales de ejemplo? Esto restablecerá los datos demo.')) {
    state.products = [...INITIAL_PRODUCTS];
    saveToStorage(state.products);
    renderAll();
    showToast('info', 'Datos reiniciados', 'Se cargaron los 8 productos de ejemplo.');
  }
}

// ── 15. TOAST NOTIFICATIONS ──
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

  elements.toastContainer.appendChild(toast);

  // Auto remove en 3.5 segundos
  setTimeout(() => {
    toast.classList.add('removing');
    setTimeout(() => {
      if (toast.parentNode) toast.parentNode.removeChild(toast);
    }, 250);
  }, 3500);
}

// ── 16. EVENT LISTENERS ──
function bindEvents() {
  // Búsqueda en tiempo real (tabla)
  elements.searchInput.addEventListener('input', (e) => {
    state.filters.search = e.target.value;
    elements.searchClear.style.display = e.target.value ? 'grid' : 'none';
    if (elements.topbarSearchInput) elements.topbarSearchInput.value = e.target.value;
    renderTable();
  });

  // Limpiar búsqueda
  elements.searchClear.addEventListener('click', () => {
    elements.searchInput.value = '';
    elements.searchClear.style.display = 'none';
    state.filters.search = '';
    if (elements.topbarSearchInput) elements.topbarSearchInput.value = '';
    renderTable();
    elements.searchInput.focus();
  });

  // Búsqueda en topbar sincronizada
  if (elements.topbarSearchInput) {
    elements.topbarSearchInput.addEventListener('input', (e) => {
      state.filters.search = e.target.value;
      elements.searchInput.value = e.target.value;
      elements.searchClear.style.display = e.target.value ? 'grid' : 'none';
      renderTable();
    });
  }

  // Filtro de Categoría
  elements.categoryFilter.addEventListener('change', (e) => {
    state.filters.category = e.target.value;
    renderTable();
  });

  // Filtro de Stock
  elements.stockFilter.addEventListener('change', (e) => {
    state.filters.stockStatus = e.target.value;
    renderTable();
  });

  // Limpiar todos los filtros
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

  // Ordenamiento de tabla
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

  // Botón Nuevo Producto
  elements.btnAddProduct.addEventListener('click', openAddModal);

  // Botones de Modal
  elements.modalClose.addEventListener('click', closeModal);
  elements.modalCancel.addEventListener('click', closeModal);
  elements.modalSave.addEventListener('click', saveProduct);

  // Submit con tecla Enter en formulario
  elements.productForm.addEventListener('submit', (e) => {
    e.preventDefault();
    saveProduct();
  });

  // Contador de caracteres de descripción
  elements.fieldDesc.addEventListener('input', (e) => {
    elements.descCount.textContent = String(e.target.value.length);
  });

  // Preview en vivo en modal
  elements.fieldQuantity.addEventListener('input', updateModalPreview);
  elements.fieldPrice.addEventListener('input', updateModalPreview);

  // Stepper + y - en modal
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

  // Cerrar modales con tecla Escape
  document.addEventListener('keydown', (e) => {
    if (e.key === 'Escape') {
      if (elements.modalBackdrop.classList.contains('active')) closeModal();
      if (elements.confirmBackdrop.classList.contains('active')) closeDeleteConfirm();
    }
  });

  // Cerrar al hacer clic en el backdrop
  elements.modalBackdrop.addEventListener('click', (e) => {
    if (e.target === elements.modalBackdrop) closeModal();
  });

  elements.confirmBackdrop.addEventListener('click', (e) => {
    if (e.target === elements.confirmBackdrop) closeDeleteConfirm();
  });

  // Exportar y Reset
  if (elements.btnExport) elements.btnExport.addEventListener('click', exportToCSV);
  if (elements.btnResetData) elements.btnResetData.addEventListener('click', resetDemoData);

  // Alerta Banner cerrar
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

  // Navegación en sidebar (filtros rápidos de conveniencia)
  const navAlerts = document.getElementById('nav-alerts');
  if (navAlerts) {
    navAlerts.addEventListener('click', (e) => {
      e.preventDefault();
      elements.stockFilter.value = 'low';
      state.filters.stockStatus = 'low';
      renderTable();
      setActiveNavItem(navAlerts);
    });
  }

  const navInventory = document.getElementById('nav-inventory');
  if (navInventory) {
    navInventory.addEventListener('click', (e) => {
      e.preventDefault();
      elements.stockFilter.value = '';
      state.filters.stockStatus = '';
      renderTable();
      setActiveNavItem(navInventory);
    });
  }

  const navDashboard = document.getElementById('nav-dashboard');
  if (navDashboard) {
    navDashboard.addEventListener('click', (e) => {
      e.preventDefault();
      elements.stockFilter.value = '';
      state.filters.stockStatus = '';
      state.filters.category = '';
      state.filters.search = '';
      elements.categoryFilter.value = '';
      elements.searchInput.value = '';
      renderTable();
      setActiveNavItem(navDashboard);
    });
  }
}

function setActiveNavItem(activeItem) {
  document.querySelectorAll('.sidebar__item').forEach(item => {
    item.classList.remove('sidebar__item--active');
  });
  activeItem.classList.add('sidebar__item--active');

  // Si estamos en mobile cerramos el sidebar
  if (window.innerWidth <= 768) {
    elements.sidebar.classList.remove('mobile-open');
    elements.sidebarOverlay.classList.remove('active');
  }
}

// ── 17. SANITIZACIÓN ──
function escapeHtml(str) {
  if (!str) return '';
  return String(str)
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#039;');
}

// Exponer funciones globales para los onclick de las filas dinámicas
window.openEditModal = openEditModal;
window.openDeleteConfirm = openDeleteConfirm;
window.quickAdjustQty = quickAdjustQty;
