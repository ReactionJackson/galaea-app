import { Directory, File, Paths } from "expo-file-system";
import { ImageManipulator, SaveFormat } from "expo-image-manipulator";

// Every picked image (box art, cover, gallery photos) goes through here
// before it's ever written into app state/AsyncStorage — nothing at the
// original camera resolution (which can be several thousand pixels wide)
// is ever persisted. Display components then derive their own further-
// reduced size from this master via useResizedImage (see
// hooks/useResizedImage.js) — this is just capping what gets stored in
// the first place.
const STORAGE_DIR_NAME = "picked-images";
const MAX_DIMENSION = 1440;
const DEFAULT_COMPRESS_QUALITY = 0.7;

function storageDir() {
  const dir = new Directory(Paths.document, STORAGE_DIR_NAME);
  if (!dir.exists) dir.create({ intermediates: true, idempotent: true });
  return dir;
}

// Takes an image picker asset ({ uri, width, height }) and returns a
// { uri, width, height } for a small, permanently-stored copy this app
// owns — resized so its longest edge is at most MAX_DIMENSION (only one
// dimension is ever constrained, so the aspect ratio is preserved exactly
// rather than stretched) and re-encoded as a compressed JPEG. quality lets
// a caller knock compression down further for imagery that doesn't need to
// be sharp (e.g. a hero's background cover art) — defaults to
// DEFAULT_COMPRESS_QUALITY when not given.
export async function storePickedImage(
  { uri, width, height },
  { quality = DEFAULT_COMPRESS_QUALITY } = {},
) {
  const longEdge = Math.max(width ?? 0, height ?? 0);
  const targetLongEdge = longEdge
    ? Math.min(longEdge, MAX_DIMENSION)
    : MAX_DIMENSION;
  const isLandscape = (width ?? 0) >= (height ?? 0);

  const imageRef = await ImageManipulator.manipulate(uri)
    .resize(
      isLandscape ? { width: targetLongEdge } : { height: targetLongEdge },
    )
    .renderAsync();
  const saved = await imageRef.saveAsync({
    compress: quality,
    format: SaveFormat.JPEG,
  });

  const dir = storageDir();
  const destFile = new File(
    dir,
    `${Date.now()}-${Math.round(Math.random() * 1e6)}.jpg`,
  );
  new File(saved.uri).moveSync(destFile, { overwrite: true });

  return { uri: destFile.uri, width: saved.width, height: saved.height };
}
