export const buildIndexById = (list) => {
  const map = {};
  list.forEach((item) => {
    map[item.id] = item;
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
