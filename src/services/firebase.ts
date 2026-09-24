import { initializeApp } from "firebase/app";
import {
  initializeAuth,
  onAuthStateChanged,
  signInWithEmailAndPassword,
  createUserWithEmailAndPassword,
  signOut,
  connectAuthEmulator,
} from "firebase/auth";
import { authPersistence } from "./persistence";
import { signInWithGoogle } from "./googleAuth";
import {
  getFirestore,
  collection,
  doc,
  query,
  where,
  onSnapshot,
  runTransaction,
  setDoc,
  deleteDoc,
  connectFirestoreEmulator,
} from "firebase/firestore";
import * as Crypto from "expo-crypto";
import {
  Booking,
  BookingIntent,
  Room,
  SlotLock,
  lockId,
  slotTimes,
} from "../domain/model";
import { Repository, Snapshot } from "./repository";

export function formatFirebaseError(error: unknown): string {
  if (!error) return "Đã có lỗi xảy ra. Vui lòng thử lại.";
  const msg = error instanceof Error ? error.message : String(error);
  if (msg.includes("BOOKING_CONFLICT")) {
    return "Khung giờ vừa có người đặt trước. Hãy chọn khung giờ khác.";
  }
  if (
    msg.includes("auth/invalid-credential") ||
    msg.includes("auth/wrong-password") ||
    msg.includes("auth/user-not-found")
  ) {
    return "Email hoặc mật khẩu không chính xác.";
  }
  if (msg.includes("auth/email-already-in-use")) {
    return "Email này đã được đăng ký. Vui lòng đăng nhập.";
  }
  if (msg.includes("auth/weak-password")) {
    return "Mật khẩu cần ít nhất 6 ký tự.";
  }
  if (msg.includes("auth/invalid-email")) {
    return "Địa chỉ email không đúng định dạng.";
  }
  if (
    msg.includes("auth/popup-closed-by-user") ||
    msg.includes("GOOGLE_CANCELLED")
  ) {
    return "Bạn đã đóng cửa sổ đăng nhập Google.";
  }
  if (msg.includes("auth/account-exists-with-different-credential")) {
    return "Email này đã dùng phương thức đăng nhập khác. Hãy đăng nhập bằng email trước.";
  }
  if (msg.includes("auth/operation-not-allowed")) {
    return "Đăng nhập Google chưa được bật trong Firebase Authentication.";
  }
  if (msg.includes("DEVELOPER_ERROR")) {
    return "Cấu hình Google Sign-In chưa khớp chữ ký ứng dụng Android.";
  }
  if (
    msg.includes("auth/network-request-failed") ||
    msg.includes("unavailable")
  ) {
    return "Không có kết nối mạng. Vui lòng kiểm tra lại đường truyền.";
  }
  if (msg.includes("permission-denied")) {
    return "Bạn không có quyền thực hiện thao tác này.";
  }
  return msg;
}

export function createFirebaseRepository(): Repository {
  const config = {
    apiKey: process.env.EXPO_PUBLIC_FIREBASE_API_KEY,
    authDomain: process.env.EXPO_PUBLIC_FIREBASE_AUTH_DOMAIN,
    projectId: process.env.EXPO_PUBLIC_FIREBASE_PROJECT_ID,
    appId: process.env.EXPO_PUBLIC_FIREBASE_APP_ID,
  };
  if (Object.values(config).some((v) => !v))
    throw new Error(
      "Thiếu cấu hình Firebase. Kiểm tra .env hoặc chọn EXPO_PUBLIC_BACKEND=demo.",
    );
  const app = initializeApp(config);
  const auth = initializeAuth(app, { persistence: authPersistence });
  const db = getFirestore(app);

  if (process.env.EXPO_PUBLIC_USE_EMULATORS === "true") {
    const host = process.env.EXPO_PUBLIC_EMULATOR_HOST || "127.0.0.1";
    connectAuthEmulator(auth, `http://${host}:9099`, { disableWarnings: true });
    connectFirestoreEmulator(db, host, 8080);
  }

  const subscribe = <T>(
    q: ReturnType<typeof query>,
    next: (s: Snapshot<T[]>) => void,
    error: (e: Error) => void,
  ) =>
    onSnapshot(
      q,
      { includeMetadataChanges: true },
      (s) =>
        next({
          data: s.docs.map(
            (d) =>
              ({ ...(d.data() as Record<string, unknown>), id: d.id }) as T,
          ),
          stale: s.metadata.fromCache,
        }),
      (e) => error(new Error(formatFirebaseError(e))),
    );

  return {
    mode: "firebase",
    observeSession(next) {
      return onAuthStateChanged(auth, (user) =>
        next(user ? { uid: user.uid, email: user.email || "" } : null),
      );
    },
    async login(email, password, register) {
      try {
        await (
          register ? createUserWithEmailAndPassword : signInWithEmailAndPassword
        )(auth, email.trim(), password);
      } catch (e) {
        throw new Error(formatFirebaseError(e));
      }
    },
    async loginWithGoogle() {
      try {
        await signInWithGoogle(auth);
      } catch (e) {
        throw new Error(formatFirebaseError(e));
      }
    },
    async logout() {
      await signOut(auth);
    },
    rooms(next, error) {
      return subscribe<Room>(query(collection(db, "rooms")), next, error);
    },
    bookings(uid, next, error) {
      return subscribe<Booking>(
        query(collection(db, "bookings"), where("userId", "==", uid)),
        next,
        error,
      );
    },
    availability(roomId, date, next, error) {
      return subscribe<SlotLock>(
        query(
          collection(db, "roomSlots"),
          where("roomId", "==", roomId),
          where("date", "==", date),
        ),
        next,
        error,
      );
    },
    async create(intent) {
      const user = auth.currentUser;
      if (!user) throw new Error("Vui lòng đăng nhập để đặt phòng.");
      const bookingId = `${user.uid}__${intent.idempotencyKey}`;
      const slotKey = lockId(intent.roomId, intent.date, intent.slotId);
      const slotRef = doc(db, "roomSlots", slotKey);
      const bookingRef = doc(db, "bookings", bookingId);
      const roomRef = doc(db, "rooms", intent.roomId);

      try {
        return await runTransaction(db, async (tx) => {
          // 1. Kiểm tra tính idempotent: nếu đã có booking này rồi thì trả về luôn
          const existingBooking = await tx.get(bookingRef);
          if (existingBooking.exists()) {
            const previous = existingBooking.data() as Booking;
            if (
              previous.roomId !== intent.roomId ||
              previous.date !== intent.date ||
              previous.slotId !== intent.slotId
            ) {
              throw new Error("Mã yêu cầu đã dùng cho lịch khác.");
            }
            return previous;
          }

          // 2. Đọc khóa vị trí phòng (deterministic slot lock)
          const slotDoc = await tx.get(slotRef);
          if (slotDoc.exists()) {
            throw new Error(
              "BOOKING_CONFLICT: Khung giờ vừa có người đặt. Hãy chọn khung giờ khác.",
            );
          }

          // 3. Đọc dữ liệu phòng
          const roomDoc = await tx.get(roomRef);
          if (!roomDoc.exists() || !roomDoc.data().active) {
            throw new Error("Phòng hiện không nhận đặt chỗ.");
          }

          // 4. Kiểm tra thời gian bắt đầu
          const times = slotTimes(intent.date, intent.slotId);
          if (times.startAt <= Date.now()) {
            throw new Error("Khung giờ đã bắt đầu. Hãy chọn giờ khác.");
          }

          const passToken = Crypto.randomUUID();
          const booking: Booking = {
            id: bookingId,
            userId: user.uid,
            roomId: intent.roomId,
            roomName: roomDoc.get("name") || intent.roomId.toUpperCase(),
            date: intent.date,
            slotId: intent.slotId,
            ...times,
            status: "CONFIRMED",
            passToken,
            createdAt: Date.now(),
          };

          // 5. Ghi đồng thời booking và slot lock atomic
          tx.set(bookingRef, booking);
          tx.set(slotRef, {
            roomId: intent.roomId,
            date: intent.date,
            slotId: intent.slotId,
            bookingId,
            createdAt: Date.now(),
          });

          return booking;
        });
      } catch (e) {
        throw new Error(formatFirebaseError(e));
      }
    },
    async cancel(id) {
      const user = auth.currentUser;
      if (!user) throw new Error("Vui lòng đăng nhập.");
      const bookingRef = doc(db, "bookings", id);

      try {
        await runTransaction(db, async (tx) => {
          const bookingDoc = await tx.get(bookingRef);
          if (!bookingDoc.exists())
            throw new Error("Không tìm thấy thông tin lịch đặt.");
          const booking = bookingDoc.data() as Booking;
          if (booking.userId !== user.uid)
            throw new Error("Không có quyền hủy lịch đặt này.");
          if (booking.status === "CANCELLED") return;
          if (booking.startAt <= Date.now())
            throw new Error("Không thể hủy lịch đã bắt đầu.");

          const slotKey = lockId(booking.roomId, booking.date, booking.slotId);
          const slotRef = doc(db, "roomSlots", slotKey);
          const slotDoc = await tx.get(slotRef);
          if (slotDoc.exists() && slotDoc.data().bookingId === id) {
            tx.delete(slotRef);
          }
          tx.update(bookingRef, {
            status: "CANCELLED",
            cancelledAt: Date.now(),
          });
        });
      } catch (e) {
        throw new Error(formatFirebaseError(e));
      }
    },
    async checkIn(id) {
      const user = auth.currentUser;
      if (!user) throw new Error("Vui lòng đăng nhập.");
      const bookingRef = doc(db, "bookings", id);
      try {
        await runTransaction(db, async (tx) => {
          const bookingDoc = await tx.get(bookingRef);
          if (!bookingDoc.exists())
            throw new Error("Không tìm thấy thông tin lịch đặt.");
          const booking = bookingDoc.data() as Booking;
          if (booking.userId !== user.uid)
            throw new Error("Không có quyền check-in cho lịch đặt này.");
          if (booking.status !== "CONFIRMED")
            throw new Error("Chỉ có thể check-in cho lịch đã xác nhận.");
          const now = Date.now();
          if (now < booking.startAt - 15 * 60_000) {
            throw new Error(
              "Chưa đến giờ check-in (mở trước giờ bắt đầu 15 phút).",
            );
          }
          if (now > booking.endAt) throw new Error("Lịch đặt đã kết thúc.");
          tx.update(bookingRef, {
            status: "CHECKED_IN",
            checkedInAt: now,
          });
        });
      } catch (e) {
        throw new Error(formatFirebaseError(e));
      }
    },
    async endEarly(id) {
      const user = auth.currentUser;
      if (!user) throw new Error("Vui lòng đăng nhập.");
      const bookingRef = doc(db, "bookings", id);
      try {
        await runTransaction(db, async (tx) => {
          const bookingDoc = await tx.get(bookingRef);
          if (!bookingDoc.exists())
            throw new Error("Không tìm thấy thông tin lịch đặt.");
          const booking = bookingDoc.data() as Booking;
          if (booking.userId !== user.uid)
            throw new Error("Không có quyền kết thúc lịch đặt này.");
          if (booking.status !== "CONFIRMED" && booking.status !== "CHECKED_IN")
            throw new Error("Lịch này không ở trạng thái đang sử dụng.");

          const slotKey = lockId(booking.roomId, booking.date, booking.slotId);
          const slotRef = doc(db, "roomSlots", slotKey);
          const slotDoc = await tx.get(slotRef);
          if (slotDoc.exists() && slotDoc.data().bookingId === id) {
            tx.delete(slotRef);
          }
          tx.update(bookingRef, {
            status: "COMPLETED",
            endedAt: Date.now(),
          });
        });
      } catch (e) {
        throw new Error(formatFirebaseError(e));
      }
    },
    async toggleFavorite(roomId, isFavorite) {
      const user = auth.currentUser;
      if (!user) return;
      try {
        const favRef = doc(db, `users/${user.uid}/favorites`, roomId);
        if (isFavorite) {
          await setDoc(favRef, { roomId, addedAt: Date.now() });
        } else {
          await deleteDoc(favRef);
        }
      } catch {
        // silent fail on non-critical favorite sync
      }
    },
  };
}
