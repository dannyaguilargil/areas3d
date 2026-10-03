# Áreas 3D

Tienda personalizada de impresión 3D, con identidad visual azul, Three.js y catálogo administrado en Shopify.

## Ejecutar localmente

```bash
cp site/dist/config.example.js site/dist/config.js
python3 -m http.server 4190 --bind 127.0.0.1 --directory site/dist
```

Abrir http://127.0.0.1:4190/. Sin configurar Shopify se muestra un catálogo de demostración, sin pagos.

Para conectar una tienda, completar `site/dist/config.js` con el dominio `*.myshopify.com` y el token **público** de Storefront del canal Headless. Publicar los productos en ese canal. Este archivo está excluido de Git; se debe provisionar también al desplegar. Los tokens públicos son visibles para visitantes del sitio por diseño. Los tokens privados, de Admin API y secretos de aplicaciones nunca deben incluirse en el frontend.

## Estado de la primera versión

- Identidad y cubo 3D interactivo; diseño adaptable a móviles.
- Catálogo, categorías, variantes, precios y disponibilidad desde Shopify.
- Carrito persistente y acceso al checkout de Shopify.
- Fotografías normales; opción de visor 3D solo si el producto tiene un GLB compatible.
- Pendiente: cargar y validar modelos reales, conversión de STL, despliegue y prueba completa de compra.

`catalog-import/` conserva la fuente y el CSV de la importación inicial. Ese CSV contiene los valores provisionales iniciales (precio cero y venta deshabilitada); **no representa los precios ni el stock actuales y no debe reimportarse para actualizar la tienda**.

## Verificación

```bash
node --test site/tests/*.test.mjs
```

Más detalles en [site/README.md](site/README.md). Three.js se distribuye con su licencia en `site/dist/vendor/three/LICENSE`.
