import { createContext, useContext, useMemo, useState } from "react";

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

  const value = useMemo(
    () => ({
      posts,
      setPosts,
      collections,
      setCollections,
      items,
      setItems,
      entries,
      setEntries,
      galleries,
      setGalleries,
      images,
      setImages,
      tags,
      setTags,
      isEditing,
      setIsEditing,
    }),
    [posts, collections, items, entries, galleries, images, tags, isEditing],
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
//   isDraft: true,
// };

// const collection = {
//   id: null,
//   title: "",
//   items: [], // [item.id]
//   order: null,
//   isDraft: true,
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
//   isDraft: true,
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
//   isDraft: true,
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
//   isDraft: true,
// }

// const image = {
//   id: null,
//   url: "",
//   format: "",
//   quality: 1,
//   width: null,
//   height: null,
//   aspectRatio: null,
//   isDraft: true,
// }

// const tag = {
//   id: null,
//   title: "",
//   color: "",
//   isDraft: true,
// }
