import {
  CARD_HEIGHT,
  CARD_THUMBNAIL_HEIGHT,
  LIGHTBOX_PADDING,
} from "@/constants/values";
import { Directory, File, Paths } from "expo-file-system";
import { ImageManipulator, SaveFormat } from "expo-image-manipulator";
import { Dimensions } from "react-native";

const STORAGE_DIR_NAME = "picked-images";
const MAX_DIMENSION = 1440;
const DEFAULT_COMPRESS_QUALITY = 0.7;
const SCALE_FACTOR = 2;

function resolveOptions(kind) {
  const { width: screenWidth } = Dimensions.get("window");
  switch (kind) {
    case "card":
      return {
        quality: 0.4,
        resizeHeight: CARD_HEIGHT * SCALE_FACTOR,
      };
    case "card-thumbnail":
      return {
        quality: 0.4,
        resizeHeight: CARD_THUMBNAIL_HEIGHT * SCALE_FACTOR,
      };
    case "cover":
      return { quality: 0.4, resizeWidth: screenWidth };
    case "gallery":
      return {
        quality: 0.4,
        resizeWidth: (screenWidth - LIGHTBOX_PADDING * 2) * SCALE_FACTOR,
      };
    default:
      throw new Error(`Unknown image kind: ${kind}`);
  }
}

function storageDir() {
  const dir = new Directory(Paths.document, STORAGE_DIR_NAME);
  if (!dir.exists) dir.create({ intermediates: true, idempotent: true });
  return dir;
}

function isGif({ mimeType, uri } = {}) {
  if (mimeType) return mimeType === "image/gif";
  return /\.gif(\?|$)/i.test(uri ?? "");
}

export function fileExists(uri) {
  try {
    return !!uri && new File(uri).exists;
  } catch {
    return false;
  }
}

export function deleteAllStoredImages() {
  const dir = storageDir();
  for (const entry of dir.list()) {
    entry.delete();
  }
}

async function storePickedImage(
  { uri, width, height, mimeType },
  { quality = DEFAULT_COMPRESS_QUALITY, resizeWidth, resizeHeight } = {},
) {
  const dir = storageDir();

  if (isGif({ mimeType, uri })) {
    const destFile = new File(
      dir,
      `${Date.now()}-${Math.round(Math.random() * 1e6)}.gif`,
    );
    new File(uri).copySync(destFile, { overwrite: true });
    return {
      uri: destFile.uri,
      rawWidth: width,
      rawHeight: height,
      aspectRatio: width / height,
    };
  }

  let manipulated = ImageManipulator.manipulate(uri);
  if (resizeWidth) {
    manipulated = manipulated.resize({ width: resizeWidth });
  } else if (resizeHeight) {
    manipulated = manipulated.resize({ height: resizeHeight });
  } else {
    const longEdge = Math.max(width ?? 0, height ?? 0);
    const targetLongEdge = longEdge
      ? Math.min(longEdge, MAX_DIMENSION)
      : MAX_DIMENSION;
    const isLandscape = (width ?? 0) >= (height ?? 0);
    manipulated = manipulated.resize(
      isLandscape ? { width: targetLongEdge } : { height: targetLongEdge },
    );
  }

  const imageRef = await manipulated.renderAsync();
  const saved = await imageRef.saveAsync({
    compress: quality,
    format: SaveFormat.JPEG,
  });

  const destFile = new File(
    dir,
    `${Date.now()}-${Math.round(Math.random() * 1e6)}.jpg`,
  );
  new File(saved.uri).moveSync(destFile, { overwrite: true });

  return {
    uri: destFile.uri,
    rawWidth: saved.width,
    rawHeight: saved.height,
    aspectRatio: saved.width / saved.height,
  };
}

export async function pickAndStoreImage(asset, kind) {
  return storePickedImage(asset, resolveOptions(kind));
}

function isOversized(
  { rawWidth, rawHeight } = {},
  { resizeWidth, resizeHeight },
) {
  if (resizeWidth) return (rawWidth ?? 0) > resizeWidth;
  if (resizeHeight) return (rawHeight ?? 0) > resizeHeight;
  return false;
}

// Migration-only: derives a thumbnail from an already-stored, already-
// compressed cardImage rather than an original picked asset (there isn't
// one any more by the time this runs) — quality 1 because the source is
// already lossy, and recompressing it again on top would just compound
// artifacts for no reason. Going forward, new items get their thumbnail
// the normal way, via pickAndStoreImage(asset, "card-thumbnail") against
// the same original asset the full card image comes from.
export async function generateCardThumbnail(image) {
  if (!image?.uri || isGif({ uri: image.uri })) return null;
  const { uri, rawWidth, rawHeight } = image;
  return storePickedImage(
    { uri, width: rawWidth, height: rawHeight },
    { quality: 1, resizeHeight: CARD_THUMBNAIL_HEIGHT * SCALE_FACTOR },
  );
}

export async function reprocessIfOversized(image, kind) {
  const options = resolveOptions(kind);
  if (
    !image?.uri ||
    isGif({ uri: image.uri }) ||
    !isOversized(image, options)
  ) {
    return image;
  }
  const { uri, rawWidth, rawHeight, ...rest } = image;
  const optimized = await storePickedImage(
    { uri, width: rawWidth, height: rawHeight },
    options,
  );
  try {
    new File(uri).delete();
  } catch {
    // Best-effort cleanup — a failed delete just leaves one orphaned file
    // behind, not worth failing the whole migration over.
  }
  return { ...rest, ...optimized };
}

export function deleteStoredImage(image) {
  const uri = typeof image === "string" ? image : image?.uri;
  if (!uri) return;
  try {
    new File(uri).delete();
    console.log("deleted image", uri);
  } catch {
    // Best-effort cleanup — a failed delete just leaves one orphaned file
    // behind, not worth failing whatever's discarding this image over.
    console.log("failed to delete image", uri);
  }
}

// Deletes whichever images from `before` are no longer present in `after`
// (by uri). Used whenever a draft resolves — cancelled or saved — to clean
// up whatever stored files that resolution no longer needs: cancelling
// diffs draft against the committed baseline it's reverting to, saving
// diffs the old baseline against what actually got saved.
export function deleteDroppedImages(before, after) {
  const keep = new Set((after ?? []).map((img) => img?.uri).filter(Boolean));
  for (const img of before ?? []) {
    if (img?.uri && !keep.has(img.uri)) deleteStoredImage(img);
  }
}

// Every stored image an item can reference — its own card art plus every
// entry's gallery.
export function collectItemImages(item) {
  if (!item) return [];
  const images = [item.cardImage, item.cardThumbnail, item.coverImage].filter(
    Boolean,
  );
  for (const entry of item.entries ?? []) {
    images.push(...(entry.gallery ?? []));
  }
  return images;
}

// One-time-per-launch sweep: deletes any file in storage no longer
// referenced by any item. Catches whatever the forward-going cancel/save
// cleanup can't, the pre-existing backlog, plus anything that still slips
// through it later (a crash mid-edit, etc).
export function purgeOrphanedImages(items) {
  const referenced = new Set();
  for (const item of items) {
    for (const image of collectItemImages(item)) {
      if (image?.uri) referenced.add(image.uri);
    }
  }
  for (const entry of storageDir().list()) {
    if (!referenced.has(entry.uri)) {
      try {
        entry.delete();
        console.log("deleted orphaned image", entry.uri);
      } catch {
        // Best-effort — see deleteStoredImage.
        console.log("failed to delete orphaned image", entry.uri);
      }
    }
  }
}
