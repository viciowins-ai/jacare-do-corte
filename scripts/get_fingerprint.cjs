
const fs = require('fs');
const crypto = require('crypto');
const path = require('path');

const pemPath = path.resolve('./android-twa/upload_certificate_v5.pem');

try {
  const pem = fs.readFileSync(pemPath, 'utf8');
  // Remove headers and newlines to get the base64 body
  const base64 = pem
    .replace(/-----BEGIN CERTIFICATE-----/g, '')
    .replace(/-----END CERTIFICATE-----/g, '')
    .replace(/\s+/g, '');

  const buffer = Buffer.from(base64, 'base64');
  const hash = crypto.createHash('sha256').update(buffer).digest('hex');
  
  // Format as AA:BB:CC...
  const fingerprint = hash.toUpperCase().match(/.{1,2}/g).join(':');
  
  console.log('SHA-256 Fingerprint (Upload Key):');
  console.log(fingerprint);
} catch (err) {
  console.error('Error reading or processing certificate:', err);
}
