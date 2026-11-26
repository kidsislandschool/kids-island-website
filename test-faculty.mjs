import fetch from 'node-fetch';

async function testFacultyCreate() {
  const res = await fetch('http://localhost:3000/api/admin/collections/faculty', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      name: 'Test Faculty API',
      designation: 'Teacher',
      subjects: 'Math, Science',
      qualification: 'M.Sc',
      bio: 'Test bio',
      photo: null,
      order_index: 0,
      featured: false,
      status: 'published',
    }),
  });
  console.log('Status:', res.status);
  const data = await res.json().catch(() => ({}));
  console.log('Response:', data);
}

testFacultyCreate();