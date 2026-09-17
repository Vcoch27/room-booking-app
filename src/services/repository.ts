import {
  Booking,
  BookingIntent,
  Room,
  Session,
  SlotLock,
} from "../domain/model";
export type Unsubscribe = () => void;
export type Snapshot<T> = { data: T; stale: boolean };
export interface Repository {
  mode: "demo" | "firebase";
  observeSession(next: (session: Session | null) => void): Unsubscribe;
  login(email: string, password: string, register: boolean): Promise<void>;
  logout(): Promise<void>;
  rooms(
    next: (value: Snapshot<Room[]>) => void,
    error: (e: Error) => void,
  ): Unsubscribe;
  bookings(
    uid: string,
    next: (value: Snapshot<Booking[]>) => void,
    error: (e: Error) => void,
  ): Unsubscribe;
  availability(
    roomId: string,
    date: string,
    next: (value: Snapshot<SlotLock[]>) => void,
    error: (e: Error) => void,
  ): Unsubscribe;
  create(intent: BookingIntent): Promise<Booking>;
  cancel(id: string): Promise<void>;
}
