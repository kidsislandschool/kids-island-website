import fetch from 'node-fetch';

async function auditPage(url, name) {
  try {
    const res = await fetch(url);
    const html = await res.text();
    console.log(`\n=== ${name} (${url}) ===`);
    console.log(`Status: ${res.status}`);
    console.log(`HTML length: ${html.length}`);
    
    // Extract all href links
    const linkRegex = /href="([^"]+)"/g;
    const links = [];
    let match;
    while ((match = linkRegex.exec(html)) !== null) {
      links.push(match[1]);
    }
    const uniqLinks = [...new Set(links)];
    console.log(`\nLinks found (${uniqLinks.length}):`);
    uniqLinks.forEach(l => console.log(`  ${l}`));
    
    // Extract buttons with onclick or type=submit
    const buttonRegex = /<button[^>]*>(.*?)<\/button>/gi;
    const buttons = [];
    while ((match = buttonRegex.exec(html)) !== null) {
      buttons.push(match[1].trim());
    }
    if (buttons.length > 0) {
      console.log(`\nButtons found (${buttons.length}):`);
      buttons.forEach(b => console.log(`  ${b.substring(0, 100)}`));
    }
    
    // Extract forms
    const formRegex = /<form[^>]*action="([^"]*)"[^>]*>/gi;
    const forms = [];
    while ((match = formRegex.exec(html)) !== null) {
      forms.push(match[1]);
    }
    if (forms.length > 0) {
      console.log(`\nForms found (${forms.length}):`);
      forms.forEach(f => console.log(`  action="${f}"`));
    }
    
    return { html, links: uniqLinks, buttons, forms };
  } catch (e) {
    console.log(`\n=== ${name} (${url}) ===`);
    console.log(`ERROR: ${e.message}`);
    return null;
  }
}

async function main() {
  const base = 'http://localhost:3000';
  const pages = [
    ['/', 'Homepage'],
    ['/about', 'About'],
    ['/academics', 'Academics'],
    ['/faculty', 'Faculty'],
    ['/gallery', 'Gallery'],
    ['/admissions', 'Admissions'],
    ['/contact', 'Contact'],
    ['/notices', 'Notices'],
    ['/study-materials', 'Study Materials'],
    ['/privacy', 'Privacy'],
    ['/terms', 'Terms'],
    ['/student-login', 'Student Login'],
    ['/staff-login', 'Staff Login'],
    ['/staff-signup', 'Staff Signup'],
    ['/admin-login', 'Admin Login'],
  ];
  
  for (const [path, name] of pages) {
    await auditPage(base + path, name);
  }
}

main();