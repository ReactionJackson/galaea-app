import { useEffect, useMemo, useRef, useState } from "react";
import { useAnimatedRef } from "react-native-reanimated";

// Known holes in this first draft:
//
// 1. Add item button: needs a slot after the last item that cannot be reached
//    by swiping, only by tapping it (old hook kept paddingEnd short, then
//    expanded it on tap and scrolled in).
// 2. Removing the active item: activeId is left pointing at an id that no
//    longer exists, so it needs to fall back to a neighbour.
// 3. Adding an item: should it become active and scroll into view?
// 4. Initial scroll: nothing scrolls to initialId on first layout yet, and
//    paddingStart is 0 until the track has been measured.
// 5. Swap animation: the re-centre scroll runs at the same time as the swap
//    animation, so durations may need matching.
// 6. Haptics, and "tap the already active item" behaviour, are left to the
//    caller via onChange for now.

const getNearestIndex = (offsets, x) =>
  offsets.reduce(
    (nearest, offset, index) =>
      Math.abs(offset - x) < Math.abs(offsets[nearest] - x) ? index : nearest,
    0,
  );

export const useNavigatorScroll = ({
  itemIds,
  itemWidths,
  gap = 10,
  initialId = itemIds[0],
  onChange,
}) => {
  const ref = useAnimatedRef();
  const [activeId, setActiveId] = useState(initialId);
  const [trackWidth, setTrackWidth] = useState(0);
  const previousActive = useRef({ id: activeId, offset: null });

  const activeIndex = Math.max(0, itemIds.indexOf(activeId));

  const offsets = useMemo(() => {
    let edge = 0;
    return itemWidths.map((width) => {
      const offset = edge + (width - itemWidths[0]) / 2;
      edge += width + gap;
      return offset;
    });
  }, [itemWidths, gap]);

  const paddingStart = Math.max(0, trackWidth / 2 - itemWidths[0] / 2);
  const paddingEnd = Math.max(0, trackWidth / 2 - itemWidths.at(-1) / 2);
  const activeOffset = offsets[activeIndex];

  // Effects:

  useEffect(() => {
    const previous = previousActive.current;
    if (previous.id === activeId && previous.offset !== activeOffset) {
      ref.current?.scrollTo({ x: activeOffset, animated: true });
    }
    previousActive.current = { id: activeId, offset: activeOffset };
  }, [activeId, activeOffset, ref]);

  // Handlers:

  const activate = (index) => {
    const id = itemIds[index];
    if (id === activeId) return;
    setActiveId(id);
    onChange?.(id);
  };

  const goTo = (index) => {
    ref.current?.scrollTo({ x: offsets[index], animated: true });
    activate(index);
  };

  const handleScrollEnd = (event) => {
    activate(getNearestIndex(offsets, event.nativeEvent.contentOffset.x));
  };

  const handleLayout = (event) => {
    setTrackWidth(event.nativeEvent.layout.width);
  };

  return {
    ref,
    activeId,
    activeIndex,
    offsets,
    paddingStart,
    paddingEnd,
    goTo,
    handleScrollEnd,
    handleLayout,
  };
};
