import React from "react";
import {
  FileText,
  Sliders,
  CheckCircle2,
  BarChart3,
  BookOpen,
  Info,
  Sparkles,
  ChevronRight,
  RefreshCw,
  Code,
  Award,
} from "lucide-react";
import { MithraOwlLogo } from "./MithraOwlLogo";

interface SidebarProps {
  onLoadSample: () => void;
  onReset: () => void;
  onOpenCode: () => void;
  hasQuiz: boolean;
  questionCount?: number;
  currentScore?: number | null;
  activeFileName?: string;
  isOpen: boolean;
  onClose: () => void;
}

export const Sidebar: React.FC<SidebarProps> = ({
  onLoadSample,
  onReset,
  onOpenCode,
  hasQuiz,
  questionCount,
  currentScore,
  activeFileName,
  isOpen,
  onClose,
}) => {
  return (
    <>
      {/* Backdrop for mobile */}
      {isOpen && (
        <div
          id="sidebar-backdrop"
          onClick={onClose}
          className="fixed inset-0 bg-violet-950/60 backdrop-blur-xs z-40 lg:hidden transition-opacity"
        />
      )}

      <aside
        id="mithra-sidebar"
        className={`fixed lg:static top-0 bottom-0 left-0 z-50 w-72 bg-violet-900 flex flex-col border-r border-violet-800 shadow-xl shrink-0 transition-transform duration-300 ease-in-out ${
          isOpen ? "translate-x-0" : "-translate-x-full lg:translate-x-0"
        }`}
      >
        {/* Sidebar Header with White Rounded Card for Logo */}
        <div className="p-6 border-b border-violet-800/50">
          <div className="flex items-center gap-3">
            <div className="w-12 h-12 bg-white rounded-2xl flex items-center justify-center shadow-lg shrink-0">
              <MithraOwlLogo size={36} />
            </div>
            <div>
              <span className="text-2xl font-bold text-white tracking-tight">Mithra.ai</span>
              <div className="text-[11px] text-violet-300 font-medium tracking-wide">
                AI Learning Assistant
              </div>
            </div>
          </div>
        </div>

        {/* Sidebar Scrollable Body */}
        <div className="flex-1 overflow-y-auto p-6 space-y-6 text-sm">
          {/* Instructions Block */}
          <div className="space-y-2 text-violet-100/70">
            <h3 className="text-xs font-semibold uppercase tracking-widest text-violet-300">
              Instructions
            </h3>
            <ol className="text-sm space-y-3 list-decimal pl-4 leading-relaxed text-violet-100/90 font-normal">
              <li>Upload your study material in PDF format.</li>
              <li>Select the number of questions to generate.</li>
              <li>Complete the interactive quiz section.</li>
              <li>Review your AI-generated competency analysis.</li>
            </ol>
          </div>

          {/* Current Session / PDF Metadata Card */}
          <div className="p-4 bg-violet-800/50 rounded-xl border border-violet-700 space-y-1 text-xs">
            <p className="text-violet-200">
              Current Session:{" "}
              <span className="font-mono text-violet-100 font-semibold opacity-90">
                #ST-9421-B
              </span>
            </p>
            <p className="text-violet-200 truncate">
              PDF:{" "}
              <span className="font-medium italic text-white">
                {activeFileName || "Official_Stats_Handbook.pdf"}
              </span>
            </p>
            {hasQuiz && questionCount && (
              <p className="text-violet-200 pt-1 border-t border-violet-700/60 mt-1 flex justify-between">
                <span>Total MCQs:</span>
                <span className="font-bold text-white">{questionCount}</span>
              </p>
            )}
            {currentScore !== null && currentScore !== undefined && (
              <p className="text-emerald-300 flex justify-between font-medium">
                <span>Score:</span>
                <span className="font-bold text-emerald-200">
                  {currentScore} / {questionCount}
                </span>
              </p>
            )}
          </div>

          {/* Topic Competency Rating Scale */}
          <div className="space-y-2 pt-1">
            <div className="flex items-center gap-1.5 text-xs font-semibold uppercase tracking-widest text-violet-300">
              <Award className="w-3.5 h-3.5 text-violet-300" />
              <span>Competency Tiers</span>
            </div>
            <div className="space-y-1.5 text-xs">
              <div className="flex items-center justify-between p-2 rounded-lg bg-emerald-950/40 border border-emerald-500/30 text-emerald-200 font-medium">
                <span className="flex items-center gap-2">
                  <span className="w-2 h-2 rounded-full bg-emerald-400" />
                  Very Good
                </span>
                <span className="text-[11px] text-emerald-300 font-mono">≥ 80%</span>
              </div>
              <div className="flex items-center justify-between p-2 rounded-lg bg-blue-950/40 border border-blue-500/30 text-blue-200 font-medium">
                <span className="flex items-center gap-2">
                  <span className="w-2 h-2 rounded-full bg-blue-400" />
                  Good
                </span>
                <span className="text-[11px] text-blue-300 font-mono">60% – 79%</span>
              </div>
              <div className="flex items-center justify-between p-2 rounded-lg bg-amber-950/40 border border-amber-500/30 text-amber-200 font-medium">
                <span className="flex items-center gap-2">
                  <span className="w-2 h-2 rounded-full bg-amber-400" />
                  Average
                </span>
                <span className="text-[11px] text-amber-300 font-mono">40% – 59%</span>
              </div>
              <div className="flex items-center justify-between p-2 rounded-lg bg-rose-950/40 border border-rose-500/30 text-rose-200 font-medium">
                <span className="flex items-center gap-2">
                  <span className="w-2 h-2 rounded-full bg-rose-400" />
                  Need to Improve
                </span>
                <span className="text-[11px] text-rose-300 font-mono">&lt; 40%</span>
              </div>
            </div>
          </div>

          {/* Quick Actions */}
          <div className="space-y-2 pt-2 border-t border-violet-800/50">
            <button
              id="sidebar-btn-sample"
              onClick={onLoadSample}
              className="w-full text-left p-2.5 rounded-xl border border-violet-700 bg-violet-800/40 hover:bg-violet-800/80 text-violet-100 text-xs font-semibold flex items-center justify-between transition-colors cursor-pointer"
            >
              <div className="flex items-center gap-2">
                <BookOpen className="w-4 h-4 text-violet-300" />
                <span>Sample Statistical PDF</span>
              </div>
              <ChevronRight className="w-3.5 h-3.5 text-violet-400" />
            </button>

            <button
              id="sidebar-btn-view-code"
              onClick={onOpenCode}
              className="w-full text-left p-2.5 rounded-xl border border-violet-700 bg-violet-800/40 hover:bg-violet-800/80 text-violet-100 text-xs font-semibold flex items-center justify-between transition-colors cursor-pointer"
            >
              <div className="flex items-center gap-2">
                <Code className="w-4 h-4 text-amber-300" />
                <span>Streamlit Python Code</span>
              </div>
              <ChevronRight className="w-3.5 h-3.5 text-violet-400" />
            </button>

            {hasQuiz && (
              <button
                id="sidebar-btn-reset"
                onClick={onReset}
                className="w-full text-left p-2.5 rounded-xl border border-rose-500/40 bg-rose-950/30 hover:bg-rose-950/60 text-rose-200 text-xs font-semibold flex items-center justify-between transition-colors cursor-pointer"
              >
                <div className="flex items-center gap-2">
                  <RefreshCw className="w-4 h-4" />
                  <span>Start New Assessment</span>
                </div>
                <ChevronRight className="w-3.5 h-3.5 text-rose-400" />
              </button>
            )}
          </div>
        </div>

        {/* Sidebar Footer */}
        <div className="p-6 border-t border-violet-800/50 text-[10px] text-violet-300 text-center uppercase tracking-widest font-semibold">
          Powered by Mithra.ai
        </div>
      </aside>
    </>
  );
};
