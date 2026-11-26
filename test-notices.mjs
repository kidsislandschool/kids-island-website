import fetch from 'node-fetch';

async function test() {
  const res = await fetch('http://localhost:3000/api/notices?category=Notice&page=1&perPage=10');
  console.log('Category Notice:', res.status);
  const data = await res.text();
  console.log(data.substring(0, 200));
}

test();