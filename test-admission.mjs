import fetch from 'node-fetch';

async function test() {
  const res = await fetch('https://www.kidsaligarh.com/api/inquiries', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      type: 'admission',
      name: 'Test Student Production',
      parentName: 'Test Parent',
      phone: '9876543210',
      email: 'test@example.com',
      classApply: 'Class 1',
      message: 'Test admission inquiry from production',
    }),
  });
  console.log('Status:', res.status);
  const data = await res.json().catch(() => ({}));
  console.log('Response:', data);
}

test();