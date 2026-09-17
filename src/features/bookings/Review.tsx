import React, { useRef, useState } from "react";
import { Text, View } from "react-native";
import { NativeStackScreenProps } from "@react-navigation/native-stack";
import { RootStack } from "../../app/navigation";
import { useApp } from "../../app/Provider";
import { Button, Notice, Screen, styles } from "../../components/ui";
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
        Kiểm tra thông tin trước khi xác nhận. Phòng chỉ được giữ sau khi yêu
        cầu thành công.
      </Text>
      <View style={styles.card}>
        <Text style={styles.heading}>{room?.name}</Text>
        <Text style={styles.text}>
          {room?.building} · {room?.capacity} chỗ ngồi
        </Text>
        <Text style={styles.text}>
          Ngày {route.params.date.split("-").reverse().join("/")}
        </Text>
        <Text style={styles.text}>
          {slot?.start}–{slot?.end} · Giờ Việt Nam
        </Text>
      </View>
      <Notice
        text={
          usePreferences((s) => s.reminders)
            ? "Bạn sẽ được nhắc trước 15 phút nếu thiết bị đã cấp quyền thông báo."
            : "Nhắc lịch đang tắt. Có thể bật trong Tài khoản."
        }
      />
      <Notice text={error} error />
      {!online && (
        <Notice
          error
          text="Bạn đang mất mạng. Kết nối lại để xác nhận lịch đặt."
        />
      )}
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
    </Screen>
  );
}
