import { CalendarDays, LayoutGrid, Repeat, Home, X, Menu } from "lucide-react";
import { useState } from "react";
import { PageProvider, usePage, type Page } from "./lib/navigation";
import DashboardPage from "./pages/DashboardPage";
import KanbanPage from "./pages/KanbanPage";
import CalendarPage from "./pages/CalendarPage";
import HabitsPage from "./pages/HabitsPage";

const NAV_ITEMS: { id: Page; label: string; icon: React.ReactNode }[] = [
  { id: "dashboard", label: "Dashboard", icon: <Home className="w-5 h-5" /> },
  { id: "kanban", label: "Tasks", icon: <LayoutGrid className="w-5 h-5" /> },
  { id: "calendar", label: "Time Blocking", icon: <CalendarDays className="w-5 h-5" /> },
  { id: "habits", label: "Habits", icon: <Repeat className="w-5 h-5" /> },
];

function Sidebar({ page, setPage, onClose }: { page: Page; setPage: (p: Page) => void; onClose?: () => void }) {
  return (
    <aside className="w-64 bg-white border-r border-slate-100 flex flex-col h-full">
      <div className="h-16 flex items-center gap-2.5 px-5 border-b border-slate-100">
        <div className="w-9 h-9 rounded-xl bg-brand-600 flex items-center justify-center">
          <CalendarDays className="w-5 h-5 text-white" />
        </div>
        <span className="font-bold text-slate-800 text-lg">Dayflow</span>
      </div>

      <nav className="flex-1 p-3 space-y-1">
        {NAV_ITEMS.map((item) => (
          <button
            key={item.id}
            onClick={() => {
              setPage(item.id);
              onClose?.();
            }}
            className={`w-full flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-medium transition-colors ${
              page === item.id
                ? "bg-brand-50 text-brand-700"
                : "text-slate-500 hover:text-slate-700 hover:bg-slate-50"
            }`}
          >
            {item.icon}
            {item.label}
          </button>
        ))}
      </nav>

      <div className="p-4 border-t border-slate-100">
        <p className="text-xs text-slate-300">Your personal planner</p>
      </div>
    </aside>
  );
}

function Shell() {
  const { page, setPage } = usePage();
  const [mobileOpen, setMobileOpen] = useState(false);

  return (
    <div className="flex h-screen bg-slate-50 overflow-hidden">
      {/* Desktop sidebar */}
      <div className="hidden md:block shrink-0">
        <Sidebar page={page} setPage={setPage} />
      </div>

      {/* Mobile sidebar */}
      {mobileOpen && (
        <div className="md:hidden fixed inset-0 z-20 flex">
          <div className="w-64 h-full">
            <Sidebar page={page} setPage={setPage} onClose={() => setMobileOpen(false)} />
          </div>
          <div
            className="flex-1 bg-black/30"
            onClick={() => setMobileOpen(false)}
          />
        </div>
      )}

      {/* Main content */}
      <div className="flex-1 flex flex-col overflow-hidden">
        {/* Mobile header */}
        <div className="md:hidden h-14 bg-white border-b border-slate-100 flex items-center justify-between px-4 shrink-0">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-lg bg-brand-600 flex items-center justify-center">
              <CalendarDays className="w-4 h-4 text-white" />
            </div>
            <span className="font-bold text-slate-800">Dayflow</span>
          </div>
          <button onClick={() => setMobileOpen(true)} className="p-2 text-slate-500">
            <Menu className="w-5 h-5" />
          </button>
        </div>

        <main className="flex-1 overflow-y-auto">
          {page === "dashboard" && <DashboardPage />}
          {page === "kanban" && <KanbanPage />}
          {page === "calendar" && <CalendarPage />}
          {page === "habits" && <HabitsPage />}
        </main>
      </div>
    </div>
  );
}

export default function App() {
  return (
    <PageProvider>
      <Shell />
    </PageProvider>
  );
}
