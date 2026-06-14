"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { FileQuestion, CheckCircle, Clock, BookOpen } from "lucide-react";

interface Quiz {
  id: string;
  title: string;
  description: string;
  courseName: string;
  questionCount: number;
  createdAt: string;
  attempt: {
    score: number;
    totalMarks: number;
    submittedAt: string;
  } | null;
}

export default function StudentQuizPage() {
  const [quizzes, setQuizzes] = useState<Quiz[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchQuizzes();
  }, []);

  const fetchQuizzes = async () => {
    try {
      setLoading(true);
      const response = await fetch('/api/student/quizzes');
      if (response.ok) {
        const data = await response.json();
        if (data.success) {
          setQuizzes(data.quizzes);
        }
      }
    } catch (error) {
      console.error('Failed to fetch quizzes:', error);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-2xl sm:text-3xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-purple-400 to-indigo-400 drop-shadow-sm">
          My Quizzes
        </h1>
        <p className="text-gray-400 text-sm mt-1">Test your knowledge on your enrolled batches</p>
      </div>

      {loading ? (
        <div className="flex justify-center items-center py-20">
          <div className="animate-spin rounded-full h-8 w-8 border-t-2 border-b-2 border-purple-500"></div>
        </div>
      ) : quizzes.length === 0 ? (
        <div className="bg-white/5 border border-white/10 rounded-2xl p-10 text-center backdrop-blur-sm">
          <div className="inline-flex items-center justify-center w-16 h-16 rounded-full bg-white/5 mb-4">
            <FileQuestion className="w-8 h-8 text-gray-400" />
          </div>
          <h3 className="text-xl font-medium text-white mb-2">No quizzes available</h3>
          <p className="text-gray-400 max-w-md mx-auto">
            Your mentors haven't published any quizzes for your batches yet. Check back later!
          </p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {quizzes.map((quiz) => {
            const hasAttempted = quiz.attempt !== null;
            const percentage = hasAttempted ? Math.round((quiz.attempt!.score / quiz.attempt!.totalMarks) * 100) : 0;
            const isPass = percentage >= 50;

            return (
              <div key={quiz.id} className="bg-white/5 border border-white/10 hover:border-purple-500/50 rounded-2xl overflow-hidden transition-all duration-300 backdrop-blur-sm group flex flex-col relative">
                {hasAttempted && (
                  <div className="absolute top-0 right-0 p-3">
                    <div className={`flex items-center space-x-1 px-2.5 py-1 rounded-full text-xs font-bold shadow-lg ${isPass ? 'bg-green-500 text-white' : 'bg-red-500 text-white'}`}>
                      <CheckCircle className="w-3.5 h-3.5" />
                      <span>{percentage}%</span>
                    </div>
                  </div>
                )}
                
                <div className="p-6 border-b border-white/5 flex-1">
                  <div className="inline-flex items-center px-2.5 py-1 rounded-full text-xs font-medium bg-purple-500/10 text-purple-400 border border-purple-500/20 mb-3">
                    <BookOpen className="w-3 h-3 mr-1" /> {quiz.courseName}
                  </div>
                  <h3 className="text-xl font-bold text-white mb-2 line-clamp-2">{quiz.title}</h3>
                  <p className="text-gray-400 text-sm line-clamp-2 min-h-[40px]">{quiz.description}</p>
                </div>
                
                <div className="p-6 bg-black/20 mt-auto">
                  <div className="flex items-center justify-between mb-5">
                    <div className="flex items-center text-sm text-gray-300">
                      <FileQuestion className="w-4 h-4 mr-2 text-purple-400" />
                      <span>{quiz.questionCount} Questions</span>
                    </div>
                    {hasAttempted ? (
                      <div className="text-sm font-medium text-white">
                        Score: <span className={isPass ? 'text-green-400' : 'text-red-400'}>{quiz.attempt!.score}/{quiz.attempt!.totalMarks}</span>
                      </div>
                    ) : (
                      <div className="flex items-center text-sm text-yellow-400">
                        <Clock className="w-4 h-4 mr-1.5" />
                        <span>Pending</span>
                      </div>
                    )}
                  </div>
                  
                  {hasAttempted ? (
                    <button 
                      disabled
                      className="w-full py-3 bg-white/5 border border-white/10 text-gray-400 rounded-xl font-medium cursor-not-allowed"
                    >
                      Already Attempted
                    </button>
                  ) : (
                    <Link 
                      href={`/student/quiz/${quiz.id}`}
                      className="block w-full py-3 bg-gradient-to-r from-purple-600 to-indigo-600 hover:from-purple-500 hover:to-indigo-500 text-center text-white rounded-xl font-bold transition-all shadow-lg shadow-purple-500/25"
                    >
                      Start Quiz
                    </Link>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
