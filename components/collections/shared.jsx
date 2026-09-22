import { Gallery } from "@/components/gallery/Gallery";
import {
  AnimateHeight,
  AnimatedSpacer,
} from "@/components/interface/AnimateHeight";
import { ThemedText } from "@/components/interface/ThemedText";
import { Tags } from "@/components/tags/Tags";

export function EntryFields({
  text = "",
  tagIds = [],
  gallery = [],
  editable = false,
  onUpdate,
  horizontalPadding,
}) {
  const handleToggleTag = (tagId) => {
    const next = tagIds.includes(tagId)
      ? tagIds.filter((id) => id !== tagId)
      : [...tagIds, tagId];
    onUpdate({ tags: next });
  };

  const handleAddImage = (image) => {
    onUpdate({ gallery: [...gallery, image] });
  };

  const handleUpdateImage = (imageIndex, image) => {
    onUpdate({
      gallery: gallery.map((existing, i) =>
        i === imageIndex ? image : existing,
      ),
    });
  };

  const handleDeleteImage = (imageIndex) => {
    onUpdate({ gallery: gallery.filter((_, i) => i !== imageIndex) });
  };

  const handleReorderImages = (fromIndex, toIndex) => {
    const next = [...gallery];
    [next[fromIndex], next[toIndex]] = [next[toIndex], next[fromIndex]];
    onUpdate({ gallery: next });
  };

  return (
    <>
      <AnimateHeight visible={!!(text || editable)}>
        <ThemedText
          isInput
          multiline={true}
          value={text}
          placeholder="Write something about this..."
          onChangeText={(t) => onUpdate({ text: t })}
          editable={editable}
        />
      </AnimateHeight>
      <AnimatedSpacer
        height={text || editable ? 15 : 10}
        visible={!!(gallery.length || editable)}
      />
      <AnimateHeight
        visible={!!(gallery.length || editable)}
        style={{ marginHorizontal: -20 }}
      >
        <Gallery
          images={gallery}
          editMode={editable}
          onAddImage={handleAddImage}
          onUpdateImage={handleUpdateImage}
          onDeleteImage={handleDeleteImage}
          onReorderImages={handleReorderImages}
          horizontalPadding={horizontalPadding}
        />
      </AnimateHeight>
      <Tags tagIds={tagIds} editMode={editable} onToggleTag={handleToggleTag} />
    </>
  );
}
