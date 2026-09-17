import React, { createContext, useContext, useEffect, useState } from "react";
import NetInfo from "@react-native-community/netinfo";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { Booking, Room, Session } from "../domain/model";
import { Repository } from "../services/repository";
import { createDemoRepository } from "../services/demo";
import { createFirebaseRepository } from "../services/firebase";

type State = {
  repository: Repository;
  session: Session | null;
  ready: boolean;
  rooms: Room[];
  bookings: Booking[];
  online: boolean;
  stale: boolean;
  loading: boolean;
  error: string;
  retry: () => void;
};
const Context = createContext<State | null>(null);
export const useApp = () => {
  const value = useContext(Context);
  if (!value) throw new Error("Missing Provider");
  return value;
};
export function AppProvider({ children }: { children: React.ReactNode }) {
  const [repository] = useState(() =>
    process.env.EXPO_PUBLIC_BACKEND === "firebase"
      ? createFirebaseRepository()
      : createDemoRepository(),
  );
  const [session, setSession] = useState<Session | null>(null);
  const [ready, setReady] = useState(false);
  const [rooms, setRooms] = useState<Room[]>([]);
  const [bookings, setBookings] = useState<Booking[]>([]);
  const [online, setOnline] = useState(true);
  const [stale, setStale] = useState(true);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [revision, setRevision] = useState(0);
  useEffect(
    () =>
      repository.observeSession((s) => {
        setSession(s);
        setReady(true);
      }),
    [repository],
  );
  useEffect(
    () =>
      NetInfo.addEventListener((s) =>
        setOnline(s.isConnected !== false && s.isInternetReachable !== false),
      ),
    [],
  );
  useEffect(() => {
    setBookings([]);
    setRooms([]);
    setError("");
    setLoading(true);
    setStale(true);
    if (!session) return;
    let active = true;
    let receivedRooms = false;
    let receivedBookings = false;
    const roomsKey = `rooms-cache:${repository.mode}`;
    const bookingsKey = `bookings-cache:${repository.mode}:${session.uid}`;
    void AsyncStorage.multiGet([roomsKey, bookingsKey])
      .then((values) => {
        if (!active) return;
        if (!receivedRooms && values[0][1]) {
          setRooms(JSON.parse(values[0][1]));
          setLoading(false);
        }
        if (!receivedBookings && values[1][1])
          setBookings(JSON.parse(values[1][1]));
      })
      .catch(() => {});
    const fail = (e: Error) => {
      setError(e.message);
      setLoading(false);
      setStale(true);
    };
    const offRooms = repository.rooms((s) => {
      receivedRooms = true;
      setRooms(s.data);
      setStale(s.stale);
      setLoading(false);
      void AsyncStorage.setItem(roomsKey, JSON.stringify(s.data)).catch(
        () => {},
      );
    }, fail);
    const offBookings = repository.bookings(
      session.uid,
      (s) => {
        receivedBookings = true;
        setBookings(s.data.sort((a, b) => b.createdAt - a.createdAt));
        void AsyncStorage.setItem(bookingsKey, JSON.stringify(s.data)).catch(
          () => {},
        );
      },
      fail,
    );
    return () => {
      active = false;
      offRooms();
      offBookings();
    };
  }, [repository, session, revision]);
  return (
    <Context.Provider
      value={{
        repository,
        session,
        ready,
        rooms,
        bookings,
        online,
        stale,
        loading,
        error,
        retry: () => setRevision((v) => v + 1),
      }}
    >
      {children}
    </Context.Provider>
  );
}
