import { Button } from "@/components/interface/Button";
import { HeaderBar } from "@/components/interface/HeaderBar";
import { MultilineText } from "@/components/interface/MultilineText";
import { Spacer } from "@/components/interface/Spacer";
import { Tags } from "@/components/tags/Tags";
import { usePage } from "@/context/PageContext";
import { formatDate } from "@/utils/formatDate";
import { View } from "react-native";
import { Page } from "./Page";
import { ItemEntryBubble } from "./components/ItemEntryBubble";
import { NumberBadge } from "./components/NumberBadge";

// Sub Components:

const Header = ({ title, date, onChangeText }) => {
  const { isEditing } = usePage();
  return (
    <HeaderBar>
      <HeaderBar.Badge>
        <NumberBadge variant="primary">{formatDate(date, "day")}</NumberBadge>
      </HeaderBar.Badge>
      <HeaderBar.Title
        onChangeText={onChangeText}
        placeholder={formatDate(date, "weekday")}
      >
        {isEditing ? title : title || formatDate(date, "weekday")}
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
  const { isEditing, setIsEditing, draft, getById, entryIdsByPostId } =
    usePage();
  const { title, date, text, tagIds } = getById("posts", postId) ?? {};
  const entryIds = entryIdsByPostId[postId] ?? [];

  // Temp Edit Mode Controls:

  const handleEdit = () => {
    setIsEditing(true);
  };

  const handleCancel = () => {
    draft.discard();
    setIsEditing(false);
  };

  const handleSave = () => {
    draft.commit();
    setIsEditing(false);
  };

  // Handlers:

  const handleChangeTitle = (title) => {
    draft.update("posts", postId, { title });
  };

  const handleChangeText = (text) => {
    draft.update("posts", postId, { text });
  };

  return (
    <Page>
      <Page.Header>
        <Header title={title} date={date} onChangeText={handleChangeTitle} />
      </Page.Header>
      <Page.Content>
        <View
          style={{
            flexDirection: "row",
            justifyContent: "center",
            marginBottom: 20,
            gap: 10,
          }}
        >
          <Button disabled={isEditing} variant="primary" onPress={handleEdit}>
            Edit
          </Button>
          <Button
            disabled={!isEditing}
            variant="secondary"
            onPress={handleCancel}
          >
            Cancel
          </Button>
          <Button disabled={!isEditing} variant="primary" onPress={handleSave}>
            Save
          </Button>
        </View>
        <MultilineText onChangeText={handleChangeText}>{text}</MultilineText>
        <Spacer
          isVisible={isEditing || (!!text && !!tagIds.length)}
          height={15}
        />
        <Tags parent={{ key: "posts", id: postId }} tagIds={tagIds} />
        <Spacer
          isVisible={isEditing || (!!tagIds.length && !!entryIds.length)}
          height={20}
        />
        {entryIds.map((id) => (
          <ItemEntryBubble key={`entry-${id}`} entryId={id} />
        ))}
      </Page.Content>
    </Page>
  );
};
