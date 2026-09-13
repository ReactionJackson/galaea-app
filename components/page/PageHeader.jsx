import { BlurView } from "@/components/interface/BlurView";
import styled from "styled-components/native";

// ─────────────────────────────────────────────────────────────────────────────
// PageHeader
//
// The fixed, blurred strip pinned to the top of a screen while its content
// scrolls underneath — shared by Journal (date circle + editable title) and
// Collection (active game's title). Journal originally owned this inline;
// this is the reusable extraction, content supplied by the caller.
// ─────────────────────────────────────────────────────────────────────────────

const Header = styled(BlurView)`
  z-index: 100;
  position: absolute;
  top: 0;
  left: 0;
  right: 0;
  gap: 10px;
  height: ${({ headerHeight }) => headerHeight}px;
  padding: 15px 20px;
  flex-direction: row;
  justify-content: flex-start;
`;

export function PageHeader({ height = 70, tint = "light", children }) {
  return (
    <Header tint={tint} headerHeight={height}>
      {children}
    </Header>
  );
}
