import { Directory, File, Paths } from "expo-file-system";
import { ImageManipulator, SaveFormat } from "expo-image-manipulator";
import { useEffect, useState } from "react";
import { PixelRatio } from "react-native";

// Module-level cache of resized derivatives, shared across every component
// that needs a smaller version of a source image for its own display
// context — the same cover photo (picked at full camera resolution) can
// drive a small track thumbnail and a larger hero card, each resized and
// cached separately rather than every one of them decoding the same
// multi-thousand-pixel original. Mirrors the aspectRatioCache pattern in
// useImageAspectRatio.js. inFlight dedupes concurrent requests for the same
// source+size — e.g. the same item's cardImage showing up in several track
// cells at once.
const resizedCache = new Map();
const inFlight = new Map();
const CACHE_DIR_NAME = "resized-images";

// Cheap, stable hash so the same source+size always resolves to the same
// cache filename across app restarts, without keeping a separate index.
function hashKey(key) {
  let hash = 0;
  for (let i = 0; i < key.length; i++) {
    hash = (hash * 31 + key.charCodeAt(i)) | 0;
  }
  return Math.abs(hash).toString(36);
}

function cacheKey(uri, width, height) {
  return `${uri}::${width}x${height}`;
}

export function getCachedResizedUri(uri, width, height) {
  return resizedCache.get(cacheKey(uri, width, height));
}

async function resizeAndCache(uri, width, height, key) {
  const dir = new Directory(Paths.cache, CACHE_DIR_NAME);
  if (!dir.exists) dir.create({ intermediates: true, idempotent: true });

  const destFile = new File(dir, `${hashKey(key)}.jpg`);
  if (destFile.exists) {
    resizedCache.set(key, destFile.uri);
    return destFile.uri;
  }

  const imageRef = await ImageManipulator.manipulate(uri)
    .resize({ width, height })
    .renderAsync();
  const saved = await imageRef.saveAsync({
    compress: 0.8,
    format: SaveFormat.JPEG,
  });
  new File(saved.uri).moveSync(destFile, { overwrite: true });

  resizedCache.set(key, destFile.uri);
  return destFile.uri;
}

// Resizes (and re-compresses) uri down to width x height device pixels and
// caches the result to disk, keyed on the source uri and target size, so
// the same source+size is a cache hit rather than a re-resize — even
// across app restarts. Calls onLoaded with the resized uri once ready;
// leaves the caller's own fallback in place on failure.
export function loadResizedUri(uri, width, height, onLoaded) {
  if (!uri || !width || !height) return;
  const key = cacheKey(uri, width, height);

  const cached = resizedCache.get(key);
  if (cached) {
    onLoaded(cached);
    return;
  }

  const promise =
    inFlight.get(key) ??
    resizeAndCache(uri, width, height, key).finally(() => {
      inFlight.delete(key);
    });
  inFlight.set(key, promise);

  promise.then(onLoaded).catch(() => {
    // Leave the caller's fallback (the un-resized source) in place on failure.
  });
}

// Returns a display-ready uri sized for width x height (layout points —
// scaled up to device pixels internally, so callers just pass the size
// they're actually rendering at), derived from the original source image.
// Falls back to the source uri until the resized derivative is ready, so
// there's never a gap with no image while resizing runs in the background.
export function useResizedImage(uri, width, height) {
  const targetWidth = width
    ? Math.round(PixelRatio.getPixelSizeForLayoutSize(width))
    : 0;
  const targetHeight = height
    ? Math.round(PixelRatio.getPixelSizeForLayoutSize(height))
    : 0;

  const [resizedUri, setResizedUri] = useState(
    () => (uri && getCachedResizedUri(uri, targetWidth, targetHeight)) || uri,
  );

  useEffect(() => {
    if (!uri || !targetWidth || !targetHeight) {
      setResizedUri(uri ?? null);
      return;
    }
    // If this exact source+size has already been resized this session, use
    // it straight away instead of flashing the full-size original first.
    const cached = getCachedResizedUri(uri, targetWidth, targetHeight);
    setResizedUri(cached ?? uri);
    let cancelled = false;
    loadResizedUri(uri, targetWidth, targetHeight, (result) => {
      if (!cancelled) setResizedUri(result);
    });
    return () => {
      cancelled = true;
    };
  }, [uri, targetWidth, targetHeight]);

  return resizedUri;
}
