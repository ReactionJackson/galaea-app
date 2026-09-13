import { AnimatedSpacer, AnimateHeight } from "@/components/AnimateHeight";
import { Gallery, getImageUri } from "./Gallery";
import { Tags } from "./Tags";
import { ThemedText } from "./ThemedText";

// The part of a game entry that's the same whether it's being edited inline
// on the journal day it was written on (GameEntry) or read back on the
// game's own page (CollectionEntry) — gallery, the entry text, and its tags.
// GameEntry wraps this with its cover-image banner header; CollectionEntry
// just wraps it with a plain card, since the banner would repeat the game
// title/platform/genre already shown once at the top of that page.
export function EntryContent({
  entryNumber,
  editMode = false,
  text = "",
  tagIds = [],
  tags = [],
  gallery = [],
  // Left undefined by default so Gallery falls back to its own default —
  // only a caller whose surrounding padding differs from GameEntry's card
  // (see CollectionEntry) needs to override this.
  galleryHorizontalPadding,
  onChangeText,
  onChangeTags,
  onChangeGallery,
  onAddTag,
  onUpdateTagColor,
  onReplaceTag,
}) {
  const handleToggleTag = (tagId) => {
    const next = tagIds.includes(tagId)
      ? tagIds.filter((id) => id !== tagId)
      : [...tagIds, tagId];
    onChangeTags?.(next);
  };

  // Newly picked images are appended to the end of the list, before the
  // ever-present "Add Image" box (which lives outside this array in Gallery).
  // item is a plain uri string, or { uri, focus } when a focal point was set.
  const handleAddImage = (item) => {
    onChangeGallery?.([...gallery, item]);
  };

  // Re-editing an existing image's focal point (only reachable in edit mode)
  // updates that one entry in place rather than appending — focus === null
  // (Reset, then Save) collapses it back to a plain uri string.
  const handleUpdateImage = (index, focus) => {
    onChangeGallery?.(
      gallery.map((item, i) => {
        if (i !== index) return item;
        const uri = getImageUri(item);
        return focus ? { uri, focus } : uri;
      }),
    );
  };

  return (
    <>
      <AnimateHeight
        visible={!!(gallery.length || editMode)}
        style={{ marginHorizontal: -20 }}
      >
        <Gallery
          images={gallery}
          editMode={editMode}
          onAddImage={handleAddImage}
          onUpdateImage={handleUpdateImage}
          horizontalPadding={galleryHorizontalPadding}
        />
      </AnimateHeight>
      <AnimatedSpacer visible={!!(gallery.length || editMode)} />
      <AnimateHeight visible={!!(text || editMode)}>
        <ThemedText type="subtitle" color="text" style={{ marginBottom: 10 }}>
          Entry {String(entryNumber).padStart(2, "0")}
        </ThemedText>
        <ThemedText
          isInput
          multiline={true}
          value={text}
          placeholder="Write something about this game..."
          onChangeText={onChangeText}
          editable={editMode}
        />
      </AnimateHeight>
      <AnimatedSpacer visible={!!(text || editMode)} />
      <Tags
        tagIds={tagIds}
        tags={tags}
        editMode={editMode}
        onToggleTag={handleToggleTag}
        onAddTag={onAddTag}
        onUpdateTagColor={onUpdateTagColor}
        onReplaceTag={onReplaceTag}
      />
      <AnimatedSpacer visible={!!(tagIds.length || editMode)} />
    </>
  );
}
