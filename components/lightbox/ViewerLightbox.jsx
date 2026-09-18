import { GALLERY_ITEM_RADIUS } from "@/components/gallery/shared";
import { Image } from "@/components/image/Image";
import styled from "styled-components/native";
import { ThemedText } from "../interface/ThemedText";
import { Lightbox } from "./Lightbox";

const Container = styled.View`
  width: 100%;
  flex-direction: column;
  gap: 15px;
`;

export function ViewerLightbox({ image, onClose }) {
  return (
    <Lightbox visible={!!image} onClose={onClose}>
      {!!image && (
        <Container>
          <Image {...image} width="100%" radius={GALLERY_ITEM_RADIUS} />
          {!!image.caption && (
            <ThemedText color="white" style={{ textAlign: "center" }}>
              {image.caption}
            </ThemedText>
          )}
        </Container>
      )}
    </Lightbox>
  );
}
