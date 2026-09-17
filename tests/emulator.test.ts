import { afterAll, beforeAll, describe, expect, it } from "vitest";
import { readFileSync } from "node:fs";
import {
  initializeTestEnvironment,
  assertFails,
  assertSucceeds,
  RulesTestEnvironment,
} from "@firebase/rules-unit-testing";
import { initializeApp, deleteApp, FirebaseApp } from "firebase/app";
import {
  getAuth,
  connectAuthEmulator,
  createUserWithEmailAndPassword,
} from "firebase/auth";
import {
  getFunctions,
  connectFunctionsEmulator,
  httpsCallable,
} from "firebase/functions";
import { doc, setDoc, getDoc, runTransaction } from "firebase/firestore";
import { Booking, BookingIntent, bookingDays } from "../src/domain/model";
import { seedRooms } from "../src/domain/rooms";
describe.skipIf(!process.env.FIRESTORE_EMULATOR_HOST)(
  "Firebase rules and transaction concurrency",
  () => {
    let env: RulesTestEnvironment;
    const apps: FirebaseApp[] = [];
    const clients: {
      uid: string;
      create: (data: BookingIntent) => Promise<Booking>;
      cancel: (id: string) => Promise<unknown>;
    }[] = [];
    beforeAll(async () => {
      env = await initializeTestEnvironment({
        projectId: "demo-studyspace",
        firestore: { rules: readFileSync("firebase/firestore.rules", "utf8") },
      });
      await env.clearFirestore();
      await env.withSecurityRulesDisabled(async (c) => {
        for (const room of seedRooms)
          await setDoc(doc(c.firestore(), "rooms", room.id), room);
      });
      for (let i = 0; i < 2; i++) {
        const app = initializeApp(
          { apiKey: "demo-key", projectId: "demo-studyspace" },
          `test-${i}`,
        );
        apps.push(app);
        const auth = getAuth(app);
        connectAuthEmulator(auth, "http://127.0.0.1:9099", {
          disableWarnings: true,
        });
        const user = await createUserWithEmailAndPassword(
          auth,
          `test-${i}-${Date.now()}@example.com`,
          "test-password",
        );
        const functions = getFunctions(app, "asia-southeast1");
        connectFunctionsEmulator(functions, "127.0.0.1", 5001);
        clients.push({
          uid: user.user.uid,
          create: async (data) =>
            (
              await httpsCallable<BookingIntent, Booking>(
                functions,
                "createBooking",
              )(data)
            ).data,
          cancel: (id) => httpsCallable(functions, "cancelBooking")({ id }),
        });
      }
    });
    afterAll(async () => {
      await Promise.all(apps.map(deleteApp));
      await env?.cleanup();
    });
    const intent = (
      roomId: string,
      key: string,
      day = 1,
      slotId = "0730_0930",
    ) => ({ roomId, date: bookingDays()[day], slotId, idempotencyKey: key });
    it("allows only one winner across two authenticated users", async () => {
      const results = await Promise.allSettled(
        clients.map((c, i) => c.create(intent("a301", `race-${i}`))),
      );
      expect(results.filter((r) => r.status === "fulfilled")).toHaveLength(1);
      const winnerIndex = results.findIndex((r) => r.status === "fulfilled");
      const winner = (results[winnerIndex] as PromiseFulfilledResult<Booking>)
        .value;
      const loser = clients[1 - winnerIndex];
      await expect(loser.cancel(winner.id)).rejects.toThrow();
      await assertFails(
        getDoc(
          doc(
            env.authenticatedContext(loser.uid).firestore(),
            "bookings",
            winner.id,
          ),
        ),
      );
      await assertSucceeds(
        getDoc(
          doc(
            env.authenticatedContext(winner.userId).firestore(),
            "bookings",
            winner.id,
          ),
        ),
      );
      expect(
        await clients[winnerIndex].create(
          intent("a301", `race-${winnerIndex}`),
        ),
      ).toEqual(winner);
      await clients[winnerIndex].cancel(winner.id);
      await clients[winnerIndex].cancel(winner.id);
      await expect(
        loser.create(intent("a301", "after-cancel")),
      ).resolves.toMatchObject({ status: "CONFIRMED" });
    });
    it("prevents same-user overlap across different rooms concurrently", async () => {
      const results = await Promise.allSettled([
        clients[0].create(intent("a302", "overlap-a", 2)),
        clients[0].create(intent("b201", "overlap-b", 2)),
      ]);
      expect(results.filter((r) => r.status === "fulfilled")).toHaveLength(1);
    });
    it("allows an owner to create and cancel an atomic client booking", async () => {
      const uid = clients[0].uid;
      const db = env.authenticatedContext(uid).firestore();
      const date = bookingDays()[4];
      const roomId = "b401";
      const slotId = "1530_1730";
      const bookingId = `${uid}__rules-direct`;
      const slotKey = `${roomId}__${date}__${slotId}`;
      const bookingRef = doc(db, "bookings", bookingId);
      const slotRef = doc(db, "roomSlots", slotKey);

      await assertSucceeds(
        runTransaction(db, async (tx) => {
          expect((await tx.get(bookingRef)).exists()).toBe(false);
          expect((await tx.get(slotRef)).exists()).toBe(false);
          const room = await tx.get(doc(db, "rooms", roomId));
          expect(room.exists()).toBe(true);
          const startAt = Date.now() + 86_400_000;
          tx.set(bookingRef, {
            id: bookingId,
            userId: uid,
            roomId,
            roomName: room.get("name"),
            date,
            slotId,
            startAt,
            endAt: startAt + 7_200_000,
            status: "CONFIRMED",
            passToken: "rules-test-pass-token",
            createdAt: Date.now(),
          });
          tx.set(slotRef, {
            roomId,
            date,
            slotId,
            bookingId,
            createdAt: Date.now(),
          });
        }),
      );

      await assertSucceeds(
        runTransaction(db, async (tx) => {
          expect((await tx.get(bookingRef)).exists()).toBe(true);
          expect((await tx.get(slotRef)).exists()).toBe(true);
          tx.delete(slotRef);
          tx.update(bookingRef, {
            status: "CANCELLED",
            cancelledAt: Date.now(),
          });
        }),
      );
    });
    it("rejects client writes, role escalation and unauthenticated reads", async () => {
      const db = env.authenticatedContext(clients[0].uid).firestore();
      for (const path of [
        "bookings/forged",
        "slotLocks/forged",
        "rooms/a301",
        `users/${clients[0].uid}`,
        `userGuards/${clients[0].uid}`,
      ])
        await assertFails(
          setDoc(doc(db, path), { role: "admin", status: "CONFIRMED" }),
        );
      await assertFails(
        getDoc(doc(env.unauthenticatedContext().firestore(), "rooms", "a301")),
      );
      await assertSucceeds(getDoc(doc(db, "rooms", "a301")));
    });
  },
);
