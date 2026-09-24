export type Equipment =
  "Wi-Fi" | "Máy chiếu" | "Bảng trắng" | "Máy tính" | "Điều hòa";
export type Room = {
  id: string;
  name: string;
  building: string;
  floor: number;
  capacity: number;
  kind: "study" | "lab";
  equipment: Equipment[];
  description: string;
  active: boolean;
  imageUrl?: string;
  imageUrls?: string[];
  imageKey?: string;
};
export type Session = { uid: string; email: string };
export type Booking = {
  id: string;
  userId: string;
  roomId: string;
  roomName: string;
  date: string;
  slotId: string;
  startAt: number;
  endAt: number;
  status: "CONFIRMED" | "CANCELLED" | "CHECKED_IN" | "COMPLETED";
  passToken: string;
  createdAt: number;
  checkedInAt?: number;
  endedAt?: number;
};
export type BookingIntent = {
  roomId: string;
  date: string;
  slotId: string;
  idempotencyKey: string;
};
export type SlotLock = {
  roomId: string;
  date: string;
  slotId: string;
  bookingId: string;
  userId?: string;
  createdAt?: number;
};
export type Filters = {
  search: string;
  building: string;
  capacity: number;
  equipment: Equipment[];
};
export const EMPTY_FILTERS: Filters = {
  search: "",
  building: "",
  capacity: 0,
  equipment: [],
};
export const POLICY = {
  daysAhead: 7,
  maxUpcoming: 3,
  reminderMinutes: 15,
  timezone: "Asia/Ho_Chi_Minh",
};
export const SLOTS = [
  { id: "0730_0930", start: "07:30", end: "09:30" },
  { id: "0930_1130", start: "09:30", end: "11:30" },
  { id: "1330_1530", start: "13:30", end: "15:30" },
  { id: "1530_1730", start: "15:30", end: "17:30" },
];
export function campusDate(now = Date.now()) {
  return new Date(now + 7 * 3600_000).toISOString().slice(0, 10);
}
export function bookingDays(now = Date.now()) {
  const today = campusDate(now);
  return Array.from({ length: POLICY.daysAhead }, (_, i) =>
    new Date(Date.parse(today + "T00:00:00Z") + i * 86400_000)
      .toISOString()
      .slice(0, 10),
  );
}
export function slotTimes(date: string, slotId: string) {
  const slot = SLOTS.find((s) => s.id === slotId);
  if (!slot || !/^\d{4}-\d{2}-\d{2}$/.test(date))
    throw new Error("Khung giờ không hợp lệ.");
  return {
    startAt: Date.parse(`${date}T${slot.start}:00+07:00`),
    endAt: Date.parse(`${date}T${slot.end}:00+07:00`),
  };
}
export function validateIntent(
  intent: BookingIntent,
  room: Room | undefined,
  bookings: Booking[],
  now = Date.now(),
) {
  if (!room?.active) throw new Error("Phòng hiện không nhận đặt chỗ.");
  if (!bookingDays(now).includes(intent.date))
    throw new Error("Chỉ được đặt trong 7 ngày tới.");
  const times = slotTimes(intent.date, intent.slotId);
  if (times.startAt <= now)
    throw new Error("Khung giờ đã bắt đầu. Hãy chọn giờ khác.");
  const active = bookings.filter(
    (b) =>
      (b.status === "CONFIRMED" || b.status === "CHECKED_IN") && b.endAt > now,
  );
  if (active.length >= POLICY.maxUpcoming)
    throw new Error("Bạn đã có 3 lịch đặt sắp tới.");
  if (active.some((b) => b.startAt < times.endAt && b.endAt > times.startAt))
    throw new Error("Bạn đã có một lịch đặt trùng thời gian.");
  return times;
}
export const lockId = (roomId: string, date: string, slotId: string) =>
  `${roomId}__${date}__${slotId}`;
const normalize = (s: string) =>
  s
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .replace(/đ/g, "d")
    .toLowerCase();
export function filterRooms(rooms: Room[], filters: Filters) {
  return rooms.filter(
    (r) =>
      r.active &&
      normalize(`${r.name} ${r.building}`).includes(
        normalize(filters.search.trim()),
      ) &&
      (!filters.building || r.building === filters.building) &&
      r.capacity >= filters.capacity &&
      filters.equipment.every((e) => r.equipment.includes(e)),
  );
}
