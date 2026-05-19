'use client';

import { CheckCircle, Lock, PlayCircle, FileText, Clock } from 'lucide-react';

interface Module {
  id: string;
  title: string;
  order: number;
  isLocked: boolean;
  videoUrl?: string | null;
  homework?: string | null;
  isCompleted?: boolean;
  isUnlocked?: boolean;
  completedAt?: string | null;
}

interface ModuleSidebarProps {
  modules: Module[];
  activeModuleId: string;
  onModuleSelect: (moduleId: string) => void;
}

export default function ModuleSidebar({ modules, activeModuleId, onModuleSelect }: ModuleSidebarProps) {
  const getModuleIcon = (module: Module) => {
    if (module.isCompleted) {
      return <CheckCircle className="w-5 h-5 text-green-600" />;
    }
    if (module.isLocked) {
      return <Lock className="w-5 h-5 text-gray-400" />;
    }
    return <div className="w-5 h-5 rounded-full border-2 border-blue-600 flex items-center justify-center">
      <div className="w-2 h-2 rounded-full bg-blue-600"></div>
    </div>;
  };

  const getModuleStatus = (module: Module) => {
    if (module.isCompleted) return 'completed';
    if (module.isLocked) return 'locked';
    if (module.isUnlocked) return 'available';
    return 'locked';
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'completed': return 'bg-green-50 border-green-200 hover:bg-green-100';
      case 'available': return 'bg-blue-50 border-blue-200 hover:bg-blue-100 cursor-pointer';
      case 'locked': return 'bg-gray-50 border-gray-200 cursor-not-allowed';
      default: return 'bg-gray-50 border-gray-200';
    }
  };

  const getStatusTextColor = (status: string) => {
    switch (status) {
      case 'completed': return 'text-green-700';
      case 'available': return 'text-blue-700';
      case 'locked': return 'text-gray-500';
      default: return 'text-gray-500';
    }
  };

  return (
    <div className="w-full h-full bg-white border-r border-gray-200 overflow-y-auto">
      <div className="p-4 border-b border-gray-200">
        <h2 className="text-lg font-semibold text-gray-900">Course Modules</h2>
        <p className="text-sm text-gray-600 mt-1">
          {modules.length} module{modules.length > 1 ? 's' : ''} • {modules.filter(m => m.isCompleted).length} completed
        </p>
      </div>
      
      <div className="p-4 space-y-3">
        {modules.map((module) => {
          const status = getModuleStatus(module);
          const isActive = module.id === activeModuleId;
          
          return (
            <div
              key={module.id}
              onClick={() => !module.isLocked && onModuleSelect(module.id)}
              className={`p-4 rounded-lg border transition-all duration-200 ${
                isActive ? 'ring-2 ring-blue-500 bg-blue-50' : getStatusColor(status)
              }`}
            >
              <div className="flex items-start gap-3">
                <div className="mt-1">
                  {getModuleIcon(module)}
                </div>
                
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2 mb-2">
                    <span className="text-xs font-medium text-gray-500">
                      Module {module.order}
                    </span>
                    {module.isCompleted && (
                      <span className="text-xs bg-green-100 text-green-800 px-2 py-1 rounded-full">
                        Completed
                      </span>
                    )}
                  </div>
                  
                  <h3 className={`font-medium text-sm mb-2 line-clamp-2 ${
                    isActive ? 'text-blue-900' : getStatusTextColor(status)
                  }`}>
                    {module.title}
                  </h3>
                  
                  <div className="flex items-center gap-3 text-xs text-gray-500">
                    {module.videoUrl && !module.isLocked && (
                      <div className="flex items-center gap-1">
                        <PlayCircle className="w-3 h-3" />
                        <span>Video</span>
                      </div>
                    )}
                    {module.homework && !module.isLocked && (
                      <div className="flex items-center gap-1">
                        <FileText className="w-3 h-3" />
                        <span>Homework</span>
                      </div>
                    )}
                    {module.completedAt && (
                      <div className="flex items-center gap-1">
                        <Clock className="w-3 h-3" />
                        <span>{new Date(module.completedAt).toLocaleDateString()}</span>
                      </div>
                    )}
                  </div>
                  
                  {module.isLocked && (
                    <p className="text-xs text-gray-400 mt-2">
                      Complete previous modules to unlock
                    </p>
                  )}
                </div>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
