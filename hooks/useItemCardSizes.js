import { EMPTY_CARD_WIDTH } from "@/constants/values";
import { useEffect, useMemo, useState } from "react";
import { getCachedAspectRatio, loadAspectRatio } from "./useImageAspectRatio";

export function useItemCardSizes(items, itemHeight) {
  const [aspectRatios, setAspectRatios] = useState(() => {
    const initial = {};
    items.forEach((item) => {
      initial[item.itemId] = getCachedAspectRatio(item.cardImage) ?? 1;
    });
    return initial;
  });
  const itemKey = useMemo(
    () => items.map((it) => `${it.itemId}:${it.cardImage}`).join(","),
    [items],
  );

  useEffect(() => {
    let cancelled = false;
    items.forEach((item) => {
      if (!item.cardImage) return;
      loadAspectRatio(item.cardImage, (ratio) => {
        if (cancelled) return;
        setAspectRatios((prev) => {
          if (prev[item.itemId] === ratio) return prev;
          return { ...prev, [item.itemId]: ratio };
        });
      });
    });
    return () => {
      cancelled = true;
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [itemKey]);

  return useMemo(
    () =>
      items.map((item) =>
        item.cardImage
          ? itemHeight * (aspectRatios[item.itemId] ?? 1)
          : EMPTY_CARD_WIDTH,
      ),
    [items, aspectRatios, itemHeight],
  );
}
