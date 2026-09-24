// Add illustration galleries to existing rooms using the signed-in Firebase CLI.
// Only photo fields are written; existing galleries are preserved.
const fs = require('node:fs');
const auth = require('firebase-tools/lib/auth');
const api = require('firebase-tools/lib/apiv2');
const project = 'vcoch27-study-space';
const samples = [
  'https://images.unsplash.com/photo-1497366216548-37526070297c?w=1200&q=85',
  'https://images.unsplash.com/photo-1497215842964-222b430dc094?w=1200&q=85',
  'https://images.unsplash.com/photo-1524758631624-e2822e304c36?w=1200&q=85',
];

async function main() {
  for (const url of samples) {
    const response = await fetch(url);
    if (!response.ok || !response.headers.get('content-type')?.startsWith('image/')) throw new Error('Sample photo unavailable: ' + response.status);
    await response.arrayBuffer();
  }
  const account = auth.getProjectDefaultAccount(process.cwd());
  if (!account?.tokens?.refresh_token) throw new Error('Run firebase login first.');
  auth.setRefreshToken(account.tokens.refresh_token);
  const token = await api.getAccessToken();
  const headers = { Authorization: `Bearer ${token}`, 'Content-Type': 'application/json' };
  const base = `https://firestore.googleapis.com/v1/projects/${project}/databases/(default)/documents`;
  const rooms = [];
  let pageToken = '';
  do {
    const response = await fetch(`${base}/rooms?pageSize=100&pageToken=${encodeURIComponent(pageToken)}`, { headers });
    if (!response.ok) throw new Error('List rooms failed: ' + response.status);
    const page = await response.json();
    rooms.push(...(page.documents || []));
    pageToken = page.nextPageToken || '';
  } while (pageToken);
  fs.mkdirSync('artifacts', { recursive: true });
  fs.writeFileSync(`artifacts/room-photos-backup-${Date.now()}.json`, JSON.stringify(rooms, null, 2));
  for (const room of rooms) {
    const current = room.fields.imageUrls?.arrayValue?.values || [];
    if (current.length > 1) { console.log('Preserved gallery: ' + room.name.split('/').pop()); continue; }
    const cover = current[0]?.stringValue || room.fields.imageUrl?.stringValue;
    const urls = [...new Set([cover, ...samples].filter(Boolean))].slice(0, 3);
    const fields = {
      imageUrls: { arrayValue: { values: urls.map(stringValue => ({ stringValue })) } },
      imagesAreIllustrative: { booleanValue: true },
    };
    const url = `https://firestore.googleapis.com/v1/${room.name}?updateMask.fieldPaths=imageUrls&updateMask.fieldPaths=imagesAreIllustrative&currentDocument.updateTime=${encodeURIComponent(room.updateTime)}`;
    const updated = await fetch(url, { method: 'PATCH', headers, body: JSON.stringify({ fields }) });
    if (!updated.ok) throw new Error('Update failed: ' + updated.status);
    const verified = await (await fetch(`https://firestore.googleapis.com/v1/${room.name}`, { headers })).json();
    if (verified.fields?.imageUrls?.arrayValue?.values?.length !== 3) throw new Error('Verification failed');
    console.log(room.name.split('/').pop() + ': 3 photos verified');
  }
}
main().catch(error => { console.error(error.message); process.exitCode = 1; });
