import { Image as RNImage } from "react-native";

// Module-level cache shared by every component that sizes a card image off
// its aspect ratio (ItemHero, useItemCardSizes). Without this, switching back
// to an image already seen this session re-triggers the default-size ->
// network fetch -> real-size flash/resize every single time, since each
// component only remembers what IT has resolved, not what's already known
// app-wide.
const aspectRatioCache = new Map();

export function getCachedAspectRatio(uri) {
  return aspectRatioCache.get(uri);
}

export function loadAspectRatio(uri, onLoaded) {
  if (!uri) return;
  const cached = aspectRatioCache.get(uri);
  if (cached != null) {
    onLoaded(cached);
    return;
  }
  RNImage.getSize(
    uri,
    (w, h) => {
      const ratio = w / h;
      aspectRatioCache.set(uri, ratio);
      onLoaded(ratio);
    },
    () => {
      // Leave the caller's fallback in place on failure.
    },
  );
}
