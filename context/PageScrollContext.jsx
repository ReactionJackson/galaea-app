import { createContext } from "react";

export const PageScrollContext = createContext({ scrollToElement: () => {} });

export const PageScrollProvider = ({ scrollToElement, children }) => (
  <PageScrollContext.Provider value={{ scrollToElement }}>
    {children}
  </PageScrollContext.Provider>
);
