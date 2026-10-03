import {test} from 'node:test';
import assert from 'node:assert/strict';
import {canPurchase,pendingPrice} from '../dist/catalog-policy.js';
const variant={availableForSale:true,price:{amount:'10000',currencyCode:'COP'}};
test('catalog-only products cannot be purchased even with stock and a price',()=>{assert.equal(canPurchase({tags:['catalogo-sin-venta']},variant),false)});
test('pending price and zero prices never become free purchases',()=>{assert.equal(canPurchase({tags:['precio-por-definir']},variant),false);assert.equal(canPurchase({}, {...variant,price:{amount:'0'}}),false);assert.equal(pendingPrice({}, {...variant,price:{amount:'0'}}),true)});
test('sale requires price, availability and removal of catalog restrictions',()=>{assert.equal(canPurchase({tags:[]},variant),true);assert.equal(canPurchase({}, {...variant,availableForSale:false}),false)});
