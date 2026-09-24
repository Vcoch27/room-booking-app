import { useEffect, useState } from "react";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { firstSnapshot, Subscribe } from "../services/firstSnapshot";
import type { Snapshot } from "../services/repository";

export function useRealtimeQuery<T>(
  key: string,
  subscribe: Subscribe<T>,
  enabled = true,
  persist = false,
) {
  const client = useQueryClient();
  const [streamError, setStreamError] = useState<Error | null>(null);
  const [revision, setRevision] = useState(0);
  const query = useQuery({
    queryKey: [key],
    enabled,
    queryFn: ({ signal }) => firstSnapshot(subscribe, signal),
    staleTime: Infinity,
    retry: 2,
  });
  useEffect(() => {
    if (!enabled) return;
    let active = true;
    let received = false;
    setStreamError(null);
    if (persist)
      void AsyncStorage.getItem(key)
        .then((raw) => {
          if (active && !received && raw && !client.getQueryData([key])) {
            client.setQueryData<Snapshot<T>>([key], {
              data: JSON.parse(raw) as T,
              stale: true,
            });
          }
        })
        .catch(() => {});
    const off = subscribe(
      (value) => {
        if (!active) return;
        received = true;
        setStreamError(null);
        client.setQueryData([key], value);
        if (persist)
          void AsyncStorage.setItem(key, JSON.stringify(value.data)).catch(
            () => {},
          );
      },
      (error) => {
        if (active) setStreamError(error);
      },
    );
    return () => {
      active = false;
      off();
    };
  }, [key, subscribe, enabled, persist, client, revision]);
  return {
    ...query,
    error: streamError ?? query.error,
    stale: !!streamError || !!query.error || query.data?.stale !== false,
    retry: () => {
      setRevision((value) => value + 1);
      void query.refetch();
    },
  };
}
