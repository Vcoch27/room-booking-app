import React, {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useState,
} from "react";
import NetInfo from "@react-native-community/netinfo";
import {
  QueryClient,
  QueryClientProvider,
  onlineManager,
} from "@tanstack/react-query";
import { Booking, Room, Session } from "../domain/model";
import { Repository } from "../services/repository";
import { Subscribe } from "../services/firstSnapshot";
import { createDemoRepository } from "../services/demo";
import { createFirebaseRepository } from "../services/firebase";
import { useRealtimeQuery } from "../hooks/useRealtimeQuery";

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
function DataProvider({ children }: { children: React.ReactNode }) {
  const [repository] = useState(() =>
    process.env.EXPO_PUBLIC_BACKEND === "firebase"
      ? createFirebaseRepository()
      : createDemoRepository(),
  );
  const [session, setSession] = useState<Session | null>(null);
  const [ready, setReady] = useState(false);
  const [online, setOnline] = useState(true);
  useEffect(
    () =>
      repository.observeSession((value) => {
        setSession(value);
        setReady(true);
      }),
    [repository],
  );
  useEffect(
    () =>
      NetInfo.addEventListener((state) => {
        const connected =
          state.isConnected !== false && state.isInternetReachable !== false;
        setOnline(connected);
        onlineManager.setOnline(connected);
      }),
    [],
  );
  const subscribeRooms = useCallback<Subscribe<Room[]>>(
    (next, fail) => repository.rooms(next, fail),
    [repository],
  );
  const subscribeBookings = useCallback<Subscribe<Booking[]>>(
    (next, fail) => repository.bookings(session?.uid ?? "", next, fail),
    [repository, session?.uid],
  );
  const rooms = useRealtimeQuery(
    `rooms-cache:${repository.mode}`,
    subscribeRooms,
    !!session,
    true,
  );
  const bookings = useRealtimeQuery(
    `bookings-cache:${repository.mode}:${session?.uid ?? "signed-out"}`,
    subscribeBookings,
    !!session,
    true,
  );
  return (
    <Context.Provider
      value={{
        repository,
        session,
        ready,
        online,
        rooms: session ? (rooms.data?.data ?? []) : [],
        bookings: session
          ? [...(bookings.data?.data ?? [])].sort(
              (a, b) => b.createdAt - a.createdAt,
            )
          : [],
        stale: rooms.stale,
        loading: !!session && rooms.isPending,
        error: (rooms.error ?? bookings.error)?.message ?? "",
        retry: () => {
          rooms.retry();
          bookings.retry();
        },
      }}
    >
      {children}
    </Context.Provider>
  );
}
export function AppProvider({ children }: { children: React.ReactNode }) {
  const [client] = useState(
    () =>
      new QueryClient({
        defaultOptions: {
          queries: { gcTime: 5 * 60_000 },
          mutations: { retry: false },
        },
      }),
  );
  return (
    <QueryClientProvider client={client}>
      <DataProvider>{children}</DataProvider>
    </QueryClientProvider>
  );
}
