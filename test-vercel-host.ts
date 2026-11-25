import fetch from 'node-fetch';

async function test() {
  const res = await fetch('https://kids-island-website-infdsfq1g-kidsislandschool.vercel.app/api/auth/login', {
    method: 'POST',
    headers: { 
      'Content-Type': 'application/json',
      'Host': 'www.kidsaligarh.com'
    },
    body: JSON.stringify({ email: 'kidsislandschoolaligarh@gmail.com', password: '@KIBA2001@' })
  });
  const data = await res.json();
  console.log('Vercel URL with Host header:', JSON.stringify(data, null, 2));
}

test().catch(console.error);