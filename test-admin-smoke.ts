import fetch from 'node-fetch';

const base = process.env.BASE_URL || 'http://localhost:3100';

async function main() {
  const login = await fetch(`${base}/api/auth/login`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      email: 'kidsislandschoolaligarh@gmail.com',
      password: '@KIBA2001@',
    }),
  });
  const body = await login.json();
  console.log('login', login.status, JSON.stringify(body).slice(0, 200));
  const setCookie = login.headers.raw()['set-cookie'];
  const cookie = (setCookie ?? []).map((c) => c.split(';')[0]).join('; ');

  const paths = [
    '/admin',
    '/admin/content',
    '/admin/content/site.hero',
    '/admin/pages',
    '/admin/seo',
    '/admin/settings',
    '/admin/settings?tab=footer',
    '/admin/audit-log',
  ];

  for (const path of paths) {
    const res = await fetch(`${base}${path}`, { headers: { cookie }, redirect: 'manual' });
    const text = await res.text();
    const bad = /Application error|Internal Server Error|Unhandled Runtime Error/i.test(text);
    console.log(path, res.status, res.headers.get('location') ?? '', bad ? 'RUNTIME-ERROR' : 'ok');
  }
}

main().catch((error) => {
  console.error(error);
  process.exitCode = 1;
});
