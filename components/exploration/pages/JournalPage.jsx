import { HeaderBar } from "@/components/interface/HeaderBar";
import { ThemedText } from "@/components/interface/ThemedText";
import { useApp } from "@/context/AppContext";
import { formatDate } from "@/utils/formatDate";
import { PageManager } from "./PageManager";
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

export const JournalPage = () => {
  const { posts } = useApp();
  const { title, date, text } = posts.find((post) => post.id === 5) ?? {};
  return (
    <PageManager>
      <PageManager.Header>
        <Header title={title} date={date} />
      </PageManager.Header>
      <PageManager.Content>
        <ThemedText
          isInput
          multiline={true}
          placeholder="Write something about today..."
        >
          {text}
        </ThemedText>
      </PageManager.Content>

      {/* <Tags
            tagIds={data.tags}
            editMode={pageEditMode}
            onToggleTag={handleToggleTag}
          />
          <AnimatedSpacer visible={textVisible || tagsVisible} height={25} />

          {data.items.map(
            ({ itemId, entryId, isNew, text, tags, gallery }, i) => (
              <View key={`${itemId}-${String(entryId)}-${i}`}>
                <AnimateHeight visible>
                  <ItemEntryBubble
                    itemId={itemId}
                    entryId={entryId}
                    index={i}
                    isNew={isNew}
                    editable={pageEditMode}
                    text={text}
                    tagIds={tags}
                    gallery={gallery}
                  />
                </AnimateHeight>
                {i !== data.items.length - 1 && <AnimatedSpacer visible />}
              </View>
            ),
          )}
          <AnimatedSpacer visible={data.items.length > 0} />

          {pageEditMode && (
            <>
              <AnimateHeight
                visible={editMode}
                animateOnMount
                style={{ marginHorizontal: -20 }}
              >
                <PickerNavigator
                  attachedItemIds={activeEntry.items.map((it) => it.itemId)}
                  onSelect={handleSelectItem}
                />
              </AnimateHeight>
              <AnimatedSpacer visible={editMode} height={70} />
            </>
          )} */}
    </PageManager>
  );
};
