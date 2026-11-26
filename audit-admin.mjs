import fetch from 'node-fetch';

async function auditAdmin() {
  const base = 'http://localhost:3000';
  const pages = [
    ['/admin', 'Admin Dashboard'],
    ['/admin/admissions', 'Admin Admissions'],
    ['/admin/inquiries', 'Admin Inquiries'],
    ['/admin/faculty', 'Admin Faculty'],
    ['/admin/materials', 'Admin Materials'],
    ['/admin/gallery', 'Admin Gallery'],
    ['/admin/testimonials', 'Admin Testimonials'],
    ['/admin/notices', 'Admin Notices'],
    ['/admin/faqs', 'Admin FAQs'],
    ['/admin/account', 'Admin Account'],
    ['/dashboard', 'Staff Dashboard'],
    ['/dashboard/profile', 'Staff Profile'],
    ['/dashboard/materials', 'Staff Materials'],
    ['/dashboard/materials/new', 'Staff New Material'],
  ];
  
  for (const [path, name] of pages) {
    try {
      const res = await fetch(base + path);
      const html = await res.text();
      console.log('\n=== ' + name + ' (' + base + path + ') ===');
      console.log('Status: ' + res.status);
      if (html.includes('Sign in') || html.includes('Login') || html.includes('login') || res.status === 307 || res.status === 302 || html.includes('redirect')) {
        console.log('REDIRECTS TO LOGIN / REQUIRES AUTH');
      } else {
        const linkMatches = html.match(/href="([^"]+)"/g) || [];
        const links = [...new Set(linkMatches.map(l => l.match(/href="([^"]+)"/)[1]))];
        console.log('Links (' + links.length + '):');
        links.forEach(l => console.log('  ' + l));
      }
    } catch (e) {
      console.log('\n=== ' + name + ' ===');
      console.log('ERROR: ' + e.message);
    }
  }
}

auditAdmin();