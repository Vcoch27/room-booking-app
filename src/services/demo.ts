import AsyncStorage from "@react-native-async-storage/async-storage";
import * as Crypto from "expo-crypto";
import { Booking, Session, lockId, validateIntent } from "../domain/model";
import { seedRooms } from "../domain/rooms";
import { Repository } from "./repository";

// Single-process educational adapter. Cross-device correctness belongs to Firebase.
export function createDemoRepository(): Repository {
  let session: Session | null = null;
  let records: Booking[] = [];
  const listeners = new Set<() => void>();
  const sessions = new Set<(s: Session | null) => void>();
  const ready = AsyncStorage.getItem("studyspace-demo-bookings-v1")
    .then((raw) => {
      if (raw) records = JSON.parse(raw);
    })
    .catch(() => {
      records = [];
    });
  const emit = () => listeners.forEach((fn) => fn());
  const subscribe = (fn: () => void) => {
    listeners.add(fn);
    void ready.then(() => {
      if (listeners.has(fn)) fn();
    });
    return () => {
      listeners.delete(fn);
    };
  };
  let queue: Promise<unknown> = ready;
  const atomic = <T>(fn: () => Promise<T>): Promise<T> => {
    const next = queue.then(fn);
    queue = next.catch(() => {});
    return next;
  };
  return {
    mode: "demo",
    observeSession(next) {
      sessions.add(next);
      next(session);
      return () => {
        sessions.delete(next);
      };
    },
    async login(email) {
      session = {
        uid: email.toLowerCase().trim(),
        email: email.toLowerCase().trim(),
      };
      sessions.forEach((fn) => fn(session));
    },
    async logout() {
      session = null;
      sessions.forEach((fn) => fn(null));
    },
    rooms(next) {
      return subscribe(() => next({ data: seedRooms, stale: false }));
    },
    bookings(uid, next) {
      return subscribe(() =>
        next({
          data: records
            .filter((b) => b.userId === uid)
            .sort((a, b) => b.createdAt - a.createdAt),
          stale: false,
        }),
      );
    },
    availability(roomId, date, next) {
      return subscribe(() =>
        next({
          data: records
            .filter(
              (b) =>
                b.roomId === roomId &&
                b.date === date &&
                b.status === "CONFIRMED",
            )
            .map((b) => ({ roomId, date, slotId: b.slotId, bookingId: b.id })),
          stale: false,
        }),
      );
    },
    create(intent) {
      const user = session;
      return atomic(async () => {
        if (!user) throw new Error("Vui lòng đăng nhập.");
        const id = `${user.uid}__${intent.idempotencyKey}`;
        const existing = records.find((b) => b.id === id);
        if (existing) {
          if (
            existing.roomId !== intent.roomId ||
            existing.date !== intent.date ||
            existing.slotId !== intent.slotId
          )
            throw new Error("Mã yêu cầu đã dùng cho lịch khác.");
          return existing;
        }
        const room = seedRooms.find((r) => r.id === intent.roomId);
        const times = validateIntent(
          intent,
          room,
          records.filter((b) => b.userId === user.uid),
        );
        if (
          records.some(
            (b) =>
              b.status === "CONFIRMED" &&
              lockId(b.roomId, b.date, b.slotId) ===
                lockId(intent.roomId, intent.date, intent.slotId),
          )
        )
          throw new Error("Khung giờ vừa được đặt. Hãy chọn khung giờ khác.");
        const booking: Booking = {
          id,
          userId: user.uid,
          roomId: intent.roomId,
          roomName: room!.name,
          date: intent.date,
          slotId: intent.slotId,
          ...times,
          status: "CONFIRMED",
          passToken: Crypto.randomUUID(),
          createdAt: Date.now(),
        };
        const updated = [...records, booking];
        await AsyncStorage.setItem(
          "studyspace-demo-bookings-v1",
          JSON.stringify(updated),
        );
        records = updated;
        emit();
        return booking;
      });
    },
    cancel(id) {
      const user = session;
      return atomic(async () => {
        const booking = records.find((b) => b.id === id);
        if (!booking || booking.userId !== user?.uid)
          throw new Error("Không có quyền hủy lịch đặt này.");
        if (booking.status === "CANCELLED") return;
        if (booking.startAt <= Date.now())
          throw new Error("Không thể hủy lịch đã bắt đầu.");
        const updated = records.map((b) =>
          b.id === id ? { ...b, status: "CANCELLED" as const } : b,
        );
        await AsyncStorage.setItem(
          "studyspace-demo-bookings-v1",
          JSON.stringify(updated),
        );
        records = updated;
        emit();
      });
    },
  };
}
