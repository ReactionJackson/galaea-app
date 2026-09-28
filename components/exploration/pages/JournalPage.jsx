import { AnimateHeight } from "@/components/interface/AnimateHeight";
import { Button } from "@/components/interface/Button";
import { HeaderBar } from "@/components/interface/HeaderBar";
import { ThemedText } from "@/components/interface/ThemedText";
import { Tags } from "@/components/tags/Tags";
import { useApp } from "@/context/AppContext";
import { formatDate } from "@/utils/formatDate";
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
  const { getById, entries, isEditing } = useApp();
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
        <ThemedText
          isInput
          multiline={true}
          placeholder="Something that happened today..."
          isEditable={isEditing}
          isVisible={!!text || isEditing}
        >
          {text}
        </ThemedText>
        <Tags tagIds={tags} isVisible={!!tags} />
        {currentEntries.map((entry) => (
          <ItemEntryBubble key={`entry-${entry.id}`} {...entry} />
        ))}
        <AnimateHeight isVisible={true}>
          <Button variant="primary">Add Item</Button>
        </AnimateHeight>
      </Page.Content>
    </Page>
  );
};
