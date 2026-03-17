export interface Question {
  question: string;
  options: string[]; // ["A) ...", "B) ...", "C) ...", "D) ..."]
  correctAnswer: number; // index into options[]
  explanation: string;
}

export interface QuizState {
  questions: Question[];
  currentIndex: number;
  answers: (number | null)[];
  submitted: boolean;
  fileName: string;
  pageCount: number;
  quizRecordId?: string; // DB record ID (set when user is authenticated)
}
