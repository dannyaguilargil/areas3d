// Launch as a browsable catalog with a local cart, without creating checkouts.
export const checkoutEnabled = false;
export const checkoutMessage = 'Pago no habilitado. Puedes explorar los productos y preparar tu carrito; las compras estarán disponibles próximamente.';
export function assertCheckoutEnabled() {
  if (!checkoutEnabled) throw new Error(checkoutMessage);
}
