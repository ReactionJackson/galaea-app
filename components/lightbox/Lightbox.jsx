import { BlurView } from "expo-blur";
import { Modal, Pressable } from "react-native";
import styled from "styled-components/native";

const Backdrop = styled(BlurView).attrs({
  intensity: 80,
  tint: "dark",
})`
  flex: 1;
  padding: 20px;
  background-color: rgba(0, 0, 0, 0.75);
`;

const CenteredArea = styled(Pressable)`
  flex: 1;
  align-items: stretch;
  justify-content: center;
`;

const Controls = styled.View`
  position: absolute;
  left: 20px;
  right: 20px;
  bottom: 20px;
  flex-direction: row;
  justify-content: space-between;
  gap: 10px;
`;

export function Lightbox({ visible, onClose, children }) {
  return (
    <Modal
      visible={visible}
      transparent
      animationType="fade"
      onRequestClose={onClose}
    >
      <Backdrop>
        <CenteredArea onPress={onClose}>{children}</CenteredArea>
      </Backdrop>
    </Modal>
  );
}

Lightbox.Controls = Controls;
