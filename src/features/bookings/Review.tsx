import React, { useRef, useState } from "react";
import { StyleSheet, Text, View } from "react-native";
import { NativeStackScreenProps } from "@react-navigation/native-stack";
import { Ionicons } from "@expo/vector-icons";
import { RootStack } from "../../app/navigation";
import { useApp } from "../../app/Provider";
import { Button, Notice, Screen, colors, styles } from "../../components/ui";
import { RoomImage } from "../../components/RoomImage";
import { SLOTS } from "../../domain/model";
import { usePreferences } from "../../stores/preferences";
import { useDraft } from "../../stores/draft";

export function Review({
  route,
  navigation,
}: NativeStackScreenProps<RootStack, "Review">) {
  const { rooms, repository, online } = useApp();
  const room = rooms.find((r) => r.id === route.params.roomId);
  const slot = SLOTS.find((s) => s.id === route.params.slotId);
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState("");
  const isConflict = error.includes("Khung giờ vừa có người đặt");
  const pending = useRef(false);

  const confirm = async () => {
    if (pending.current || !online) return;
    pending.current = true;
    setBusy(true);
    setError("");
    try {
      const booking = await repository.create(route.params);
      useDraft.getState().clear();
      navigation.replace("Pass", { bookingId: booking.id });
    } catch (e) {
      setError(
        e instanceof Error
          ? e.message
          : "Không thể đặt phòng. Vui lòng thử lại.",
      );
    } finally {
      pending.current = false;
      setBusy(false);
    }
  };

  return (
    <Screen>
      <Text style={styles.label}>BƯỚC CUỐI CÙNG</Text>
      <Text style={styles.title}>Kiểm tra lịch{"\n"}trước khi đặt.</Text>
      <Text style={styles.muted}>
        Kiểm tra thông tin chi tiết. Chỗ học chỉ được xác nhận chính thức sau
        khi hệ thống tạo lock thành công.
      </Text>

      {room && <RoomImage room={room} height={160} />}

      <View style={[styles.card, { gap: 14 }]}>
        <Text style={styles.heading}>{room?.name}</Text>
        <View style={[styles.row, { gap: 16 }]}>
          <View style={reviewStyles.rowItem}>
            <Ionicons name="location-outline" size={16} color={colors.ink} />
            <Text style={styles.text}>
              {room?.building} · Tầng {room?.floor}
            </Text>
          </View>
          <View style={reviewStyles.rowItem}>
            <Ionicons name="people-outline" size={16} color={colors.ink} />
            <Text style={styles.text}>{room?.capacity} chỗ ngồi</Text>
          </View>
        </View>

        <View
          style={{
            borderTopWidth: 1,
            borderTopColor: colors.line,
            paddingTop: 12,
            gap: 8,
          }}
        >
          <View style={reviewStyles.rowItem}>
            <Ionicons name="calendar-outline" size={16} color={colors.ink} />
            <Text style={[styles.text, { fontWeight: "600" }]}>
              Ngày {route.params.date.split("-").reverse().join("/")}
            </Text>
          </View>
          <View style={reviewStyles.rowItem}>
            <Ionicons name="time-outline" size={16} color={colors.ink} />
            <Text style={[styles.text, { fontWeight: "600" }]}>
              {slot?.start} – {slot?.end} (2 tiếng · Giờ Việt Nam)
            </Text>
          </View>
        </View>
      </View>

      <Notice
        text={
          usePreferences((s) => s.reminders)
            ? "Bạn sẽ được gửi thông báo nhắc trước giờ học 15 phút trên thiết bị này."
            : "Thông báo nhắc lịch đang tắt. Bạn có thể bật lại trong Tài khoản."
        }
      />

      <Notice text={error} error />

      {!online && (
        <Notice
          error
          text="Bạn đang mất kết nối mạng. Hãy kết nối lại Internet để xác nhận lịch đặt."
        />
      )}

      {isConflict ? (
        <Button
          title="Quay lại chọn khung giờ khác"
          secondary
          onPress={() => navigation.goBack()}
        />
      ) : (
        <>
          <Button
            title="Xác nhận đặt phòng"
            onPress={confirm}
            disabled={!room || !slot || !online}
            busy={busy}
          />
          <Button
            title="Chọn lại khung giờ"
            secondary
            disabled={busy}
            onPress={() => navigation.goBack()}
          />
        </>
      )}
    </Screen>
  );
}

const reviewStyles = StyleSheet.create({
  rowItem: {
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
  },
});
