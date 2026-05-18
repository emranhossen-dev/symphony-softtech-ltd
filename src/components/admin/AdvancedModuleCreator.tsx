"use client";

import { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/Card';
import { Button } from '@/components/ui/Button';
import { Input } from '@/components/ui/Input';
import { Textarea } from '@/components/ui/Textarea';
import { 
  Save,
  Plus,
  X,
  Copy,
  Trash2,
  Download,
  Upload,
  FileText,
  Video,
  Lock,
  Unlock,
  ChevronDown,
  ChevronUp,
  Zap,
  Clock,
  Target,
  BookOpen,
  Lightbulb,
  CheckCircle,
  AlertCircle,
  PlayCircle,
  Pause,
  Bot,
  Brain
} from 'lucide-react';
import AIModuleGenerator from './AIModuleGenerator';
import toast from 'react-hot-toast';

interface ModuleTemplate {
  id: string;
  name: string;
  description: string;
  modules: ModuleData[];
  topics?: string[];
  videoPlaceholder?: string;
}

interface ModuleData {
  id: string;
  title: string;
  videoUrl: string;
  homework: string;
  isLocked: boolean;
  duration?: string;
  description?: string;
  resources?: string[];
  topics?: string[];
  order: number;
}

interface GeneratedModule {
  title: string;
  description: string;
  homework: string;
  videoPlaceholder: string;
  estimatedDuration: string;
  difficulty: 'Beginner' | 'Intermediate' | 'Advanced';
  topics?: string[];
}

interface AdvancedModuleCreatorProps {
  courseId: string;
  courseTitle: string;
  categorySlug: string;
  onSave: (modules: ModuleData[]) => Promise<void>;
  onCancel: () => void;
}

const MODULE_TEMPLATES: ModuleTemplate[] = [
  {
    id: 'basic',
    name: 'Basic Course Structure',
    description: 'Introduction → Content → Practice → Assessment',
    modules: [
      { id: '1', title: 'Introduction & Overview', videoUrl: '', homework: '', isLocked: false, order: 1 },
      { id: '2', title: 'Core Content', videoUrl: '', homework: '', isLocked: true, order: 2 },
      { id: '3', title: 'Practice Exercises', videoUrl: '', homework: '', isLocked: true, order: 3 },
      { id: '4', title: 'Final Assessment', videoUrl: '', homework: '', isLocked: true, order: 4 }
    ]
  },
  {
    id: 'comprehensive',
    name: 'Comprehensive Course',
    description: 'Multi-week structured learning path',
    modules: [
      { id: '1', title: 'Week 1: Foundations', videoUrl: '', homework: '', isLocked: false, order: 1 },
      { id: '2', title: 'Week 1: Practice', videoUrl: '', homework: '', isLocked: true, order: 2 },
      { id: '3', title: 'Week 2: Advanced Concepts', videoUrl: '', homework: '', isLocked: true, order: 3 },
      { id: '4', title: 'Week 2: Application', videoUrl: '', homework: '', isLocked: true, order: 4 },
      { id: '5', title: 'Week 3: Project Work', videoUrl: '', homework: '', isLocked: true, order: 5 },
      { id: '6', title: 'Week 4: Final Project', videoUrl: '', homework: '', isLocked: true, order: 6 }
    ]
  },
  {
    id: 'quick',
    name: 'Quick Workshop',
    description: 'Fast-paced intensive learning',
    modules: [
      { id: '1', title: 'Quick Start', videoUrl: '', homework: '', isLocked: false, order: 1 },
      { id: '2', title: 'Deep Dive', videoUrl: '', homework: '', isLocked: true, order: 2 },
      { id: '3', title: 'Hands-on Practice', videoUrl: '', homework: '', isLocked: true, order: 3 }
    ]
  }
];

export default function AdvancedModuleCreator({ 
  courseId, 
  courseTitle, 
  categorySlug, 
  onSave, 
  onCancel 
}: AdvancedModuleCreatorProps) {
  const [modules, setModules] = useState<ModuleData[]>([
    { id: '1', title: '', videoUrl: '', homework: '', isLocked: false, order: 1 }
  ]);
  const [expandedModules, setExpandedModules] = useState<Set<string>>(new Set(['1']));
  const [selectedTemplate, setSelectedTemplate] = useState<string>('');
  const [saving, setSaving] = useState(false);
  const [showTemplates, setShowTemplates] = useState(false);
  const [bulkMode, setBulkMode] = useState(false);
  const [bulkText, setBulkText] = useState('');
  const [showAIGenerator, setShowAIGenerator] = useState(false);

  const addModule = (index?: number) => {
    const newModule: ModuleData = {
      id: Date.now().toString(),
      title: '',
      videoUrl: '',
      homework: '',
      isLocked: true,
      order: index !== undefined ? index + 1 : modules.length + 1
    };

    if (index !== undefined) {
      const newModules = [...modules];
      newModules.splice(index + 1, 0, newModule);
      // Update order for all modules after insertion
      newModules.forEach((module, i) => {
        module.order = i + 1;
      });
      setModules(newModules);
      setExpandedModules(new Set([...expandedModules, newModule.id]));
    } else {
      setModules([...modules, newModule]);
      setExpandedModules(new Set([...expandedModules, newModule.id]));
    }
  };

  const removeModule = (id: string) => {
    if (modules.length === 1) {
      toast.error('At least one module is required');
      return;
    }
    const newModules = modules.filter(m => m.id !== id);
    // Update order
    newModules.forEach((module, i) => {
      module.order = i + 1;
    });
    setModules(newModules);
  };

  const updateModule = (id: string, field: keyof ModuleData, value: any) => {
    setModules(modules.map(module => 
      module.id === id ? { ...module, [field]: value } : module
    ));
  };

  const moveModule = (id: string, direction: 'up' | 'down') => {
    const index = modules.findIndex(m => m.id === id);
    if (
      (direction === 'up' && index === 0) ||
      (direction === 'down' && index === modules.length - 1)
    ) {
      return;
    }

    const newModules = [...modules];
    const targetIndex = direction === 'up' ? index - 1 : index + 1;
    
    // Swap modules
    [newModules[index], newModules[targetIndex]] = [newModules[targetIndex], newModules[index]];
    
    // Update order
    newModules.forEach((module, i) => {
      module.order = i + 1;
    });
    
    setModules(newModules);
  };

  const duplicateModule = (id: string) => {
    const moduleToDuplicate = modules.find(m => m.id === id);
    if (moduleToDuplicate) {
      const newModule = {
        ...moduleToDuplicate,
        id: Date.now().toString(),
        title: `${moduleToDuplicate.title} (Copy)`,
        order: modules.length + 1
      };
      setModules([...modules, newModule]);
      setExpandedModules(new Set([...expandedModules, newModule.id]));
    }
  };

  const applyTemplate = (templateId: string) => {
    const template = MODULE_TEMPLATES.find(t => t.id === templateId);
    if (template) {
      setModules(template.modules.map(m => ({ ...m, id: Date.now().toString() + Math.random() })));
      setExpandedModules(new Set(template.modules.map(m => m.id)));
      setSelectedTemplate('');
      setShowTemplates(false);
      toast.success(`Applied "${template.name}" template`);
    }
  };

  const handleBulkCreate = () => {
    const lines = bulkText.split('\n').filter(line => line.trim());
    if (lines.length === 0) {
      toast.error('Please enter module titles');
      return;
    }

    const newModules: ModuleData[] = lines.map((title, index) => ({
      id: Date.now().toString() + index,
      title: title.trim(),
      videoUrl: '',
      homework: '',
      isLocked: index > 0, // First module unlocked, rest locked
      order: modules.length + index + 1
    }));

    setModules([...modules, ...newModules]);
    setBulkText('');
    setBulkMode(false);
    toast.success(`Added ${newModules.length} modules`);
  };

  const handleAIGeneratedModules = (generatedModules: GeneratedModule[]) => {
    const newModules: ModuleData[] = generatedModules.map((module, index) => ({
      id: Date.now().toString() + index,
      title: module.title,
      videoUrl: module.videoPlaceholder,
      homework: module.homework,
      isLocked: index > 0, // First module unlocked, rest locked
      order: modules.length + index + 1,
      description: module.description,
      topics: module.topics || []
    }));

    setModules([...modules, ...newModules]);
    setShowAIGenerator(false);
    toast.success(`AI generated ${newModules.length} modules successfully! 🎉`);
  };

  const toggleModuleExpanded = (id: string) => {
    const newExpanded = new Set(expandedModules);
    if (newExpanded.has(id)) {
      newExpanded.delete(id);
    } else {
      newExpanded.add(id);
    }
    setExpandedModules(newExpanded);
  };

  const validateModules = () => {
    const emptyTitles = modules.filter(m => !m.title.trim());
    if (emptyTitles.length > 0) {
      toast.error('All modules must have titles');
      return false;
    }
    return true;
  };

  const handleSave = async () => {
    if (!validateModules()) return;
    
    setSaving(true);
    try {
      await onSave(modules);
      toast.success('Modules created successfully!');
    } catch (error) {
      toast.error('Failed to create modules');
    } finally {
      setSaving(false);
    }
  };

  const exportModules = () => {
    const data = {
      courseTitle,
      modules: modules.map(m => ({
        title: m.title,
        videoUrl: m.videoUrl,
        homework: m.homework,
        isLocked: m.isLocked,
        description: m.description,
        topics: m.topics,
        order: m.order
      }))
    };
    
    const blob = new Blob([JSON.stringify(data, null, 2)], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `${courseTitle.replace(/\s+/g, '_')}_modules.json`;
    a.click();
    URL.revokeObjectURL(url);
  };

  const importModules = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = (e) => {
      try {
        const content = e.target?.result as string;
        const data = JSON.parse(content);
        
        if (data.modules && Array.isArray(data.modules)) {
          const importedModules: ModuleData[] = data.modules.map((m: any, index: number) => ({
            id: Date.now().toString() + index,
            title: m.title || '',
            videoUrl: m.videoUrl || '',
            homework: m.homework || '',
            isLocked: m.isLocked !== undefined ? m.isLocked : index > 0,
            order: m.order || index + 1,
            description: m.description || '',
            topics: m.topics || []
          }));
          
          setModules(importedModules);
          setExpandedModules(new Set(importedModules.map(m => m.id)));
          toast.success(`Imported ${importedModules.length} modules successfully!`);
        } else {
          toast.error('Invalid file format. Expected modules array.');
        }
      } catch (error) {
        console.error('Error parsing JSON:', error);
        toast.error('Failed to parse JSON file');
      }
    };
    reader.readAsText(file);
    
    // Reset file input
    event.target.value = '';
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-50">
      {/* Header */}
      <div className="bg-white/80 backdrop-blur-lg border-b border-gray-200/60 shadow-sm sticky top-0 z-40">
        <div className="max-w-7xl mx-auto px-6 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-4">
              <Button
                variant="outline"
                onClick={onCancel}
                className="flex items-center gap-2"
              >
                <X className="w-4 h-4" />
                Cancel
              </Button>
              
              <div>
                <h1 className="text-2xl font-bold bg-gradient-to-r from-gray-900 to-gray-700 bg-clip-text text-transparent">
                  Advanced Module Creator
                </h1>
                <p className="text-sm text-gray-600">
                  Course: <span className="font-medium text-green-600">{courseTitle}</span>
                </p>
              </div>
            </div>
            
            <div className="flex items-center gap-3">
              <input
                type="file"
                accept=".json"
                onChange={importModules}
                className="hidden"
                id="import-modules"
              />
              <Button
                variant="outline"
                onClick={() => document.getElementById('import-modules')?.click()}
                className="flex items-center gap-2"
              >
                <Upload className="w-4 h-4" />
                Import
              </Button>
              
              <Button
                variant="outline"
                onClick={exportModules}
                className="flex items-center gap-2"
              >
                <Download className="w-4 h-4" />
                Export
              </Button>
              
              <Button
                onClick={handleSave}
                disabled={saving}
                className="flex items-center gap-2 bg-gradient-to-r from-green-500 to-green-600 hover:from-green-600 hover:to-green-700"
              >
                <Save className="w-4 h-4" />
                {saving ? 'Creating...' : `Create ${modules.length} Modules`}
              </Button>
            </div>
          </div>
        </div>
      </div>

      <div className="max-w-6xl mx-auto p-6">
        {/* Quick Actions Bar */}
        <div className="mb-6 bg-white rounded-xl shadow-sm border border-gray-200 p-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <Button
                variant="outline"
                onClick={() => setShowTemplates(!showTemplates)}
                className="flex items-center gap-2"
              >
                <Lightbulb className="w-4 h-4" />
                Templates
              </Button>
              
              <Button
                variant="outline"
                onClick={() => setBulkMode(!bulkMode)}
                className="flex items-center gap-2"
              >
                <Zap className="w-4 h-4" />
                Bulk Add
              </Button>
              
              <Button
                variant="outline"
                onClick={() => setShowAIGenerator(!showAIGenerator)}
                className="flex items-center gap-2 bg-gradient-to-r from-purple-500 to-blue-600 text-white hover:from-purple-600 hover:to-blue-700"
              >
                <Bot className="w-4 h-4" />
                AI Generator
              </Button>
              
              <Button
                onClick={() => addModule()}
                className="flex items-center gap-2 bg-blue-600 hover:bg-blue-700"
              >
                <Plus className="w-4 h-4" />
                Add Module
              </Button>
            </div>
            
            <div className="flex items-center gap-2 text-sm text-gray-600">
              <Target className="w-4 h-4" />
              <span>{modules.length} modules</span>
            </div>
          </div>
        </div>

        {/* Templates Panel */}
        {showTemplates && (
          <div className="mb-6 bg-white rounded-xl shadow-sm border border-gray-200 p-6">
            <h3 className="text-lg font-semibold text-gray-900 mb-4">Choose a Template</h3>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              {MODULE_TEMPLATES.map(template => (
                <Card 
                  key={template.id}
                  className="cursor-pointer hover:shadow-md transition-shadow border-2 hover:border-blue-300"
                  onClick={() => applyTemplate(template.id)}
                >
                  <CardContent className="p-4">
                    <h4 className="font-medium text-gray-900 mb-2">{template.name}</h4>
                    <p className="text-sm text-gray-600 mb-3">{template.description}</p>
                    <div className="mt-3 flex items-center gap-4 text-sm text-gray-500">
                      <Zap className="w-3 h-3" />
                      <span>Video: {template.videoPlaceholder}</span>
                    </div>

                    {template.topics && template.topics.length > 0 && (
                      <div className="mt-3 p-3 bg-blue-50 border border-blue-200 rounded-lg">
                        <div className="flex items-center gap-2 mb-2">
                          <BookOpen className="w-4 h-4 text-blue-600" />
                          <span className="text-sm font-medium text-blue-900">Topics ({template.topics.length})</span>
                        </div>
                        <div className="space-y-1">
                          {template.topics?.map((topic: string, index: number) => (
                            <div key={index} className="flex items-center gap-2 text-xs text-gray-700">
                              <span className="w-4 h-4 bg-blue-600 text-white rounded-full flex items-center justify-center font-medium">
                                {index + 1}
                              </span>
                              <span>{topic}</span>
                            </div>
                          ))}
                        </div>
                      </div>
                    )}
                  </CardContent>
                </Card>
              ))}
            </div>
          </div>
        )}

        {/* Bulk Add Panel */}
        {bulkMode && (
          <div className="mb-6 bg-white rounded-xl shadow-sm border border-gray-200 p-6">
            <h3 className="text-lg font-semibold text-gray-900 mb-4">Bulk Add Modules</h3>
            <p className="text-sm text-gray-600 mb-4">
              Enter one module title per line. Each line will create a new module.
            </p>
            <Textarea
              value={bulkText}
              onChange={(e) => setBulkText(e.target.value)}
              placeholder="Module 1 Title&#10;Module 2 Title&#10;Module 3 Title"
              rows={8}
              className="mb-4"
            />
            <div className="flex items-center gap-3">
              <Button
                onClick={handleBulkCreate}
                className="flex items-center gap-2"
              >
                <Plus className="w-4 h-4" />
                Create Modules
              </Button>
              <Button
                variant="outline"
                onClick={() => {
                  setBulkMode(false);
                  setBulkText('');
                }}
              >
                Cancel
              </Button>
            </div>
          </div>
        )}

        {/* AI Generator Panel */}
        {showAIGenerator && (
          <div className="mb-6">
            <AIModuleGenerator
              onModulesGenerated={handleAIGeneratedModules}
              courseTitle={courseTitle}
            />
          </div>
        )}

        {/* Modules List */}
        <div className="space-y-4">
          {modules.map((module, index) => (
            <Card key={module.id} className="border-0 shadow-lg bg-white/80 backdrop-blur">
              <CardHeader className="pb-3">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <div className="flex items-center gap-2">
                      <span className="flex items-center justify-center w-8 h-8 bg-gradient-to-r from-blue-500 to-indigo-600 text-white rounded-lg font-semibold text-sm">
                        {module.order}
                      </span>
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => toggleModuleExpanded(module.id)}
                        className="p-1"
                      >
                        {expandedModules.has(module.id) ? (
                          <ChevronUp className="w-4 h-4" />
                        ) : (
                          <ChevronDown className="w-4 h-4" />
                        )}
                      </Button>
                    </div>
                    
                    <div className="flex-1">
                      <Input
                        value={module.title}
                        onChange={(e) => updateModule(module.id, 'title', e.target.value)}
                        placeholder="Module Title"
                        className="font-medium text-gray-900 border-0 bg-transparent focus:bg-white focus:border-blue-300 px-0"
                      />
                    </div>
                  </div>
                  
                  <div className="flex items-center gap-2">
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => moveModule(module.id, 'up')}
                      disabled={index === 0}
                      className="p-1"
                    >
                      <ChevronUp className="w-4 h-4" />
                    </Button>
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => moveModule(module.id, 'down')}
                      disabled={index === modules.length - 1}
                      className="p-1"
                    >
                      <ChevronDown className="w-4 h-4" />
                    </Button>
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => duplicateModule(module.id)}
                      className="p-1"
                    >
                      <Copy className="w-4 h-4" />
                    </Button>
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => removeModule(module.id)}
                      className="p-1 text-red-600 hover:text-red-700"
                    >
                      <Trash2 className="w-4 h-4" />
                    </Button>
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => updateModule(module.id, 'isLocked', !module.isLocked)}
                      className="p-1"
                    >
                      {module.isLocked ? (
                        <Lock className="w-4 h-4 text-red-600" />
                      ) : (
                        <Unlock className="w-4 h-4 text-green-600" />
                      )}
                    </Button>
                  </div>
                </div>
              </CardHeader>
              
              {expandedModules.has(module.id) && (
                <CardContent className="pt-0 space-y-4">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        <Video className="w-4 h-4 inline mr-1" />
                        Video URL
                      </label>
                      <Input
                        type="url"
                        value={module.videoUrl}
                        onChange={(e) => updateModule(module.id, 'videoUrl', e.target.value)}
                        placeholder="https://example.com/video.mp4"
                      />
                    </div>
                    
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        <Clock className="w-4 h-4 inline mr-1" />
                        Duration (optional)
                      </label>
                      <Input
                        value={module.duration || ''}
                        onChange={(e) => updateModule(module.id, 'duration', e.target.value)}
                        placeholder="45 minutes"
                      />
                    </div>
                  </div>
                  
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      <BookOpen className="w-4 h-4 inline mr-1" />
                      Homework Instructions
                    </label>
                    <Textarea
                      value={module.homework}
                      onChange={(e) => updateModule(module.id, 'homework', e.target.value)}
                      placeholder="Enter homework instructions or assignments..."
                      rows={4}
                    />
                  </div>
                  
                  <div className="flex items-center gap-4 text-sm">
                    <span className="flex items-center gap-2">
                      {module.isLocked ? (
                        <>
                          <Lock className="w-4 h-4 text-red-600" />
                          <span className="text-red-600">Locked</span>
                        </>
                      ) : (
                        <>
                          <Unlock className="w-4 h-4 text-green-600" />
                          <span className="text-green-600">Unlocked</span>
                        </>
                      )}
                    </span>
                  </div>
                </CardContent>
              )}
            </Card>
          ))}
        </div>

        {/* Quick Add Button */}
        <div className="mt-6 text-center">
          <Button
            variant="outline"
            onClick={() => addModule()}
            className="flex items-center gap-2 mx-auto border-2 border-dashed border-gray-300 hover:border-blue-400 hover:bg-blue-50"
          >
            <Plus className="w-4 h-4" />
            Add Another Module
          </Button>
        </div>
      </div>
    </div>
  );
}
