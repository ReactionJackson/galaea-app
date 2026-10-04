import { Colors } from "@/constants/theme";
import {
  buildGroupIndex,
  buildIndexById,
  buildReverseIndex,
} from "@/utils/lookup";
import { STORAGE_KEY, loadContent, saveContent } from "@/utils/storage";
import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useState,
} from "react";

const AppContext = createContext(null);

export function AppProvider({ children }) {
  const [appState, setAppState] = useState({
    posts: [],
    collections: [],
    items: [],
    entries: [],
    galleries: [],
    images: [],
    tags: [],
  });
  const [settingsState, setSettingsState] = useState({
    accentColor: Colors.accents.red,
  });

  // Flags:

  const [isEditing, setIsEditing] = useState(false);
  const [isReady, setIsReady] = useState(false);

  // Effects:

  useEffect(() => {
    Promise.all([
      loadContent(STORAGE_KEY.CONTENT, setAppState),
      loadContent(STORAGE_KEY.SETTINGS, setSettingsState),
    ]).then(() => setIsReady(true));
  }, []);

  // Lookups:

  const indexes = useMemo(
    () => ({
      posts: buildIndexById(appState.posts),
      collections: buildIndexById(appState.collections),
      items: buildIndexById(appState.items),
      entries: buildIndexById(appState.entries),
      galleries: buildIndexById(appState.galleries),
      images: buildIndexById(appState.images),
      tags: buildIndexById(appState.tags),
    }),
    [appState],
  );

  const collectionIdByItemId = useMemo(
    () =>
      buildReverseIndex(appState.collections, (collection) => collection.items),
    [appState.collections],
  );

  const entriesByPostId = useMemo(
    () => buildGroupIndex(appState.entries, (entry) => entry.parents?.post),
    [appState.entries],
  );

  const entriesByItemId = useMemo(() => {
    const groups = buildGroupIndex(
      appState.entries,
      (entry) => entry.parents?.item,
    );
    Object.values(groups).forEach((list) =>
      list.sort(
        (a, b) =>
          new Date(indexes.posts[b.parents.post]?.date) -
          new Date(indexes.posts[a.parents.post]?.date),
      ),
    );
    return groups;
  }, [appState.entries, indexes.posts]);

  const entryNumberById = useMemo(() => {
    const map = {};
    Object.values(entriesByItemId).forEach((list) =>
      list.forEach((entry, i) => {
        map[entry.id] = list.length - i;
      }),
    );
    return map;
  }, [entriesByItemId]);

  const getById = useCallback((list, id) => indexes[list]?.[id], [indexes]);

  const getCollectionByItemId = useCallback(
    (itemId) => getById("collections", collectionIdByItemId[itemId]),
    [getById, collectionIdByItemId],
  );

  // Handlers:

  const updateEntity = (key, id, patch) => {
    setAppState((prev) => {
      const next = {
        ...prev,
        [key]: prev[key].map((e) => (e.id === id ? { ...e, ...patch } : e)),
      };
      saveContent(STORAGE_KEY.CONTENT, next);
      return next;
    });
  };

  const updateSettings = (patch) => {
    setSettingsState((prev) => {
      const next = {
        ...prev,
        ...patch,
      };
      saveContent(STORAGE_KEY.SETTINGS, next);
      return next;
    });
  };

  const replaceContent = (content) => {
    setAppState(content);
  };

  // Context Sendables:

  const value = useMemo(
    () => ({
      ...appState,
      settings: settingsState,
      isEditing,
      getById,
      getCollectionByItemId,
      setIsEditing,
      updateEntity,
      updateSettings,
      replaceContent,
      entriesByPostId,
      entriesByItemId,
      entryNumberById,
    }),
    [
      getById,
      getCollectionByItemId,
      appState,
      settingsState,
      isEditing,
      entriesByPostId,
      entriesByItemId,
      entryNumberById,
    ],
  );

  return (
    <AppContext.Provider value={value}>
      {isReady ? children : null}
    </AppContext.Provider>
  );
}

export function useApp() {
  const ctx = useContext(AppContext);
  if (!ctx) {
    throw new Error("useApp must be used within an AppProvider");
  }
  return ctx;
}

// App Data Shape:

// const post = {
//   id: null,
//   title: "",
//   text: "",
//   date: new Date(),
//   tags: [], // [tag.id]
// };

// const collection = {
//   id: null,
//   title: "",
//   items: [], // [item.id]
//   order: null,
// };

// const item = {
//   id: null,
//   title: "",
//   images: {
//     card: null, // image.id
//     cover: null, // image.id
//     thumbnail: null, // image.id
//   },
//   order: null,
// }

// const entry = {
//   id: null,
//   text: "",
//   tags: [], // [tag.id]
//   gallery: null, // gallery.id
//   parents: {
//     post: null, // post.id
//     item: null, // item.id
//   },
// };

// const gallery = {
//   id: null,
//   slides: [
//     {
//       image: null, // image.id
//       caption: "",
//       order: null,
//     }
//   ],
// }

// const image = {
//   id: null,
//   uri: "",
//   format: "",
//   quality: 1,
//   width: null,
//   height: null,
//   contentPosition: null,
//   aspectRatio: null,
// }

// const tag = {
//   id: null,
//   title: "",
//   color: "",
// }
