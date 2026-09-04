import React from "react";
import katex from "katex";

interface MathRendererProps {
  formula: string;
  displayMode?: boolean;
  className?: string;
}

/**
 * Renders a mathematical equation or formula using KaTeX.
 * If the formula is not valid LaTeX or fails, falls back gracefully to formatted clean text.
 */
export const MathRenderer: React.FC<MathRendererProps> = ({
  formula,
  displayMode = true,
  className = "",
}) => {
  if (!formula || typeof formula !== "string") return null;

  // Clean out bounding dollar signs if present: $$...$$ or $...$
  let cleanFormula = formula.trim();
  if (cleanFormula.startsWith("$$") && cleanFormula.endsWith("$$")) {
    cleanFormula = cleanFormula.slice(2, -2).trim();
  } else if (cleanFormula.startsWith("$") && cleanFormula.endsWith("$")) {
    cleanFormula = cleanFormula.slice(1, -1).trim();
  }

  try {
    const html = katex.renderToString(cleanFormula, {
      displayMode,
      throwOnError: false,
      output: "htmlAndMathml",
    });

    return (
      <div
        className={`math-rendered-box overflow-x-auto ${className}`}
        dangerouslySetInnerHTML={{ __html: html }}
      />
    );
  } catch {
    // Fallback: render clean text
    return (
      <div className={`font-mono text-sm py-1 ${className}`}>
        {cleanFormula}
      </div>
    );
  }
};

/**
 * Formats any string containing inline ($...$) or block ($$...$$) LaTeX
 * and replaces raw LaTeX fragments with formatted math components or clean representation.
 */
export const FormattedMathContent: React.FC<{ text: string; className?: string }> = ({
  text,
  className = "",
}) => {
  if (!text) return null;

  // Check if text contains $...$ or $$...$$
  if (!text.includes("$") && !text.includes("\\frac") && !text.includes("\\sum")) {
    return <span className={className}>{text}</span>;
  }

  // Regex to split by $$...$$ or $...$
  const regex = /(\$\$[\s\S]*?\$\$|\$[^$\n]+?\$)/g;
  const parts = text.split(regex);

  return (
    <span className={className}>
      {parts.map((part, index) => {
        if (part.startsWith("$$") && part.endsWith("$$")) {
          const raw = part.slice(2, -2).trim();
          return <MathRenderer key={index} formula={raw} displayMode={true} className="my-1.5" />;
        } else if (part.startsWith("$") && part.endsWith("$")) {
          const raw = part.slice(1, -1).trim();
          return <MathRenderer key={index} formula={raw} displayMode={false} className="inline-block px-1" />;
        }
        return <span key={index}>{part}</span>;
      })}
    </span>
  );
};
