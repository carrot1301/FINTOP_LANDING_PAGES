async function query() {
  try {
    console.log('🔑 Logging in as admin...');
    const loginRes = await fetch('http://localhost:3000/auth/login', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ email: 'admin@fintop.vn', password: 'FinTop@2026' })
    });
    if (!loginRes.ok) {
      throw new Error(`Login failed: ${loginRes.status}`);
    }
    const loginBody = await loginRes.json();
    const token = loginBody.data?.accessToken || loginBody.data || '';
    if (!token) {
      throw new Error('Access token not found in login response');
    }
    console.log('✅ Logged in successfully!');

    console.log('\n📡 Fetching /admin/blogs...');
    const blogsRes = await fetch('http://localhost:3000/admin/blogs?limit=50', {
      headers: { 'Authorization': `Bearer ${token}` }
    });
    if (!blogsRes.ok) {
      throw new Error(`Fetch blogs failed: ${blogsRes.status}`);
    }
    const blogsBody = await blogsRes.json();
    const data = blogsBody.data?.data || blogsBody.data || [];
    console.log(`✅ Retrieved ${data.length} admin blogs!`);
    data.forEach((b, i) => {
      console.log(`${i+1}. [${b.status}] ${b.title} (${b.category?.slug})`);
    });
  } catch (err) {
    console.error('❌ Error:', err);
  }
}

query();
