import { BlurView } from "@/components/BlurView";
import { ThemedText } from "@/components/ThemedText";
import { Colors } from "@/constants/theme";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import styled from "styled-components/native";

import { GameEntry } from "@/components/GameEntry";
import { Tags } from "@/components/Tags";

const Container = styled.SafeAreaView`
  flex: 1;
  justify-content: flex-start;
  align-items: center;
  background-color: ${Colors.background};
`;

const TopBar = styled.View`
  flex-direction: row;
  justify-content: space-between;
  align-items: center;
  width: 100%;
  height: 60px;
  padding: 0 20px;
  background-color: ${Colors.background};
  shadow-color: ${Colors.black};
  shadow-offset: 0px 5px;
  shadow-opacity: 0.12;
  shadow-radius: 4px;
`;

const Header = styled(BlurView)`
  z-index: 100;
  position: absolute;
  top: ${({ topInset }) => topInset + 60}px;
  left: 0;
  right: 0;
  gap: 10px;
  height: 70px;
  padding: 20px 20px 10px 20px;
  flex-direction: row;
  justify-content: flex-start;
`;

const EntryNumber = styled.View`
  justify-content: center;
  align-items: center;
  width: 40px;
  height: 40px;
  border-radius: 50%;
  background-color: ${Colors.accent};
`;

const EntryInfo = styled.View`
  flex-direction: column;
  justify-content: flex-start;
  align-items: flex-start;
`;

const EntryDate = styled.View`
  flex-direction: row;
  gap: 5px;
  margin: 3px 0 -2px 0;
`;

const Content = styled.ScrollView`
  flex: 1;
  width: 100%;
`;

const Track = styled(BlurView)`
  z-index: 100;
  position: absolute;
  left: 0;
  right: 0;
  bottom: 0;
  height: 100px;
  justify-content: center;
  align-items: center;
`;

export default function HomeScreen() {
  const { top } = useSafeAreaInsets();
  return (
    <Container>
      <TopBar>
        <ThemedText type="title">Galaea</ThemedText>
        <ThemedText type="title">O</ThemedText>
      </TopBar>

      <Header tint="light" topInset={top}>
        <EntryNumber>
          <ThemedText type="date-number">22</ThemedText>
        </EntryNumber>
        <EntryInfo>
          <EntryDate>
            <ThemedText type="subtitle">March</ThemedText>
            <ThemedText type="subtitle" color="faded">
              02:16AM
            </ThemedText>
          </EntryDate>
          <ThemedText type="title">Porting to React Native</ThemedText>
        </EntryInfo>
      </Header>

      <Content
        contentContainerStyle={{
          gap: 20,
          paddingTop: 70,
          paddingBottom: 110,
          paddingHorizontal: 20,
        }}
      >
        <ThemedText>
          Started the morning with some Xenoblade before doing anything else,
          which is always a good sign for the day. Spent the afternoon doing
          some work on the journal app — got the PWA manifest set up so it can
          be saved to the home screen properly and opens without the Safari bar.
          Feels way more like a real app now. Small detail but it matters.
        </ThemedText>

        <Tags tagIds={[2, 1, 3, 4, 1]} />

        <GameEntry gameId={1} />
        <GameEntry gameId={2} />
      </Content>

      <Track tint="light">
        <ThemedText type="title">Track</ThemedText>
      </Track>
    </Container>
  );
}
