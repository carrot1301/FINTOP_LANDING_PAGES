const fs = require('fs');
const html = fs.readFileSync('c:/Users/Admin/FINTOP_LANDING_PAGES/scratch/client_loadlist.html', 'utf8');

const collapsed = html.replace(/\s+/g, ' ');
const trMatches = collapsed.match(/<tr[^>]*>([\s\S]*?)<\/tr>/gi);

console.log('Total tr matches found:', trMatches ? trMatches.length : 0);

for (const trHtml of trMatches) {
  if (trHtml.includes('sasdasd')) {
    console.log('--- FOUND sasdasd TR HTML ---');
    console.log(trHtml.substring(0, 500));

    const textContent = trHtml
      .replace(/<br\s*\/?>/gi, '\n')
      .replace(/<\/div>/gi, '\n')
      .replace(/<\/p>/gi, '\n')
      .replace(/<\/tr>/gi, '\n')
      .replace(/<[^>]+>/g, ' ')
      .replace(/&nbsp;/g, ' ')
      .replace(/&amp;/g, '&')
      .replace(/&quot;/g, '"')
      .replace(/[ \t]+/g, ' ')
      .trim();

    console.log('--- textContent ---');
    console.log(JSON.stringify(textContent));

    const get = (pattern) => {
      const m = textContent.match(pattern);
      return m ? m[1].trim() : '';
    };

    console.log('investmentDuration:', JSON.stringify(get(/Thời gian đầu tư[ \t]*:[ \t]*([^\n:]*)/i)));
    console.log('stockAccount:', JSON.stringify(get(/Số TKCK VPS \(nếu có\)[ \t]*:[ \t]*([^\n:]*)/i)));
  }
}
