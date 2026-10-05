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
    () => buildReverseIndex(collections, (collection) => collection.itemIds),
    [collections],
  );

  const entryIdsByPostId = useMemo(
    () =>
      buildGroupIndex(
        entries,
        (entry) => entry.parents?.postId,
        (entry) => entry.id,
      ),
    [entries],
  );

  const entryIdsByItemId = useMemo(() => {
    const newestFirst = [...entries].sort(
      (a, b) =>
        new Date(indexes.posts[b.parents?.postId]?.date) -
        new Date(indexes.posts[a.parents?.postId]?.date),
    );
    return buildGroupIndex(
      newestFirst,
      (entry) => entry.parents?.itemId,
      (entry) => entry.id,
    );
  }, [entries, indexes.posts]);

  const entryNumberById = useMemo(() => {
    const map = {};
    Object.values(entryIdsByItemId).forEach((ids) =>
      ids.forEach((id, i) => {
        map[id] = ids.length - i;
      }),
    );
    return map;
  }, [entryIdsByItemId]);

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
