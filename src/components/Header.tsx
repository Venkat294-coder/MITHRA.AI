import React from "react";
import { BookOpen, Sparkles, Code2, RefreshCw, FileCheck2, Menu } from "lucide-react";

interface HeaderProps {
  onOpenCodeModal?: () => void;
  onResetQuiz?: () => void;
  hasActiveQuiz?: boolean;
  activeFileName?: string;
  onOpenSidebar?: () => void;
}

export const Header: React.FC<HeaderProps> = ({
  onOpenCodeModal,
  onResetQuiz,
  hasActiveQuiz,
  activeFileName,
  onOpenSidebar,
}) => {
  return (
    <header
      id="mithra-header"
      className="h-20 bg-white border-b border-slate-200 flex items-center justify-between px-6 md:px-8 shadow-sm shrink-0 w-full"
    >
      <div className="flex items-center gap-3">
        {onOpenSidebar && (
          <button
            onClick={onOpenSidebar}
            className="lg:hidden p-2 rounded-lg hover:bg-slate-100 text-slate-700 transition-colors cursor-pointer"
            title="Open navigation"
          >
            <Menu className="w-5 h-5" />
          </button>
        )}
        <div>
          <div className="flex items-center gap-2">
            <h1 className="text-lg md:text-xl font-bold text-slate-800 tracking-tight">
              AI Learning Assistant
            </h1>
            <span className="hidden sm:inline-flex px-2 py-0.5 rounded-full bg-violet-50 text-violet-700 border border-violet-200 text-[10px] font-bold tracking-wide">
              MITHRA.AI
            </span>
          </div>
          <p className="text-xs text-slate-500 font-medium">
            Smart Quiz Generator & Competency Analyzer for Official Statistical System
          </p>
        </div>
      </div>

      {/* Action Controls matching Design theme */}
      <div className="flex items-center gap-2.5">
        {hasActiveQuiz ? (
          <div className="hidden sm:flex items-center gap-1.5 px-3.5 py-2 bg-slate-100 rounded-lg text-xs font-semibold text-slate-600 border border-slate-200">
            <FileCheck2 className="w-3.5 h-3.5 text-emerald-600" />
            <span className="tracking-wide uppercase text-[11px]">PDF Extracted</span>
          </div>
        ) : null}

        {onOpenCodeModal && (
          <button
            id="header-btn-view-streamlit"
            onClick={onOpenCodeModal}
            className="hidden md:inline-flex items-center gap-1.5 px-3.5 py-2 bg-slate-100 hover:bg-slate-200 rounded-lg text-xs font-semibold text-slate-700 border border-slate-200 transition-colors cursor-pointer"
            title="View & copy the Streamlit app.py source code"
          >
            <Code2 className="w-3.5 h-3.5 text-violet-600" />
            <span className="tracking-wide uppercase text-[11px]">Streamlit Code</span>
          </button>
        )}

        {hasActiveQuiz && onResetQuiz && (
          <button
            id="header-btn-new-quiz"
            onClick={onResetQuiz}
            className="inline-flex items-center gap-1.5 px-4 py-2 bg-violet-600 hover:bg-violet-700 rounded-lg text-xs font-semibold text-white shadow-md transition-all duration-150 cursor-pointer active:scale-95"
            title="Start a new test or upload another PDF"
          >
            <RefreshCw className="w-3.5 h-3.5" />
            <span className="tracking-wider uppercase text-[11px]">Generate New</span>
          </button>
        )}
      </div>
    </header>
  );
};
