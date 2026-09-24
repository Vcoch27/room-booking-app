import type { NavigatorScreenParams } from "@react-navigation/native";
export type MainTabs = {
  Explore: undefined;
  Bookings: undefined;
  Favorites: undefined;
  Account: undefined;
};
export type RootStack = {
  Home: NavigatorScreenParams<MainTabs> | undefined;
  Room: { roomId: string };
  Review: {
    roomId: string;
    date: string;
    slotId: string;
    idempotencyKey: string;
  };
  Pass: { bookingId: string };
};
