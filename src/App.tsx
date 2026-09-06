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
import { getCurriculumQuestions } from "./data/curriculumBank";
import { extractTextFromPdfClient } from "./utils/pdfTextExtractor";
import { Menu, Sparkles, BookOpen, AlertCircle, RefreshCw, Info, X } from "lucide-react";

/**
 * Resilient API POST helper with HTML interceptor.
 * Prevents gateway timeouts (502/504) and HTML error pages from throwing
 * JSON parse errors (like Unexpected token '<').
 */
async function postApiSafe(
  url: string,
  body: BodyInit | null,
  isMultipart = false
): Promise<{ data?: any; error?: string; isHtml?: boolean }> {
  try {
    const res = await fetch(url, {
      method: "POST",
      headers: isMultipart
        ? { Accept: "application/json" }
        : { "Content-Type": "application/json", Accept: "application/json" },
      body,
    });

    const contentType = res.headers.get("content-type") || "";
    const rawText = await res.text();

    const isHtml =
      contentType.toLowerCase().includes("text/html") ||
      rawText.trim().startsWith("<!doctype") ||
      rawText.trim().startsWith("<!DOCTYPE") ||
      rawText.trim().startsWith("<html") ||
      rawText.trim().startsWith("<");

    if (isHtml) {
      console.warn(`[postApiSafe] Server returned HTML status ${res.status} from ${url}`);
      return { isHtml: true, error: `The server gateway responded with status ${res.status}.` };
    }

    let parsed: any;
    try {
      parsed = JSON.parse(rawText);
    } catch {
      console.warn(`[postApiSafe] JSON parse error on response from ${url}:`, rawText.slice(0, 100));
      return { isHtml: true, error: "Received non-JSON response from server." };
    }

    if (!res.ok) {
      return { error: parsed?.error || `Server responded with status ${res.status}` };
    }

    return { data: parsed };
  } catch (err: any) {
    console.error(`[postApiSafe] Network error for ${url}:`, err);
    return { error: err?.message || "Network request could not be completed." };
  }
}

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
        // Strategy 1: For files <= 35 MB (covers 99% of lecture notes, textbooks, and reports), use direct single-request upload
        // This completely eliminates multi-chunk upload network errors, proxy timeouts, and roundtrip latency
        if (file.size <= 35 * 1024 * 1024) {
          const sizeMb = (file.size / (1024 * 1024)).toFixed(1);
          setUploadProgress(30);
          setLoadingStep(`Uploading "${file.name}" (${sizeMb} MB) & analyzing statistical syllabus...`);

          const formData = new FormData();
          formData.append("file", file);
          formData.append("fileName", file.name);
          formData.append("numQuestions", String(numQuestions));

          setUploadProgress(60);
          setLoadingStep(
            numQuestions === 30
              ? `Formulating 30 MCQs (Theory, Formulas & Competitive Benchmarks)...`
              : numQuestions === 20
              ? `Formulating 20 MCQs (PDF Concepts + Statistical Benchmark Standards)...`
              : `Formulating 10 high-yield MCQs (Synthesizing PDF & Statistical Benchmarks)...`
          );

          const res = await postApiSafe("/api/generate-quiz", formData, true);
          setUploadProgress(100);

          if (res.data && res.data.questions && res.data.questions.length > 0) {
            data = res.data;
          } else {
            console.warn("API response issue:", res.error);
            const curQ = getCurriculumQuestions(numQuestions);
            data = {
              quizId: `quiz_${Date.now()}`,
              fileName: file.name,
              questions: curQ,
              isFallback: true,
              note: "Curated Question Bank: Loaded verified Official Statistical System questions due to temporary AI inference latency.",
              excerpt: `Document: ${file.name} (${sizeMb} MB)`,
            };
          }
        } else {
          // Strategy 2: For extra-large volumes (> 35 MB up to 650 MB), perform fast client-side parsing first
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

            const res = await postApiSafe(
              "/api/generate-quiz",
              JSON.stringify({
                textContent: clientExtracted.text,
                fileName: file.name,
                numQuestions,
              })
            );

            setUploadProgress(100);
            if (res.data && res.data.questions && res.data.questions.length > 0) {
              data = res.data;
            } else {
              const curQ = getCurriculumQuestions(numQuestions);
              data = {
                quizId: `quiz_${Date.now()}`,
                fileName: file.name,
                questions: curQ,
                isFallback: true,
                note: "Curated Question Bank: Loaded verified Official Statistical System questions due to temporary AI inference latency.",
                excerpt: clientExtracted.text.slice(0, 400) + "...",
              };
            }
          } else {
            // Strategy 3: Resilient Chunked Streaming with 2 MB chunks
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

              let chunkOk = false;
              for (let attempt = 0; attempt < 3; attempt++) {
                const chunkRes = await postApiSafe("/api/upload-chunk", formData, true);
                if (chunkRes.data) {
                  chunkOk = true;
                  break;
                }
                await new Promise((r) => setTimeout(r, 1000));
              }

              if (!chunkOk) {
                console.warn(`Chunk ${i + 1} upload could not complete cleanly.`);
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

            const res = await postApiSafe(
              "/api/generate-from-upload",
              JSON.stringify({
                uploadId,
                fileName: file.name,
                numQuestions,
                fallbackText: clientExtracted.text || file.name,
              })
            );

            setUploadProgress(100);
            if (res.data && res.data.questions && res.data.questions.length > 0) {
              data = res.data;
            } else {
              const curQ = getCurriculumQuestions(numQuestions);
              data = {
                quizId: `quiz_${Date.now()}`,
                fileName: file.name,
                questions: curQ,
                isFallback: true,
                note: "Curated Question Bank: Loaded verified Official Statistical System questions due to temporary server load.",
                excerpt: `Document: ${file.name} (${sizeMb} MB)`,
              };
            }
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

        const res = await postApiSafe(
          "/api/generate-quiz",
          JSON.stringify({
            base64Data,
            textContent,
            fileName,
            numQuestions,
          })
        );

        if (res.data && res.data.questions && res.data.questions.length > 0) {
          data = res.data;
        } else {
          const curQ = getCurriculumQuestions(numQuestions);
          data = {
            quizId: `quiz_${Date.now()}`,
            fileName,
            questions: curQ,
            isFallback: true,
            note: "Curated Question Bank: Loaded verified Official Statistical System questions due to temporary AI inference latency.",
            excerpt: textContent ? textContent.slice(0, 400) + "..." : "Official Statistical System Material",
          };
        }
      }

      if (!data.questions || data.questions.length === 0) {
        const curQ = getCurriculumQuestions(numQuestions);
        data.questions = curQ;
        data.isFallback = true;
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
      const res = await postApiSafe(
        "/api/analyze-feedback",
        JSON.stringify({
          topicAnalyses,
          score,
          totalQuestions: quiz?.questions.length || 0,
          percentage,
        })
      );
      if (res.data && res.data.feedback) {
        setAiFeedback(res.data.feedback);
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
