import React, { useEffect, useState } from "react";
import { Text, View } from "react-native";
import * as Crypto from "expo-crypto";
import { NativeStackScreenProps } from "@react-navigation/native-stack";
import { RootStack } from "../../app/navigation";
import { useApp } from "../../app/Provider";
import {
  Button,
  Chip,
  Empty,
  Notice,
  Screen,
  colors,
  styles,
} from "../../components/ui";
import { RoomGallery } from "../../components/RoomGallery";
import { SLOTS, SlotLock, bookingDays, slotTimes } from "../../domain/model";
import { useDraft } from "../../stores/draft";
export function Detail({
  route,
  navigation,
}: NativeStackScreenProps<RootStack, "Room">) {
  const { rooms, repository, online } = useApp();
  const room = rooms.find((r) => r.id === route.params.roomId);
  const [now, setNow] = useState(Date.now());
  const days = bookingDays(now);
  const saved = useDraft.getState().draft;
  const [date, setDate] = useState(
    saved?.roomId === route.params.roomId &&
      days.includes(saved.date) &&
      Date.now() - saved.savedAt < 86400_000
      ? saved.date
      : days[0],
  );
  const [slotId, setSlot] = useState("");
  const [locks, setLocks] = useState<SlotLock[]>([]);
  const [stale, setStale] = useState(true);
  const [error, setError] = useState("");
  const [revision, setRevision] = useState(0);
  const selectSlot = (id: string) => {
    setSlot(id);
    useDraft.getState().save({ roomId: route.params.roomId, date, slotId: id });
  };
  useEffect(() => {
    const timer = setInterval(() => setNow(Date.now()), 30_000);
    return () => clearInterval(timer);
  }, []);
  useEffect(() => {
    setStale(true);
    setLocks([]);
    setSlot("");
    setError("");
    let first = true;
    return repository.availability(
      route.params.roomId,
      date,
      (s) => {
        setLocks(s.data);
        setStale(s.stale);
        if (first && !s.stale) {
          first = false;
          const draft = useDraft.getState().draft;
          if (
            draft?.roomId === route.params.roomId &&
            draft.date === date &&
            Date.now() - draft.savedAt < 86400_000 &&
            SLOTS.some((slot) => slot.id === draft.slotId) &&
            slotTimes(date, draft.slotId).startAt > Date.now() &&
            !s.data.some((lock) => lock.slotId === draft.slotId)
          )
            setSlot(draft.slotId);
        }
      },
      (e) => {
        setError(e.message);
        setStale(true);
      },
    );
  }, [repository, route.params.roomId, date, revision]);
  if (!room)
    return (
      <Screen>
        <Empty
          title="Phòng chưa tải được"
          text="Quay lại danh sách và thử tải lại dữ liệu."
        />
      </Screen>
    );
  const taken = locks.some((l) => l.slotId === slotId);
  const invalid =
    !slotId ||
    !days.includes(date) ||
    (slotId && slotTimes(date, slotId).startAt <= now);
  return (
    <Screen>
      {/* Big Hero Room Image */}
      <RoomGallery key={room.id} room={room} />

      <Text style={styles.label}>
        {room.kind === "lab" ? "COMPUTER LAB" : "STUDY ROOM"} /{" "}
        {room.id.toUpperCase()}
      </Text>
      <Text style={styles.title}>{room.name}</Text>
      <Text style={styles.text}>
        {room.building} · Tầng {room.floor} · {room.capacity} chỗ ngồi
      </Text>
      <Text style={styles.muted}>{room.description}</Text>
      <View style={styles.card}>
        <Text style={styles.heading}>Trang thiết bị & Tiện nghi</Text>
        <View style={[styles.row, { gap: 8 }]}>
          {room.equipment.map((e) => (
            <View
              key={e}
              style={{
                backgroundColor: colors.soft,
                paddingHorizontal: 12,
                paddingVertical: 7,
                borderRadius: 10,
                flexDirection: "row",
                alignItems: "center",
                gap: 6,
              }}
            >
              <Text
                style={{ color: colors.ink, fontWeight: "600", fontSize: 13 }}
              >
                ✓ {e}
              </Text>
            </View>
          ))}
        </View>
      </View>
      <Text style={styles.heading}>01 / Chọn ngày</Text>
      <Text style={styles.muted}>7 ngày tới · Giờ Việt Nam (UTC+7)</Text>
      <View style={styles.row}>
        {days.map((day, i) => (
          <Chip
            key={day}
            label={
              i === 0
                ? `Hôm nay · ${day.slice(8)}/${day.slice(5, 7)}`
                : `${day.slice(8)}/${day.slice(5, 7)}`
            }
            selected={date === day}
            onPress={() => setDate(day)}
          />
        ))}
      </View>
      <Text style={styles.heading}>02 / Chọn khung giờ</Text>
      <Text style={styles.muted}>Mỗi lượt đặt kéo dài 2 giờ.</Text>
      <Notice text={error} error />
      {!!error && (
        <Button
          title="Tải lại khung giờ"
          secondary
          onPress={() => setRevision((v) => v + 1)}
        />
      )}
      {(!online || stale) && (
        <Notice text="Đang chờ kết nối và xác nhận tình trạng phòng. Bạn chưa thể đặt chỗ." />
      )}
      <View style={styles.row}>
        {SLOTS.map((slot) => {
          const booked = locks.some((l) => l.slotId === slot.id);
          const past = slotTimes(date, slot.id).startAt <= now;
          return (
            <Chip
              key={slot.id}
              label={`${slot.start}–${slot.end} · ${past ? "Đã qua" : booked ? "Đã đặt" : "Còn trống"}`}
              disabled={past || booked || stale || !online}
              selected={slotId === slot.id && !booked}
              onPress={() => selectSlot(slot.id)}
            />
          );
        })}
      </View>
      {taken && (
        <Notice
          error
          text="Khung giờ bạn chọn vừa có người đặt. Vui lòng chọn lại."
        />
      )}
      <Button
        title="Tiếp tục đặt phòng"
        disabled={!!invalid || taken || stale || !online}
        onPress={() =>
          navigation.navigate("Review", {
            roomId: room.id,
            date,
            slotId,
            idempotencyKey: Crypto.randomUUID(),
          })
        }
      />
      <Text style={styles.muted}>
        Tối đa 3 lịch sắp tới. Bạn có thể hủy trước giờ bắt đầu để nhường phòng
        cho người khác.
      </Text>
    </Screen>
  );
}
