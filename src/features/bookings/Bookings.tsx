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
      ? b.status === "CANCELLED" ||
        b.status === "COMPLETED" ||
        b.endAt <= Date.now()
      : (b.status === "CONFIRMED" || b.status === "CHECKED_IN") &&
        b.endAt > Date.now(),
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
        <View style={{ gap: 16 }}>
          <Empty
            title={history ? "Chưa có lịch sử" : "Lịch học đang rộng mở"}
            text={
              history
                ? "Các lịch đã hoàn tất hoặc đã hủy sẽ được lưu trữ tại đây."
                : "Chọn một phòng ở Khám phá và lên lịch cho buổi học tiếp theo."
            }
          />
          {!history && (
            <Button
              title="Khám phá phòng ngay"
              secondary
              onPress={() => navigation.navigate("Home")}
            />
          )}
        </View>
      )}
      {shown.map((b) => (
        <View key={b.id} style={styles.card}>
          <Text style={styles.label}>
            {b.status === "CHECKED_IN"
              ? "ĐÃ CHECK-IN · ĐANG SỬ DỤNG"
              : b.status === "CANCELLED"
                ? "ĐÃ HỦY"
                : b.status === "COMPLETED"
                  ? "ĐÃ HOÀN THÀNH"
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
            title={history ? "Xem chi tiết vé" : "Mở vé đặt phòng / Check-in"}
            secondary
            onPress={() => navigation.navigate("Pass", { bookingId: b.id })}
          />
        </View>
      ))}
    </Screen>
  );
}
