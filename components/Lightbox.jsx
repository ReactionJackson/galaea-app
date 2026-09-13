import { Colors } from "@/constants/theme";
import { Image as ExpoImage } from "expo-image";
import { Modal, Pressable } from "react-native";
import styled from "styled-components/native";

// Single-image, no pagination — closing and re-tapping the gallery to move
// to another image is the intended flow (see spec.md "Lightbox").

const Backdrop = styled(Pressable)`
  flex: 1;
  justify-content: center;
  align-items: center;
  padding: 10px;
  background-color: ${Colors.overlay};
`;

const FullImage = styled(ExpoImage)`
  width: 100%;
  height: 100%;
`;

export function Lightbox({ uri, onClose }) {
  return (
    <Modal
      visible={!!uri}
      transparent
      animationType="fade"
      onRequestClose={onClose}
    >
      <Backdrop onPress={onClose}>
        {uri && <FullImage contentFit="contain" source={{ uri }} />}
      </Backdrop>
    </Modal>
  );
}
