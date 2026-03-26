import webpush from 'web-push';
import fs from 'fs';
import path from 'path';

const keysPath = path.resolve(process.cwd(), 'vapidKeys.json');
let vapidKeys = {};

// Auto-generate VAPID keys if they don't exist
if (fs.existsSync(keysPath)) {
  vapidKeys = JSON.parse(fs.readFileSync(keysPath, 'utf8'));
} else {
  vapidKeys = webpush.generateVAPIDKeys();
  fs.writeFileSync(keysPath, JSON.stringify(vapidKeys, null, 2), 'utf8');
  console.log('✅ Generated new VAPID keys for Web Push Notifications.');
}

webpush.setVapidDetails(
  'mailto:[EMAIL_ADDRESS]', 
  vapidKeys.publicKey,
  vapidKeys.privateKey
);

export { webpush, vapidKeys };
