import * as admin from 'firebase-admin';

process.env.FIREBASE_AUTH_EMULATOR_HOST = '127.0.0.1:9099';
admin.initializeApp({ projectId: 'odoo-hackathon-33128' });

async function makeAdmin(email: string) {
  try {
    const user = await admin.auth().getUserByEmail(email);
    await admin.auth().setCustomUserClaims(user.uid, { role: 'admin' });
    console.log(`Successfully made ${email} (${user.uid}) an admin`);
  } catch (e) {
    console.error('Failed to make admin:', e);
  }
}

makeAdmin(process.argv[2]);
