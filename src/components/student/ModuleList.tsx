'use client';

import { Lock, CheckCircle, Circle } from 'lucide-react';

interface Module {
  id: string;
  title: string;
  order: number;
  isLocked?: boolean;
  isCompleted?: boolean;
  isUnlocked?: boolean;
}

interface ModuleListProps {
  modules: Module[];
  activeModuleId: string;
  onModuleSelect: (moduleId: string) => void;
}

export default function ModuleList({ modules, activeModuleId, onModuleSelect }: ModuleListProps) {
  return (
    <div className="space-y-2">
      {modules.map((module) => {
        const isActive = module.id === activeModuleId;
        const isLocked = !module.isUnlocked;
        const isCompleted = module.isCompleted;

        return (
          <div
            key={module.id}
            onClick={() => !isLocked && onModuleSelect(module.id)}
            className={`
              relative p-3 rounded-lg transition-all duration-200
              ${isLocked 
                ? 'text-gray-400 cursor-not-allowed' 
                : 'text-gray-700 hover:bg-gray-50 cursor-pointer'
              }
              ${isActive 
                ? 'bg-green-50 border-l-4 border-l-green-500' 
                : ''
              }
            `}
          >
            <div className="flex items-center gap-3">
              {/* Status Icon */}
              <div className="flex-shrink-0">
                {isLocked ? (
                  <Lock className="w-4 h-4" />
                ) : isCompleted ? (
                  <CheckCircle className="w-4 h-4 text-green-600" />
                ) : (
                  <Circle className="w-4 h-4" />
                )}
              </div>

              {/* Module Title */}
              <div className="flex-1 min-w-0">
                <h3 className="font-medium truncate">
                  {module.title}
                </h3>
                <p className="text-sm opacity-75">
                  Module {module.order}
                </p>
              </div>

              {/* Completion Badge */}
              {isCompleted && (
                <div className="flex-shrink-0">
                  <span className="text-xs bg-green-100 text-green-800 px-2 py-1 rounded-full">
                    Completed
                  </span>
                </div>
              )}
            </div>

            {/* Lock indicator for locked modules */}
            {isLocked && (
              <div className="absolute inset-0 bg-gray-100 bg-opacity-50 rounded-lg flex items-center justify-center">
                <Lock className="w-8 h-8 text-gray-400" />
              </div>
            )}
          </div>
        );
      })}
    </div>
  );
}
