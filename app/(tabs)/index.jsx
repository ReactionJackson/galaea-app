import { ThemedText } from "@/components/themed-text";
import { Colors } from "@/constants/theme";
import { BlurView } from "expo-blur";
import { Image as ExpoImage } from "expo-image";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import styled from "styled-components/native";

const Container = styled.SafeAreaView`
  flex: 1;
  justify-content: flex-start;
  align-items: center;
  background-color: ${Colors.background};
`;

const TopNav = styled.View`
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
  height: 70px;
  padding: 20px 20px 10px 20px;
  flex-direction: row;
  justify-content: flex-start;
  gap: 10px;
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

const Tags = styled.View`
  flex-direction: row;
  gap: 10px;
`;

const Tag = styled.View`
  align-items: center;
  justify-content: center;
  height: 26px;
  border-radius: 13px;
  padding: 0 10px;
  border-width: 2px;
  border-style: solid;
  margin-top: -5px;
  ${({ color = "default" }) => `
    border-color: ${Colors.tags[color].border};
    background-color: ${Colors.tags[color].background};
  `}
`;

const Content = styled.ScrollView`
  flex: 1;
  width: 100%;
`;

const Image = styled(ExpoImage)`
  width: 100%;
  height: 200px;
  border-radius: 10px;
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
      <TopNav>
        <ThemedText type="title">Galaea</ThemedText>
        <ThemedText type="title">O</ThemedText>
      </TopNav>

      <Header tint="light" intensity={30} topInset={top}>
        <EntryNumber>
          <ThemedText type="entry-number">22</ThemedText>
        </EntryNumber>
        <EntryInfo>
          <EntryDate>
            <ThemedText type="entry-month">March</ThemedText>
            <ThemedText type="entry-time">02:16AM</ThemedText>
          </EntryDate>
          <ThemedText type="entry-title">Porting to React Native</ThemedText>
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
        <Tags>
          <Tag color="green">
            <ThemedText type="tag" textColor="green">
              React Native
            </ThemedText>
          </Tag>
          <Tag color="blue">
            <ThemedText type="tag" textColor="blue">
              Design
            </ThemedText>
          </Tag>
          <Tag color="green">
            <ThemedText type="tag" textColor="green">
              React
            </ThemedText>
          </Tag>
        </Tags>
        <Image
          style={{ width: "100%", height: 200 }}
          source={{
            uri: "https://images.launchbox-app.com//80df32ce-9800-404c-9786-fb0628ec4abc.jpg",
          }}
        />
        <Image
          style={{ width: "100%", height: 200 }}
          source={{
            uri: "https://images.launchbox-app.com/b7a444fc-f6b3-415c-b270-55b9aab05756.jpg",
          }}
        />
        <Image
          style={{ width: "100%", height: 200 }}
          source={{
            uri: "https://images.launchbox-app.com/4b488f82-83f5-4088-a870-9ebe8f5c6c7d.jpg",
          }}
        />
      </Content>

      <Track tint="light" intensity={30}>
        <ThemedText type="title">Track</ThemedText>
      </Track>
    </Container>
  );
}
