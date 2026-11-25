import fetch from 'node-fetch';

async function test() {
  const res = await fetch('https://kidsaligarh.com/admin-login', { 
    method: 'GET', 
    redirect: 'manual' 
  });
  console.log('Status:', res.status);
  console.log('Headers:', Object.fromEntries(res.headers.entries()));
}

test().catch(console.error);