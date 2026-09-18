import { Colors } from "@/constants/theme";
import { useRef, useState } from "react";
import { Pressable } from "react-native";
import Animated, { useAnimatedStyle } from "react-native-reanimated";
import styled from "styled-components/native";
import { ThemedText } from "../interface/ThemedText";
import {
  CAPTION_REVEAL_HEIGHT,
  CaptionGradient,
  CaptionTray,
  GallerySlot,
  Image,
  Item,
  getImageCaption,
  getImageFocus,
  getImageUri,
} from "./shared";

const CAPTION_FADE_HEIGHT = 60;

const CaptionFade = styled(Animated.View).attrs({
  pointerEvents: "none",
})`
  position: absolute;
  left: 0px;
  right: 0px;
  height: ${CAPTION_FADE_HEIGHT}px;
`;

const CaptionRevealRow = styled(Animated.View)`
  position: absolute;
  left: 0px;
  right: 0px;
  padding-horizontal: 9px;
`;

const CaptionTextBox = styled(Pressable)`
  height: 46px;
  justify-content: center;
  overflow: hidden;
`;

const CaptionInput = styled(ThemedText)`
  padding: 5px;
  text-align: center;
`;

export function GalleryItem({
  item,
  index,
  containerWidth,
  trackHeight,
  editMode,
  revealShift,
  onPressView,
  onChangeCaption,
}) {
  const [isEditingCaption, setIsEditingCaption] = useState(false);

  const captionInputRef = useRef(null);
  const trayStyle = useAnimatedStyle(() => ({
    bottom: CAPTION_REVEAL_HEIGHT - revealShift.value,
  }));
  const fadeStyle = useAnimatedStyle(() => ({
    bottom: -(revealShift.value / CAPTION_REVEAL_HEIGHT) * CAPTION_FADE_HEIGHT,
  }));
  const textRevealStyle = useAnimatedStyle(() => ({
    bottom: 14 + CAPTION_REVEAL_HEIGHT - 5 - revealShift.value,
  }));

  const uri = getImageUri(item);
  const caption = getImageCaption(item);
  const captionEditing = isEditingCaption && editMode;

  return (
    <GallerySlot
      $width={containerWidth}
      $height={trackHeight + CAPTION_REVEAL_HEIGHT}
    >
      <CaptionTray $height={trackHeight / 2} style={trayStyle} />

      <Item $width={containerWidth}>
        <Pressable
          onPress={() => onPressView(uri, caption)}
          disabled={editMode}
          style={{ flex: 1 }}
        >
          <Image
            contentFit="cover"
            contentPosition={getImageFocus(item) ?? undefined}
            source={{ uri }}
          />
        </Pressable>
        {!!caption && (
          <CaptionFade style={fadeStyle}>
            <CaptionGradient
              start={{ x: 0, y: 0 }}
              end={{ x: 0, y: 1 }}
              colors={[Colors.transparent, Colors.black]}
            />
          </CaptionFade>
        )}
      </Item>

      {(editMode || !!caption) && (
        <CaptionRevealRow style={textRevealStyle}>
          <CaptionTextBox
            onPress={() => captionInputRef.current?.focus()}
            pointerEvents={captionEditing ? "box-none" : "auto"}
          >
            <CaptionInput
              ref={captionInputRef}
              type="caption"
              isInput
              multiline
              editable={editMode}
              value={caption}
              onChangeText={(text) => onChangeCaption(index, text)}
              onFocus={() => setIsEditingCaption(true)}
              onBlur={() => setIsEditingCaption(false)}
              placeholder={editMode ? "In this picture..." : undefined}
              colorSwitch={{ active: editMode, colors: ["white", "text"] }}
              pointerEvents={captionEditing ? "auto" : "none"}
            />
          </CaptionTextBox>
        </CaptionRevealRow>
      )}
    </GallerySlot>
  );
}
