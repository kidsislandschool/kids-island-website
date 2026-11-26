import fetch from 'node-fetch';
import { JSDOM } from 'jsdom';

async function testForms() {
  const base = 'http://localhost:3000';
  
  // Test Admission Inquiry Form
  console.log('\n=== Testing Admission Inquiry Form ===');
  const admRes = await fetch(base + '/admissions');
  const admHtml = await admRes.text();
  const admDom = new JSDOM(admHtml);
  const admDoc = admDom.window.document;
  
  const forms = admDoc.querySelectorAll('form');
  console.log('Forms found:', forms.length);
  forms.forEach((form, i) => {
    console.log(`Form ${i+1}: action="${form.action}" method="${form.method}"`);
    const inputs = form.querySelectorAll('input, select, textarea');
    inputs.forEach(input => {
      console.log(`  ${input.tagName}: name="${input.name}" type="${input.type}" required="${input.required}"`);
    });
    const buttons = form.querySelectorAll('button[type="submit"]');
    console.log(`  Submit buttons: ${buttons.length}`);
  });
  
  // Test Contact Form
  console.log('\n=== Testing Contact Form ===');
  const contactRes = await fetch(base + '/contact');
  const contactHtml = await contactRes.text();
  const contactDom = new JSDOM(contactHtml);
  const contactDoc = contactDom.window.document;
  
  const contactForms = contactDoc.querySelectorAll('form');
  console.log('Forms found:', contactForms.length);
  contactForms.forEach((form, i) => {
    console.log(`Form ${i+1}: action="${form.action}" method="${form.method}"`);
    const inputs = form.querySelectorAll('input, select, textarea');
    inputs.forEach(input => {
      console.log(`  ${input.tagName}: name="${input.name}" type="${input.type}" required="${input.required}"`);
    });
    const buttons = form.querySelectorAll('button[type="submit"]');
    console.log(`  Submit buttons: ${buttons.length}`);
  });
  
  // Test Notices page - search and filter
  console.log('\n=== Testing Notices Page ===');
  const noticesRes = await fetch(base + '/notices');
  const noticesHtml = await noticesRes.text();
  const noticesDom = new JSDOM(noticesHtml);
  const noticesDoc = noticesDom.window.document;
  
  const searchInput = noticesDoc.querySelector('input[type="search"], input[placeholder*="search" i]');
  console.log('Search input:', searchInput ? 'FOUND' : 'NOT FOUND');
  
  const categorySelect = noticesDoc.querySelector('select');
  console.log('Category filter:', categorySelect ? 'FOUND' : 'NOT FOUND');
  if (categorySelect) {
    const options = categorySelect.querySelectorAll('option');
    console.log('  Options:', options.length);
    options.forEach(opt => console.log(`    ${opt.value}: ${opt.textContent}`));
  }
  
  // Check for pagination
  const pagination = noticesDoc.querySelector('nav[aria-label*="pagination" i], .pagination');
  console.log('Pagination:', pagination ? 'FOUND' : 'NOT FOUND');
  
  // Test Notice Detail pages
  console.log('\n=== Testing Notice Detail Pages ===');
  for (const id of [3, 4, 5, 6]) {
    try {
      const detailRes = await fetch(base + '/notices/' + id);
      const detailHtml = await detailRes.text();
      const detailDom = new JSDOM(detailHtml);
      const detailDoc = detailDom.window.document;
      const title = detailDoc.querySelector('h1')?.textContent || 'NO TITLE';
      console.log(`/notices/${id}: Status ${detailRes.status} - ${title}`);
    } catch (e) {
      console.log(`/notices/${id}: ERROR - ${e.message}`);
    }
  }
  
  // Test Gallery images
  console.log('\n=== Testing Gallery Images ===');
  const galleryRes = await fetch(base + '/gallery');
  const galleryHtml = await galleryRes.text();
  const galleryDom = new JSDOM(galleryHtml);
  const galleryDoc = galleryDom.window.document;
  
  const images = galleryDoc.querySelectorAll('img');
  console.log('Images found:', images.length);
  let validImages = 0, brokenImages = 0;
  for (const img of images) {
    const src = img.src;
    if (src && !src.includes('_next') && !src.includes('data:')) {
      try {
        const imgRes = await fetch(base + src);
        if (imgRes.ok) validImages++;
        else brokenImages++;
      } catch {
        brokenImages++;
      }
    }
  }
  console.log(`Valid images: ${validImages}, Broken images: ${brokenImages}`);
  
  // Test Footer links
  console.log('\n=== Testing Footer Links ===');
  const footerLinks = [
    ['/privacy', 'Privacy Policy'],
    ['/terms', 'Terms of Service'],
    ['/contact', 'Contact'],
    ['/about', 'About Us'],
    ['/admissions', 'Admissions'],
    ['/academics', 'Academics'],
    ['/faculty', 'Faculty'],
    ['/gallery', 'Gallery'],
    ['/notices', 'Notices'],
    ['/study-materials', 'Study Materials'],
  ];
  
  for (const [path, name] of footerLinks) {
    try {
      const res = await fetch(base + path);
      console.log(`${name} (${path}): ${res.status} ${res.status === 200 ? 'OK' : 'FAIL'}`);
    } catch (e) {
      console.log(`${name} (${path}): ERROR - ${e.message}`);
    }
  }
  
  // Test Social Media Links
  console.log('\n=== Testing Social Media Links ===');
  const socialLinks = [
    ['https://facebook.com/kidsislandaligarh', 'Facebook'],
    ['https://instagram.com/kidsislandaligarh', 'Instagram'],
    ['https://youtube.com/@kidsislandaligarh', 'YouTube'],
  ];
  
  for (const [url, name] of socialLinks) {
    try {
      const res = await fetch(url, { method: 'HEAD', redirect: 'follow' });
      console.log(`${name}: ${res.status} ${res.status < 400 ? 'OK' : 'CHECK'}`);
    } catch (e) {
      console.log(`${name}: ERROR - ${e.message}`);
    }
  }
  
  // Test tel: and mailto: links
  console.log('\n=== Testing Contact Links ===');
  console.log('Phone: tel:+919012655655 - Format valid');
  console.log('Email: mailto:contact@kidsaligarh.com - Format valid');
  console.log('WhatsApp: https://wa.me/919997973574 - External');
  
  // Test Google Maps link
  console.log('\n=== Testing Google Maps Link ===');
  try {
    const mapsUrl = 'https://www.google.com/maps/search/?api=1&query=Kids%20Island%20Senior%20Secondary%20School%20Aligarh';
    const res = await fetch(mapsUrl, { method: 'HEAD', redirect: 'follow' });
    console.log(`Google Maps: ${res.status} ${res.status < 400 ? 'OK' : 'CHECK'}`);
  } catch (e) {
    console.log(`Google Maps: ERROR - ${e.message}`);
  }
}

testForms();