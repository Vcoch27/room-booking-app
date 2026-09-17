export type RootStack = {
  Home: undefined;
  Room: { roomId: string };
  Review: {
    roomId: string;
    date: string;
    slotId: string;
    idempotencyKey: string;
  };
  Pass: { bookingId: string };
};
