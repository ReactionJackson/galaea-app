import { useFocusEffect } from "expo-router";
import {
  Children,
  forwardRef,
  useCallback,
  useEffect,
  useImperativeHandle,
  useMemo,
  useRef,
} from "react";
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

export const PageScroll = forwardRef(function PageScroll(
  { resetKey, contentContainerStyle, children, ...props },
  ref,
) {
  const scrollRef = useRef(null);

  useImperativeHandle(ref, () => ({
    scrollToEnd: (animated = true) =>
      scrollRef.current?.scrollToEnd({ animated }),
    scrollTo: (options) => scrollRef.current?.scrollTo(options),
  }));

  useFocusEffect(
    useCallback(() => {
      scrollRef.current?.scrollTo({ y: 0, animated: false });
    }, []),
  );

  useEffect(() => {
    scrollRef.current?.scrollTo({ y: 0, animated: false });
  }, [resetKey]);

  const stickyHeaderIndices = useMemo(() => {
    const index = Children.toArray(children).findIndex(
      (child) => child?.type === PageHeader,
    );
    return index === -1 ? undefined : [index];
  }, [children]);

  return (
    <ScrollContainer
      ref={scrollRef}
      stickyHeaderIndices={stickyHeaderIndices}
      contentContainerStyle={
        contentContainerStyle ?? DEFAULT_CONTENT_CONTAINER_STYLE
      }
      contentInsetAdjustmentBehavior="never"
      automaticallyAdjustKeyboardInsets
      {...props}
    >
      {children}
    </ScrollContainer>
  );
});
