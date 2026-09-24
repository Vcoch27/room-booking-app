import { Room } from "./model";

// The array defines gallery order; retain the legacy cover when it is absent.
export function roomPhotos(
  room: Pick<Room, "imageUrl" | "imageUrls">,
): string[] {
  const candidates: unknown[] = Array.isArray(room.imageUrls)
    ? room.imageUrls
    : [];
  const photos = candidates
    .filter(
      (url): url is string =>
        typeof url === "string" && /^https?:\/\//i.test(url.trim()),
    )
    .map((url) => url.trim());
  if (!photos.length && room.imageUrl) photos.push(room.imageUrl);
  return [...new Set(photos)];
}
