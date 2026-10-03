import {test} from 'node:test';
import assert from 'node:assert/strict';
import {modelSource} from '../dist/product-model.js';

test('photo-only, incomplete and unsupported media do not offer 3D', () => {
  for (const p of [{}, {media:{nodes:[{}]}}, {media:{nodes:[{sources:[{url:'https://example.com/model.usdz',mimeType:'model/vnd.usdz+zip'}]}]}}]) {
    assert.equal(modelSource(p), null);
  }
});
test('select a secure GLB source among product media', () => {
  assert.equal(modelSource({media:{nodes:[{}, {sources:[
    {url:'javascript:alert(1)',mimeType:'model/gltf-binary'},
    {url:'https://cdn.shopify.com/model.glb',mimeType:'model/gltf-binary'}
  ]}]}}), 'https://cdn.shopify.com/model.glb');
});
