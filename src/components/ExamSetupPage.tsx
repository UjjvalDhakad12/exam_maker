import { useState, useEffect } from 'react';
import { Plus, Trash2 } from 'lucide-react';
import type { ExamSetup, QuestionType } from '../App';

const QUESTION_TYPE_OPTIONS = [
  'Objective (MCQ)',
  'Short Answer',
  'Long Answer',
  'Fill in the Blanks',
  'True/False',
  'Match the Following',
  'Paragraph-based Questions',
];

interface ExamSetupPageProps {
  onComplete: (setup: ExamSetup) => void;
  existingSetup: ExamSetup | null;
}

export function ExamSetupPage({ onComplete, existingSetup }: ExamSetupPageProps) {
  const [schoolName, setSchoolName] = useState(existingSetup?.schoolName || '');
  const [subject, setSubject] = useState(existingSetup?.subject || '');
  const [className, setClassName] = useState(existingSetup?.className || '');
  const [totalMarks, setTotalMarks] = useState(existingSetup?.totalMarks || 60);
  const [selectedTypes, setSelectedTypes] = useState<string[]>(
    existingSetup?.questionTypes.map(qt => qt.type) || []
  );
  const [questionTypes, setQuestionTypes] = useState<QuestionType[]>(
    existingSetup?.questionTypes || []
  );

  useEffect(() => {
    // When selected types change, update questionTypes array
    const newQuestionTypes = selectedTypes.map(type => {
      const existing = questionTypes.find(qt => qt.type === type);
      return existing || { type, marks: 0, count: 0 };
    });
    setQuestionTypes(newQuestionTypes);
  }, [selectedTypes]);

  const handleTypeToggle = (type: string) => {
    if (selectedTypes.includes(type)) {
      setSelectedTypes(selectedTypes.filter(t => t !== type));
    } else {
      setSelectedTypes([...selectedTypes, type]);
    }
  };

  const updateQuestionType = (type: string, field: 'marks' | 'count', value: number) => {
    setQuestionTypes(questionTypes.map(qt =>
      qt.type === type ? { ...qt, [field]: value } : qt
    ));
  };

  const calculateAllocatedMarks = () => {
    return questionTypes.reduce((sum, qt) => sum + qt.marks, 0);
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!schoolName || !subject || !className || selectedTypes.length === 0) {
      alert('Please fill all required fields');
      return;
    }

    const allocatedMarks = calculateAllocatedMarks();
    if (allocatedMarks !== totalMarks) {
      alert(`Total allocated marks (${allocatedMarks}) must equal total marks (${totalMarks})`);
      return;
    }

    const hasInvalidCounts = questionTypes.some(qt => qt.count <= 0);
    if (hasInvalidCounts) {
      alert('All question types must have at least 1 question');
      return;
    }

    onComplete({
      schoolName,
      subject,
      className,
      totalMarks,
      questionTypes,
    });
  };

  const allocatedMarks = calculateAllocatedMarks();
  const remainingMarks = totalMarks - allocatedMarks;

  return (
    <div className="max-w-4xl mx-auto p-6">
      <div className="bg-white rounded-lg shadow-md p-8">
        <h1 className="text-gray-900 mb-6">Exam Setup</h1>
        
        <form onSubmit={handleSubmit} className="space-y-6">
          {/* Basic Info */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <label className="block text-gray-700 mb-2">
                School Name <span className="text-red-500">*</span>
              </label>
              <input
                type="text"
                value={schoolName}
                onChange={(e) => setSchoolName(e.target.value)}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none"
                placeholder="e.g., ABC School"
                required
              />
            </div>

            <div>
              <label className="block text-gray-700 mb-2">
                Subject Name <span className="text-red-500">*</span>
              </label>
              <input
                type="text"
                value={subject}
                onChange={(e) => setSubject(e.target.value)}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none"
                placeholder="e.g., Mathematics"
                required
              />
            </div>

            <div>
              <label className="block text-gray-700 mb-2">
                Class <span className="text-red-500">*</span>
              </label>
              <input
                type="text"
                value={className}
                onChange={(e) => setClassName(e.target.value)}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none"
                placeholder="e.g., 10th Grade"
                required
              />
            </div>
          </div>

          <div>
            <label className="block text-gray-700 mb-2">
              Total Marks <span className="text-red-500">*</span>
            </label>
            <input
              type="number"
              value={totalMarks}
              onChange={(e) => setTotalMarks(Number(e.target.value))}
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none"
              min="1"
              required
            />
          </div>

          {/* Question Types Selection */}
          <div>
            <label className="block text-gray-700 mb-3">
              Select Question Types <span className="text-red-500">*</span>
            </label>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
              {QUESTION_TYPE_OPTIONS.map(type => (
                <label
                  key={type}
                  className="flex items-center space-x-3 p-3 border border-gray-200 rounded-lg hover:bg-gray-50 cursor-pointer"
                >
                  <input
                    type="checkbox"
                    checked={selectedTypes.includes(type)}
                    onChange={() => handleTypeToggle(type)}
                    className="w-4 h-4 text-blue-600 rounded focus:ring-2 focus:ring-blue-500"
                  />
                  <span className="text-gray-700">{type}</span>
                </label>
              ))}
            </div>
          </div>

          {/* Marks Distribution */}
          {selectedTypes.length > 0 && (
            <div className="border-t pt-6">
              <div className="flex justify-between items-center mb-4">
                <h2 className="text-gray-900">Marks Distribution</h2>
                <div className="text-sm">
                  <span className="text-gray-600">Allocated: </span>
                  <span className={allocatedMarks === totalMarks ? 'text-green-600' : 'text-orange-600'}>
                    {allocatedMarks}
                  </span>
                  <span className="text-gray-600"> / {totalMarks}</span>
                  {remainingMarks !== 0 && (
                    <span className="ml-2 text-gray-500">
                      (Remaining: {remainingMarks})
                    </span>
                  )}
                </div>
              </div>

              <div className="space-y-4">
                {questionTypes.map((qt) => (
                  <div key={qt.type} className="bg-gray-50 p-4 rounded-lg">
                    <div className="mb-3">{qt.type}</div>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div>
                        <label className="block text-sm text-gray-600 mb-1">
                          Total Marks for this section
                        </label>
                        <input
                          type="number"
                          value={qt.marks || ''}
                          onChange={(e) => updateQuestionType(qt.type, 'marks', Number(e.target.value))}
                          className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none"
                          placeholder="0"
                          min="0"
                        />
                      </div>
                      <div>
                        <label className="block text-sm text-gray-600 mb-1">
                          Number of Questions
                        </label>
                        <input
                          type="number"
                          value={qt.count || ''}
                          onChange={(e) => updateQuestionType(qt.type, 'count', Number(e.target.value))}
                          className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none"
                          placeholder="0"
                          min="1"
                        />
                      </div>
                    </div>
                    {qt.marks > 0 && qt.count > 0 && (
                      <div className="mt-2 text-sm text-gray-600">
                        {(qt.marks / qt.count).toFixed(1)} marks per question
                      </div>
                    )}
                  </div>
                ))}
              </div>
            </div>
          )}

          <div className="pt-6">
            <button
              type="submit"
              className="w-full bg-blue-600 text-white py-3 px-6 rounded-lg hover:bg-blue-700 transition-colors"
            >
              Proceed to Add Questions
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}