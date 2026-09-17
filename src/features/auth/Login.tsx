import React, { useState } from "react";
import { KeyboardAvoidingView, Platform, Text, View } from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { useApp } from "../../app/Provider";
import {
  Button,
  Field,
  Notice,
  Screen,
  colors,
  styles,
} from "../../components/ui";
export function Login() {
  const { repository } = useApp();
  const [email, setEmail] = useState(
    repository.mode === "demo" ? "sinhvien@vku.udn.vn" : "",
  );
  const [password, setPassword] = useState("");
  const [register, setRegister] = useState(false);
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState("");
  const submit = async () => {
    setError("");
    if (!/^\S+@\S+\.\S+$/.test(email.trim()))
      return setError("Nhập một địa chỉ email hợp lệ.");
    if (repository.mode === "firebase" && password.length < 8)
      return setError("Mật khẩu cần ít nhất 8 ký tự.");
    setBusy(true);
    try {
      await repository.login(email, password, register);
    } catch {
      setError(
        "Không thể đăng nhập. Kiểm tra tài khoản, mật khẩu và kết nối; hoặc tạo tài khoản mới.",
      );
    } finally {
      setBusy(false);
    }
  };
  return (
    <KeyboardAvoidingView
      style={{ flex: 1 }}
      behavior={Platform.OS === "ios" ? "padding" : undefined}
    >
      <Screen>
        <View
          style={{
            paddingTop: 48,
            gap: 24,
            maxWidth: 480,
            width: "100%",
            alignSelf: "center",
          }}
        >
          <Ionicons name="shapes-outline" size={40} color={colors.ink} />
          <Text style={styles.label}>VKU / STUDYSPACE</Text>
          <Text style={[styles.title, { fontSize: 44 }]}>
            Một chỗ ngồi.{"\n"}Nhiều ý tưởng.
          </Text>
          <Text style={styles.text}>
            Tìm không gian của bạn, dành thời gian cho điều quan trọng.
          </Text>
          <View style={[styles.card, { marginTop: 12 }]}>
            <Text style={styles.heading}>
              {register ? "Tạo tài khoản" : "Chào bạn trở lại"}
            </Text>
            <Field
              label="Email"
              value={email}
              onChangeText={setEmail}
              keyboardType="email-address"
              autoCapitalize="none"
              autoComplete="email"
            />
            {repository.mode === "firebase" && (
              <Field
                label="Mật khẩu"
                value={password}
                onChangeText={setPassword}
                secureTextEntry
                autoComplete={register ? "new-password" : "current-password"}
              />
            )}
            <Notice text={error} error />
            <Button
              title={
                repository.mode === "demo"
                  ? "Khám phá bản demo"
                  : register
                    ? "Tạo tài khoản"
                    : "Đăng nhập"
              }
              onPress={submit}
              busy={busy}
            />
            {repository.mode === "firebase" && (
              <Button
                title={
                  register
                    ? "Đã có tài khoản? Đăng nhập"
                    : "Chưa có tài khoản? Đăng ký"
                }
                secondary
                onPress={() => setRegister(!register)}
              />
            )}
          </View>
          {repository.mode === "demo" && (
            <Notice text="Bản demo lưu lịch trên thiết bị này, không xác thực mật khẩu và không đồng bộ giữa các thiết bị. Dữ liệu phòng là dữ liệu mẫu." />
          )}
          <Text style={styles.muted}>Dành cho cộng đồng học tập VKU.</Text>
        </View>
      </Screen>
    </KeyboardAvoidingView>
  );
}
