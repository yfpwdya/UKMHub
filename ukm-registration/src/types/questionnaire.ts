export interface Answer {
  id: number;
  text: string;
  weight: Record<string, number>;
}

export interface Question {
  id: number;
  text: string;
  category: string;
  answers: Answer[];
}

export interface QuestionnaireResult {
  id: number;
  scores: Record<string, number>;
  recommended: number[];
}
