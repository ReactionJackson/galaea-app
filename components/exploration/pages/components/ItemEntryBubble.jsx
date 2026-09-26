import { HeaderText } from "@/components/interface/HeaderText";
import { Colors } from "@/constants/theme";
import {
  CARD_SHADOW_OPACITY,
  CARD_SHADOW_RADIUS,
  HERO_HEIGHT,
} from "@/constants/values";
import { useApp } from "@/context/AppContext";
import styled from "styled-components/native";
import { ItemHero } from "./ItemHero";

const ShadowWrap = styled.View`
  width: 100%;
  shadow-color: ${Colors.black};
  shadow-offset: 0px 0px;
  shadow-opacity: 0.12;
  shadow-radius: 8px;
`;

const Container = styled.View`
  width: 100%;
  border-radius: 30px;
  background-color: ${Colors.background};
`;

const Header = styled.View`
  width: 100%;
  border-top-left-radius: 30px;
  border-top-right-radius: 30px;
  overflow: hidden;
`;

const Content = styled.View`
  padding: 20px;
  padding-top: 15px;
  border: 1px solid ${Colors.border};
  border-top-width: 0px;
  border-bottom-left-radius: 30px;
  border-bottom-right-radius: 30px;
  background-color: ${Colors.background};
`;

const HeaderWrap = styled.View`
  margin-bottom: 10px;
`;

export const ItemEntryBubble = ({
  itemId = 1,
  text = "",
  tags = [],
  gallery = null,
}) => {
  const { items } = useApp();
  const {
    title,
    images: { card, cover },
  } = items.find((item) => item.id === itemId);

  return (
    <ShadowWrap>
      <Container>
        <Header>
          <ItemHero
            nestedInCard
            spacing={15}
            height={HERO_HEIGHT}
            cardImage={card}
            coverImage={cover}
            shadowRadius={CARD_SHADOW_RADIUS}
            shadowOpacity={CARD_SHADOW_OPACITY}
          />
        </Header>
        <Content>
          <HeaderWrap>
            <HeaderText>
              <HeaderText.Title>{title}</HeaderText.Title>
              <HeaderText.Subtitle>Collection Name</HeaderText.Subtitle>
              <HeaderText.SubtitleFaded>Entry X</HeaderText.SubtitleFaded>
            </HeaderText>
          </HeaderWrap>
          {/* <ThemedText
          isInput
          multiline={true}
          value={text}
          placeholder="Write something about this..."
          onChangeText={() => {}}
        /> */}

          {/* <Gallery
          images={gallery}
          editMode={editable}
          onAddImage={handleAddImage}
          onAddImages={handleAddImages}
          onUpdateImage={handleUpdateImage}
          onDeleteImage={handleDeleteImage}
          onReorderImages={handleReorderImages}
          horizontalPadding={horizontalPadding}
        /> */}
          {/* <Tags tagIds={tags} /> */}
        </Content>
      </Container>
    </ShadowWrap>
  );
};
