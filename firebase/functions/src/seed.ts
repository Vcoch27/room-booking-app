import { initializeApp } from "firebase-admin/app";
import { getFirestore } from "firebase-admin/firestore";
import { seedRooms } from "../../../src/domain/rooms";
if (
  !process.env.FIRESTORE_EMULATOR_HOST &&
  process.env.ALLOW_REMOTE_SEED !== "true"
)
  throw new Error(
    "Set FIRESTORE_EMULATOR_HOST, or explicitly set ALLOW_REMOTE_SEED=true for your development project.",
  );
initializeApp({ projectId: process.env.GCLOUD_PROJECT || "demo-studyspace" });
async function main() {
  const db = getFirestore();
  const batch = db.batch();
  for (const room of seedRooms) batch.set(db.doc(`rooms/${room.id}`), room);
  await batch.commit();
  console.log(`Seeded ${seedRooms.length} rooms.`);
}
void main();
