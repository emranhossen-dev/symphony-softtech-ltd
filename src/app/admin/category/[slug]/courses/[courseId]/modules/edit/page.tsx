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
  Plus as PlusIcon,
  Save,
  Trash2 as TrashIcon,
  Unlock,
  Video,
  Upload,
  Edit,
  Eye,
  Trash
} from 'lucide-react';

interface ModuleFormData {
  id?: string; // For existing modules
  title: string;
  videoUrl: string;
  homework: string;
  isLocked: boolean;
  isNew?: boolean; // For new modules
}

interface Course {
  id: string;
  title: string;
  slug?: string;
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

const EditModulesPage = () => {
  const params = useParams();
  const router = useRouter();
  const slug = params.slug as string;
  const courseId = params.courseId as string;

  const [course, setCourse] = useState<Course | null>(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [mode, setMode] = useState<'individual' | 'bulk'>('individual');
  const [existingModules, setExistingModules] = useState<ExistingModule[]>([]);
  const [moduleForms, setModuleForms] = useState<ModuleFormData[]>([]);
  
  // Bulk mode state
  const [bulkJson, setBulkJson] = useState('');

  useEffect(() => {
    fetchCourseInfo();
  }, [courseId]);

  // Fetch existing modules when course data is available
  useEffect(() => {
    if (course) {
      fetchExistingModules();
    }
  }, [course]);

  // Initialize module forms when existing modules are loaded
  useEffect(() => {
    if (existingModules.length > 0) {
      // Create forms for existing modules
      const existingForms = existingModules.map(module => ({
        id: module.id,
        title: module.title,
        videoUrl: module.videoUrl || '',
        homework: module.homework || '',
        isLocked: module.isLocked,
        isNew: false
      }));
      setModuleForms(existingForms);
    } else {
      // Add one empty form for new module
      setModuleForms([{
        title: '',
        videoUrl: '',
        homework: '',
        isLocked: false,
        isNew: true
      }]);
    }
  }, [existingModules]);

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
      // Use course.id (database ID) for API calls, not courseId (slug)
      const courseDbId = course?.id || courseId;
      console.log('Fetching modules for course:', courseDbId);
      
      const response = await fetch(`/api/admin/courses/${courseDbId}/modules`, {
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('token')}`
        }
      });
      const data = await response.json();
      
      console.log('Modules API Response:', data);
      
      if (data.success && data.modules) {
        const modules = data.modules.sort((a: ExistingModule, b: ExistingModule) => a.order - b.order);
        setExistingModules(modules);
        
        console.log('Existing modules loaded:', modules.length);
        
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
      } else {
        console.log('No existing modules found or API error');
        setExistingModules([]);
        // Initialize with one empty form
        setModuleForms([{
          title: '',
          videoUrl: '',
          homework: '',
          isLocked: false,
          isNew: true
        }]);
      }
    } catch (error) {
      console.error('Error fetching existing modules:', error);
      setExistingModules([]);
      setModuleForms([{
        title: '',
        videoUrl: '',
        homework: '',
        isLocked: false,
        isNew: true
      }]);
    }
  };

  const addNewModuleForm = () => {
    setModuleForms(prev => [...prev, {
      title: '',
      videoUrl: '',
      homework: '',
      isLocked: false,
      isNew: true
    }]);
  };

  const updateModuleForm = (index: number, field: keyof ModuleFormData, value: any) => {
    setModuleForms(prev => {
      const updated = [...prev];
      updated[index] = { ...updated[index], [field]: value };
      return updated;
    });
  };

  const removeModuleForm = (index: number) => {
    setModuleForms(prev => prev.filter((_, i) => i !== index));
  };

  const deleteModule = async (moduleId: string, moduleTitle: string) => {
    if (!confirm(`Are you sure you want to delete "${moduleTitle}"? This action cannot be undone.`)) {
      return;
    }

    // Use course.id (database ID) for API calls, not courseId (slug)
    const courseDbId = course?.id || courseId;
    console.log('Deleting module for course:', courseDbId);

    try {
      const response = await fetch(`/api/admin/courses/${courseDbId}/modules/${moduleId}`, {
        method: 'DELETE',
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('token')}`
        }
      });

      const data = await response.json();
      
      if (data.success) {
        toast.success('Module deleted successfully');
        await fetchExistingModules();
      } else {
        toast.error(data.error || 'Failed to delete module');
      }
    } catch (error) {
      console.error('Error deleting module:', error);
      toast.error('Failed to delete module');
    }
  };

  const handleIndividualSubmit = async () => {
    // Validate all forms
    const validForms = moduleForms.filter(form => form.title.trim());
    
    if (validForms.length === 0) {
      toast.error('Please add at least one module with a title');
      return;
    }

    // Use course.id (database ID) for API calls, not courseId (slug)
    const courseDbId = course?.id || courseId;
    console.log('Saving modules for course:', courseDbId);

    setSaving(true);

    try {
      let successCount = 0;
      let errorCount = 0;

      // Process each form
      for (const formData of validForms) {
        try {
          const response = await fetch(`/api/admin/courses/${courseDbId}/modules`, {
            method: formData.id ? 'PUT' : 'POST',
            headers: {
              'Content-Type': 'application/json',
              'Authorization': `Bearer ${localStorage.getItem('token')}`
            },
            body: JSON.stringify({
              ...(formData.id && { id: formData.id }),
              title: formData.title,
              videoUrl: formData.videoUrl,
              homework: formData.homework,
              courseId,
              isLocked: formData.isLocked
            })
          });

          const data = await response.json();
          
          if (data.success) {
            successCount++;
          } else {
            errorCount++;
            console.error('Failed to save module:', formData.title, data.error);
          }
        } catch (error) {
          errorCount++;
          console.error('Error saving module:', formData.title, error);
        }
      }

      // Refresh the modules list
      await fetchExistingModules();
      
      // Show results
      if (successCount > 0 && errorCount === 0) {
        toast.success(`Successfully saved ${successCount} modules`);
      } else if (successCount > 0) {
        toast(`Saved ${successCount} modules, ${errorCount} failed`, { icon: '⚠️' });
      } else {
        toast.error(`Failed to save any modules. Please check your data.`);
      }
      
    } catch (error) {
      console.error('Error saving modules:', error);
      toast.error('Failed to save modules');
    } finally {
      setSaving(false);
    }
  };

  const handleBulkSubmit = async () => {
    if (!bulkJson.trim()) {
      toast.error('Please enter module data');
      return;
    }

    setSaving(true);

    try {
      console.log('Raw bulk JSON:', bulkJson);
      const data = JSON.parse(bulkJson);
      console.log('Parsed data:', data);
      console.log('Data.modules:', data.modules);
      console.log('Is array?', Array.isArray(data.modules));
      console.log('Length:', data.modules?.length);
      
      if (!data.modules || !Array.isArray(data.modules) || data.modules.length === 0) {
        console.error('Validation failed:', {
          hasModules: !!data.modules,
          isArray: Array.isArray(data.modules),
          length: data.modules?.length
        });
        toast.error('Invalid format. Expected modules array.');
        return;
      }

      // Use course.id (database ID) for API calls, not courseId (slug)
      const courseDbId = course?.id || courseId;
      console.log('Creating modules for course:', courseDbId);

      let successCount = 0;
      let errorCount = 0;
      
      // Process each module individually
      for (const moduleData of data.modules) {
        try {
          console.log('Creating module:', moduleData.title);
          const requestBody = {
            title: moduleData.title,
            videoUrl: moduleData.videoUrl || '',
            homework: moduleData.homework || '',
            courseId: courseDbId,
            isLocked: moduleData.isLocked || false
          };
          console.log('Request body:', requestBody);
          
          const response = await fetch(`/api/admin/courses/${courseDbId}/modules`, {
            method: 'POST',
            headers: {
              'Content-Type': 'application/json',
              'Authorization': `Bearer ${localStorage.getItem('token')}`
            },
            body: JSON.stringify(requestBody)
          });

          console.log('Response status:', response.status);
          const result = await response.json();
          console.log('Response body:', result);
          
          if (result.success) {
            successCount++;
            console.log('✅ Module created successfully:', moduleData.title);
          } else {
            errorCount++;
            console.error('❌ Failed to create module:', moduleData.title, result.error);
          }
        } catch (error) {
          errorCount++;
          console.error('❌ Error creating module:', moduleData.title, error);
        }
      }

      // Refresh the modules list
      await fetchExistingModules();
      
      // Show results
      if (successCount > 0 && errorCount === 0) {
        toast.success(`Successfully created ${successCount} modules`);
      } else if (successCount > 0) {
        toast(`Created ${successCount} modules, ${errorCount} failed`, { icon: '⚠️' });
      } else {
        toast.error(`Failed to create any modules. Please check your data format.`);
      }
      
    } catch (error) {
      if (error instanceof SyntaxError) {
        toast.error('Invalid JSON format. Please check your syntax.');
      } else {
        toast.error('Failed to process modules');
      }
      console.error('Error in bulk upload:', error);
    } finally {
      setSaving(false);
    }
  };

  const loadSampleData = () => {
    const sampleData = {
      courseTitle: course?.title || 'Sample Course',
      modules: [
        {
          title: 'Introduction to the Course',
          videoUrl: 'https://example.com/intro-video.mp4',
          homework: 'Complete the course introduction quiz and read the first chapter.',
          description: 'Get started with the basics and course overview',
          topics: ['Introduction', 'Course Overview', 'Learning Objectives'],
          isLocked: false,
          order: 1
        },
        {
          title: 'Module 2: Core Concepts',
          videoUrl: 'https://example.com/core-concepts.mp4',
          homework: 'Practice exercises 1-10 from the workbook',
          description: 'Deep dive into fundamental concepts',
          topics: ['Fundamentals', 'Theory', 'Practical Examples'],
          isLocked: false,
          order: 2
        },
        {
          title: 'Module 3: Advanced Topics',
          videoUrl: 'https://example.com/advanced-topics.mp4',
          homework: 'Complete the advanced assignment and submit project',
          description: 'Explore advanced concepts and applications',
          topics: ['Advanced Theory', 'Case Studies', 'Best Practices'],
          isLocked: true,
          order: 3
        },
        {
          title: 'Module 4: Practical Implementation',
          videoUrl: 'https://example.com/practical-implementation.mp4',
          homework: 'Build a complete project using learned concepts',
          description: 'Apply knowledge to real-world scenarios',
          topics: ['Hands-on Practice', 'Project Work', 'Troubleshooting'],
          isLocked: true,
          order: 4
        },
        {
          title: 'Final Assessment',
          videoUrl: 'https://example.com/final-assessment.mp4',
          homework: 'Complete final exam and submit portfolio',
          description: 'Final evaluation and certification',
          topics: ['Final Exam', 'Portfolio Review', 'Certification'],
          isLocked: true,
          order: 5
        }
      ]
    };
    
    setBulkJson(JSON.stringify(sampleData, null, 2));
    toast.success('Sample data loaded successfully!');
  };

  const handleCancel = () => {
    router.push(`/admin/category/${slug}/courses/${course?.slug || courseId}`);
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
    <div className="min-h-screen bg-gray-900">
      {/* Header */}
      <div className="bg-gray-800 border-b border-gray-700">
        <div className="max-w-7xl mx-auto px-4 py-6">
          <div className="flex items-center justify-between">
            <div>
              <button
                onClick={handleCancel}
                className="mb-4 inline-flex items-center gap-2 text-sm font-bold text-gray-400 transition-colors hover:text-blue-400"
              >
                <ArrowLeft className="h-4 w-4" />
                Back to Course
              </button>
              
              <h1 className="text-2xl font-bold text-white mb-2">
                Manage Modules
              </h1>
              <p className="text-gray-400">
                {course?.title || 'Course'} — Add, edit, delete, and manage modules
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* Mode Toggle */}
      <div className="bg-gray-800 border-b border-gray-700">
        <div className="max-w-7xl mx-auto px-4 py-4">
          <div className="flex items-center gap-4">
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
      </div>

      {/* Individual Mode */}
      {mode === 'individual' && (
        <div className="max-w-7xl mx-auto px-4 py-8">
          <div className="bg-gray-800 border border-gray-700 rounded-2xl p-6">
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-xl font-bold text-white">
                {existingModules.length > 0 ? 'Manage Modules' : 'Add Modules'}
              </h2>
              <button
                onClick={addNewModuleForm}
                className="flex items-center gap-2 px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg transition-colors"
              >
                <PlusIcon className="h-4 w-4" />
                Add Another Module
              </button>
            </div>
            
            <div className="space-y-6">
              {moduleForms.map((formData, index) => (
                <div key={formData.id || `new-${index}`} className="border border-gray-600 rounded-xl p-6 relative">
                  {/* Module Header */}
                  <div className="flex items-center justify-between mb-4">
                    <h3 className="text-lg font-semibold text-white">
                      {formData.isNew ? (
                        <span className="flex items-center gap-2">
                          <PlusIcon className="h-5 w-5 text-blue-400" />
                          New Module #{index + 1}
                        </span>
                      ) : (
                        <span className="flex items-center gap-2">
                          <BookOpen className="h-5 w-5 text-green-400" />
                          Module #{index + 1}
                        </span>
                      )}
                    </h3>
                    <div className="flex items-center gap-2">
                      {!formData.isNew && (
                        <button
                          onClick={() => deleteModule(formData.id!, formData.title)}
                          className="text-red-400 hover:text-red-300 transition-colors"
                          title="Delete Module"
                        >
                          <Trash className="h-4 w-4" />
                        </button>
                      )}
                      {moduleForms.length > 1 && (
                        <button
                          onClick={() => removeModuleForm(index)}
                          className="text-red-400 hover:text-red-300 transition-colors"
                          title="Remove Form"
                        >
                          <TrashIcon className="h-4 w-4" />
                        </button>
                      )}
                    </div>
                  </div>

                  {/* Module Form Fields */}
                  <div className="space-y-4">
                    <div>
                      <label className="mb-2 flex items-center gap-2 text-sm font-bold text-gray-300">
                        <BookOpen className="h-4 w-4 text-blue-400" />
                        Module Title *
                      </label>
                      <input
                        type="text"
                        value={formData.title}
                        onChange={(e) => updateModuleForm(index, 'title', e.target.value)}
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
                        value={formData.videoUrl}
                        onChange={(e) => updateModuleForm(index, 'videoUrl', e.target.value)}
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
                        value={formData.homework}
                        onChange={(e) => updateModuleForm(index, 'homework', e.target.value)}
                        rows={4}
                        placeholder="Enter homework instructions (optional)"
                        className="w-full px-4 py-3 bg-gray-700 border border-gray-600 rounded-xl text-white placeholder-gray-400 focus:outline-none focus:border-emerald-500 resize-none"
                      />
                    </div>

                    <div className="flex items-center gap-3">
                      <label className="flex items-center gap-2 cursor-pointer">
                        <input
                          type="checkbox"
                          checked={formData.isLocked}
                          onChange={(e) => updateModuleForm(index, 'isLocked', e.target.checked)}
                          className="w-4 h-4 rounded border-gray-600 bg-gray-700 text-blue-600 focus:ring-blue-500"
                        />
                        <span className="text-sm text-gray-300">Lock module for students</span>
                      </label>
                    </div>
                  </div>
                </div>
              ))}
            </div>

            {/* Action Buttons */}
            <div className="flex gap-3 mt-6 pt-6 border-t border-gray-700">
              <button
                onClick={handleIndividualSubmit}
                disabled={saving}
                className="flex-1 bg-blue-600 hover:bg-blue-700 text-white font-bold py-3 rounded-xl transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {saving ? (
                  <span className="flex items-center justify-center gap-2">
                    <div className="animate-spin rounded-full h-4 w-4 border-2 border-white border-t-transparent"></div>
                    Saving All Modules...
                  </span>
                ) : (
                  <span className="flex items-center justify-center gap-2">
                    <Save className="h-4 w-4" />
                    Save All Modules ({moduleForms.filter(f => f.title.trim()).length})
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
        </div>
      )}

      {/* Bulk Mode */}
      {mode === 'bulk' && (
        <div className="max-w-7xl mx-auto px-4 py-8">
          <div className="bg-gray-800 border border-gray-700 rounded-2xl p-6">
            <h2 className="text-xl font-bold text-white mb-6">Bulk Upload Modules</h2>
            
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <label className="flex items-center gap-2 text-sm font-bold text-gray-300">
                  <Upload className="h-4 w-4" />
                  Module Data (JSON Format)
                </label>
                <button
                  onClick={loadSampleData}
                  className="flex items-center gap-2 px-4 py-2 bg-purple-600 hover:bg-purple-700 text-white text-sm font-bold rounded-lg transition-colors"
                >
                  <Download className="h-4 w-4" />
                  Load Sample Data
                </button>
              </div>
              <div>
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
      "homework": "Assignment details",
      "isLocked": false,
      "order": 1
    }
  ]
}`}
                  className="w-full px-4 py-3 bg-gray-700 border border-gray-600 rounded-xl text-white placeholder-gray-400 focus:outline-none focus:border-blue-500 font-mono text-sm resize-none"
                />
              </div>

              <div className="flex gap-3">
                <button
                  onClick={handleBulkSubmit}
                  disabled={saving}
                  className="flex-1 bg-blue-600 hover:bg-blue-700 text-white font-bold py-3 rounded-xl transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  {saving ? (
                    <span className="flex items-center justify-center gap-2">
                      <div className="animate-spin rounded-full h-4 w-4 border-2 border-white border-t-transparent"></div>
                      Processing...
                    </span>
                  ) : (
                    <span className="flex items-center justify-center gap-2">
                      <Upload className="h-4 w-4" />
                      Upload Modules
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
            <div className="mt-8 pt-8 border-t border-gray-700">
              <div className="flex items-center justify-between mb-4">
                <h3 className="text-lg font-bold text-white">
                  Existing Modules: {existingModules.length}
                </h3>
                <span className="text-sm text-gray-400">
                  {existingModules.length > 0 ? 'Data prefilled above' : 'No modules yet'}
                </span>
              </div>
              
              {existingModules.length > 0 && (
                <div className="bg-gray-700/50 rounded-lg p-4">
                  <p className="text-gray-300 text-sm mb-2">
                    <strong>Note:</strong> The JSON above contains your existing modules. 
                    You can modify this data to add new modules or update existing ones.
                  </p>
                  <div className="flex flex-wrap gap-2 mt-3">
                    {existingModules.map((module) => (
                      <span key={module.id} className="text-xs px-2 py-1 bg-gray-600 text-gray-300 rounded">
                        #{module.order} {module.title.length > 20 ? module.title.substring(0, 20) + '...' : module.title}
                      </span>
                    ))}
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default EditModulesPage;
