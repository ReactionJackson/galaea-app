import { OverviewItems } from "@/components/exploration/pages/components/OverviewItems";
import { HeaderText } from "@/components/interface/HeaderText";
import { ThemedText } from "@/components/interface/ThemedText";
import { PageScroll } from "@/components/exploration/pages/components/PageScroll";
import { StickyHeader } from "@/components/exploration/pages/components/StickyHeader";

export function CollectionPage({
  collection,
  items,
  editable = false,
  onChangeName = () => {},
  onPressItem,
  onPressAdd,
}) {
  const collectionItems = items.filter(
    (item) => item.collectionId === collection.collectionId,
  );

  return (
    <>
      {/* <OverviewBackdrop collectionId={collection.collectionId} /> */}
      <PageScroll
        resetKey={`collection-${collection.collectionId}`}
        contentContainerStyle={{ paddingHorizontal: 20, paddingBottom: 130 }}
      >
        <StickyHeader>
          <HeaderText>
            <HeaderText.Badge variant="secondary">
              <ThemedText type="date-number" color="title">
                {String(collectionItems.length).padStart(2, "0")}
              </ThemedText>
            </HeaderText.Badge>
            <HeaderText.Title
              key={editable ? "editing" : "display"}
              value={
                !editable && !collection.name
                  ? "New Collection"
                  : collection.name
              }
              placeholder="New Collection"
              editable={editable}
              onChangeText={onChangeName}
            />
            <HeaderText.Subtitle>Collection</HeaderText.Subtitle>
          </HeaderText>
        </StickyHeader>
        <OverviewItems
          key={collection.collectionId}
          items={collectionItems}
          onPressItem={onPressItem}
          onPressAdd={() => onPressAdd(collection.collectionId)}
        />
      </PageScroll>
    </>
  );
}
