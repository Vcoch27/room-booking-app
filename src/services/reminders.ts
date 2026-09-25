import { Platform } from "react-native";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { Booking } from "../domain/model";
const key = (id: string) => `reminder:${id}`;
const queues = new Map<string, Promise<unknown>>();
async function prepareNotifications() {
  const n = await import("expo-notifications");
  n.setNotificationHandler({
    handleNotification: async () => ({
      shouldShowBanner: true,
      shouldShowList: true,
      shouldPlaySound: true,
      shouldSetBadge: false,
    }),
  });
  if (Platform.OS === "android")
    await n.setNotificationChannelAsync("bookings", {
      name: "Lịch đặt phòng",
      importance: n.AndroidImportance.HIGH,
    });
  const permission = await n.requestPermissionsAsync();
  return { n, granted: permission.granted };
}
function serial<T>(id: string, action: () => Promise<T>): Promise<T> {
  const task = (queues.get(id) || Promise.resolve())
    .catch(() => {})
    .then(action);
  queues.set(id, task);
  void task
    .finally(() => {
      if (queues.get(id) === task) queues.delete(id);
    })
    .catch(() => {});
  return task;
}
export function scheduleReminder(booking: Booking): Promise<string> {
  return serial(booking.id, async () => {
    if (Platform.OS === "web")
      return "Nhắc lịch trên trình duyệt chưa được hỗ trợ. Hãy dùng ứng dụng di động.";
    const { n, granted } = await prepareNotifications();
    if (!granted) return "Chưa có quyền thông báo. Lịch đặt vẫn được lưu.";
    const date = new Date(booking.startAt - 15 * 60_000);
    if (booking.status !== "CONFIRMED" || date.getTime() <= Date.now())
      return "Lịch bắt đầu trong dưới 15 phút; không tạo nhắc lịch.";
    const previous = await AsyncStorage.getItem(key(booking.id));
    if (
      previous &&
      (await n.getAllScheduledNotificationsAsync()).some(
        (item) => item.identifier === previous,
      )
    )
      return "Đã bật nhắc lịch trước 15 phút trên thiết bị này.";
    const id = await n.scheduleNotificationAsync({
      content: {
        title: "Sắp đến giờ học rồi",
        body: `${booking.roomName} bắt đầu sau 15 phút.`,
        data: { bookingId: booking.id },
        color: "#173D35",
      },
      trigger: {
        type: n.SchedulableTriggerInputTypes.DATE,
        date,
        channelId: "bookings",
      },
    });
    try {
      await AsyncStorage.setItem(key(booking.id), id);
    } catch (error) {
      await n.cancelScheduledNotificationAsync(id);
      throw error;
    }
    return "Đã bật nhắc lịch trước 15 phút trên thiết bị này.";
  });
}
export async function sendTestReminder(): Promise<string> {
  if (Platform.OS === "web")
    return "Thông báo thử chỉ hỗ trợ trên ứng dụng di động.";
  const { n, granted } = await prepareNotifications();
  if (!granted)
    return "Chưa có quyền thông báo. Hãy bật quyền trong cài đặt thiết bị.";
  await n.scheduleNotificationAsync({
    content: {
      title: "Thông báo thử StudySpace",
      body: "Nhắc lịch đặt phòng đang hoạt động trên thiết bị này.",
      color: "#173D35",
    },
    trigger: {
      type: n.SchedulableTriggerInputTypes.TIME_INTERVAL,
      seconds: 5,
      channelId: "bookings",
    },
  });
  return "Thông báo thử sẽ xuất hiện sau khoảng 5 giây.";
}
export function cancelReminder(id: string) {
  return serial(id, async () => {
    if (Platform.OS === "web") return;
    const saved = await AsyncStorage.getItem(key(id));
    if (saved) {
      const n = await import("expo-notifications");
      await n.cancelScheduledNotificationAsync(saved);
      await AsyncStorage.removeItem(key(id));
    }
  });
}
