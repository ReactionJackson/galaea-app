import { generateCardThumbnail, reprocessIfOversized } from "./images";

export async function reprocessLegacyImages(items, onItemPatched) {
  for (const item of items) {
    const patch = { itemId: item.itemId };
    if (item.cardImage) {
      const value = await reprocessIfOversized(item.cardImage, "card");
      if (value !== item.cardImage) {
        patch.cardImage = { fromUri: item.cardImage.uri, value };
      }
      // One-time backfill — every item that predates the thumbnail
      // pipeline has a cardImage but no cardThumbnail yet.
      if (!item.cardThumbnail) {
        const thumbnail = await generateCardThumbnail(item.cardImage);
        if (thumbnail) {
          patch.cardThumbnail = {
            fromUri: item.cardImage.uri,
            value: thumbnail,
          };
        }
      }
    }
    if (item.coverImage) {
      const value = await reprocessIfOversized(item.coverImage, "cover");
      if (value !== item.coverImage) {
        patch.coverImage = { fromUri: item.coverImage.uri, value };
      }
    }
    const entryPatches = [];
    for (const entry of item.entries) {
      const images = [];
      for (const image of entry.gallery ?? []) {
        const value = await reprocessIfOversized(image, "gallery");
        if (value !== image) images.push({ fromUri: image.uri, value });
      }
      if (images.length) entryPatches.push({ entryId: entry.entryId, images });
    }
    if (entryPatches.length) patch.entryPatches = entryPatches;
    if (
      patch.cardImage ||
      patch.cardThumbnail ||
      patch.coverImage ||
      patch.entryPatches
    ) {
      onItemPatched(patch);
    }
  }
}
