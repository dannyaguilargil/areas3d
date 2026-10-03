# Áreas 3D

Interfaz estática personalizada con Three.js. El símbolo de la cabecera adapta el cubo del repositorio del usuario https://github.com/dannyaguilargil/areas_3d (LogoCube.jsx y Nav.css). La estética toma como referencia DannyHub. No se ha modificado ninguno de esos repositorios.

## Vista previa

Desde la raíz del repositorio:

```bash
cp site/dist/config.example.js site/dist/config.js
python3 -m http.server 4190 --bind 127.0.0.1 --directory site/dist
```

No sobrescribir `config.js` si ya está configurado. Este archivo local está excluido de Git.

No necesita instalación ni compilación. Three.js se sirve localmente con su licencia MIT. Google Fonts es opcional: hay fuentes de reserva.

## Shopify (conectado)

En `dist/config.js`, configurar el dominio permanente `*.myshopify.com` y un **token PÚBLICO de Storefront API** del canal Headless. Nunca poner aquí un token Admin ni un token privado. Publicar los productos en el canal correspondiente y verificar los permisos de consulta de productos y operaciones de carrito.

`dist/shopify.js` consulta productos/variantes y crea un carrito real al continuar al pago, usando los IDs y precios de Shopify. Shopify entrega la URL del checkout y administra pedidos, pagos e inventario. El carrito conserva IDs de variantes y cantidades durante 30 días en este navegador, separado por tienda y modo demo; al cargar, revalida las variantes y toma los precios del catálogo actual. Si no hay almacenamiento disponible funciona solo en memoria; no se creó un panel administrativo duplicado.

Sin configuración, se usan tres productos sintéticos con precios COP ilustrativos y el pago queda deshabilitado. Las imágenes de muestra son renders locales de geometría, no fotografías de productos reales. La ficha y el carrito son funcionales como demostración. Con Shopify configurado, un fallo de API muestra un error y nunca sustituye el catálogo real por datos de muestra.

El catálogo pagina todos los productos, hasta 100 variantes por producto. Antes de habilitar ventas, verificar catálogo real, disponibilidad, dominio del checkout, moneda, impuestos, envíos y una compra de prueba. La lectura autenticada del catálogo está verificada. No se han probado pagos completos. El modo de capas es una visualización de marca, no un laminador ni cálculo de impresión.

## Interacción

Cubo: arrastrar para girar, pausa, malla y capas. Respeta movimiento reducido y detiene renderizado fuera de pantalla. Los diálogos usan la semántica y gestión de foco nativas. `view_collection` es una herramienta WebMCP de solo lectura opcional.

## Catálogo importado (2 de octubre de 2026)

23 productos desde `areas_3d/src/data/galleryData.js`, imágenes del mismo commit público del repositorio del usuario. Importados sin sobrescribir existentes y publicados en Áreas 3D — Web personalizada (Headless). Colecciones: Porta Latas (8), Mandos (5), Obsequios (3), Soporte de Teléfonos (7). Los filtros de la web consultan el campo Tipo de producto de Shopify.

Actualización autorizada: los 23 productos tienen precio base de 40.000 COP y una unidad disponible por variante. Se retiraron las etiquetas temporales `precio-por-definir` y `catalogo-sin-venta` y el párrafo de venta no habilitada. Shopify controla el inventario y no permite seguir vendiendo sin existencias. El archivo CSV original se conserva como registro de la importación inicial, no como estado actual.

Las fotos mantienen su presentación plana original, sin perspectiva simulada ni controles de inclinación. La ficha añade Foto / Ver en 3D únicamente si Shopify devuelve un modelo GLB válido en los medios del producto. El visor se carga bajo demanda desde Google model-viewer 4.3.1; no añade descargas a productos sin modelo. Incluye giro, zoom, estados de carga/error y regreso a la fotografía. No hay modelos reales cargados actualmente: validación visual con productos reales pendiente para una versión posterior.

Flujo futuro: convertir el STL de fabricación a GLB, revisar escala y materiales, cargarlo en los medios del producto de Shopify y comprobarlo en la ficha. La carga directa de STL y su conversión automática no forman parte de esta primera versión. No se muestran botones vacíos ni se generan modelos a partir de fotografías.

Las etiquetas de catálogo siguen siendo compatibles para futuros productos que todavía no deban venderse. La consulta pública actual permite disponibilidad, pero no la cantidad exacta de inventario; el stock se gestiona y valida en Shopify. No se han realizado pagos de prueba ni pedidos.
