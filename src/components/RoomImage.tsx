import React, { useState } from "react";
import {
  Image,
  StyleSheet,
  Text,
  View,
  ViewStyle,
  ImageStyle,
} from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { Room } from "../domain/model";
import { colors } from "./ui";

interface RoomImageProps {
  room: Room;
  style?: ViewStyle;
  imageStyle?: ImageStyle;
  height?: number;
}

export const RoomImage = React.memo(function RoomImage({
  room,
  style,
  imageStyle,
  height = 140,
}: RoomImageProps) {
  const [error, setError] = useState(false);
  const [loaded, setLoaded] = useState(false);

  const isLab = room.kind === "lab";
  const showImage = !error && Boolean(room.imageUrl);

  return (
    <View style={[styles.container, { height }, style]}>
      {showImage ? (
        <>
          <Image
            source={{ uri: room.imageUrl }}
            style={[styles.image, imageStyle]}
            resizeMode="cover"
            onLoad={() => setLoaded(true)}
            onError={() => setError(true)}
          />
          {!loaded && (
            <View style={[styles.fallback, styles.loadingOverlay]}>
              <Ionicons
                name={isLab ? "desktop-outline" : "school-outline"}
                size={32}
                color={colors.muted}
              />
            </View>
          )}
        </>
      ) : (
        <View
          style={[
            styles.fallback,
            { backgroundColor: isLab ? "#16342E" : "#1F483F" },
          ]}
        >
          <View style={styles.fallbackPattern}>
            <Ionicons
              name={isLab ? "hardware-chip-outline" : "book-outline"}
              size={56}
              color="rgba(220, 239, 134, 0.15)"
            />
          </View>
          <View style={styles.fallbackContent}>
            <View style={styles.iconCircle}>
              <Ionicons
                name={isLab ? "desktop-outline" : "people-outline"}
                size={22}
                color={colors.accent}
              />
            </View>
            <View style={{ gap: 2 }}>
              <Text style={styles.fallbackKind}>
                {isLab ? "COMPUTER LAB" : "STUDY ROOM"}
              </Text>
              <Text style={styles.fallbackBuilding}>
                {room.building} · Tầng {room.floor}
              </Text>
            </View>
          </View>
        </View>
      )}

      {/* Building Badge Overlay */}
      <View style={styles.badge}>
        <Text style={styles.badgeText}>{room.building}</Text>
      </View>
    </View>
  );
});

const styles = StyleSheet.create({
  container: {
    width: "100%",
    borderRadius: 14,
    overflow: "hidden",
    backgroundColor: colors.soft,
    position: "relative",
  },
  image: {
    width: "100%",
    height: "100%",
  },
  loadingOverlay: {
    position: "absolute",
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    backgroundColor: colors.soft,
    justifyContent: "center",
    alignItems: "center",
  },
  fallback: {
    width: "100%",
    height: "100%",
    justifyContent: "center",
    alignItems: "flex-start",
    paddingHorizontal: 18,
    position: "relative",
  },
  fallbackPattern: {
    position: "absolute",
    right: 16,
    bottom: 8,
  },
  fallbackContent: {
    flexDirection: "row",
    alignItems: "center",
    gap: 12,
  },
  iconCircle: {
    width: 42,
    height: 42,
    borderRadius: 21,
    backgroundColor: "rgba(220, 239, 134, 0.15)",
    justifyContent: "center",
    alignItems: "center",
  },
  fallbackKind: {
    color: colors.accent,
    fontSize: 11,
    fontWeight: "700",
    letterSpacing: 1.2,
  },
  fallbackBuilding: {
    color: "#E2EBE0",
    fontSize: 13,
    fontWeight: "500",
  },
  badge: {
    position: "absolute",
    top: 10,
    right: 10,
    backgroundColor: "rgba(23, 61, 53, 0.82)",
    paddingHorizontal: 10,
    paddingVertical: 5,
    borderRadius: 8,
  },
  badgeText: {
    color: "#FFFFFF",
    fontSize: 11,
    fontWeight: "700",
    letterSpacing: 0.5,
  },
});
