import { Colors } from "@/constants/theme";
import { STORAGE_KEY, loadContent, saveContent } from "@/utils/storage";
import {
  createContext,
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
      setIsEditing,
      updateEntity,
      updateSettings,
      replaceContent,
    }),
    [appState, settingsState, isEditing],
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
