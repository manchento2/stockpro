# 📦 StockPro – Panel de Control de Stock e Inventario

> **Dashboard Admin interactivo (SPA)** para gestión inteligente de stock y catálogo de productos, desarrollado con **HTML5 semántico**, **CSS3 moderno** y **JavaScript vainilla** con persistencia completa en **LocalStorage**.

---

## 🚀 Características Principales

### 1. 📊 Indicadores Clave en Tiempo Real (KPI Cards)
- **Total de Productos:** Conteo dinámico de productos registrados.
- **Unidades Totales:** Suma consolidada del stock físico disponible.
- **Alertas de Stock Bajo:** Identificación automática de productos con inventario crítico (< 5 unidades).
- **Valor Total del Inventario:** Cálculo automático en tiempo real (`precio × unidades`).
- **Banner de Alerta Inteligente:** Aviso destacado y desplegable cuando se detecta stock crítico.

### 2. 🔍 Búsqueda y Filtros en Vivo
- **Búsqueda instantánea:** Por nombre, descripción o categoría.
- **Filtro por Categoría:** Electrónica, Herramientas, Insumos, Mobiliario, Informática, Limpieza y Otros.
- **Filtro por Estado de Stock:** Todo el stock, Stock Bajo (< 5) o En Stock (≥ 5).
- **Ordenamiento de columnas:** Orden ascendente y descendente haciendo clic en los encabezados (ID, Producto, Categoría, Stock, Precio).

### 3. 📋 Tabla Dinámica con Badges de Estado
- Identificadores formateados (`#PRD-001`, `#PRD-002`...).
- Iconografía y estilos contextuales por categoría.
- **Badges de estado:**
  - `🟢 En Stock` (verde)
  - `🔴 Stock Bajo` (rojo animado con pulso)
- **Ajuste rápido de stock:** Botones `+` y `-` en la misma fila para actualizar inventario al instante sin abrir formularios.
- **Acciones directas:** Edición completa y eliminación asistida con modal de confirmación.

### 4. 📝 Modal / Formulario de Gestión (CRUD)
- Modal para **Agregar** y **Editar** productos.
- Validación completa de campos en cliente con mensajes de error descriptivos.
- Controles de cantidad con botones incrementales (`+` / `-`).
- **Previsualización en tiempo real:** Muestra el badge de estado estimado y el valor total a medida que se ingresan los datos.

### 5. 💾 Persistencia en LocalStorage
- Todos los cambios (altas, modificaciones, bajas y ajustes rápidos) se guardan automáticamente en el navegador.
- Precargado con datos iniciales de ejemplo profesionales para no empezar con la pantalla vacía.
- Opción de **Reiniciar Demo** en el pie de la tabla para restaurar los datos de prueba en cualquier momento.

### 6. 📁 Exportación a CSV
- Descarga directa de la base de inventario en formato CSV compatible con Microsoft Excel y Google Sheets.

### 7. 🎨 Diseño Moderno y Responsive
- Interfaz inspirada en los mejores paneles de control administrativos (Admin Dashboards).
- Sidebar retráctil para dispositivos móviles y tablets.
- Tipografía moderna (*Inter*) e iconografía limpia (*FontAwesome 6*).
- Sistema de notificaciones tipo Toast flotantes con barra de progreso.

---

## 🛠️ Tecnologías Utilizadas

- **HTML5:** Semántica limpia, accesibilidad (ARIA) y modales nativos.
- **CSS3:** Variables CSS (Design Tokens), CSS Grid, Flexbox, transiciones suaves y responsive design sin frameworks externos pesados.
- **JavaScript (ES6+):** Programación modular orientada a estado, manipulación del DOM y API de `localStorage`.
- **Font Awesome 6 (CDN):** Iconos de interfaz y categorías de producto.
- **Google Fonts:** Tipografía *Inter*.

---

## 📂 Estructura del Proyecto

```text
stockpro/
├── index.html        # Estructura principal del dashboard SPA y modales
├── css/
│   └── styles.css    # Estilos del dashboard, sidebar, tabla, modales y toasts
├── js/
│   └── app.js        # Lógica de inventario, KPIs, filtros, CRUD y LocalStorage
└── README.md         # Documentación del proyecto
```

---

## 💻 Cómo Ejecutar el Proyecto

1. Clona o descarga el repositorio:
   ```bash
   git clone https://github.com/tu-usuario/stockpro.git
   ```
2. Abre la carpeta `stockpro` en tu editor de código o haz doble clic directamente en `index.html` para abrirlo en cualquier navegador web.
3. No requiere NodeJS, npm ni dependencias de backend.

---

## 🌐 Publicación / Despliegue en GitHub Pages o Vercel

### Para GitHub Pages:
1. Sube los archivos a un repositorio en GitHub.
2. Ve a **Settings** > **Pages**.
3. En **Branch**, selecciona `main` (o `master`) y carpeta `/(root)`.
4. Guarda los cambios y tu panel estará activo en pocos segundos.

### Para Vercel:
1. Importa el repositorio directamente en tu panel de Vercel.
2. Deja la configuración estándar (Static HTML) y haz clic en **Deploy**.
