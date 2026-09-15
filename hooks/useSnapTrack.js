import * as Haptics from "expo-haptics";
import { useEffect, useMemo, useRef, useState } from "react";

// ─────────────────────────────────────────────────────────────────────────────
// useSnapTrack
//
// The scroll/snap/centre-load engine shared by the horizontal tracks (date
// circles in JournalTrack, box art in CollectionTrack). Positions are derived
// purely from itemWidths + itemSpacing (no onLayout measurement needed), so
// it works the same whether items are a uniform width or all different.
//
// Also owns the "+ add slot" gating: it isn't reachable by a normal swipe
// (paddingEnd is deliberately kept short so momentum can't carry you there),
// only by explicitly pressing it, which expands the padding and scrolls you
// in on purpose.
// ─────────────────────────────────────────────────────────────────────────────

export function useSnapTrack({
  itemWidths,
  itemSpacing = 10,
  showAddButton = true,
  addButtonWidth,
  startAtEnd = true,
  onSettle = () => {},
  onAdd = () => {},
  onCancelAdd = () => {},
}) {
  const itemCount = itemWidths.length;
  const ADD_INDEX = itemCount;
  const resolvedAddWidth = addButtonWidth ?? itemWidths[0] ?? 0;

  const [activeIndex, setActiveIndex] = useState(
    startAtEnd ? Math.max(0, itemCount - 1) : 0,
  );
  const [isScrolling, setIsScrolling] = useState(false);
  const [halfTrackWidth, setHalfTrackWidth] = useState(0);
  const [addActive, setAddActive] = useState(false);

  const trackRef = useRef(null);
  const scrollToAddAfterResize = useRef(false);
  const prevItemCountRef = useRef(itemCount);
  const hasScrolledToInitial = useRef(false);

  // Left edge of each item (real items, then the add slot appended at the
  // end), measured from the start of the content area (i.e. after
  // basePadding — item 0's left edge is always 0).
  const leftEdges = useMemo(() => {
    const edges = [];
    let cursor = 0;
    for (let i = 0; i < itemCount; i++) {
      edges.push(cursor);
      cursor += itemWidths[i] + itemSpacing;
    }
    edges.push(cursor); // add slot
    return edges;
  }, [itemWidths, itemSpacing, itemCount]);

  const basePadding = useMemo(() => {
    if (!halfTrackWidth || !itemWidths.length) return 0;
    return Math.max(0, halfTrackWidth - itemWidths[0] / 2);
  }, [halfTrackWidth, itemWidths]);

  // scrollX needed for each item's centre to land under the fixed viewport
  // centre — including the add slot, appended as one extra "item".
  const offsets = useMemo(() => {
    if (!halfTrackWidth || !itemWidths.length) return [];
    const widths = [...itemWidths, resolvedAddWidth];
    return leftEdges.map((edge, i) => edge + (widths[i] - itemWidths[0]) / 2);
  }, [leftEdges, itemWidths, resolvedAddWidth, halfTrackWidth]);

  // When the add slot isn't active, the physical scroll bound has to stop
  // at "last real item centred" — but the add button (and the gap before it)
  // is still a real rendered child taking up its own content width regardless
  // of this padding, so that footprint has to be subtracted back out here or
  // a hard swipe overshoots past the last item and into the add slot.
  const paddingEndCollapsed = useMemo(() => {
    if (!halfTrackWidth || !itemWidths.length) return 0;
    return Math.max(
      0,
      halfTrackWidth -
        itemWidths[itemCount - 1] / 2 -
        (showAddButton ? resolvedAddWidth + itemSpacing : 0),
    );
  }, [halfTrackWidth, itemWidths, itemCount, showAddButton, resolvedAddWidth, itemSpacing]);

  const paddingEndExpanded = useMemo(() => {
    if (!halfTrackWidth) return 0;
    return Math.max(0, halfTrackWidth - resolvedAddWidth / 2);
  }, [halfTrackWidth, resolvedAddWidth]);

  const paddingEnd = !showAddButton
    ? paddingEndCollapsed
    : addActive
      ? paddingEndExpanded
      : paddingEndCollapsed;

  // Helpers:

  const hapticLight = () => {
    if (process.env.EXPO_OS === "ios") {
      Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    }
  };

  const scrollToIndex = (index, animated = true) => {
    const offset = offsets[index];
    if (offset == null) return;
    trackRef.current?.scrollTo({ x: offset, animated });
  };

  // Call this from an item's onPress. Handles the "pressing the already
  // active add slot cancels back out" case and the "pressing + expands the
  // padding then scrolls in" case; everything else is a normal scroll-to.
  const goToIndex = (index) => {
    if (index === activeIndex) {
      if (index === ADD_INDEX) {
        // Leave addActive (and so the expanded end-padding) alone here — it
        // clears in settleAt once the scroll has actually arrived. Clearing
        // it now would shrink the content mid-animation and undershoot the
        // target, landing short of the last item instead of centred on it.
        onCancelAdd();
        setIsScrolling(true);
        hapticLight();
        scrollToIndex(itemCount - 1, true);
        return;
      }
      onSettle(index, { alreadyActive: true });
      return;
    }
    setIsScrolling(true);
    hapticLight();
    if (index === ADD_INDEX) {
      setAddActive(true);
      scrollToAddAfterResize.current = true;
      return;
    }
    scrollToIndex(index);
  };

  const handleTrackLayout = (event) => {
    setHalfTrackWidth(event.nativeEvent.layout.width / 2);
  };

  const handleContentSizeChange = () => {
    if (scrollToAddAfterResize.current) {
      scrollToAddAfterResize.current = false;
      scrollToIndex(ADD_INDEX, true);
    }
  };

  const getIndexFromScrollEnd = (event) => {
    const { x } = event.nativeEvent.contentOffset;
    let closest = 0;
    let closestDistance = Infinity;
    offsets.forEach((offset, i) => {
      if (!addActive && i === ADD_INDEX) return;
      const distance = Math.abs(offset - x);
      if (distance < closestDistance) {
        closestDistance = distance;
        closest = i;
      }
    });
    return closest;
  };

  const settleAt = (index) => {
    if (addActive && index !== ADD_INDEX) setAddActive(false);
    setActiveIndex(index);
    setIsScrolling(false);
    if (index === ADD_INDEX) onAdd();
    else onSettle(index, { alreadyActive: false });
  };

  const handleScrollBeginDrag = () => {
    scrollToAddAfterResize.current = false;
    setIsScrolling(true);
    hapticLight();
  };

  const handleScrollEndDrag = (event) => {
    const { velocity } = event.nativeEvent;
    if (!velocity || Math.abs(velocity.x) < 0.1) {
      settleAt(getIndexFromScrollEnd(event));
    }
  };

  const handleMomentumScrollEnd = (event) => {
    settleAt(getIndexFromScrollEnd(event));
  };

  // Effects:

  // A new real item appeared (e.g. a save completed) — exit the add slot
  // and land on it.
  useEffect(() => {
    if (itemCount > prevItemCountRef.current) {
      const newIndex = itemCount - 1;
      prevItemCountRef.current = itemCount;
      onCancelAdd();
      setAddActive(false);
      setActiveIndex(newIndex);
      scrollToIndex(newIndex, true);
    } else {
      prevItemCountRef.current = itemCount;
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [itemCount]);

  // Land on the last (or first, per startAtEnd) real item once the track
  // has laid out (basePadding available) and offsets are computable.
  useEffect(() => {
    if (!hasScrolledToInitial.current && basePadding > 0 && trackRef.current) {
      hasScrolledToInitial.current = true;
      scrollToIndex(startAtEnd ? itemCount - 1 : 0, false);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [basePadding]);

  // Re-centre on the active item if its own centring offset shifts while
  // it's still the active one — e.g. saving a new card image resizes it (or
  // an earlier item, which shifts everyone after it) after we've already
  // settled on it. Guarded to the same index so a normal navigation to a
  // different item — already handled by goToIndex/settleAt — never
  // double-scrolls here too.
  const prevActiveIndexRef = useRef(activeIndex);
  const prevActiveOffsetRef = useRef(undefined);
  useEffect(() => {
    const offset = offsets[activeIndex];
    const sameIndex = prevActiveIndexRef.current === activeIndex;
    if (
      hasScrolledToInitial.current &&
      sameIndex &&
      offset != null &&
      prevActiveOffsetRef.current != null &&
      offset !== prevActiveOffsetRef.current
    ) {
      scrollToIndex(activeIndex, true);
    }
    prevActiveIndexRef.current = activeIndex;
    prevActiveOffsetRef.current = offset;
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [offsets, activeIndex]);

  return {
    ADD_INDEX,
    activeIndex,
    isScrolling,
    addActive,
    basePadding,
    paddingEnd,
    offsets,
    trackRef,
    goToIndex,
    scrollToIndex,
    handleTrackLayout,
    handleContentSizeChange,
    handleScrollBeginDrag,
    handleScrollEndDrag,
    handleMomentumScrollEnd,
  };
}
