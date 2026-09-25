import { loadContent } from "@/utils/storage";
import { createContext, useContext, useEffect, useMemo, useState } from "react";

const ExplorationContext = createContext(null);

export function ExplorationProvider({ children }) {
  const [posts, setPosts] = useState([]);
  const [collections, setCollections] = useState([]);
  const [items, setItems] = useState([]);
  const [entries, setEntries] = useState([]);
  const [galleries, setGalleries] = useState([]);
  const [images, setImages] = useState([]);
  const [tags, setTags] = useState([]);
  const [isEditing, setIsEditing] = useState(false);
  const [isContentLoaded, setIsContentLoaded] = useState(false);

  useEffect(() => {
    let cancelled = false;
    loadContent().then((content) => {
      if (cancelled) return;
      if (content) {
        setPosts(content.posts ?? []);
        setCollections(content.collections ?? []);
        setItems(content.items ?? []);
        setEntries(content.entries ?? []);
        setGalleries(content.galleries ?? []);
        setImages(content.images ?? []);
        setTags(content.tags ?? []);
        setIsEditing(content.isEditing ?? false);
      }
      setIsContentLoaded(true);
    });
    return () => {
      cancelled = true;
    };
  }, []);

  const value = useMemo(
    () => ({
      posts,
      collections,
      items,
      entries,
      galleries,
      images,
      tags,
      isEditing,
      isContentLoaded,
      setPosts,
      setCollections,
      setItems,
      setEntries,
      setGalleries,
      setImages,
      setTags,
      setIsEditing,
    }),
    [
      posts,
      collections,
      items,
      entries,
      galleries,
      images,
      tags,
      isEditing,
      isContentLoaded,
    ],
  );

  return (
    <ExplorationContext.Provider value={value}>
      {children}
    </ExplorationContext.Provider>
  );
}

export function useApp() {
  const ctx = useContext(ExplorationContext);
  if (!ctx) {
    throw new Error("useApp must be used within an ExplorationProvider");
  }
  return ctx;
}

// App Data Shape:

// const appContext = {
//   posts: [], // [post]
//   collections: [], // [collection]
//   items: [], // [item]
//   entries: [], // [entry]
//   galleries: [], // [gallery]
//   images: [], // [image]
//   tags: [], // [tag]
//   isEditing: false,
// };

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
//   url: "",
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
