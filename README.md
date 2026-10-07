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
- Carrito persistente; pago deshabilitado para la primera publicación.
- Fotografías normales; opción de visor 3D solo si el producto tiene un GLB compatible.
- Pendiente: cargar y validar modelos reales, conversión de STL, probar compras antes de habilitarlas.

`catalog-import/` conserva la fuente y el CSV de la importación inicial. Ese CSV contiene los valores provisionales iniciales (precio cero y venta deshabilitada); **no representa los precios ni el stock actuales y no debe reimportarse para actualizar la tienda**.

## Verificación

```bash
node --test site/tests/*.test.mjs
```

Más detalles en [site/README.md](site/README.md). Three.js se distribuye con su licencia en `site/dist/vendor/three/LICENSE`.

## Tema para Shopify

Ejecutar `python3 scripts/build-shopify-theme.py` después de provisionar el `config.js` local. Genera `release/areas3d-v1-pago-no-habilitado.zip`, para subir como tema desde Tienda online. El paquete incluye el token público Storefront y está excluido de Git; nunca usar un token privado en esa configuración.

El pago está bloqueado en la interfaz y antes de crear un checkout desde esta aplicación mediante `site/dist/checkout-policy.js`. Esto no cambia la configuración general de pagos de Shopify ni otros canales. Actualizado en https://areas3d.dannyhub.com/ el 6 de octubre de 2026, tema `146217140308`. Incluye ajustes para portátil, impresora 3D animada con extrusor que permanece en la máquina y pie con d4n7.dev. Shopify confirma el tema publicado. Verificados catálogo de 23 productos, animación, pie de página y botón de pago deshabilitado, sin errores de consola. El tema anterior `146201706580` se conserva como respaldo.
