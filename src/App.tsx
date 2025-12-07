import { useState } from 'react';
import { ExamSetupPage } from './components/ExamSetupPage';
import { AddQuestionsPage } from './components/AddQuestionsPage';
import { PreviewPage } from './components/PreviewPage';

export interface QuestionType {
  type: string;
  marks: number;
  count: number;
}

export interface Question {
  id: string;
  type: string;
  questionText: string;
  options?: string[];
  correctAnswer?: string;
  marks: number;
  imageUrl?: string;
  imageSize?: 'small' | 'medium' | 'large';
  imagePosition?: 'left' | 'center' | 'right';
  paragraphText?: string;
  subQuestions?: SubQuestion[];
  matchPairs?: MatchPair[];
}

export interface SubQuestion {
  id: string;
  questionText: string;
  marks: number;
  imageUrl?: string;
  imageSize?: 'small' | 'medium' | 'large';
  imagePosition?: 'left' | 'center' | 'right';
}

export interface MatchPair {
  id: string;
  leftItem: string;
  rightItem: string;
}

export interface ExamSetup {
  schoolName: string;
  subject: string;
  className: string;
  totalMarks: number;
  questionTypes: QuestionType[];
}

type Page = 'setup' | 'add-questions' | 'preview';

export default function App() {
  const [currentPage, setCurrentPage] = useState<Page>('setup');
  const [examSetup, setExamSetup] = useState<ExamSetup | null>(null);
  const [questions, setQuestions] = useState<Question[]>([]);

  const handleSetupComplete = (setup: ExamSetup) => {
    setExamSetup(setup);
    setCurrentPage('add-questions');
  };

  const handleQuestionsComplete = (questionsList: Question[]) => {
    setQuestions(questionsList);
    setCurrentPage('preview');
  };

  const handleEditFromPreview = () => {
    setCurrentPage('add-questions');
  };

  const handleBackToSetup = () => {
    setCurrentPage('setup');
  };

  return (
    <div className="min-h-screen bg-gray-50">
      {currentPage === 'setup' && (
        <ExamSetupPage onComplete={handleSetupComplete} existingSetup={examSetup} />
      )}
      {currentPage === 'add-questions' && examSetup && (
        <AddQuestionsPage
          examSetup={examSetup}
          onComplete={handleQuestionsComplete}
          onBack={handleBackToSetup}
          existingQuestions={questions}
        />
      )}
      {currentPage === 'preview' && examSetup && (
        <PreviewPage
          examSetup={examSetup}
          questions={questions}
          onEdit={handleEditFromPreview}
          onBackToSetup={handleBackToSetup}
        />
      )}
    </div>
  );
}