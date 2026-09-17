import React from "react";
import { ActivityIndicator, Image, Text, View } from "react-native";
import { StatusBar } from "expo-status-bar";
import { NavigationContainer, DefaultTheme } from "@react-navigation/native";
import { createNativeStackNavigator } from "@react-navigation/native-stack";
import { createBottomTabNavigator } from "@react-navigation/bottom-tabs";
import { SafeAreaProvider } from "react-native-safe-area-context";
import { Ionicons } from "@expo/vector-icons";
import { AppProvider, useApp } from "./src/app/Provider";
import { RootStack } from "./src/app/navigation";
import { colors, styles } from "./src/components/ui";
import { Login } from "./src/features/auth/Login";
import { Feed } from "./src/features/rooms/Feed";
import { Detail } from "./src/features/rooms/Detail";
import { Review } from "./src/features/bookings/Review";
import { Pass } from "./src/features/bookings/Pass";
import { Bookings } from "./src/features/bookings/Bookings";
import { Account } from "./src/features/account/Account";
const Stack = createNativeStackNavigator<RootStack>();
const Tabs = createBottomTabNavigator();
const Favorites = () => <Feed favoritesOnly />;
function MainTabs() {
  return (
    <Tabs.Navigator
      screenOptions={({ route }) => ({
        headerShown: false,
        tabBarActiveTintColor: colors.ink,
        tabBarInactiveTintColor: colors.muted,
        tabBarStyle: {
          backgroundColor: colors.white,
          borderTopColor: colors.line,
        },
        tabBarIcon: ({ color, size }) => (
          <Ionicons
            color={color}
            size={size}
            name={
              (
                {
                  Explore: "grid-outline",
                  Bookings: "calendar-outline",
                  Favorites: "heart-outline",
                  Account: "person-outline",
                } as const
              )[route.name as "Explore"]
            }
          />
        ),
      })}
    >
      <Tabs.Screen
        name="Explore"
        component={Feed}
        options={{ title: "Khám phá" }}
      />
      <Tabs.Screen
        name="Bookings"
        component={Bookings}
        options={{ title: "Lịch của tôi" }}
      />
      <Tabs.Screen
        name="Favorites"
        component={Favorites}
        options={{ title: "Yêu thích" }}
      />
      <Tabs.Screen
        name="Account"
        component={Account}
        options={{ title: "Tài khoản" }}
      />
    </Tabs.Navigator>
  );
}
function Navigation() {
  const { session, ready } = useApp();
  if (!ready)
    return <ActivityIndicator style={{ flex: 1 }} color={colors.ink} />;
  return (
    <NavigationContainer
      theme={{
        ...DefaultTheme,
        colors: {
          ...DefaultTheme.colors,
          background: colors.paper,
          primary: colors.ink,
        },
      }}
    >
      {!session ? (
        <Login />
      ) : (
        <Stack.Navigator
          screenOptions={{
            headerStyle: { backgroundColor: colors.paper },
            headerTintColor: colors.ink,
            headerShadowVisible: false,
            contentStyle: { backgroundColor: colors.paper },
          }}
        >
          <Stack.Screen
            name="Home"
            component={MainTabs}
            options={{
              headerTitle: () => (
                <View
                  style={{ flexDirection: "row", alignItems: "center", gap: 8 }}
                >
                  <Image
                    source={require("./logo.png")}
                    resizeMode="contain"
                    style={{ width: 34, height: 34 }}
                  />
                  <Text
                    style={{
                      color: colors.ink,
                      fontSize: 18,
                      fontWeight: "700",
                    }}
                  >
                    StudySpace
                  </Text>
                </View>
              ),
            }}
          />
          <Stack.Screen
            name="Room"
            component={Detail}
            options={{ title: "Không gian học tập" }}
          />
          <Stack.Screen
            name="Review"
            component={Review}
            options={{ title: "Kiểm tra lịch đặt" }}
          />
          <Stack.Screen
            name="Pass"
            component={Pass}
            options={{ title: "Vé đặt phòng" }}
          />
        </Stack.Navigator>
      )}
    </NavigationContainer>
  );
}
class ErrorBoundary extends React.Component<
  { children: React.ReactNode },
  { message: string }
> {
  state = { message: "" };
  static getDerivedStateFromError(error: Error) {
    return { message: error.message };
  }
  render() {
    return this.state.message ? (
      <View style={[styles.content, { paddingTop: 80 }]}>
        <Text style={styles.heading}>Ứng dụng chưa thể khởi động</Text>
        <Text style={styles.text}>{this.state.message}</Text>
        <Text style={styles.muted}>
          Kiểm tra cấu hình rồi tải lại ứng dụng.
        </Text>
      </View>
    ) : (
      this.props.children
    );
  }
}
export default function App() {
  return (
    <SafeAreaProvider>
      <StatusBar style="dark" />
      <ErrorBoundary>
        <AppProvider>
          <Navigation />
        </AppProvider>
      </ErrorBoundary>
    </SafeAreaProvider>
  );
}
