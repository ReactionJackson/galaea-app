import { ThemedText } from "@/components/themed-text";
import { BlurView } from "expo-blur";
import { Image as ExpoImage } from "expo-image";
import { Platform } from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import styled from "styled-components/native";

const Container = styled.SafeAreaView`
  flex: 1;
  justify-content: flex-start;
  align-items: center;
  background-color: #fff;
`;

const TopNav = styled.View`
  flex-direction: row;
  justify-content: space-between;
  align-items: center;
  width: 100%;
  height: 60px;
  padding: 0 20px;
  background-color: #fff;
  shadow-color: #000;
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

const EntryDayContainer = styled.View`
  justify-content: center;
  align-items: center;
  width: 40px;
  height: 40px;
  border-radius: 50%;
  background-color: #f96156;
`;

const EntryDay = styled.Text`
  color: #fff;
  font-size: 18px;
  letter-spacing: 1px;
  font-family: Outfit600;
`;

const EntryInfo = styled.View`
  flex-direction: column;
  justify-content: flex-start;
  align-items: flex-start;
`;

const EntryTitle = styled.Text`
  font-family: Outfit500;
  font-size: 22px;
  line-height: 28px;
  height: 28px;
`;

const EntryMonth = styled.Text`
  font-family: Outfit500;
  font-size: 9px;
  text-transform: uppercase;
  color: rgba(0, 0, 0, 0.6);
  letter-spacing: 3px;
  margin: 3px 0 -2px 0;
`;

const EntryTime = styled(EntryMonth)`
  color: rgba(0, 0, 0, 0.3);
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

const Title = styled(ThemedText)`
  font-size: 24px;
`;

const Text = styled(ThemedText)`
  font-family: Outfit300;
  font-size: 16px;
  line-height: 24px;
  color: rgba(0, 0, 0, 0.8);
  ${Platform.select({
    default: ``,
    web: `
      text-rendering: optimizeLegibility;
      -webkit-font-smoothing: antialiased;
      -moz-osx-font-smoothing: grayscale;
    `,
  })}
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
        <Title type="title">Galaea</Title>
        <Title type="title">O</Title>
      </TopNav>
      <Header blurType="light" intensity={30} topInset={top}>
        <EntryDayContainer>
          <EntryDay>22</EntryDay>
        </EntryDayContainer>
        <EntryInfo>
          <EntryMonth>
            March <EntryTime>02:16AM</EntryTime>
          </EntryMonth>
          <EntryTitle>Porting to React Native</EntryTitle>
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
        <Text>
          Started the morning with some Xenoblade before doing anything else,
          which is always a good sign for the day. Spent the afternoon doing
          some work on the journal app — got the PWA manifest set up so it can
          be saved to the home screen properly and opens without the Safari bar.
          Feels way more like a real app now. Small detail but it matters.
        </Text>
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
      <Track blurType="light" intensity={30}>
        <Title type="title">Track</Title>
      </Track>
    </Container>
  );
}
