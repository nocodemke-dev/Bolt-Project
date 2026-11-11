import { useState } from "react";
import { CalendarDays, BarChart3 } from "lucide-react";
import TodayPage from "./pages/TodayPage";
import StatsPage from "./pages/StatsPage";

type Page = "today" | "stats";

export default function App() {
  const [page, setPage] = useState<Page>("today");

  return (
    <div className="min-h-screen bg-slate-50">
      <header className="sticky top-0 z-10 bg-white/80 backdrop-blur-md border-b border-slate-100">
        <div className="max-w-5xl mx-auto px-4 sm:px-6 h-16 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-lg bg-brand-600 flex items-center justify-center">
              <CalendarDays className="w-5 h-5 text-white" />
            </div>
            <span className="font-bold text-slate-800">Flow</span>
          </div>
          <nav className="flex items-center gap-1">
            <NavButton
              active={page === "today"}
              onClick={() => setPage("today")}
              icon={<CalendarDays className="w-4 h-4" />}
              label="Today"
            />
            <NavButton
              active={page === "stats"}
              onClick={() => setPage("stats")}
              icon={<BarChart3 className="w-4 h-4" />}
              label="Progress"
            />
          </nav>
        </div>
      </header>

      <main>{page === "today" ? <TodayPage /> : <StatsPage />}</main>
    </div>
  );
}

function NavButton({
  active,
  onClick,
  icon,
  label,
}: {
  active: boolean;
  onClick: () => void;
  icon: React.ReactNode;
  label: string;
}) {
  return (
    <button
      onClick={onClick}
      className={`flex items-center gap-2 px-3 sm:px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
        active
          ? "bg-brand-50 text-brand-700"
          : "text-slate-500 hover:text-slate-700 hover:bg-slate-50"
      }`}
    >
      {icon}
      {label}
    </button>
  );
}
