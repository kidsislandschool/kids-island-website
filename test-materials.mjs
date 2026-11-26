import fetch from 'node-fetch';

async function testMaterials() {
  const res = await fetch('http://localhost:3000/api/study-materials');
  console.log('Status:', res.status);
  const text = await res.text();
  console.log('Response (first 500 chars):', text.substring(0, 500));
}

testMaterials();