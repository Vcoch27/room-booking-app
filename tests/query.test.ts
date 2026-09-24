import { describe, expect, it, vi } from "vitest";
import { firstSnapshot, Subscribe } from "../src/services/firstSnapshot";
import { filterRooms, EMPTY_FILTERS } from "../src/domain/model";
import { seedRooms } from "../src/domain/rooms";

describe("realtime Query adapter", () => {
  it("unsubscribes even when the demo source emits synchronously", async () => {
    const off = vi.fn();
    const value = { data: [1], stale: false };
    expect(
      await firstSnapshot((next) => {
        next(value);
        return off;
      }, new AbortController().signal),
    ).toEqual(value);
    expect(off).toHaveBeenCalledTimes(1);
  });
  it("aborts pending requests and ignores late snapshots", async () => {
    const off = vi.fn();
    let emit: Parameters<Subscribe<number>>[0] = () => {};
    const controller = new AbortController();
    const request = firstSnapshot<number>((next) => {
      emit = next;
      return off;
    }, controller.signal);
    controller.abort();
    emit({ data: 42, stale: false });
    await expect(request).rejects.toThrow("cancelled");
    expect(off).toHaveBeenCalledTimes(1);
  });
  it("propagates permission errors and releases listeners", async () => {
    const off = vi.fn();
    await expect(
      firstSnapshot((_, fail) => {
        fail(new Error("permission-denied"));
        return off;
      }, new AbortController().signal),
    ).rejects.toThrow("permission-denied");
    expect(off).toHaveBeenCalledTimes(1);
  });
  it("does not subscribe to an already cancelled request", async () => {
    const subscribe = vi.fn();
    const controller = new AbortController();
    controller.abort();
    await expect(firstSnapshot(subscribe, controller.signal)).rejects.toThrow(
      "cancelled",
    );
    expect(subscribe).not.toHaveBeenCalled();
  });
});

it("searches equipment without accents while combining capacity and building filters", () => {
  const rooms = filterRooms(seedRooms, {
    ...EMPTY_FILTERS,
    search: "may chieu",
    capacity: 8,
  });
  expect(rooms.length).toBeGreaterThan(0);
  expect(
    rooms.every(
      (room) => room.capacity >= 8 && room.equipment.includes("Máy chiếu"),
    ),
  ).toBe(true);
});
