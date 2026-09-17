import React, { memo } from "react";
import { Pressable, Text, View } from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { Room } from "../../domain/model";
import { colors, styles } from "../../components/ui";
export const RoomCard = memo(function RoomCard({
  room,
  onOpen,
  favorite,
  onFavorite,
}: {
  room: Room;
  onOpen: (id: string) => void;
  favorite: boolean;
  onFavorite: (id: string) => void;
}) {
  return (
    <View style={[styles.card, { marginBottom: 14 }]}>
      <View style={[styles.row, { justifyContent: "space-between" }]}>
        <View style={styles.row}>
          <View
            style={{
              padding: 12,
              borderRadius: 12,
              backgroundColor: room.kind === "lab" ? "#E5ECF2" : colors.soft,
            }}
          >
            <Ionicons
              name={room.kind === "lab" ? "desktop-outline" : "people-outline"}
              size={28}
              color={colors.ink}
            />
          </View>
          <Text style={styles.label}>
            {room.kind === "lab" ? "COMPUTER LAB" : "STUDY ROOM"}
          </Text>
        </View>
        <Pressable
          onPress={() => onFavorite(room.id)}
          accessibilityRole="button"
          accessibilityLabel={favorite ? "Bỏ yêu thích" : "Yêu thích phòng"}
          accessibilityState={{ selected: favorite }}
          style={{
            minWidth: 44,
            minHeight: 44,
            justifyContent: "center",
            alignItems: "center",
          }}
        >
          <Ionicons
            name={favorite ? "heart" : "heart-outline"}
            size={23}
            color={colors.ink}
          />
        </Pressable>
      </View>
      <Pressable
        accessibilityRole="button"
        accessibilityLabel={`Xem ${room.name}`}
        onPress={() => onOpen(room.id)}
        style={{ gap: 10 }}
      >
        <Text style={styles.heading}>{room.name}</Text>
        <Text style={styles.muted}>
          {room.building} · Tầng {room.floor} · {room.capacity} chỗ ngồi
        </Text>
        <Text style={styles.muted}>{room.equipment.join("   /   ")}</Text>
        <View
          style={[
            styles.row,
            {
              borderTopWidth: 1,
              borderTopColor: colors.line,
              paddingTop: 14,
              justifyContent: "space-between",
            },
          ]}
        >
          <Text style={{ color: colors.ink, fontWeight: "600" }}>
            Xem khung giờ
          </Text>
          <Ionicons name="arrow-forward" size={20} color={colors.ink} />
        </View>
      </Pressable>
    </View>
  );
});
