import { useEffect } from "react";

export function useGalleryKeys(
  open: boolean,
  index: number,
  count: number,
  move: (index: number) => void,
  close: () => void,
) {
  useEffect(() => {
    if (!open) return;
    const onKey = (event: KeyboardEvent) => {
      if (event.key === "Escape") close();
      else if (event.key === "ArrowRight") {
        event.preventDefault();
        move(Math.min(count - 1, index + 1));
      } else if (event.key === "ArrowLeft") {
        event.preventDefault();
        move(Math.max(0, index - 1));
      }
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [open, index, count, move, close]);
}
