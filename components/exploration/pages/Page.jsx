import { BlurView } from "@/components/interface/BlurView";
import { Spacer } from "@/components/interface/Spacer";
import { Colors } from "@/constants/theme";
import { PageScrollContext } from "@/context/PageScrollContext";
import { usePageScroll } from "@/hooks/usePageScroll";
import { childrenByType } from "@/utils/childrenByType";
import { useRef } from "react";
import styled from "styled-components/native";

// Constants:

const HERO_HEIGHT = 250;
const HEADER_HEIGHT = 70;
const PAGE_GUTTER = 20;
const CONTENT_GAP = 20;

// Styled Components:

const ScrollContainer = styled.ScrollView`
  flex: 1;
  width: 100%;
  background-color: ${Colors.white};
`;

const HeroContainer = styled.View`
  height: ${HERO_HEIGHT}px;
  background-color: ${Colors.black};
`;

const HeaderContainer = styled(BlurView)`
  z-index: 100;
  flex-direction: row;
  align-items: center;
  justify-content: flex-start;
  height: ${HEADER_HEIGHT}px;
  padding: 0 ${PAGE_GUTTER}px;
`;

const ContentContainer = styled.View`
  padding: 0 ${PAGE_GUTTER}px;
  padding-bottom: ${CONTENT_GAP}px;
`;

// Sub Components:

const Hero = ({ children }) => {
  return <HeroContainer>{children}</HeroContainer>;
};

const Header = ({ children }) => {
  return <HeaderContainer>{children}</HeaderContainer>;
};

const Content = ({ children }) => {
  return <ContentContainer>{children}</ContentContainer>;
};

// Main Component:

export const Page = ({ children }) => {
  const hero = childrenByType(children, Hero);
  const header = childrenByType(children, Header);
  const content = childrenByType(children, Content);
  const scrollRef = useRef(null);
  const { scrollToElement, keyboardHeight, hasKeyboard, onContentSizeChange } =
    usePageScroll(scrollRef, HEADER_HEIGHT);
  const stickyHeaderIndices = !!header ? (!!hero ? [1] : [0]) : undefined;

  return (
    <PageScrollContext.Provider value={{ scrollToElement }}>
      <ScrollContainer
        ref={scrollRef}
        stickyHeaderIndices={stickyHeaderIndices}
        onContentSizeChange={onContentSizeChange}
      >
        {hero}
        {header}
        {content}
        <Spacer isVisible={hasKeyboard} height={keyboardHeight} />
      </ScrollContainer>
    </PageScrollContext.Provider>
  );
};

Page.Hero = Hero;
Page.Header = Header;
Page.Content = Content;
