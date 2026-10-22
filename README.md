# PEACHEPHONE — tienda de smartphones

## Archivos
- `index.html`: estructura de la tienda, catálogo, carrito, login de demostración y panel local.
- `style.css`: diseño negro y dorado adaptable a móviles.
- `script.js`: catálogo, búsqueda, categorías, descuentos, carrito, WhatsApp y herramientas de demostración.

## Cómo abrir
1. Abrí esta carpeta en Visual Studio Code.
2. Abrí `index.html` en el navegador, o instalá la extensión Live Server y elegí **Open with Live Server**.
3. En `script.js`, reemplazá `WHATSAPP_NUMBER = "54911XXXXXXXX"` por tu número real en formato internacional, solo dígitos y sin `+`, espacios ni guiones.
4. Cambiá productos, precios e imágenes por datos reales.

## Importante: demostración frontend
Los precios, descuentos y productos son ejemplos. El carrito y el catálogo administrado se guardan en `localStorage`, es decir, en el navegador de cada visitante. El inicio de sesión es solo una simulación. No hay cuentas reales, protección del panel, base de datos, control de stock, confirmación de pedidos ni pagos online.

## Para una tienda de producción
Se recomienda:
- Backend (por ejemplo Node.js + Express) con API de productos y pedidos.
- Base de datos (por ejemplo PostgreSQL o MongoDB).
- Autenticación real con contraseñas hasheadas, sesiones seguras y roles de administrador.
- Validación de precios y stock en el servidor; nunca confiar en los precios que envía el navegador.
- Panel de administración protegido por permisos.
- HTTPS, validación de entradas, límites de peticiones, copias de seguridad y política de privacidad.
- Para cobrar online, integrar una pasarela como Mercado Pago mediante su SDK/API oficial desde el backend. No guardar datos de tarjetas en tu web.
- Para WhatsApp, el enlace `wa.me` solo abre un mensaje prearmado; no confirma automáticamente una venta. Para automatización se necesita WhatsApp Business Platform/API y configuración empresarial.

No publiques el panel de administración tal cual en una tienda real: cualquier visitante puede acceder y modificar su catálogo local.
