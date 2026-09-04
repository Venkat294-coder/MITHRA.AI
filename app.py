"""
Mithra.ai - AI Learning Assistant
Smart Quiz Generator & Competency Analyzer for Official Statistical System
Theme Color: Deep Violet / Purple (#6B21A8 and #7C3AED)
"""

import json
import os
import re
import streamlit as st

# Optional PDF extraction imports with fallbacks
try:
    import PyPDF2
except ImportError:
    PyPDF2 = None

try:
    import pdfplumber
except ImportError:
    pdfplumber = None

# Configure Streamlit page
st.set_page_config(
    page_title="Mithra.ai - AI Learning Assistant",
    page_icon="🦉",
    layout="wide",
    initial_sidebar_state="expanded",
)

# Custom CSS for Deep Violet / Purple Theme (#6B21A8 and #7C3AED)
st.markdown(
    """
    <style>
    :root {
        --primary-violet: #7C3AED;
        --deep-violet: #6B21A8;
        --light-violet: #F3E8FF;
        --border-violet: #DDD6FE;
    }
    
    .stApp {
        background-color: #FCFAFF;
    }
    
    .main-header {
        background: linear-gradient(135deg, #6B21A8 0%, #7C3AED 100%);
        padding: 2rem;
        border-radius: 1rem;
        color: white;
        margin-bottom: 2rem;
        box-shadow: 0 10px 25px -5px rgba(107, 33, 168, 0.2);
    }
    
    .main-header h1 {
        color: white !important;
        font-weight: 800;
        margin-bottom: 0.5rem;
    }
    
    .main-header p {
        color: #E9D5FF !important;
        font-size: 1.1rem;
        margin-bottom: 0;
    }

    .stButton>button {
        background-color: #7C3AED;
        color: white;
        font-weight: 600;
        border-radius: 0.5rem;
        border: none;
        padding: 0.5rem 1.25rem;
        transition: all 0.2s;
    }

    .stButton>button:hover {
        background-color: #6B21A8;
        color: white;
        transform: translateY(-1px);
        box-shadow: 0 4px 12px rgba(107, 33, 168, 0.25);
    }

    .question-card {
        background: white;
        border: 1px solid #E9D5FF;
        border-radius: 0.75rem;
        padding: 1.5rem;
        margin-bottom: 1.5rem;
        box-shadow: 0 2px 8px rgba(107, 33, 168, 0.05);
    }

    .score-badge {
        font-size: 2.5rem;
        font-weight: 800;
        color: #6B21A8;
    }

    .footer {
        text-align: center;
        margin-top: 3rem;
        padding: 1.5rem;
        color: #6B21A8;
        font-weight: 600;
        border-top: 1px solid #E9D5FF;
    }
    </style>
    """,
    unsafe_allow_html_views=True,
)

# Initialize Session State variables
if "quiz_data" not in st.session_state:
    st.session_state.quiz_data = None
if "user_answers" not in st.session_state:
    st.session_state.user_answers = {}
if "test_submitted" not in st.session_state:
    st.session_state.test_submitted = False
if "pdf_text" not in st.session_state:
    st.session_state.pdf_text = ""
if "file_name" not in st.session_state:
    st.session_state.file_name = ""


def extract_text_from_pdf(uploaded_file, max_pages=150):
    """Extracts text from uploaded PDF file using PyPDF2 or pdfplumber with page capping for high-capacity books."""
    extracted_text = ""
    try:
        if pdfplumber:
            with pdfplumber.open(uploaded_file) as pdf:
                for idx, page in enumerate(pdf.pages):
                    if idx >= max_pages:
                        break
                    text = page.extract_text()
                    if text:
                        extracted_text += text + "\n"
        elif PyPDF2:
            reader = PyPDF2.PdfReader(uploaded_file)
            for idx, page in enumerate(reader.pages):
                if idx >= max_pages:
                    break
                text = page.extract_text()
                if text:
                    extracted_text += text + "\n"
        else:
            st.error("Neither PyPDF2 nor pdfplumber is installed. Please install one of them.")
    except Exception as e:
        st.error(f"Error extracting text from PDF: {str(e)}")
    return extracted_text.strip()


def generate_mcqs_with_gemini(text_content, count=10):
    """Generates MCQs using Google Gemini API."""
    api_key = os.environ.get("GEMINI_API_KEY")
    if not api_key:
        # Check Streamlit secrets
        if hasattr(st, "secrets") and "GEMINI_API_KEY" in st.secrets:
            api_key = st.secrets["GEMINI_API_KEY"]
            
    if not api_key:
        st.error("GEMINI_API_KEY not found in environment variables or Streamlit secrets.")
        return None

    try:
        from google import genai
        from google.genai import types

        client = genai.Client(api_key=api_key)

        prompt = f"""
You are an expert psychometrician and statistical education specialist for Mithra.ai.
Analyze the following study material carefully and generate exactly {count} high-quality Multiple Choice Questions (MCQs).

Requirements:
1. Each question must test a clear concept directly related to the material (especially Official Statistical System, Sampling, Index Numbers, Estimations, or core topics in the text).
2. Balance between:
   - Mathematical, physical, and numerical solving problems ("numerical"): formulas, index calculations, variance formulas, sample size allocations, rates, or quantitative derivations.
   - Theoretical or conceptual questions ("theoretical"): definitions, survey frameworks, institutional divisions (NSSO, CSO, MoSPI), principles, and official statistical standards.
3. Exactly 4 options: A, B, C, D. One distinct correct answer.
4. Classify each question as questionType: "numerical" or "theoretical".
5. Provide detailedSolution:
   - If numerical / mathematical / physical solving problem:
     - formulaUsed: The core formula / equation
     - givenData: The parameters and given values
     - steps: Array of step-by-step solving steps
     - finalResult: The calculated result matching the correct choice
   - If theory-based:
     - coreConcept: The fundamental principle tested
     - conceptualExplanation: Deep, comprehensive explanation of the theory
     - whyCorrect: Precise reason why correct answer is right
     - whyIncorrect: Distractor analysis of why other options are wrong
     - keyTakeaway: Key exam takeaway

Return ONLY a JSON array with this exact structure:
[
  {{
    "id": 1,
    "question": "Question text here?",
    "questionType": "numerical",
    "options": {{
      "A": "Option A text",
      "B": "Option B text",
      "C": "Option C text",
      "D": "Option D text"
    }},
    "correctAnswer": "A",
    "topic": "Sampling Theory",
    "explanation": "Detailed explanation of why A is correct.",
    "detailedSolution": {{
      "type": "numerical",
      "formulaUsed": "Var(ȳ) = (S²/n)*(1 - f)",
      "givenData": "Finite population N, sample size n > 1",
      "steps": ["Step 1: ...", "Step 2: ...", "Step 3: ..."],
      "finalResult": "Option A matches"
    }}
  }}
]

Study Material:
\"\"\"{text_content[:25000]}\"\"\"
"""

        models = ["gemini-3.1-flash-lite", "gemini-flash-latest", "gemini-3.8-flash"]
        response = None
        last_error = None
        for m in models:
            try:
                response = client.models.generate_content(
                    model=m,
                    contents=prompt,
                    config=types.GenerateContentConfig(
                        response_mime_type="application/json",
                        temperature=0.3,
                    )
                )
                if response and response.text:
                    break
            except Exception as model_err:
                last_error = model_err
                continue

        if not response or not response.text:
            raise last_error or Exception("No response from Gemini models.")

        raw_text = response.text.strip()
        data = json.loads(raw_text)
        return data

    except Exception as e:
        st.error(f"Gemini API Error: {str(e)}")
        return None


def calculate_topic_performance(questions, user_answers):
    """Calculates performance by topic with exact requested ratings:
    - Very Good
    - Good
    - Average
    - Need to Improve
    """
    topic_stats = {}
    for q in questions:
        topic = q.get("topic", "General Statistics")
        qid = q["id"]
        is_correct = user_answers.get(qid) == q["correctAnswer"]
        
        if topic not in topic_stats:
            topic_stats[topic] = {"total": 0, "correct": 0}
        topic_stats[topic]["total"] += 1
        if is_correct:
            topic_stats[topic]["correct"] += 1

    results = []
    for topic, stat in topic_stats.items():
        pct = (stat["correct"] / stat["total"]) * 100 if stat["total"] > 0 else 0
        if pct >= 80:
            rating = "Very Good"
        elif pct >= 60:
            rating = "Good"
        elif pct >= 40:
            rating = "Average"
        else:
            rating = "Need to Improve"

        results.append({
            "Topic": topic,
            "Total Questions": stat["total"],
            "Correct": stat["correct"],
            "Score (%)": f"{pct:.1f}%",
            "Performance Rating": rating
        })

    return results


# --- SIDEBAR ---
with st.sidebar:
    st.markdown("### 🦉 Mithra.ai Instructions")
    st.info(
        """
        1. **Upload Study Material**: Select any `.pdf` document.
        2. **Select Question Count**: Choose 10, 20, or 30 questions.
        3. **Take the Test**: Choose options A, B, C, or D for each question.
        4. **Submit & Analyze**: View your overall percentage and topic-wise competency rating.
        """
    )
    
    st.markdown("---")
    st.markdown("#### 🎯 Rating Criteria")
    st.markdown("- **Very Good**: ≥ 80%")
    st.markdown("- **Good**: 60% – 79%")
    st.markdown("- **Average**: 40% – 59%")
    st.markdown("- **Need to Improve**: < 40%")
    
    if st.button("🔄 Reset / Start New Quiz"):
        st.session_state.quiz_data = None
        st.session_state.user_answers = {}
        st.session_state.test_submitted = False
        st.session_state.pdf_text = ""
        st.session_state.file_name = ""
        st.rerun()


# --- MAIN HEADER ---
st.markdown(
    """
    <div class="main-header">
        <div style="display: flex; align-items: center; gap: 1rem;">
            <span style="font-size: 3rem;">🦉📖</span>
            <div>
                <h1>Mithra.ai - AI Learning Assistant</h1>
                <p>Smart Quiz Generator & Competency Analyzer for Official Statistical System</p>
            </div>
        </div>
    </div>
    """,
    unsafe_allow_html_views=True,
)

# --- PDF UPLOADER SECTION ---
if not st.session_state.quiz_data:
    st.markdown("### 📄 Step 1: Upload Study Material (PDF Only)")
    uploaded_pdf = st.file_uploader(
        "Choose a PDF file containing your syllabus or study material",
        type=["pdf"],
        help="Only PDF files are supported. Up to 650 MB (Textbooks, Census Volumes & Research Reports)."
    )

    if uploaded_pdf is not None:
        if uploaded_pdf.name != st.session_state.file_name:
            with st.spinner("Extracting text from PDF..."):
                text = extract_text_from_pdf(uploaded_pdf)
                st.session_state.pdf_text = text
                st.session_state.file_name = uploaded_pdf.name
                
            if st.session_state.pdf_text:
                st.success(f"Successfully extracted text from '{uploaded_pdf.name}' ({len(st.session_state.pdf_text)} characters).")
            else:
                st.warning("No readable text could be extracted from this PDF. Please verify it is not an image-only scan.")

        if st.session_state.pdf_text:
            st.markdown("### ⚙️ Step 2: Choose Number of Questions to Generate")
            col1, col2, col3 = st.columns(3)
            
            with col1:
                if st.button("⚡ Generate 10 Questions", use_container_width=True):
                    with st.spinner("Mithra.ai is generating 10 questions with Gemini..."):
                        q_data = generate_mcqs_with_gemini(st.session_state.pdf_text, count=10)
                        if q_data:
                            st.session_state.quiz_data = q_data
                            st.session_state.user_answers = {}
                            st.session_state.test_submitted = False
                            st.rerun()
            with col2:
                if st.button("🚀 Generate 20 Questions", use_container_width=True):
                    with st.spinner("Mithra.ai is generating 20 questions with Gemini..."):
                        q_data = generate_mcqs_with_gemini(st.session_state.pdf_text, count=20)
                        if q_data:
                            st.session_state.quiz_data = q_data
                            st.session_state.user_answers = {}
                            st.session_state.test_submitted = False
                            st.rerun()
            with col3:
                if st.button("🎯 Generate 30 Questions", use_container_width=True):
                    with st.spinner("Mithra.ai is generating 30 questions with Gemini..."):
                        q_data = generate_mcqs_with_gemini(st.session_state.pdf_text, count=30)
                        if q_data:
                            st.session_state.quiz_data = q_data
                            st.session_state.user_answers = {}
                            st.session_state.test_submitted = False
                            st.rerun()

# --- QUIZ TAKING & RESULTS SECTION ---
if st.session_state.quiz_data and not st.session_state.test_submitted:
    questions = st.session_state.quiz_data
    total_q = len(questions)
    st.markdown(f"### 📝 Examination: {total_q} Multiple Choice Questions")
    st.caption(f"Source Material: {st.session_state.file_name}")

    with st.form("quiz_form"):
        for i, q in enumerate(questions):
            qid = q["id"]
            st.markdown(f"**Q{i+1}. {q['question']}** *(Topic: {q.get('topic', 'General')})*")
            
            opts = [f"A) {q['options']['A']}", f"B) {q['options']['B']}", f"C) {q['options']['C']}", f"D) {q['options']['D']}"]
            current_choice = st.session_state.user_answers.get(qid)
            
            selected_option = st.radio(
                f"Select answer for Q{i+1}:",
                options=["None"] + opts,
                index=0,
                key=f"q_{qid}",
                label_visibility="collapsed"
            )
            
            if selected_option and selected_option != "None":
                st.session_state.user_answers[qid] = selected_option[0]  # Extracts 'A', 'B', 'C', or 'D'
            st.markdown("---")

        submit_btn = st.form_submit_button("✅ Submit Test", use_container_width=True)
        if submit_btn:
            st.session_state.test_submitted = True
            st.rerun()

# --- RESULTS & COMPETENCY ANALYSIS SECTION ---
if st.session_state.quiz_data and st.session_state.test_submitted:
    questions = st.session_state.quiz_data
    total_q = len(questions)
    correct_count = sum(1 for q in questions if st.session_state.user_answers.get(q["id"]) == q["correctAnswer"])
    pct_score = (correct_count / total_q) * 100

    st.markdown("## 📊 Test Results & AI Competency Analysis")
    
    col_score1, col_score2 = st.columns(2)
    with col_score1:
        st.metric("Total Score", f"{pct_score:.1f}%")
    with col_score2:
        st.metric("Questions Correct", f"{correct_count} / {total_q}")

    st.markdown("---")
    st.markdown("### 🧠 AI Topic Performance Analysis")
    topic_table = calculate_topic_performance(questions, st.session_state.user_answers)
    st.table(topic_table)

    st.markdown("---")
    st.markdown("### 📋 Review Answers & Detailed Solutions")
    for i, q in enumerate(questions):
        qid = q["id"]
        user_choice = st.session_state.user_answers.get(qid, "Unanswered")
        correct_choice = q["correctAnswer"]
        is_correct = user_choice == correct_choice
        q_type = q.get("questionType", "theoretical")
        is_num = q_type == "numerical" or any(kw in (q.get("question", "") + q.get("explanation", "")).lower() for kw in ["variance", "formula", "neyman", "fisher", "deflator", "tfr", "cbr", "s²/n", "ratio"])
        
        type_badge = "📐 Mathematical/Solving Problem" if is_num else "📖 Theory/Conceptual Assessment"
        status_icon = "✅" if is_correct else "❌"
        
        with st.expander(f"{status_icon} Q{i+1}: {q['question']} [{type_badge}] (Your: {user_choice} | Correct: {correct_choice})"):
            for k in ["A", "B", "C", "D"]:
                mark = "👉 " if k == correct_choice else ""
                user_mark = " (Your choice)" if k == user_choice else ""
                st.write(f"{mark}**{k}:** {q['options'][k]}{user_mark}")
            
            st.markdown("---")
            ds = q.get("detailedSolution", {})
            if is_num:
                st.markdown("#### 📐 Detailed Mathematical Solution")
                formula = ds.get("formulaUsed", "Var(ȳ)_{SRSWOR} = (S²/n)*(1 - f)  vs  Var(ȳ)_{SRSWR} = σ²/n")
                st.code(formula, language="text")
                if ds.get("givenData"):
                    st.markdown(f"**Given Parameters:** {ds.get('givenData')}")
                
                steps = ds.get("steps", [])
                if steps:
                    st.markdown("**Step-by-Step Solving Derivation:**")
                    for s in steps:
                        st.markdown(f"- {s}")
                else:
                    st.markdown(f"**Derivation:** {q.get('explanation', '')}")
                
                final_res = ds.get("finalResult", f"Matches Option {correct_choice}: {q['options'].get(correct_choice, '')}")
                st.success(f"**Final Answer & Verification:** {final_res}")
            else:
                st.markdown("#### 📖 Detailed Theoretical Solution")
                if ds.get("coreConcept"):
                    st.info(f"**Core Concept Tested:** {ds.get('coreConcept')}")
                st.markdown(f"**Explanation of the Solution:** {ds.get('conceptualExplanation', q.get('explanation', ''))}")
                if ds.get("whyCorrect"):
                    st.success(f"**Why Option {correct_choice} is Correct:** {ds.get('whyCorrect')}")
                if ds.get("whyIncorrect"):
                    st.markdown(f"**Distractor Analysis:**\n{ds.get('whyIncorrect')}")
                if ds.get("keyTakeaway"):
                    st.warning(f"💡 **Key Exam Takeaway:** {ds.get('keyTakeaway')}")

# --- FOOTER ---
st.markdown(
    """
    <div class="footer">
        Powered by Mithra.ai
    </div>
    """,
    unsafe_allow_html_views=True,
)
