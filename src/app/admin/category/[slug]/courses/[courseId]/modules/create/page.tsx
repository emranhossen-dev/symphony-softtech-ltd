"use client";

import { useState, useEffect } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { toast } from 'react-hot-toast';
import {
  ArrowLeft,
  BookOpen,
  Download,
  FileText,
  Lock,
  Save,
  Unlock,
  Video,
  Upload
} from 'lucide-react';

interface Course {
  id: string;
  title: string;
}

interface ExistingModule {
  id: string;
  title: string;
  videoUrl: string;
  homework: string;
  description?: string;
  topics?: string[];
  isLocked: boolean;
  order: number;
}

const CreateModulePage = () => {
  const params = useParams();
  const router = useRouter();
  const slug = params.slug as string;
  const courseId = params.courseId as string;

  const [course, setCourse] = useState<Course | null>(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [mode, setMode] = useState<'individual' | 'bulk'>('individual');
  const [existingModules, setExistingModules] = useState<ExistingModule[]>([]);
  
  // Individual mode state
  const [individualData, setIndividualData] = useState({
    title: '',
    videoUrl: '',
    homework: '',
    isLocked: false
  });
  
  // Bulk mode state
  const [bulkJson, setBulkJson] = useState('');

  useEffect(() => {
    fetchCourseInfo();
    fetchExistingModules();
  }, [courseId]);

  const fetchCourseInfo = async () => {
    try {
      const response = await fetch(`/api/admin/courses/${courseId}`, {
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('token')}`
        }
      });
      const data = await response.json();
      
      if (data.success) {
        setCourse(data.course);
      } else {
        setCourse({ id: courseId, title: 'Course' });
      }
    } catch (error) {
      console.error('Error fetching course info:', error);
      setCourse({ id: courseId, title: 'Course' });
    } finally {
      setLoading(false);
    }
  };

  const fetchExistingModules = async () => {
    try {
      const response = await fetch(`/api/admin/courses/${courseId}/modules`, {
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('token')}`
        }
      });
      const data = await response.json();
      if (data.success && data.modules) {
        const modules = data.modules.sort((a: ExistingModule, b: ExistingModule) => a.order - b.order);
        setExistingModules(modules);
        
        // Prefill bulk JSON with existing modules
        if (modules.length > 0) {
          const jsonData = {
            courseTitle: course?.title || 'Course',
            modules: modules.map((m: ExistingModule) => ({
              title: m.title,
              videoUrl: m.videoUrl || '',
              homework: m.homework || '',
              description: m.description || '',
              topics: m.topics || [],
              isLocked: m.isLocked,
              order: m.order
            }))
          };
          setBulkJson(JSON.stringify(jsonData, null, 2));
        }
      }
    } catch (error) {
      console.error('Error fetching existing modules:', error);
    }
  };

  const loadSampleData = () => {
    const sampleData = {
      courseTitle: course?.title || "Sample Course",
      modules: [
        {
          title: "Module 1: Introduction",
          videoUrl: "https://example.com/video1.mp4",
          homework: "Complete the introduction assignment",
          description: "Learn the basics",
          topics: ["Topic 1", "Topic 2"],
          isLocked: false,
          order: 1
        },
        {
          title: "Module 2: Advanced Concepts",
          videoUrl: "https://example.com/video2.mp4",
          homework: "Complete the advanced assignment",
          description: "Deep dive into concepts",
          topics: ["Topic 3", "Topic 4"],
          isLocked: true,
          order: 2
        }
      ]
    };
    setBulkJson(JSON.stringify(sampleData, null, 2));
    toast.success('Sample data loaded');
  };

  const handleIndividualSubmit = async () => {
    if (!individualData.title.trim()) {
      toast.error('Module title is required');
      return;
    }

    setSaving(true);

    try {
      const response = await fetch(`/api/admin/modules`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${localStorage.getItem('token')}`
        },
        body: JSON.stringify({
          title: individualData.title,
          videoUrl: individualData.videoUrl,
          homework: individualData.homework,
          courseId,
          isLocked: individualData.isLocked
        })
      });

      const data = await response.json();
      
      if (data.success) {
        toast.success('Module created successfully');
        setIndividualData({ title: '', videoUrl: '', homework: '', isLocked: false });
        fetchExistingModules();
      } else {
        toast.error(data.error || 'Failed to create module');
      }
    } catch (error) {
      console.error('Error creating module:', error);
      toast.error('Failed to create module');
    } finally {
      setSaving(false);
    }
  };

  const handleBulkSubmit = async () => {
    if (!bulkJson.trim()) {
      toast.error('Please enter module data');
      return;
    }

    try {
      const data = JSON.parse(bulkJson);
      
      if (!data.modules || !Array.isArray(data.modules) || data.modules.length === 0) {
        toast.error('Invalid format. Expected modules array.');
        return;
      }

      setSaving(true);

      const response = await fetch('/api/admin/modules/bulk', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${localStorage.getItem('token')}`
        },
        body: JSON.stringify({
          courseId,
          modules: data.modules
        })
      });

      const result = await response.json();
      
      if (result.success) {
        toast.success(`Successfully uploaded ${result.modules.length} modules`);
        router.push(`/admin/category/${slug}/courses/${courseId}`);
      } else {
        toast.error(result.error || 'Failed to upload modules');
      }
    } catch (error) {
      console.error('Error uploading modules:', error);
      toast.error('Failed to parse JSON or upload modules');
    } finally {
      setSaving(false);
    }
  };

  const handleCancel = () => {
    router.push(`/admin/category/${slug}/courses/${courseId}`);
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-900 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-4 border-blue-600 border-t-transparent mx-auto mb-4"></div>
          <p className="text-gray-400">Loading...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-900 text-white p-6">
      <div className="max-w-4xl mx-auto">
        {/* Header */}
        <div className="mb-8">
          <button
            onClick={handleCancel}
            className="mb-4 inline-flex items-center gap-2 text-sm font-bold text-gray-400 transition-colors hover:text-blue-400"
          >
            <ArrowLeft className="h-4 w-4" />
            Back to Course
          </button>
          <h1 className="text-3xl font-bold text-white">{course?.title || 'Course'}</h1>
          <p className="mt-2 text-gray-400">Add modules to this course</p>
        </div>

        {/* Mode Toggle */}
        <div className="mb-6">
          <div className="flex gap-2 p-1 bg-gray-800 rounded-xl w-fit">
            <button
              onClick={() => setMode('individual')}
              className={`px-6 py-2 rounded-lg text-sm font-bold transition-colors ${
                mode === 'individual'
                  ? 'bg-blue-600 text-white'
                  : 'text-gray-400 hover:text-white'
              }`}
            >
              Individual Upload
            </button>
            <button
              onClick={() => setMode('bulk')}
              className={`px-6 py-2 rounded-lg text-sm font-bold transition-colors ${
                mode === 'bulk'
                  ? 'bg-blue-600 text-white'
                  : 'text-gray-400 hover:text-white'
              }`}
            >
              Bulk Upload
            </button>
          </div>
        </div>

        {/* Individual Mode */}
        {mode === 'individual' && (
          <div className="bg-gray-800 border border-gray-700 rounded-2xl p-6">
            <h2 className="text-xl font-bold text-white mb-6">Add Single Module</h2>
            
            <div className="space-y-4">
              <div>
                <label className="mb-2 flex items-center gap-2 text-sm font-bold text-gray-300">
                  <BookOpen className="h-4 w-4 text-blue-400" />
                  Module Title *
                </label>
                <input
                  type="text"
                  value={individualData.title}
                  onChange={(e) => setIndividualData(prev => ({ ...prev, title: e.target.value }))}
                  placeholder="Enter module title"
                  className="w-full px-4 py-3 bg-gray-700 border border-gray-600 rounded-xl text-white placeholder-gray-400 focus:outline-none focus:border-blue-500"
                />
              </div>

              <div>
                <label className="mb-2 flex items-center gap-2 text-sm font-bold text-gray-300">
                  <Video className="h-4 w-4 text-purple-400" />
                  Video URL
                </label>
                <input
                  type="text"
                  value={individualData.videoUrl}
                  onChange={(e) => setIndividualData(prev => ({ ...prev, videoUrl: e.target.value }))}
                  placeholder="Enter video URL (optional)"
                  className="w-full px-4 py-3 bg-gray-700 border border-gray-600 rounded-xl text-white placeholder-gray-400 focus:outline-none focus:border-purple-500"
                />
              </div>

              <div>
                <label className="mb-2 flex items-center gap-2 text-sm font-bold text-gray-300">
                  <FileText className="h-4 w-4 text-emerald-400" />
                  Homework / Instructions
                </label>
                <textarea
                  value={individualData.homework}
                  onChange={(e) => setIndividualData(prev => ({ ...prev, homework: e.target.value }))}
                  rows={4}
                  placeholder="Enter homework instructions (optional)"
                  className="w-full px-4 py-3 bg-gray-700 border border-gray-600 rounded-xl text-white placeholder-gray-400 focus:outline-none focus:border-emerald-500 resize-none"
                />
              </div>

              <div className="flex items-center gap-3">
                <label className="flex items-center gap-2 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={individualData.isLocked}
                    onChange={(e) => setIndividualData(prev => ({ ...prev, isLocked: e.target.checked }))}
                    className="w-4 h-4 rounded border-gray-600 bg-gray-700 text-blue-600 focus:ring-blue-500"
                  />
                  <span className="text-sm text-gray-300">Lock module for students</span>
                </label>
              </div>

              <div className="flex gap-3 pt-4">
                <button
                  onClick={handleIndividualSubmit}
                  disabled={saving}
                  className="flex-1 bg-blue-600 hover:bg-blue-700 text-white font-bold py-3 rounded-xl transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  {saving ? (
                    <span className="flex items-center justify-center gap-2">
                      <div className="animate-spin rounded-full h-4 w-4 border-2 border-white border-t-transparent"></div>
                      Saving...
                    </span>
                  ) : (
                    <span className="flex items-center justify-center gap-2">
                      <Save className="h-4 w-4" />
                      Save Module
                    </span>
                  )}
                </button>
                <button
                  onClick={handleCancel}
                  className="px-6 py-3 border border-gray-600 text-gray-300 rounded-xl hover:bg-gray-700 transition-colors"
                >
                  Cancel
                </button>
              </div>
            </div>

            {/* Existing Modules Preview */}
            {existingModules.length > 0 && (
              <div className="mt-8 pt-8 border-t border-gray-700">
                <h3 className="text-lg font-bold text-white mb-4">Existing Modules ({existingModules.length})</h3>
                <div className="space-y-2">
                  {existingModules.map((module) => (
                    <div key={module.id} className="flex items-center justify-between p-3 bg-gray-700 rounded-lg">
                      <div className="flex items-center gap-3">
                        <span className="text-gray-400">#{module.order}</span>
                        <span className="text-white font-medium">{module.title}</span>
                      </div>
                      <span className={`text-xs px-2 py-1 rounded ${module.isLocked ? 'bg-orange-900/50 text-orange-400' : 'bg-green-900/50 text-green-400'}`}>
                        {module.isLocked ? <Lock className="h-3 w-3 inline" /> : <Unlock className="h-3 w-3 inline" />}
                      </span>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>
        )}

        {/* Bulk Mode */}
        {mode === 'bulk' && (
          <div className="bg-gray-800 border border-gray-700 rounded-2xl p-6">
            <h2 className="text-xl font-bold text-white mb-6">Bulk Upload Modules</h2>
            
            <div className="space-y-4">
              <button
                onClick={loadSampleData}
                className="flex items-center gap-2 px-4 py-2 bg-gray-700 border border-gray-600 rounded-xl text-gray-300 hover:bg-gray-600 transition-colors"
              >
                <Download className="h-4 w-4" />
                Load Sample Data
              </button>

              <div>
                <label className="mb-2 block text-sm font-bold text-gray-300">
                  Module Data (JSON)
                </label>
                <textarea
                  value={bulkJson}
                  onChange={(e) => setBulkJson(e.target.value)}
                  rows={20}
                  placeholder={`{
  "courseTitle": "Course Name",
  "modules": [
    {
      "title": "Module 1",
      "videoUrl": "https://example.com/video1.mp4",
      "homework": "Complete assignment 1",
      "description": "Introduction",
      "topics": ["Topic 1"],
      "isLocked": false,
      "order": 1
    }
  ]
}`}
                  className="w-full px-4 py-3 bg-gray-700 border border-gray-600 rounded-xl text-white placeholder-gray-400 focus:outline-none focus:border-blue-500 font-mono text-sm resize-none"
                />
              </div>

              <div className="flex gap-3 pt-4">
                <button
                  onClick={handleBulkSubmit}
                  disabled={saving}
                  className="flex-1 bg-blue-600 hover:bg-blue-700 text-white font-bold py-3 rounded-xl transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  {saving ? (
                    <span className="flex items-center justify-center gap-2">
                      <div className="animate-spin rounded-full h-4 w-4 border-2 border-white border-t-transparent"></div>
                      Saving...
                    </span>
                  ) : (
                    <span className="flex items-center justify-center gap-2">
                      <Upload className="h-4 w-4" />
                      Save Modules
                    </span>
                  )}
                </button>
                <button
                  onClick={handleCancel}
                  className="px-6 py-3 border border-gray-600 text-gray-300 rounded-xl hover:bg-gray-700 transition-colors"
                >
                  Cancel
                </button>
              </div>
            </div>

            {/* Existing Modules Info */}
            {existingModules.length > 0 && (
              <div className="mt-8 pt-8 border-t border-gray-700">
                <div className="flex items-center justify-between mb-4">
                  <h3 className="text-lg font-bold text-white">Existing Modules: {existingModules.length}</h3>
                  <span className="text-sm text-gray-400">Data prefilled above</span>
                </div>
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
};

export default CreateModulePage;
