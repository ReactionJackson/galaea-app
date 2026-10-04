import { useApp } from "@/context/AppContext";
import {
  buildGroupIndex,
  buildIndexById,
  buildReverseIndex,
} from "@/utils/lookup";
import { createContext, useContext, useMemo, useState } from "react";

export const PageContext = createContext(null);

export function PageProvider({ children }) {
  const { posts, collections, items, entries, galleries, images, tags } =
    useApp();
  const [draft, setDraft] = useState({});

  // Lookups:

  const indexes = useMemo(
    () => ({
      posts: buildIndexById(posts),
      collections: buildIndexById(collections),
      items: buildIndexById(items),
      entries: buildIndexById(entries),
      galleries: buildIndexById(galleries),
      images: buildIndexById(images),
      tags: buildIndexById(tags),
    }),
    [posts, collections, items, entries, galleries, images, tags],
  );

  const collectionIdByItemId = useMemo(
    () => buildReverseIndex(collections, (collection) => collection.items),
    [collections],
  );

  const entriesByPostId = useMemo(
    () => buildGroupIndex(entries, (entry) => entry.parents?.post),
    [entries],
  );

  const entriesByItemId = useMemo(() => {
    const groups = buildGroupIndex(entries, (entry) => entry.parents?.item);
    Object.values(groups).forEach((list) =>
      list.sort(
        (a, b) =>
          new Date(indexes.posts[b.parents.post]?.date) -
          new Date(indexes.posts[a.parents.post]?.date),
      ),
    );
    return groups;
  }, [entries, indexes.posts]);

  const entryNumberById = useMemo(() => {
    const map = {};
    Object.values(entriesByItemId).forEach((list) =>
      list.forEach((entry, i) => {
        map[entry.id] = list.length - i;
      }),
    );
    return map;
  }, [entriesByItemId]);

  // Fetching:

  const getById = (key, id) => {
    const stored = indexes[key]?.[id];
    const patch = draft[key]?.[id];
    return stored || patch ? { ...stored, ...patch } : undefined;
  };

  const getCollectionByItemId = (itemId) =>
    getById("collections", collectionIdByItemId[itemId]);

  // Draft:

  const updateDraft = (key, id, patch) => {
    setDraft((prev) => ({
      ...prev,
      [key]: { ...prev[key], [id]: { ...prev[key]?.[id], ...patch } },
    }));
  };

  const discardDraft = () => setDraft({});

  const commitDraft = () => {
    console.log("commitDraft", draft);
  };

  const value = {
    getById,
    getCollectionByItemId,
    entriesByPostId,
    entriesByItemId,
    entryNumberById,
    draft,
    updateDraft,
    discardDraft,
    commitDraft,
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
