"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { ArrowLeft, CheckCircle, XCircle, AlertCircle, HelpCircle, Trophy } from "lucide-react";

interface Question {
  id: string;
  text: string;
  options: string[];
  order: number;
}

interface QuizData {
  id: string;
  title: string;
  description: string;
  questions: Question[];
  hasAttempted: boolean;
}

interface ResultDetail {
  questionId: string;
  text: string;
  options: string[];
  selectedOption: string | null;
  correctAns: string;
  isCorrect: boolean;
}

export default function StudentQuizAttendPage({ params }: { params: { quizId: string } }) {
  const router = useRouter();
  const [quiz, setQuiz] = useState<QuizData | null>(null);
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState("");
  
  // State for student's answers: Record<questionId, selectedOption>
  const [answers, setAnswers] = useState<Record<string, string>>({});
  
  // State for modal/results
  const [showModal, setShowModal] = useState(false);
  const [result, setResult] = useState<{
    score: number;
    totalMarks: number;
    details: ResultDetail[];
  } | null>(null);

  useEffect(() => {
    fetchQuiz();
  }, []);

  const fetchQuiz = async () => {
    try {
      const response = await fetch(`/api/student/quizzes/${params.quizId}`);
      const data = await response.json();
      if (data.success) {
        if (data.quiz.hasAttempted) {
          setError("You have already attempted this quiz.");
        } else {
          setQuiz(data.quiz);
        }
      } else {
        setError(data.error || "Failed to load quiz.");
      }
    } catch (err) {
      setError("An error occurred while loading the quiz.");
    } finally {
      setLoading(false);
    }
  };

  const handleSelectOption = (questionId: string, option: string) => {
    setAnswers(prev => ({
      ...prev,
      [questionId]: option
    }));
  };

  const handleSubmit = async () => {
    if (!quiz) return;
    
    // Check if all questions are answered
    const unanswered = quiz.questions.filter(q => !answers[q.id]);
    if (unanswered.length > 0) {
      if (!confirm(`You have ${unanswered.length} unanswered question(s). Are you sure you want to submit?`)) {
        return;
      }
    }

    setSubmitting(true);
    try {
      const response = await fetch(`/api/student/quizzes/${params.quizId}/submit`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ answers })
      });
      
      const data = await response.json();
      if (data.success) {
        setResult({
          score: data.score,
          totalMarks: data.totalMarks,
          details: data.resultDetails
        });
        setShowModal(true);
      } else {
        setError(data.error || "Failed to submit quiz.");
      }
    } catch (err) {
      setError("An error occurred while submitting the quiz.");
    } finally {
      setSubmitting(false);
    }
  };

  if (loading) {
    return (
      <div className="flex justify-center items-center py-32">
        <div className="animate-spin rounded-full h-10 w-10 border-t-2 border-b-2 border-purple-500"></div>
      </div>
    );
  }

  if (error || !quiz) {
    return (
      <div className="max-w-2xl mx-auto py-20 text-center space-y-6">
        <div className="inline-flex items-center justify-center w-20 h-20 rounded-full bg-red-500/10 mb-4">
          <AlertCircle className="w-10 h-10 text-red-500" />
        </div>
        <h2 className="text-2xl font-bold text-white">Oops! Cannot access quiz</h2>
        <p className="text-gray-400">{error}</p>
        <Link href="/student/quiz" className="inline-block px-6 py-3 bg-purple-600 hover:bg-purple-700 text-white rounded-xl font-medium transition-colors">
          Return to Quizzes
        </Link>
      </div>
    );
  }

  // If results are available and modal is showing, display the Results View
  if (showModal && result) {
    const percentage = Math.round((result.score / result.totalMarks) * 100);
    const isPass = percentage >= 50;

    return (
      <div className="max-w-4xl mx-auto space-y-8 animate-in fade-in zoom-in duration-500">
        <div className="bg-gradient-to-b from-[#1a1f4c] to-black/40 border border-purple-500/30 rounded-3xl p-8 md:p-12 text-center backdrop-blur-xl relative overflow-hidden shadow-2xl shadow-purple-900/20">
          <div className="absolute -top-24 -right-24 w-48 h-48 bg-purple-600 rounded-full mix-blend-multiply filter blur-3xl opacity-50 animate-blob"></div>
          <div className="absolute -bottom-24 -left-24 w-48 h-48 bg-indigo-600 rounded-full mix-blend-multiply filter blur-3xl opacity-50 animate-blob animation-delay-2000"></div>
          
          <div className="relative z-10">
            <div className="inline-flex items-center justify-center w-20 h-20 rounded-full bg-gradient-to-tr from-purple-600 to-indigo-500 shadow-lg shadow-purple-500/30 mb-6">
              <Trophy className="w-10 h-10 text-white" />
            </div>
            <h1 className="text-3xl md:text-5xl font-extrabold text-white mb-4">Welcome to Your Results!</h1>
            <p className="text-lg text-purple-200 mb-8">You have successfully completed <span className="font-bold text-white">"{quiz.title}"</span></p>
            
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4 max-w-2xl mx-auto mb-10">
              <div className="bg-black/30 border border-white/10 rounded-2xl p-4">
                <p className="text-gray-400 text-xs uppercase tracking-wider mb-1">Score</p>
                <p className="text-3xl font-bold text-white">{result.score}<span className="text-lg text-gray-500">/{result.totalMarks}</span></p>
              </div>
              <div className="bg-black/30 border border-white/10 rounded-2xl p-4">
                <p className="text-gray-400 text-xs uppercase tracking-wider mb-1">Percentage</p>
                <p className={`text-3xl font-bold ${isPass ? 'text-green-400' : 'text-red-400'}`}>{percentage}%</p>
              </div>
              <div className="bg-black/30 border border-white/10 rounded-2xl p-4">
                <p className="text-gray-400 text-xs uppercase tracking-wider mb-1">Correct</p>
                <p className="text-3xl font-bold text-green-400">{result.details.filter(d => d.isCorrect).length}</p>
              </div>
              <div className="bg-black/30 border border-white/10 rounded-2xl p-4">
                <p className="text-gray-400 text-xs uppercase tracking-wider mb-1">Incorrect</p>
                <p className="text-3xl font-bold text-red-400">{result.details.filter(d => !d.isCorrect).length}</p>
              </div>
            </div>

            <button 
              onClick={() => {
                setShowModal(false); // To see detailed review below
                window.scrollTo({ top: 500, behavior: 'smooth' });
              }}
              className="px-8 py-3 bg-white/10 hover:bg-white/20 text-white rounded-xl font-medium transition-colors border border-white/20"
            >
              Review Answers Below
            </button>
          </div>
        </div>

        {/* Detailed Review Section */}
        <div className="space-y-6 pt-4">
          <div className="flex items-center justify-between">
            <h2 className="text-2xl font-bold text-white">Detailed Review</h2>
            <Link href="/student/quiz" className="text-purple-400 hover:text-purple-300 text-sm font-medium">
              Back to Quizzes
            </Link>
          </div>

          {result.details.map((item, index) => (
            <div key={item.questionId} className={`bg-white/5 border ${item.isCorrect ? 'border-green-500/30' : 'border-red-500/30'} rounded-2xl p-6 backdrop-blur-sm relative overflow-hidden`}>
              <div className={`absolute top-0 left-0 w-1 h-full ${item.isCorrect ? 'bg-green-500' : 'bg-red-500'}`}></div>
              
              <div className="flex items-start justify-between mb-4">
                <h3 className="text-lg font-medium text-white pl-3">
                  <span className="text-gray-400 mr-2">{index + 1}.</span> {item.text}
                </h3>
                {item.isCorrect ? (
                  <CheckCircle className="w-6 h-6 text-green-500 shrink-0" />
                ) : (
                  <XCircle className="w-6 h-6 text-red-500 shrink-0" />
                )}
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-3 pl-3">
                {item.options.map((opt, optIndex) => {
                  const isSelected = item.selectedOption === opt;
                  const isActuallyCorrect = item.correctAns === opt;
                  
                  let optionClass = "bg-black/20 border-white/10 text-gray-300";
                  let icon = <div className="w-5 h-5 rounded-full border border-gray-600 mr-3 shrink-0"></div>;

                  if (isActuallyCorrect) {
                    optionClass = "bg-green-500/10 border-green-500/50 text-green-300 font-medium";
                    icon = <CheckCircle className="w-5 h-5 text-green-500 mr-3 shrink-0" />;
                  } else if (isSelected && !isActuallyCorrect) {
                    optionClass = "bg-red-500/10 border-red-500/50 text-red-300";
                    icon = <XCircle className="w-5 h-5 text-red-500 mr-3 shrink-0" />;
                  } else if (isSelected) {
                     // Selected but handled in isActuallyCorrect above
                  }

                  return (
                    <div key={optIndex} className={`flex items-center p-3 rounded-xl border ${optionClass} transition-all`}>
                      {icon}
                      <span className="text-sm">{opt}</span>
                    </div>
                  );
                })}
              </div>

              {!item.isCorrect && (
                <div className="mt-4 pl-3 flex items-center p-3 bg-blue-500/10 border border-blue-500/20 rounded-xl text-blue-300 text-sm">
                  <AlertCircle className="w-4 h-4 mr-2 shrink-0 text-blue-400" />
                  <p>The correct answer is: <strong className="font-bold">{item.correctAns}</strong></p>
                </div>
              )}
            </div>
          ))}

          <div className="pt-8 pb-12 flex justify-center">
            <Link href="/student/quiz" className="px-8 py-3 bg-purple-600 hover:bg-purple-700 text-white rounded-xl font-bold shadow-lg shadow-purple-600/20 transition-all">
              Return to Dashboard
            </Link>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-4xl mx-auto space-y-8 pb-20">
      {/* Quiz Header */}
      <div className="bg-gradient-to-r from-[#1a1f4c] to-[#0d1b3e] border border-purple-500/30 rounded-3xl p-8 backdrop-blur-sm relative overflow-hidden shadow-xl">
        <div className="absolute right-0 top-0 w-64 h-64 bg-purple-500/10 rounded-full blur-3xl"></div>
        <div className="relative z-10">
          <div className="flex items-center space-x-4 mb-4">
            <Link href="/student/quiz" className="p-2 bg-white/10 hover:bg-white/20 rounded-xl transition-colors">
              <ArrowLeft className="w-5 h-5 text-white" />
            </Link>
            <span className="px-3 py-1 bg-purple-500/20 text-purple-300 rounded-full text-xs font-bold uppercase tracking-wider">
              Quiz Assesment
            </span>
          </div>
          <h1 className="text-3xl md:text-4xl font-bold text-white mb-2">{quiz.title}</h1>
          {quiz.description && <p className="text-purple-200/80 max-w-2xl">{quiz.description}</p>}
          
          <div className="flex items-center space-x-6 mt-6 pt-6 border-t border-white/10">
            <div className="flex items-center text-gray-300">
              <HelpCircle className="w-5 h-5 mr-2 text-purple-400" />
              <span className="font-medium">{quiz.questions.length} Questions</span>
            </div>
            <div className="flex items-center text-gray-300">
              <AlertCircle className="w-5 h-5 mr-2 text-yellow-400" />
              <span className="font-medium text-sm">Select one best answer per question</span>
            </div>
          </div>
        </div>
      </div>

      {/* Questions Form */}
      <div className="space-y-6">
        {quiz.questions.map((q, qIndex) => (
          <div key={q.id} className="bg-white/5 border border-white/10 rounded-2xl p-6 md:p-8 backdrop-blur-sm transition-all hover:border-purple-500/30 shadow-lg">
            <h3 className="text-xl font-medium text-white mb-6 leading-relaxed">
              <span className="inline-flex items-center justify-center w-8 h-8 bg-purple-500/20 text-purple-400 rounded-lg text-sm font-bold mr-3">
                {qIndex + 1}
              </span>
              {q.text}
            </h3>
            
            <div className="space-y-3 pl-11">
              {q.options.map((opt, optIndex) => {
                const isSelected = answers[q.id] === opt;
                
                return (
                  <label 
                    key={optIndex} 
                    className={`flex items-center p-4 rounded-xl border cursor-pointer transition-all ${
                      isSelected 
                        ? 'bg-purple-600/20 border-purple-500 shadow-[0_0_15px_rgba(168,85,247,0.15)] text-white' 
                        : 'bg-black/30 border-white/5 hover:border-white/20 hover:bg-black/40 text-gray-300'
                    }`}
                  >
                    <div className="relative flex items-center justify-center w-6 h-6 mr-4 shrink-0">
                      <input
                        type="radio"
                        name={`question-${q.id}`}
                        value={opt}
                        checked={isSelected}
                        onChange={() => handleSelectOption(q.id, opt)}
                        className="opacity-0 absolute inset-0 w-full h-full cursor-pointer"
                      />
                      <div className={`w-5 h-5 rounded-full border-2 flex items-center justify-center transition-all ${
                        isSelected ? 'border-purple-400' : 'border-gray-500'
                      }`}>
                        {isSelected && <div className="w-2.5 h-2.5 rounded-full bg-purple-400"></div>}
                      </div>
                    </div>
                    <span className={`text-base ${isSelected ? 'font-medium' : ''}`}>{opt}</span>
                  </label>
                );
              })}
            </div>
          </div>
        ))}
      </div>

      {/* Submit Action */}
      <div className="sticky bottom-6 z-20 flex justify-center md:justify-end mt-10">
        <div className="bg-gray-900/80 p-2 rounded-2xl backdrop-blur-md border border-white/10 shadow-2xl flex items-center space-x-4 w-full md:w-auto">
          <div className="hidden md:block text-gray-400 text-sm font-medium px-4">
            Answered: {Object.keys(answers).length} / {quiz.questions.length}
          </div>
          <button
            onClick={handleSubmit}
            disabled={submitting || Object.keys(answers).length === 0}
            className="flex-1 md:flex-none px-8 py-3.5 bg-gradient-to-r from-purple-600 to-indigo-600 hover:from-purple-500 hover:to-indigo-500 disabled:from-gray-700 disabled:to-gray-800 text-white rounded-xl font-bold shadow-lg shadow-purple-500/25 transition-all flex items-center justify-center"
          >
            {submitting ? (
              <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin"></div>
            ) : (
              <span>Submit Quiz Answers</span>
            )}
          </button>
        </div>
      </div>
    </div>
  );
}
