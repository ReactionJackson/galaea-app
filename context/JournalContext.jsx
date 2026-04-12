import { daysData, tagsData } from "@/data/entries";
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
    case "SAVE_EDIT": {
      const saved = state.draft;
      const exists = state.entries.some((e) => e.dayId === saved.dayId);
      const entries = exists
        ? state.entries.map((e) => (e.dayId === saved.dayId ? saved : e))
        : [...state.entries, saved];
      return {
        ...state,
        entries,
        committed: saved,
        draft: null,
        editMode: false,
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
