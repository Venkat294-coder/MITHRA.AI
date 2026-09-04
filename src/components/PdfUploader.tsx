import React, { useState, useRef } from "react";
import {
  UploadCloud,
  FileCheck,
  AlertCircle,
  Sparkles,
  BookOpen,
  Loader2,
  FileText,
  CheckCircle2,
  X,
  FileWarning,
} from "lucide-react";
import { SAMPLE_STATISTICAL_MATERIAL } from "../data/sampleMaterial";

interface PdfUploaderProps {
  onGenerateQuiz: (params: {
    file?: File;
    base64Data?: string;
    textContent?: string;
    fileName: string;
    fileSizeText?: string;
    numQuestions: 10 | 20 | 30;
  }) => Promise<void>;
  isLoading: boolean;
  loadingStep: string;
  uploadProgress?: number;
}

export const PdfUploader: React.FC<PdfUploaderProps> = ({
  onGenerateQuiz,
  isLoading,
  loadingStep,
  uploadProgress = 0,
}) => {
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [base64Content, setBase64Content] = useState<string>("");
  const [isSampleLoaded, setIsSampleLoaded] = useState<boolean>(false);
  const [errorMessage, setErrorMessage] = useState<string>("");
  const [isDragging, setIsDragging] = useState<boolean>(false);
  const [extractedPreview, setExtractedPreview] = useState<string>("");
  const [selectedCount, setSelectedCount] = useState<10 | 20 | 30>(10);
  const fileInputRef = useRef<HTMLInputElement>(null);

  // Validate and handle file
  const handleFile = (file: File) => {
    setErrorMessage("");
    setIsSampleLoaded(false);

    // Strict PDF check
    const isPdf =
      file.type === "application/pdf" ||
      file.name.toLowerCase().endsWith(".pdf");

    if (!isPdf) {
      setErrorMessage("Invalid file format. Please upload a PDF file only (.pdf).");
      return;
    }

    // Support up to 650 MB files (high-capacity census reports, textbooks, research papers)
    const MAX_SIZE_BYTES = 650 * 1024 * 1024;
    if (file.size > MAX_SIZE_BYTES) {
      setErrorMessage("File exceeds 650 MB limit. Please upload a document under 650 MB.");
      return;
    }

    setSelectedFile(file);

    const sizeFormatted =
      file.size > 1024 * 1024
        ? `${(file.size / (1024 * 1024)).toFixed(1)} MB`
        : `${(file.size / 1024).toFixed(1)} KB`;

    // If file is smaller than 25MB, optionally read as base64 for fallback
    if (file.size <= 25 * 1024 * 1024) {
      const reader = new FileReader();
      reader.onload = () => {
        const result = reader.result as string;
        setBase64Content(result);
        setExtractedPreview(`PDF loaded: "${file.name}" (${sizeFormatted}). Ready for Gemini MCQ generation.`);
      };
      reader.onerror = () => {
        setErrorMessage("Failed to read the uploaded file. Please try again.");
      };
      reader.readAsDataURL(file);
    } else {
      // For large files (25MB to 650MB), avoid loading huge base64 in browser memory
      setBase64Content("");
      setExtractedPreview(
        `High-Capacity PDF loaded: "${file.name}" (${sizeFormatted}). Enabled with chunked streaming pipeline for large statistical volumes.`
      );
    }
  };

  const handleDrop = (e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    setIsDragging(false);
    if (e.dataTransfer.files && e.dataTransfer.files.length > 0) {
      handleFile(e.dataTransfer.files[0]);
    }
  };

  const handleDragOver = (e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    setIsDragging(true);
  };

  const handleDragLeave = () => {
    setIsDragging(false);
  };

  const handleLoadSample = () => {
    setSelectedFile(null);
    setBase64Content("");
    setIsSampleLoaded(true);
    setErrorMessage("");
    setExtractedPreview(SAMPLE_STATISTICAL_MATERIAL.content.slice(0, 320) + "...");
  };

  const handleClearSelection = () => {
    setSelectedFile(null);
    setBase64Content("");
    setIsSampleLoaded(false);
    setExtractedPreview("");
    setErrorMessage("");
    if (fileInputRef.current) {
      fileInputRef.current.value = "";
    }
  };

  const triggerGenerate = (count: 10 | 20 | 30) => {
    setSelectedCount(count);
    if (isSampleLoaded) {
      onGenerateQuiz({
        textContent: SAMPLE_STATISTICAL_MATERIAL.content,
        fileName: SAMPLE_STATISTICAL_MATERIAL.fileName,
        fileSizeText: SAMPLE_STATISTICAL_MATERIAL.fileSizeText,
        numQuestions: count,
      });
    } else if (selectedFile) {
      const formattedSize =
        selectedFile.size > 1024 * 1024
          ? `${(selectedFile.size / (1024 * 1024)).toFixed(1)} MB`
          : `${(selectedFile.size / 1024).toFixed(1)} KB`;

      onGenerateQuiz({
        file: selectedFile,
        base64Data: base64Content || undefined,
        fileName: selectedFile.name,
        fileSizeText: formattedSize,
        numQuestions: count,
      });
    } else {
      setErrorMessage("Please upload a PDF file or choose sample material first.");
    }
  };

  const hasMaterial = Boolean(selectedFile || isSampleLoaded);

  return (
    <div id="pdf-uploader-section" className="space-y-6">
      {/* Upload Box Card */}
      <div className="bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden p-6 md:p-8">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-slate-200">
          <div>
            <h2 className="text-xl font-bold text-slate-800 flex items-center gap-2">
              <UploadCloud className="w-6 h-6 text-violet-600" />
              <span>Step 1: Upload PDF Study Material</span>
            </h2>
            <p className="text-sm text-slate-500 mt-1">
              Upload your syllabus, lecture notes, textbook chapters, or statistical reports (PDF only).
            </p>
          </div>

          <button
            id="btn-use-sample-material"
            type="button"
            onClick={handleLoadSample}
            disabled={isLoading}
            className="inline-flex items-center gap-2 px-3.5 py-2 rounded-xl text-xs font-semibold text-violet-700 bg-violet-50 hover:bg-violet-100 border border-violet-200 transition-colors self-start sm:self-auto cursor-pointer"
          >
            <BookOpen className="w-4 h-4 text-violet-600" />
            <span>Try Sample Statistical Material</span>
          </button>
        </div>

        {/* Dropzone */}
        {!hasMaterial ? (
          <div
            id="pdf-dropzone"
            onDrop={handleDrop}
            onDragOver={handleDragOver}
            onDragLeave={handleDragLeave}
            onClick={() => fileInputRef.current?.click()}
            className={`mt-6 border-2 border-dashed rounded-2xl p-8 md:p-12 text-center transition-all cursor-pointer ${
              isDragging
                ? "border-violet-600 bg-violet-50/60 scale-[1.01]"
                : "border-slate-200 hover:border-violet-600 hover:bg-violet-50/20 bg-slate-50/50"
            }`}
          >
            <input
              ref={fileInputRef}
              type="file"
              accept=".pdf,application/pdf"
              className="hidden"
              onChange={(e) => {
                if (e.target.files && e.target.files.length > 0) {
                  handleFile(e.target.files[0]);
                }
              }}
            />

            <div className="w-16 h-16 mx-auto rounded-2xl bg-violet-50 border border-violet-100 flex items-center justify-center text-violet-600 mb-4 shadow-xs">
              <UploadCloud className="w-8 h-8" />
            </div>

            <p className="text-base font-semibold text-slate-800">
              Drag & Drop your PDF document here
            </p>
            <p className="text-sm text-slate-500 mt-1">
              or <span className="text-violet-600 font-semibold underline underline-offset-2">browse your device</span>
            </p>
            <div className="mt-4 inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-slate-100 border border-slate-200 text-xs font-medium text-slate-600">
              <FileText className="w-3.5 h-3.5 text-violet-600" />
              <span>Accepted format: Only PDF (.pdf) • Up to 650 MB (Textbooks, Census Volumes & Reports)</span>
            </div>
          </div>
        ) : (
          /* Uploaded File Confirmation Card */
          <div className="mt-6 p-5 rounded-2xl bg-slate-50 border border-slate-200 shadow-xs">
            <div className="flex items-start justify-between gap-4">
              <div className="flex items-start gap-3.5">
                <div className="w-12 h-12 rounded-xl bg-violet-600 text-white flex items-center justify-center shrink-0 shadow-sm">
                  <FileCheck className="w-6 h-6" />
                </div>
                <div>
                  <div className="flex items-center gap-2 flex-wrap">
                    <span className="font-bold text-slate-800 text-base">
                      {isSampleLoaded
                        ? SAMPLE_STATISTICAL_MATERIAL.fileName
                        : selectedFile?.name}
                    </span>
                    <span className="px-2.5 py-0.5 rounded-full bg-emerald-100 text-emerald-700 text-[11px] font-bold">
                      {selectedFile && selectedFile.size > 25 * 1024 * 1024
                        ? "PDF Ready (High-Capacity)"
                        : "PDF Ready"}
                    </span>
                  </div>
                  <p className="text-xs text-slate-500 mt-0.5">
                    {isSampleLoaded
                      ? SAMPLE_STATISTICAL_MATERIAL.fileSizeText
                      : selectedFile && selectedFile.size > 1024 * 1024
                      ? `${(selectedFile.size / (1024 * 1024)).toFixed(1)} MB`
                      : `${((selectedFile?.size || 0) / 1024).toFixed(1)} KB`}
                    {" • "}Extracted text ready for Gemini AI quiz synthesis
                  </p>
                  {extractedPreview && (
                    <div className="mt-3 p-3 rounded-xl bg-white border border-slate-200 text-xs text-slate-600 font-mono line-clamp-2">
                      {extractedPreview}
                    </div>
                  )}
                </div>
              </div>

              {!isLoading && (
                <button
                  id="btn-remove-uploaded-file"
                  type="button"
                  onClick={handleClearSelection}
                  className="p-1.5 rounded-lg text-slate-400 hover:text-rose-600 hover:bg-rose-50 transition-colors cursor-pointer"
                  title="Remove and select another file"
                >
                  <X className="w-5 h-5" />
                </button>
              )}
            </div>
          </div>
        )}

        {/* Error message box */}
        {errorMessage && (
          <div className="mt-4 p-3.5 rounded-xl bg-rose-50 border border-rose-200 text-rose-800 text-xs md:text-sm flex items-center gap-2.5">
            <AlertCircle className="w-4 h-4 shrink-0 text-rose-600" />
            <span>{errorMessage}</span>
          </div>
        )}

        {/* Step 2: Three Action Buttons (Generate 10, 20, 30 Questions) */}
        {hasMaterial && (
          <div className="mt-8 pt-6 border-t border-slate-200">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 mb-4">
              <div>
                <h3 className="text-lg font-bold text-slate-800 flex items-center gap-2">
                  <Sparkles className="w-5 h-5 text-amber-500" />
                  <span>Step 2: Choose Question Count to Generate</span>
                </h3>
                <p className="text-xs md:text-sm text-slate-500 mt-0.5">
                  Synthesizes high-yield questions from your PDF and standard Official Statistical benchmarks (UPSC ISS & MoSPI standards) to test true competency, not just verbatim recall.
                </p>
              </div>

              <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-emerald-50 border border-emerald-200 text-[11px] font-bold text-emerald-700 self-start sm:self-auto">
                <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
                <span>Accelerated Parallel Engine (&lt; 30s)</span>
              </div>
            </div>

            {/* Three Buttons */}
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
              <button
                id="btn-generate-10-questions"
                type="button"
                disabled={isLoading}
                onClick={() => triggerGenerate(10)}
                className={`relative group p-5 rounded-2xl text-left border transition-all duration-200 cursor-pointer ${
                  isLoading && selectedCount === 10
                    ? "bg-violet-900 text-white border-violet-900 shadow-md ring-2 ring-violet-300"
                    : "bg-white hover:bg-violet-50/20 border-slate-200 hover:border-violet-500 hover:shadow-sm"
                }`}
              >
                <div className="flex items-center justify-between mb-2">
                  <span
                    className={`w-9 h-9 rounded-xl flex items-center justify-center font-bold text-sm transition-colors ${
                      isLoading && selectedCount === 10
                        ? "bg-violet-800 text-white"
                        : "bg-violet-50 text-violet-700 group-hover:bg-violet-600 group-hover:text-white"
                    }`}
                  >
                    10
                  </span>
                  <span
                    className={`text-[11px] font-semibold ${
                      isLoading && selectedCount === 10
                        ? "text-violet-200"
                        : "text-slate-400 group-hover:text-violet-600"
                    }`}
                  >
                    ~10 sec
                  </span>
                </div>
                <div
                  className={`font-bold text-base ${
                    isLoading && selectedCount === 10
                      ? "text-white"
                      : "text-slate-800 group-hover:text-violet-700"
                  }`}
                >
                  Generate 10 Questions
                </div>
                <div
                  className={`text-xs mt-1 ${
                    isLoading && selectedCount === 10
                      ? "text-violet-200"
                      : "text-slate-500"
                  }`}
                >
                  Rapid concept review & benchmark fundamentals.
                </div>
              </button>

              <button
                id="btn-generate-20-questions"
                type="button"
                disabled={isLoading}
                onClick={() => triggerGenerate(20)}
                className={`relative group p-5 rounded-2xl text-left border transition-all duration-200 cursor-pointer ${
                  isLoading && selectedCount === 20
                    ? "bg-violet-900 text-white border-violet-900 shadow-md ring-2 ring-violet-300"
                    : "bg-white hover:bg-violet-50/20 border-slate-200 hover:border-violet-500 hover:shadow-sm"
                }`}
              >
                <div className="flex items-center justify-between mb-2">
                  <span
                    className={`w-9 h-9 rounded-xl flex items-center justify-center font-bold text-sm transition-colors ${
                      isLoading && selectedCount === 20
                        ? "bg-violet-800 text-white"
                        : "bg-violet-50 text-violet-700 group-hover:bg-violet-600 group-hover:text-white"
                    }`}
                  >
                    20
                  </span>
                  <span
                    className={`text-[11px] font-semibold ${
                      isLoading && selectedCount === 20
                        ? "text-violet-200"
                        : "text-slate-400 group-hover:text-violet-600"
                    }`}
                  >
                    Parallel • ~15-20 sec
                  </span>
                </div>
                <div
                  className={`font-bold text-base ${
                    isLoading && selectedCount === 20
                      ? "text-white"
                      : "text-slate-800 group-hover:text-violet-700"
                  }`}
                >
                  Generate 20 Questions
                </div>
                <div
                  className={`text-xs mt-1 ${
                    isLoading && selectedCount === 20
                      ? "text-violet-200"
                      : "text-slate-500"
                  }`}
                >
                  Dual-stream generation: Theory + Numerical derivations.
                </div>
              </button>

              <button
                id="btn-generate-30-questions"
                type="button"
                disabled={isLoading}
                onClick={() => triggerGenerate(30)}
                className={`relative group p-5 rounded-2xl text-left border transition-all duration-200 cursor-pointer ${
                  isLoading && selectedCount === 30
                    ? "bg-violet-900 text-white border-violet-900 shadow-md ring-2 ring-violet-300"
                    : "bg-white hover:bg-violet-50/20 border-slate-200 hover:border-violet-500 hover:shadow-sm"
                }`}
              >
                <div className="flex items-center justify-between mb-2">
                  <span
                    className={`w-9 h-9 rounded-xl flex items-center justify-center font-bold text-sm transition-colors ${
                      isLoading && selectedCount === 30
                        ? "bg-violet-800 text-white"
                        : "bg-violet-50 text-violet-700 group-hover:bg-violet-600 group-hover:text-white"
                    }`}
                  >
                    30
                  </span>
                  <span
                    className={`text-[11px] font-semibold ${
                      isLoading && selectedCount === 30
                        ? "text-violet-200"
                        : "text-slate-400 group-hover:text-violet-600"
                    }`}
                  >
                    Triple Engine • ~20-25 sec
                  </span>
                </div>
                <div
                  className={`font-bold text-base ${
                    isLoading && selectedCount === 30
                      ? "text-white"
                      : "text-slate-800 group-hover:text-violet-700"
                  }`}
                >
                  Generate 30 Questions
                </div>
                <div
                  className={`text-xs mt-1 ${
                    isLoading && selectedCount === 30
                      ? "text-violet-200"
                      : "text-slate-500"
                  }`}
                >
                  Full competitive depth: Theory + Math + UPSC ISS scenarios.
                </div>
              </button>
            </div>

            {/* Animated Loading Feedback */}
            {isLoading && (
              <div className="mt-6 p-6 rounded-2xl bg-violet-50/70 border border-violet-200 shadow-xs text-center">
                <div className="inline-flex items-center justify-center w-12 h-12 rounded-full bg-white shadow-sm text-violet-600 mb-3 animate-spin">
                  <Loader2 className="w-6 h-6" />
                </div>
                <h4 className="text-base font-bold text-slate-800">
                  {loadingStep || "Synthesizing High-Quality MCQs with Gemini AI..."}
                </h4>
                <p className="text-xs text-slate-500 mt-1 max-w-md mx-auto">
                  Mithra.ai is reading your PDF, parsing statistical concepts, formulating plausible distractors, and generating comprehensive explanations.
                </p>

                {uploadProgress > 0 && uploadProgress < 100 ? (
                  <div className="w-64 max-w-full mx-auto mt-4">
                    <div className="flex justify-between text-xs text-slate-600 font-semibold mb-1.5">
                      <span>Uploading PDF</span>
                      <span>{uploadProgress}%</span>
                    </div>
                    <div className="w-full h-2 bg-slate-200 rounded-full overflow-hidden shadow-inner">
                      <div
                        className="h-full bg-violet-600 rounded-full transition-all duration-300 ease-out"
                        style={{ width: `${uploadProgress}%` }}
                      />
                    </div>
                  </div>
                ) : (
                  <div className="w-48 h-1.5 bg-slate-200 rounded-full mx-auto mt-4 overflow-hidden">
                    <div className="w-full h-full bg-violet-600 animate-pulse" />
                  </div>
                )}
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
};
