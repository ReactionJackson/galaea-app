import { Colors } from "@/constants/theme";
import { buildLookups } from "@/utils/lookup";
import { STORAGE_KEY, loadContent, saveContent } from "@/utils/storage";
import { createContext, useContext, useEffect, useMemo, useState } from "react";

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

  const [isReady, setIsReady] = useState(false);

  // Effects:

  useEffect(() => {
    Promise.all([
      loadContent(STORAGE_KEY.CONTENT, setAppState),
      loadContent(STORAGE_KEY.SETTINGS, setSettingsState),
    ]).then(() => setIsReady(true));
  }, []);

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

  const lookups = useMemo(() => buildLookups(appState), [appState]);

  const value = useMemo(
    () => ({
      ...appState,
      ...lookups,
      settings: settingsState,
      updateEntity,
      updateSettings,
      replaceContent,
    }),
    [appState, lookups, settingsState],
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
//   date: "", // ISO string
//   tagsIds: [], // [tag.id]
// };

// const collection = {
//   id: null,
//   title: "",
//   itemsIds: [], // [item.id]
//   order: null,
// };

// const item = {
//   id: null,
//   title: "",
//   images: {
//     cardIds: null, // image.id
//     coverIds: null, // image.id
//     thumbnailIds: null, // image.id
//   },
//   order: null,
// }

// const entry = {
//   id: null,
//   text: "",
//   tagsIds: [], // [tag.id]
//   galleryId: null, // gallery.id
//   parents: {
//     postId: null, // post.id
//     itemId: null, // item.id
//   },
// };

// const gallery = {
//   id: null,
//   slides: [
//     {
//       imageId: null, // image.id
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
