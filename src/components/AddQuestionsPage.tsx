import { useState, useEffect } from 'react';
import { Plus, Trash2, ArrowLeft, Eye, Image as ImageIcon } from 'lucide-react';
import type { ExamSetup, Question, QuestionType, SubQuestion, MatchPair } from '../App';

interface AddQuestionsPageProps {
  examSetup: ExamSetup;
  onComplete: (questions: Question[]) => void;
  onBack: () => void;
  existingQuestions: Question[];
}

export function AddQuestionsPage({ examSetup, onComplete, onBack, existingQuestions }: AddQuestionsPageProps) {
  const [questions, setQuestions] = useState<Question[]>(existingQuestions);

  useEffect(() => {
    // Initialize questions if empty
    if (questions.length === 0) {
      const initialQuestions: Question[] = [];
      examSetup.questionTypes.forEach(qt => {
        const marksPerQuestion = qt.marks / qt.count;
        for (let i = 0; i < qt.count; i++) {
          initialQuestions.push({
            id: `${qt.type}-${Date.now()}-${i}`,
            type: qt.type,
            questionText: '',
            marks: marksPerQuestion,
            ...(qt.type === 'Objective (MCQ)' && {
              options: ['', '', '', ''],
              correctAnswer: '',
            }),
            ...(qt.type === 'Paragraph-based Questions' && {
              paragraphText: '',
              subQuestions: [],
            }),
            ...(qt.type === 'Match the Following' && {
              matchPairs: [],
            }),
          });
        }
      });
      setQuestions(initialQuestions);
    }
  }, []);

  const updateQuestion = (id: string, updates: Partial<Question>) => {
    setQuestions(questions.map(q => q.id === id ? { ...q, ...updates } : q));
  };

  const updateOption = (id: string, optionIndex: number, value: string) => {
    setQuestions(questions.map(q => {
      if (q.id === id && q.options) {
        const newOptions = [...q.options];
        newOptions[optionIndex] = value;
        return { ...q, options: newOptions };
      }
      return q;
    }));
  };

  const addQuestion = (type: string) => {
    const qt = examSetup.questionTypes.find(t => t.type === type);
    if (!qt) return;

    const marksPerQuestion = qt.marks / qt.count;
    const newQuestion: Question = {
      id: `${type}-${Date.now()}`,
      type,
      questionText: '',
      marks: marksPerQuestion,
      ...(type === 'Objective (MCQ)' && {
        options: ['', '', '', ''],
        correctAnswer: '',
      }),
      ...(type === 'Paragraph-based Questions' && {
        paragraphText: '',
        subQuestions: [],
      }),
      ...(type === 'Match the Following' && {
        matchPairs: [],
      }),
    };
    setQuestions([...questions, newQuestion]);
  };

  const addSubQuestion = (questionId: string) => {
    setQuestions(questions.map(q => {
      if (q.id === questionId && q.type === 'Paragraph-based Questions') {
        const currentSubQuestions = q.subQuestions || [];
        const newSubQuestion: SubQuestion = {
          id: `sub-${Date.now()}`,
          questionText: '',
          marks: 0,
        };
        return { ...q, subQuestions: [...currentSubQuestions, newSubQuestion] };
      }
      return q;
    }));
  };

  const deleteSubQuestion = (questionId: string, subQuestionId: string) => {
    setQuestions(questions.map(q => {
      if (q.id === questionId && q.subQuestions) {
        return { ...q, subQuestions: q.subQuestions.filter(sq => sq.id !== subQuestionId) };
      }
      return q;
    }));
  };

  const updateSubQuestion = (questionId: string, subQuestionId: string, updates: Partial<SubQuestion>) => {
    setQuestions(questions.map(q => {
      if (q.id === questionId && q.subQuestions) {
        return {
          ...q,
          subQuestions: q.subQuestions.map(sq =>
            sq.id === subQuestionId ? { ...sq, ...updates } : sq
          ),
        };
      }
      return q;
    }));
  };

  const deleteQuestion = (id: string) => {
    setQuestions(questions.filter(q => q.id !== id));
  };

  const handleGeneratePreview = () => {
    const hasEmptyQuestions = questions.some(q => !q.questionText.trim());
    if (hasEmptyQuestions) {
      alert('Please fill all question texts before generating preview');
      return;
    }

    const mcqQuestions = questions.filter(q => q.type === 'Objective (MCQ)');
    const hasInvalidMCQ = mcqQuestions.some(q => 
      !q.options?.every(opt => opt.trim()) || !q.correctAnswer
    );
    if (hasInvalidMCQ) {
      alert('Please fill all MCQ options and select correct answers');
      return;
    }

    onComplete(questions);
  };

  const getQuestionsByType = (type: string) => {
    return questions.filter(q => q.type === type);
  };

  const getTotalMarksEntered = () => {
    return questions.reduce((sum, q) => sum + q.marks, 0);
  };

  const getTotalQuestionsCount = () => {
    return questions.length;
  };

  return (
    <div className="max-w-6xl mx-auto p-6">
      <div className="bg-white rounded-lg shadow-md p-8">
        <div className="flex items-center justify-between mb-6">
          <div className="flex items-center gap-4">
            <button
              onClick={onBack}
              className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
            >
              <ArrowLeft className="w-5 h-5 text-gray-600" />
            </button>
            <div>
              <h1 className="text-gray-900">Add Questions</h1>
              <p className="text-gray-600 mt-1">
                {examSetup.subject} - {examSetup.className}
              </p>
            </div>
          </div>
          <div className="text-right">
            <div className="text-sm text-gray-600">Total Questions</div>
            <div className="text-gray-900">{getTotalQuestionsCount()}</div>
          </div>
        </div>

        <div className="space-y-8">
          {examSetup.questionTypes.map((qt) => {
            const questionsList = getQuestionsByType(qt.type);
            return (
              <div key={qt.type} className="border border-gray-200 rounded-lg p-6">
                <div className="flex justify-between items-center mb-4">
                  <div>
                    <h2 className="text-gray-900">{qt.type}</h2>
                    <p className="text-sm text-gray-600 mt-1">
                      {qt.marks} marks total • {questionsList.length} questions • {(qt.marks / qt.count).toFixed(1)} marks each
                    </p>
                  </div>
                  <button
                    onClick={() => addQuestion(qt.type)}
                    className="flex items-center gap-2 px-4 py-2 text-blue-600 hover:bg-blue-50 rounded-lg transition-colors"
                  >
                    <Plus className="w-4 h-4" />
                    Add Question
                  </button>
                </div>

                <div className="space-y-4">
                  {questionsList.map((question, index) => (
                    <div key={question.id} className="bg-gray-50 p-4 rounded-lg">
                      <div className="flex justify-between items-start mb-3">
                        <span className="text-gray-700">Question {index + 1}</span>
                        <button
                          onClick={() => deleteQuestion(question.id)}
                          className="p-1 hover:bg-gray-200 rounded transition-colors"
                        >
                          <Trash2 className="w-4 h-4 text-red-500" />
                        </button>
                      </div>

                      {/* Question Text */}
                      <textarea
                        value={question.questionText}
                        onChange={(e) => updateQuestion(question.id, { questionText: e.target.value })}
                        placeholder="Enter question text..."
                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none resize-none"
                        rows={3}
                      />

                      {/* Image URL */}
                      <div className="mt-3">
                        <div className="flex items-center gap-2 mb-2">
                          <ImageIcon className="w-4 h-4 text-gray-600" />
                          <span className="text-sm text-gray-700">Image URL (Optional)</span>
                        </div>
                        <input
                          type="url"
                          value={question.imageUrl || ''}
                          onChange={(e) => updateQuestion(question.id, { imageUrl: e.target.value })}
                          placeholder="https://example.com/image.jpg"
                          className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none"
                        />
                        
                        {question.imageUrl && (
                          <>
                            <div className="mt-3 grid grid-cols-2 gap-3">
                              <div>
                                <label className="block text-sm text-gray-600 mb-1">Image Size</label>
                                <select
                                  value={question.imageSize || 'medium'}
                                  onChange={(e) => updateQuestion(question.id, { imageSize: e.target.value as 'small' | 'medium' | 'large' })}
                                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none"
                                >
                                  <option value="small">Small</option>
                                  <option value="medium">Medium</option>
                                  <option value="large">Large</option>
                                </select>
                              </div>
                              <div>
                                <label className="block text-sm text-gray-600 mb-1">Image Position</label>
                                <select
                                  value={question.imagePosition || 'left'}
                                  onChange={(e) => updateQuestion(question.id, { imagePosition: e.target.value as 'left' | 'center' | 'right' })}
                                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none"
                                >
                                  <option value="left">Left</option>
                                  <option value="center">Center</option>
                                  <option value="right">Right</option>
                                </select>
                              </div>
                            </div>
                            <div className="mt-2">
                              <img 
                                src={question.imageUrl} 
                                alt="Question preview" 
                                className="max-w-xs max-h-40 object-contain rounded-lg border border-gray-300"
                                onError={(e) => {
                                  e.currentTarget.style.display = 'none';
                                }}
                              />
                            </div>
                          </>
                        )}
                      </div>

                      {/* MCQ Options */}
                      {question.type === 'Objective (MCQ)' && question.options && (
                        <div className="mt-4 space-y-3">
                          <div className="text-sm text-gray-700">Options:</div>
                          {question.options.map((option, optIndex) => (
                            <div key={optIndex} className="flex items-center gap-3">
                              <span className="text-gray-600 w-8">
                                {String.fromCharCode(65 + optIndex)}.
                              </span>
                              <input
                                type="text"
                                value={option}
                                onChange={(e) => updateOption(question.id, optIndex, e.target.value)}
                                placeholder={`Option ${String.fromCharCode(65 + optIndex)}`}
                                className="flex-1 px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none"
                              />
                            </div>
                          ))}
                          <div className="flex items-center gap-3 mt-3">
                            <span className="text-gray-700 text-sm">Correct Answer:</span>
                            <select
                              value={question.correctAnswer || ''}
                              onChange={(e) => updateQuestion(question.id, { correctAnswer: e.target.value })}
                              className="px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none"
                            >
                              <option value="">Select...</option>
                              {question.options.map((_, optIndex) => (
                                <option key={optIndex} value={String.fromCharCode(65 + optIndex)}>
                                  {String.fromCharCode(65 + optIndex)}
                                </option>
                              ))}
                            </select>
                          </div>
                        </div>
                      )}

                      {/* Paragraph-based Questions */}
                      {question.type === 'Paragraph-based Questions' && (
                        <div className="mt-4">
                          <div className="text-sm text-gray-700">Paragraph Text:</div>
                          <textarea
                            value={question.paragraphText}
                            onChange={(e) => updateQuestion(question.id, { paragraphText: e.target.value })}
                            placeholder="Enter paragraph text..."
                            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none resize-none"
                            rows={5}
                          />

                          <div className="mt-4">
                            <div className="flex justify-between items-center mb-2">
                              <div className="text-sm text-gray-700">Sub-Questions:</div>
                              {question.subQuestions && question.subQuestions.length > 0 && (
                                <div className="text-sm">
                                  <span className="text-gray-600">Sub-questions total: </span>
                                  <span className={
                                    question.subQuestions.reduce((sum, sq) => sum + sq.marks, 0) === question.marks
                                      ? 'text-green-600'
                                      : 'text-orange-600'
                                  }>
                                    {question.subQuestions.reduce((sum, sq) => sum + sq.marks, 0).toFixed(1)}
                                  </span>
                                  <span className="text-gray-600"> / {question.marks.toFixed(1)}</span>
                                </div>
                              )}
                            </div>
                            {question.subQuestions.map((subQuestion, subIndex) => (
                              <div key={subQuestion.id} className="bg-gray-100 p-3 rounded-lg mt-2">
                                <div className="flex justify-between items-start mb-2">
                                  <span className="text-gray-700">Sub-Question {subIndex + 1}</span>
                                  <button
                                    onClick={() => deleteSubQuestion(question.id, subQuestion.id)}
                                    className="p-1 hover:bg-gray-200 rounded transition-colors"
                                  >
                                    <Trash2 className="w-4 h-4 text-red-500" />
                                  </button>
                                </div>

                                <textarea
                                  value={subQuestion.questionText}
                                  onChange={(e) => updateSubQuestion(question.id, subQuestion.id, { questionText: e.target.value })}
                                  placeholder="Enter sub-question text..."
                                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none resize-none"
                                  rows={3}
                                />

                                {/* Sub-question Image URL */}
                                <div className="mt-3">
                                  <div className="flex items-center gap-2 mb-2">
                                    <ImageIcon className="w-4 h-4 text-gray-600" />
                                    <span className="text-sm text-gray-700">Image URL (Optional)</span>
                                  </div>
                                  <input
                                    type="url"
                                    value={subQuestion.imageUrl || ''}
                                    onChange={(e) => updateSubQuestion(question.id, subQuestion.id, { imageUrl: e.target.value })}
                                    placeholder="https://example.com/image.jpg"
                                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none"
                                  />
                                  {subQuestion.imageUrl && (
                                    <div className="mt-2">
                                      <img 
                                        src={subQuestion.imageUrl} 
                                        alt="Sub-question preview" 
                                        className="max-w-xs max-h-40 object-contain rounded-lg border border-gray-300"
                                        onError={(e) => {
                                          e.currentTarget.style.display = 'none';
                                        }}
                                      />
                                    </div>
                                  )}
                                </div>

                                <div className="mt-3">
                                  <label className="block text-sm text-gray-600 mb-1">
                                    Marks for this sub-question
                                  </label>
                                  <input
                                    type="number"
                                    value={subQuestion.marks || ''}
                                    onChange={(e) => updateSubQuestion(question.id, subQuestion.id, { marks: Number(e.target.value) })}
                                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none"
                                    placeholder="0"
                                    min="0"
                                    step="0.5"
                                  />
                                </div>
                              </div>
                            ))}

                            <button
                              onClick={() => addSubQuestion(question.id)}
                              className="flex items-center gap-2 px-4 py-2 text-blue-600 hover:bg-blue-50 rounded-lg transition-colors mt-4"
                            >
                              <Plus className="w-4 h-4" />
                              Add Sub-Question
                            </button>
                          </div>
                        </div>
                      )}

                      {/* Match the Following */}
                      {question.type === 'Match the Following' && (
                        <div className="mt-4">
                          <div className="text-sm text-gray-700 mb-3">Match Pairs:</div>
                          <div className="space-y-3">
                            {question.matchPairs && question.matchPairs.map((pair, pairIndex) => (
                              <div key={pairIndex} className="flex items-center gap-3">
                                <span className="text-gray-600 w-6">{pairIndex + 1}.</span>
                                <input
                                  type="text"
                                  value={pair.leftItem}
                                  onChange={(e) => {
                                    const newPairs = [...(question.matchPairs || [])];
                                    newPairs[pairIndex] = { ...newPairs[pairIndex], leftItem: e.target.value };
                                    updateQuestion(question.id, { matchPairs: newPairs });
                                  }}
                                  placeholder="Left item"
                                  className="flex-1 px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none"
                                />
                                <span className="text-gray-600">→</span>
                                <input
                                  type="text"
                                  value={pair.rightItem}
                                  onChange={(e) => {
                                    const newPairs = [...(question.matchPairs || [])];
                                    newPairs[pairIndex] = { ...newPairs[pairIndex], rightItem: e.target.value };
                                    updateQuestion(question.id, { matchPairs: newPairs });
                                  }}
                                  placeholder="Right item"
                                  className="flex-1 px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none"
                                />
                                <button
                                  onClick={() => {
                                    const newPairs = (question.matchPairs || []).filter((_, i) => i !== pairIndex);
                                    updateQuestion(question.id, { matchPairs: newPairs });
                                  }}
                                  className="p-1 hover:bg-gray-200 rounded transition-colors"
                                >
                                  <Trash2 className="w-4 h-4 text-red-500" />
                                </button>
                              </div>
                            ))}
                            <button
                              onClick={() => {
                                const newPairs = [...(question.matchPairs || []), { id: `pair-${Date.now()}`, leftItem: '', rightItem: '' }];
                                updateQuestion(question.id, { matchPairs: newPairs });
                              }}
                              className="flex items-center gap-2 px-4 py-2 text-blue-600 hover:bg-blue-50 rounded-lg transition-colors"
                            >
                              <Plus className="w-4 h-4" />
                              Add Pair
                            </button>
                          </div>
                        </div>
                      )}

                      <div className="mt-3 text-sm text-gray-600">
                        Marks: {question.marks.toFixed(1)}
                      </div>
                    </div>
                  ))}

                  {questionsList.length === 0 && (
                    <div className="text-center py-8 text-gray-500">
                      No questions added yet. Click "Add Question" to get started.
                    </div>
                  )}
                </div>
              </div>
            );
          })}
        </div>

        <div className="mt-8 flex justify-between items-center pt-6 border-t">
          <div className="text-gray-600">
            Total: {getTotalQuestionsCount()} questions • {getTotalMarksEntered().toFixed(1)} marks
          </div>
          <button
            onClick={handleGeneratePreview}
            className="flex items-center gap-2 bg-blue-600 text-white py-3 px-6 rounded-lg hover:bg-blue-700 transition-colors"
          >
            <Eye className="w-5 h-5" />
            Generate Preview
          </button>
        </div>
      </div>
    </div>
  );
}