import { daysData, itemsData, tagsData } from "@/data/entries";
import { loadPersistedState, savePersistedState } from "@/utils/storage";
import {
  createContext,
  useContext,
  useEffect,
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

// A blank day/item to fall back on whenever entries or items would
// otherwise be empty — first-ever launch (no bundled seed data left in
// data/entries.js), or a persisted store that's been emptied out. Without
// this, an empty entries array has no "last" day for committed to point at,
// and an empty items array leaves the collection track with nothing to
// show. dayId/itemId of 1 is safe here precisely because it's only ever
// used when there's nothing else already occupying that id.
function buildDefaultDay() {
  return {
    dayId: 1,
    date: new Date().toISOString(),
    title: "",
    text: "",
    tags: [],
    items: [],
  };
}

function buildDefaultItem() {
  return {
    itemId: 1,
    title: "",
    coverImage: null,
    cardImage: null,
    entries: [],
  };
}

function sanitizeGallery(gallery) {
  if (!Array.isArray(gallery)) return [];
  return gallery.filter((image) =>
    typeof image === "string" ? !!image : !!image?.uri,
  );
}

function ensureSeedData(entries, items) {
  const safeItems = (items.length ? items : [buildDefaultItem()]).map(
    (item) => ({
      ...item,
      entries: (item.entries ?? []).map((entry) => ({
        ...entry,
        gallery: sanitizeGallery(entry.gallery),
      })),
    }),
  );
  return {
    entries: entries.length ? entries : [buildDefaultDay()],
    items: safeItems,
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

const seeded = ensureSeedData([...daysData], deepClone(itemsData));

const initialState = {
  entries: seeded.entries,
  committed: seeded.entries[seeded.entries.length - 1],
  draft: null,
  editMode: false,
  cancelling: false,
  tags: tagsData.map((t) => ({ ...t, archived: false })),
  // The single source of truth for every collection item and its entries.
  // Journal days only ever hold { itemId, entryId } references into this —
  // see SAVE_EDIT, which is responsible for keeping that split intact.
  items: seeded.items,
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
          : { title: "", cardImage: null, coverImage: null, entries: [] },
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

      const remainingItems = state.items.filter((it) => it.itemId !== itemId);
      // Same safety net as initialState/HYDRATE (see ensureSeedData) —
      // deleting the last remaining item would otherwise leave items
      // empty, which nothing downstream is built to render.
      const items = remainingItems.length
        ? remainingItems
        : [buildDefaultItem()];

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
      const { entries, items, tags } = action.persisted;
      const seeded = ensureSeedData(entries ?? [], items ?? []);
      return {
        ...state,
        entries: seeded.entries,
        items: seeded.items,
        tags,
        committed: seeded.entries[seeded.entries.length - 1],
      };
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
  // Starts false so we never render a frame of the bundled seed data before
  // checking whether there's real, previously-saved content to show instead.
  const [ready, setReady] = useState(false);
  const persistTimerRef = useRef(null);

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
        tags: state.tags,
      });
    }, 400);
    return () => {
      if (persistTimerRef.current) clearTimeout(persistTimerRef.current);
    };
  }, [ready, state.entries, state.items, state.tags]);

  // The entry the UI always reads from — draft while editing, committed otherwise.
  const activeEntry = state.draft ?? state.committed;

  // Nothing to show yet — still checking AsyncStorage for real content.
  if (!ready) return null;

  return (
    <AppContext.Provider value={{ state, activeEntry, dispatch }}>
      {children}
    </AppContext.Provider>
  );
}

export function useApp() {
  const ctx = useContext(AppContext);
  if (!ctx) throw new Error("useApp must be used within an AppProvider");
  return ctx;
}
