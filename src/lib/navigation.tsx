import { createContext, useContext, useState, type ReactNode } from "react";

type Page = "dashboard" | "kanban" | "calendar" | "habits";

interface PageContextValue {
  page: Page;
  setPage: (page: Page) => void;
}

const PageContext = createContext<PageContextValue | null>(null);

export function PageProvider({ children }: { children: ReactNode }) {
  const [page, setPage] = useState<Page>("dashboard");
  return (
    <PageContext.Provider value={{ page, setPage }}>
      {children}
    </PageContext.Provider>
  );
}

export function usePage() {
  const ctx = useContext(PageContext);
  if (!ctx) throw new Error("usePage must be used within PageProvider");
  return ctx;
}

export type { Page };
