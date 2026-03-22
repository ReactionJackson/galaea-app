import { Colors } from "@/constants/theme";
import { games } from "@/data/entries";
import { Image as ExpoImage } from "expo-image";
import styled from "styled-components/native";
import { ThemedText } from "./themed-text";

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
  gap: 10px;
  border: 1px solid ${Colors.border};
  border-top-width: 0px;
  border-bottom-left-radius: 15px;
  border-bottom-right-radius: 15px;
  background-color: ${Colors.background};
`;

export function GameEntry({ gameId = 1 }) {
  const { title, platform, genre, cover, entries } = games.find(
    (game) => game.gameId === gameId,
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
        <ThemedText type="title" color="white">
          {title}
        </ThemedText>
        <ThemedText type="subtitle" color="white" style={{ opacity: 1 }}>
          {platform} / {genre}
        </ThemedText>
      </Header>

      <Content>
        {[...Array(entries[0])].map(({ text }, index) => (
          <>
            <ThemedText type="subtitle">
              Entry {(index + 1).toString().padStart(2, "0")}
            </ThemedText>
            <ThemedText type="text">{text}</ThemedText>
          </>
        ))}
      </Content>
    </Container>
  );
}
