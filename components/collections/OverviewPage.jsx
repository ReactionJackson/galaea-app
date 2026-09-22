import { OverviewItems } from "@/components/collections/OverviewItems";
import { ThemedText } from "@/components/interface/ThemedText";
import { PageHeader } from "@/components/page/PageHeader";
import { PageScroll } from "@/components/page/PageScroll";

export function OverviewPage({
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
        <PageHeader>
          <PageHeader.Badge variant="secondary">
            <ThemedText type="date-number" color="title">
              {String(collectionItems.length).padStart(2, "0")}
            </ThemedText>
          </PageHeader.Badge>
          <PageHeader.Title
            key={editable ? "editing" : "display"}
            value={
              !editable && !collection.name ? "New Collection" : collection.name
            }
            placeholder="New Collection"
            editable={editable}
            onChangeText={onChangeName}
          />
          <PageHeader.Meta>
            <ThemedText type="subtitle">Collection</ThemedText>
          </PageHeader.Meta>
        </PageHeader>
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
