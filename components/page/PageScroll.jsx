import { useFocusEffect } from "expo-router";
import { useCallback, useRef } from "react";
import styled from "styled-components/native";

const ScrollContainer = styled.ScrollView`
  flex: 1;
  width: 100%;
`;

const DEFAULT_CONTENT_CONTAINER_STYLE = {
  paddingTop: 70,
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

  return (
    <ScrollContainer
      key={resetKey}
      ref={scrollRef}
      contentContainerStyle={
        contentContainerStyle ?? DEFAULT_CONTENT_CONTAINER_STYLE
      }
      {...props}
    >
      {children}
    </ScrollContainer>
  );
}
