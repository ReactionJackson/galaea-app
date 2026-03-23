import { BlurView } from "@/components/BlurView";
import { GameEntry } from "@/components/GameEntry";
import { JournalTrack } from "@/components/JournalTrack";
import { Tags } from "@/components/Tags";
import { ThemedText } from "@/components/ThemedText";
import { Colors, Fonts } from "@/constants/theme";
import { daysData } from "@/data/entries";
import { useEffect, useState } from "react";
import { Keyboard, KeyboardAvoidingView, Platform } from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import styled from "styled-components/native";

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

const Header = styled.View`
  z-index: 100;
  position: absolute;
  top: ${({ topInset }) => topInset + 60}px;
  left: 0;
  right: 0;
  height: 70px;
`;

const HeaderBlur = styled(BlurView)`
  position: absolute;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
`;

const HeaderContent = styled.View`
  flex-direction: row;
  justify-content: flex-start;
  align-items: flex-start;
  gap: 10px;
  padding: 20px 20px 10px 20px;
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

const Input = styled.TextInput`
  font-family: ${Fonts.regular};
  font-size: 16px;
  line-height: 24px;
  color: ${Colors.text};
  padding: 0;
`;

const KeyboardToolbar = styled.View`
  flex-direction: row;
  justify-content: flex-end;
  align-items: center;
  padding: 8px 16px;
  background-color: ${Colors.backgroundBlurTint};
  border-top-width: 1px;
  border-top-color: ${Colors.dateBorder};
`;

const DoneButton = styled.Pressable`
  padding: 4px 0 4px 16px;
`;

const DoneText = styled.Text`
  font-family: ${Fonts.medium};
  font-size: 16px;
  color: ${Colors.accent};
`;

export default function HomeScreen() {
  const [activeEntry, setActiveEntry] = useState(daysData[0]);
  const [keyboardHeight, setKeyboardHeight] = useState(0);
  const keyboardVisible = keyboardHeight > 0;
  const { top } = useSafeAreaInsets();

  useEffect(() => {
    const show = Keyboard.addListener(
      Platform.OS === "ios" ? "keyboardWillShow" : "keyboardDidShow",
      (e) => setKeyboardHeight(e.endCoordinates.height)
    );
    const hide = Keyboard.addListener(
      Platform.OS === "ios" ? "keyboardWillHide" : "keyboardDidHide",
      () => setKeyboardHeight(0)
    );
    return () => { show.remove(); hide.remove(); };
  }, []);

  const formatDate = (format) => {
    const date = new Date(activeEntry.date);
    switch (format) {
      case "day":
        return date.getDate().toString();
      case "month":
        return date.toLocaleString("default", { month: "long" });
      case "time":
        return date.toLocaleString("default", {
          hour: "2-digit",
          minute: "2-digit",
          hour12: true,
        });
      case "weekday":
        return date.toLocaleString("default", { weekday: "long" });
    }
  };

  const handleChangeDay = (dayId) => {
    setActiveEntry(daysData.find((day) => day.dayId === dayId));
  };

  return (
    <Container>
      <TopBar>
        <ThemedText type="title">Galaea</ThemedText>
        <ThemedText type="title">O</ThemedText>
      </TopBar>

      <Header topInset={top}>
        <HeaderBlur tint="light" />
        <HeaderContent>
          <EntryNumber>
            <ThemedText type="date-number">{formatDate("day")}</ThemedText>
          </EntryNumber>
          <EntryInfo>
            <EntryDate>
              <ThemedText type="subtitle">{formatDate("month")}</ThemedText>
              <ThemedText type="subtitle" color="faded">
                {formatDate("time")}
              </ThemedText>
            </EntryDate>
            <Input
              placeholder={activeEntry.title || formatDate("weekday")}
              placeholderTextColor={Colors.faded}
            />
          </EntryInfo>
        </HeaderContent>
      </Header>

      <KeyboardAvoidingView
        behavior={Platform.OS === "ios" ? "padding" : "height"}
        style={{ flex: 1, width: "100%" }}
      >
        <Content
          keyboardShouldPersistTaps="handled"
          contentContainerStyle={{
            gap: 20,
            paddingTop: 70,
            paddingBottom: 110,
            paddingHorizontal: 20,
          }}
        >
          <Input
            multiline
            placeholder="What's on your mind today?"
            placeholderTextColor={Colors.faded}
          />
          <ThemedText>{activeEntry.text}</ThemedText>
          <Tags tagIds={activeEntry.tags} />
          {activeEntry.games.map(({ gameId, entryId }, i) => (
            <GameEntry
              key={`${gameId}-${entryId}-${i}`}
              gameId={gameId}
              entryId={entryId}
            />
          ))}
        </Content>

        {Platform.OS === "ios" && keyboardVisible && (
          <KeyboardToolbar>
            <DoneButton onPress={() => Keyboard.dismiss()}>
              <DoneText>Done</DoneText>
            </DoneButton>
          </KeyboardToolbar>
        )}
      </KeyboardAvoidingView>

      <JournalTrack onChangeDay={handleChangeDay} />
    </Container>
  );
}
