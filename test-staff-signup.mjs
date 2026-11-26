import fetch from 'node-fetch';

async function test() {
  const res = await fetch('http://localhost:3001/api/staff/signup', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      name: 'Test Teacher',
      email: 'teacher@test.com',
      phone: '9876543210',
      designation: 'Teacher',
      qualification: 'M.Sc',
      bio: 'Test bio',
      password: 'password123',
      confirmPassword: 'password123',
    }),
  });
  console.log('Status:', res.status);
  const data = await res.json().catch(() => ({}));
  console.log('Response:', data);
}

test();