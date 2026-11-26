import fetch from 'node-fetch';

async function testFormSubmissions() {
  const base = 'http://localhost:3000';
  
  // Test Admission Inquiry API
  console.log('\n=== Testing Admission Inquiry API ===');
  try {
    const res = await fetch(base + '/api/inquiries', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        type: 'admission',
        name: 'Test Student',
        parentName: 'Test Parent',
        phone: '9876543210',
        email: 'test@example.com',
        classApply: 'Class 1',
        message: 'Test message',
      }),
    });
    const data = await res.json();
    console.log(`Status: ${res.status}`);
    console.log(`Response:`, data);
  } catch (e) {
    console.log(`ERROR: ${e.message}`);
  }
  
  // Test Contact Form API
  console.log('\n=== Testing Contact Form API ===');
  try {
    const res = await fetch(base + '/api/contact', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        name: 'Test User',
        phone: '9876543210',
        email: 'test@example.com',
        message: 'Test contact message',
      }),
    });
    const data = await res.json();
    console.log(`Status: ${res.status}`);
    console.log(`Response:`, data);
  } catch (e) {
    console.log(`ERROR: ${e.message}`);
  }
  
  // Test Notices API with search
  console.log('\n=== Testing Notices API ===');
  try {
    const res = await fetch(base + '/api/notices?page=1&perPage=10');
    const data = await res.json();
    console.log(`Status: ${res.status}`);
    console.log(`Total: ${data.total}, Rows: ${data.rows?.length}`);
    console.log(`Pages: ${data.pages}`);
  } catch (e) {
    console.log(`ERROR: ${e.message}`);
  }
  
  // Test Notices API with category filter
  console.log('\n=== Testing Notices API with Category ===');
  try {
    const res = await fetch(base + '/api/notices?category=Notice&page=1&perPage=10');
    const data = await res.json();
    console.log(`Status: ${res.status}`);
    console.log(`Total: ${data.total}, Rows: ${data.rows?.length}`);
  } catch (e) {
    console.log(`ERROR: ${e.message}`);
  }
  
  // Test Notices API with search
  console.log('\n=== Testing Notices API with Search ===');
  try {
    const res = await fetch(base + '/api/notices?q=Test&page=1&perPage=10');
    const data = await res.json();
    console.log(`Status: ${res.status}`);
    console.log(`Total: ${data.total}, Rows: ${data.rows?.length}`);
  } catch (e) {
    console.log(`ERROR: ${e.message}`);
  }
  
  // Test Materials API
  console.log('\n=== Testing Study Materials API ===');
  try {
    const res = await fetch(base + '/api/study-materials');
    const data = await res.json();
    console.log(`Status: ${res.status}`);
    console.log(`Total: ${data.total}, Rows: ${data.rows?.length}`);
  } catch (e) {
    console.log(`ERROR: ${e.message}`);
  }
  
  // Test Faculty API
  console.log('\n=== Testing Faculty API ===');
  try {
    const res = await fetch(base + '/api/faculty');
    const data = await res.json();
    console.log(`Status: ${res.status}`);
    console.log(`Rows: ${data.length}`);
  } catch (e) {
    console.log(`ERROR: ${e.message}`);
  }
  
  // Test Testimonials API
  console.log('\n=== Testing Testimonials API ===');
  try {
    const res = await fetch(base + '/api/testimonials');
    const data = await res.json();
    console.log(`Status: ${res.status}`);
    console.log(`Rows: ${data.length}`);
  } catch (e) {
    console.log(`ERROR: ${e.message}`);
  }
  
  // Test FAQs API
  console.log('\n=== Testing FAQs API ===');
  try {
    const res = await fetch(base + '/api/faqs');
    const data = await res.json();
    console.log(`Status: ${res.status}`);
    console.log(`Rows: ${data.length}`);
  } catch (e) {
    console.log(`ERROR: ${e.message}`);
  }
  
  // Test Affiliation API
  console.log('\n=== Testing Affiliation API ===');
  try {
    const res = await fetch(base + '/api/affiliation');
    const data = await res.json();
    console.log(`Status: ${res.status}`);
    console.log(`Data:`, data);
  } catch (e) {
    console.log(`ERROR: ${e.message}`);
  }
  
  // Test Site Settings API
  console.log('\n=== Testing Site Settings API ===');
  try {
    const res = await fetch(base + '/api/settings/site');
    const data = await res.json();
    console.log(`Status: ${res.status}`);
    console.log(`Data keys:`, Object.keys(data || {}));
  } catch (e) {
    console.log(`ERROR: ${e.message}`);
  }
  
  // Test Upload API (should require auth)
  console.log('\n=== Testing Upload API (no auth) ===');
  try {
    const res = await fetch(base + '/api/uploads', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ filename: 'test.jpg', contentType: 'image/jpeg' }),
    });
    const data = await res.json();
    console.log(`Status: ${res.status}`);
    console.log(`Response:`, data);
  } catch (e) {
    console.log(`ERROR: ${e.message}`);
  }
}

testFormSubmissions();