import React, { useEffect } from "react";
import confetti from "canvas-confetti";
import {
  Trophy,
  CheckCircle2,
  XCircle,
  HelpCircle,
  RotateCcw,
  BookOpen,
  ArrowDown,
  Sparkles,
  Award,
} from "lucide-react";

interface ScoreReportProps {
  score: number;
  totalQuestions: number;
  percentage: number;
  onRetake: () => void;
  onNewQuiz: () => void;
  onScrollToReview: () => void;
}

export const ScoreReport: React.FC<ScoreReportProps> = ({
  score,
  totalQuestions,
  percentage,
  onRetake,
  onNewQuiz,
  onScrollToReview,
}) => {
  const incorrectCount = totalQuestions - score;

  // Trigger celebration confetti for good performance
  useEffect(() => {
    if (percentage >= 60) {
      try {
        confetti({
          particleCount: 80,
          spread: 70,
          origin: { y: 0.6 },
          colors: ["#6B21A8", "#7C3AED", "#FDE047", "#A855F7"],
        });
      } catch (e) {
        // Safe fallback if canvas is restricted
      }
    }
  }, [percentage]);

  const getTierDetails = () => {
    if (percentage >= 80) {
      return {
        label: "Outstanding Mastery",
        subtext: "Excellent grasp of statistical theory, index numbers, and official methodology.",
        badgeColor: "bg-emerald-100 text-emerald-800 border-emerald-300",
        icon: Trophy,
      };
    } else if (percentage >= 60) {
      return {
        label: "Solid Competency",
        subtext: "Strong foundational knowledge with minor revision needed on specific sub-topics.",
        badgeColor: "bg-blue-100 text-blue-800 border-blue-300",
        icon: Award,
      };
    } else if (percentage >= 40) {
      return {
        label: "Average Performance",
        subtext: "Fair understanding. Target the topics flagged for improvement below.",
        badgeColor: "bg-amber-100 text-amber-800 border-amber-300",
        icon: HelpCircle,
      };
    } else {
      return {
        label: "Foundational Focus Needed",
        subtext: "Carefully study the provided explanations and re-read the core material.",
        badgeColor: "bg-rose-100 text-rose-800 border-rose-300",
        icon: AlertTriangle,
      };
    }
  };

  const tier = getTierDetails();
  const TierIcon = tier.icon;

  return (
    <div
      id="score-report-card"
      className="bg-white rounded-2xl p-6 md:p-8 border border-slate-200 shadow-sm flex flex-col justify-between"
    >
      <div>
        <h2 className="text-sm font-bold text-slate-400 uppercase tracking-wider mb-6 text-center">
          Test Score Summary
        </h2>

        <div className="text-center space-y-2 py-4">
          <div className="text-6xl md:text-7xl font-black text-violet-600 tracking-tighter">
            {percentage}%
          </div>
          <div className="text-lg font-semibold text-slate-700 italic">
            {tier.label}
          </div>
          <p className="text-xs text-slate-500 max-w-md mx-auto">
            {tier.subtext}
          </p>
        </div>

        {/* Breakdown Progress Bars */}
        <div className="mt-6 pt-6 border-t border-slate-100 space-y-5 max-w-lg mx-auto">
          <div>
            <div className="flex justify-between items-center mb-2">
              <span className="text-sm text-slate-500 font-medium">Correct Answers</span>
              <span className="text-sm font-bold text-slate-800">
                {score} / {totalQuestions}
              </span>
            </div>
            <div className="w-full bg-slate-100 h-2 rounded-full overflow-hidden">
              <div
                className="bg-emerald-500 h-full transition-all duration-500"
                style={{ width: `${percentage}%` }}
              />
            </div>
          </div>

          <div>
            <div className="flex justify-between items-center mb-2">
              <span className="text-sm text-slate-500 font-medium">Incorrect Answers</span>
              <span className="text-sm font-bold text-slate-800">
                {incorrectCount} / {totalQuestions}
              </span>
            </div>
            <div className="w-full bg-slate-100 h-2 rounded-full overflow-hidden">
              <div
                className="bg-rose-500 h-full transition-all duration-500"
                style={{ width: `${Math.round((incorrectCount / totalQuestions) * 100)}%` }}
              />
            </div>
          </div>

          <div>
            <div className="flex justify-between items-center mb-2">
              <span className="text-sm text-slate-500 font-medium">Overall Accuracy</span>
              <span className="text-sm font-bold text-violet-600">
                {percentage}%
              </span>
            </div>
            <div className="w-full bg-slate-100 h-2 rounded-full overflow-hidden">
              <div
                className="bg-violet-600 h-full transition-all duration-500"
                style={{ width: `${percentage}%` }}
              />
            </div>
          </div>
        </div>
      </div>

      {/* Action Controls */}
      <div className="pt-8 mt-6 border-t border-slate-100 space-y-3">
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
          <button
            id="btn-retake-quiz"
            type="button"
            onClick={onRetake}
            className="w-full py-3 bg-violet-50 text-violet-700 font-bold rounded-xl border border-violet-100 hover:bg-violet-100 transition-colors text-xs uppercase tracking-wider flex items-center justify-center gap-2 cursor-pointer active:scale-98"
          >
            <RotateCcw className="w-3.5 h-3.5" />
            <span>Retake Assessment</span>
          </button>

          <button
            id="btn-new-material-quiz"
            type="button"
            onClick={onNewQuiz}
            className="w-full py-3 bg-violet-600 text-white font-bold rounded-xl hover:bg-violet-700 transition-colors text-xs uppercase tracking-wider shadow-sm flex items-center justify-center gap-2 cursor-pointer active:scale-98"
          >
            <BookOpen className="w-3.5 h-3.5" />
            <span>Upload New Material</span>
          </button>
        </div>

        <button
          id="btn-scroll-to-review"
          type="button"
          onClick={onScrollToReview}
          className="w-full py-2 text-xs font-semibold text-slate-500 hover:text-violet-700 transition-colors flex items-center justify-center gap-1.5 cursor-pointer"
        >
          <span>Review All Questions and Answers</span>
          <ArrowDown className="w-3.5 h-3.5" />
        </button>
      </div>
    </div>
  );
};

function AlertTriangle(props: any) {
  return <HelpCircle {...props} />;
}
