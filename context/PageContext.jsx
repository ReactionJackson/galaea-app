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

  const getAllEntities = (key) =>
    Object.keys({ ...indexes[key], ...draft[key] }).map((id) =>
      getById(key, id),
    );

  const getCollectionByItemId = (itemId) =>
    getById("collections", collectionIdByItemId[itemId]);

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
    getById,
    getAllEntities,
    getCollectionByItemId,
    draft: { add, update, remove, discard, commit },
    entriesByPostId,
    entriesByItemId,
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
