import fetch from 'node-fetch';

async function test() {
  const res = await fetch('https://www.kidsaligarh.com/api/auth/login', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ email: 'kidsislandschoolaligarh@gmail.com', password: '@KIBA2001@' })
  });
  const data = await res.json();
  console.log('WWW Domain Response:', JSON.stringify(data, null, 2));
}

test().catch(console.error);