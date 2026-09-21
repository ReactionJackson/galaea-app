import Animated from "react-native-reanimated";
import styled from "styled-components/native";

const Container = styled.View`
  width: 100%;
  height: 100%;
`;

const Layer = styled(Animated.View)`
  position: absolute;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
`;

export function TrackStack({ children, ...props }) {
  return <Container {...props}>{children}</Container>;
}

TrackStack.Layer = Layer;
