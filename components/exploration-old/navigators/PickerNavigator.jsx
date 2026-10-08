import { TrackStack } from "@/components/exploration/navigators/NavigatorManager";
import { Colors } from "@/constants/theme";
import { ITEM_HEIGHT } from "@/constants/values";
import { forwardRef, useCallback } from "react";
import styled from "styled-components/native";

const SCROLL_SLACK = 20;
const CONTAINER_PADDING = 15 - SCROLL_SLACK / 2;

const Container = styled.View`
  border-top-width: 1px;
  border-bottom-width: 1px;
  border-color: ${Colors.border};
  background-color: ${Colors.surfaceTint};
  padding: ${CONTAINER_PADDING}px 0;
`;

const TrackArea = styled.View`
  height: ${ITEM_HEIGHT + SCROLL_SLACK}px;
`;

export const PickerNavigator = forwardRef(function PickerNavigator(
  { attachedItemIds = [], onSelect = () => {} },
  ref,
) {
  const handlePressActiveItem = useCallback(
    (itemId) => {
      if (attachedItemIds.includes(itemId)) return;
      onSelect(itemId);
    },
    [attachedItemIds, onSelect],
  );

  return (
    <Container>
      <TrackArea>
        <TrackStack
          ref={ref}
          dimmedItemIds={attachedItemIds}
          onPressActiveItem={handlePressActiveItem}
        />
      </TrackArea>
    </Container>
  );
});
