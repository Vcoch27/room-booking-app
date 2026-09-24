import AsyncStorage from "@react-native-async-storage/async-storage";
// Firebase exposes this in the React Native runtime but omits it from the public web declarations.
// @ts-expect-error RN-specific export is selected by Metro's react-native condition.
import { getReactNativePersistence } from "firebase/auth";
export const authPersistence = getReactNativePersistence(AsyncStorage);
