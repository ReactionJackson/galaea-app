import { ItemEntry } from "@/components/collections/ItemEntry";
import { ItemHero } from "@/components/collections/ItemHero";
import { AnimatedSpacer } from "@/components/interface/AnimateHeight";
import { FadeInOnMount } from "@/components/interface/FadeInOnMount";
import { ThemedText } from "@/components/interface/ThemedText";
import { EditLightbox } from "@/components/lightbox/EditLightbox";
import { PageHeader } from "@/components/page/PageHeader";
import { PageScroll } from "@/components/page/PageScroll";
import {
  COLLECTION_HERO_HEIGHT,
  COLLECTION_HERO_SPACING,
} from "@/constants/values";
import { Fragment } from "react";
import { useWindowDimensions } from "react-native";

export function ItemPage({
  item,
  collectionName,
  editMode,
  contentKey,
  coverImageToEdit,
  orderedEntries,
  onPressCard,
  onPressCover,
  onEditCover,
  onRemoveCover,
  onCloseCover,
  onSaveCover,
  onChangeTitle,
  onUpdateEntry,
}) {
  const { width: screenWidth } = useWindowDimensions();

  return (
    <PageScroll
      resetKey={contentKey}
      contentContainerStyle={{ paddingHorizontal: 20, paddingBottom: 130 }}
    >
      <ItemHero
        height={COLLECTION_HERO_HEIGHT}
        spacing={COLLECTION_HERO_SPACING}
        cardImage={item.cardImage}
        coverImage={item.coverImage}
        editable={editMode}
        onPressCard={onPressCard}
        onPressCover={onPressCover}
        onEditCover={onEditCover}
        onRemoveCover={onRemoveCover}
      />
      <EditLightbox
        image={coverImageToEdit}
        onClose={onCloseCover}
        onSave={onSaveCover}
        targetAspectRatio={screenWidth / COLLECTION_HERO_HEIGHT}
      />
      <PageHeader gap={7} style={{ marginBottom: 10 }}>
        <PageHeader.Title
          key={editMode ? "editing" : "display"}
          value={!editMode && !item.title ? "New Item" : item.title}
          placeholder="New Item"
          onChangeText={onChangeTitle}
          editable={editMode}
        />
        <PageHeader.Meta>
          <ThemedText type="subtitle">{collectionName} Collection</ThemedText>
        </PageHeader.Meta>
      </PageHeader>
      <FadeInOnMount>
        <Fragment key={contentKey}>
          {orderedEntries.map((entry) => (
            <ItemEntry
              key={entry.entryId}
              editable={editMode}
              date={entry.date}
              entryNumber={entry.entryNumber}
              text={entry.text}
              tagIds={entry.tags}
              gallery={entry.gallery}
              onUpdate={(changes) => onUpdateEntry(entry.entryId, changes)}
            />
          ))}
          <AnimatedSpacer visible={editMode} height={50} />
        </Fragment>
      </FadeInOnMount>
    </PageScroll>
  );
}
