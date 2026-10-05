const buildIndexById = (list) => {
  const map = {};
  list.forEach((item) => {
    map[item.id] = item;
  });
  return map;
};

const buildGroupIndex = (list, getKey, getValue = (item) => item) => {
  const map = {};
  list.forEach((item) => {
    const key = getKey(item);
    if (key == null) return;
    (map[key] ??= []).push(getValue(item));
  });
  return map;
};

const buildReverseIndex = (parents, getChildIds) => {
  const map = {};
  parents.forEach((parent) => {
    getChildIds(parent).forEach((childId) => {
      map[childId] = parent.id;
    });
  });
  return map;
};

export const buildLookups = ({
  posts,
  collections,
  items,
  entries,
  galleries,
  images,
  tags,
}) => {
  const indexes = {
    posts: buildIndexById(posts),
    collections: buildIndexById(collections),
    items: buildIndexById(items),
    entries: buildIndexById(entries),
    galleries: buildIndexById(galleries),
    images: buildIndexById(images),
    tags: buildIndexById(tags),
  };

  const collectionIdByItemId = buildReverseIndex(
    collections,
    (collection) => collection.itemIds,
  );

  const entryIdsByPostId = buildGroupIndex(
    entries,
    (entry) => entry.parents?.postId,
    (entry) => entry.id,
  );

  const newestFirst = [...entries].sort(
    (a, b) =>
      new Date(indexes.posts[b.parents?.postId]?.date) -
      new Date(indexes.posts[a.parents?.postId]?.date),
  );

  const entryIdsByItemId = buildGroupIndex(
    newestFirst,
    (entry) => entry.parents?.itemId,
    (entry) => entry.id,
  );

  const entryNumberById = {};
  Object.values(entryIdsByItemId).forEach((ids) =>
    ids.forEach((id, i) => {
      entryNumberById[id] = ids.length - i;
    }),
  );

  return {
    indexes,
    collectionIdByItemId,
    entryIdsByPostId,
    entryIdsByItemId,
    entryNumberById,
  };
};
