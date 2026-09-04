import React, { useState } from "react";
import { Question, OptionKey } from "../types";
import {
  CheckCircle2,
  XCircle,
  ChevronDown,
  ChevronUp,
  Lightbulb,
  Calculator,
  BookOpen,
  Binary,
  Layers,
  Sparkles,
  Bookmark,
  Check,
} from "lucide-react";
import { resolveDetailedSolution, isNumericalProblem, hasRealFormula } from "../utils/solutionHelper";
import { MathRenderer, FormattedMathContent } from "./MathRenderer";

interface QuestionReviewProps {
  questions: Question[];
  userAnswers: Record<number, OptionKey>;
}

type FilterType = "all" | "correct" | "incorrect" | "numerical" | "theoretical";

export const QuestionReview: React.FC<QuestionReviewProps> = ({
  questions,
  userAnswers,
}) => {
  const [filter, setFilter] = useState<FilterType>("all");
  const [expandedQuestions, setExpandedQuestions] = useState<Record<number, boolean>>({});

  const toggleExpand = (id: number) => {
    setExpandedQuestions((prev) => ({
      ...prev,
      [id]: !prev[id],
    }));
  };

  const expandAll = () => {
    const all: Record<number, boolean> = {};
    questions.forEach((q) => {
      all[q.id] = true;
    });
    setExpandedQuestions(all);
  };

  const collapseAll = () => {
    setExpandedQuestions({});
  };

  const correctCount = questions.filter(
    (q) => userAnswers[q.id] === q.correctAnswer
  ).length;
  const incorrectCount = questions.length - correctCount;

  const numericalCount = questions.filter((q) => isNumericalProblem(q)).length;
  const theoreticalCount = questions.length - numericalCount;

  const filteredQuestions = questions.filter((q) => {
    const isCorrect = userAnswers[q.id] === q.correctAnswer;
    const isNum = isNumericalProblem(q);

    if (filter === "correct") return isCorrect;
    if (filter === "incorrect") return !isCorrect;
    if (filter === "numerical") return isNum;
    if (filter === "theoretical") return !isNum;
    return true;
  });

  return (
    <div id="question-review-section" className="bg-white rounded-2xl border border-slate-200 shadow-sm p-6 md:p-8 space-y-6">
      {/* Header and filters */}
      <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4 pb-4 border-b border-slate-200">
        <div>
          <h3 className="text-xl font-bold text-slate-800 flex items-center gap-2">
            <Lightbulb className="w-5 h-5 text-amber-500" />
            <span>Comprehensive Solutions & Analysis</span>
          </h3>
          <p className="text-xs md:text-sm text-slate-500 mt-0.5">
            Step-by-step mathematical calculations for problem-solving questions and conceptual breakdowns for theory.
          </p>
        </div>

        {/* Filter Pills */}
        <div className="flex flex-wrap items-center gap-2">
          <div className="inline-flex p-1 bg-slate-100 rounded-xl border border-slate-200 text-xs font-semibold overflow-x-auto max-w-full">
            <button
              id="btn-filter-all"
              type="button"
              onClick={() => setFilter("all")}
              className={`px-3 py-1.5 rounded-lg transition-all cursor-pointer whitespace-nowrap ${
                filter === "all"
                  ? "bg-violet-600 text-white shadow-xs"
                  : "text-slate-600 hover:text-slate-900"
              }`}
            >
              All ({questions.length})
            </button>
            <button
              id="btn-filter-correct"
              type="button"
              onClick={() => setFilter("correct")}
              className={`px-3 py-1.5 rounded-lg transition-all cursor-pointer whitespace-nowrap ${
                filter === "correct"
                  ? "bg-emerald-600 text-white shadow-xs"
                  : "text-slate-600 hover:text-emerald-700"
              }`}
            >
              Correct ({correctCount})
            </button>
            <button
              id="btn-filter-incorrect"
              type="button"
              onClick={() => setFilter("incorrect")}
              className={`px-3 py-1.5 rounded-lg transition-all cursor-pointer whitespace-nowrap ${
                filter === "incorrect"
                  ? "bg-rose-600 text-white shadow-xs"
                  : "text-slate-600 hover:text-rose-700"
              }`}
            >
              Incorrect ({incorrectCount})
            </button>
            <button
              id="btn-filter-numerical"
              type="button"
              onClick={() => setFilter("numerical")}
              className={`px-3 py-1.5 rounded-lg transition-all cursor-pointer whitespace-nowrap flex items-center gap-1 ${
                filter === "numerical"
                  ? "bg-sky-600 text-white shadow-xs"
                  : "text-slate-600 hover:text-sky-700"
              }`}
            >
              <Calculator className="w-3.5 h-3.5" />
              <span>Numerical ({numericalCount})</span>
            </button>
            <button
              id="btn-filter-theoretical"
              type="button"
              onClick={() => setFilter("theoretical")}
              className={`px-3 py-1.5 rounded-lg transition-all cursor-pointer whitespace-nowrap flex items-center gap-1 ${
                filter === "theoretical"
                  ? "bg-purple-600 text-white shadow-xs"
                  : "text-slate-600 hover:text-purple-700"
              }`}
            >
              <BookOpen className="w-3.5 h-3.5" />
              <span>Theory ({theoreticalCount})</span>
            </button>
          </div>

          <div className="flex items-center gap-1.5 text-xs text-violet-600 shrink-0">
            <button
              id="btn-expand-all"
              type="button"
              onClick={expandAll}
              className="px-2 py-1 rounded hover:bg-violet-50 cursor-pointer font-medium"
            >
              Expand All
            </button>
            <span>•</span>
            <button
              id="btn-collapse-all"
              type="button"
              onClick={collapseAll}
              className="px-2 py-1 rounded hover:bg-violet-50 cursor-pointer font-medium"
            >
              Collapse
            </button>
          </div>
        </div>
      </div>

      {/* Question Accordion List */}
      <div className="space-y-4">
        {filteredQuestions.map((q) => {
          const userAnswer = userAnswers[q.id];
          const isCorrect = userAnswer === q.correctAnswer;
          const isExpanded = expandedQuestions[q.id] ?? true;
          const isNumerical = isNumericalProblem(q);
          const solution = resolveDetailedSolution(q);

          return (
            <div
              key={q.id}
              id={`review-card-q-${q.id}`}
              className={`rounded-2xl border transition-all duration-200 overflow-hidden ${
                isCorrect
                  ? "bg-white border-emerald-200 shadow-xs"
                  : "bg-white border-rose-200 shadow-xs"
              }`}
            >
              {/* Question summary header bar */}
              <div
                onClick={() => toggleExpand(q.id)}
                className="p-4 md:p-5 flex items-start justify-between gap-4 cursor-pointer hover:bg-slate-50/60 transition-colors select-none"
              >
                <div className="flex items-start gap-3">
                  <div
                    className={`w-7 h-7 rounded-xl flex items-center justify-center shrink-0 mt-0.5 font-bold text-xs ${
                      isCorrect
                        ? "bg-emerald-100 text-emerald-700"
                        : "bg-rose-100 text-rose-700"
                    }`}
                  >
                    {isCorrect ? (
                      <CheckCircle2 className="w-4 h-4" />
                    ) : (
                      <XCircle className="w-4 h-4" />
                    )}
                  </div>

                  <div>
                    <div className="flex flex-wrap items-center gap-2 mb-1">
                      <span className="text-xs font-bold text-slate-800">
                        Q{q.id}.
                      </span>
                      <span className="px-2 py-0.5 rounded-full bg-slate-100 border border-slate-200 text-slate-600 text-[11px] font-semibold">
                        {q.topic}
                      </span>

                      {/* Problem Category Badge */}
                      {isNumerical ? (
                        <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full bg-sky-50 text-sky-700 border border-sky-200 text-[11px] font-bold">
                          <Calculator className="w-3 h-3 text-sky-600" />
                          <span>Numerical / Problem Solving</span>
                        </span>
                      ) : (
                        <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full bg-violet-50 text-violet-700 border border-violet-200 text-[11px] font-bold">
                          <BookOpen className="w-3 h-3 text-violet-600" />
                          <span>Theoretical & Conceptual</span>
                        </span>
                      )}

                      <span
                        className={`text-[11px] font-bold px-2 py-0.5 rounded-md ${
                          isCorrect
                            ? "bg-emerald-100 text-emerald-800"
                            : "bg-rose-100 text-rose-800"
                        }`}
                      >
                        {isCorrect
                          ? "Correct"
                          : userAnswer
                          ? "Incorrect"
                          : "Unanswered"}
                      </span>
                    </div>
                    <h4 className="text-sm md:text-base font-bold text-slate-800">
                      <FormattedMathContent text={q.question} />
                    </h4>
                  </div>
                </div>

                <button
                  type="button"
                  className="p-1 rounded-lg text-slate-400 hover:text-slate-700 shrink-0"
                >
                  {isExpanded ? (
                    <ChevronUp className="w-5 h-5" />
                  ) : (
                    <ChevronDown className="w-5 h-5" />
                  )}
                </button>
              </div>

              {/* Detailed Breakdown */}
              {isExpanded && (
                <div className="px-5 pb-5 pt-1 space-y-4 border-t border-slate-100 bg-slate-50/40">
                  {/* Options List */}
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-2.5 pt-3">
                    {(["A", "B", "C", "D"] as OptionKey[]).map((key) => {
                      const isOptionCorrect = key === q.correctAnswer;
                      const isOptionUserPick = key === userAnswer;

                      let style = "bg-white border-slate-200 text-slate-700";
                      if (isOptionCorrect) {
                        style =
                          "bg-emerald-50/90 border-emerald-300 text-emerald-900 font-semibold ring-1 ring-emerald-300";
                      } else if (isOptionUserPick && !isCorrect) {
                        style =
                          "bg-rose-50/90 border-rose-300 text-rose-900 line-through opacity-80 ring-1 ring-rose-300";
                      }

                      return (
                        <div
                          key={key}
                          className={`p-3 rounded-xl border text-xs flex items-start gap-2.5 transition-colors ${style}`}
                        >
                          <span
                            className={`w-5 h-5 rounded-md flex items-center justify-center font-bold shrink-0 text-[10px] ${
                              isOptionCorrect
                                ? "bg-emerald-600 text-white"
                                : isOptionUserPick
                                ? "bg-rose-600 text-white"
                                : "bg-slate-100 text-slate-600"
                            }`}
                          >
                            {key}
                          </span>
                          <div className="flex-1">
                            <span>
                              <FormattedMathContent text={q.options[key]} />
                            </span>
                            {isOptionCorrect && (
                              <span className="block text-[10px] text-emerald-700 font-bold mt-0.5">
                                ✓ Correct Answer
                              </span>
                            )}
                            {isOptionUserPick && !isCorrect && (
                              <span className="block text-[10px] text-rose-700 font-bold mt-0.5">
                                ✕ Your Selection
                              </span>
                            )}
                          </div>
                        </div>
                      );
                    })}
                  </div>

                  {/* TAILORED DETAILED SOLUTION CARD */}
                  {(() => {
                    const validFormula = hasRealFormula(solution.formulaUsed) ? solution.formulaUsed : null;
                    const hasCalcSteps = isNumerical && Array.isArray(solution.steps) && solution.steps.length > 0;

                    return (
                      <div className="p-4 md:p-5 rounded-2xl bg-white border border-slate-200 text-xs space-y-4 shadow-xs">
                        {/* Section Header */}
                        <div className="flex items-center justify-between border-b border-slate-100 pb-3">
                          <div className="flex items-center gap-2.5">
                            <div className={`p-1.5 rounded-lg text-white shadow-xs ${validFormula || hasCalcSteps ? "bg-sky-600" : "bg-violet-600"}`}>
                              {validFormula || hasCalcSteps ? <Calculator className="w-4 h-4" /> : <BookOpen className="w-4 h-4" />}
                            </div>
                            <div>
                              <div className="font-bold text-slate-900 text-sm">
                                {validFormula || hasCalcSteps ? "Mathematical Solution & Analysis" : "Detailed Conceptual Solution"}
                              </div>
                              <div className="text-[11px] text-slate-500">
                                {validFormula || hasCalcSteps
                                  ? "Step-by-step mathematical derivation and quantitative verification"
                                  : "Core concepts, correct answer reasoning, and distractor breakdown"}
                              </div>
                            </div>
                          </div>
                          <span className={`px-2.5 py-1 rounded-full font-bold text-[10px] border ${
                            validFormula || hasCalcSteps
                              ? "bg-sky-50 text-sky-800 border-sky-200"
                              : "bg-purple-50 text-purple-800 border-purple-200"
                          }`}>
                            {validFormula || hasCalcSteps ? "Calculation Problem" : "Theoretical Concept"}
                          </span>
                        </div>

                        {/* WHY OPTION X IS CORRECT - Primary Highlight */}
                        <div className="p-3.5 rounded-xl bg-emerald-50 border border-emerald-200 text-emerald-950 space-y-1">
                          <div className="font-bold text-emerald-900 text-[12px] flex items-center gap-1.5">
                            <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
                            <span>Why Option {q.correctAnswer} is Correct:</span>
                          </div>
                          <div className="text-emerald-900 text-xs font-medium leading-relaxed pl-5.5">
                            <FormattedMathContent
                              text={
                                solution.whyCorrect ||
                                `Option ${q.correctAnswer} ("${q.options[q.correctAnswer]}") is correct. ${q.explanation || ""}`
                              }
                            />
                          </div>
                        </div>

                        {/* CORE CONCEPT / SUMMARY */}
                        {solution.coreConcept && (
                          <div className="p-3 rounded-xl bg-slate-50 border border-slate-200/80 space-y-1">
                            <div className="font-bold text-slate-800 text-[11px] flex items-center gap-1.5">
                              <Bookmark className="w-3.5 h-3.5 text-violet-600" />
                              <span>Core Concept & Context:</span>
                            </div>
                            <div className="text-slate-700 font-medium pl-5">
                              <FormattedMathContent text={solution.coreConcept} />
                            </div>
                          </div>
                        )}

                        {/* DETAILED EXPLANATION */}
                        {(solution.conceptualExplanation || q.explanation) && (
                          <div className="p-3.5 rounded-xl bg-white border border-slate-200 space-y-1.5 text-slate-700 shadow-2xs">
                            <div className="font-bold text-slate-900 text-[11px] flex items-center gap-1.5">
                              <Lightbulb className="w-3.5 h-3.5 text-amber-500" />
                              <span>Clear Explanation:</span>
                            </div>
                            <div className="font-normal text-slate-700 leading-relaxed pl-5 text-[11.5px]">
                              <FormattedMathContent
                                text={solution.conceptualExplanation || q.explanation}
                              />
                            </div>
                          </div>
                        )}

                        {/* MATHEMATICAL FORMULA - ONLY SHOWN IF A GENUINE FORMULA EXISTS */}
                        {validFormula && (
                          <div className="p-3.5 rounded-xl bg-slate-900 text-slate-100 space-y-1.5 text-[11px]">
                            <div className="text-[10px] font-sans font-bold uppercase tracking-wider text-sky-400 flex items-center gap-1.5">
                              <Binary className="w-3.5 h-3.5 text-sky-400" />
                              <span>Mathematical Formula:</span>
                            </div>
                            <div className="overflow-x-auto py-2 px-3 text-sky-200 font-medium leading-relaxed bg-slate-800/90 rounded-lg">
                              <MathRenderer formula={validFormula} displayMode={true} />
                            </div>
                          </div>
                        )}

                        {/* GIVEN PARAMETERS - ONLY IF NUMERICAL */}
                        {isNumerical && solution.givenData && (
                          <div className="p-3 rounded-xl bg-sky-50/70 border border-sky-200/80 space-y-1">
                            <div className="font-bold text-sky-950 text-[11px] flex items-center gap-1.5">
                              <Layers className="w-3.5 h-3.5 text-sky-700" />
                              <span>Given Parameters & Conditions:</span>
                            </div>
                            <div className="text-sky-900 leading-relaxed pl-5 text-[11px]">
                              <FormattedMathContent text={solution.givenData} />
                            </div>
                          </div>
                        )}

                        {/* STEP-BY-STEP CALCULATION - ONLY IF NUMERICAL */}
                        {hasCalcSteps && (
                          <div className="space-y-2">
                            <div className="font-bold text-slate-800 text-[11px] flex items-center gap-1.5">
                              <Sparkles className="w-3.5 h-3.5 text-sky-600" />
                              <span>Step-by-Step Calculation:</span>
                            </div>

                            <div className="space-y-2 pl-1">
                              {solution.steps?.map((step, sIdx) => (
                                <div
                                  key={sIdx}
                                  className="p-3 rounded-xl bg-sky-50/40 border border-sky-200/80 text-slate-700 flex items-start gap-2.5"
                                >
                                  <span className="w-5 h-5 rounded-full bg-sky-600 text-white font-bold flex items-center justify-center text-[10px] shrink-0 mt-0.5">
                                    {sIdx + 1}
                                  </span>
                                  <div className="flex-1 font-medium text-[11.5px] leading-relaxed text-slate-800">
                                    <FormattedMathContent text={step} />
                                  </div>
                                </div>
                              ))}
                            </div>
                          </div>
                        )}

                        {/* DISTRACTOR ANALYSIS - WHY OTHER OPTIONS ARE INCORRECT */}
                        {solution.whyIncorrect && (
                          <div className="p-3.5 rounded-xl bg-slate-50 border border-slate-200 space-y-1.5 text-slate-700">
                            <div className="font-bold text-slate-900 text-[11px]">
                              Why Other Options are Incorrect:
                            </div>
                            <div className="text-slate-600 font-normal leading-relaxed whitespace-pre-line text-[11px] pl-1">
                              <FormattedMathContent
                                text={
                                  typeof solution.whyIncorrect === "string"
                                    ? solution.whyIncorrect
                                    : Object.entries(solution.whyIncorrect)
                                        .map(([key, val]) => `• Option ${key}: ${val}`)
                                        .join("\n")
                                }
                              />
                            </div>
                          </div>
                        )}

                        {/* KEY EXAM TAKEAWAY */}
                        {solution.keyTakeaway && (
                          <div className="p-3 rounded-xl bg-amber-50 border border-amber-200 text-amber-950 space-y-1">
                            <div className="font-bold text-[11px] text-amber-900 flex items-center gap-1.5">
                              <Sparkles className="w-3.5 h-3.5 text-amber-600" />
                              <span>Key Revision Takeaway:</span>
                            </div>
                            <div className="text-amber-900 text-[11px] font-medium leading-relaxed pl-5">
                              <FormattedMathContent text={solution.keyTakeaway} />
                            </div>
                          </div>
                        )}
                      </div>
                    );
                  })()}
                </div>
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
};

