import { createContext, useContext } from "react";

// Whatever a RowManager currently owns for its row - progress, activeDriver
// and their setters (see RowManager's own comments) - shared with that
// row's paired Navigator, which is rendered alongside it rather than
// inside it, without threading each value through as a separate prop.

export const RowManagerContext = createContext(null);

export function useRowManager() {
  return useContext(RowManagerContext);
}
