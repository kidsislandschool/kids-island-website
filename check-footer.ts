import fetch from 'node-fetch';

async function check() {
  const res = await fetch('https://kidsaligarh.com/');
  const html = await res.text();
  const footerMatch = html.match(/<footer[^>]*>([\s\S]*?)<\/footer>/i);
  if (footerMatch) {
    const footer = footerMatch[1];
    console.log('FOOTER HTML (first 5000 chars):');
    console.log(footer.substring(0, 5000));
  } else {
    console.log('No footer found');
  }
}

check().catch(console.error);