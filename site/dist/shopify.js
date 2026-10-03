import {assertCheckoutEnabled} from './checkout-policy.js';
import {canPurchase} from './catalog-policy.js';
import {shopifyConfig as config} from './config.js?v=shopify-1';
export const connected=Boolean(config.domain && config.publicStorefrontToken);
async function request(query,variables={}){if(!connected)throw new Error('Shopify aún no está conectado.');if(!/^[a-z0-9-]+\.myshopify\.com$/.test(config.domain))throw new Error('Dominio de Shopify no válido.');const response=await fetch(`https://${config.domain}/api/${config.apiVersion}/graphql.json`,{method:'POST',headers:{'Content-Type':'application/json','X-Shopify-Storefront-Access-Token':config.publicStorefrontToken},body:JSON.stringify({query,variables}),signal:AbortSignal.timeout(15000)});if(!response.ok)throw new Error('No se pudo conectar con la tienda. Inténtalo de nuevo.');const result=await response.json();if(result.errors?.length)throw new Error('La tienda no pudo completar la solicitud.');return result.data;}
export async function getProducts(){
 const products=[];let after=null;
 do {
  const data=await request(`query($after:String){products(first:100,after:$after){pageInfo{hasNextPage endCursor} nodes{id title description productType tags featuredImage{url altText} media(first:100){nodes{... on Model3d{sources{url mimeType}}}} variants(first:100){nodes{id title availableForSale price{amount currencyCode}}}}}}`,{after});
  products.push(...data.products.nodes.map(p=>({...p,variants:p.variants.nodes,image:p.featuredImage?.url,alt:p.featuredImage?.altText||p.title})));
  after=data.products.pageInfo.hasNextPage?data.products.pageInfo.endCursor:null;
 }while(after);
 return products;
}
export async function createCheckout(lines){assertCheckoutEnabled();if(!lines.length||lines.some(l=>!canPurchase(l.product,l.variant)))throw new Error("Hay piezas de catálogo que todavía no están disponibles para comprar.");const data=await request(`mutation($input:CartInput!){ cartCreate(input:$input){cart{checkoutUrl} userErrors{message}}}`,{input:{lines:lines.map(l=>({merchandiseId:l.variant.id,quantity:l.quantity}))}});if(data.cartCreate.userErrors.length||!data.cartCreate.cart)throw new Error('Revisa la disponibilidad de los productos antes de pagar.');return data.cartCreate.cart.checkoutUrl;}
