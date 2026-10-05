import { STORAGE_KEY, saveContent } from "@/utils/storage";
import AsyncStorage from "@react-native-async-storage/async-storage";

const LEGACY_STORAGE_KEY = "galaea/state/v3";

// Matches the compress quality every image kind uses in images.js.
const MIGRATED_IMAGE_QUALITY = 0.4;

function toISODate(value) {
  const date = new Date(value);
  return Number.isNaN(date.getTime()) ? null : date.toISOString();
}

function nextId(counters, key) {
  counters[key] = (counters[key] ?? 0) + 1;
  return counters[key];
}

function migrateImageFormat(uri) {
  return /\.gif(\?|$)/i.test(uri ?? "") ? "gif" : "jpeg";
}

function migrateImage(oldImage, counters, images) {
  if (!oldImage) return null;
  const id = nextId(counters, "image");
  images.push({
    id,
    uri: oldImage.uri ?? "",
    format: migrateImageFormat(oldImage.uri),
    quality: MIGRATED_IMAGE_QUALITY,
    width: oldImage.rawWidth ?? null,
    height: oldImage.rawHeight ?? null,
    aspectRatio: oldImage.aspectRatio ?? null,
    contentPosition: oldImage.focus ?? null,
  });
  return id;
}

function migrateGallery(oldGallery, counters, galleries, images) {
  if (!oldGallery || oldGallery.length === 0) return null;
  const id = nextId(counters, "gallery");
  const slides = oldGallery.map((oldImage, index) => ({
    imageId: migrateImage(oldImage, counters, images),
    caption: oldImage.caption ?? "",
    order: index,
  }));
  galleries.push({ id, slides });
  return id;
}

function migrateEntry(
  legacyEntry,
  postId,
  itemId,
  counters,
  galleries,
  images,
  entries,
) {
  const id = nextId(counters, "entry");
  entries.push({
    id,
    text: legacyEntry.text ?? "",
    tagIds: legacyEntry.tags ?? [],
    galleryId: migrateGallery(legacyEntry.gallery, counters, galleries, images),
    parents: { postId, itemId },
  });
  return id;
}

export function migrateLegacyContent(legacy) {
  const counters = {};
  const images = [];
  const galleries = [];
  const entries = [];
  const migratedEntryKeys = new Set();

  const tags = (legacy.tags ?? []).map((oldTag) => ({
    id: oldTag.tagId,
    title: oldTag.name,
    color: oldTag.color,
  }));

  const legacyItemsById = new Map(
    (legacy.items ?? []).map((oldItem) => [oldItem.itemId, oldItem]),
  );

  const items = (legacy.items ?? []).map((oldItem, index) => ({
    id: oldItem.itemId,
    title: oldItem.title ?? "",
    images: {
      cardId: migrateImage(oldItem.cardImage, counters, images),
      coverId: migrateImage(oldItem.coverImage, counters, images),
      thumbnailId: migrateImage(oldItem.cardThumbnail, counters, images),
    },
    order: index,
  }));

  const collections = (legacy.collections ?? []).map(
    (oldCollection, index) => ({
      id: oldCollection.collectionId,
      title: oldCollection.name ?? "",
      itemIds: items
        .filter(
          (item) =>
            legacyItemsById.get(item.id)?.collectionId ===
            oldCollection.collectionId,
        )
        .map((item) => item.id),
      order: index,
    }),
  );

  const posts = (legacy.entries ?? []).map((oldDay) => {
    const postId = nextId(counters, "post");

    (oldDay.items ?? []).forEach((ref) => {
      const legacyItem = legacyItemsById.get(ref.itemId);
      const legacyEntry = legacyItem?.entries?.find(
        (e) => e.entryId === ref.entryId,
      );
      if (!legacyItem || !legacyEntry) return;

      migrateEntry(
        legacyEntry,
        postId,
        ref.itemId,
        counters,
        galleries,
        images,
        entries,
      );
      migratedEntryKeys.add(`${ref.itemId}:${ref.entryId}`);
    });

    return {
      id: postId,
      title: oldDay.title ?? "",
      text: oldDay.text ?? "",
      date: toISODate(oldDay.date),
      tagIds: oldDay.tags ?? [],
    };
  });

  // Entries that exist on an item but were never referenced by any day -
  // shouldn't normally happen, kept anyway so nothing is silently dropped.
  legacyItemsById.forEach((legacyItem, itemId) => {
    (legacyItem.entries ?? []).forEach((legacyEntry) => {
      const key = `${itemId}:${legacyEntry.entryId}`;
      if (migratedEntryKeys.has(key)) return;
      migrateEntry(
        legacyEntry,
        null,
        itemId,
        counters,
        galleries,
        images,
        entries,
      );
    });
  });

  return {
    posts,
    collections,
    items,
    entries,
    galleries,
    images,
    tags,
  };
}

export async function runLegacyMigration() {
  const raw = await AsyncStorage.getItem(LEGACY_STORAGE_KEY);
  if (!raw) return null;

  const legacy = JSON.parse(raw);
  const content = migrateLegacyContent(legacy);

  await saveContent(STORAGE_KEY.CONTENT, content);

  return content;
}
