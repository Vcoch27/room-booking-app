import React, { useCallback, useMemo, useState } from "react";
import { FlatList, Text, View } from "react-native";
import { useNavigation } from "@react-navigation/native";
import { NativeStackNavigationProp } from "@react-navigation/native-stack";
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
export function Feed({ favoritesOnly = false }: { favoritesOnly?: boolean }) {
  const { rooms, loading, online, stale, error, retry, repository } = useApp();
  const filters = usePreferences((s) => s.filters);
  const setFilters = usePreferences((s) => s.setFilters);
  const reset = usePreferences((s) => s.resetFilters);
  const favorites = usePreferences((s) => s.favorites);
  const toggle = usePreferences((s) => s.toggleFavorite);
  const [expanded, setExpanded] = useState(false);
  const navigation = useNavigation<NativeStackNavigationProp<RootStack>>();
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
        onFavorite={toggle}
      />
    ),
    [open, favorites, toggle],
  );
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
        ListHeaderComponent={
          <View style={{ gap: 20, marginBottom: 20 }}>
            <View style={[styles.row, { justifyContent: "space-between" }]}>
              <Text style={styles.label}>VKU / STUDYSPACE</Text>
              <Text style={styles.muted}>
                {repository.mode === "demo" ? "Dữ liệu mẫu" : "Campus booking"}
              </Text>
            </View>
            <View
              style={{
                backgroundColor: colors.ink,
                borderRadius: 22,
                padding: 26,
                gap: 16,
              }}
            >
              <Text
                style={{
                  color: colors.accent,
                  letterSpacing: 2,
                  fontSize: 12,
                  fontWeight: "700",
                }}
              >
                KHÔNG GIAN CHO Ý TƯỞNG
              </Text>
              <Text
                style={[styles.title, { color: colors.white, fontSize: 36 }]}
              >
                {favoritesOnly
                  ? "Góc học quen thuộc."
                  : "Hôm nay,\nbạn học ở đâu?"}
              </Text>
              <Text style={{ color: "#DDE6DA", lineHeight: 23, fontSize: 15 }}>
                Phòng học nhóm & phòng máy. Chọn chỗ phù hợp cho buổi học tiếp
                theo.
              </Text>
              <Text style={{ color: colors.accent, fontWeight: "600" }}>
                01 Tìm phòng 02 Chọn giờ 03 Sẵn sàng
              </Text>
            </View>
            {(!online || stale) && (
              <Notice text="Đang xem dữ liệu đã lưu. Cần kết nối và dữ liệu mới để đặt phòng." />
            )}
            <Notice text={error} error />
            {!!error && (
              <Button title="Thử tải lại" secondary onPress={retry} />
            )}
            <Field
              label="Tìm không gian"
              placeholder="Tên phòng, tòa nhà…"
              value={filters.search}
              onChangeText={(search) => setFilters({ search })}
            />
            <View style={[styles.row, { justifyContent: "space-between" }]}>
              <Text style={styles.heading}>
                {favoritesOnly ? "Phòng yêu thích" : "Khám phá phòng"} ·{" "}
                {data.length}
              </Text>
              <Chip
                label={expanded ? "Thu gọn bộ lọc" : "Bộ lọc"}
                selected={expanded}
                onPress={() => setExpanded(!expanded)}
              />
            </View>
            {expanded && (
              <View style={{ gap: 12 }}>
                <Text style={styles.muted}>Tòa nhà</Text>
                <View style={styles.row}>
                  {["", ...new Set(rooms.map((r) => r.building))].map(
                    (building) => (
                      <Chip
                        key={building}
                        label={building || "Tất cả"}
                        selected={filters.building === building}
                        onPress={() => setFilters({ building })}
                      />
                    ),
                  )}
                </View>
                <Text style={styles.muted}>Số chỗ tối thiểu</Text>
                <View style={styles.row}>
                  {[0, 4, 8, 16, 30].map((capacity) => (
                    <Chip
                      key={capacity}
                      label={capacity ? `${capacity}+ chỗ` : "Bất kỳ"}
                      selected={filters.capacity === capacity}
                      onPress={() => setFilters({ capacity })}
                    />
                  ))}
                </View>
                <Text style={styles.muted}>Thiết bị cần có</Text>
                <View style={styles.row}>
                  {(
                    [
                      "Wi-Fi",
                      "Máy chiếu",
                      "Bảng trắng",
                      "Máy tính",
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
                <Button title="Xóa bộ lọc" secondary onPress={reset} />
              </View>
            )}
          </View>
        }
        ListEmptyComponent={
          loading ? (
            <View accessibilityLabel="Đang tải phòng" style={{ gap: 14 }}>
              {[1, 2, 3].map((i) => (
                <View
                  key={i}
                  style={{
                    height: 170,
                    backgroundColor: colors.soft,
                    borderRadius: 18,
                  }}
                />
              ))}
            </View>
          ) : (
            <Empty
              title="Chưa tìm thấy không gian"
              text="Thử bỏ bớt bộ lọc hoặc đánh dấu một phòng yêu thích."
            />
          )
        }
      />
    </Screen>
  );
}
