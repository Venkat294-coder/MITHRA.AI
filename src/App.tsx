/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useRef } from "react";
import { Header } from "./components/Header";
import { Sidebar } from "./components/Sidebar";
import { PdfUploader } from "./components/PdfUploader";
import { TestInterface } from "./components/TestInterface";
import { ScoreReport } from "./components/ScoreReport";
import { AiCompetencyAnalyzer } from "./components/AiCompetencyAnalyzer";
import { QuestionReview } from "./components/QuestionReview";
import { StreamlitCodeModal } from "./components/StreamlitCodeModal";
import { MithraChatbot } from "./components/MithraChatbot";
import { Quiz, OptionKey, TopicAnalysis, TopicRating } from "./types";
import { SAMPLE_STATISTICAL_MATERIAL } from "./data/sampleMaterial";
import { extractTextFromPdfClient } from "./utils/pdfTextExtractor";
import { Menu, Sparkles, BookOpen, AlertCircle, RefreshCw, Info, X } from "lucide-react";

export default function App() {
  const [quiz, setQuiz] = useState<Quiz | null>(null);
  const [userAnswers, setUserAnswers] = useState<Record<number, OptionKey>>({});
  const [isSubmitted, setIsSubmitted] = useState<boolean>(false);
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [loadingStep, setLoadingStep] = useState<string>("");
  const [errorMessage, setErrorMessage] = useState<string>("");
  const [fallbackBanner, setFallbackBanner] = useState<string>("");
  const [aiFeedback, setAiFeedback] = useState<string>("");
  const [isLoadingAiFeedback, setIsLoadingAiFeedback] = useState<boolean>(false);
  const [isCodeModalOpen, setIsCodeModalOpen] = useState<boolean>(false);
  const [isSidebarOpen, setIsSidebarOpen] = useState<boolean>(false);
  const [lastGenerateParams, setLastGenerateParams] = useState<{
    file?: File;
    base64Data?: string;
    textContent?: string;
    fileName: string;
    fileSizeText?: string;
    numQuestions: 10 | 20 | 30;
  } | null>(null);
  const [uploadProgress, setUploadProgress] = useState<number>(0);

  const reviewSectionRef = useRef<HTMLDivElement>(null);

  // Generate Quiz API call with high-capacity streaming pipeline
  const handleGenerateQuiz = async ({
    file,
    base64Data,
    textContent,
    fileName,
    fileSizeText,
    numQuestions,
  }: {
    file?: File;
    base64Data?: string;
    textContent?: string;
    fileName: string;
    fileSizeText?: string;
    numQuestions: 10 | 20 | 30;
  }) => {
    // Save params for easy one-click retry
    setLastGenerateParams({
      file,
      base64Data,
      textContent,
      fileName,
      fileSizeText,
      numQuestions,
    });

    setIsLoading(true);
    setUploadProgress(0);
    setErrorMessage("");
    setFallbackBanner("");
    setLoadingStep("Processing study material...");

    try {
      let data: any;

      if (file) {
        // Strategy 1: For files <= 4 MB (the majority of test papers and notes), use direct single-request upload
        // This avoids chunk roundtrips, proxy 413 limits, and multi-request serverless cache misses
        if (file.size <= 4 * 1024 * 1024) {
          const sizeMb = (file.size / (1024 * 1024)).toFixed(1);
          setUploadProgress(30);
          setLoadingStep(`Uploading "${file.name}" (${sizeMb} MB) & analyzing statistical syllabus...`);

          const formData = new FormData();
          formData.append("file", file);
          formData.append("fileName", file.name);
          formData.append("numQuestions", String(numQuestions));
          if (base64Data) {
            formData.append("base64Data", base64Data);
          }

          setUploadProgress(60);
          setLoadingStep(
            numQuestions === 30
              ? `Formulating 30 MCQs across 3 parallel AI engines (Theory, Formulas & Competitive Benchmarks)...`
              : numQuestions === 20
              ? `Formulating 20 MCQs across dual parallel streams (PDF Concepts + Statistical Benchmark Standards)...`
              : `Formulating 10 high-yield MCQs (Synthesizing PDF and Official Statistical Benchmarks)...`
          );

          const genRes = await fetch("/api/generate-quiz", {
            method: "POST",
            body: formData,
          });

          setUploadProgress(100);
          if (!genRes.ok) {
            const errData = await genRes.json().catch(() => ({}));
            throw new Error(errData?.error || "Failed to generate questions from uploaded PDF.");
          }

          data = await genRes.json();
        } else {
          // Strategy 2: For larger files (> 4 MB), perform fast client-side parsing first
          const sizeMb = (file.size / (1024 * 1024)).toFixed(1);
          setLoadingStep(`Extracting text from high-capacity PDF "${file.name}" (${sizeMb} MB)...`);
          setUploadProgress(25);

          const clientExtracted = await extractTextFromPdfClient(file);

          if (clientExtracted.text && clientExtracted.text.length >= 150) {
            setLoadingStep(
              numQuestions === 30
                ? `Formulating 30 MCQs from extracted chapters (${clientExtracted.pages} pages)...`
                : `Formulating ${numQuestions} MCQs from extracted chapters (${clientExtracted.pages} pages)...`
            );
            setUploadProgress(70);

            const genRes = await fetch("/api/generate-quiz", {
              method: "POST",
              headers: { "Content-Type": "application/json" },
              body: JSON.stringify({
                textContent: clientExtracted.text,
                fileName: file.name,
                numQuestions,
              }),
            });

            setUploadProgress(100);
            if (!genRes.ok) {
              const errData = await genRes.json().catch(() => ({}));
              throw new Error(errData?.error || "Failed to formulate quiz from extracted text.");
            }
            data = await genRes.json();
          } else {
            // Strategy 3: Resilient Chunked Streaming with 2 MB chunks (safely below Vercel's 4.5 MB ceiling)
            const CHUNK_SIZE = 2 * 1024 * 1024;
            const totalChunks = Math.ceil(file.size / CHUNK_SIZE);
            const uploadId = `upl_${Date.now()}_${Math.random().toString(36).slice(2, 9)}`;

            for (let i = 0; i < totalChunks; i++) {
              const start = i * CHUNK_SIZE;
              const end = Math.min(file.size, start + CHUNK_SIZE);
              const chunkBlob = file.slice(start, end);

              const currentPct = Math.round((i / totalChunks) * 80);
              setUploadProgress(currentPct);
              const uploadedMb = (start / (1024 * 1024)).toFixed(1);
              setLoadingStep(`Uploading large PDF: ${currentPct}% (${uploadedMb}/${sizeMb} MB, chunk ${i + 1}/${totalChunks})...`);

              const formData = new FormData();
              formData.append("chunk", chunkBlob, file.name);
              formData.append("uploadId", uploadId);
              formData.append("chunkIndex", String(i));
              formData.append("totalChunks", String(totalChunks));
              formData.append("fileName", file.name);
              formData.append("totalSize", String(file.size));

              let chunkRes: Response | null = null;
              for (let attempt = 0; attempt < 3; attempt++) {
                try {
                  chunkRes = await fetch("/api/upload-chunk", {
                    method: "POST",
                    body: formData,
                  });
                  if (chunkRes.ok) break;
                } catch (netErr) {
                  if (attempt === 2) throw netErr;
                  await new Promise((r) => setTimeout(r, 1000));
                }
              }

              if (!chunkRes || !chunkRes.ok) {
                const errData = await chunkRes?.json().catch(() => ({}));
                throw new Error(errData?.error || `Upload failed on chunk ${i + 1}/${totalChunks}.`);
              }
            }

            setUploadProgress(85);
            setLoadingStep(
              numQuestions === 30
                ? `Formulating 30 MCQs across 3 parallel AI engines (Theory, Formulas & Competitive Benchmarks)...`
                : numQuestions === 20
                ? `Formulating 20 MCQs across dual parallel streams (PDF Concepts + Statistical Benchmark Standards)...`
                : `Formulating 10 high-yield MCQs (Synthesizing PDF and Official Statistical Benchmarks)...`
            );

            const genRes = await fetch("/api/generate-from-upload", {
              method: "POST",
              headers: { "Content-Type": "application/json" },
              body: JSON.stringify({
                uploadId,
                fileName: file.name,
                numQuestions,
                fallbackText: clientExtracted.text || file.name,
              }),
            });

            setUploadProgress(100);
            if (!genRes.ok) {
              const errData = await genRes.json().catch(() => ({}));
              throw new Error(errData?.error || `Failed to generate questions from uploaded document.`);
            }

            data = await genRes.json();
          }
        }
      } else {
        // Direct textContent or sample material
        if (numQuestions === 30) {
          setLoadingStep(`Formulating 30 MCQs across 3 parallel AI engines (Theory, Formulas & Competitive Benchmarks)...`);
        } else if (numQuestions === 20) {
          setLoadingStep(`Formulating 20 MCQs across dual parallel streams (PDF Concepts + Statistical Benchmark Standards)...`);
        } else {
          setLoadingStep(`Formulating 10 high-yield MCQs (Synthesizing PDF and Official Statistical Benchmarks)...`);
        }

        const res = await fetch("/api/generate-quiz", {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            base64Data,
            textContent,
            fileName,
            numQuestions,
          }),
        });

        if (!res.ok) {
          const errorData = await res.json().catch(() => ({}));
          throw new Error(errorData.error || `Server responded with status ${res.status}`);
        }
        data = await res.json();
      }

      if (!data.questions || data.questions.length === 0) {
        throw new Error("No questions could be generated from the provided material.");
      }

      if (data.isFallback) {
        setFallbackBanner(
          data.note || "Curated Question Bank: Loaded from the Official Statistical System syllabus due to temporary AI model demand spike."
        );
      }

      const newQuiz: Quiz = {
        id: data.quizId || `quiz_${Date.now()}`,
        title: fileName,
        fileName,
        fileSize: fileSizeText,
        extractedTextExcerpt: data.excerpt,
        numQuestions: data.questions.length,
        questions: data.questions,
        createdAt: new Date().toISOString(),
      };

      setQuiz(newQuiz);
      setUserAnswers({});
      setIsSubmitted(false);
      setAiFeedback("");
    } catch (err: any) {
      console.error("Failed to generate quiz:", err);
      setErrorMessage(
        err.message || "Failed to generate questions. Please verify your file or retry."
      );
    } finally {
      setIsLoading(false);
      setLoadingStep("");
      setUploadProgress(0);
    }
  };

  // Option selection
  const handleSelectAnswer = (questionId: number, option: OptionKey) => {
    setUserAnswers((prev) => ({
      ...prev,
      [questionId]: option,
    }));
  };

  // Calculate score and topic analysis with strict requested ratings:
  // - Very Good
  // - Good
  // - Average
  // - Need to Improve
  const calculateAnalysis = () => {
    if (!quiz) return { score: 0, percentage: 0, topicAnalyses: [] };

    let correctCount = 0;
    const topicMap: Record<string, { total: number; correct: number }> = {};

    quiz.questions.forEach((q) => {
      const isCorrect = userAnswers[q.id] === q.correctAnswer;
      if (isCorrect) correctCount++;

      const topicName = q.topic?.trim() || "General Statistics";
      if (!topicMap[topicName]) {
        topicMap[topicName] = { total: 0, correct: 0 };
      }
      topicMap[topicName].total += 1;
      if (isCorrect) {
        topicMap[topicName].correct += 1;
      }
    });

    const totalQuestions = quiz.questions.length;
    const percentage = Math.round((correctCount / totalQuestions) * 100);

    const topicAnalyses: TopicAnalysis[] = Object.entries(topicMap).map(
      ([topic, stat]) => {
        const pct = Math.round((stat.correct / stat.total) * 100);
        let rating: TopicRating;

        if (pct >= 80) {
          rating = "Very Good";
        } else if (pct >= 60) {
          rating = "Good";
        } else if (pct >= 40) {
          rating = "Average";
        } else {
          rating = "Need to Improve";
        }

        return {
          topic,
          totalQuestions: stat.total,
          correctQuestions: stat.correct,
          percentage: pct,
          rating,
        };
      }
    );

    // Sort: topics needing improvement first or by name
    topicAnalyses.sort((a, b) => a.percentage - b.percentage);

    return {
      score: correctCount,
      percentage,
      topicAnalyses,
    };
  };

  // Submit test and fetch AI diagnostic feedback
  const handleSubmitTest = async () => {
    setIsSubmitted(true);
    window.scrollTo({ top: 0, behavior: "smooth" });

    const { score, percentage, topicAnalyses } = calculateAnalysis();

    // Call server for custom AI diagnostic feedback
    setIsLoadingAiFeedback(true);
    try {
      const res = await fetch("/api/analyze-feedback", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          topicAnalyses,
          score,
          totalQuestions: quiz?.questions.length || 0,
          percentage,
        }),
      });
      if (res.ok) {
        const data = await res.json();
        setAiFeedback(data.feedback);
      }
    } catch (e) {
      console.warn("AI feedback fallback:", e);
    } finally {
      setIsLoadingAiFeedback(false);
    }
  };

  // Retake same quiz
  const handleRetake = () => {
    setUserAnswers({});
    setIsSubmitted(false);
    setAiFeedback("");
    window.scrollTo({ top: 0, behavior: "smooth" });
  };

  // Start completely new quiz
  const handleReset = () => {
    setQuiz(null);
    setUserAnswers({});
    setIsSubmitted(false);
    setAiFeedback("");
    setErrorMessage("");
    window.scrollTo({ top: 0, behavior: "smooth" });
  };

  const handleScrollToReview = () => {
    reviewSectionRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  const { score, percentage, topicAnalyses } = calculateAnalysis();

  return (
    <div id="mithra-app-root" className="min-h-screen bg-slate-50 flex flex-col">
      {/* Top Mobile Navbar */}
      <div className="lg:hidden bg-white border-b border-slate-200 px-4 py-3 flex items-center justify-between shadow-xs sticky top-0 z-30">
        <button
          onClick={() => setIsSidebarOpen(true)}
          className="p-2 rounded-xl hover:bg-slate-100 text-slate-700 cursor-pointer"
        >
          <Menu className="w-6 h-6" />
        </button>
        <span className="font-bold text-slate-900 text-base tracking-tight">
          Mithra.ai
        </span>
        <button
          onClick={() => setIsCodeModalOpen(true)}
          className="text-xs font-semibold px-2.5 py-1 rounded-lg bg-violet-50 border border-violet-200 text-violet-700 cursor-pointer"
        >
          Streamlit
        </button>
      </div>

      <div className="flex-1 flex w-full">
        {/* Streamlit-Style Sidebar */}
        <Sidebar
          isOpen={isSidebarOpen}
          onClose={() => setIsSidebarOpen(false)}
          onLoadSample={() => {
            setIsSidebarOpen(false);
            handleGenerateQuiz({
              textContent: SAMPLE_STATISTICAL_MATERIAL.content,
              fileName: SAMPLE_STATISTICAL_MATERIAL.fileName,
              fileSizeText: SAMPLE_STATISTICAL_MATERIAL.fileSizeText,
              numQuestions: 10,
            });
          }}
          onReset={handleReset}
          onOpenCode={() => setIsCodeModalOpen(true)}
          hasQuiz={Boolean(quiz)}
          questionCount={quiz?.questions.length}
          currentScore={isSubmitted ? score : null}
        />

        {/* Main Content Area */}
        <main className="flex-1 max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-6 md:py-8 w-full">
          {/* Header Component */}
          <Header
            onOpenCodeModal={() => setIsCodeModalOpen(true)}
            onResetQuiz={quiz ? handleReset : undefined}
            hasActiveQuiz={Boolean(quiz)}
            activeFileName={quiz?.fileName}
            onOpenSidebar={() => setIsSidebarOpen(true)}
          />

          {/* Error Banner with 1-click retry */}
          {errorMessage && (
            <div className="mb-6 p-4 rounded-2xl bg-rose-50 border border-rose-200 text-rose-800 text-xs md:text-sm flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 shadow-xs">
              <div className="flex items-start gap-3">
                <AlertCircle className="w-5 h-5 shrink-0 text-rose-600 mt-0.5" />
                <div className="space-y-1">
                  <div className="font-bold text-rose-900">Quiz Generation Notice</div>
                  <div className="text-rose-700 leading-relaxed">{errorMessage}</div>
                </div>
              </div>

              {lastGenerateParams && (
                <button
                  type="button"
                  onClick={() => handleGenerateQuiz(lastGenerateParams)}
                  disabled={isLoading}
                  className="inline-flex items-center gap-2 px-4 py-2 rounded-xl bg-rose-600 hover:bg-rose-700 text-white font-semibold text-xs transition-colors shadow-xs shrink-0 cursor-pointer self-end sm:self-auto"
                >
                  <RefreshCw className={`w-3.5 h-3.5 ${isLoading ? "animate-spin" : ""}`} />
                  <span>Retry Generation</span>
                </button>
              )}
            </div>
          )}

          {/* Fallback Notice Banner if offline curriculum bank was used */}
          {fallbackBanner && (
            <div className="mb-6 p-4 rounded-2xl bg-violet-50 border border-violet-200 text-violet-900 text-xs md:text-sm flex items-start justify-between gap-3 shadow-xs">
              <div className="flex items-start gap-3">
                <Info className="w-5 h-5 shrink-0 text-violet-600 mt-0.5" />
                <div className="space-y-1">
                  <div className="font-bold text-violet-950">Curated Statistical Question Bank Activated</div>
                  <div className="text-violet-700 leading-relaxed">{fallbackBanner}</div>
                </div>
              </div>
              <button
                type="button"
                onClick={() => setFallbackBanner("")}
                className="p-1 rounded-lg text-violet-400 hover:text-violet-700 hover:bg-violet-100 transition-colors"
                title="Dismiss"
              >
                <X className="w-4 h-4" />
              </button>
            </div>
          )}

          {/* VIEW 1: PDF UPLOADER (When no quiz is generated yet) */}
          {!quiz && (
            <PdfUploader
              onGenerateQuiz={handleGenerateQuiz}
              isLoading={isLoading}
              loadingStep={loadingStep}
              uploadProgress={uploadProgress}
            />
          )}

          {/* VIEW 2: ACTIVE EXAMINATION INTERFACE */}
          {quiz && !isSubmitted && (
            <TestInterface
              questions={quiz.questions}
              fileName={quiz.fileName}
              userAnswers={userAnswers}
              onSelectAnswer={handleSelectAnswer}
              onSubmitTest={handleSubmitTest}
            />
          )}

          {/* VIEW 3: RESULTS & AI COMPETENCY ANALYSIS */}
          {quiz && isSubmitted && (
            <div className="space-y-8">
              {/* Test Score Summary & AI Competency Analysis Grid */}
              <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-stretch">
                <div className="lg:col-span-4 flex flex-col">
                  <ScoreReport
                    score={score}
                    totalQuestions={quiz.questions.length}
                    percentage={percentage}
                    onRetake={handleRetake}
                    onNewQuiz={handleReset}
                    onScrollToReview={handleScrollToReview}
                  />
                </div>

                <div className="lg:col-span-8 flex flex-col">
                  <AiCompetencyAnalyzer
                    topicAnalyses={topicAnalyses}
                    aiFeedback={aiFeedback}
                    isLoadingAiFeedback={isLoadingAiFeedback}
                  />
                </div>
              </div>

              {/* Detailed Question Review Accordion */}
              <div ref={reviewSectionRef}>
                <QuestionReview
                  questions={quiz.questions}
                  userAnswers={userAnswers}
                />
              </div>
            </div>
          )}
        </main>
      </div>

      {/* FOOTER (Bottom of every page per prompt requirement) */}
      <footer
        id="mithra-footer"
        className="w-full py-6 mt-12 border-t border-slate-200 bg-white text-center text-xs md:text-sm font-medium text-slate-500"
      >
        <div className="max-w-5xl mx-auto px-4 flex flex-col sm:flex-row items-center justify-between gap-2">
          <span>Mithra.ai • Official Statistical System Learning Assistant</span>
          <span className="text-violet-600 font-semibold">Powered by Mithra.ai</span>
        </div>
      </footer>

      {/* Streamlit Python Code Modal */}
      <StreamlitCodeModal
        isOpen={isCodeModalOpen}
        onClose={() => setIsCodeModalOpen(false)}
      />

      {/* Professional AI Chatbot "Mithra" with Floating Owl Button */}
      <MithraChatbot />
    </div>
  );
}
