import {canPurchase} from './catalog-policy.js';
// Store only variant IDs and quantities; prices always come from the loaded catalog.
export function createCartStorage(key, storage) {
  let available = true;
  const valid = line => line && typeof line.variantId === 'string' && line.variantId.length < 200 && Number.isInteger(line.quantity) && line.quantity > 0 && line.quantity <= 99;
  return {
    get available() { return available; },
    read() {
      try {
        const value = JSON.parse(storage.getItem(key) || 'null');
        if (!value || value.version !== 1 || !Array.isArray(value.lines)) return [];
        if (!Number.isFinite(value.savedAt) || Date.now() - value.savedAt > 30 * 86400000) return [];
        return value.lines.filter(valid).slice(0, 100);
      } catch { available = false; return []; }
    },
    save(cart) {
      try {
        storage.setItem(key, JSON.stringify({ version: 1, savedAt: Date.now(), lines: cart.map(l => ({ variantId: l.variant.id, quantity: l.quantity })).filter(valid) }));
      } catch { available = false; }
    }
  };
}
export function restoreCart(lines, products) {
  const variants = new Map(products.flatMap(product => product.variants.map(variant => [variant.id, {product, variant}])));
  const result = new Map();
  let changed = false;
  for (const line of lines) {
    const match = variants.get(line.variantId);
    if (!match || !canPurchase(match.product, match.variant)) { changed = true; continue; }
    const quantity = Math.min(99, (result.get(line.variantId)?.quantity || 0) + line.quantity);
    result.set(line.variantId, {...match, quantity});
  }
  return {cart: [...result.values()], changed};
}
