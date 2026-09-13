import { daysData, gamesData, tagsData } from "@/data/entries";
import { createContext, useContext, useReducer } from "react";

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
    games: [],
  };
}

// The one process any game-entry mutation must go through to actually reach
// the shared games store. A day's draft.games items carry scratch
// text/tags/gallery fields directly while being edited (see UPDATE_GAME) —
// fine as transient in-progress state, but it must never be committed that
// way, or the day and the game end up with two diverging copies of the same
// content. This is the single place that split happens: called from
// SAVE_EDIT today, and whatever commits a game-entry mutation in future
// (an edit made directly from the game's own page, a delete, etc.) must
// route through this same function rather than re-implementing it.
//
// Untouched refs pass straight through unchanged. A touched one (isNew, or
// any of text/tags/gallery present) gets written into the matching game's
// entries — a new entry if it's brand new, merged into the existing one
// otherwise, with any field the edit didn't touch falling back to what's
// already stored — and comes back out as a clean { gameId, entryId } ref.
function reconcileGameEdits(games, draftGames) {
  let nextGames = games;

  const cleanGames = draftGames.map((g) => {
    const { gameId, entryId, isNew, text, tags, gallery } = g;
    const wasEdited =
      isNew || text !== undefined || tags !== undefined || gallery !== undefined;
    if (!wasEdited) return { gameId, entryId };

    const gameIndex = nextGames.findIndex((game) => game.gameId === gameId);
    if (gameIndex === -1) return { gameId, entryId };
    const game = nextGames[gameIndex];

    const resolvedEntryId =
      isNew || entryId == null
        ? Math.max(0, ...game.entries.map((e) => e.entryId)) + 1
        : entryId;

    const existingEntry = game.entries.find((e) => e.entryId === resolvedEntryId);
    const nextEntry = {
      entryId: resolvedEntryId,
      text: text !== undefined ? text : (existingEntry?.text ?? ""),
      tags: tags !== undefined ? tags : (existingEntry?.tags ?? []),
      gallery: gallery !== undefined ? gallery : (existingEntry?.gallery ?? []),
    };
    const nextEntries = existingEntry
      ? game.entries.map((e) => (e.entryId === resolvedEntryId ? nextEntry : e))
      : [...game.entries, nextEntry];

    nextGames = nextGames.map((gm, i) =>
      i === gameIndex ? { ...gm, entries: nextEntries } : gm,
    );

    return { gameId, entryId: resolvedEntryId };
  });

  return { games: nextGames, cleanGames };
}

// ---------------------------------------------------------------------------
// Reducer
// ---------------------------------------------------------------------------

const initialState = {
  entries: [...daysData],
  committed: daysData[daysData.length - 1],
  draft: null,
  editMode: false,
  cancelling: false,
  tags: tagsData.map((t) => ({ ...t, archived: false })),
  // The single source of truth for every game and its entries. Journal days
  // only ever hold { gameId, entryId } references into this — see SAVE_EDIT,
  // which is responsible for keeping that split intact.
  games: deepClone(gamesData),
};

function journalReducer(state, action) {
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
    // reconcileGameEdits does the actual split of edited game content out
    // into the games store — see its comment above for why that has to be
    // one shared function rather than inline logic here.
    case "SAVE_EDIT": {
      const saved = state.draft;
      const { games, cleanGames } = reconcileGameEdits(state.games, saved.games);
      const cleanedSaved = { ...saved, games: cleanGames };
      const exists = state.entries.some((e) => e.dayId === cleanedSaved.dayId);
      const entries = exists
        ? state.entries.map((e) => (e.dayId === cleanedSaved.dayId ? cleanedSaved : e))
        : [...state.entries, cleanedSaved];

      return {
        ...state,
        entries,
        committed: cleanedSaved,
        draft: null,
        editMode: false,
        games,
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

    case "UPDATE_GAME":
      return {
        ...state,
        draft: {
          ...state.draft,
          games: state.draft.games.map((g, i) =>
            i === action.index ? { ...g, ...action.changes } : g,
          ),
        },
      };

    case "ADD_GAME":
      return {
        ...state,
        draft: {
          ...state.draft,
          games: [
            ...state.draft.games,
            { gameId: 1, entryId: null, isNew: true },
          ],
        },
      };

    // Tag mutations — these write to state.tags (global), not just the draft.

    // New tag: prepend to global tags list so it appears first in the picker.
    // Does NOT auto-activate on the current draft — user taps it to add it.
    case "ADD_TAG": {
      const newId = Math.max(...state.tags.map((t) => t.tagId), 0) + 1;
      const newTag = { tagId: newId, name: action.name, color: action.color, archived: false };
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
          t.tagId === action.tagId ? { ...t, color: action.color } : t
        ),
      };

    // Name change: archive the old tag, create a fresh one spliced in at the
    // same position so it appears in the same slot in the picker.
    // If the old tagId was active on the current draft, swap it for the new one.
    case "REPLACE_TAG": {
      const newId = Math.max(...state.tags.map((t) => t.tagId), 0) + 1;
      const newTag = { tagId: newId, name: action.name, color: action.color, archived: false };
      const oldIndex = state.tags.findIndex((t) => t.tagId === action.tagId);
      // Archive the old tag in-place, then splice the new one in at the same index.
      const newTags = state.tags.map((t) =>
        t.tagId === action.tagId ? { ...t, archived: true } : t
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

    default:
      return state;
  }
}

// ---------------------------------------------------------------------------
// Context
// ---------------------------------------------------------------------------

const JournalContext = createContext(null);

export function JournalProvider({ children }) {
  const [state, dispatch] = useReducer(journalReducer, initialState);

  // The entry the UI always reads from — draft while editing, committed otherwise.
  const activeEntry = state.draft ?? state.committed;

  return (
    <JournalContext.Provider value={{ state, activeEntry, dispatch }}>
      {children}
    </JournalContext.Provider>
  );
}

export function useJournal() {
  const ctx = useContext(JournalContext);
  if (!ctx) throw new Error("useJournal must be used within a JournalProvider");
  return ctx;
}
