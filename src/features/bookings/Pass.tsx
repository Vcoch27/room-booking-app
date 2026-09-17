import React, { useEffect, useState } from "react";
import { ActivityIndicator, Text, View } from "react-native";
import QRCode from "react-native-qrcode-svg";
import { NativeStackScreenProps } from "@react-navigation/native-stack";
import { RootStack } from "../../app/navigation";
import { useApp } from "../../app/Provider";
import { Button, Notice, Screen, colors, styles } from "../../components/ui";
import { SLOTS } from "../../domain/model";
import { usePreferences } from "../../stores/preferences";
import { cancelReminder, scheduleReminder } from "../../services/reminders";
export function Pass({
  route,
  navigation,
}: NativeStackScreenProps<RootStack, "Pass">) {
  const { bookings, repository, online, error: syncError } = useApp();
  const booking = bookings.find((b) => b.id === route.params.bookingId);
  const reminders = usePreferences((s) => s.reminders);
  const [message, setMessage] = useState("");
  const [error, setError] = useState("");
  const [busy, setBusy] = useState(false);
  const [confirm, setConfirm] = useState(false);
  useEffect(() => {
    if (
      !booking ||
      booking.status !== "CONFIRMED" ||
      booking.startAt <= Date.now() ||
      !reminders
    )
      return;
    let active = true;
    void scheduleReminder(booking)
      .then((m) => {
        if (active) setMessage(m);
      })
      .catch(() => {
        if (active)
          setMessage(
            "Lịch đặt đã lưu, nhưng chưa thể tạo nhắc lịch trên thiết bị.",
          );
      });
    return () => {
      active = false;
    };
  }, [booking?.id, booking?.status, reminders]);
  const cancel = async () => {
    if (!booking || busy) return;
    setBusy(true);
    setError("");
    try {
      await repository.cancel(booking.id);
      setConfirm(false);
      try {
        await cancelReminder(booking.id);
        setMessage("Lịch đặt đã hủy và khung giờ đã được giải phóng.");
      } catch {
        setMessage(
          "Đã hủy lịch. Không thể xóa nhắc lịch trên thiết bị; hãy kiểm tra thông báo.",
        );
      }
    } catch (e) {
      setError((e as Error).message);
    } finally {
      setBusy(false);
    }
  };
  if (!booking)
    return (
      <Screen>
        <ActivityIndicator color={colors.ink} />
        <Text style={styles.text}>Đang tải vé đặt phòng…</Text>
        <Notice
          text={
            syncError ||
            (!online ? "Cần kết nối để tải vé chưa có trên thiết bị." : "")
          }
          error
        />
        <Button
          title="Về danh sách"
          secondary
          onPress={() => navigation.popToTop()}
        />
      </Screen>
    );
  const active = booking.status === "CONFIRMED" && booking.endAt > Date.now();
  const slot = SLOTS.find((s) => s.id === booking.slotId);
  return (
    <Screen>
      <Text style={styles.label}>
        {active
          ? "ĐÃ XÁC NHẬN / BOOKING PASS"
          : booking.status === "CANCELLED"
            ? "LỊCH ĐÃ HỦY"
            : "LỊCH ĐÃ KẾT THÚC"}
      </Text>
      <Text style={styles.title}>
        {active ? "Chỗ học của bạn\nđã sẵn sàng." : "Thông tin lịch đặt"}
      </Text>
      <View
        style={[styles.card, { alignItems: "center", paddingVertical: 28 }]}
      >
        <Text style={styles.heading}>{booking.roomName}</Text>
        <Text style={styles.text}>
          {booking.date.split("-").reverse().join("/")} · {slot?.start}–
          {slot?.end}
        </Text>
        <Text style={styles.muted}>Giờ Việt Nam · UTC+7</Text>
        {active && (
          <View
            accessible
            accessibilityLabel="Mã QR vé đặt phòng, không chứa thông tin cá nhân"
            style={{
              backgroundColor: "#FFFFFF",
              padding: 20,
              marginVertical: 10,
            }}
          >
            <QRCode
              value={JSON.stringify({ v: 1, token: booking.passToken })}
              size={190}
              color={colors.ink}
            />
          </View>
        )}
        <Text selectable style={styles.muted}>
          Mã vé: {booking.passToken.slice(0, 8).toUpperCase()}
        </Text>
        <Text style={styles.muted}>
          {active
            ? "Giữ vé để đối chiếu lịch đặt tại phòng."
            : "Vé này không còn hiệu lực."}
        </Text>
      </View>
      <Notice text="Mã vé dùng để đối chiếu lịch đặt. Hiện chưa hỗ trợ check-in tự động." />
      <Notice text={message} />
      <Notice text={error} error />
      {active &&
        booking.startAt > Date.now() &&
        (confirm ? (
          <View style={styles.card}>
            <Text style={styles.heading}>Bạn muốn hủy lịch này?</Text>
            <Text style={styles.muted}>
              Khung giờ sẽ được mở lại cho mọi người.
            </Text>
            <Button
              title="Đồng ý hủy lịch"
              danger
              onPress={cancel}
              busy={busy}
              disabled={!online}
            />
            <Button
              title="Giữ lại lịch đặt"
              secondary
              onPress={() => setConfirm(false)}
              disabled={busy}
            />
          </View>
        ) : (
          <Button
            title="Hủy lịch đặt"
            secondary
            disabled={!online}
            onPress={() => setConfirm(true)}
          />
        ))}
      <Button title="Về trang chính" onPress={() => navigation.popToTop()} />
    </Screen>
  );
}
