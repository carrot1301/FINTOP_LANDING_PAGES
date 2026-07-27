async function verify() {
  try {
    console.log('📡 Fetching blogs from http://localhost:3000/blogs?limit=100...');
    const res = await fetch('http://localhost:3000/blogs?limit=100');
    if (!res.ok) {
      throw new Error(`HTTP error! status: ${res.status}`);
    }
    const body = await res.json();
    const articles = body.data?.data || body.data || [];
    console.log(`✅ Successfully retrieved ${articles.length} articles!`);

    const expectedNewSlugs = [
      'dong-tien-thang-7-2026-nhom-chung-khoan',
      'bao-cao-vi-mo-q3-2026-chinh-sach-tien-te',
      'pro-hpg-dung-quat-2-pe-phong',
      'pro-tcb-mo-hinh-so-dan-dau',
      'vhm-cap-nhat-tien-do-du-an-2026',
      'nlg-nam-long-nha-o-vua-tui-tien',
      'nganh-ban-le-phuc-hoi-suc-mua-noi-dia',
      'nganh-nang-luong-tai-tao-dien-viii'
    ];

    console.log('\n--- Checking New Mock Articles ---');
    let foundCount = 0;
    for (const slug of expectedNewSlugs) {
      const art = articles.find(a => a.slug === slug);
      if (art) {
        console.log(`✨ FOUND: Slug: "${slug}" | Title: "${art.title}" | Category: "${art.category?.slug}"`);
        foundCount++;
      } else {
        console.log(`❌ NOT FOUND: Slug: "${slug}"`);
      }
    }

    console.log(`\nFound ${foundCount}/${expectedNewSlugs.length} expected new articles.`);

    console.log('\n--- Grouping All Articles by Category ---');
    const grouped = {};
    for (const art of articles) {
      const catSlug = art.category?.slug || 'no-category';
      if (!grouped[catSlug]) grouped[catSlug] = [];
      grouped[catSlug].push(art.slug);
    }
    for (const [cat, list] of Object.entries(grouped)) {
      console.log(`  📂 Category: "${cat}" has ${list.length} articles:`);
      list.forEach(s => console.log(`     - ${s}`));
    }

  } catch (err) {
    console.error('❌ Verification failed:', err);
  }
}

verify();
