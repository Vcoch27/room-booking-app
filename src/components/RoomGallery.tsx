import React, { useRef, useState } from "react";
import {
  ActivityIndicator,
  FlatList,
  Image,
  Modal,
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  View,
  useWindowDimensions,
} from "react-native";
import {
  useSafeAreaInsets,
} from "react-native-safe-area-context";
import { Room } from "../domain/model";
import { roomPhotos } from "../domain/roomPhotos";
import { RoomImage } from "./RoomImage";
import { useGalleryKeys } from "../hooks/useGalleryKeys";
import { colors } from "./ui";

function Photo({
  uri,
  width,
  height,
  full = false,
}: {
  uri: string;
  width: number;
  height: number;
  full?: boolean;
}) {
  const [status, setStatus] = useState<"loading" | "ready" | "error">(
    "loading",
  );
  const [attempt, setAttempt] = useState(0);
  return (
    <View
      style={{
        width,
        height,
        alignItems: "center",
        justifyContent: "center",
        backgroundColor: full ? "#101817" : colors.soft,
      }}
    >
      {status !== "error" && (
        <Image
          key={attempt}
          source={{ uri }}
          resizeMode={full ? "contain" : "cover"}
          style={StyleSheet.absoluteFill}
          onLoad={() => setStatus("ready")}
          onError={() => setStatus("error")}
        />
      )}
      {status === "loading" && (
        <ActivityIndicator color={full ? "#fff" : colors.ink} />
      )}
      {status === "error" && (
        <Pressable
          accessibilityRole="button"
          onPress={() => {
            setStatus("loading");
            setAttempt(attempt + 1);
          }}
          style={s.button}
        >
          <Text style={{ color: full ? "#fff" : colors.ink }}>
            Ảnh chưa tải được · Thử lại
          </Text>
        </Pressable>
      )}
    </View>
  );
}

export function RoomGallery({ room }: { room: Room }) {
  const photos = roomPhotos(room);
  const [selected, setSelected] = useState(0);
  const [opened, setOpened] = useState(false);
  const [previewWidth, setPreviewWidth] = useState(1);
  const [viewerHeight, setViewerHeight] = useState(1);
  const { width } = useWindowDimensions();
  const insets = useSafeAreaInsets();
  const list = useRef<FlatList<string>>(null);
  const index = Math.min(selected, Math.max(0, photos.length - 1));
  const move = (next: number) => {
    setSelected(next);
    list.current?.scrollToOffset({ offset: next * width, animated: true });
  };
  useGalleryKeys(opened, index, photos.length, move, () => setOpened(false));
  if (!photos.length) return <RoomImage room={room} height={220} />;
  return (
    <View style={{ gap: 10 }}>
      {room.imagesAreIllustrative && (
        <Text style={{ color: colors.muted, fontSize: 12 }}>
          Ảnh minh họa không gian · Chưa phải ảnh chụp thực tế của phòng
        </Text>
      )}
      <Pressable
        onLayout={(event) => setPreviewWidth(event.nativeEvent.layout.width)}
        accessibilityRole="button"
        accessibilityLabel={`Mở bộ ảnh ${room.name}, ảnh ${index + 1} trên ${photos.length}`}
        onPress={() => setOpened(true)}
        style={s.hero}
      >
        <Photo
          key={photos[index]}
          uri={photos[index]}
          width={previewWidth}
          height={240}
        />
        <View style={s.caption}>
          <Text style={s.white}>
            Xem ảnh đầy đủ · {index + 1}/{photos.length}
          </Text>
        </View>
      </Pressable>
      {photos.length > 1 && (
        <ScrollView
          horizontal
          showsHorizontalScrollIndicator={false}
          contentContainerStyle={{ gap: 8 }}
        >
          {photos.map((uri, position) => (
            <Pressable
              key={uri}
              onPress={() => setSelected(position)}
              accessibilityRole="button"
              accessibilityLabel={`Xem ảnh ${position + 1}`}
              accessibilityState={{ selected: position === index }}
              style={[
                s.thumbnail,
                position === index && { borderColor: colors.ink },
              ]}
            >
              <Photo uri={uri} width={76} height={58} />
            </Pressable>
          ))}
        </ScrollView>
      )}
      <Modal
        visible={opened}
        animationType="fade"
        statusBarTranslucent
        onRequestClose={() => setOpened(false)}
      >
        {/* Dark fullscreen backdrop — không dùng SafeAreaView ở đây vì
            Modal với statusBarTranslucent cần tính insets thủ công */}
        <View style={[s.viewer]}>
          {/* ── TOP TOOLBAR: padding = Dynamic Island / notch ── */}
          <View
            style={[
              s.toolbar,
              {
                paddingTop: insets.top + 8,
                paddingBottom: 8,
                paddingLeft: insets.left,
                paddingRight: insets.right,
              },
            ]}
          >
            <Text numberOfLines={2} style={[s.white, { flex: 1 }]}>
              {room.name}
            </Text>
            <Pressable
              accessibilityRole="button"
              accessibilityLabel="Đóng bộ ảnh"
              onPress={() => setOpened(false)}
              style={s.button}
            >
              <Text style={s.white}>Đóng ✕</Text>
            </Pressable>
          </View>

          {/* ── PHOTO VIEWER (fills remaining space) ── */}
          <View
            style={{ flex: 1 }}
            onLayout={(event) =>
              setViewerHeight(event.nativeEvent.layout.height)
            }
          >
            {opened && (
              <FlatList
                key={width}
                ref={list}
                horizontal
                pagingEnabled
                data={photos}
                extraData={viewerHeight}
                initialScrollIndex={index}
                getItemLayout={(_, position) => ({
                  length: width,
                  offset: width * position,
                  index: position,
                })}
                keyExtractor={(uri) => uri}
                showsHorizontalScrollIndicator={false}
                onMomentumScrollEnd={(event) =>
                  setSelected(
                    Math.max(
                      0,
                      Math.min(
                        photos.length - 1,
                        Math.round(
                          event.nativeEvent.contentOffset.x / width,
                        ),
                      ),
                    ),
                  )
                }
                renderItem={({ item, index: position }) => (
                  <View
                    accessibilityLabel={`Ảnh ${position + 1} trên ${photos.length}`}
                  >
                    <Photo
                      uri={item}
                      width={width}
                      height={viewerHeight}
                      full
                    />
                  </View>
                )}
              />
            )}
          </View>

          {/* ── BOTTOM TOOLBAR: padding = home indicator ── */}
          <View
            style={[
              s.toolbar,
              {
                paddingTop: 8,
                paddingBottom: insets.bottom + 8,
                paddingLeft: insets.left,
                paddingRight: insets.right,
              },
            ]}
          >
            <Pressable
              accessibilityRole="button"
              accessibilityLabel="Ảnh trước"
              disabled={index === 0}
              style={[s.button, { opacity: index === 0 ? 0.3 : 1 }]}
              onPress={() => move(index - 1)}
            >
              <Text style={s.white}>← Trước</Text>
            </Pressable>
            <Text style={s.white}>
              {index + 1} / {photos.length}
            </Text>
            <Pressable
              accessibilityRole="button"
              accessibilityLabel="Ảnh tiếp theo"
              disabled={index === photos.length - 1}
              style={[
                s.button,
                { opacity: index === photos.length - 1 ? 0.3 : 1 },
              ]}
              onPress={() => move(index + 1)}
            >
              <Text style={s.white}>Sau →</Text>
            </Pressable>
          </View>
        </View>
      </Modal>
    </View>
  );
}

const s = StyleSheet.create({
  hero: { borderRadius: 16, overflow: "hidden" },
  caption: {
    position: "absolute",
    bottom: 12,
    right: 12,
    backgroundColor: "#16342Edd",
    padding: 10,
    borderRadius: 8,
  },
  white: { color: "#fff", fontSize: 15, fontWeight: "600" },
  thumbnail: {
    borderWidth: 2,
    borderColor: "transparent",
    padding: 2,
    borderRadius: 10,
    overflow: "hidden",
  },
  viewer: { flex: 1, backgroundColor: "#101817" },
  toolbar: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    paddingHorizontal: 12,
    gap: 8,
  },
  button: {
    minHeight: 48,
    paddingHorizontal: 12,
    alignItems: "center",
    justifyContent: "center",
  },
});
