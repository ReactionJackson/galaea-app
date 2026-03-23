import { Colors } from "@/constants/theme";
import { gamesData } from "@/data/entries";
import { Image as ExpoImage } from "expo-image";
import styled from "styled-components/native";
import { Tags } from "./Tags";
import { ThemedText } from "./ThemedText";

const Container = styled.View`
  width: 100%;
  border-radius: 15px;
  background-color: ${Colors.background};
  shadow-color: ${Colors.black};
  shadow-offset: 0px 0px;
  shadow-opacity: 0.12;
  shadow-radius: 8px;
`;

const Header = styled.View`
  position: relative;
  justify-content: center;
  align-items: center;
  gap: 5px;
  width: 100%;
  height: 80px;
  border-top-left-radius: 15px;
  border-top-right-radius: 15px;
  background-color: ${Colors.black};
  overflow: hidden;
`;

const HeaderBackground = styled(ExpoImage)`
  position: absolute;
  top: 0;
  left: 0;
  bottom: 0;
  right: 0;
  opacity: 0.65;
`;

const Content = styled.View`
  padding: 20px;
  gap: 20px;
  border: 1px solid ${Colors.border};
  border-top-width: 0px;
  border-bottom-left-radius: 15px;
  border-bottom-right-radius: 15px;
  background-color: ${Colors.background};
`;

export function GameEntry({ gameId = 1, entryId = 1 }) {
  const { title, platform, genre, cover, entries } = gamesData.find(
    (game) => game.gameId === gameId,
  );

  const { text, tags, gallery } = entries.find(
    (entry) => entry.entryId === entryId,
  );

  return (
    <Container>
      <Header>
        <HeaderBackground
          contentFit="cover"
          source={{
            uri: cover,
          }}
        />
        <ThemedText type="title-small" color="white">
          {title}
        </ThemedText>
        <ThemedText type="subtitle" color="white" style={{ opacity: 1 }}>
          {platform} / {genre}
        </ThemedText>
      </Header>

      <Content>
        <ThemedText type="subtitle" color="text" style={{ marginBottom: -10 }}>
          Entry {entryId.toString().padStart(2, "0")}
        </ThemedText>
        <ThemedText type="text">{text}</ThemedText>
        <Tags tagIds={tags} />
      </Content>
    </Container>
  );
}
