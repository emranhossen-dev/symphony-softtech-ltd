"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { Plus, FileQuestion, Users, Search, MoreVertical, Edit, Trash2 } from "lucide-react";

interface Quiz {
  id: string;
  title: string;
  description: string;
  course: {
    id: string;
    title: string;
  };
  _count: {
    questions: number;
    attempts: number;
  };
  isActive: boolean;
  createdAt: string;
}

export default function MentorQuizPage() {
  const [quizzes, setQuizzes] = useState<Quiz[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");

  useEffect(() => {
    fetchQuizzes();
  }, []);

  const fetchQuizzes = async () => {
    try {
      setLoading(true);
      const response = await fetch('/api/mentor/quizzes');
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

  const filteredQuizzes = quizzes.filter(quiz => 
    quiz.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
    quiz.course.title.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <div className="space-y-6">
      {/* Header section */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl sm:text-3xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-purple-400 to-indigo-400 drop-shadow-sm">
            Batch Quizzes
          </h1>
          <p className="text-gray-400 text-sm mt-1">Manage quizzes for your assigned batches</p>
        </div>
        <Link 
          href="/mentor/quiz/create"
          className="flex items-center justify-center space-x-2 px-5 py-2.5 bg-gradient-to-r from-purple-600 to-indigo-600 hover:from-purple-500 hover:to-indigo-500 text-white rounded-xl font-medium transition-all duration-300 shadow-lg hover:shadow-indigo-500/25 shrink-0"
        >
          <Plus className="w-5 h-5" />
          <span>Create Quiz</span>
        </Link>
      </div>

      {/* Stats/Overview */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="bg-white/5 border border-white/10 rounded-2xl p-5 backdrop-blur-sm">
          <div className="flex items-center space-x-3 mb-2">
            <div className="p-2 bg-purple-500/20 text-purple-400 rounded-lg">
              <FileQuestion className="w-5 h-5" />
            </div>
            <h3 className="text-gray-400 font-medium text-sm">Total Quizzes</h3>
          </div>
          <p className="text-2xl font-bold text-white">{quizzes.length}</p>
        </div>
      </div>

      {/* Filters and Search */}
      <div className="flex flex-col sm:flex-row gap-4">
        <div className="relative flex-1">
          <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
            <Search className="h-5 w-5 text-gray-400" />
          </div>
          <input
            type="text"
            className="block w-full pl-10 pr-3 py-2.5 border border-white/10 rounded-xl bg-white/5 text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-transparent transition-all backdrop-blur-sm"
            placeholder="Search by quiz title or batch name..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
        </div>
      </div>

      {/* Quiz List */}
      {loading ? (
        <div className="flex justify-center items-center py-20">
          <div className="animate-spin rounded-full h-8 w-8 border-t-2 border-b-2 border-purple-500"></div>
        </div>
      ) : filteredQuizzes.length === 0 ? (
        <div className="bg-white/5 border border-white/10 rounded-2xl p-10 text-center backdrop-blur-sm">
          <div className="inline-flex items-center justify-center w-16 h-16 rounded-full bg-white/5 mb-4">
            <FileQuestion className="w-8 h-8 text-gray-400" />
          </div>
          <h3 className="text-xl font-medium text-white mb-2">No quizzes found</h3>
          <p className="text-gray-400 mb-6 max-w-md mx-auto">
            You haven't created any quizzes yet, or no quizzes match your search criteria.
          </p>
          <Link 
            href="/mentor/quiz/create"
            className="inline-flex items-center space-x-2 px-4 py-2 bg-white/10 hover:bg-white/20 text-white rounded-lg transition-colors"
          >
            <Plus className="w-4 h-4" />
            <span>Create your first quiz</span>
          </Link>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredQuizzes.map((quiz) => (
            <div key={quiz.id} className="bg-white/5 border border-white/10 hover:border-purple-500/50 rounded-2xl overflow-hidden transition-all duration-300 backdrop-blur-sm group flex flex-col">
              <div className="p-5 border-b border-white/5 relative">
                <div className="flex justify-between items-start mb-3">
                  <div className="inline-flex items-center px-2.5 py-1 rounded-full text-xs font-medium bg-purple-500/10 text-purple-400 border border-purple-500/20">
                    {quiz.course.title}
                  </div>
                  <button className="text-gray-400 hover:text-white transition-colors opacity-0 group-hover:opacity-100 focus:opacity-100">
                    <MoreVertical className="w-5 h-5" />
                  </button>
                </div>
                <h3 className="text-lg font-bold text-white mb-1 truncate">{quiz.title}</h3>
                <p className="text-gray-400 text-sm line-clamp-2 min-h-[40px]">{quiz.description}</p>
              </div>
              
              <div className="p-5 bg-black/20 flex-1 flex flex-col justify-between">
                <div className="flex items-center justify-between mb-4">
                  <div className="flex items-center text-sm text-gray-300">
                    <FileQuestion className="w-4 h-4 mr-1.5 text-gray-500" />
                    <span>{quiz._count.questions} Questions</span>
                  </div>
                  <div className="flex items-center text-sm text-gray-300">
                    <Users className="w-4 h-4 mr-1.5 text-gray-500" />
                    <span>{quiz._count.attempts} Attempts</span>
                  </div>
                </div>
                
                <Link 
                  href={`/mentor/quiz/${quiz.id}/results`}
                  className="block w-full py-2.5 bg-white/10 hover:bg-white/20 border border-white/5 text-center text-white rounded-xl text-sm font-medium transition-colors"
                >
                  View Results
                </Link>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
