import type { LinkingOptions } from "@react-navigation/native";
import type { RootStack } from "./navigation";

export const linking: LinkingOptions<RootStack> = {
  prefixes: ["studyspace://"],
  config: {
    initialRouteName: "Home",
    screens: {
      Home: {
        path: "",
        screens: {
          Explore: "",
          Bookings: "bookings",
          Favorites: "favorites",
          Account: "account",
        },
      },
      Room: "rooms/:roomId",
      Review: "review/:roomId/:date/:slotId/:idempotencyKey",
      Pass: "bookings/:bookingId",
    },
  },
};
