import { EMPTY_CARD_WIDTH } from "@/constants/values";
import { useMemo } from "react";

export function useItemCardSizes(items, itemHeight) {
  return useMemo(
    () =>
      items.map((item) =>
        item.cardImage
          ? itemHeight * item.cardImage.aspectRatio
          : EMPTY_CARD_WIDTH,
      ),
    [items, itemHeight],
  );
}
