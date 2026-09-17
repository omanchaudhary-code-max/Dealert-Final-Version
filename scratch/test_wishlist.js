const http = require('http');

async function main() {
  console.log('1. Fetching products from catalog...');
  const prodRes = await fetch('http://localhost:3000/api/products?limit=10');
  const prodData = await prodRes.json();
  const products = prodData.products || [];
  console.log(`Found ${products.length} products in catalog.`);
  if (products.length === 0) {
    console.error('No products found in catalog!');
    return;
  }

  const email = `testuser_${Date.now()}@example.com`;
  const password = 'TestPassword123!';
  const fullName = 'Test User';

  console.log('\n2. Registering user...');
  const regRes = await fetch('http://localhost:3000/api/auth/register', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ email, password, confirmPassword: password, fullName }),
  });
  const regData = await regRes.json();
  console.log('Register response:', regRes.status);

  console.log('\n3. Logging in...');
  const loginRes = await fetch('http://localhost:3000/api/auth/login', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ email, password }),
  });
  const loginData = await loginRes.json();
  console.log('Login response:', loginRes.status);

  const setCookie = loginRes.headers.get('set-cookie');
  const headers = {
    'Content-Type': 'application/json',
    Cookie: setCookie ? setCookie.split(';')[0] : '',
  };

  console.log('\n4. Testing BUG 1: Rapid wishlist add/remove/fetch requests...');
  const testProduct = products[0];
  const prodId = testProduct.itemId || testProduct.id;

  for (let i = 1; i <= 20; i++) {
    const addRes = await fetch('http://localhost:3000/api/wishlist', {
      method: 'POST',
      headers,
      body: JSON.stringify({ productId: prodId }),
    });
    console.log(`Add ${i}: status ${addRes.status}`);

    const getRes = await fetch('http://localhost:3000/api/wishlist', { headers });
    console.log(`Fetch ${i}: status ${getRes.status}`);

    const delRes = await fetch(`http://localhost:3000/api/wishlist/${encodeURIComponent(prodId)}`, {
      method: 'DELETE',
      headers,
    });
    console.log(`Delete ${i}: status ${delRes.status}`);
  }

  console.log('\n5. Testing BUG 2: Free tier limit (5 items max)...');
  // First clear existing wishlist
  const getRes = await fetch('http://localhost:3000/api/wishlist', { headers });
  const items = await getRes.json();
  if (Array.isArray(items)) {
    for (const item of items) {
      await fetch(`http://localhost:3000/api/wishlist/${encodeURIComponent(item.id)}`, {
        method: 'DELETE',
        headers,
      });
    }
  }

  // Add 5 distinct products
  const addedIds = [];
  for (let i = 0; i < Math.min(5, products.length); i++) {
    const p = products[i];
    const pId = p.itemId || p.id;
    const res = await fetch('http://localhost:3000/api/wishlist', {
      method: 'POST',
      headers,
      body: JSON.stringify({ productId: pId }),
    });
    const d = await res.json();
    console.log(`Adding item ${i + 1} (${pId}): status ${res.status}`, d.id ? `(ID: ${d.id})` : d.error);
    if (res.status === 201) addedIds.push(d.id);
  }

  console.log(`Current wishlist count: ${addedIds.length}`);

  // If we have a 6th product in catalog:
  if (products.length >= 6) {
    const p6 = products[5];
    const p6Id = p6.itemId || p6.id;
    console.log(`\nAttempting to add 6th item (${p6Id}) - should return 403...`);
    const res6 = await fetch('http://localhost:3000/api/wishlist', {
      method: 'POST',
      headers,
      body: JSON.stringify({ productId: p6Id }),
    });
    const data6 = await res6.json();
    console.log('6th item addition result: status =', res6.status, 'body =', data6);
  } else {
    console.log('Fewer than 6 products in catalog, trying with another item ID');
  }
}

main().catch(console.error);
