export function pendingPrice(product,variant=product.variants?.[0]) {
  return product.tags?.includes('precio-por-definir') || !variant || !Number.isFinite(Number(variant.price?.amount)) || Number(variant.price.amount)<=0;
}
export function canPurchase(product,variant) {
  return !product.tags?.includes('catalogo-sin-venta') && !pendingPrice(product,variant) && Boolean(variant?.availableForSale);
}
