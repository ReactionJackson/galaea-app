import { useEffect, useMemo, useState } from "react";
import { Image as RNImage } from "react-native";

// Loads each game's box-art aspect ratio (falling back to a 1:1 square while
// unknown or on failure) and derives a fixed-height, aspect-correct width for
// each — shared by CollectionTrack and the journal's game-picker track so
// both size their box art thumbnails identically.
export function useGameBoxArtSizes(games, itemHeight) {
  const [aspectRatios, setAspectRatios] = useState(() => games.map(() => 1));
  const gameKey = useMemo(() => games.map((g) => g.gameId).join(","), [games]);

  useEffect(() => {
    let cancelled = false;
    games.forEach((game, i) => {
      if (!game.boxArt) return;
      RNImage.getSize(
        game.boxArt,
        (w, h) => {
          if (cancelled) return;
          const ratio = w / h;
          setAspectRatios((prev) => {
            if (prev[i] === ratio) return prev;
            const next = [...prev];
            next[i] = ratio;
            return next;
          });
        },
        () => {
          // Leave the square fallback in place on failure.
        },
      );
    });
    return () => {
      cancelled = true;
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [gameKey]);

  return useMemo(
    () => aspectRatios.map((ratio) => itemHeight * ratio),
    [aspectRatios, itemHeight],
  );
}
