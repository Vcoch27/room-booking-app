import React, { useState } from "react";
import { Text, View } from "react-native";
import { useNavigation } from "@react-navigation/native";
import { NativeStackNavigationProp } from "@react-navigation/native-stack";
import { RootStack } from "../../app/navigation";
import { useApp } from "../../app/Provider";
import {
  Button,
  Chip,
  Empty,
  Notice,
  Screen,
  styles,
} from "../../components/ui";
import { SLOTS } from "../../domain/model";
export function Bookings() {
  const { bookings, online, error } = useApp();
  const [history, setHistory] = useState(false);
  const navigation = useNavigation<NativeStackNavigationProp<RootStack>>();
  const shown = bookings.filter((b) =>
    history
      ? b.status === "CANCELLED" || b.endAt <= Date.now()
      : b.status === "CONFIRMED" && b.endAt > Date.now(),
  );
  return (
    <Screen>
      <Text style={styles.label}>LỊCH CỦA BẠN</Text>
      <Text style={styles.title}>Dành chỗ cho{"\n"}việc học.</Text>
      <View style={styles.row}>
        <Chip
          label="Sắp tới"
          selected={!history}
          onPress={() => setHistory(false)}
        />
        <Chip
          label="Lịch sử"
          selected={history}
          onPress={() => setHistory(true)}
        />
      </View>
      {!online && (
        <Notice text="Đang xem lịch đã lưu. Kết nối lại để cập nhật hoặc hủy." />
      )}
      <Notice text={error} error />
      {!shown.length && (
        <Empty
          title={history ? "Chưa có lịch sử" : "Lịch học đang rộng mở"}
          text="Chọn một phòng ở Khám phá và lên lịch cho buổi học tiếp theo."
        />
      )}
      {shown.map((b) => (
        <View key={b.id} style={styles.card}>
          <Text style={styles.label}>
            {b.status === "CANCELLED"
              ? "ĐÃ HỦY"
              : b.endAt <= Date.now()
                ? "ĐÃ KẾT THÚC"
                : "ĐÃ XÁC NHẬN"}
          </Text>
          <Text style={styles.heading}>{b.roomName}</Text>
          <Text style={styles.text}>
            {b.date.split("-").reverse().join("/")} ·{" "}
            {SLOTS.find((s) => s.id === b.slotId)?.start}–
            {SLOTS.find((s) => s.id === b.slotId)?.end}
          </Text>
          <Button
            title={history ? "Xem chi tiết" : "Mở vé đặt phòng"}
            secondary
            onPress={() => navigation.navigate("Pass", { bookingId: b.id })}
          />
        </View>
      ))}
    </Screen>
  );
}
