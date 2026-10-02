import { Button } from "@/components/interface/Button";
import { HeaderBar } from "@/components/interface/HeaderBar";
import { MultilineText } from "@/components/interface/MultilineText";
import { Tags } from "@/components/tags/Tags";
import { useApp } from "@/context/AppContext";
import { formatDate } from "@/utils/formatDate";
import { View } from "react-native";
import { Page } from "./Page";
import { ItemEntryBubble } from "./components/ItemEntryBubble";
import { NumberBadge } from "./components/NumberBadge";

// Sub Components:

const Header = ({ title, date }) => {
  return (
    <HeaderBar>
      <HeaderBar.Badge>
        <NumberBadge variant="primary">{formatDate(date, "day")}</NumberBadge>
      </HeaderBar.Badge>
      <HeaderBar.Title placeholder={formatDate(date, "weekday")}>
        {title || formatDate(date, "weekday")}
      </HeaderBar.Title>
      <HeaderBar.Subtitle>{formatDate(date, "month")}</HeaderBar.Subtitle>
      <HeaderBar.SubtitleFaded>
        {formatDate(date, "year")}
      </HeaderBar.SubtitleFaded>
    </HeaderBar>
  );
};

// Main Component:

export const JournalPage = ({ postId = 1 }) => {
  const { getById, entries, isEditing, setIsEditing } = useApp();
  const { title, date, text, tags } = getById("posts", postId) ?? {};
  const currentEntries = entries.filter(
    (entry) => entry.parents.post === postId,
  );

  return (
    <Page>
      <Page.Header>
        <Header title={title} date={date} />
      </Page.Header>
      <Page.Content>
        <View
          style={{
            flexDirection: "row",
            justifyContent: "center",
            gap: 10,
          }}
        >
          <Button variant="primary" onPress={() => setIsEditing(true)}>
            Edit
          </Button>
          <Button variant="secondary" onPress={() => setIsEditing(false)}>
            Cancel
          </Button>
          <Button variant="primary" onPress={() => setIsEditing(false)}>
            Save
          </Button>
        </View>
        <MultilineText isVisible={!!text || isEditing} gap={20}>
          {text}
        </MultilineText>
        <Tags tagIds={tags} isVisible={!!tags} gap={5} />
        {currentEntries.map((entry) => (
          <ItemEntryBubble key={`entry-${entry.id}`} {...entry} />
        ))}
      </Page.Content>
    </Page>
  );
};
