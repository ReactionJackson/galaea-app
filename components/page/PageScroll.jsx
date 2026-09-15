import { useFocusEffect } from "expo-router";
import { Children, useCallback, useMemo, useRef } from "react";
import styled from "styled-components/native";
import { PageHeader } from "./PageHeader";

const ScrollContainer = styled.ScrollView`
  flex: 1;
  width: 100%;
`;

const DEFAULT_CONTENT_CONTAINER_STYLE = {
  paddingBottom: 110,
  paddingHorizontal: 20,
};

export function PageScroll({
  resetKey,
  contentContainerStyle,
  children,
  ...props
}) {
  const scrollRef = useRef(null);

  useFocusEffect(
    useCallback(() => {
      scrollRef.current?.scrollTo({ y: 0, animated: false });
    }, []),
  );

  // Whichever direct child is a PageHeader sticks itself automatically —
  // callers no longer need to know or pass its numeric index by hand.
  const stickyHeaderIndices = useMemo(() => {
    const index = Children.toArray(children).findIndex(
      (child) => child?.type === PageHeader,
    );
    return index === -1 ? undefined : [index];
  }, [children]);

  return (
    <ScrollContainer
      key={resetKey}
      ref={scrollRef}
      stickyHeaderIndices={stickyHeaderIndices}
      contentContainerStyle={
        contentContainerStyle ?? DEFAULT_CONTENT_CONTAINER_STYLE
      }
      contentInsetAdjustmentBehavior="never"
      {...props}
    >
      {children}
    </ScrollContainer>
  );
}
