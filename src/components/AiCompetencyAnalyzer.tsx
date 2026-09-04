import React, { useState } from "react";
import { TopicAnalysis, TopicRating } from "../types";
import {
  BrainCircuit,
  LayoutGrid,
  Table as TableIcon,
  Award,
  CheckCircle2,
  AlertCircle,
  TrendingUp,
  Sparkles,
} from "lucide-react";

interface AiCompetencyAnalyzerProps {
  topicAnalyses: TopicAnalysis[];
  aiFeedback?: string;
  isLoadingAiFeedback?: boolean;
}

export const AiCompetencyAnalyzer: React.FC<AiCompetencyAnalyzerProps> = ({
  topicAnalyses,
  aiFeedback,
  isLoadingAiFeedback,
}) => {
  const [displayFormat, setDisplayFormat] = useState<"card" | "table">("card");

  // Exact requested rating styles
  const getRatingBadge = (rating: TopicRating) => {
    switch (rating) {
      case "Very Good":
        return {
          bg: "bg-emerald-100 text-emerald-700 border-emerald-200",
          dot: "bg-emerald-600",
          barColor: "bg-emerald-500",
        };
      case "Good":
        return {
          bg: "bg-blue-100 text-blue-700 border-blue-200",
          dot: "bg-blue-600",
          barColor: "bg-blue-500",
        };
      case "Average":
        return {
          bg: "bg-amber-100 text-amber-700 border-amber-200",
          dot: "bg-amber-600",
          barColor: "bg-amber-500",
        };
      case "Need to Improve":
        return {
          bg: "bg-rose-100 text-rose-700 border-rose-200",
          dot: "bg-rose-600",
          barColor: "bg-rose-500",
        };
    }
  };

  return (
    <div
      id="ai-analysis-section"
      className="bg-white rounded-2xl border border-slate-200 shadow-sm p-6 md:p-8 flex flex-col justify-between"
    >
      <div>
        {/* Section Header */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-6">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-violet-50 text-violet-700 border border-violet-100 flex items-center justify-center shadow-xs">
              <BrainCircuit className="w-5 h-5" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h2 className="text-sm font-bold text-slate-400 uppercase tracking-wider">
                  AI Competency Analysis
                </h2>
                <span className="text-xs bg-violet-50 text-violet-600 font-semibold px-2.5 py-0.5 rounded-md border border-violet-100">
                  TOPIC-WISE EVALUATION
                </span>
              </div>
              <p className="text-xs text-slate-500 mt-0.5">
                Automated subject-matter competency evaluation across identified syllabus topics.
              </p>
            </div>
          </div>

          {/* View Toggle */}
          <div className="flex items-center gap-2 self-start sm:self-auto">
            <div className="inline-flex p-1 bg-slate-100 rounded-xl border border-slate-200">
              <button
                id="btn-format-table"
                type="button"
                onClick={() => setDisplayFormat("table")}
                className={`px-3 py-1.5 rounded-lg text-xs font-semibold flex items-center gap-1.5 transition-all cursor-pointer ${
                  displayFormat === "table"
                    ? "bg-violet-600 text-white shadow-xs"
                    : "text-slate-600 hover:text-slate-900"
                }`}
              >
                <TableIcon className="w-3.5 h-3.5" />
                <span>Table</span>
              </button>
              <button
                id="btn-format-card"
                type="button"
                onClick={() => setDisplayFormat("card")}
                className={`px-3 py-1.5 rounded-lg text-xs font-semibold flex items-center gap-1.5 transition-all cursor-pointer ${
                  displayFormat === "card"
                    ? "bg-violet-600 text-white shadow-xs"
                    : "text-slate-600 hover:text-slate-900"
                }`}
              >
                <LayoutGrid className="w-3.5 h-3.5" />
                <span>Cards</span>
              </button>
            </div>
          </div>
        </div>

        {/* FORMAT 1: CLEAN TABLE FORMAT (DEFAULT MATCHING DESIGN) */}
        {displayFormat === "table" && (
          <div className="overflow-x-auto">
            <table className="w-full text-left">
              <thead>
                <tr className="text-xs uppercase text-slate-400 border-b border-slate-100">
                  <th className="pb-3 font-semibold">Topic</th>
                  <th className="pb-3 font-semibold">Tested</th>
                  <th className="pb-3 font-semibold">Accuracy</th>
                  <th className="pb-3 font-semibold text-right">Competency Rating</th>
                </tr>
              </thead>
              <tbody className="text-sm divide-y divide-slate-100">
                {topicAnalyses.map((item, index) => {
                  const style = getRatingBadge(item.rating);
                  return (
                    <tr key={index} className="hover:bg-slate-50/60 transition-colors">
                      <td className="py-4 font-semibold text-slate-700">
                        {item.topic}
                      </td>
                      <td className="py-4 text-slate-500 text-xs">
                        {item.totalQuestions} Questions
                      </td>
                      <td className="py-4 text-slate-500">
                        <span className="font-semibold text-slate-800">
                          {Math.round(item.percentage)}%
                        </span>{" "}
                        <span className="text-xs text-slate-400">
                          ({item.correctQuestions}/{item.totalQuestions})
                        </span>
                      </td>
                      <td className="py-4 text-right">
                        <span
                          className={`inline-block px-3 py-1 rounded-full text-xs font-bold ${style.bg}`}
                        >
                          {item.rating}
                        </span>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}

        {/* FORMAT 2: CLEAN CARD FORMAT */}
        {displayFormat === "card" && (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {topicAnalyses.map((item, index) => {
              const style = getRatingBadge(item.rating);
              return (
                <div
                  key={index}
                  id={`topic-card-${index}`}
                  className="bg-slate-50/50 hover:bg-white rounded-xl border border-slate-200 hover:border-violet-300 p-5 space-y-4 shadow-xs hover:shadow-sm transition-all"
                >
                  <div className="flex items-start justify-between gap-2">
                    <h4 className="font-bold text-sm text-slate-800 leading-tight">
                      {item.topic}
                    </h4>
                    <span
                      className={`inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-xs font-bold shrink-0 ${style.bg}`}
                    >
                      <span className={`w-1.5 h-1.5 rounded-full ${style.dot}`} />
                      {item.rating}
                    </span>
                  </div>

                  <div className="space-y-1.5">
                    <div className="flex items-center justify-between text-xs text-slate-500">
                      <span>Performance:</span>
                      <span className="font-bold text-slate-800">
                        {item.correctQuestions} / {item.totalQuestions} ({Math.round(item.percentage)}%)
                      </span>
                    </div>
                    <div className="w-full h-2 bg-slate-200 rounded-full overflow-hidden">
                      <div
                        className={`h-full rounded-full transition-all duration-300 ${style.barColor}`}
                        style={{ width: `${item.percentage}%` }}
                      />
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>

      {/* AI Insight Box matching Design theme */}
      <div className="p-4 bg-violet-50/50 border border-violet-100 rounded-xl mt-6">
        <p className="text-xs text-slate-600 italic leading-relaxed">
          <strong className="text-violet-700 not-italic font-bold">AI Insight: </strong>
          {isLoadingAiFeedback ? (
            <span className="text-violet-600 animate-pulse">
              Synthesizing personalized diagnostic assessment...
            </span>
          ) : (
            aiFeedback ||
            "Strong grasp on foundational theories. Focus revision on agricultural statistical surveys and secondary data collation methodologies."
          )}
        </p>
      </div>
    </div>
  );
};
