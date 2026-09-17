import React, { useCallback, useMemo, useState } from "react";
import {
  FlatList,
  Platform,
  ScrollView,
  StyleSheet,
  Text,
  View,
} from "react-native";
import { useNavigation } from "@react-navigation/native";
import { NativeStackNavigationProp } from "@react-navigation/native-stack";
import { Ionicons } from "@expo/vector-icons";
import { RootStack } from "../../app/navigation";
import { useApp } from "../../app/Provider";
import {
  Button,
  Chip,
  Empty,
  Field,
  Notice,
  Screen,
  colors,
  styles,
} from "../../components/ui";
import { Equipment, Room, filterRooms } from "../../domain/model";
import { usePreferences } from "../../stores/preferences";
import { RoomCard } from "./RoomCard";

const BUILDINGS = ["", "Tòa A", "Tòa B", "Tòa C", "Tòa V"];

export function Feed({ favoritesOnly = false }: { favoritesOnly?: boolean }) {
  const { rooms, loading, online, stale, error, retry, repository } = useApp();
  const filters = usePreferences((s) => s.filters);
  const setFilters = usePreferences((s) => s.setFilters);
  const reset = usePreferences((s) => s.resetFilters);
  const favorites = usePreferences((s) => s.favorites);
  const toggleFavStore = usePreferences((s) => s.toggleFavorite);
  const [expanded, setExpanded] = useState(false);
  const navigation = useNavigation<NativeStackNavigationProp<RootStack>>();

  const toggleFavorite = useCallback(
    (id: string) => {
      const willBeFavorite = !favorites.includes(id);
      toggleFavStore(id);
      void repository.toggleFavorite?.(id, willBeFavorite);
    },
    [favorites, toggleFavStore, repository],
  );

  const data = useMemo(
    () =>
      filterRooms(rooms, filters).filter(
        (r) => !favoritesOnly || favorites.includes(r.id),
      ),
    [rooms, filters, favoritesOnly, favorites],
  );

  const open = useCallback(
    (roomId: string) => navigation.navigate("Room", { roomId }),
    [navigation],
  );

  const renderItem = useCallback(
    ({ item }: { item: Room }) => (
      <RoomCard
        room={item}
        onOpen={open}
        favorite={favorites.includes(item.id)}
        onFavorite={toggleFavorite}
      />
    ),
    [open, favorites, toggleFavorite],
  );

  const activeFilterCount =
    (filters.building ? 1 : 0) +
    (filters.capacity > 0 ? 1 : 0) +
    filters.equipment.length +
    (filters.search.trim() ? 1 : 0);

  return (
    <Screen scroll={false}>
      <FlatList
        data={data}
        renderItem={renderItem}
        keyExtractor={(r) => r.id}
        keyboardShouldPersistTaps="handled"
        contentContainerStyle={styles.content}
        refreshing={loading}
        onRefresh={retry}
        initialNumToRender={6}
        maxToRenderPerBatch={8}
        windowSize={7}
        removeClippedSubviews={Platform.OS !== "web"}
        ListHeaderComponent={
          <View style={{ gap: 16, marginBottom: 16 }}>
            {/* Campus Header Bar */}
            <View style={[styles.row, { justifyContent: "space-between" }]}>
              <View style={feedStyles.logoTag}>
                <Ionicons name="school-outline" size={16} color={colors.ink} />
                <Text style={styles.label}>VKU / STUDYSPACE</Text>
              </View>
              <View style={feedStyles.modeBadge}>
                <View
                  style={[
                    feedStyles.statusDot,
                    {
                      backgroundColor:
                        repository.mode === "firebase" ? "#2E7D32" : "#E65100",
                    },
                  ]}
                />
                <Text style={[styles.muted, { fontSize: 12 }]}>
                  {repository.mode === "demo"
                    ? "Demo cục bộ"
                    : "Firebase Realtime"}
                </Text>
              </View>
            </View>

            {/* Offline Alert Banner */}
            {!online && (
              <View style={feedStyles.offlineBanner}>
                <Ionicons
                  name="cloud-offline-outline"
                  size={20}
                  color="#854D0E"
                />
                <Text style={feedStyles.offlineText}>
                  Bạn đang offline. Đang hiển thị phòng lưu trong máy. Cần kết
                  nối mạng để đặt phòng.
                </Text>
              </View>
            )}

            {/* Hero Card */}
            <View style={feedStyles.heroCard}>
              <Text style={feedStyles.heroPre}>KHÔNG GIAN CHO Ý TƯỞNG</Text>
              <Text
                style={[styles.title, { color: colors.white, fontSize: 32 }]}
              >
                {favoritesOnly
                  ? "Góc học quen thuộc."
                  : "Hôm nay,\nbạn học ở đâu?"}
              </Text>
              <Text style={{ color: "#DDE6DA", lineHeight: 22, fontSize: 14 }}>
                20 phòng học nhóm & phòng máy hiện đại tại 4 tòa nhà VKU.
              </Text>
            </View>

            {/* Sync / Cache Stale Alert */}
            {online && stale && (
              <Notice text="Đang đồng bộ dữ liệu phòng mới nhất từ campus…" />
            )}
            <Notice text={error} error />
            {!!error && (
              <Button title="Thử tải lại" secondary onPress={retry} />
            )}

            {/* Search Field */}
            <Field
              label="Tìm kiếm nhanh không gian"
              placeholder="Tên phòng, tòa nhà, công nghệ…"
              value={filters.search}
              onChangeText={(search) => setFilters({ search })}
            />

            {/* Quick Filter Buildings Row */}
            <View style={{ gap: 8 }}>
              <Text style={styles.muted}>Lọc nhanh theo tòa nhà</Text>
              <ScrollView
                horizontal
                showsHorizontalScrollIndicator={false}
                contentContainerStyle={{ gap: 8 }}
              >
                {BUILDINGS.map((building) => (
                  <Chip
                    key={building}
                    label={building || "Tất cả tòa"}
                    selected={filters.building === building}
                    onPress={() => setFilters({ building })}
                  />
                ))}
              </ScrollView>
            </View>

            {/* Section Header with Expand Filter Toggle */}
            <View style={[styles.row, { justifyContent: "space-between" }]}>
              <Text style={styles.heading}>
                {favoritesOnly ? "Phòng yêu thích" : "Danh sách không gian"} ·{" "}
                {data.length} phòng
              </Text>
              <Chip
                label={
                  expanded
                    ? "Thu gọn bộ lọc"
                    : activeFilterCount > 0
                      ? `Bộ lọc (${activeFilterCount})`
                      : "Bộ lọc nâng cao"
                }
                selected={expanded || activeFilterCount > 0}
                onPress={() => setExpanded(!expanded)}
              />
            </View>

            {/* Expanded Advanced Filters */}
            {expanded && (
              <View style={[styles.card, { gap: 14 }]}>
                <Text style={[styles.heading, { fontSize: 16 }]}>
                  Bộ lọc nâng cao
                </Text>

                <Text style={styles.muted}>Số chỗ ngồi tối thiểu</Text>
                <View style={styles.row}>
                  {[0, 4, 8, 16, 24, 30].map((capacity) => (
                    <Chip
                      key={capacity}
                      label={capacity ? `${capacity}+ chỗ` : "Bất kỳ"}
                      selected={filters.capacity === capacity}
                      onPress={() => setFilters({ capacity })}
                    />
                  ))}
                </View>

                <Text style={styles.muted}>Tiện nghi cần có</Text>
                <View style={styles.row}>
                  {(
                    [
                      "Wi-Fi",
                      "Máy chiếu",
                      "Bảng trắng",
                      "Máy tính",
                      "Điều hòa",
                    ] as Equipment[]
                  ).map((e) => (
                    <Chip
                      key={e}
                      label={e}
                      selected={filters.equipment.includes(e)}
                      onPress={() =>
                        setFilters({
                          equipment: filters.equipment.includes(e)
                            ? filters.equipment.filter((v) => v !== e)
                            : [...filters.equipment, e],
                        })
                      }
                    />
                  ))}
                </View>

                <Button title="Xóa tất cả bộ lọc" secondary onPress={reset} />
              </View>
            )}
          </View>
        }
        ListEmptyComponent={
          loading ? (
            <View
              accessibilityLabel="Đang tải danh sách phòng"
              style={{ gap: 14 }}
            >
              {[1, 2, 3].map((i) => (
                <View
                  key={i}
                  style={{
                    height: 220,
                    backgroundColor: colors.soft,
                    borderRadius: 20,
                  }}
                />
              ))}
            </View>
          ) : (
            <Empty
              title="Chưa tìm thấy phòng phù hợp"
              text="Thử điều chỉnh hoặc xóa bớt tiêu chí lọc để xem thêm các phòng học khác."
            />
          )
        }
      />
    </Screen>
  );
}

const feedStyles = StyleSheet.create({
  logoTag: {
    flexDirection: "row",
    alignItems: "center",
    gap: 6,
  },
  modeBadge: {
    flexDirection: "row",
    alignItems: "center",
    gap: 6,
    backgroundColor: colors.soft,
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 12,
  },
  statusDot: {
    width: 7,
    height: 7,
    borderRadius: 4,
  },
  offlineBanner: {
    backgroundColor: "#FEF9C3",
    borderColor: "#FACC15",
    borderWidth: 1,
    borderRadius: 12,
    padding: 12,
    flexDirection: "row",
    alignItems: "center",
    gap: 10,
  },
  offlineText: {
    flex: 1,
    fontSize: 13,
    color: "#854D0E",
    lineHeight: 18,
    fontWeight: "500",
  },
  heroCard: {
    backgroundColor: colors.ink,
    borderRadius: 22,
    padding: 24,
    gap: 12,
  },
  heroPre: {
    color: colors.accent,
    letterSpacing: 2,
    fontSize: 11,
    fontWeight: "700",
  },
});
