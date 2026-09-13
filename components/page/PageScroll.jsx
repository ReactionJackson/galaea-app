import { useFocusEffect } from "expo-router";
import { useCallback, useRef } from "react";
import styled from "styled-components/native";

// ─────────────────────────────────────────────────────────────────────────────
// PageScroll
//
// The vertical content area shared by Journal and Collection: always starts
// at the top when the active item changes (day in Journal, game in
// Collection) and again whenever the tab itself regains focus. Journal
// originally did this with a `key` on its own ScrollView plus a local
// useFocusEffect; this is the reusable extraction — pass `resetKey` as
// whatever identifies "which page" is currently showing.
// ─────────────────────────────────────────────────────────────────────────────

const ScrollArea = styled.ScrollView`
  flex: 1;
  width: 100%;
`;

export function PageScroll({ resetKey, contentContainerStyle, children, ...props }) {
  const scrollRef = useRef(null);

  // Tab regains focus without the active item necessarily changing (e.g.
  // switching tabs and back) — the `key` remount below only covers the
  // active-item-changed case, so this covers the other one.
  useFocusEffect(
    useCallback(() => {
      scrollRef.current?.scrollTo({ y: 0, animated: false });
    }, []),
  );

  return (
    <ScrollArea
      key={resetKey}
      ref={scrollRef}
      contentContainerStyle={contentContainerStyle}
      {...props}
    >
      {children}
    </ScrollArea>
  );
}
