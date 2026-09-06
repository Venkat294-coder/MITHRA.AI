export type OptionKey = 'A' | 'B' | 'C' | 'D';

export type QuestionType = 'numerical' | 'theoretical';

export type QuestionDifficulty = 'easy' | 'medium' | 'hard';

export interface DetailedSolution {
  type: QuestionType; // 'numerical' (mathematical, physical, solving) or 'theoretical' (concepts, definitions)
  // Fields for mathematical, physical, and numerical solving problems:
  formulaUsed?: string;
  givenData?: string;
  steps?: string[];
  finalResult?: string;
  // Fields for theory-based questions and deep pedagogical explanations:
  coreConcept?: string;
  conceptualExplanation?: string;
  whyCorrect?: string;
  whyIncorrect?: string | Record<string, string>;
  keyTakeaway?: string;
  laymanExplanation?: string; // Plain-English, simple intuitive explanation anyone can understand
}

export interface Question {
  id: number;
  question: string;
  options: Record<OptionKey, string>;
  correctAnswer: OptionKey;
  topic: string;
  explanation: string;
  questionType?: QuestionType;
  difficulty?: QuestionDifficulty;
  detailedSolution?: DetailedSolution;
}

export interface Quiz {
  id: string;
  title: string;
  fileName: string;
  fileSize?: string;
  extractedTextExcerpt?: string;
  numQuestions: number;
  questions: Question[];
  createdAt: string;
}

export type TopicRating = 'Very Good' | 'Good' | 'Average' | 'Need to Improve';

export interface TopicAnalysis {
  topic: string;
  totalQuestions: number;
  correctQuestions: number;
  percentage: number;
  rating: TopicRating;
  feedback?: string;
}

export interface DifficultyAnalysis {
  difficulty: QuestionDifficulty;
  totalQuestions: number;
  correctQuestions: number;
  percentage: number;
}

export interface QuizResult {
  score: number;
  totalQuestions: number;
  percentage: number;
  timeSpentSeconds: number;
  topicAnalyses: TopicAnalysis[];
  difficultyAnalyses?: DifficultyAnalysis[];
  overallFeedback: string;
  submittedAt: string;
}

export interface QuizAttemptRecord {
  id: string;
  quizTitle: string;
  fileName: string;
  totalQuestions: number;
  score: number;
  percentage: number;
  submittedAt: string;
}

export interface PDFUploadPayload {
  fileName: string;
  fileSize: number;
  base64Data: string;
  numQuestions: 10 | 20 | 30;
  customTopicHint?: string;
}
