import {test} from 'node:test';
import assert from 'node:assert/strict';
import {checkoutEnabled} from '../dist/checkout-policy.js';
import {createCheckout} from '../dist/shopify.js';
test('launch blocks checkout before any request to Shopify', async () => {
  let requests = 0;
  const original = globalThis.fetch;
  globalThis.fetch = async () => { requests++; throw new Error('Unexpected network request'); };
  try {
    assert.equal(checkoutEnabled, false);
    await assert.rejects(createCheckout([]), /Pago no habilitado/);
    assert.equal(requests, 0);
  } finally { globalThis.fetch = original; }
});
