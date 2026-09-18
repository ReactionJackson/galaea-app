import { Directory, File, Paths } from "expo-file-system";
import { ImageManipulator, SaveFormat } from "expo-image-manipulator";

const STORAGE_DIR_NAME = "picked-images";
const MAX_DIMENSION = 1440;
const DEFAULT_COMPRESS_QUALITY = 0.7;

function storageDir() {
  const dir = new Directory(Paths.document, STORAGE_DIR_NAME);
  if (!dir.exists) dir.create({ intermediates: true, idempotent: true });
  return dir;
}

function isGif({ mimeType, uri } = {}) {
  if (mimeType) return mimeType === "image/gif";
  return /\.gif(\?|$)/i.test(uri ?? "");
}

export async function storePickedImage(
  { uri, width, height, mimeType },
  { quality = DEFAULT_COMPRESS_QUALITY, resizeWidth } = {},
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
