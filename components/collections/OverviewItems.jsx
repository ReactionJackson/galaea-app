import {
  AddBubble,
  OverviewItemsBubble,
  Placeholder,
  ROW_HEIGHT,
} from "@/components/collections/OverviewItemsBubble";
import { TRACK_GAP } from "@/constants/values";
import { usePagedScrollWidth } from "@/hooks/usePagedScrollWidth";
import { useMemo } from "react";
import styled from "styled-components/native";

const HORIZONTAL_PADDING = 40;
const ROW_GAP = 10;
const ROWS_PER_PAGE = 4;
const PAGE_HEIGHT = ROW_HEIGHT * ROWS_PER_PAGE + ROW_GAP * (ROWS_PER_PAGE - 1);
const ADD_SLOT = { isAddSlot: true };

const ScrollContainer = styled.ScrollView`
  margin: 0 -20px 20px -20px;
`;

const Page = styled.View`
  width: ${({ $width }) => $width}px;
  height: ${PAGE_HEIGHT}px;
  justify-content: flex-start;
  gap: ${ROW_GAP}px;
`;

function chunk(entries, size) {
  const pages = [];
  for (let i = 0; i < entries.length; i += size) {
    pages.push(entries.slice(i, i + size));
  }
  return pages;
}

export function OverviewItems({ items, onPressItem, onPressAdd }) {
  const { containerWidth, scrollInterval } = usePagedScrollWidth(
    HORIZONTAL_PADDING,
    TRACK_GAP,
  );

  const pages = useMemo(
    () => chunk([...items, ADD_SLOT], ROWS_PER_PAGE),
    [items],
  );

  return (
    <ScrollContainer
      horizontal
      snapToInterval={scrollInterval}
      decelerationRate="fast"
      showsHorizontalScrollIndicator={false}
      contentContainerStyle={{
        gap: TRACK_GAP,
        paddingInlineStart: 20,
        paddingInlineEnd: 20,
      }}
    >
      {pages.map((page, index) => (
        <Page key={index} $width={containerWidth}>
          {page.map((entry) =>
            entry === ADD_SLOT ? (
              <AddBubble key="add" onPress={onPressAdd} />
            ) : (
              <OverviewItemsBubble
                key={entry.itemId}
                item={entry}
                onPress={onPressItem}
              />
            ),
          )}
          {Array.from({ length: ROWS_PER_PAGE - page.length }).map((_, i) => (
            <Placeholder key={`placeholder-${i}`} />
          ))}
        </Page>
      ))}
    </ScrollContainer>
  );
}
