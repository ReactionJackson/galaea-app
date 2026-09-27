import { Colors } from "@/constants/theme";
import { buildIndexById, buildReverseIndex } from "@/utils/lookup";
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

  const getById = useCallback((list, id) => indexes[list]?.[id], [indexes]);

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
      setIsEditing,
      updateEntity,
      updateSettings,
      replaceContent,
      collectionIdByItemId,
    }),
    [getById, appState, settingsState, isEditing, collectionIdByItemId],
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
//   draft: {},
// };

// const collection = {
//   id: null,
//   title: "",
//   items: [], // [item.id]
//   order: null,
//   draft: {},
// };

// const item = {
//   id: null,
//   title: "",
//   images: {
//     card: null, // image.id
//     cover: null, // image.id
//     thumbnail: null, // image.id
//   },
//   entries: [], // [entry.id]
//   order: null,
//   draft: {},
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
//   draft: {},
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
//   draft: {},
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
//   draft: {},
// }

// const tag = {
//   id: null,
//   title: "",
//   color: "",
//   draft: {},
// }
