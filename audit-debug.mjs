import fetch from 'node-fetch';

async function debugApis() {
  const base = 'http://localhost:3000';
  
  const apis = [
    '/api/contact',
    '/api/notices?category=Notice&page=1&perPage=10',
    '/api/notices?q=Test&page=1&perPage=10',
    '/api/faculty',
    '/api/testimonials',
    '/api/faqs',
    '/api/affiliation',
    '/api/settings/site',
    '/api/uploads',
  ];
  
  for (const api of apis) {
    try {
      const res = await fetch(base + api);
      const text = await res.text();
      console.log(`\n=== ${api} ===`);
      console.log(`Status: ${res.status}`);
      console.log(`Content-Type: ${res.headers.get('content-type')}`);
      console.log(`Response (first 200 chars): ${text.substring(0, 200)}`);
    } catch (e) {
      console.log(`\n=== ${api} ===`);
      console.log(`ERROR: ${e.message}`);
    }
  }
}

debugApis();