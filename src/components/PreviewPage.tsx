import { Edit, Download, FileText, ArrowLeft, Printer } from 'lucide-react';
import type { ExamSetup, Question } from '../App';

interface PreviewPageProps {
  examSetup: ExamSetup;
  questions: Question[];
  onEdit: () => void;
  onBackToSetup: () => void;
}

export function PreviewPage({ examSetup, questions, onEdit, onBackToSetup }: PreviewPageProps) {
  const getQuestionsByType = (type: string) => {
    return questions.filter(q => q.type === type);
  };

  const getSectionLabel = (type: string) => {
    const labels: { [key: string]: string } = {
      'Objective (MCQ)': 'Section A: Objective Questions (Multiple Choice)',
      'Short Answer': 'Section B: Short Answer Questions',
      'Long Answer': 'Section C: Long Answer Questions',
      'Fill in the Blanks': 'Section D: Fill in the Blanks',
      'True/False': 'Section E: True/False Questions',
      'Match the Following': 'Section F: Match the Following',
      'Paragraph-based Questions': 'Section G: Paragraph-based Questions',
    };
    return labels[type] || type;
  };

  const handleDownloadPDF = () => {
    const content = generateDocumentContent();
    const blob = new Blob([content], { type: 'text/html' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `${examSetup.subject}_${examSetup.className}_Exam.html`;
    link.click();
    URL.revokeObjectURL(url);
    
    alert('HTML file downloaded. You can open it in a browser and print as PDF using Ctrl+P or Cmd+P');
  };

  const handleDownloadDOC = () => {
    const content = generateDocumentContent();
    const blob = new Blob(['\ufeff' + content], { 
      type: 'application/msword' 
    });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `${examSetup.subject}_${examSetup.className}_Exam.doc`;
    link.click();
    URL.revokeObjectURL(url);
  };

  const generateDocumentContent = () => {
    let globalQuestionNumber = 1;
    
    const questionsHTML = examSetup.questionTypes.map((qt) => {
      const sectionQuestions = getQuestionsByType(qt.type);
      if (sectionQuestions.length === 0) return '';

      const sectionContent = sectionQuestions.map((question) => {
        const currentNumber = globalQuestionNumber++;
        let html = `
          <div style="margin-bottom: 20px; margin-left: 20px;">
            <div style="display: flex; gap: 10px;">
              <span style="font-weight: 500;">${currentNumber}.</span>
              <div style="flex: 1;">
                <div style="margin-bottom: 10px;">
                  ${question.questionText}
                  <span style="margin-left: 10px; font-size: 14px; color: #666;">
                    [${question.marks.toFixed(1)} mark${question.marks !== 1 ? 's' : ''}]
                  </span>
                </div>
        `;

        // Add question image
        if (question.imageUrl) {
          html += `
                <div style="margin: 10px 0;">
                  <img src="${question.imageUrl}" alt="Question image" style="max-width: 400px; max-height: 300px; border: 1px solid #ddd; border-radius: 4px;" />
                </div>
          `;
        }

        // Add paragraph text for paragraph-based questions
        if (question.type === 'Paragraph-based Questions' && question.paragraphText) {
          html += `
                <div style="margin: 15px 0; padding: 15px; background-color: #f9fafb; border-left: 3px solid #3b82f6; border-radius: 4px;">
                  <div style="font-style: italic; color: #374151; line-height: 1.6;">
                    ${question.paragraphText}
                  </div>
                </div>
                <div style="margin-top: 15px;">
                  <strong>Answer the following questions based on the above paragraph:</strong>
                </div>
          `;

          // Add sub-questions
          if (question.subQuestions && question.subQuestions.length > 0) {
            html += '<div style="margin-left: 20px; margin-top: 10px;">';
            question.subQuestions.forEach((subQ, idx) => {
              html += `
                <div style="margin-bottom: 15px;">
                  <div style="margin-bottom: 5px;">
                    (${String.fromCharCode(97 + idx)}) ${subQ.questionText}
                    <span style="margin-left: 10px; font-size: 14px; color: #666;">
                      [${subQ.marks.toFixed(1)} mark${subQ.marks !== 1 ? 's' : ''}]
                    </span>
                  </div>
              `;
              
              if (subQ.imageUrl) {
                html += `
                  <div style="margin: 10px 0;">
                    <img src="${subQ.imageUrl}" alt="Sub-question image" style="max-width: 300px; max-height: 200px; border: 1px solid #ddd; border-radius: 4px;" />
                  </div>
                `;
              }

              html += `
                  <div style="margin-top: 10px;">
                    <div style="font-size: 14px; color: #6b7280; font-style: italic;">Answer:</div>
                    <div style="border-bottom: 1px solid #d1d5db; height: 60px; margin-top: 5px;"></div>
                  </div>
                </div>
              `;
            });
            html += '</div>';
          }
        }

        // MCQ Options
        if (question.type === 'Objective (MCQ)' && question.options) {
          html += '<div style="margin: 10px 0 10px 20px;">';
          question.options.forEach((option, optIndex) => {
            html += `<div style="margin-bottom: 5px;">${String.fromCharCode(65 + optIndex)}) ${option}</div>`;
          });
          html += '</div>';
        }

        // Answer space for non-MCQ and non-paragraph questions
        if (question.type !== 'Objective (MCQ)' && question.type !== 'Paragraph-based Questions') {
          html += `
                <div style="margin-top: 15px;">
                  <div style="font-size: 14px; color: #6b7280; font-style: italic;">Answer:</div>
                  <div style="border-bottom: 1px solid #d1d5db; height: 60px; margin-top: 5px;"></div>
                </div>
          `;
        }

        html += `
              </div>
            </div>
          </div>
        `;
        return html;
      }).join('');

      return `
        <div style="border-top: 2px solid #e5e7eb; padding-top: 20px; margin-top: 30px;">
          <h3 style="margin-bottom: 15px; font-weight: 600;">${getSectionLabel(qt.type)}</h3>
          <p style="font-size: 14px; color: #4b5563; margin-bottom: 15px;">(Total Marks: ${qt.marks})</p>
          ${sectionContent}
        </div>
      `;
    }).join('');

    return `
      <!DOCTYPE html>
      <html>
      <head>
        <meta charset="UTF-8">
        <title>${examSetup.subject} - ${examSetup.className} Examination</title>
        <style>
          body {
            font-family: Arial, sans-serif;
            max-width: 900px;
            margin: 40px auto;
            padding: 40px;
            line-height: 1.6;
          }
          @media print {
            body {
              margin: 0;
              padding: 20px;
            }
          }
        </style>
      </head>
      <body>
        <div style="text-align: center; border-bottom: 2px solid #d1d5db; padding-bottom: 20px; margin-bottom: 30px;">
          <h1 style="margin-bottom: 15px;">Greenfield Public School</h1>
          <div style="margin-bottom: 10px;">Examination - 2025</div>
          <div style="display: grid; grid-template-columns: repeat(3, 1fr); gap: 20px; margin-top: 25px; text-align: left; max-width: 700px; margin-left: auto; margin-right: auto;">
            <div>
              <span style="color: #4b5563;">Subject:</span>
              <span style="margin-left: 10px;">${examSetup.subject}</span>
            </div>
            <div>
              <span style="color: #4b5563;">Class:</span>
              <span style="margin-left: 10px;">${examSetup.className}</span>
            </div>
            <div>
              <span style="color: #4b5563;">Total Marks:</span>
              <span style="margin-left: 10px;">${examSetup.totalMarks}</span>
            </div>
          </div>
        </div>

        <div style="margin-bottom: 30px; padding: 15px; background-color: #f9fafb; border-radius: 8px;">
          <h3 style="margin-bottom: 10px;">General Instructions:</h3>
          <ul style="color: #374151; font-size: 14px; line-height: 1.8;">
            <li>All questions are compulsory.</li>
            <li>Read each question carefully before answering.</li>
            <li>Write your answers neatly and legibly.</li>
            <li>Marks are indicated against each question.</li>
          </ul>
        </div>

        ${questionsHTML}

        <div style="margin-top: 50px; padding-top: 20px; border-top: 1px solid #d1d5db; text-align: center; color: #6b7280; font-size: 14px;">
          *** End of Question Paper ***
        </div>
      </body>
      </html>
    `;
  };

  const handleSave = () => {
    alert('Save functionality will be implemented in the future');
  };

  const handlePrint = () => {
    window.print();
  };

  let globalQuestionNumber = 1;

  return (
    <div className="min-h-screen bg-gray-100 p-6">
      <div className="max-w-5xl mx-auto">
        {/* Action Buttons */}
        <div className="flex justify-between items-center mb-6">
          <button
            onClick={onBackToSetup}
            className="flex items-center gap-2 px-4 py-2 bg-white text-gray-700 rounded-lg hover:bg-gray-50 shadow-sm transition-colors"
          >
            <ArrowLeft className="w-4 h-4" />
            Back to Setup
          </button>
          <div className="flex gap-3">
            <button
              onClick={onEdit}
              className="flex items-center gap-2 px-4 py-2 bg-white text-gray-700 rounded-lg hover:bg-gray-50 shadow-sm transition-colors"
            >
              <Edit className="w-4 h-4" />
              Edit Questions
            </button>
            <button
              onClick={handleDownloadPDF}
              className="flex items-center gap-2 px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 shadow-sm transition-colors"
            >
              <Download className="w-4 h-4" />
              Download PDF
            </button>
            <button
              onClick={handleDownloadDOC}
              className="flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 shadow-sm transition-colors"
            >
              <FileText className="w-4 h-4" />
              Download DOC
            </button>
            <button
              onClick={handleSave}
              className="px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 shadow-sm transition-colors"
            >
              Save Exam
            </button>
            <button
              onClick={handlePrint}
              className="px-4 py-2 bg-gray-600 text-white rounded-lg hover:bg-gray-700 shadow-sm transition-colors"
            >
              <Printer className="w-4 h-4" />
              Print
            </button>
          </div>
        </div>

        {/* Question Paper Preview */}
        <div className="bg-white rounded-lg shadow-lg p-12" id="exam-paper">
          {/* Header */}
          <div className="text-center border-b-2 border-gray-300 pb-6 mb-8">
            <h1 className="text-gray-900 mb-4">{examSetup.schoolName}</h1>
            <div className="text-gray-700 mb-2">Examination - 2025</div>
            
            <div className="grid grid-cols-3 gap-4 mt-6 text-left max-w-2xl mx-auto">
              <div>
                <span className="text-gray-600">Subject:</span>
                <span className="ml-2 text-gray-900">{examSetup.subject}</span>
              </div>
              <div>
                <span className="text-gray-600">Class:</span>
                <span className="ml-2 text-gray-900">{examSetup.className}</span>
              </div>
              <div>
                <span className="text-gray-600">Total Marks:</span>
                <span className="ml-2 text-gray-900">{examSetup.totalMarks}</span>
              </div>
            </div>
          </div>

          {/* Instructions */}
          <div className="mb-8 p-4 bg-gray-50 rounded-lg">
            <div className="text-gray-900 mb-2">General Instructions:</div>
            <ul className="list-disc list-inside text-gray-700 space-y-1 text-sm">
              <li>All questions are compulsory.</li>
              <li>Read each question carefully before answering.</li>
              <li>Write your answers neatly and legibly.</li>
              <li>Marks are indicated against each question.</li>
            </ul>
          </div>

          {/* Questions by Section */}
          <div className="space-y-8">
            {examSetup.questionTypes.map((qt) => {
              const sectionQuestions = getQuestionsByType(qt.type);
              if (sectionQuestions.length === 0) return null;

              return (
                <div key={qt.type} className="border-t-2 border-gray-200 pt-6">
                  <div className="text-gray-900 mb-4">
                    {getSectionLabel(qt.type)}
                  </div>
                  <div className="text-sm text-gray-600 mb-4">
                    (Total Marks: {qt.marks})
                  </div>

                  <div className="space-y-6">
                    {sectionQuestions.map((question) => {
                      const currentNumber = globalQuestionNumber++;
                      return (
                        <div key={question.id} className="ml-4">
                          <div className="flex gap-3">
                            <span className="text-gray-700 shrink-0">
                              {currentNumber}.
                            </span>
                            <div className="flex-1">
                              <div className="text-gray-900 mb-2">
                                {question.questionText}
                                <span className="ml-3 text-sm text-gray-600">
                                  [{question.marks.toFixed(1)} mark{question.marks !== 1 ? 's' : ''}]
                                </span>
                              </div>

                              {/* Question Image */}
                              {question.imageUrl && (
                                <div className="my-3">
                                  <img 
                                    src={question.imageUrl} 
                                    alt="Question" 
                                    className="max-w-md max-h-80 object-contain rounded-lg border border-gray-300"
                                  />
                                </div>
                              )}

                              {/* Paragraph-based Questions */}
                              {question.type === 'Paragraph-based Questions' && (
                                <div>
                                  {question.paragraphText && (
                                    <div className="my-4 p-4 bg-gray-50 border-l-4 border-blue-500 rounded">
                                      <div className="text-gray-700 italic leading-relaxed">
                                        {question.paragraphText}
                                      </div>
                                    </div>
                                  )}
                                  
                                  {question.subQuestions && question.subQuestions.length > 0 && (
                                    <div className="mt-4">
                                      <div className="mb-3">Answer the following questions based on the above paragraph:</div>
                                      <div className="ml-6 space-y-4">
                                        {question.subQuestions.map((subQ, idx) => (
                                          <div key={subQ.id}>
                                            <div className="mb-2">
                                              ({String.fromCharCode(97 + idx)}) {subQ.questionText}
                                              <span className="ml-3 text-sm text-gray-600">
                                                [{subQ.marks.toFixed(1)} mark{subQ.marks !== 1 ? 's' : ''}]
                                              </span>
                                            </div>

                                            {/* Sub-question Image */}
                                            {subQ.imageUrl && (
                                              <div className="my-2 ml-4">
                                                <img 
                                                  src={subQ.imageUrl} 
                                                  alt="Sub-question" 
                                                  className="max-w-sm max-h-60 object-contain rounded-lg border border-gray-300"
                                                />
                                              </div>
                                            )}

                                            <div className="mt-2 ml-4">
                                              <div className="text-sm text-gray-500 italic">Answer:</div>
                                              <div className="mt-1 border-b border-gray-300 h-16"></div>
                                            </div>
                                          </div>
                                        ))}
                                      </div>
                                    </div>
                                  )}
                                </div>
                              )}

                              {/* MCQ Options */}
                              {question.type === 'Objective (MCQ)' && question.options && (
                                <div className="mt-2 ml-4 space-y-1">
                                  {question.options.map((option, optIndex) => (
                                    <div key={optIndex} className="text-gray-700">
                                      {String.fromCharCode(65 + optIndex)}) {option}
                                    </div>
                                  ))}
                                </div>
                              )}

                              {/* Answer Space for non-MCQ and non-paragraph */}
                              {question.type !== 'Objective (MCQ)' && question.type !== 'Paragraph-based Questions' && (
                                <div className="mt-3">
                                  <div className="text-sm text-gray-500 italic">
                                    Answer:
                                  </div>
                                  <div className="mt-1 border-b border-gray-300 h-16"></div>
                                </div>
                              )}
                            </div>
                          </div>
                        </div>
                      );
                    })}
                  </div>
                </div>
              );
            })}
          </div>

          {/* Footer */}
          <div className="mt-12 pt-6 border-t border-gray-300 text-center text-gray-600 text-sm">
            *** End of Question Paper ***
          </div>
        </div>
      </div>
    </div>
  );
}