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
import {
  getFirestore,
  collection,
  query,
  where,
  onSnapshot,
  connectFirestoreEmulator,
} from "firebase/firestore";
import {
  getFunctions,
  httpsCallable,
  connectFunctionsEmulator,
} from "firebase/functions";
import { Booking, BookingIntent, Room, SlotLock } from "../domain/model";
import { Repository, Snapshot } from "./repository";

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
  const functions = getFunctions(app, "asia-southeast1");
  if (process.env.EXPO_PUBLIC_USE_EMULATORS === "true") {
    const host = process.env.EXPO_PUBLIC_EMULATOR_HOST || "127.0.0.1";
    connectAuthEmulator(auth, `http://${host}:9099`, { disableWarnings: true });
    connectFirestoreEmulator(db, host, 8080);
    connectFunctionsEmulator(functions, host, 5001);
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
      error,
    );
  return {
    mode: "firebase",
    observeSession(next) {
      return onAuthStateChanged(auth, (user) =>
        next(user ? { uid: user.uid, email: user.email || "" } : null),
      );
    },
    async login(email, password, register) {
      await (
        register ? createUserWithEmailAndPassword : signInWithEmailAndPassword
      )(auth, email.trim(), password);
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
          collection(db, "slotLocks"),
          where("roomId", "==", roomId),
          where("date", "==", date),
        ),
        next,
        error,
      );
    },
    async create(intent) {
      return (
        await httpsCallable<BookingIntent, Booking>(
          functions,
          "createBooking",
        )(intent)
      ).data;
    },
    async cancel(id) {
      await httpsCallable(functions, "cancelBooking")({ id });
    },
  };
}
