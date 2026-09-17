import { describe, expect, it } from "vitest";
import {
  Booking,
  EMPTY_FILTERS,
  bookingDays,
  campusDate,
  filterRooms,
  slotTimes,
  validateIntent,
} from "../src/domain/model";
import { seedRooms } from "../src/domain/rooms";
const now = Date.parse("2026-09-17T23:30:00+07:00");
const intent = {
  roomId: "a301",
  date: "2026-09-18",
  slotId: "0730_0930",
  idempotencyKey: "test",
};
describe("campus policy", () => {
  it("uses Vietnam calendar even when device timezone differs", () => {
    expect(campusDate(Date.parse("2026-09-17T18:00:00Z"))).toBe("2026-09-18");
    expect(bookingDays(now)).toHaveLength(7);
    expect(bookingDays(now)[6]).toBe("2026-09-23");
  });
  it("creates exactly two-hour slots in UTC+7", () => {
    const times = slotTimes("2026-09-18", "0730_0930");
    expect(times.startAt).toBe(Date.parse("2026-09-18T00:30:00Z"));
    expect(times.endAt - times.startAt).toBe(7200000);
  });
  it("rejects invalid, past and out-of-window slots", () => {
    expect(() => slotTimes(intent.date, "bad")).toThrow();
    expect(() =>
      validateIntent({ ...intent, date: "2026-09-17" }, seedRooms[0], [], now),
    ).toThrow(/bắt đầu/);
    expect(() =>
      validateIntent({ ...intent, date: "2026-09-24" }, seedRooms[0], [], now),
    ).toThrow(/7 ngày/);
  });
  it("rejects inactive rooms", () =>
    expect(() =>
      validateIntent(intent, { ...seedRooms[0], active: false }, [], now),
    ).toThrow(/không nhận/));
  it("prevents overlapping bookings but permits adjacent slots and ignores cancellations", () => {
    const b = {
      ...slotTimes(intent.date, intent.slotId),
      status: "CONFIRMED",
    } as Booking;
    expect(() => validateIntent(intent, seedRooms[0], [b], now)).toThrow(
      /trùng/,
    );
    expect(() =>
      validateIntent(
        { ...intent, slotId: "0930_1130" },
        seedRooms[0],
        [b],
        now,
      ),
    ).not.toThrow();
    expect(() =>
      validateIntent(
        intent,
        seedRooms[0],
        [{ ...b, status: "CANCELLED" }],
        now,
      ),
    ).not.toThrow();
  });
  it("enforces three active reservations", () => {
    const b = {
      ...slotTimes("2026-09-20", "0730_0930"),
      status: "CONFIRMED",
    } as Booking;
    expect(() => validateIntent(intent, seedRooms[0], [b, b, b], now)).toThrow(
      /3 lịch/,
    );
  });
  it("combines search, building, minimum capacity and all equipment", () => {
    expect(
      filterRooms(seedRooms, {
        ...EMPTY_FILTERS,
        search: "phong hoc",
        building: "Tòa A",
        capacity: 8,
        equipment: ["Máy chiếu"],
      }).map((r) => r.id),
    ).toEqual(["a301"]);
    expect(
      filterRooms(seedRooms, {
        ...EMPTY_FILTERS,
        equipment: ["Máy tính", "Máy chiếu"],
      }).map((r) => r.id),
    ).toEqual(["b201"]);
  });
});
