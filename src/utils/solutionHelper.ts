import { Question, DetailedSolution, OptionKey } from "../types";

/**
 * Validates if a formula string is a genuine mathematical equation
 * and not a generic descriptive placeholder like "Governing Quantitative Equation".
 */
export function hasRealFormula(formula?: string | null): boolean {
  if (!formula || typeof formula !== "string") return false;
  const cleaned = formula.trim();
  if (cleaned.length < 3) return false;

  const lower = cleaned.toLowerCase();
  const bannedPlaceholders = [
    "governing quantitative equation",
    "primary equation",
    "standard governing",
    "mathematical formula",
    "computational definition",
    "formula used",
    "governing formula",
    "target indicator",
    "no formula",
    "n/a",
    "none",
  ];

  if (bannedPlaceholders.some((bp) => lower.includes(bp))) {
    return false;
  }

  // Must contain actual mathematical symbols or equation operators
  return /[=+\-*/√∑Σ\\_^()]/.test(cleaned);
}

/**
 * Determines whether a question is genuinely a mathematical or numerical calculation problem.
 */
export function isNumericalProblem(question: Question): boolean {
  // If explicitly declared as theoretical, always honor it
  if (question.questionType === "theoretical") return false;

  // If detailed solution has a verified, real mathematical formula
  if (hasRealFormula(question.detailedSolution?.formulaUsed)) {
    return true;
  }

  // Only consider numerical if questionType is marked numerical OR contains explicit numerical calculation instructions
  const text = `${question.question || ""} ${question.explanation || ""}`.toLowerCase();
  const strongCalculationRegex = /\b(calculate|compute\s+the|find\s+the\s+value|numerical\s+value|solve\s+for|variance\s*=|var\(|s\^2\/n|s²\/n|σ²\/n|sample\s+size\s+n\s*=|sampling\s+fraction\s*f\s*=|fpc\s*=|tfr\s*=|cbr\s*=)\b/i;

  return question.questionType === "numerical" && strongCalculationRegex.test(text);
}

/**
 * Resolves or constructs a rich, comprehensive DetailedSolution for any question.
 * Ensures crystal-clear explanations and prevents empty or placeholder formulas.
 */
export function resolveDetailedSolution(question: Question): DetailedSolution {
  const isNumerical = isNumericalProblem(question);
  const { options, correctAnswer, explanation, topic, question: qText } = question;
  const correctOptionText = options[correctAnswer] || "";

  // If already populated by server or AI
  if (question.detailedSolution) {
    const ds = question.detailedSolution;
    const cleanFormula = hasRealFormula(ds.formulaUsed) ? ds.formulaUsed : undefined;

    // Check if whyCorrect is meaningful, otherwise synthesize a friendly plain-English one
    const whyCorrectText = ds.whyCorrect && ds.whyCorrect.trim().length > 10
      ? ds.whyCorrect
      : `Option ${correctAnswer} is correct ("${correctOptionText}"). ${explanation || "This aligns with official definitions and verified principles."}`;

    return {
      ...ds,
      type: isNumerical ? "numerical" : "theoretical",
      formulaUsed: cleanFormula,
      whyCorrect: whyCorrectText,
      conceptualExplanation: ds.conceptualExplanation || explanation,
    };
  }

  if (isNumerical) {
    // Generate genuine mathematical breakdown if formula is known, otherwise clean numeric steps without dummy text
    let formula: string | undefined = undefined;
    let givenData = "Parameters and numerical conditions specified in the problem statement.";
    const steps: string[] = [];

    // Detect standard syllabus formulas
    if (qText.includes("SRSWOR") || qText.includes("SRSWR") || explanation.includes("Var(ȳ)")) {
      formula = "Var(ȳ)_{SRSWOR} = \\frac{S^2}{n}\\left(1 - \\frac{n}{N}\\right) = \\frac{S^2}{n}(1 - f) \\quad \\text{vs} \\quad Var(ȳ)_{SRSWR} = \\frac{\\sigma^2}{n}";
      givenData = "Sample size n drawn from finite population N; sampling fraction f = n / N.";
      steps.push("Step 1 (Identify Variance): In SRSWOR, the variance of the sample mean incorporates the Finite Population Correction: Var(ȳ) = (S²/n) * (1 - f).");
      steps.push("Step 2 (Evaluate FPC): Because 0 < f < 1 for a finite sample (n > 1), the factor (1 - f) is strictly less than 1.");
      steps.push("Step 3 (Comparison with SRSWR): In SRSWR, replacement means Var(ȳ) = σ²/n. Therefore, SRSWOR variance is strictly smaller and more precise.");
      steps.push(`Step 4 (Conclusion): Matches Option ${correctAnswer} ("${correctOptionText}").`);
    } else if (qText.includes("Neyman") || qText.includes("optimum allocation")) {
      formula = "n_i = n \\cdot \\frac{N_i \\cdot S_i}{\\sum_{k=1}^{L} (N_k \\cdot S_k)}";
      givenData = "Stratified population with L strata, stratum sizes N_i, stratum standard deviations S_i, and fixed total sample size n.";
      steps.push("Step 1 (Objective): Neyman allocation minimizes estimation variance for a fixed total sample size.");
      steps.push("Step 2 (Proportionality): Sample allocation is proportional to the product of stratum size and stratum variability: n_i ∝ N_i * S_i.");
      steps.push("Step 3 (Evaluation): Larger and more heterogeneous strata receive larger sample allocations.");
      steps.push(`Step 4 (Conclusion): Confirms Option ${correctAnswer} ("${correctOptionText}").`);
    } else if (qText.includes("Fisher") || qText.includes("Time Reversal") || qText.includes("Factor Reversal")) {
      formula = "I_F = \\sqrt{I_L \\times I_P} = \\sqrt{\\frac{\\sum p_1 q_0}{\\sum p_0 q_0} \\times \\frac{\\sum p_1 q_1}{\\sum p_0 q_1}}";
      givenData = "Base period (0) and current period (1) price and quantity data.";
      steps.push("Step 1 (Definition): Fisher's Ideal Index is the geometric mean of the Laspeyres index (I_L) and Paasche index (I_P).");
      steps.push("Step 2 (Test Axioms): It satisfies both the Time Reversal Test (I_01 * I_10 = 1) and the Factor Reversal Test (P_01 * Q_01 = V_01).");
      steps.push(`Step 3 (Verification): Directly validates Option ${correctAnswer} ("${correctOptionText}").`);
    } else if (qText.includes("Deflator") || qText.includes("Real GDP") || qText.includes("Nominal GDP")) {
      formula = "\\text{GDP Deflator} = \\left( \\frac{\\text{Nominal GDP}}{\\text{Real GDP}} \\right) \\times 100";
      givenData = "Nominal GDP (current prices) and Real GDP (base-year constant prices).";
      steps.push("Step 1 (Concept): The GDP deflator measures price level changes across all domestically produced goods and services.");
      steps.push("Step 2 (Calculation): Divide Nominal GDP by Real GDP and multiply by 100.");
      steps.push(`Step 3 (Conclusion): Confirms Option ${correctAnswer} ("${correctOptionText}").`);
    } else {
      // General numerical solving without placeholder text
      givenData = "Values and parameters given in the question.";
      steps.push(`Step 1 (Given Parameters): Identify the values provided in the problem.`);
      steps.push(`Step 2 (Calculation): ${explanation || "Apply the relevant statistical relationship to compute the outcome."}`);
      steps.push(`Step 3 (Verification): The calculated result strictly corresponds to Option ${correctAnswer} ("${correctOptionText}").`);
    }

    return {
      type: "numerical",
      formulaUsed: formula,
      givenData,
      steps,
      finalResult: `Option ${correctAnswer}: ${correctOptionText}`,
      whyCorrect: `Option ${correctAnswer} is correct ("${correctOptionText}"). ${explanation}`,
    };
  } else {
    // Generate comprehensive theory-based explanation
    const otherOptionKeys = (["A", "B", "C", "D"] as OptionKey[]).filter((k) => k !== correctAnswer);
    const whyIncorrectParts = otherOptionKeys.map((k) => {
      const optText = options[k] || "";
      return `• Option ${k} ("${optText}"): Incorrect. This does not describe the target concept or refers to an alternate standard or division.`;
    }).join("\n");

    return {
      type: "theoretical",
      coreConcept: `${topic || "Official Statistics"} - Conceptual Framework`,
      conceptualExplanation: explanation,
      whyCorrect: `Option ${correctAnswer} is correct: "${correctOptionText}". ${explanation}`,
      whyIncorrect: whyIncorrectParts,
      keyTakeaway: `Key Takeaway: Understand the exact definitions, statutory divisions, and foundational principles in ${topic || "Statistics"}.`,
    };
  }
}
