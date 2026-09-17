import React from "react";
import {
  ActivityIndicator,
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  TextInputProps,
  View,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { Ionicons } from "@expo/vector-icons";
export const colors = {
  ink: "#173D35",
  muted: "#596C64",
  paper: "#F5F6F0",
  white: "#FFFFFF",
  line: "#D7DFD5",
  accent: "#DCEF86",
  danger: "#A02E32",
  soft: "#E6EDE4",
};
export const styles = StyleSheet.create({
  screen: { flex: 1, backgroundColor: colors.paper },
  content: {
    width: "100%",
    maxWidth: 920,
    alignSelf: "center",
    padding: 24,
    gap: 20,
    paddingBottom: 40,
  },
  title: {
    fontSize: 32,
    fontWeight: "700",
    color: colors.ink,
    letterSpacing: -1,
  },
  heading: { fontSize: 21, fontWeight: "700", color: colors.ink },
  text: { fontSize: 16, lineHeight: 24, color: colors.ink },
  muted: { fontSize: 14, lineHeight: 21, color: colors.muted },
  label: {
    fontSize: 12,
    fontWeight: "700",
    letterSpacing: 1.7,
    color: colors.muted,
  },
  row: {
    flexDirection: "row",
    alignItems: "center",
    gap: 12,
    flexWrap: "wrap",
  },
  card: {
    backgroundColor: colors.white,
    borderRadius: 18,
    borderWidth: 1,
    borderColor: colors.line,
    padding: 20,
    gap: 12,
  },
  input: {
    backgroundColor: colors.white,
    borderColor: colors.line,
    borderWidth: 1,
    borderRadius: 12,
    paddingHorizontal: 16,
    paddingVertical: 14,
    minHeight: 50,
    color: colors.ink,
    fontSize: 16,
  },
});
export function Screen({
  children,
  scroll = true,
}: {
  children: React.ReactNode;
  scroll?: boolean;
}) {
  return (
    <SafeAreaView style={styles.screen} edges={["left", "right"]}>
      {scroll ? (
        <ScrollView
          keyboardShouldPersistTaps="handled"
          contentContainerStyle={styles.content}
        >
          {children}
        </ScrollView>
      ) : (
        children
      )}
    </SafeAreaView>
  );
}
export function Button({
  title,
  onPress,
  disabled,
  secondary,
  busy,
  danger,
}: {
  title: string;
  onPress: () => void;
  disabled?: boolean;
  secondary?: boolean;
  busy?: boolean;
  danger?: boolean;
}) {
  return (
    <Pressable
      accessibilityRole="button"
      accessibilityState={{ disabled: disabled || busy, busy }}
      onPress={onPress}
      disabled={disabled || busy}
      style={({ pressed }) => ({
        minHeight: 50,
        padding: 14,
        borderRadius: 12,
        backgroundColor: secondary
          ? colors.soft
          : danger
            ? colors.danger
            : colors.ink,
        opacity: disabled || busy ? 0.5 : pressed ? 0.75 : 1,
        alignItems: "center",
        justifyContent: "center",
        flexDirection: "row",
        gap: 10,
      })}
    >
      {busy && (
        <ActivityIndicator color={secondary ? colors.ink : colors.white} />
      )}
      <Text
        style={{
          fontSize: 15,
          fontWeight: "700",
          color: secondary ? colors.ink : colors.white,
        }}
      >
        {title}
      </Text>
    </Pressable>
  );
}
export function Chip({
  label,
  selected,
  onPress,
  disabled,
}: {
  label: string;
  selected?: boolean;
  onPress: () => void;
  disabled?: boolean;
}) {
  return (
    <Pressable
      onPress={onPress}
      disabled={disabled}
      accessibilityRole="button"
      accessibilityState={{ selected, disabled }}
      style={{
        minHeight: 44,
        paddingHorizontal: 14,
        paddingVertical: 11,
        borderRadius: 10,
        borderWidth: 1,
        borderColor: selected ? colors.ink : colors.line,
        backgroundColor: selected ? colors.ink : colors.white,
        opacity: disabled ? 0.5 : 1,
      }}
    >
      <Text
        style={{
          color: selected ? colors.white : colors.ink,
          fontWeight: "600",
        }}
      >
        {selected ? "✓ " : ""}
        {label}
      </Text>
    </Pressable>
  );
}
export function Field({ label, ...props }: TextInputProps & { label: string }) {
  return (
    <View style={{ gap: 8 }}>
      <Text style={styles.muted}>{label}</Text>
      <TextInput
        accessibilityLabel={label}
        placeholderTextColor={colors.muted}
        style={styles.input}
        {...props}
      />
    </View>
  );
}
export function Notice({
  text,
  error = false,
}: {
  text: string;
  error?: boolean;
}) {
  if (!text) return null;
  return (
    <View
      accessibilityRole={error ? "alert" : "text"}
      style={{
        backgroundColor: error ? "#FCECEE" : colors.soft,
        padding: 14,
        borderRadius: 10,
        flexDirection: "row",
        gap: 10,
      }}
    >
      <Ionicons
        name={error ? "alert-circle-outline" : "information-circle-outline"}
        size={20}
        color={error ? colors.danger : colors.ink}
      />
      <Text
        style={[
          styles.muted,
          { flex: 1, color: error ? colors.danger : colors.ink },
        ]}
      >
        {text}
      </Text>
    </View>
  );
}
export function Empty({ title, text }: { title: string; text: string }) {
  return (
    <View style={{ paddingVertical: 36, gap: 12 }}>
      <Ionicons name="leaf-outline" size={36} color={colors.muted} />
      <Text style={styles.heading}>{title}</Text>
      <Text style={styles.muted}>{text}</Text>
    </View>
  );
}
