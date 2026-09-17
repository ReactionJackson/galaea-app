import { Colors } from "@/constants/theme";
import { useRef, useState } from "react";
import { Pressable, View } from "react-native";
import Animated, { useAnimatedStyle } from "react-native-reanimated";
import { ThemedText } from "../interface/ThemedText";
import {
  CAPTION_REVEAL_HEIGHT,
  CaptionGradient,
  Image,
  Item,
  getImageCaption,
  getImageFocus,
  getImageUri,
} from "./shared";

const CAPTION_FADE_HEIGHT = 60;

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
  const uri = getImageUri(item);
  const focus = getImageFocus(item);
  const caption = getImageCaption(item);
  const captionInputRef = useRef(null);
  const [isEditingCaption, setIsEditingCaption] = useState(false);
  const trayHeight = trackHeight / 2;
  const showCaptionUI = editMode || !!caption;
  const showFade = !!caption;
  const captionEditing = isEditingCaption && editMode;
  const trayStyle = useAnimatedStyle(() => ({
    bottom: CAPTION_REVEAL_HEIGHT - revealShift.value,
  }));
  const fadeStyle = useAnimatedStyle(() => ({
    bottom: -(revealShift.value / CAPTION_REVEAL_HEIGHT) * CAPTION_FADE_HEIGHT,
  }));
  const textRevealStyle = useAnimatedStyle(() => ({
    bottom: 14 + CAPTION_REVEAL_HEIGHT - 5 - revealShift.value,
  }));

  return (
    <View
      style={{
        width: containerWidth,
        height: trackHeight + CAPTION_REVEAL_HEIGHT,
      }}
    >
      <Animated.View
        pointerEvents="none"
        style={[
          {
            position: "absolute",
            left: 0,
            right: 0,
            height: trayHeight,
            borderRadius: 15,
            borderWidth: 1,
            borderColor: Colors.border,
            backgroundColor: Colors.surfaceTint,
          },
          trayStyle,
        ]}
      />

      <Item style={{ width: containerWidth }}>
        <Pressable
          onPress={() => onPressView(uri)}
          disabled={editMode}
          style={{ flex: 1 }}
        >
          <Image
            contentFit="cover"
            contentPosition={focus ?? undefined}
            source={{ uri }}
          />
        </Pressable>
        {showFade && (
          <Animated.View
            pointerEvents="none"
            style={[
              {
                position: "absolute",
                left: 0,
                right: 0,
                height: CAPTION_FADE_HEIGHT,
              },
              fadeStyle,
            ]}
          >
            <CaptionGradient
              start={{ x: 0, y: 0 }}
              end={{ x: 0, y: 1 }}
              // Reaches full black by halfway rather than a slow linear fade.
              locations={[0, 0.5, 1]}
              colors={["rgba(0,0,0,0)", "rgba(0,0,0,0.4)", "rgba(0,0,0,0.6)"]}
            />
          </Animated.View>
        )}
      </Item>

      {showCaptionUI && (
        <Animated.View
          style={[
            {
              position: "absolute",
              left: 0,
              right: 0,
              paddingHorizontal: 9,
            },
            textRevealStyle,
          ]}
        >
          <Pressable
            onPress={() => captionInputRef.current?.focus()}
            pointerEvents={captionEditing ? "box-none" : "auto"}
          >
            <ThemedText
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
              style={{ padding: 5 }}
              pointerEvents={captionEditing ? "auto" : "none"}
            />
          </Pressable>
        </Animated.View>
      )}
    </View>
  );
}
