import fetch from 'node-fetch';

async function testContact() {
  const res = await fetch('http://localhost:3000/api/contact', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      type: 'contact',
      name: 'Test User',
      phone: '9876543210',
      email: 'test@example.com',
      message: 'Test contact message',
    }),
  });
  console.log('Status:', res.status);
  const data = await res.json().catch(() => ({}));
  console.log('Response:', data);
}

testContact();