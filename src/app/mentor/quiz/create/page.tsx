"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { ArrowLeft, Plus, Trash2, Save, AlertCircle } from "lucide-react";

interface Course {
  id: string;
  name: string;
}

interface QuestionForm {
  text: string;
  options: string[];
  correctAns: string;
}

export default function CreateQuizPage() {
  const router = useRouter();
  const [courses, setCourses] = useState<Course[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  
  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [courseId, setCourseId] = useState("");
  
  const [questions, setQuestions] = useState<QuestionForm[]>([
    { text: "", options: ["", "", "", ""], correctAns: "" }
  ]);

  useEffect(() => {
    fetchCourses();
  }, []);

  const fetchCourses = async () => {
    try {
      const response = await fetch('/api/mentor/courses');
      if (response.ok) {
        const data = await response.json();
        if (data.success) {
          setCourses(data.courses);
          if (data.courses.length > 0) {
            setCourseId(data.courses[0].id);
          }
        }
      }
    } catch (err) {
      console.error('Failed to fetch courses:', err);
    }
  };

  const addQuestion = () => {
    setQuestions([
      ...questions,
      { text: "", options: ["", "", "", ""], correctAns: "" }
    ]);
  };

  const removeQuestion = (index: number) => {
    if (questions.length > 1) {
      setQuestions(questions.filter((_, i) => i !== index));
    }
  };

  const handleQuestionChange = (index: number, field: string, value: string) => {
    const updated = [...questions];
    if (field === 'text') updated[index].text = value;
    if (field === 'correctAns') updated[index].correctAns = value;
    setQuestions(updated);
  };

  const handleOptionChange = (qIndex: number, optIndex: number, value: string) => {
    const updated = [...questions];
    updated[qIndex].options[optIndex] = value;
    setQuestions(updated);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    setLoading(true);

    try {
      // Validation
      if (!title || !courseId) {
        throw new Error("Title and Batch are required.");
      }
      
      for (let i = 0; i < questions.length; i++) {
        const q = questions[i];
        if (!q.text) throw new Error(`Question ${i + 1} text is required.`);
        if (q.options.some(opt => !opt)) throw new Error(`All options for Question ${i + 1} must be filled.`);
        if (!q.correctAns) throw new Error(`Please select the correct answer for Question ${i + 1}.`);
      }

      const response = await fetch('/api/mentor/quizzes', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          title,
          description,
          courseId,
          questions
        })
      });

      const data = await response.json();
      if (!response.ok) throw new Error(data.error || "Failed to create quiz");

      router.push('/mentor/quiz');
      router.refresh();
    } catch (err: any) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="max-w-4xl mx-auto space-y-6">
      <div className="flex items-center space-x-4">
        <Link href="/mentor/quiz" className="p-2 bg-white/5 hover:bg-white/10 rounded-xl transition-colors">
          <ArrowLeft className="w-5 h-5 text-gray-300" />
        </Link>
        <div>
          <h1 className="text-2xl sm:text-3xl font-bold text-white">Create New Quiz</h1>
          <p className="text-gray-400 text-sm mt-1">Design a quiz for your batch</p>
        </div>
      </div>

      {error && (
        <div className="p-4 bg-red-500/10 border border-red-500/50 rounded-xl flex items-center space-x-3 text-red-400">
          <AlertCircle className="w-5 h-5 shrink-0" />
          <p className="text-sm font-medium">{error}</p>
        </div>
      )}

      <form onSubmit={handleSubmit} className="space-y-6">
        {/* Basic Details */}
        <div className="bg-white/5 border border-white/10 rounded-2xl p-6 backdrop-blur-sm space-y-4">
          <h2 className="text-lg font-bold text-white border-b border-white/5 pb-2">Basic Details</h2>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-2">
              <label className="text-sm font-medium text-gray-300">Quiz Title *</label>
              <input
                type="text"
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                className="w-full bg-black/20 border border-white/10 rounded-xl px-4 py-2.5 text-white focus:outline-none focus:ring-2 focus:ring-purple-500 transition-all"
                placeholder="e.g., JavaScript Fundamentals"
                required
              />
            </div>
            <div className="space-y-2">
              <label className="text-sm font-medium text-gray-300">Select Batch *</label>
              <select
                value={courseId}
                onChange={(e) => setCourseId(e.target.value)}
                className="w-full bg-black/20 border border-white/10 rounded-xl px-4 py-2.5 text-white focus:outline-none focus:ring-2 focus:ring-purple-500 transition-all appearance-none"
                required
              >
                {courses.map(course => (
                  <option key={course.id} value={course.id} className="bg-gray-900">{course.name}</option>
                ))}
              </select>
            </div>
          </div>
          
          <div className="space-y-2">
            <label className="text-sm font-medium text-gray-300">Description (Optional)</label>
            <textarea
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              className="w-full bg-black/20 border border-white/10 rounded-xl px-4 py-2.5 text-white focus:outline-none focus:ring-2 focus:ring-purple-500 transition-all min-h-[100px]"
              placeholder="Instructions or details about the quiz..."
            />
          </div>
        </div>

        {/* Questions */}
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <h2 className="text-lg font-bold text-white">Questions</h2>
          </div>

          {questions.map((q, qIndex) => (
            <div key={qIndex} className="bg-white/5 border border-white/10 rounded-2xl p-6 backdrop-blur-sm space-y-4 relative group transition-all hover:border-purple-500/30">
              <div className="flex justify-between items-start">
                <span className="inline-flex items-center justify-center w-8 h-8 rounded-lg bg-purple-500/20 text-purple-400 font-bold text-sm">
                  {qIndex + 1}
                </span>
                {questions.length > 1 && (
                  <button
                    type="button"
                    onClick={() => removeQuestion(qIndex)}
                    className="text-red-400 hover:text-red-300 hover:bg-red-500/10 p-2 rounded-lg transition-colors"
                  >
                    <Trash2 className="w-5 h-5" />
                  </button>
                )}
              </div>

              <div className="space-y-2">
                <input
                  type="text"
                  value={q.text}
                  onChange={(e) => handleQuestionChange(qIndex, 'text', e.target.value)}
                  className="w-full bg-black/20 border border-white/10 rounded-xl px-4 py-3 text-white text-lg font-medium focus:outline-none focus:ring-2 focus:ring-purple-500 transition-all placeholder:text-gray-500"
                  placeholder="Type your question here..."
                  required
                />
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 pt-2">
                {q.options.map((opt, optIndex) => (
                  <div key={optIndex} className={`flex items-center space-x-3 p-3 rounded-xl border transition-all ${q.correctAns === opt && opt !== "" ? 'border-green-500/50 bg-green-500/10' : 'border-white/10 bg-black/20'}`}>
                    <input
                      type="radio"
                      name={`correct-${qIndex}`}
                      checked={q.correctAns === opt && opt !== ""}
                      onChange={() => handleQuestionChange(qIndex, 'correctAns', opt)}
                      disabled={!opt}
                      className="w-4 h-4 text-purple-500 focus:ring-purple-500 border-gray-600 bg-gray-700"
                    />
                    <input
                      type="text"
                      value={opt}
                      onChange={(e) => {
                        handleOptionChange(qIndex, optIndex, e.target.value);
                        if (q.correctAns === q.options[optIndex] && e.target.value !== q.correctAns) {
                           handleQuestionChange(qIndex, 'correctAns', '');
                        }
                      }}
                      className="w-full bg-transparent border-none text-white focus:outline-none focus:ring-0 p-0 text-sm"
                      placeholder={`Option ${optIndex + 1}`}
                      required
                    />
                  </div>
                ))}
              </div>
            </div>
          ))}

          <button
            type="button"
            onClick={addQuestion}
            className="w-full py-4 border-2 border-dashed border-white/20 hover:border-purple-500/50 rounded-2xl flex items-center justify-center space-x-2 text-gray-400 hover:text-purple-400 transition-all hover:bg-purple-500/5"
          >
            <Plus className="w-5 h-5" />
            <span className="font-medium">Add Another Question</span>
          </button>
        </div>

        {/* Submit */}
        <div className="pt-4 flex justify-end">
          <button
            type="submit"
            disabled={loading}
            className="flex items-center justify-center space-x-2 px-8 py-3 bg-gradient-to-r from-purple-600 to-indigo-600 hover:from-purple-500 hover:to-indigo-500 text-white rounded-xl font-bold transition-all duration-300 shadow-lg hover:shadow-indigo-500/25 disabled:opacity-70"
          >
            {loading ? (
              <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
            ) : (
              <>
                <Save className="w-5 h-5" />
                <span>Publish Quiz</span>
              </>
            )}
          </button>
        </div>
      </form>
    </div>
  );
}
