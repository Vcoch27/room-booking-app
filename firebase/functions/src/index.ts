import { initializeApp } from "firebase-admin/app";
import { getFirestore } from "firebase-admin/firestore";
import { onCall, HttpsError } from "firebase-functions/v2/https";
import { createHash, randomUUID } from "node:crypto";
import {
  Booking,
  BookingIntent,
  Room,
  lockId,
  validateIntent,
} from "../../../src/domain/model";

initializeApp();
const db = getFirestore();
const options = { region: "asia-southeast1" };
function identifier(value: unknown): value is string {
  return typeof value === "string" && /^[a-zA-Z0-9_-]{1,100}$/.test(value);
}

export const createBooking = onCall(options, async (request) => {
  const uid = request.auth?.uid;
  if (!uid) throw new HttpsError("unauthenticated", "Vui lòng đăng nhập.");
  const data = request.data as BookingIntent;
  if (
    !data ||
    !identifier(data.roomId) ||
    !identifier(data.idempotencyKey) ||
    !identifier(data.slotId) ||
    typeof data.date !== "string"
  )
    throw new HttpsError("invalid-argument", "Yêu cầu không hợp lệ.");
  const id = createHash("sha256")
    .update(`${uid}:${data.idempotencyKey}`)
    .digest("hex");
  const bookingRef = db.doc(`bookings/${id}`);
  // A per-user guard serializes requests for DIFFERENT rooms too: prevents limit/overlap races.
  const guardRef = db.doc(`userGuards/${uid}`);
  return db.runTransaction(async (tx) => {
    const existing = await tx.get(bookingRef);
    if (existing.exists) {
      const previous = existing.data() as Booking;
      if (
        previous.roomId !== data.roomId ||
        previous.date !== data.date ||
        previous.slotId !== data.slotId
      )
        throw new HttpsError(
          "invalid-argument",
          "Mã yêu cầu đã dùng cho lịch khác.",
        );
      return previous;
    }
    await tx.get(guardRef);
    const roomDoc = await tx.get(db.doc(`rooms/${data.roomId}`));
    const current = await tx.get(
      db
        .collection("bookings")
        .where("userId", "==", uid)
        .where("status", "==", "CONFIRMED"),
    );
    let times;
    try {
      times = validateIntent(
        data,
        roomDoc.data() as Room | undefined,
        current.docs.map((d) => d.data() as Booking),
      );
    } catch (e) {
      throw new HttpsError("failed-precondition", (e as Error).message);
    }
    const slotRef = db.doc(
      `slotLocks/${lockId(data.roomId, data.date, data.slotId)}`,
    );
    const slot = await tx.get(slotRef);
    if (slot.exists)
      throw new HttpsError(
        "already-exists",
        "Khung giờ vừa được đặt. Hãy chọn khung giờ khác.",
      );
    const booking: Booking = {
      id,
      userId: uid,
      roomId: data.roomId,
      roomName: roomDoc.get("name"),
      date: data.date,
      slotId: data.slotId,
      ...times,
      status: "CONFIRMED",
      passToken: randomUUID(),
      createdAt: Date.now(),
    };
    tx.create(bookingRef, booking);
    // Public availability never includes user identity or the QR secret.
    tx.create(slotRef, {
      roomId: data.roomId,
      date: data.date,
      slotId: data.slotId,
      bookingId: id,
    });
    tx.set(guardRef, { updatedAt: Date.now() });
    tx.create(db.collection("bookingEvents").doc(), {
      bookingId: id,
      userId: uid,
      action: "CREATED",
      at: Date.now(),
    });
    return booking;
  });
});

export const cancelBooking = onCall(options, async (request) => {
  const uid = request.auth?.uid;
  if (!uid) throw new HttpsError("unauthenticated", "Vui lòng đăng nhập.");
  if (!identifier(request.data?.id))
    throw new HttpsError("invalid-argument", "Mã lịch không hợp lệ.");
  await db.runTransaction(async (tx) => {
    const ref = db.doc(`bookings/${request.data.id}`);
    const snapshot = await tx.get(ref);
    const booking = snapshot.data() as Booking | undefined;
    if (!booking || booking.userId !== uid)
      throw new HttpsError(
        "permission-denied",
        "Không có quyền hủy lịch đặt này.",
      );
    if (booking.status === "CANCELLED") return;
    if (booking.startAt <= Date.now())
      throw new HttpsError(
        "failed-precondition",
        "Không thể hủy lịch đã bắt đầu.",
      );
    const slotRef = db.doc(
      `slotLocks/${lockId(booking.roomId, booking.date, booking.slotId)}`,
    );
    const slot = await tx.get(slotRef);
    if (slot.get("bookingId") === booking.id) tx.delete(slotRef);
    tx.update(ref, { status: "CANCELLED" });
    tx.set(db.doc(`userGuards/${uid}`), { updatedAt: Date.now() });
    tx.create(db.collection("bookingEvents").doc(), {
      bookingId: booking.id,
      userId: uid,
      action: "CANCELLED",
      at: Date.now(),
    });
  });
  return { ok: true };
});
