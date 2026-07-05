import { createContext, useContext, useState } from "react";

interface PageContextValue {
  propertyName: string | null;
  setPropertyName: (name: string | null) => void;
}

const PageContext = createContext<PageContextValue>({
  propertyName: null,
  setPropertyName: () => {},
});

export function PageContextProvider({ children }: { children: React.ReactNode }) {
  const [propertyName, setPropertyName] = useState<string | null>(null);
  return (
    <PageContext.Provider value={{ propertyName, setPropertyName }}>
      {children}
    </PageContext.Provider>
  );
}

export function usePageContext() {
  return useContext(PageContext);
}
