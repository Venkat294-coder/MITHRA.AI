import React, { useState } from "react";
import { Question, OptionKey } from "../types";
import { FormattedMathContent } from "./MathRenderer";
import {
  CheckCircle2,
  ChevronLeft,
  ChevronRight,
  Send,
  HelpCircle,
  LayoutList,
  Layers,
  AlertTriangle,
  Flag,
} from "lucide-react";

interface TestInterfaceProps {
  questions: Question[];
  fileName: string;
  userAnswers: Record<number, OptionKey>;
  onSelectAnswer: (questionId: number, option: OptionKey) => void;
  onSubmitTest: () => void;
}

export const TestInterface: React.FC<TestInterfaceProps> = ({
  questions,
  fileName,
  userAnswers,
  onSelectAnswer,
  onSubmitTest,
}) => {
  const [viewMode, setViewMode] = useState<"one-by-one" | "all-at-once">("one-by-one");
  const [currentIndex, setCurrentIndex] = useState<number>(0);
  const [showConfirmModal, setShowConfirmModal] = useState<boolean>(false);

  const totalQuestions = questions.length;
  const answeredCount = Object.keys(userAnswers).length;
  const unansweredCount = totalQuestions - answeredCount;
  const progressPercent = Math.round((answeredCount / totalQuestions) * 100);

  const currentQ = questions[currentIndex];

  const handleNext = () => {
    if (currentIndex < totalQuestions - 1) {
      setCurrentIndex((prev) => prev + 1);
    }
  };

  const handlePrev = () => {
    if (currentIndex > 0) {
      setCurrentIndex((prev) => prev - 1);
    }
  };

  const handleAttemptSubmit = () => {
    if (unansweredCount > 0) {
      setShowConfirmModal(true);
    } else {
      onSubmitTest();
    }
  };

  return (
    <div id="test-interface-container" className="space-y-6">
      {/* Top Test Control Bar */}
      <div className="bg-white rounded-2xl border border-slate-200 shadow-sm p-4 md:p-6">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <div className="flex items-center gap-2">
              <span className="px-2.5 py-0.5 rounded-md bg-violet-50 text-violet-700 border border-violet-100 font-bold text-xs">
                Official Assessment
              </span>
              <span className="text-xs text-slate-500 font-medium truncate max-w-xs">
                Material: {fileName}
              </span>
            </div>
            <h2 className="text-xl font-bold text-slate-800 mt-1">
              Active Examination ({totalQuestions} Questions)
            </h2>
          </div>

          {/* Mode Switcher & Submit */}
          <div className="flex items-center gap-2.5 self-start sm:self-auto">
            <div className="inline-flex p-1 bg-slate-100 rounded-xl border border-slate-200">
              <button
                id="btn-mode-one-by-one"
                type="button"
                onClick={() => setViewMode("one-by-one")}
                className={`px-3 py-1.5 rounded-lg text-xs font-semibold flex items-center gap-1.5 transition-all cursor-pointer ${
                  viewMode === "one-by-one"
                    ? "bg-violet-600 text-white shadow-xs"
                    : "text-slate-600 hover:text-slate-900"
                }`}
              >
                <Layers className="w-3.5 h-3.5" />
                <span>One by One</span>
              </button>
              <button
                id="btn-mode-all-at-once"
                type="button"
                onClick={() => setViewMode("all-at-once")}
                className={`px-3 py-1.5 rounded-lg text-xs font-semibold flex items-center gap-1.5 transition-all cursor-pointer ${
                  viewMode === "all-at-once"
                    ? "bg-violet-600 text-white shadow-xs"
                    : "text-slate-600 hover:text-slate-900"
                }`}
              >
                <LayoutList className="w-3.5 h-3.5" />
                <span>All at Once</span>
              </button>
            </div>

            <button
              id="btn-submit-test-top"
              type="button"
              onClick={handleAttemptSubmit}
              className="inline-flex items-center gap-2 px-4 py-2 rounded-xl bg-violet-600 hover:bg-violet-700 text-white text-xs md:text-sm font-bold shadow-md hover:shadow-lg transition-all cursor-pointer active:scale-95"
            >
              <Send className="w-4 h-4" />
              <span>Submit Test</span>
            </button>
          </div>
        </div>

        {/* Progress Tracker Bar */}
        <div className="mt-5 pt-4 border-t border-slate-100 flex flex-col sm:flex-row sm:items-center justify-between gap-3 text-xs">
          <div className="flex items-center gap-2 text-slate-600 font-medium">
            <span>Progress:</span>
            <span className="text-violet-700 font-bold">
              {answeredCount} of {totalQuestions} answered ({progressPercent}%)
            </span>
          </div>

          <div className="w-full sm:w-64 h-2 bg-slate-100 rounded-full overflow-hidden">
            <div
              className="h-full bg-violet-600 transition-all duration-300 rounded-full"
              style={{ width: `${progressPercent}%` }}
            />
          </div>
        </div>
      </div>

      {/* VIEW MODE 1: ONE BY ONE */}
      {viewMode === "one-by-one" && currentQ && (
        <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
          {/* Main Question Card */}
          <div className="lg:col-span-3 bg-white rounded-2xl border border-slate-200 shadow-sm p-6 md:p-8 space-y-6">
            <div className="flex items-center justify-between gap-4 pb-4 border-b border-slate-100">
              <div className="flex items-center gap-3">
                <span className="w-8 h-8 rounded-xl bg-violet-600 text-white flex items-center justify-center font-bold text-sm shadow-xs">
                  {currentIndex + 1}
                </span>
                <span className="text-xs font-bold text-slate-500 uppercase tracking-wider">
                  Question {currentIndex + 1} of {totalQuestions}
                </span>
              </div>
              <span className="px-3 py-1 rounded-full bg-slate-100 border border-slate-200 text-slate-700 text-xs font-semibold">
                Topic: {currentQ.topic || "Statistical Methodology"}
              </span>
            </div>

            {/* Question Text */}
            <h3 className="text-lg md:text-xl font-bold text-slate-800 leading-relaxed">
              <FormattedMathContent text={currentQ.question} />
            </h3>

            {/* Options */}
            <div className="space-y-3 pt-2">
              {(["A", "B", "C", "D"] as OptionKey[]).map((key) => {
                const isSelected = userAnswers[currentQ.id] === key;
                return (
                  <button
                    key={key}
                    id={`btn-option-${currentQ.id}-${key}`}
                    type="button"
                    onClick={() => onSelectAnswer(currentQ.id, key)}
                    className={`w-full p-4 rounded-xl border text-left flex items-start gap-4 transition-all duration-150 cursor-pointer ${
                      isSelected
                        ? "bg-violet-50/80 border-violet-600 ring-2 ring-violet-600/10 shadow-xs"
                        : "bg-slate-50/50 hover:bg-violet-50/20 border-slate-200 hover:border-violet-300"
                    }`}
                  >
                    <span
                      className={`w-7 h-7 rounded-lg flex items-center justify-center font-bold text-xs shrink-0 transition-colors ${
                        isSelected
                          ? "bg-violet-600 text-white"
                          : "bg-white border border-slate-200 text-slate-700"
                      }`}
                    >
                      {key}
                    </span>
                    <span className="text-sm font-medium text-slate-800 leading-relaxed pt-0.5">
                      <FormattedMathContent text={currentQ.options[key]} />
                    </span>
                  </button>
                );
              })}
            </div>

            {/* Navigation buttons */}
            <div className="flex items-center justify-between pt-6 border-t border-slate-100">
              <button
                id="btn-prev-question"
                type="button"
                onClick={handlePrev}
                disabled={currentIndex === 0}
                className="inline-flex items-center gap-1.5 px-4 py-2 rounded-xl text-xs md:text-sm font-semibold text-slate-700 bg-slate-100 hover:bg-slate-200 border border-slate-200 disabled:opacity-40 disabled:cursor-not-allowed transition-colors cursor-pointer"
              >
                <ChevronLeft className="w-4 h-4" />
                <span>Previous</span>
              </button>

              {currentIndex < totalQuestions - 1 ? (
                <button
                  id="btn-next-question"
                  type="button"
                  onClick={handleNext}
                  className="inline-flex items-center gap-1.5 px-5 py-2 rounded-xl text-xs md:text-sm font-semibold text-white bg-violet-600 hover:bg-violet-700 shadow-sm transition-colors cursor-pointer"
                >
                  <span>Next Question</span>
                  <ChevronRight className="w-4 h-4" />
                </button>
              ) : (
                <button
                  id="btn-finish-test"
                  type="button"
                  onClick={handleAttemptSubmit}
                  className="inline-flex items-center gap-1.5 px-6 py-2 rounded-xl text-xs md:text-sm font-bold text-white bg-violet-700 hover:bg-violet-800 shadow-md transition-colors cursor-pointer"
                >
                  <Send className="w-4 h-4" />
                  <span>Finish & Submit</span>
                </button>
              )}
            </div>
          </div>

          {/* Jump Navigation Grid */}
          <div className="bg-white rounded-2xl border border-slate-200 shadow-sm p-5 space-y-4 h-fit">
            <h4 className="text-xs font-bold text-slate-400 uppercase tracking-wider">
              Question Navigator
            </h4>
            <div className="grid grid-cols-5 gap-2">
              {questions.map((q, idx) => {
                const isAnswered = Boolean(userAnswers[q.id]);
                const isCurrent = idx === currentIndex;
                return (
                  <button
                    key={q.id}
                    id={`btn-nav-q-${idx + 1}`}
                    type="button"
                    onClick={() => setCurrentIndex(idx)}
                    className={`h-9 rounded-lg font-bold text-xs transition-all cursor-pointer ${
                      isCurrent
                        ? "ring-2 ring-violet-400 bg-violet-900 text-white shadow-xs"
                        : isAnswered
                        ? "bg-violet-100 text-violet-800 border border-violet-200"
                        : "bg-slate-50 hover:bg-slate-100 text-slate-600 border border-slate-200"
                    }`}
                  >
                    {idx + 1}
                  </button>
                );
              })}
            </div>

            <div className="pt-3 border-t border-slate-100 space-y-1.5 text-[11px] text-slate-600">
              <div className="flex items-center gap-2">
                <span className="w-3 h-3 rounded bg-violet-100 border border-violet-300" />
                <span>Answered</span>
              </div>
              <div className="flex items-center gap-2">
                <span className="w-3 h-3 rounded bg-slate-50 border border-slate-200" />
                <span>Unanswered</span>
              </div>
              <div className="flex items-center gap-2">
                <span className="w-3 h-3 rounded bg-violet-900" />
                <span>Current</span>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* VIEW MODE 2: ALL AT ONCE */}
      {viewMode === "all-at-once" && (
        <div className="space-y-6">
          {questions.map((q, index) => (
            <div
              key={q.id}
              id={`question-card-${q.id}`}
              className="bg-white rounded-2xl border border-slate-200 shadow-sm p-6 space-y-4"
            >
              <div className="flex items-center justify-between gap-4 pb-3 border-b border-slate-100">
                <div className="flex items-center gap-2.5">
                  <span className="w-7 h-7 rounded-lg bg-violet-600 text-white flex items-center justify-center font-bold text-xs shadow-xs">
                    {index + 1}
                  </span>
                  <span className="text-xs font-bold text-slate-700 uppercase">
                    Question {index + 1}
                  </span>
                </div>
                <span className="px-2.5 py-0.5 rounded-full bg-slate-100 border border-slate-200 text-slate-700 text-xs font-medium">
                  {q.topic}
                </span>
              </div>

              <h3 className="text-base md:text-lg font-bold text-slate-800">
                <FormattedMathContent text={q.question} />
              </h3>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-3 pt-2">
                {(["A", "B", "C", "D"] as OptionKey[]).map((key) => {
                  const isSelected = userAnswers[q.id] === key;
                  return (
                    <button
                      key={key}
                      id={`btn-all-option-${q.id}-${key}`}
                      type="button"
                      onClick={() => onSelectAnswer(q.id, key)}
                      className={`p-3.5 rounded-xl border text-left flex items-start gap-3 transition-all cursor-pointer ${
                        isSelected
                          ? "bg-violet-50/80 border-violet-600 ring-2 ring-violet-600/10 shadow-xs"
                          : "bg-slate-50/50 hover:bg-violet-50/20 border-slate-200 hover:border-violet-300"
                      }`}
                    >
                      <span
                        className={`w-6 h-6 rounded-md flex items-center justify-center font-bold text-xs shrink-0 ${
                          isSelected
                            ? "bg-violet-600 text-white"
                            : "bg-white border border-slate-200 text-slate-700"
                        }`}
                      >
                        {key}
                      </span>
                      <span className="text-xs md:text-sm font-medium text-slate-800 pt-0.5">
                        <FormattedMathContent text={q.options[key]} />
                      </span>
                    </button>
                  );
                })}
              </div>
            </div>
          ))}

          <div className="p-6 bg-white rounded-2xl border border-slate-200 shadow-sm flex flex-col sm:flex-row items-center justify-between gap-4">
            <div className="text-sm font-medium text-slate-700 text-center sm:text-left">
              You have answered <span className="font-bold text-violet-700">{answeredCount}</span> of{" "}
              <span className="font-bold">{totalQuestions}</span> questions.
            </div>
            <button
              id="btn-submit-test-bottom"
              type="button"
              onClick={handleAttemptSubmit}
              className="w-full sm:w-auto inline-flex items-center justify-center gap-2 px-8 py-3 rounded-xl bg-violet-600 hover:bg-violet-700 text-white text-sm font-bold shadow-md transition-all cursor-pointer active:scale-95"
            >
              <Send className="w-4 h-4" />
              <span>Submit Entire Examination</span>
            </button>
          </div>
        </div>
      )}

      {/* Confirmation Modal if Unanswered questions exist */}
      {showConfirmModal && (
        <div
          id="unanswered-modal-backdrop"
          className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-4"
        >
          <div
            id="unanswered-modal"
            className="bg-white rounded-2xl max-w-md w-full p-6 shadow-2xl border border-slate-200 space-y-4 animate-in fade-in zoom-in-95 duration-150"
          >
            <div className="w-12 h-12 rounded-2xl bg-amber-50 text-amber-600 border border-amber-200 flex items-center justify-center mx-auto">
              <AlertTriangle className="w-6 h-6" />
            </div>

            <div className="text-center space-y-1">
              <h4 className="text-lg font-bold text-slate-800">
                Submit with Unanswered Questions?
              </h4>
              <p className="text-xs md:text-sm text-slate-500">
                You still have{" "}
                <span className="font-bold text-rose-600">{unansweredCount}</span> unanswered{" "}
                {unansweredCount === 1 ? "question" : "questions"} out of {totalQuestions}.
                Unanswered questions will be scored as incorrect.
              </p>
            </div>

            <div className="flex items-center gap-3 pt-2">
              <button
                id="btn-modal-cancel"
                type="button"
                onClick={() => setShowConfirmModal(false)}
                className="flex-1 py-2.5 rounded-xl border border-slate-200 text-slate-700 text-xs font-semibold hover:bg-slate-50 transition-colors cursor-pointer"
              >
                Review Answers
              </button>
              <button
                id="btn-modal-confirm-submit"
                type="button"
                onClick={() => {
                  setShowConfirmModal(false);
                  onSubmitTest();
                }}
                className="flex-1 py-2.5 rounded-xl bg-violet-600 hover:bg-violet-700 text-white text-xs font-bold shadow-md transition-colors cursor-pointer"
              >
                Submit Anyway
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
