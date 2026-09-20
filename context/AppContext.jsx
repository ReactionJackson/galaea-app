import { reprocessLegacyImages } from "@/utils/reprocessLegacyImages";
import { loadPersistedState, savePersistedState } from "@/utils/storage";
import {
  createContext,
  useContext,
  useEffect,
  useMemo,
  useReducer,
  useRef,
  useState,
} from "react";

// ---------------------------------------------------------------------------
// Helpers
// ---------------------------------------------------------------------------

function deepClone(obj) {
  return JSON.parse(JSON.stringify(obj));
}

function buildNewEntry() {
  return {
    dayId: `day-new-${Date.now()}`,
    date: new Date().toISOString(),
    title: null,
    text: "",
    tags: [],
    items: [],
  };
}

function sanitizeGallery(gallery) {
  if (!Array.isArray(gallery)) return [];
  return gallery.filter((image) => !!image?.uri);
}

// Cleans up whatever items came out of persisted storage — no longer backed
// by a default blank day/item fallback, since the app is fine starting from
// genuinely empty state (first launch, or every item deleted).
function sanitizeItems(items) {
  return items.map((item) => ({
    ...item,
    entries: (item.entries ?? []).map((entry) => ({
      ...entry,
      gallery: sanitizeGallery(entry.gallery),
    })),
  }));
}

const DEFAULT_COLLECTION_ID = 1;

// Runs once, at hydrate time. Every install predating collections has items
// with no collectionId at all — rather than the storage layer's usual
// approach of just moving on to a fresh key and leaving old data unread,
// this folds them into one starter collection in place, so real
// already-saved journal content survives the upgrade. A day's own item refs
// (`{ itemId, entryId }`) are untouched — collection membership lives only
// on the item, looked up from there, never duplicated onto every reference
// to it.
function migrateCollections(collections, items) {
  const hasLegacyItems = items.some((item) => item.collectionId == null);
  if (!hasLegacyItems) {
    return { collections: collections ?? [], items };
  }
  return {
    collections: [
      { collectionId: DEFAULT_COLLECTION_ID, name: "Games", color: "default" },
      ...(collections ?? []),
    ],
    items: items.map((item) => ({
      ...item,
      collectionId: item.collectionId ?? DEFAULT_COLLECTION_ID,
    })),
  };
}

// The one process any item-entry mutation must go through to actually reach
// the shared items store. A day's draft.items items carry scratch
// text/tags/gallery fields directly while being edited (see UPDATE_ITEM) —
// fine as transient in-progress state, but it must never be committed that
// way, or the day and the item end up with two diverging copies of the same
// content. This is the single place that split happens: called from
// SAVE_EDIT today, and whatever commits an item-entry mutation in future
// (an edit made directly from the item's own page, a delete, etc.) must
// route through this same function rather than re-implementing it.
//
// Untouched refs pass straight through unchanged. A touched one (isNew, or
// any of text/tags/gallery present) gets written into the matching item's
// entries — a new entry if it is brand new, merged into the existing one
// otherwise, with any field the edit didn't touch falling back to what's
// already stored — and comes back out as a clean { itemId, entryId } ref.
// dayDate is the day this save is happening on — only used to stamp a
// brand-new entry's creation date; an existing entry keeps the date it
// already has.
//
// A touched entry that ends up with no text and no gallery images (tags
// alone don't count) is dropped rather than written: an attached-but-never-
// filled-in item entry, or an existing one edited down to nothing, isn't a
// real entry. A brand-new one is simply never written to the item's
// entries; an existing one that got emptied out this way is removed from
// them entirely, not left behind as a blank record. Either way it's left out
// of cleanItems too, so the day stops referencing it.
function reconcileItemEdits(items, draftItems, dayDate) {
  let nextItems = items;

  const cleanItems = draftItems
    .map((it) => {
      const { itemId, entryId, isNew, text, tags, gallery } = it;
      const wasEdited =
        isNew ||
        text !== undefined ||
        tags !== undefined ||
        gallery !== undefined;
      if (!wasEdited) return { itemId, entryId };

      const itemIndex = nextItems.findIndex((item) => item.itemId === itemId);
      if (itemIndex === -1) return { itemId, entryId };
      const item = nextItems[itemIndex];

      const resolvedEntryId =
        isNew || entryId == null
          ? Math.max(0, ...item.entries.map((e) => e.entryId)) + 1
          : entryId;

      const existingEntry = item.entries.find(
        (e) => e.entryId === resolvedEntryId,
      );
      // date is the entry's original creation date — stamped once, from the
      // day it was first written on, and never touched again on later edits
      // (even if that edit happens to be made from a different day that also
      // references this same entry).
      const nextEntry = {
        entryId: resolvedEntryId,
        date: existingEntry?.date ?? dayDate,
        text: text !== undefined ? text : (existingEntry?.text ?? ""),
        tags: tags !== undefined ? tags : (existingEntry?.tags ?? []),
        gallery:
          gallery !== undefined ? gallery : (existingEntry?.gallery ?? []),
      };

      const hasContent =
        !!nextEntry.text.trim() || nextEntry.gallery.length > 0;
      if (!hasContent) {
        if (existingEntry) {
          nextItems = nextItems.map((it2, i) =>
            i === itemIndex
              ? {
                  ...it2,
                  entries: it2.entries.filter(
                    (e) => e.entryId !== resolvedEntryId,
                  ),
                }
              : it2,
          );
        }
        return null;
      }

      const nextEntries = existingEntry
        ? item.entries.map((e) =>
            e.entryId === resolvedEntryId ? nextEntry : e,
          )
        : [...item.entries, nextEntry];

      nextItems = nextItems.map((it2, i) =>
        i === itemIndex ? { ...it2, entries: nextEntries } : it2,
      );

      return { itemId, entryId: resolvedEntryId };
    })
    .filter(Boolean);

  return { items: nextItems, cleanItems };
}

// Used when an item's own entries are edited to remove content down to
// nothing (see SAVE_ITEM_EDIT) — a day only ever holds a plain
// { itemId, entryId } reference into an entry it doesn't otherwise own, so
// deleting the entry from the item side leaves that reference dangling
// unless something also strips it back out of whichever day it came from.
// Filters (rather than assumes a single match) since day.items may briefly
// carry extra scratch fields mid-edit — this only ever removes matching
// refs, never touches anything else.
function stripRemovedItemEntries(day, itemId, removedEntryIds) {
  if (!day || removedEntryIds.length === 0) return day;
  const hasMatch = day.items.some(
    (ref) => ref.itemId === itemId && removedEntryIds.includes(ref.entryId),
  );
  if (!hasMatch) return day;
  return {
    ...day,
    items: day.items.filter(
      (ref) =>
        !(ref.itemId === itemId && removedEntryIds.includes(ref.entryId)),
    ),
  };
}

// ---------------------------------------------------------------------------
// Reducer
// ---------------------------------------------------------------------------

const initialState = {
  entries: [],
  committed: undefined,
  draft: null,
  editMode: false,
  cancelling: false,
  tags: [],
  // Every collection an item can belong to — see migrateCollections above
  // for how existing installs get their first one.
  collections: [],
  // The single source of truth for every collection item and its entries.
  // Journal days only ever hold { itemId, entryId } references into this —
  // see SAVE_EDIT, which is responsible for keeping that split intact.
  items: [],
  // Collection's own edit cycle — the same draft/committed shape as the
  // journal day above, just scoped to a single item record (including its
  // own entries) instead of a day. editingItemId is null while creating a
  // brand-new item, or the id of whichever existing item itemDraft was
  // cloned from. See ENTER_ITEM_EDIT / SAVE_ITEM_EDIT below.
  itemDraft: null,
  editingItemId: null,
};

function appReducer(state, action) {
  switch (action.type) {
    // Navigate to a different day — always exits edit mode cleanly.
    case "CHANGE_DAY":
      return {
        ...state,
        committed: state.entries.find((e) => e.dayId === action.dayId),
        draft: null,
        editMode: false,
      };

    // Enter edit mode: deep-clone committed into draft so edits are isolated.
    case "ENTER_EDIT":
      if (state.editMode) return state;
      return {
        ...state,
        draft: deepClone(state.committed),
        editMode: true,
        cancelling: false,
      };

    // Phase 1 of cancel: exit edit mode so close animations start playing,
    // but keep draft alive so the content is still rendered during the transition.
    case "BEGIN_CANCEL":
      return {
        ...state,
        editMode: false,
        cancelling: true,
      };

    // Phase 2 of cancel: animations have finished — now clear the draft so
    // activeEntry reverts to committed.
    case "COMPLETE_CANCEL":
      return {
        ...state,
        draft: null,
        cancelling: false,
      };

    // Save: promote draft → committed and persist to the entries list.
    // reconcileItemEdits does the actual split of edited item content out
    // into the items store — see its comment above for why that has to be
    // one shared function rather than inline logic here.
    case "SAVE_EDIT": {
      const saved = state.draft;
      const { items, cleanItems } = reconcileItemEdits(
        state.items,
        saved.items,
        saved.date,
      );
      const cleanedSaved = { ...saved, items: cleanItems };
      const exists = state.entries.some((e) => e.dayId === cleanedSaved.dayId);
      const entries = exists
        ? state.entries.map((e) =>
            e.dayId === cleanedSaved.dayId ? cleanedSaved : e,
          )
        : [...state.entries, cleanedSaved];

      return {
        ...state,
        entries,
        committed: cleanedSaved,
        draft: null,
        editMode: false,
        items,
      };
    }

    // Start a brand-new day entry — goes straight into draft + edit mode.
    // committed is left untouched so cancel reverts cleanly.
    case "ADD_DAY":
      return {
        ...state,
        draft: buildNewEntry(),
        editMode: true,
        cancelling: false,
      };

    // Field-level mutations — all target draft only.
    case "UPDATE_TITLE":
      return { ...state, draft: { ...state.draft, title: action.title } };

    case "UPDATE_TEXT":
      return { ...state, draft: { ...state.draft, text: action.text } };

    case "TOGGLE_TAG": {
      const tags = state.draft.tags.includes(action.tagId)
        ? state.draft.tags.filter((id) => id !== action.tagId)
        : [...state.draft.tags, action.tagId];
      return { ...state, draft: { ...state.draft, tags } };
    }

    case "UPDATE_ITEM":
      return {
        ...state,
        draft: {
          ...state.draft,
          items: state.draft.items.map((it, i) =>
            i === action.index ? { ...it, ...action.changes } : it,
          ),
        },
      };

    case "ADD_ITEM":
      return {
        ...state,
        draft: {
          ...state.draft,
          items: [
            ...state.draft.items,
            { itemId: action.itemId, entryId: null, isNew: true },
          ],
        },
      };

    // Collection's own edit cycle — mirrors ENTER_EDIT/SAVE_EDIT above, just
    // for a single item record instead of a day. A null itemId (or one that
    // isn't found) starts a blank draft, i.e. adding a new item; otherwise
    // itemDraft is a deep clone of that existing item, entries included, so
    // its own entries become editable the same way a journal day's do.
    case "ENTER_ITEM_EDIT": {
      const existing = state.items.find((it) => it.itemId === action.itemId);
      return {
        ...state,
        itemDraft: existing
          ? deepClone(existing)
          : {
              title: "",
              cardImage: null,
              coverImage: null,
              // Hardcoded until there's a collection to actually choose
              // from — see the collections track work.
              collectionId: DEFAULT_COLLECTION_ID,
              entries: [],
            },
        editingItemId: existing ? existing.itemId : null,
      };
    }

    case "CANCEL_ITEM_EDIT":
      return { ...state, itemDraft: null, editingItemId: null };

    case "UPDATE_ITEM_DRAFT":
      return { ...state, itemDraft: { ...state.itemDraft, ...action.changes } };

    case "UPDATE_ITEM_DRAFT_ENTRY":
      return {
        ...state,
        itemDraft: {
          ...state.itemDraft,
          entries: state.itemDraft.entries.map((e) =>
            e.entryId === action.entryId ? { ...e, ...action.changes } : e,
          ),
        },
      };

    // Save: promote itemDraft into the items store. A brand-new item is
    // appended as the new last item (ahead of the add slot, rather than
    // consuming it the way a journal day does); an existing one is replaced
    // in place. itemId is supplied by the caller for a new item (Collection
    // already needs to know it, to land the track on the right item), not
    // generated here.
    case "SAVE_ITEM_EDIT": {
      const isNew = state.editingItemId == null;
      const itemId = isNew ? action.itemId : state.editingItemId;

      // Same validity rule as a journal day's own entries (see
      // reconcileItemEdits above): no text and no gallery images — a tag
      // alone doesn't count — means it isn't a real entry, so it's dropped
      // here rather than saved.
      const keptEntries = [];
      const removedEntryIds = [];
      for (const entry of state.itemDraft.entries) {
        const hasContent =
          !!entry.text?.trim() || (entry.gallery?.length ?? 0) > 0;
        if (hasContent) {
          keptEntries.push(entry);
        } else {
          removedEntryIds.push(entry.entryId);
        }
      }

      const savedItem = { ...state.itemDraft, itemId, entries: keptEntries };
      const items = isNew
        ? [...state.items, savedItem]
        : state.items.map((it) => (it.itemId === itemId ? savedItem : it));

      // A day only holds a { itemId, entryId } reference, not the entry
      // itself — if any dropped entries were already real (i.e. this isn't
      // a brand-new item), whichever day originally held that reference
      // needs it stripped out too, or it's left pointing at nothing.
      const entries = state.entries.map((day) =>
        stripRemovedItemEntries(day, itemId, removedEntryIds),
      );
      const committed = stripRemovedItemEntries(
        state.committed,
        itemId,
        removedEntryIds,
      );
      const draft = stripRemovedItemEntries(
        state.draft,
        itemId,
        removedEntryIds,
      );

      return {
        ...state,
        items,
        entries,
        committed,
        draft,
        itemDraft: null,
        editingItemId: null,
      };
    }

    // Deletes a whole collection item — no confirmation, one shot. Every
    // day that referenced entries belonging to it needs those refs
    // stripped too (see stripRemovedItemEntries above), same as removing
    // individual entries in SAVE_ITEM_EDIT, just for all of this item's
    // entries at once rather than a dropped subset.
    case "DELETE_ITEM": {
      const { itemId } = action;
      const item = state.items.find((it) => it.itemId === itemId);
      const removedEntryIds = item ? item.entries.map((e) => e.entryId) : [];

      // Genuinely empty is fine — the app no longer backfills a default
      // blank item when the last one is deleted.
      const items = state.items.filter((it) => it.itemId !== itemId);

      const entries = state.entries.map((day) =>
        stripRemovedItemEntries(day, itemId, removedEntryIds),
      );
      const committed = stripRemovedItemEntries(
        state.committed,
        itemId,
        removedEntryIds,
      );
      const draft = stripRemovedItemEntries(
        state.draft,
        itemId,
        removedEntryIds,
      );

      return {
        ...state,
        items,
        entries,
        committed,
        draft,
        itemDraft: null,
        editingItemId: null,
      };
    }

    // Swaps an item with its immediate left/right neighbour — used by both
    // the edit panel's arrow buttons and the drag-to-reorder gesture.
    case "SWAP_ADJACENT_ITEM": {
      const { itemId, direction } = action;
      const index = state.items.findIndex((it) => it.itemId === itemId);
      const neighborIndex = index + (direction === "right" ? 1 : -1);
      if (
        index === -1 ||
        neighborIndex < 0 ||
        neighborIndex >= state.items.length
      ) {
        return state;
      }
      const items = [...state.items];
      [items[index], items[neighborIndex]] = [
        items[neighborIndex],
        items[index],
      ];
      return { ...state, items };
    }

    // Tag mutations — these write to state.tags (global), not just the draft.

    // New tag: prepend to global tags list so it appears first in the picker.
    // Does NOT auto-activate on the current draft — user taps it to add it.
    case "ADD_TAG": {
      const newId = Math.max(...state.tags.map((t) => t.tagId), 0) + 1;
      const newTag = {
        tagId: newId,
        name: action.name,
        color: action.color,
        archived: false,
      };
      return {
        ...state,
        tags: [newTag, ...state.tags],
      };
    }

    // Colour-only change: update the tag in-place (retroactive — all entries see it).
    case "UPDATE_TAG_COLOR":
      return {
        ...state,
        tags: state.tags.map((t) =>
          t.tagId === action.tagId ? { ...t, color: action.color } : t,
        ),
      };

    // Name change: archive the old tag, create a fresh one spliced in at the
    // same position so it appears in the same slot in the picker.
    // If the old tagId was active on the current draft, swap it for the new one.
    case "REPLACE_TAG": {
      const newId = Math.max(...state.tags.map((t) => t.tagId), 0) + 1;
      const newTag = {
        tagId: newId,
        name: action.name,
        color: action.color,
        archived: false,
      };
      const oldIndex = state.tags.findIndex((t) => t.tagId === action.tagId);
      // Archive the old tag in-place, then splice the new one in at the same index.
      const newTags = state.tags.map((t) =>
        t.tagId === action.tagId ? { ...t, archived: true } : t,
      );
      newTags.splice(oldIndex, 0, newTag);
      const draftTags = state.draft.tags.includes(action.tagId)
        ? state.draft.tags.map((id) => (id === action.tagId ? newId : id))
        : state.draft.tags;
      return {
        ...state,
        tags: newTags,
        draft: { ...state.draft, tags: draftTags },
      };
    }

    // Loaded from AsyncStorage on launch (see AppProvider below) — swaps in
    // whatever was actually saved last time in place of the bundled seed
    // data, keeping every other field (editMode, drafts, etc.) at its
    // normal fresh-launch default.
    case "HYDRATE": {
      const { entries, items, tags, collections } = action.persisted;
      const safeEntries = entries ?? [];
      const migrated = migrateCollections(collections, items ?? []);
      return {
        ...state,
        entries: safeEntries,
        items: sanitizeItems(migrated.items),
        collections: migrated.collections,
        tags: tags ?? [],
        committed: safeEntries[safeEntries.length - 1],
      };
    }

    // Merges results from the one-time background image-reprocessing pass
    // (see utils/reprocessLegacyImages) onto whatever state.items is right
    // now, not the snapshot that pass started from. Each patch only applies
    // where the live image's uri still matches the one it was reprocessed
    // from, so an edit made while it was still running in the background
    // (replacing that same image, or removing the item/entry entirely)
    // simply leaves the patch a no-op instead of clobbering it.
    case "APPLY_IMAGE_PATCHES": {
      const patchesById = new Map(action.patches.map((p) => [p.itemId, p]));
      const items = state.items.map((item) => {
        const patch = patchesById.get(item.itemId);
        if (!patch) return item;

        const cardImage =
          patch.cardImage && item.cardImage?.uri === patch.cardImage.fromUri
            ? patch.cardImage.value
            : item.cardImage;
        // Guarded against the source cardImage, not against cardThumbnail
        // itself — this only ever backfills a thumbnail that doesn't exist
        // yet, so there's nothing of its own to compare against.
        const cardThumbnail =
          patch.cardThumbnail &&
          item.cardImage?.uri === patch.cardThumbnail.fromUri
            ? patch.cardThumbnail.value
            : item.cardThumbnail;
        const coverImage =
          patch.coverImage && item.coverImage?.uri === patch.coverImage.fromUri
            ? patch.coverImage.value
            : item.coverImage;

        const entries = patch.entryPatches
          ? item.entries.map((entry) => {
              const entryPatch = patch.entryPatches.find(
                (ep) => ep.entryId === entry.entryId,
              );
              if (!entryPatch) return entry;
              const gallery = (entry.gallery ?? []).map((image) => {
                const imagePatch = entryPatch.images.find(
                  (ip) => ip.fromUri === image.uri,
                );
                return imagePatch ? imagePatch.value : image;
              });
              return { ...entry, gallery };
            })
          : item.entries;

        return { ...item, cardImage, cardThumbnail, coverImage, entries };
      });
      return { ...state, items };
    }

    default:
      return state;
  }
}

// ---------------------------------------------------------------------------
// Context
// ---------------------------------------------------------------------------

const AppContext = createContext(null);

export function AppProvider({ children }) {
  const [state, dispatch] = useReducer(appReducer, initialState);
  // Starts false so we never render a frame of the blank default state
  // before checking whether there's real, previously-saved content to show.
  const [ready, setReady] = useState(false);
  const persistTimerRef = useRef(null);
  const hasReprocessedRef = useRef(false);

  useEffect(() => {
    let cancelled = false;
    loadPersistedState().then((persisted) => {
      if (cancelled) return;
      if (persisted) dispatch({ type: "HYDRATE", persisted });
      setReady(true);
    });
    return () => {
      cancelled = true;
    };
  }, []);

  // One-time background pass over whatever items just came out of storage,
  // shrinking any images still left at their original (pre-optimizer) size.
  // Runs once per launch, after hydration — never re-triggered by its own
  // resulting dispatches — and reports progress incrementally so an app
  // close partway through doesn't lose what it already did.
  useEffect(() => {
    if (!ready || hasReprocessedRef.current) return;
    hasReprocessedRef.current = true;
    reprocessLegacyImages(state.items, (patch) => {
      dispatch({ type: "APPLY_IMAGE_PATCHES", patches: [patch] });
    });
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [ready]);

  // Persists the actual content whenever it changes — not on every keystroke
  // of an in-progress edit, since drafts aren't part of what's saved anyway
  // (see loadPersistedState/savePersistedState) — debounced a little so a
  // burst of edits (typing, adding several images) doesn't hit AsyncStorage
  // on every single change.
  useEffect(() => {
    if (!ready) return;
    if (persistTimerRef.current) clearTimeout(persistTimerRef.current);
    persistTimerRef.current = setTimeout(() => {
      persistTimerRef.current = null;
      savePersistedState({
        entries: state.entries,
        items: state.items,
        collections: state.collections,
        tags: state.tags,
      });
    }, 400);
    return () => {
      if (persistTimerRef.current) clearTimeout(persistTimerRef.current);
    };
  }, [ready, state.entries, state.items, state.collections, state.tags]);

  // The entry the UI always reads from — draft while editing, committed otherwise.
  const activeEntry = state.draft ?? state.committed;

  // Re-structure data and memoize to help with loading
  const itemsById = useMemo(() => {
    const map = {};
    for (const item of state.items) {
      const sortedEntries = [...item.entries].sort(
        (a, b) => a.entryId - b.entryId,
      );
      const entriesById = {};
      sortedEntries.forEach((entry, index) => {
        entriesById[entry.entryId] = { ...entry, entryNumber: index + 1 };
      });
      map[item.itemId] = {
        ...item,
        entriesById,
        entryCount: sortedEntries.length,
      };
    }
    return map;
  }, [state.items]);

  const contextValue = useMemo(
    () => ({ state, activeEntry, dispatch, itemsById }),
    [state, activeEntry, dispatch, itemsById],
  );

  // Nothing to show yet — still checking AsyncStorage for real content.
  if (!ready) return null;

  return (
    <AppContext.Provider value={contextValue}>{children}</AppContext.Provider>
  );
}

export function useApp() {
  const ctx = useContext(AppContext);
  if (!ctx) throw new Error("useApp must be used within an AppProvider");
  return ctx;
}
