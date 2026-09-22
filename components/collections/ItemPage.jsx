import { ItemEntry } from "@/components/collections/ItemEntry";
import { ItemHero } from "@/components/collections/ItemHero";
import { CoverImage } from "@/components/image/CoverImage";
import { Image } from "@/components/image/Image";
import { AnimatedSpacer } from "@/components/interface/AnimateHeight";
import { FadeInOnMount } from "@/components/interface/FadeInOnMount";
import { HeaderText } from "@/components/interface/HeaderText";
import { EditLightbox } from "@/components/lightbox/EditLightbox";
import { PageScroll } from "@/components/page/PageScroll";
import { StickyHeader } from "@/components/page/StickyHeader";
import {
  COLLECTION_HERO_HEIGHT,
  COLLECTION_HERO_SPACING,
} from "@/constants/values";
import { Fragment } from "react";
import { useWindowDimensions } from "react-native";
import styled from "styled-components/native";

const BADGE_SIZE = 54;

const CoverFill = styled.View`
  position: absolute;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
`;

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
      <StickyHeader style={{ marginBottom: 10 }}>
        <HeaderText>
          <HeaderText.Badge shape="image" size={BADGE_SIZE}>
            {item.coverImage && (
              <CoverFill>
                <CoverImage {...item.coverImage} addOverlay />
              </CoverFill>
            )}
            {item.cardThumbnail && (
              <Image
                {...item.cardThumbnail}
                width={BADGE_SIZE - 12}
                height={BADGE_SIZE - 12}
                radius={4}
                contentFit="cover"
              />
            )}
          </HeaderText.Badge>
          <HeaderText.Title
            key={editMode ? "editing" : "display"}
            value={!editMode && !item.title ? "New Item" : item.title}
            placeholder="New Item"
            onChangeText={onChangeTitle}
            editable={editMode}
          />
          <HeaderText.Subtitle>{collectionName}</HeaderText.Subtitle>
        </HeaderText>
      </StickyHeader>
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
