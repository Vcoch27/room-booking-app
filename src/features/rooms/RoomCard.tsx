import React, { memo } from "react";
import { Pressable, StyleSheet, Text, View } from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { Room } from "../../domain/model";
import { colors, styles } from "../../components/ui";
import { RoomImage } from "../../components/RoomImage";

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
  const isLab = room.kind === "lab";

  return (
    <View style={[styles.card, cardStyles.cardContainer]}>
      {/* Room Image with Badges */}
      <Pressable
        accessibilityRole="button"
        accessibilityLabel={`Xem chi tiết ${room.name}`}
        onPress={() => onOpen(room.id)}
      >
        <RoomImage room={room} height={155} />
      </Pressable>

      {/* Header Info: Kind & Favorite Button */}
      <View style={[styles.row, { justifyContent: "space-between" }]}>
        <View style={cardStyles.kindTag}>
          <Ionicons
            name={isLab ? "desktop-outline" : "people-outline"}
            size={16}
            color={colors.ink}
          />
          <Text style={styles.label}>
            {isLab ? "COMPUTER LAB" : "STUDY ROOM"}
          </Text>
        </View>

        <Pressable
          onPress={() => onFavorite(room.id)}
          accessibilityRole="button"
          accessibilityLabel={favorite ? "Bỏ yêu thích" : "Yêu thích phòng"}
          accessibilityState={{ selected: favorite }}
          style={cardStyles.favoriteButton}
          hitSlop={8}
        >
          <Ionicons
            name={favorite ? "heart" : "heart-outline"}
            size={22}
            color={favorite ? "#D32F2F" : colors.muted}
          />
        </Pressable>
      </View>

      {/* Clickable Card Content */}
      <Pressable
        accessibilityRole="button"
        accessibilityLabel={`Xem ${room.name}`}
        onPress={() => onOpen(room.id)}
        style={{ gap: 8 }}
      >
        <Text style={[styles.heading, { fontSize: 20 }]}>{room.name}</Text>

        <View style={styles.row}>
          <View style={cardStyles.metaBadge}>
            <Ionicons name="location-outline" size={14} color={colors.muted} />
            <Text style={styles.muted}>
              {room.building} · Tầng {room.floor}
            </Text>
          </View>
          <View style={cardStyles.metaBadge}>
            <Ionicons name="people-outline" size={14} color={colors.muted} />
            <Text style={styles.muted}>{room.capacity} chỗ ngồi</Text>
          </View>
        </View>

        {/* Equipment Badges */}
        <View style={[styles.row, { gap: 6, marginTop: 4 }]}>
          {room.equipment.map((eq) => (
            <View key={eq} style={cardStyles.equipmentBadge}>
              <Text style={cardStyles.equipmentText}>{eq}</Text>
            </View>
          ))}
        </View>

        {/* Bottom CTA Bar */}
        <View style={cardStyles.ctaRow}>
          <Text style={{ color: colors.ink, fontWeight: "700", fontSize: 14 }}>
            Xem khung giờ & Đặt chỗ
          </Text>
          <View style={cardStyles.arrowCircle}>
            <Ionicons name="arrow-forward" size={16} color={colors.ink} />
          </View>
        </View>
      </Pressable>
    </View>
  );
});

const cardStyles = StyleSheet.create({
  cardContainer: {
    marginBottom: 16,
    padding: 16,
    borderRadius: 20,
    gap: 12,
  },
  kindTag: {
    flexDirection: "row",
    alignItems: "center",
    gap: 6,
  },
  favoriteButton: {
    minWidth: 40,
    minHeight: 40,
    justifyContent: "center",
    alignItems: "center",
    borderRadius: 20,
    backgroundColor: "rgba(23, 61, 53, 0.05)",
  },
  metaBadge: {
    flexDirection: "row",
    alignItems: "center",
    gap: 4,
  },
  equipmentBadge: {
    backgroundColor: colors.soft,
    paddingHorizontal: 9,
    paddingVertical: 4,
    borderRadius: 8,
  },
  equipmentText: {
    color: colors.muted,
    fontSize: 12,
    fontWeight: "500",
  },
  ctaRow: {
    flexDirection: "row",
    borderTopWidth: 1,
    borderTopColor: colors.line,
    paddingTop: 14,
    marginTop: 4,
    justifyContent: "space-between",
    alignItems: "center",
  },
  arrowCircle: {
    width: 28,
    height: 28,
    borderRadius: 14,
    backgroundColor: colors.soft,
    justifyContent: "center",
    alignItems: "center",
  },
});
