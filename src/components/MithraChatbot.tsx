import React, { useState, useRef, useEffect } from "react";
import Markdown from "react-markdown";
import remarkMath from "remark-math";
import rehypeKatex from "rehype-katex";
import {
  X,
  Send,
  Plus,
  RotateCcw,
  Sparkles,
  Paperclip,
  Image as ImageIcon,
  FileText,
  Copy,
  Check,
  ChevronDown,
  Bot,
  User,
  HelpCircle,
  BookOpen,
  ArrowRight,
  Maximize2,
  Minimize2,
} from "lucide-react";
import { MithraOwlLogo } from "./MithraOwlLogo";
import { FormattedMathContent } from "./MathRenderer";

export interface ChatMessage {
  id: string;
  role: "user" | "model";
  text: string;
  timestamp: string;
  attachment?: {
    name: string;
    type: string;
    size: number;
    previewUrl?: string; // For images
    base64: string;
  };
}

interface MithraChatbotProps {
  // Optional initial open state or custom callback if needed
  initialOpen?: boolean;
}

const STARTER_PROMPTS = [
  {
    icon: "🏛️",
    title: "MoSPI & NSO Structure",
    prompt: "Can you explain the structure of MoSPI, NSO, and CSO in very simple, easy-to-understand words?",
  },
  {
    icon: "🎯",
    title: "iGOT Karmayogi Platform",
    prompt: "What is iGOT Karmayogi, how does it help civil servants, and what are competency gaps? Explain simply with an example.",
  },
  {
    icon: "📊",
    title: "Sample Variance vs Standard Error",
    prompt: "Can you explain the difference between Sample Variance and Standard Error using a simple real-life everyday example?",
  },
  {
    icon: "🛒",
    title: "How CPI & Inflation Work",
    prompt: "How is the Consumer Price Index (CPI) calculated in India, and what does inflation mean for an everyday person?",
  },
];

export const MithraChatbot: React.FC<MithraChatbotProps> = ({ initialOpen = false }) => {
  const [isOpen, setIsOpen] = useState<boolean>(initialOpen);
  const [isExpanded, setIsExpanded] = useState<boolean>(false);
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [inputText, setInputText] = useState<string>("");
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [selectedFile, setSelectedFile] = useState<{
    file: File;
    name: string;
    type: string;
    size: number;
    previewUrl?: string;
    base64: string;
  } | null>(null);
  const [copiedMessageId, setCopiedMessageId] = useState<string | null>(null);
  const [hasNewResponse, setHasNewResponse] = useState<boolean>(false);

  const messagesEndRef = useRef<HTMLDivElement>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const inputRef = useRef<HTMLTextAreaElement>(null);

  // Auto-scroll to bottom when new messages arrive
  useEffect(() => {
    if (isOpen) {
      messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
    }
  }, [messages, isLoading, isOpen]);

  // Focus input when opened
  useEffect(() => {
    if (isOpen) {
      setHasNewResponse(false);
      setTimeout(() => {
        inputRef.current?.focus();
      }, 200);
    }
  }, [isOpen]);

  // Handle file selection via Plus button with automatic image compression
  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (file.size > 20 * 1024 * 1024) {
      alert("Please select a file smaller than 20 MB.");
      return;
    }

    const isImage = file.type.startsWith("image/");

    if (isImage) {
      const reader = new FileReader();
      reader.onload = () => {
        const rawBase64 = reader.result as string;
        const img = new Image();
        img.onload = () => {
          const MAX_DIM = 1280;
          let width = img.width;
          let height = img.height;
          if (width > MAX_DIM || height > MAX_DIM) {
            if (width > height) {
              height = Math.round((height * MAX_DIM) / width);
              width = MAX_DIM;
            } else {
              width = Math.round((width * MAX_DIM) / height);
              height = MAX_DIM;
            }
          }
          const canvas = document.createElement("canvas");
          canvas.width = width;
          canvas.height = height;
          const ctx = canvas.getContext("2d");
          if (ctx) {
            ctx.drawImage(img, 0, 0, width, height);
            const compressedBase64 = canvas.toDataURL("image/jpeg", 0.85);
            setSelectedFile({
              file,
              name: file.name,
              type: "image/jpeg",
              size: Math.round((compressedBase64.length * 3) / 4),
              previewUrl: compressedBase64,
              base64: compressedBase64,
            });
          } else {
            setSelectedFile({
              file,
              name: file.name,
              type: file.type,
              size: file.size,
              previewUrl: rawBase64,
              base64: rawBase64,
            });
          }
        };
        img.onerror = () => {
          setSelectedFile({
            file,
            name: file.name,
            type: file.type,
            size: file.size,
            previewUrl: rawBase64,
            base64: rawBase64,
          });
        };
        img.src = rawBase64;
      };
      reader.readAsDataURL(file);
    } else {
      const reader = new FileReader();
      reader.onload = () => {
        const base64 = reader.result as string;
        setSelectedFile({
          file,
          name: file.name,
          type: file.type || "application/octet-stream",
          size: file.size,
          previewUrl: undefined,
          base64,
        });
      };
      reader.readAsDataURL(file);
    }

    // Reset input so re-selecting same file triggers onChange
    e.target.value = "";
  };

  const removeSelectedFile = () => {
    setSelectedFile(null);
  };

  // Format file size nicely
  const formatFileSize = (bytes: number): string => {
    if (bytes < 1024) return `${bytes} B`;
    if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`;
    return `${(bytes / (1024 * 1024)).toFixed(1)} MB`;
  };

  // Send message to Mithra AI backend
  const handleSendMessage = async (textToSend?: string) => {
    const query = (textToSend !== undefined ? textToSend : inputText).trim();

    // Must have either text or an attached file
    if (!query && !selectedFile) return;

    const userMessageId = `msg_${Date.now()}_user`;
    const userMsg: ChatMessage = {
      id: userMessageId,
      role: "user",
      text: query,
      timestamp: new Date().toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" }),
      attachment: selectedFile
        ? {
            name: selectedFile.name,
            type: selectedFile.type,
            size: selectedFile.size,
            previewUrl: selectedFile.previewUrl,
            base64: selectedFile.base64,
          }
        : undefined,
    };

    // Save attachment for request and clear input
    const fileToSend = selectedFile;
    setSelectedFile(null);
    setInputText("");

    // Append to messages list
    const updatedMessages = [...messages, userMsg];
    setMessages(updatedMessages);
    setIsLoading(true);

    try {
      // Build conversation history for memory (last 10 turns to maintain context)
      const historyForApi = updatedMessages.slice(-10, -1).map((m) => ({
        role: m.role,
        text: m.text,
      }));

      const payload: any = {
        message: query,
        history: historyForApi,
      };

      if (fileToSend) {
        payload.fileData = {
          fileName: fileToSend.name,
          mimeType: fileToSend.type,
          base64: fileToSend.base64,
          fileSize: fileToSend.size,
        };
      }

      const response = await fetch("/api/chat-mithra", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(payload),
      });

      if (!response.ok) {
        throw new Error(`Server responded with status ${response.status}`);
      }

      const data = await response.json();

      const modelMsg: ChatMessage = {
        id: `msg_${Date.now()}_model`,
        role: "model",
        text:
          data.reply ||
          "Hello! I am Mithra, your learning companion. How else may I help explain things simply for you today?",
        timestamp: new Date().toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" }),
      };

      setMessages((prev) => [...prev, modelMsg]);
      if (!isOpen) {
        setHasNewResponse(true);
      }
    } catch (err: any) {
      console.error("Failed to get reply from Mithra, utilizing client-side pedagogical guidance:", err);

      let fallbackText = "Hello! I am Mithra, your learning companion. I experienced a momentary network delay, but I'm ready to help. Please feel free to ask your question again or share any file you'd like me to explain!";

      const q = query.toLowerCase();
      if (q.includes("mospi") || q.includes("nso") || q.includes("csd") || q.includes("nsso")) {
        fallbackText = `### 🏛️ India's Official Statistical System Made Simple!

- **MoSPI**: Union Ministry formed in October 1999 coordinating official statistical operations.
- **NSO**: Formed in May 2019 by combining CSO and NSSO under the Chief Statistician of India (CSI).
- **Core Divisions**: National Accounts (NAD for GDP/GVA), Survey Design (SDRD), Field Operations (FOD), and Quality Assurance (DQAD).

*Feel free to ask a follow-up question on any statistical survey!*`;
      } else if (q.includes("karmayogi") || q.includes("igot") || q.includes("frac")) {
        fallbackText = `### 🚀 Mission Karmayogi & iGOT Demystified!

- **Mission**: Transition civil services from traditional "rule-based" compliance to modern "role-based" competency-driven public administration.
- **FRAC Framework**: Roles $\\rightarrow$ Activities $\\rightarrow$ Competencies (Behavioral, Functional, Domain).
- **Key Bodies**: Capacity Building Commission (CBC) and SPV Karmayogi Bharat.

*Would you like to explore annual capacity building plans or competency assessments?*`;
      } else if (q.includes("cpi") || q.includes("inflation") || q.includes("index")) {
        fallbackText = `### 📈 Inflation & Index Numbers at a Glance!

- **CPI**: Consumer price index ($2012=100$) measuring household inflation including goods and services, monitored by RBI ($4\\% \\pm 2\\%$).
- **Laspeyres Index**: $I_L = \\frac{\\sum p_1 q_0}{\\sum p_0 q_0} \\times 100$ (base-year weighted).
- **Paasche Index**: $I_P = \\frac{\\sum p_1 q_1}{\\sum p_0 q_1} \\times 100$ (current-year weighted).
- **Fisher's Ideal**: $I_F = \\sqrt{I_L \\times I_P}$.

*Would you like to practice a numerical calculation?*`;
      } else if (q.includes("formula") || q.includes("variance") || q.includes("sampling") || q.includes("srswor")) {
        fallbackText = `### 🎯 Sampling Theory Essentials!

- **Sample Mean**: $\\bar{y} = \\frac{1}{n}\\sum_{i=1}^n y_i$
- **SRSWOR Variance**: $V(\\bar{y}_{wor}) = \\frac{S^2}{n}(1 - f)$, where $f = \\frac{n}{N}$ (sampling fraction) and $(1-f)$ is the finite population correction (FPC).
- **Efficiency**: SRSWOR is strictly more efficient than SRSWR because $(1-f) < 1$.

*Feel free to ask any specific formula or derivation!*`;
      }

      const errorMsg: ChatMessage = {
        id: `msg_${Date.now()}_fallback`,
        role: "model",
        text: fallbackText,
        timestamp: new Date().toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" }),
      };
      setMessages((prev) => [...prev, errorMsg]);
    } finally {
      setIsLoading(false);
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent<HTMLTextAreaElement>) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      handleSendMessage();
    }
  };

  const handleClearHistory = () => {
    if (messages.length === 0) return;
    if (window.confirm("Do you want to clear your conversation history with Mithra?")) {
      setMessages([]);
      setSelectedFile(null);
    }
  };

  const copyToClipboard = (id: string, text: string) => {
    navigator.clipboard.writeText(text).then(() => {
      setCopiedMessageId(id);
      setTimeout(() => setCopiedMessageId(null), 2000);
    });
  };

  return (
    <>
      {/* ========================================================
          1. FLOATING CUTE OWL TRIGGER BUTTON (Elevated & Bigger Size)
          ======================================================== */}
      <div
        className={`fixed z-40 flex items-center transition-all duration-300 ${
          isOpen
            ? "bottom-6 right-6 opacity-0 pointer-events-none"
            : "bottom-24 sm:bottom-28 md:bottom-32 right-5 sm:right-8"
        }`}
      >
        {/* Visible Attention Badge (Always shown when closed) */}
        {!isOpen && (
          <div
            onClick={() => setIsOpen(true)}
            className="flex items-center gap-2 mr-3.5 px-4 py-2 rounded-full bg-slate-950/95 text-white text-xs sm:text-sm font-bold shadow-2xl backdrop-blur-md cursor-pointer border-2 border-purple-400/80 hover:bg-purple-950 hover:border-purple-300 hover:scale-105 transition-all duration-200 animate-in fade-in slide-in-from-right-3 group"
          >
            <span className="relative flex h-2.5 w-2.5 shrink-0">
              <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
              <span className="relative inline-flex rounded-full h-2.5 w-2.5 bg-emerald-500"></span>
            </span>
            <span className="tracking-wide text-white">Ask Mithra AI</span>
            <Sparkles className="w-4 h-4 text-amber-300 group-hover:rotate-12 transition-transform shrink-0" />
          </div>
        )}

        {/* Large, High-Contrast Floating Owl Button (Prominent & Visible) */}
        <button
          id="mithra-floating-owl-btn"
          onClick={() => setIsOpen(!isOpen)}
          aria-label="Open Mithra AI Chatbot"
          className="relative group w-18 h-18 sm:w-22 sm:h-22 rounded-full flex items-center justify-center cursor-pointer transition-all duration-300 transform hover:scale-105 active:scale-95 bg-gradient-to-br from-violet-600 via-purple-700 to-indigo-950 border-4 border-purple-300 shadow-[0_12px_36px_rgba(109,40,217,0.55)] hover:shadow-[0_16px_46px_rgba(109,40,217,0.7)]"
        >
          {/* Outer gentle ambient pulse ring */}
          <span className="absolute -inset-2 rounded-full bg-purple-500/30 blur-md group-hover:bg-purple-500/50 transition duration-300 -z-10 animate-pulse"></span>

          {/* New message notification badge */}
          {hasNewResponse && !isOpen && (
            <span className="absolute top-1 right-1 w-4 h-4 bg-emerald-500 border-2 border-white rounded-full animate-bounce"></span>
          )}

          <div className="relative flex items-center justify-center p-1">
            {/* Cute Owl Logo - Big & High-Resolution */}
            <MithraOwlLogo size={50} className="sm:hidden drop-shadow-md" />
            <MithraOwlLogo size={62} className="hidden sm:inline-flex drop-shadow-md" />
          </div>
        </button>
      </div>

      {/* ========================================================
          2. CLEAN MODERN CHAT INTERFACE
          ======================================================== */}
      {isOpen && (
        <div
          id="mithra-chat-window"
          className={`fixed z-50 bg-white shadow-2xl border border-purple-200 flex flex-col transition-all duration-200 overflow-hidden ${
            isExpanded
              ? "inset-3 md:inset-6 rounded-3xl"
              : "bottom-4 sm:bottom-6 right-4 sm:right-6 md:right-8 w-[calc(100vw-2rem)] sm:w-[440px] md:w-[490px] h-[650px] max-h-[calc(100vh-3rem)] rounded-3xl"
          }`}
        >
          {/* --- TOP HEADER --- */}
          <div className="bg-gradient-to-r from-violet-800 via-purple-700 to-indigo-900 text-white px-4 py-3.5 flex items-center justify-between shadow-md shrink-0">
            <div className="flex items-center gap-3">
              {/* Owl Logo in Header */}
              <div className="w-10 h-10 rounded-2xl bg-white/10 border border-white/20 p-1 flex items-center justify-center shadow-inner">
                <MithraOwlLogo size={32} />
              </div>
              <div>
                <div className="flex items-center gap-1.5">
                  <span className="font-bold text-base tracking-tight">Mithra</span>
                  <span className="px-1.5 py-0.5 rounded-full bg-purple-400/30 text-purple-200 text-[10px] font-bold border border-purple-300/30 flex items-center gap-1">
                    <Sparkles className="w-2.5 h-2.5 text-amber-300" />
                    AI Mentor
                  </span>
                </div>
                <div className="text-[11px] text-purple-200/90 flex items-center gap-1.5">
                  <span className="w-1.5 h-1.5 rounded-full bg-emerald-400"></span>
                  <span>Super Intelligent Learning Companion</span>
                </div>
              </div>
            </div>

            {/* Header Control Actions */}
            <div className="flex items-center gap-1">
              {/* Clear History */}
              {messages.length > 0 && (
                <button
                  onClick={handleClearHistory}
                  title="Clear conversation"
                  aria-label="Clear conversation"
                  className="p-1.5 rounded-lg text-purple-200 hover:text-white hover:bg-white/10 transition-colors cursor-pointer"
                >
                  <RotateCcw className="w-4 h-4" />
                </button>
              )}

              {/* Expand / Minimize Window */}
              <button
                onClick={() => setIsExpanded(!isExpanded)}
                title={isExpanded ? "Restore standard size" : "Expand window"}
                aria-label={isExpanded ? "Restore standard size" : "Expand window"}
                className="hidden sm:block p-1.5 rounded-lg text-purple-200 hover:text-white hover:bg-white/10 transition-colors cursor-pointer"
              >
                {isExpanded ? <Minimize2 className="w-4 h-4" /> : <Maximize2 className="w-4 h-4" />}
              </button>

              {/* Close Button */}
              <button
                onClick={() => setIsOpen(false)}
                title="Close chat"
                aria-label="Close chat"
                className="p-1.5 rounded-lg text-purple-200 hover:text-white hover:bg-white/10 transition-colors cursor-pointer"
              >
                <X className="w-5 h-5" />
              </button>
            </div>
          </div>

          {/* --- CHAT MESSAGES AREA (Middle) --- */}
          <div className="flex-1 overflow-y-auto p-4 space-y-4 bg-gradient-to-b from-purple-50/30 via-slate-50/40 to-white">
            {/* EMPTY STATE / WELCOME SCREEN */}
            {messages.length === 0 ? (
              <div className="h-full flex flex-col items-center justify-center text-center py-6 px-3 space-y-5 animate-in fade-in duration-300">
                {/* Big Mithra Logo at the top */}
                <div className="relative p-3 rounded-3xl bg-gradient-to-br from-violet-100 to-purple-50 border border-purple-200 shadow-md">
                  <MithraOwlLogo size={76} />
                  <div className="absolute -bottom-1 -right-1 p-1.5 rounded-full bg-purple-700 text-white shadow-xs">
                    <Sparkles className="w-3.5 h-3.5 text-amber-300" />
                  </div>
                </div>

                {/* Welcome Typography per User Requirement */}
                <div className="space-y-1 max-w-sm">
                  <h2 className="text-xl font-extrabold text-slate-900 tracking-tight">
                    Welcome to Mithra
                  </h2>
                  <p className="text-xs font-semibold text-purple-700 uppercase tracking-wider">
                    Your Super Intelligent Learning Companion
                  </p>
                  <p className="text-sm font-medium text-slate-600 pt-1">
                    How can I help you today?
                  </p>
                </div>

                {/* Subtitle / Capabilities Note */}
                <div className="text-[11.5px] text-slate-500 max-w-xs leading-relaxed bg-purple-100/60 p-2.5 rounded-2xl border border-purple-200/80">
                  Ask any question from any subject, or attach a photo/document! I explain complex topics in the simplest, crystal-clear language.
                </div>

                {/* Quick Starter Suggestions */}
                <div className="w-full max-w-sm space-y-2 text-left pt-1">
                  <div className="text-[11px] font-bold text-slate-400 uppercase tracking-wider px-1">
                    Try asking about:
                  </div>
                  <div className="grid grid-cols-1 gap-2">
                    {STARTER_PROMPTS.map((starter, idx) => (
                      <button
                        key={idx}
                        onClick={() => handleSendMessage(starter.prompt)}
                        className="p-2.5 rounded-xl bg-white border border-purple-200/90 hover:border-purple-400 hover:bg-purple-50/60 transition-all text-left flex items-start gap-2.5 group shadow-2xs cursor-pointer"
                      >
                        <span className="text-base shrink-0 mt-0.5">{starter.icon}</span>
                        <div className="flex-1">
                          <div className="text-xs font-bold text-slate-800 group-hover:text-purple-700 flex items-center justify-between">
                            <span>{starter.title}</span>
                            <ArrowRight className="w-3 h-3 text-purple-400 opacity-0 group-hover:opacity-100 transition-opacity" />
                          </div>
                          <div className="text-[11px] text-slate-500 line-clamp-1">
                            {starter.prompt}
                          </div>
                        </div>
                      </button>
                    ))}
                  </div>
                </div>
              </div>
            ) : (
              /* MESSAGE LIST */
              <>
                {messages.map((msg) => {
                  const isUser = msg.role === "user";
                  return (
                    <div
                      key={msg.id}
                      className={`flex gap-2.5 ${isUser ? "justify-end" : "justify-start"} animate-in fade-in slide-in-from-bottom-2 duration-200`}
                    >
                      {/* Mithra Bot Avatar */}
                      {!isUser && (
                        <div className="w-8 h-8 rounded-full bg-purple-100 border border-purple-200 p-0.5 flex items-center justify-center shrink-0 mt-0.5 shadow-2xs">
                          <MithraOwlLogo size={24} />
                        </div>
                      )}

                      {/* Message Bubble Container */}
                      <div className={`max-w-[85%] sm:max-w-[80%] space-y-1.5`}>
                        {/* Attached File/Photo in Message */}
                        {msg.attachment && (
                          <div
                            className={`p-2 rounded-2xl border ${
                              isUser
                                ? "bg-violet-700/60 border-violet-500 text-white"
                                : "bg-white border-slate-200 text-slate-800"
                            }`}
                          >
                            {msg.attachment.previewUrl ? (
                              <div className="space-y-1.5">
                                <img
                                  src={msg.attachment.previewUrl}
                                  alt={msg.attachment.name}
                                  className="max-h-48 rounded-xl object-contain bg-black/5"
                                  referrerPolicy="no-referrer"
                                />
                                <div className="text-[10px] font-medium opacity-80 truncate">
                                  📷 {msg.attachment.name} ({formatFileSize(msg.attachment.size)})
                                </div>
                              </div>
                            ) : (
                              <div className="flex items-center gap-2 py-1 px-2">
                                <FileText className="w-4 h-4 shrink-0 text-purple-300" />
                                <div className="flex-1 min-w-0">
                                  <div className="text-xs font-semibold truncate">
                                    {msg.attachment.name}
                                  </div>
                                  <div className="text-[10px] opacity-75">
                                    {formatFileSize(msg.attachment.size)}
                                  </div>
                                </div>
                              </div>
                            )}
                          </div>
                        )}

                        {/* Main Text Content */}
                        {msg.text && (
                          <div
                            className={`p-3.5 rounded-2xl text-xs leading-relaxed ${
                              isUser
                                ? "bg-gradient-to-r from-violet-600 to-purple-700 text-white rounded-tr-xs shadow-xs font-normal"
                                : "bg-white text-slate-800 border border-purple-100 rounded-tl-xs shadow-xs font-normal"
                            }`}
                          >
                            {isUser ? (
                              <div className="whitespace-pre-wrap">
                                <FormattedMathContent text={msg.text} />
                              </div>
                            ) : (
                              <div className="mithra-markdown space-y-2">
                                <Markdown remarkPlugins={[remarkMath]} rehypePlugins={[rehypeKatex]}>
                                  {msg.text}
                                </Markdown>
                              </div>
                            )}
                          </div>
                        )}

                        {/* Timestamp & Copy action */}
                        <div
                          className={`flex items-center gap-2 px-1 text-[10px] text-slate-400 ${
                            isUser ? "justify-end" : "justify-start"
                          }`}
                        >
                          <span>{msg.timestamp}</span>
                          {!isUser && (
                            <button
                              onClick={() => copyToClipboard(msg.id, msg.text)}
                              title="Copy answer"
                              className="text-slate-400 hover:text-purple-700 transition-colors p-0.5"
                            >
                              {copiedMessageId === msg.id ? (
                                <Check className="w-3 h-3 text-emerald-600" />
                              ) : (
                                <Copy className="w-3 h-3" />
                              )}
                            </button>
                          )}
                        </div>
                      </div>

                      {/* User Avatar */}
                      {isUser && (
                        <div className="w-7 h-7 rounded-full bg-violet-600 text-white flex items-center justify-center shrink-0 mt-0.5 text-[11px] font-bold shadow-2xs">
                          <User className="w-4 h-4" />
                        </div>
                      )}
                    </div>
                  );
                })}

                {/* TYPING INDICATOR */}
                {isLoading && (
                  <div className="flex gap-2.5 justify-start animate-in fade-in duration-200">
                    <div className="w-8 h-8 rounded-full bg-purple-100 border border-purple-200 p-0.5 flex items-center justify-center shrink-0 mt-0.5 shadow-2xs">
                      <MithraOwlLogo size={24} />
                    </div>
                    <div className="p-3.5 rounded-2xl rounded-tl-xs bg-white border border-purple-100 shadow-xs space-y-1.5 max-w-[80%]">
                      <div className="flex items-center gap-1.5 text-xs text-purple-700 font-semibold">
                        <Sparkles className="w-3.5 h-3.5 animate-spin text-amber-500" />
                        <span>Mithra is thinking...</span>
                      </div>
                      <div className="flex items-center gap-1.5 pl-1 py-1">
                        <span className="w-2 h-2 rounded-full bg-purple-500 animate-bounce"></span>
                        <span className="w-2 h-2 rounded-full bg-purple-600 animate-bounce [animation-delay:0.2s]"></span>
                        <span className="w-2 h-2 rounded-full bg-purple-700 animate-bounce [animation-delay:0.4s]"></span>
                      </div>
                      <div className="text-[10px] text-slate-400">
                        Preparing a simple, crystal-clear explanation for you
                      </div>
                    </div>
                  </div>
                )}

                <div ref={messagesEndRef} />
              </>
            )}
          </div>

          {/* --- ATTACHED FILE PREVIEW (Before Sending) --- */}
          {selectedFile && (
            <div className="px-4 py-2 bg-purple-50/80 border-t border-purple-200/70 flex items-center justify-between text-xs">
              <div className="flex items-center gap-2 min-w-0">
                {selectedFile.previewUrl ? (
                  <img
                    src={selectedFile.previewUrl}
                    alt="Preview"
                    className="w-9 h-9 rounded-lg object-cover border border-purple-300"
                    referrerPolicy="no-referrer"
                  />
                ) : (
                  <div className="w-9 h-9 rounded-lg bg-purple-200 text-purple-800 flex items-center justify-center shrink-0">
                    <FileText className="w-5 h-5" />
                  </div>
                )}
                <div className="min-w-0">
                  <div className="font-semibold text-slate-800 truncate max-w-[200px] sm:max-w-[280px]">
                    {selectedFile.name}
                  </div>
                  <div className="text-[10px] text-purple-700">
                    {formatFileSize(selectedFile.size)} • Ready to analyze
                  </div>
                </div>
              </div>
              <button
                onClick={removeSelectedFile}
                className="p-1 rounded-full text-slate-500 hover:text-rose-600 hover:bg-rose-50 transition-colors"
                title="Remove attachment"
              >
                <X className="w-4 h-4" />
              </button>
            </div>
          )}

          {/* --- BOTTOM INPUT BAR --- */}
          <div className="p-3 bg-white border-t border-purple-100 shrink-0">
            {/* Hidden File Input */}
            <input
              ref={fileInputRef}
              type="file"
              onChange={handleFileChange}
              accept="image/*,.pdf,.txt,.docx,.csv,.json,.doc"
              className="hidden"
            />

            <div className="flex items-end gap-2 bg-slate-50 border border-slate-200 focus-within:border-purple-500 focus-within:ring-2 focus-within:ring-purple-100 rounded-2xl p-1.5 transition-all">
              {/* Plus (+) Button to attach files & photos */}
              <button
                type="button"
                onClick={() => fileInputRef.current?.click()}
                title="Attach photo or file"
                aria-label="Attach photo or file"
                className="w-9 h-9 rounded-xl flex items-center justify-center text-slate-600 hover:text-purple-700 hover:bg-purple-100 transition-colors shrink-0 cursor-pointer"
              >
                <Plus className="w-5 h-5" />
              </button>

              {/* Text Input / Textarea */}
              <textarea
                ref={inputRef}
                rows={1}
                value={inputText}
                onChange={(e) => setInputText(e.target.value)}
                onKeyDown={handleKeyDown}
                placeholder="Ask Mithra anything or attach a photo/file..."
                className="flex-1 max-h-28 min-h-[36px] py-2 px-1 text-xs text-slate-800 placeholder-slate-400 bg-transparent border-none focus:outline-none resize-none leading-relaxed"
              />

              {/* Send Button */}
              <button
                type="button"
                onClick={() => handleSendMessage()}
                disabled={isLoading || (!inputText.trim() && !selectedFile)}
                title="Send message"
                aria-label="Send message"
                className={`w-9 h-9 rounded-xl flex items-center justify-center text-white transition-all shrink-0 ${
                  isLoading || (!inputText.trim() && !selectedFile)
                    ? "bg-slate-300 cursor-not-allowed"
                    : "bg-purple-600 hover:bg-purple-700 shadow-md active:scale-95 cursor-pointer"
                }`}
              >
                <Send className="w-4 h-4" />
              </button>
            </div>

            {/* Micro Caption */}
            <div className="text-[10px] text-center text-slate-400 mt-1.5">
              Mithra explains everything in simple, beginner-friendly steps • Powered by Gemini AI
            </div>
          </div>
        </div>
      )}
    </>
  );
};
