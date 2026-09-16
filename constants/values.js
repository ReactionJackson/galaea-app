// Shared constants reused across more than one file. A constant only
// relevant to a single file stays local to that file instead.

// Card sizing — track cards (ItemCard) and the box-art card in ItemHero
// both key off these.
export const ITEM_HEIGHT = 105;
export const EMPTY_CARD_WIDTH = 70;
export const ITEM_ASPECT_RATIO = 3 / 2;

// Default "card" drop shadow intensity, shared between ItemCard and
// ItemHero via cardShadow() in theme.js.
export const CARD_SHADOW_RADIUS = 3;
export const CARD_SHADOW_OPACITY = 0.15;
