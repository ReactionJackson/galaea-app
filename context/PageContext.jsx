import { useApp } from "@/context/AppContext";
import { createContext, useContext, useState } from "react";

export const PageContext = createContext(null);

export function PageProvider({ children }) {
  const {
    indexes,
    collectionIdByItemId,
    entryIdsByPostId,
    entryIdsByItemId,
    entryNumberById,
  } = useApp();
  const [draft, setDraft] = useState({});
  const [isEditing, setIsEditing] = useState(false);

  // Fetching:

  const getById = (key, id) => {
    const stored = indexes[key]?.[id];
    const patch = draft[key]?.[id];
    return stored || patch ? { ...stored, ...patch } : undefined;
  };

  const getAllEntities = (key) =>
    Object.keys({ ...indexes[key], ...draft[key] }).map((id) =>
      getById(key, id),
    );

  // Draft:

  const getNextId = (key) =>
    Math.max(
      0,
      ...Object.keys({ ...indexes[key], ...draft[key] }).map(Number),
    ) + 1;

  const add = (key, data) => {
    const id = getNextId(key);
    setDraft((prev) => ({
      ...prev,
      [key]: { ...prev[key], [id]: { ...data, id } },
    }));
    return id;
  };

  const update = (key, id, data) => {
    if (!getById(key, id)) {
      throw new Error(
        `draft.update: no ${key} with id ${id}. Use draft.add to create a new ${key}.`,
      );
    }
    setDraft((prev) => ({
      ...prev,
      [key]: { ...prev[key], [id]: { ...prev[key]?.[id], ...data } },
    }));
  };

  const remove = (key, id) => {
    setDraft((prev) => {
      const { [id]: removed, ...rest } = prev[key] ?? {};
      return { ...prev, [key]: rest };
    });
  };

  const commit = () => {
    console.log("commitDraft", draft);
  };

  const discard = () => setDraft({});

  const value = {
    isEditing,
    setIsEditing,
    getById,
    getAllEntities,
    draft: { add, update, remove, discard, commit },
    collectionIdByItemId,
    entryIdsByPostId,
    entryIdsByItemId,
    entryNumberById,
  };

  return <PageContext.Provider value={value}>{children}</PageContext.Provider>;
}

export function usePage() {
  const ctx = useContext(PageContext);
  if (!ctx) {
    throw new Error("usePage must be used within a PageProvider");
  }
  return ctx;
}
