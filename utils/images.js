import {
  COLLECTION_HERO_HEIGHT,
  COLLECTION_HERO_SPACING,
  LIGHTBOX_PADDING,
} from "@/constants/values";
import { Directory, File, Paths } from "expo-file-system";
import { ImageManipulator, SaveFormat } from "expo-image-manipulator";
import { Dimensions } from "react-native";

const STORAGE_DIR_NAME = "picked-images";
const MAX_DIMENSION = 1440;
const DEFAULT_COMPRESS_QUALITY = 0.7;

const IMAGE_PRESETS = {
  card: {
    quality: 0.7,
    resizeHeight: COLLECTION_HERO_HEIGHT - 2 * COLLECTION_HERO_SPACING,
  },
  cover: { quality: 0.4 },
  gallery: { quality: 0.5 },
};

function resolveOptions(kind) {
  const { width: screenWidth, scale } = Dimensions.get("window");
  const preset = IMAGE_PRESETS[kind];
  switch (kind) {
    case "card":
      return {
        quality: preset.quality,
        resizeHeight: preset.resizeHeight * scale,
      };
    case "cover":
      return { quality: preset.quality, resizeWidth: screenWidth * scale };
    case "gallery":
      return {
        quality: preset.quality,
        resizeWidth: (screenWidth - LIGHTBOX_PADDING * 2) * scale,
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
