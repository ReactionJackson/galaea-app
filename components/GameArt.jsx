import { Colors } from "@/constants/theme";
import { Image as ExpoImage } from "expo-image";
import { useEffect, useState } from "react";
import { Pressable, Image as RNImage, useWindowDimensions } from "react-native";
import Animated, { FadeIn, FadeOut } from "react-native-reanimated";
import styled from "styled-components/native";
import { ThemedText } from "./interface/ThemedText";

const BOX_HEIGHT = 180;
const DEFAULT_BOX_WIDTH = 120;

const ArtContainer = styled.View`
  height: 250px;
  margin: 0 -20px;
  overflow: hidden;
  justify-content: center;
  align-items: center;
  background-color: ${Colors.border};
`;

const CoverFill = styled.View`
  position: absolute;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
`;

const CoverImage = styled(ExpoImage).attrs({ transition: 200 })`
  width: 100%;
  height: 100%;
`;

const CoverOverlay = styled.View`
  position: absolute;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background-color: ${Colors.imageOverlay};
`;

const BoxArtWrap = styled.View`
  position: relative;
`;

const BoxArtFrame = styled.View`
  width: ${({ boxWidth }) => boxWidth}px;
  height: ${BOX_HEIGHT}px;
  border-radius: 4px;
  overflow: hidden;
`;

const BoxArtImage = styled(ExpoImage).attrs({ transition: 200 })`
  width: 100%;
  height: 100%;
`;

const BoxArtPlaceholder = styled.View`
  width: ${DEFAULT_BOX_WIDTH}px;
  height: ${BOX_HEIGHT}px;
  border: 2px dashed ${Colors.disabled};
  border-radius: 4px;
`;

const EditOverlay = styled.View`
  position: absolute;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  justify-content: center;
  align-items: center;
`;

const EditCircle = styled.View`
  width: 40px;
  height: 40px;
  border-radius: 20px;
  border: 2px solid ${Colors.dateBorder};
  background-color: rgba(255, 255, 255, 0.8);
  justify-content: center;
  align-items: center;
`;

function EditButton({ onPress, style }) {
  return (
    <Animated.View
      entering={FadeIn.duration(200)}
      exiting={FadeOut.duration(200)}
      style={style}
    >
      <Pressable onPress={onPress}>
        <EditCircle>
          <ThemedText type="date-number" color="black">
            +
          </ThemedText>
        </EditCircle>
      </Pressable>
    </Animated.View>
  );
}

export function GameArt({
  boxArt,
  cover,
  editable = false,
  onPressBoxArt = () => {},
  onPressCover = () => {},
}) {
  const { width: screenWidth } = useWindowDimensions();
  const [boxWidth, setBoxWidth] = useState(DEFAULT_BOX_WIDTH);

  useEffect(() => {
    if (!boxArt) {
      setBoxWidth(DEFAULT_BOX_WIDTH);
      return;
    }
    let cancelled = false;
    RNImage.getSize(
      boxArt,
      (w, h) => {
        if (!cancelled) setBoxWidth(Math.round(BOX_HEIGHT * (w / h)));
      },
      () => {},
    );
    return () => {
      cancelled = true;
    };
  }, [boxArt]);

  return (
    <ArtContainer style={{ width: screenWidth }}>
      <CoverFill>
        {cover && <CoverImage source={{ uri: cover }} contentFit="cover" />}
        <CoverOverlay />
      </CoverFill>

      <BoxArtWrap>
        {boxArt ? (
          <BoxArtFrame boxWidth={boxWidth}>
            <BoxArtImage source={{ uri: boxArt }} contentFit="cover" />
          </BoxArtFrame>
        ) : (
          <BoxArtPlaceholder />
        )}
        {editable && (
          <EditOverlay>
            <EditButton onPress={onPressBoxArt} />
          </EditOverlay>
        )}
      </BoxArtWrap>

      {editable && (
        <EditButton
          onPress={onPressCover}
          style={{ position: "absolute", top: 20, right: 20 }}
        />
      )}
    </ArtContainer>
  );
}
