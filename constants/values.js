// Shared constants reused across more than one file. A constant only
// relevant to a single file stays local to that file instead.

// Card sizing — track cards (ItemCard) and the box-art card in ItemHero
// both key off these.
export const ITEM_HEIGHT = 105;
export const EMPTY_CARD_WIDTH = 70;
export const ITEM_ASPECT_RATIO = 3 / 2;

// The hero's height when nested inside a journal entry/collection card.
export const HERO_HEIGHT = 135;

// The hero's height on the collection item's own page — where cover art is
// actually picked and cropped, so this (not HERO_HEIGHT) is what the crop
// picker targets (see collection.jsx). COLLECTION_HERO_SPACING is the same
// hero's own top/bottom spacing (see its `spacing` prop there) — together
// they give the box-art card's true max on-screen height, which is what the
// card image preset resizes to (see IMAGE_PRESETS in utils/images.js).
export const COLLECTION_HERO_HEIGHT = 250;
export const COLLECTION_HERO_SPACING = 30;

// Default "card" drop shadow intensity, shared between ItemCard and
// ItemHero via cardShadow() in theme.js.
export const CARD_SHADOW_RADIUS = 3;
export const CARD_SHADOW_OPACITY = 0.15;

// How long a freshly-mounted page (FadeInOnMount) or a hero's own cover
// image (ItemHero) takes to fade in on arrival.
export const PAGE_INTRO_FADE = 450;

// The lightbox's own side padding (see Lightbox.jsx's Backdrop) — shared out
// so anything sizing an image for how it'll actually look inside the
// lightbox (see IMAGE_PRESETS in utils/images.js) can't drift out of sync
// with the lightbox's real padding.
export const LIGHTBOX_PADDING = 20;
