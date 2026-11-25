const fetch = require('node-fetch');

fetch('https://kidsaligarh.com/')
  .then(r => r.text())
  .then(html => {
    const footerMatch = html.match(/<footer[^>]*>([\s\S]*?)<\/footer>/i);
    if (footerMatch) {
      const footer = footerMatch[1];
      console.log('FOOTER HTML (first 5000 chars):');
      console.log(footer.substring(0, 5000));
    } else {
      console.log('No footer found');
    }
  }).catch(console.error);