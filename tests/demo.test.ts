import { beforeEach, expect, it, vi } from "vitest";
vi.mock("@react-native-async-storage/async-storage", () => ({
  default: { getItem: vi.fn(async () => null), setItem: vi.fn(async () => {}) },
}));
vi.mock("expo-crypto", () => ({ randomUUID: () => crypto.randomUUID() }));
import { createDemoRepository } from "../src/services/demo";
import { bookingDays } from "../src/domain/model";
beforeEach(() => vi.clearAllMocks());
const intent = () => ({
  roomId: "a301",
  date: bookingDays()[1],
  slotId: "0730_0930",
  idempotencyKey: "first",
});
it("serializes competing bookings and releases a cancelled slot", async () => {
  const repo = createDemoRepository();
  await repo.login("a@example.com", "", false);
  const results = await Promise.allSettled([
    repo.create(intent()),
    repo.create({ ...intent(), idempotencyKey: "second" }),
  ]);
  expect(results.filter((r) => r.status === "fulfilled")).toHaveLength(1);
  const booking = await repo.create(intent());
  await repo.cancel(booking.id);
  await expect(
    repo.create({ ...intent(), idempotencyKey: "third" }),
  ).resolves.toMatchObject({ status: "CONFIRMED" });
});
it("returns same booking on idempotent retry", async () => {
  const repo = createDemoRepository();
  await repo.login("a@example.com", "", false);
  const [a, b] = await Promise.all([
    repo.create(intent()),
    repo.create(intent()),
  ]);
  expect(a.id).toBe(b.id);
  expect(a.passToken).toBe(b.passToken);
});
it("rejects cancellation by another account", async () => {
  const repo = createDemoRepository();
  await repo.login("a@example.com", "", false);
  const b = await repo.create(intent());
  await repo.login("b@example.com", "", false);
  await expect(repo.cancel(b.id)).rejects.toThrow(/quyền/);
});
it("unsubscribes realtime listeners", async () => {
  const repo = createDemoRepository();
  const next = vi.fn();
  const off = repo.availability("a301", intent().date, next, () => {});
  await new Promise((resolve) => setTimeout(resolve, 0));
  const count = next.mock.calls.length;
  off();
  await repo.login("a@example.com", "", false);
  await repo.create(intent());
  expect(next).toHaveBeenCalledTimes(count);
});
