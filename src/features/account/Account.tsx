import React, { useState } from "react";
import { Linking, Platform, Switch, Text, View } from "react-native";
import { useApp } from "../../app/Provider";
import { Button, Notice, Screen, styles } from "../../components/ui";
import { usePreferences } from "../../stores/preferences";
import {
  cancelReminder,
  scheduleReminder,
  sendTestReminder,
} from "../../services/reminders";
export function Account() {
  const { session, repository, bookings } = useApp();
  const enabled = usePreferences((s) => s.reminders);
  const setEnabled = usePreferences((s) => s.setReminders);
  const [message, setMessage] = useState("");
  const [busy, setBusy] = useState(false);
  const toggle = async (next: boolean) => {
    setBusy(true);
    setEnabled(next);
    try {
      const active = bookings.filter(
        (b) => b.status === "CONFIRMED" && b.endAt > Date.now(),
      );
      const results = await Promise.all(
        active.map((b) => (next ? scheduleReminder(b) : cancelReminder(b.id))),
      );
      setMessage(
        next
          ? (results.find((r) => typeof r === "string") as string) ||
              "Đã bật nhắc lịch cho các lần đặt tiếp theo."
          : "Đã tắt và xóa các nhắc lịch trên thiết bị này.",
      );
    } catch {
      setMessage(
        "Đã lưu tùy chọn nhưng chưa thể cập nhật hết nhắc lịch trên thiết bị.",
      );
    } finally {
      setBusy(false);
    }
  };
  const logout = async () => {
    setBusy(true);
    try {
      await Promise.all(bookings.map((b) => cancelReminder(b.id)));
      await repository.logout();
    } catch {
      setMessage("Chưa thể đăng xuất hoặc xóa nhắc lịch. Vui lòng thử lại.");
    } finally {
      setBusy(false);
    }
  };
  const testReminder = async () => {
    setBusy(true);
    try {
      setMessage(await sendTestReminder());
    } catch {
      setMessage(
        "Chưa thể gửi thông báo thử. Kiểm tra quyền thông báo trên thiết bị.",
      );
    } finally {
      setBusy(false);
    }
  };
  return (
    <Screen edges={["top", "left", "right"]}>
      <Text style={styles.label}>TÀI KHOẢN</Text>
      <Text style={styles.title}>Chào bạn.</Text>
      <Text style={styles.text}>{session?.email}</Text>
      <View style={styles.card}>
        <Text style={styles.heading}>Nhắc lịch học</Text>
        <View style={[styles.row, { justifyContent: "space-between" }]}>
          <Text style={[styles.muted, { flex: 1 }]}>
            Thông báo trước giờ bắt đầu 15 phút
          </Text>
          <Switch
            accessibilityLabel="Nhắc trước 15 phút"
            value={enabled}
            onValueChange={toggle}
            disabled={busy}
          />
        </View>
        <Text style={styles.muted}>
          Tùy chọn áp dụng trên thiết bị này. Quyền thông báo được hỏi khi tạo
          nhắc lịch.
        </Text>
        {Platform.OS !== "web" && (
          <Button
            title="Thử thông báo sau 5 giây"
            secondary
            busy={busy}
            disabled={!enabled}
            onPress={testReminder}
          />
        )}
        <Button
          title="Mở cài đặt thiết bị"
          secondary
          onPress={() => {
            void Linking.openSettings().catch(() =>
              setMessage(
                "Mở cài đặt thông báo trong hệ điều hành hoặc trình duyệt của bạn.",
              ),
            );
          }}
        />
      </View>
      <Notice text={message} />
      <View style={styles.card}>
        <Text style={styles.heading}>Quy tắc không gian chung</Text>
        <Text style={styles.text}>
          Đặt trong 7 ngày tới, tối đa 3 lịch đang hoạt động. Mỗi lượt 2 giờ,
          không đặt trùng thời gian.
        </Text>
        <Text style={styles.muted}>
          Hủy trước giờ bắt đầu nếu kế hoạch thay đổi. Giữ phòng sạch và trả
          phòng đúng giờ.
        </Text>
      </View>
      <Notice
        text={
          repository.mode === "demo"
            ? "Chế độ demo · Lịch đặt chỉ được lưu tại máy này. Đổi email để thử tài khoản khác."
            : "Firebase · Lịch đặt được kiểm tra và xác nhận tại server."
        }
      />
      <Button title="Đăng xuất" secondary busy={busy} onPress={logout} />
      <Text style={styles.muted}>StudySpace 1.0 · VKU mini-project</Text>
    </Screen>
  );
}
