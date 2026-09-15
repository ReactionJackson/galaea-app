import { useEffect, useMemo, useState } from "react";
import { getCachedAspectRatio, loadAspectRatio } from "./useImageAspectRatio";

// Loads each item's card-image aspect ratio (falling back to a 1:1 square
// while unknown or on failure) and derives a fixed-height, aspect-correct
// width for each — shared by CollectionTrack and the journal's item-picker
// track so both size their cards identically.
export function useItemCardSizes(items, itemHeight) {
  const [aspectRatios, setAspectRatios] = useState(() =>
    items.map((item) => getCachedAspectRatio(item.cardImage) ?? 1),
  );
  const itemKey = useMemo(
    () => items.map((it) => `${it.itemId}:${it.cardImage}`).join(","),
    [items],
  );

  useEffect(() => {
    let cancelled = false;
    items.forEach((item, i) => {
      if (!item.cardImage) return;
      loadAspectRatio(item.cardImage, (ratio) => {
        if (cancelled) return;
        setAspectRatios((prev) => {
          if (prev[i] === ratio) return prev;
          const next = [...prev];
          next[i] = ratio;
          return next;
        });
      });
    });
    return () => {
      cancelled = true;
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [itemKey]);

  return useMemo(
    () => aspectRatios.map((ratio) => itemHeight * ratio),
    [aspectRatios, itemHeight],
  );
}
