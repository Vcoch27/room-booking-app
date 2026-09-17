import React, { useState } from "react";
import {
  Image,
  KeyboardAvoidingView,
  Platform,
  Pressable,
  Text,
  View,
} from "react-native";
import Constants from "expo-constants";
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
  const googleRequiresDevelopmentBuild =
    Platform.OS !== "web" && Constants.appOwnership === "expo";
  const submit = async () => {
    setError("");
    if (!/^\S+@\S+\.\S+$/.test(email.trim()))
      return setError("Nhập một địa chỉ email hợp lệ.");
    if (repository.mode === "firebase" && password.length < 6)
      return setError("Mật khẩu cần ít nhất 6 ký tự.");
    setBusy(true);
    try {
      await repository.login(email, password, register);
    } catch (e) {
      setError(
        e instanceof Error
          ? e.message
          : "Không thể đăng nhập. Kiểm tra lại thông tin và kết nối mạng.",
      );
    } finally {
      setBusy(false);
    }
  };

  const submitGoogle = async () => {
    setError("");
    setBusy(true);
    try {
      await repository.loginWithGoogle();
    } catch (e) {
      setError(e instanceof Error ? e.message : "Không thể đăng nhập Google.");
    } finally {
      setBusy(false);
    }
  };

  const quickDemoLogin = () => {
    setEmail("sinhvien@vku.udn.vn");
    if (repository.mode === "firebase") {
      setPassword("vku123456");
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
          <Image
            source={require("../../../logo.png")}
            accessibilityLabel="VKU StudySpace"
            resizeMode="contain"
            style={{ width: 156, height: 156, alignSelf: "center" }}
          />
          <Text style={[styles.label, { textAlign: "center" }]}>
            VKU / STUDYSPACE
          </Text>
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
              <>
                <View
                  style={{
                    flexDirection: "row",
                    alignItems: "center",
                    gap: 12,
                  }}
                >
                  <View
                    style={{ height: 1, flex: 1, backgroundColor: colors.line }}
                  />
                  <Text style={styles.muted}>hoặc</Text>
                  <View
                    style={{ height: 1, flex: 1, backgroundColor: colors.line }}
                  />
                </View>
                <Pressable
                  accessibilityRole="button"
                  accessibilityLabel="Tiếp tục với Google"
                  accessibilityState={{
                    disabled: busy || googleRequiresDevelopmentBuild,
                    busy,
                  }}
                  disabled={busy || googleRequiresDevelopmentBuild}
                  onPress={submitGoogle}
                  style={({ pressed }) => ({
                    minHeight: 50,
                    borderRadius: 12,
                    borderWidth: 1,
                    borderColor: colors.line,
                    backgroundColor: colors.white,
                    opacity:
                      busy || googleRequiresDevelopmentBuild
                        ? 0.5
                        : pressed
                          ? 0.75
                          : 1,
                    flexDirection: "row",
                    alignItems: "center",
                    justifyContent: "center",
                    gap: 12,
                  })}
                >
                  <Text
                    style={{
                      fontSize: 20,
                      fontWeight: "800",
                      color: "#4285F4",
                    }}
                  >
                    G
                  </Text>
                  <Text
                    style={{
                      color: colors.ink,
                      fontWeight: "700",
                      fontSize: 15,
                    }}
                  >
                    Tiếp tục với Google
                  </Text>
                </Pressable>
                {googleRequiresDevelopmentBuild && (
                  <Notice text="Đăng nhập Google cần bản development build. Email/mật khẩu vẫn dùng được trong Expo Go." />
                )}
                <Button
                  title={
                    register
                      ? "Đã có tài khoản? Đăng nhập"
                      : "Chưa có tài khoản? Đăng ký"
                  }
                  secondary
                  onPress={() => setRegister(!register)}
                />
                <Button
                  title="Điền nhanh tài khoản mẫu VKU"
                  secondary
                  onPress={quickDemoLogin}
                />
              </>
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
