export const buildIndexById = (list) => {
  const map = {};
  list.forEach((item) => {
    map[item.id] = item;
  });
  return map;
};

export const buildGroupIndex = (list, getKey) => {
  const map = {};
  list.forEach((item) => {
    const key = getKey(item);
    if (key == null) return;
    (map[key] ??= []).push(item);
  });
  return map;
};

export const buildReverseIndex = (parents, getChildIds) => {
  const map = {};
  parents.forEach((parent) => {
    getChildIds(parent).forEach((childId) => {
      map[childId] = parent.id;
    });
  });
  return map;
};
