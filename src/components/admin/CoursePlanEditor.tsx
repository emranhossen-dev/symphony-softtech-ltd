"use client";

import React, { useState } from 'react';
import { 
  Target, 
  Zap, 
  Rocket, 
  Trophy, 
  Star, 
  CheckCircle, 
  Plus, 
  Edit, 
  Trash2, 
  Save,
  X,
  ArrowRight,
  Clock,
  Users,
  Award
} from 'lucide-react';

interface LearningPhase {
  id: string;
  title: string;
  duration: string;
  color: string;
  topics: {
    title: string;
    description: string;
  }[];
}

interface MissionItem {
  id: string;
  title: string;
  description: string;
  icon: React.ReactNode;
}

interface CoursePlanData {
  phases: LearningPhase[];
  mission: MissionItem[];
  vision: MissionItem[];
  outcomes: {
    title: string;
    description: string;
    icon: React.ReactNode;
  }[];
}

interface CoursePlanEditorProps {
  initialData?: CoursePlanData;
  onSave: (data: CoursePlanData) => void;
  onCancel: () => void;
}

const CoursePlanEditor = ({ initialData, onSave, onCancel }: CoursePlanEditorProps) => {
  const [activeTab, setActiveTab] = useState<'phases' | 'mission' | 'outcomes'>('phases');
  const [planData, setPlanData] = useState<CoursePlanData>(
    initialData || {
      phases: [
        {
          id: '1',
          title: 'Foundation',
          duration: 'Weeks 1-4',
          color: 'blue',
          topics: [
            { title: 'Basic Concepts', description: 'Core fundamentals and terminology' },
            { title: 'Setup & Tools', description: 'Environment configuration' },
            { title: 'First Projects', description: 'Hands-on practice exercises' }
          ]
        },
        {
          id: '2',
          title: 'Advanced Skills',
          duration: 'Weeks 5-8',
          color: 'purple',
          topics: [
            { title: 'Advanced Topics', description: 'Deep dive into complex concepts' },
            { title: 'Real Projects', description: 'Industry-relevant applications' },
            { title: 'Best Practices', description: 'Professional development patterns' }
          ]
        },
        {
          id: '3',
          title: 'Career Ready',
          duration: 'Weeks 9-12',
          color: 'green',
          topics: [
            { title: 'Portfolio Building', description: 'Create impressive projects' },
            { title: 'Interview Prep', description: 'Technical and soft skills' },
            { title: 'Job Placement', description: 'Career support and guidance' }
          ]
        }
      ],
      mission: [
        {
          id: '1',
          title: 'Practical Skills',
          description: 'Hands-on experience with real-world projects and industry tools',
          icon: <CheckCircle className="w-4 h-4" />
        },
        {
          id: '2',
          title: 'Expert Guidance',
          description: 'Learn from industry professionals with 10+ years experience',
          icon: <CheckCircle className="w-4 h-4" />
        },
        {
          id: '3',
          title: 'Career Support',
          description: 'Job placement assistance and interview preparation',
          icon: <CheckCircle className="w-4 h-4" />
        }
      ],
      vision: [
        {
          id: '1',
          title: 'Become Expert',
          description: 'Master advanced concepts and best practices',
          icon: <Star className="w-4 h-4" />
        },
        {
          id: '2',
          title: 'Build Portfolio',
          description: 'Create impressive projects that showcase your skills',
          icon: <Star className="w-4 h-4" />
        },
        {
          id: '3',
          title: 'Get Hired',
          description: 'Land your dream job in tech industry',
          icon: <Star className="w-4 h-4" />
        }
      ],
      outcomes: [
        {
          title: 'Build Projects',
          description: 'Create real-world applications',
          icon: <CheckCircle className="w-4 h-4" />
        },
        {
          title: 'Solve Problems',
          description: 'Think critically and debug effectively',
          icon: <CheckCircle className="w-4 h-4" />
        },
        {
          title: 'Work in Teams',
          description: 'Collaborate on complex projects',
          icon: <CheckCircle className="w-4 h-4" />
        },
        {
          title: 'Get Hired',
          description: 'Land your dream tech job',
          icon: <CheckCircle className="w-4 h-4" />
        }
      ]
    }
  );

  const addPhase = () => {
    const newPhase: LearningPhase = {
      id: Date.now().toString(),
      title: 'New Phase',
      duration: 'Weeks X-Y',
      color: 'blue',
      topics: [
        { title: 'New Topic', description: 'Topic description' }
      ]
    };
    setPlanData(prev => ({
      ...prev,
      phases: [...prev.phases, newPhase]
    }));
  };

  const addTopic = (phaseId: string) => {
    setPlanData(prev => ({
      ...prev,
      phases: prev.phases.map(phase => 
        phase.id === phaseId 
          ? { 
              ...phase, 
              topics: [...phase.topics, { title: 'New Topic', description: 'Topic description' }] 
            }
          : phase
      )
    }));
  };

  const updatePhase = (phaseId: string, updates: Partial<LearningPhase>) => {
    setPlanData(prev => ({
      ...prev,
      phases: prev.phases.map(phase => 
        phase.id === phaseId ? { ...phase, ...updates } : phase
      )
    }));
  };

  const updateTopic = (phaseId: string, topicIndex: number, updates: { title?: string; description?: string }) => {
    setPlanData(prev => ({
      ...prev,
      phases: prev.phases.map(phase => 
        phase.id === phaseId 
          ? { 
              ...phase, 
              topics: phase.topics.map((topic, index) => 
                index === topicIndex ? { ...topic, ...updates } : topic
              ) 
            }
          : phase
      )
    }));
  };

  const deletePhase = (phaseId: string) => {
    setPlanData(prev => ({
      ...prev,
      phases: prev.phases.filter(phase => phase.id !== phaseId)
    }));
  };

  const deleteTopic = (phaseId: string, topicIndex: number) => {
    setPlanData(prev => ({
      ...prev,
      phases: prev.phases.map(phase => 
        phase.id === phaseId 
          ? { 
              ...phase, 
              topics: phase.topics.filter((_, index) => index !== topicIndex) 
            }
          : phase
      )
    }));
  };

  const getColorClasses = (color: string) => {
    const colors = {
      blue: 'from-blue-50 to-indigo-50 border-blue-100',
      purple: 'from-purple-50 to-pink-50 border-purple-100',
      green: 'from-green-50 to-emerald-50 border-green-100',
      amber: 'from-amber-50 to-orange-50 border-amber-100'
    };
    return colors[color as keyof typeof colors] || colors.blue;
  };

  const getButtonColorClasses = (color: string) => {
    const colors = {
      blue: 'from-blue-500 to-blue-600',
      purple: 'from-purple-500 to-purple-600',
      green: 'from-green-500 to-green-600',
      amber: 'from-amber-500 to-orange-500'
    };
    return colors[color as keyof typeof colors] || colors.blue;
  };

  return (
    <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-3xl shadow-2xl max-w-6xl w-full max-h-[90vh] overflow-hidden">
        {/* Header */}
        <div className="bg-gradient-to-r from-blue-600 to-purple-600 p-6 text-white">
          <div className="flex items-center justify-between">
            <div>
              <h2 className="text-2xl font-bold">Course Plan Editor</h2>
              <p className="text-blue-100">Design your learning journey</p>
            </div>
            <button
              onClick={onCancel}
              className="text-white/80 hover:text-white transition-colors"
            >
              <X className="w-6 h-6" />
            </button>
          </div>
        </div>

        {/* Tabs */}
        <div className="flex border-b border-gray-200">
          <button
            onClick={() => setActiveTab('phases')}
            className={`flex-1 px-6 py-4 font-medium transition-colors ${
              activeTab === 'phases' 
                ? 'text-blue-600 border-b-2 border-blue-600 bg-blue-50' 
                : 'text-gray-600 hover:text-gray-900'
            }`}
          >
            <Target className="w-4 h-4 inline mr-2" />
            Learning Phases
          </button>
          <button
            onClick={() => setActiveTab('mission')}
            className={`flex-1 px-6 py-4 font-medium transition-colors ${
              activeTab === 'mission' 
                ? 'text-blue-600 border-b-2 border-blue-600 bg-blue-50' 
                : 'text-gray-600 hover:text-gray-900'
            }`}
          >
            <Trophy className="w-4 h-4 inline mr-2" />
            Mission & Vision
          </button>
          <button
            onClick={() => setActiveTab('outcomes')}
            className={`flex-1 px-6 py-4 font-medium transition-colors ${
              activeTab === 'outcomes' 
                ? 'text-blue-600 border-b-2 border-blue-600 bg-blue-50' 
                : 'text-gray-600 hover:text-gray-900'
            }`}
          >
            <Star className="w-4 h-4 inline mr-2" />
            Learning Outcomes
          </button>
        </div>

        {/* Content */}
        <div className="p-8 overflow-y-auto max-h-[60vh]">
          {activeTab === 'phases' && (
            <div className="space-y-8">
              <div className="flex items-center justify-between mb-6">
                <h3 className="text-xl font-bold text-gray-900">Learning Phases</h3>
                <button
                  onClick={addPhase}
                  className="flex items-center gap-2 bg-blue-600 text-white px-4 py-2 rounded-xl hover:bg-blue-700 transition-colors"
                >
                  <Plus className="w-4 h-4" />
                  Add Phase
                </button>
              </div>

              {planData.phases.map((phase, phaseIndex) => (
                <div key={phase.id} className={`bg-gradient-to-br ${getColorClasses(phase.color)} rounded-3xl p-8 border shadow-xl`}>
                  <div className="flex items-center justify-between mb-6">
                    <div className="flex items-center gap-4">
                      <div className={`w-16 h-16 bg-gradient-to-r ${getButtonColorClasses(phase.color)} rounded-2xl flex items-center justify-center`}>
                        <span className="text-2xl font-bold text-white">{phaseIndex + 1}</span>
                      </div>
                      <div>
                        <input
                          type="text"
                          value={phase.title}
                          onChange={(e) => updatePhase(phase.id, { title: e.target.value })}
                          className="text-2xl font-bold text-gray-900 bg-transparent border-b-2 border-gray-300 focus:border-blue-500 outline-none px-2 py-1"
                        />
                        <input
                          type="text"
                          value={phase.duration}
                          onChange={(e) => updatePhase(phase.id, { duration: e.target.value })}
                          className="text-sm text-gray-600 bg-transparent border-b border-gray-300 focus:border-blue-500 outline-none px-2 py-1 mt-1"
                        />
                      </div>
                    </div>
                    <div className="flex items-center gap-2">
                      <select
                        value={phase.color}
                        onChange={(e) => updatePhase(phase.id, { color: e.target.value })}
                        className="px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                      >
                        <option value="blue">Blue</option>
                        <option value="purple">Purple</option>
                        <option value="green">Green</option>
                        <option value="amber">Amber</option>
                      </select>
                      <button
                        onClick={() => deletePhase(phase.id)}
                        className="text-red-500 hover:text-red-700 transition-colors"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>
                  </div>

                  <div className="space-y-4">
                    {phase.topics.map((topic, topicIndex) => (
                      <div key={topicIndex} className="flex items-start gap-4 bg-white/50 rounded-xl p-4">
                        <div className="w-6 h-6 bg-green-100 rounded-full flex items-center justify-center flex-shrink-0 mt-1">
                          <CheckCircle className="w-3 h-3 text-green-600" />
                        </div>
                        <div className="flex-1">
                          <input
                            type="text"
                            value={topic.title}
                            onChange={(e) => updateTopic(phase.id, topicIndex, { title: e.target.value })}
                            className="font-medium text-gray-900 bg-transparent border-b border-gray-300 focus:border-blue-500 outline-none w-full px-2 py-1 mb-2"
                          />
                          <input
                            type="text"
                            value={topic.description}
                            onChange={(e) => updateTopic(phase.id, topicIndex, { description: e.target.value })}
                            className="text-sm text-gray-600 bg-transparent border-b border-gray-300 focus:border-blue-500 outline-none w-full px-2 py-1"
                          />
                        </div>
                        <button
                          onClick={() => deleteTopic(phase.id, topicIndex)}
                          className="text-red-500 hover:text-red-700 transition-colors"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </div>
                    ))}
                    <button
                      onClick={() => addTopic(phase.id)}
                      className="flex items-center gap-2 text-blue-600 hover:text-blue-700 font-medium"
                    >
                      <Plus className="w-4 h-4" />
                      Add Topic
                    </button>
                  </div>
                </div>
              ))}
            </div>
          )}

          {activeTab === 'mission' && (
            <div className="space-y-8">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                <div>
                  <h3 className="text-xl font-bold text-gray-900 mb-6">Our Mission</h3>
                  <div className="space-y-4">
                    {planData.mission.map((item) => (
                      <div key={item.id} className="flex items-start gap-3 bg-amber-50 rounded-xl p-4">
                        <div className="w-8 h-8 bg-amber-100 rounded-lg flex items-center justify-center flex-shrink-0 mt-1">
                          {item.icon}
                        </div>
                        <div className="flex-1">
                          <input
                            type="text"
                            value={item.title}
                            className="font-semibold text-gray-900 bg-transparent border-b border-gray-300 focus:border-blue-500 outline-none w-full px-2 py-1 mb-2"
                          />
                          <textarea
                            value={item.description}
                            className="text-gray-600 bg-transparent border border-gray-300 focus:border-blue-500 outline-none w-full px-2 py-2 rounded-lg resize-none"
                            rows={2}
                          />
                        </div>
                      </div>
                    ))}
                  </div>
                </div>

                <div>
                  <h3 className="text-xl font-bold text-gray-900 mb-6">Student Vision</h3>
                  <div className="space-y-4">
                    {planData.vision.map((item) => (
                      <div key={item.id} className="flex items-start gap-3 bg-blue-50 rounded-xl p-4">
                        <div className="w-8 h-8 bg-blue-100 rounded-lg flex items-center justify-center flex-shrink-0 mt-1">
                          {item.icon}
                        </div>
                        <div className="flex-1">
                          <input
                            type="text"
                            value={item.title}
                            className="font-semibold text-gray-900 bg-transparent border-b border-gray-300 focus:border-blue-500 outline-none w-full px-2 py-1 mb-2"
                          />
                          <textarea
                            value={item.description}
                            className="text-gray-600 bg-transparent border border-gray-300 focus:border-blue-500 outline-none w-full px-2 py-2 rounded-lg resize-none"
                            rows={2}
                          />
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            </div>
          )}

          {activeTab === 'outcomes' && (
            <div className="space-y-8">
              <h3 className="text-xl font-bold text-gray-900 mb-6">Learning Outcomes</h3>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                {planData.outcomes.map((outcome, index) => (
                  <div key={index} className="bg-white rounded-2xl p-6 shadow-lg">
                    <div className="flex items-center justify-between mb-4">
                      <div className="w-12 h-12 bg-gradient-to-r from-green-500 to-emerald-500 rounded-xl flex items-center justify-center">
                        {outcome.icon}
                      </div>
                      <button
                        onClick={() => {
                          const newOutcomes = planData.outcomes.filter((_, i) => i !== index);
                          setPlanData(prev => ({ ...prev, outcomes: newOutcomes }));
                        }}
                        className="text-red-500 hover:text-red-700 transition-colors"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>
                    <input
                      type="text"
                      value={outcome.title}
                      onChange={(e) => {
                        const newOutcomes = [...planData.outcomes];
                        newOutcomes[index] = { ...outcome, title: e.target.value };
                        setPlanData(prev => ({ ...prev, outcomes: newOutcomes }));
                      }}
                      className="font-bold text-gray-900 bg-transparent border-b border-gray-300 focus:border-blue-500 outline-none w-full px-2 py-1 mb-2"
                    />
                    <textarea
                      value={outcome.description}
                      onChange={(e) => {
                        const newOutcomes = [...planData.outcomes];
                        newOutcomes[index] = { ...outcome, description: e.target.value };
                        setPlanData(prev => ({ ...prev, outcomes: newOutcomes }));
                      }}
                      className="text-sm text-gray-600 bg-transparent border border-gray-300 focus:border-blue-500 outline-none w-full px-2 py-2 rounded-lg resize-none"
                      rows={2}
                    />
                  </div>
                ))}
                
                {/* Add New Outcome Button */}
                <div className="bg-white rounded-2xl p-6 shadow-lg border-2 border-dashed border-gray-300 flex items-center justify-center min-h-[140px]">
                  <button
                    onClick={() => {
                      const newOutcome = {
                        title: 'New Outcome',
                        description: 'Description of what students will achieve',
                        icon: <CheckCircle className="w-4 h-4" />
                      };
                      setPlanData(prev => ({ ...prev, outcomes: [...prev.outcomes, newOutcome] }));
                    }}
                    className="flex flex-col items-center gap-2 text-gray-500 hover:text-gray-700 transition-colors"
                  >
                    <Plus className="w-8 h-8" />
                    <span className="font-medium">Add Outcome</span>
                  </button>
                </div>
              </div>
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="border-t border-gray-200 p-6 bg-gray-50">
          <div className="flex items-center justify-between">
            <div className="text-sm text-gray-600">
              {planData.phases.length} phases • {planData.outcomes.length} outcomes
            </div>
            <div className="flex items-center gap-4">
              <button
                onClick={onCancel}
                className="px-6 py-3 border border-gray-300 text-gray-700 rounded-xl hover:bg-gray-50 transition-colors font-medium"
              >
                Cancel
              </button>
              <button
                onClick={() => onSave(planData)}
                className="flex items-center gap-2 bg-gradient-to-r from-blue-600 to-purple-600 text-white px-6 py-3 rounded-xl hover:from-blue-700 hover:to-purple-700 transition-all duration-300 font-medium shadow-lg"
              >
                <Save className="w-4 h-4" />
                Save Course Plan
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default CoursePlanEditor;
