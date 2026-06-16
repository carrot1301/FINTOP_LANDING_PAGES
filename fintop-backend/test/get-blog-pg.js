const { Client } = require('pg');

const client = new Client({
  connectionString: "postgresql://postgres:123@localhost:5432/fintop"
});

async function main() {
  await client.connect();
  
  // Fetch all blogs
  const res = await client.query('SELECT id, title, slug, content FROM blogs ORDER BY id DESC LIMIT 5');
  console.log('Available Blogs:');
  res.rows.forEach(b => {
    console.log(`- [${b.id}] ${b.title} (slug: ${b.slug})`);
  });
  
  // Find "NGÂN HÀNG" or "DÒNG VỐN"
  const target = res.rows.find(b => b.title.includes('NGÂN HÀNG') || b.title.includes('VỐN NGOẠI'));
  if (target) {
    console.log('\n--- Selected Blog: ' + target.title + ' ---');
    console.log('Content (first 3000 chars):');
    console.log(target.content.substring(0, 3000));
  } else if (res.rows.length > 0) {
    console.log('\n--- Selected Blog: ' + res.rows[0].title + ' ---');
    console.log('Content (first 3000 chars):');
    console.log(res.rows[0].content.substring(0, 3000));
  }
  
  await client.end();
}

main().catch(console.error);
