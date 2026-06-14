"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { ArrowLeft, Users, FileQuestion, Calendar, CheckCircle, XCircle } from "lucide-react";

interface Attempt {
  id: string;
  score: number;
  totalMarks: number;
  submittedAt: string;
  student: {
    name: string;
    email: string;
    avatar: string | null;
  };
}

interface QuizDetails {
  id: string;
  title: string;
  description: string;
  course: {
    title: string;
  };
  questions: any[];
  attempts: Attempt[];
  createdAt: string;
}

export default function QuizResultsPage({ params }: { params: { quizId: string } }) {
  const [quiz, setQuiz] = useState<QuizDetails | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchQuizDetails = async () => {
      try {
        const response = await fetch(`/api/mentor/quizzes/${params.quizId}`);
        if (response.ok) {
          const data = await response.json();
          if (data.success) {
            setQuiz(data.quiz);
          }
        }
      } catch (error) {
        console.error('Failed to fetch quiz details:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchQuizDetails();
  }, [params.quizId]);

  if (loading) {
    return (
      <div className="flex justify-center items-center py-20">
        <div className="animate-spin rounded-full h-8 w-8 border-t-2 border-b-2 border-purple-500"></div>
      </div>
    );
  }

  if (!quiz) {
    return (
      <div className="text-center py-20">
        <h2 className="text-xl text-white font-bold">Quiz not found</h2>
        <Link href="/mentor/quiz" className="text-purple-400 mt-4 inline-block hover:underline">Back to Quizzes</Link>
      </div>
    );
  }

  const averageScore = quiz.attempts.length > 0 
    ? Math.round((quiz.attempts.reduce((acc, curr) => acc + curr.score, 0) / quiz.attempts.length) / quiz.questions.length * 100) 
    : 0;

  return (
    <div className="space-y-6 max-w-6xl mx-auto">
      {/* Header section */}
      <div className="flex items-center space-x-4">
        <Link href="/mentor/quiz" className="p-2 bg-white/5 hover:bg-white/10 rounded-xl transition-colors">
          <ArrowLeft className="w-5 h-5 text-gray-300" />
        </Link>
        <div>
          <h1 className="text-2xl sm:text-3xl font-bold text-white">{quiz.title}</h1>
          <div className="flex items-center text-sm text-gray-400 mt-1 space-x-3">
            <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-purple-500/10 text-purple-400 border border-purple-500/20">
              {quiz.course.title}
            </span>
            <span className="flex items-center"><Calendar className="w-3.5 h-3.5 mr-1" /> {new Date(quiz.createdAt).toLocaleDateString()}</span>
          </div>
        </div>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <div className="bg-white/5 border border-white/10 rounded-2xl p-5 backdrop-blur-sm">
          <div className="flex items-center space-x-3 mb-2">
            <div className="p-2 bg-blue-500/20 text-blue-400 rounded-lg">
              <Users className="w-5 h-5" />
            </div>
            <h3 className="text-gray-400 font-medium text-sm">Total Submissions</h3>
          </div>
          <p className="text-2xl font-bold text-white">{quiz.attempts.length}</p>
        </div>
        <div className="bg-white/5 border border-white/10 rounded-2xl p-5 backdrop-blur-sm">
          <div className="flex items-center space-x-3 mb-2">
            <div className="p-2 bg-green-500/20 text-green-400 rounded-lg">
              <CheckCircle className="w-5 h-5" />
            </div>
            <h3 className="text-gray-400 font-medium text-sm">Average Score</h3>
          </div>
          <p className="text-2xl font-bold text-white">{averageScore}%</p>
        </div>
        <div className="bg-white/5 border border-white/10 rounded-2xl p-5 backdrop-blur-sm">
          <div className="flex items-center space-x-3 mb-2">
            <div className="p-2 bg-purple-500/20 text-purple-400 rounded-lg">
              <FileQuestion className="w-5 h-5" />
            </div>
            <h3 className="text-gray-400 font-medium text-sm">Total Questions</h3>
          </div>
          <p className="text-2xl font-bold text-white">{quiz.questions.length}</p>
        </div>
      </div>

      {/* Results Table */}
      <div className="bg-white/5 border border-white/10 rounded-2xl overflow-hidden backdrop-blur-sm">
        <div className="p-5 border-b border-white/10">
          <h2 className="text-lg font-bold text-white">Student Submissions</h2>
        </div>
        
        {quiz.attempts.length === 0 ? (
          <div className="p-10 text-center">
            <Users className="w-10 h-10 text-gray-500 mx-auto mb-3" />
            <p className="text-gray-400">No students have taken this quiz yet.</p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="bg-black/20 text-gray-400 text-xs uppercase tracking-wider">
                  <th className="p-4 font-medium">Student</th>
                  <th className="p-4 font-medium">Score</th>
                  <th className="p-4 font-medium">Percentage</th>
                  <th className="p-4 font-medium">Submitted At</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-white/5">
                {quiz.attempts.map((attempt) => {
                  const percentage = Math.round((attempt.score / attempt.totalMarks) * 100);
                  const isPass = percentage >= 50;
                  
                  return (
                    <tr key={attempt.id} className="hover:bg-white/5 transition-colors">
                      <td className="p-4">
                        <div className="flex items-center space-x-3">
                          <div className="w-8 h-8 rounded-full bg-purple-500/20 text-purple-400 flex items-center justify-center font-bold text-xs shrink-0 overflow-hidden">
                            {attempt.student.avatar ? (
                              <img src={attempt.student.avatar} alt={attempt.student.name} className="w-full h-full object-cover" />
                            ) : (
                              attempt.student.name.charAt(0)
                            )}
                          </div>
                          <div>
                            <p className="text-sm font-medium text-white">{attempt.student.name}</p>
                            <p className="text-xs text-gray-400">{attempt.student.email}</p>
                          </div>
                        </div>
                      </td>
                      <td className="p-4">
                        <span className="text-sm font-bold text-white">{attempt.score}</span>
                        <span className="text-sm text-gray-400"> / {attempt.totalMarks}</span>
                      </td>
                      <td className="p-4">
                        <span className={`inline-flex items-center px-2.5 py-1 rounded-full text-xs font-bold ${isPass ? 'bg-green-500/10 text-green-400 border border-green-500/20' : 'bg-red-500/10 text-red-400 border border-red-500/20'}`}>
                          {percentage}%
                        </span>
                      </td>
                      <td className="p-4 text-sm text-gray-400">
                        {new Date(attempt.submittedAt).toLocaleString()}
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
}
