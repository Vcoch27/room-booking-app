import {
  GoogleAuthProvider,
  signInWithCredential,
  type Auth,
} from "firebase/auth";
import Constants from "expo-constants";

let configured = false;

export async function signInWithGoogle(auth: Auth): Promise<void> {
  if (Constants.appOwnership === "expo") {
    throw new Error(
      "Google Sign-In cần development build; Expo Go không hỗ trợ native Google OAuth.",
    );
  }

  const { GoogleSignin, isSuccessResponse } =
    await import("@react-native-google-signin/google-signin");
  if (!configured) {
    const webClientId = process.env.EXPO_PUBLIC_GOOGLE_WEB_CLIENT_ID;
    if (!webClientId) {
      throw new Error("Thiếu EXPO_PUBLIC_GOOGLE_WEB_CLIENT_ID trong .env.");
    }
    GoogleSignin.configure({ webClientId, offlineAccess: false });
    configured = true;
  }

  await GoogleSignin.hasPlayServices({ showPlayServicesUpdateDialog: true });
  const response = await GoogleSignin.signIn();
  if (!isSuccessResponse(response)) throw new Error("GOOGLE_CANCELLED");
  const idToken = response.data.idToken;
  if (!idToken) throw new Error("Google không trả về ID token.");

  const credential = GoogleAuthProvider.credential(idToken);
  await signInWithCredential(auth, credential);
}
