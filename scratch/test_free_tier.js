async function testFreeTier() {
  console.log('1. Fetching 6 catalog items...');
  const prodRes = await fetch('http://localhost:3000/api/products?limit=10');
  const prodData = await prodRes.json();
  const products = prodData.products || [];
  if (products.length < 6) {
    console.error('Not enough products in catalog');
    return;
  }

  const email = `freetier_${Date.now()}@example.com`;
  const password = 'TestPassword123!';
  const fullName = 'Free Tier User';

  console.log('2. Registering free tier user...');
  await fetch('http://localhost:3000/api/auth/register', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ email, password, confirmPassword: password, fullName }),
  });

  console.log('3. Logging in...');
  const loginRes = await fetch('http://localhost:3000/api/auth/login', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ email, password }),
  });
  const setCookie = loginRes.headers.get('set-cookie');
  const headers = {
    'Content-Type': 'application/json',
    Cookie: setCookie ? setCookie.split(';')[0] : '',
  };

  console.log('\n4. Adding 5 items to wishlist...');
  for (let i = 0; i < 5; i++) {
    const p = products[i];
    const res = await fetch('http://localhost:3000/api/wishlist', {
      method: 'POST',
      headers,
      body: JSON.stringify({ productId: p.itemId || p.id }),
    });
    const data = await res.json();
    console.log(`Item ${i + 1} added: status ${res.status}`);
  }

  console.log('\n5. Attempting to add 6th item (testing Free-tier limit error response)...');
  const p6 = products[5];
  const res6 = await fetch('http://localhost:3000/api/wishlist', {
    method: 'POST',
    headers,
    body: JSON.stringify({ productId: p6.itemId || p6.id }),
  });
  const data6 = await res6.json();
  console.log(`6th item add status: ${res6.status}`);
  console.log(`6th item error payload:`, JSON.stringify(data6, null, 2));

  if (res6.status === 403 && data6.error && data6.error.includes('Free tier limit reached')) {
    console.log('\n✅ Free-tier limit check PASSED! Status 403 returned with expected error message.');
  } else {
    console.error('\n❌ Free-tier limit check FAILED!');
  }
}

testFreeTier().catch(console.error);
