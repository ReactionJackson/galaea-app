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
  itemIds,
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
  const prevItemWidthsRef = useRef(itemWidths);
  const hasScrolledToInitial = useRef(false);
  const activeItemIdRef = useRef(itemIds[activeIndex] ?? null);
  const isInternalScrollRef = useRef(false);

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

  const offsets = useMemo(() => {
    if (!halfTrackWidth || !itemWidths.length) return [];
    const widths = [...itemWidths, resolvedAddWidth];
    return leftEdges.map((edge, i) => edge + (widths[i] - itemWidths[0]) / 2);
  }, [leftEdges, itemWidths, resolvedAddWidth, halfTrackWidth]);

  const paddingEndCollapsed = useMemo(() => {
    if (!halfTrackWidth || !itemWidths.length) return 0;
    return Math.max(
      0,
      halfTrackWidth -
        itemWidths[itemCount - 1] / 2 -
        (showAddButton ? resolvedAddWidth + itemSpacing : 0),
    );
  }, [
    halfTrackWidth,
    itemWidths,
    itemCount,
    showAddButton,
    resolvedAddWidth,
    itemSpacing,
  ]);

  const paddingEndExpanded = useMemo(() => {
    if (!halfTrackWidth) return 0;
    return Math.max(0, halfTrackWidth - resolvedAddWidth / 2);
  }, [halfTrackWidth, resolvedAddWidth]);

  const [endPaddingBoost, setEndPaddingBoost] = useState(0);

  const paddingEnd =
    (!showAddButton
      ? paddingEndCollapsed
      : addActive
        ? paddingEndExpanded
        : paddingEndCollapsed) + endPaddingBoost;

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

  const goToIndex = (index) => {
    if (index === activeIndex) {
      if (index === ADD_INDEX) {
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
    activeItemIdRef.current =
      index === ADD_INDEX ? null : (itemIds[index] ?? null);
    setIsScrolling(false);
    if (index === ADD_INDEX) onAdd();
    else onSettle(index, { alreadyActive: false });
  };

  const handleScrollBeginDrag = () => {
    scrollToAddAfterResize.current = false;
    isInternalScrollRef.current = false;
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
    if (isInternalScrollRef.current) {
      isInternalScrollRef.current = false;
      setIsScrolling(false);
      return;
    }
    settleAt(getIndexFromScrollEnd(event));
  };

  // Effects:

  useEffect(() => {
    if (itemCount > prevItemCountRef.current) {
      const newIndex = itemCount - 1;
      prevItemCountRef.current = itemCount;
      onCancelAdd();
      setAddActive(false);
      setActiveIndex(newIndex);
      activeItemIdRef.current = itemIds[newIndex] ?? null;
      isInternalScrollRef.current = true;
      scrollToIndex(newIndex, true);
    } else if (itemCount < prevItemCountRef.current) {
      const newIndex = Math.max(0, Math.min(activeIndex - 1, itemCount - 1));
      prevItemCountRef.current = itemCount;

      const oldTotalWidth = prevItemWidthsRef.current.reduce(
        (sum, w) => sum + w,
        0,
      );
      const newTotalWidth = itemWidths.reduce((sum, w) => sum + w, 0);
      const removedFootprint = Math.max(
        0,
        oldTotalWidth - newTotalWidth + itemSpacing,
      );
      setEndPaddingBoost(removedFootprint);
      setTimeout(() => setEndPaddingBoost(0), 300);

      setActiveIndex(newIndex);
      activeItemIdRef.current = itemIds[newIndex] ?? null;
      isInternalScrollRef.current = true;
      scrollToIndex(newIndex, true);
    } else {
      prevItemCountRef.current = itemCount;
    }
    prevItemWidthsRef.current = itemWidths;
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [itemCount]);

  useEffect(() => {
    if (!hasScrolledToInitial.current && basePadding > 0 && trackRef.current) {
      hasScrolledToInitial.current = true;
      scrollToIndex(startAtEnd ? itemCount - 1 : 0, false);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [basePadding]);

  const prevActiveIndexRef = useRef(activeIndex);
  const prevActiveOffsetRef = useRef(undefined);
  const recenterPrevItemCountRef = useRef(itemCount);
  const recenterPrevItemIdsRef = useRef(itemIds);
  useEffect(() => {
    const itemCountChanged = itemCount !== recenterPrevItemCountRef.current;
    recenterPrevItemCountRef.current = itemCount;
    const itemsReordered = itemIds !== recenterPrevItemIdsRef.current;
    recenterPrevItemIdsRef.current = itemIds;

    const offset = offsets[activeIndex];
    const sameIndex = prevActiveIndexRef.current === activeIndex;
    if (
      !itemCountChanged &&
      !itemsReordered &&
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
  }, [offsets, activeIndex, itemCount, itemIds]);

  const reorderPrevItemCountRef = useRef(itemCount);
  useEffect(() => {
    const itemCountChanged = itemCount !== reorderPrevItemCountRef.current;
    reorderPrevItemCountRef.current = itemCount;
    if (itemCountChanged || activeIndex === ADD_INDEX) return;

    const trackedId = activeItemIdRef.current;
    if (trackedId == null || !hasScrolledToInitial.current) return;

    const resolvedIndex = itemIds.indexOf(trackedId);
    if (resolvedIndex === -1 || resolvedIndex === activeIndex) return;

    setActiveIndex(resolvedIndex);
    isInternalScrollRef.current = true;
    scrollToIndex(resolvedIndex, true);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [itemIds]);

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
