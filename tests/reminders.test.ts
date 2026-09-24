import { beforeEach, expect, it, vi } from "vitest";
const mocks = vi.hoisted(() => ({
  storage: new Map<string, string>(),
  permission: vi.fn(),
  schedule: vi.fn(),
  cancel: vi.fn(),
  scheduled: vi.fn(),
}));
vi.mock("react-native", () => ({ Platform: { OS: "android" } }));
vi.mock("@react-native-async-storage/async-storage", () => ({
  default: {
    getItem: async (key: string) => mocks.storage.get(key) || null,
    setItem: async (key: string, value: string) => {
      mocks.storage.set(key, value);
    },
    removeItem: async (key: string) => {
      mocks.storage.delete(key);
    },
  },
}));
vi.mock("expo-notifications", () => ({
  setNotificationHandler: vi.fn(),
  setNotificationChannelAsync: vi.fn(),
  AndroidImportance: { HIGH: 4 },
  SchedulableTriggerInputTypes: { DATE: "date" },
  requestPermissionsAsync: mocks.permission,
  scheduleNotificationAsync: mocks.schedule,
  cancelScheduledNotificationAsync: mocks.cancel,
  getAllScheduledNotificationsAsync: mocks.scheduled,
}));
import { scheduleReminder, cancelReminder } from "../src/services/reminders";
import { Booking } from "../src/domain/model";
const booking = () =>
  ({
    id: "reminder-test",
    roomName: "A301",
    startAt: Date.now() + 3600_000,
    status: "CONFIRMED",
  }) as Booking;
beforeEach(() => {
  vi.clearAllMocks();
  mocks.storage.clear();
  mocks.permission.mockResolvedValue({ granted: true });
  mocks.schedule.mockResolvedValue("notification-1");
  mocks.scheduled.mockResolvedValue([{ identifier: "notification-1" }]);
});
it("schedules exactly 15 minutes before start and avoids duplicates", async () => {
  const b = booking();
  await scheduleReminder(b);
  await scheduleReminder(b);
  expect(mocks.schedule).toHaveBeenCalledTimes(1);
  expect(mocks.schedule.mock.calls[0][0].trigger.date.getTime()).toBe(
    b.startAt - 900000,
  );
});
it("does not schedule when permission is denied", async () => {
  mocks.permission.mockResolvedValue({ granted: false });
  expect(await scheduleReminder(booking())).toMatch(/Chưa có quyền/);
  expect(mocks.schedule).not.toHaveBeenCalled();
});
it("cancellation queued behind scheduling leaves no reminder", async () => {
  await Promise.all([
    scheduleReminder(booking()),
    cancelReminder("reminder-test"),
  ]);
  expect(mocks.cancel).toHaveBeenCalledWith("notification-1");
  expect(mocks.storage.size).toBe(0);
});
it("does not create a reminder whose time has passed", async () => {
  await scheduleReminder({ ...booking(), startAt: Date.now() + 600000 });
  expect(mocks.schedule).not.toHaveBeenCalled();
});
