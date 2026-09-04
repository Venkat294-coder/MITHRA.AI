import React, { useState } from "react";
import {
  X,
  Code2,
  Copy,
  Check,
  Download,
  Terminal,
  FileCode,
} from "lucide-react";

interface StreamlitCodeModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export const StreamlitCodeModal: React.FC<StreamlitCodeModalProps> = ({
  isOpen,
  onClose,
}) => {
  const [copied, setCopied] = useState<boolean>(false);
  const [activeTab, setActiveTab] = useState<"app.py" | "requirements.txt">("app.py");

  if (!isOpen) return null;

  const appPyCode = `"""
Mithra.ai - AI Learning Assistant
Smart Quiz Generator & Competency Analyzer for Official Statistical System
Theme Color: Deep Violet / Purple (#6B21A8 and #7C3AED)
"""

import os
import json
import streamlit as st

try:
    import PyPDF2
except ImportError:
    PyPDF2 = None

try:
    import pdfplumber
except ImportError:
    pdfplumber = None

st.set_page_config(
    page_title="Mithra.ai - AI Learning Assistant",
    page_icon="🦉",
    layout="wide",
    initial_sidebar_state="expanded",
)

# Custom Deep Violet Theme (#6B21A8, #7C3AED)
st.markdown(\"""
<style>
.stApp { background-color: #FCFAFF; }
.main-header {
    background: linear-gradient(135deg, #6B21A8 0%, #7C3AED 100%);
    padding: 2rem; border-radius: 1rem; color: white; margin-bottom: 2rem;
}
.stButton>button {
    background-color: #7C3AED; color: white; font-weight: 600;
    border-radius: 0.5rem; border: none; padding: 0.5rem 1.25rem;
}
.stButton>button:hover { background-color: #6B21A8; }
.footer { text-align: center; margin-top: 3rem; color: #6B21A8; font-weight: 600; }
</style>
\"", unsafe_allow_html_views=True)

# Session state initialization
if "quiz_data" not in st.session_state:
    st.session_state.quiz_data = None
if "user_answers" not in st.session_state:
    st.session_state.user_answers = {}
if "test_submitted" not in st.session_state:
    st.session_state.test_submitted = False

# ... [Full working Streamlit code is available in app.py in repository root]
`;

  const requirementsCode = `streamlit>=1.35.0
google-genai>=0.1.0
PyPDF2>=3.0.1
pdfplumber>=0.11.0
`;

  const currentContent = activeTab === "app.py" ? appPyCode : requirementsCode;

  const handleCopy = () => {
    navigator.clipboard.writeText(currentContent);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const handleDownload = () => {
    const blob = new Blob([currentContent], { type: "text/plain" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = activeTab;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  };

  return (
    <div
      id="code-modal-backdrop"
      className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-4 overflow-y-auto"
    >
      <div
        id="code-modal"
        className="bg-white rounded-2xl max-w-3xl w-full p-6 md:p-8 shadow-2xl border border-slate-200 space-y-5 animate-in fade-in zoom-in-95 duration-200"
      >
        <div className="flex items-center justify-between pb-4 border-b border-slate-200">
          <div className="flex items-center gap-3">
            <div className="p-2 rounded-xl bg-violet-50 border border-violet-100 text-violet-600">
              <Code2 className="w-6 h-6" />
            </div>
            <div>
              <h3 className="text-lg md:text-xl font-bold text-slate-800">
                Streamlit Source Files
              </h3>
              <p className="text-xs text-slate-500">
                You can run this app locally using Streamlit with Python.
              </p>
            </div>
          </div>

          <button
            onClick={onClose}
            className="p-2 rounded-xl text-slate-400 hover:text-slate-700 hover:bg-slate-100 transition-colors cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Instructions banner */}
        <div className="p-3.5 rounded-xl bg-slate-50 border border-slate-200 text-xs text-slate-700 font-mono flex items-center gap-2">
          <Terminal className="w-4 h-4 text-violet-600 shrink-0" />
          <span>pip install -r requirements.txt && streamlit run app.py</span>
        </div>

        {/* Tab Switcher & Actions */}
        <div className="flex items-center justify-between gap-4">
          <div className="inline-flex p-1 bg-slate-100 rounded-xl border border-slate-200 text-xs font-semibold">
            <button
              onClick={() => setActiveTab("app.py")}
              className={`px-3 py-1.5 rounded-lg flex items-center gap-1.5 transition-all cursor-pointer ${
                activeTab === "app.py"
                  ? "bg-violet-600 text-white shadow-xs"
                  : "text-slate-600 hover:text-slate-900"
              }`}
            >
              <FileCode className="w-3.5 h-3.5" />
              <span>app.py</span>
            </button>
            <button
              onClick={() => setActiveTab("requirements.txt")}
              className={`px-3 py-1.5 rounded-lg flex items-center gap-1.5 transition-all cursor-pointer ${
                activeTab === "requirements.txt"
                  ? "bg-violet-600 text-white shadow-xs"
                  : "text-slate-600 hover:text-slate-900"
              }`}
            >
              <FileCode className="w-3.5 h-3.5" />
              <span>requirements.txt</span>
            </button>
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={handleCopy}
              className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl border border-slate-200 hover:bg-slate-50 text-slate-700 text-xs font-medium transition-colors cursor-pointer"
            >
              {copied ? (
                <>
                  <Check className="w-3.5 h-3.5 text-emerald-600" />
                  <span className="text-emerald-700">Copied!</span>
                </>
              ) : (
                <>
                  <Copy className="w-3.5 h-3.5 text-violet-600" />
                  <span>Copy Code</span>
                </>
              )}
            </button>

            <button
              onClick={handleDownload}
              className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-violet-600 hover:bg-violet-700 text-white text-xs font-semibold shadow-xs transition-colors cursor-pointer"
            >
              <Download className="w-3.5 h-3.5" />
              <span>Download {activeTab}</span>
            </button>
          </div>
        </div>

        {/* Code Box */}
        <div className="relative rounded-xl bg-slate-900 text-slate-100 p-4 font-mono text-xs overflow-x-auto max-h-80 border border-slate-800 shadow-inner">
          <pre>{currentContent}</pre>
        </div>

        <div className="pt-2 text-right">
          <button
            onClick={onClose}
            className="px-5 py-2 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-700 text-xs font-semibold transition-colors cursor-pointer"
          >
            Close
          </button>
        </div>
      </div>
    </div>
  );
};
