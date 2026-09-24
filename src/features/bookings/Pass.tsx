import React, { useEffect, useState } from "react";
import { ActivityIndicator, StyleSheet, Text, View } from "react-native";
import QRCode from "react-native-qrcode-svg";
import { NativeStackScreenProps } from "@react-navigation/native-stack";
import { Ionicons } from "@expo/vector-icons";
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
  const [confirmCancel, setConfirmCancel] = useState(false);
  const [confirmEndEarly, setConfirmEndEarly] = useState(false);

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
      setConfirmCancel(false);
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

  const handleCheckIn = async () => {
    if (!booking || busy) return;
    setBusy(true);
    setError("");
    try {
      await repository.checkIn(booking.id);
      setMessage("✓ Check-in thành công! Chúc bạn có buổi học hiệu quả.");
    } catch (e) {
      setError((e as Error).message);
    } finally {
      setBusy(false);
    }
  };

  const handleEndEarly = async () => {
    if (!booking || busy) return;
    setBusy(true);
    setError("");
    try {
      await repository.endEarly(booking.id);
      setConfirmEndEarly(false);
      await cancelReminder(booking.id).catch(() => {});
      setMessage(
        "✓ Đã kết thúc buổi học và giải phóng phòng cho sinh viên khác.",
      );
    } catch (e) {
      setError((e as Error).message);
    } finally {
      setBusy(false);
    }
  };

  if (!booking)
    return (
      <Screen edges={["bottom", "left", "right"]}>
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

  const now = Date.now();
  const isConfirmed = booking.status === "CONFIRMED";
  const isCheckedIn = booking.status === "CHECKED_IN";
  const isCompleted = booking.status === "COMPLETED";
  const isCancelled = booking.status === "CANCELLED";
  const isPast = booking.endAt <= now;
  const canCheckIn =
    isConfirmed && now >= booking.startAt - 15 * 60_000 && now <= booking.endAt;
  const canCancel = isConfirmed && booking.startAt > now;
  const canEndEarly = (isConfirmed || isCheckedIn) && !isPast;
  const slot = SLOTS.find((s) => s.id === booking.slotId);

  return (
    <Screen edges={["bottom", "left", "right"]}>
      {/* Header Status Label */}
      <View style={[styles.row, { justifyContent: "space-between" }]}>
        <Text style={styles.label}>
          {isCheckedIn
            ? "ĐÃ CHECK-IN · ĐANG SỬ DỤNG"
            : isConfirmed && !isPast
              ? "ĐÃ XÁC NHẬN / BOOKING PASS"
              : isCancelled
                ? "LỊCH ĐÃ HỦY"
                : "LỊCH ĐÃ KẾT THÚC"}
        </Text>
        <View
          style={[
            passStyles.badgePill,
            {
              backgroundColor: isCheckedIn
                ? "#E8F5E9"
                : isConfirmed && !isPast
                  ? colors.soft
                  : isCancelled
                    ? "#FCECEE"
                    : "#F3F4F6",
            },
          ]}
        >
          <Text
            style={{
              fontSize: 12,
              fontWeight: "700",
              color: isCheckedIn
                ? "#2E7D32"
                : isConfirmed && !isPast
                  ? colors.ink
                  : isCancelled
                    ? colors.danger
                    : colors.muted,
            }}
          >
            {isCheckedIn
              ? "ĐANG HỌC"
              : isConfirmed && !isPast
                ? "SẮP TỚI"
                : isCancelled
                  ? "ĐÃ HỦY"
                  : "HOÀN TẤT"}
          </Text>
        </View>
      </View>

      <Text style={styles.title}>
        {isCheckedIn
          ? "Phòng đang sẵn sàng\ncho bạn."
          : isConfirmed && !isPast
            ? "Chỗ học của bạn\nđã sẵn sàng."
            : isCancelled
              ? "Lịch đặt phòng\nđã được hủy."
              : "Buổi học đã hoàn tất."}
      </Text>

      {/* Main Ticket Pass Card */}
      <View style={[styles.card, passStyles.ticketCard]}>
        <Text style={[styles.heading, { fontSize: 22 }]}>
          {booking.roomName}
        </Text>
        <Text style={styles.text}>
          Ngày {booking.date.split("-").reverse().join("/")} · {slot?.start} –{" "}
          {slot?.end}
        </Text>
        <Text style={styles.muted}>Giờ Việt Nam · UTC+7</Text>

        {/* QR Code Container */}
        {(isConfirmed || isCheckedIn) && !isPast && (
          <View style={passStyles.qrWrapper}>
            <QRCode
              value={JSON.stringify({ v: 1, token: booking.passToken })}
              size={180}
              color={colors.ink}
            />
          </View>
        )}

        <View style={passStyles.ticketCodeBox}>
          <Text style={styles.muted}>Mã vé đối chiếu</Text>
          <Text selectable style={passStyles.ticketCodeText}>
            VKU-{booking.passToken.slice(0, 8).toUpperCase()}
          </Text>
        </View>

        <Text style={[styles.muted, { textAlign: "center", fontSize: 13 }]}>
          {(isConfirmed || isCheckedIn) && !isPast
            ? "Xuất trình vé khi nhận phòng tại tầng hoặc quét đối chiếu tại cửa."
            : "Vé này không còn hiệu lực."}
        </Text>
      </View>

      {/* Check-in Action Button (P1) */}
      {canCheckIn && !isCheckedIn && (
        <View style={passStyles.actionCard}>
          <View style={{ gap: 4 }}>
            <Text style={[styles.heading, { fontSize: 18 }]}>
              Điểm danh nhận phòng
            </Text>
            <Text style={styles.muted}>
              Đã đến giờ nhận phòng. Hãy bấm check-in để xác nhận bạn đã có mặt.
            </Text>
          </View>
          <Button
            title="Check-in nhận phòng ngay"
            onPress={handleCheckIn}
            busy={busy}
            disabled={!online}
          />
        </View>
      )}

      {/* End Early Action Button (P1) */}
      {canEndEarly && isCheckedIn && (
        <>
          {confirmEndEarly ? (
            <View style={styles.card}>
              <Text style={styles.heading}>Xác nhận trả phòng sớm?</Text>
              <Text style={styles.muted}>
                Phòng sẽ lập tức được mở lại cho các bạn sinh viên khác đang cần
                chỗ học.
              </Text>
              <Button
                title="Đồng ý trả phòng sớm"
                onPress={handleEndEarly}
                busy={busy}
                disabled={!online}
              />
              <Button
                title="Tiếp tục sử dụng phòng"
                secondary
                onPress={() => setConfirmEndEarly(false)}
                disabled={busy}
              />
            </View>
          ) : (
            <Button
              title="Kết thúc & Trả phòng sớm"
              secondary
              disabled={!online || busy}
              onPress={() => setConfirmEndEarly(true)}
            />
          )}
        </>
      )}

      <Notice text={message} />
      <Notice text={error} error />

      {/* Cancel Booking Action */}
      {canCancel &&
        (confirmCancel ? (
          <View style={styles.card}>
            <Text style={styles.heading}>Bạn muốn hủy lịch này?</Text>
            <Text style={styles.muted}>
              Khung giờ sẽ được mở lại ngay lập tức cho mọi người trên hệ thống.
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
              onPress={() => setConfirmCancel(false)}
              disabled={busy}
            />
          </View>
        ) : (
          <Button
            title="Hủy lịch đặt"
            secondary
            disabled={!online || busy}
            onPress={() => setConfirmCancel(true)}
          />
        ))}

      <Button title="Về trang chính" onPress={() => navigation.popToTop()} />
    </Screen>
  );
}

const passStyles = StyleSheet.create({
  badgePill: {
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 8,
  },
  ticketCard: {
    alignItems: "center",
    paddingVertical: 24,
    borderRadius: 22,
  },
  qrWrapper: {
    backgroundColor: "#FFFFFF",
    padding: 18,
    borderRadius: 16,
    borderWidth: 1,
    borderColor: colors.line,
    marginVertical: 14,
  },
  ticketCodeBox: {
    alignItems: "center",
    marginVertical: 6,
    gap: 2,
  },
  ticketCodeText: {
    fontSize: 16,
    fontWeight: "800",
    color: colors.ink,
    letterSpacing: 1.5,
  },
  actionCard: {
    backgroundColor: colors.soft,
    borderRadius: 18,
    padding: 18,
    gap: 12,
  },
});
