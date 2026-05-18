import React from 'react';

interface ChartData {
  label: string;
  value: number;
  color?: string;
}

interface StatsChartProps {
  data: ChartData[];
  title?: string;
  type?: 'bar' | 'line';
  height?: number;
}

export default function StatsChart({ 
  data, 
  title, 
  type = 'bar', 
  height = 200 
}: StatsChartProps) {
  const maxValue = Math.max(...data.map(d => d.value), 1);
  const colors = data.map(d => d.color || '#3B82F6');

  if (type === 'bar') {
    return (
      <div className="bg-white rounded-2xl shadow-lg border border-gray-100 p-6">
        {title && (
          <div className="mb-4">
            <h3 className="text-lg font-semibold text-gray-900">{title}</h3>
          </div>
        )}
        <div className="relative" style={{ height: `${height}px` }}>
          <div className="flex items-end justify-between h-full gap-2">
            {data.map((item, index) => {
              const heightPercent = (item.value / maxValue) * 100;
              return (
                <div key={index} className="flex-1 flex flex-col items-center">
                  <div className="w-full relative group">
                    <div
                      className="w-full rounded-t-lg transition-all duration-300 hover:opacity-80 relative"
                      style={{
                        height: `${heightPercent}%`,
                        backgroundColor: colors[index],
                        minHeight: '4px'
                      }}
                    >
                      {/* Tooltip */}
                      <div className="absolute -top-10 left-1/2 transform -translate-x-1/2 bg-gray-900 text-white text-xs font-semibold px-2 py-1 rounded opacity-0 group-hover:opacity-100 transition-opacity whitespace-nowrap z-10">
                        {item.value}
                      </div>
                    </div>
                  </div>
                  <div className="mt-2 text-xs text-gray-600 text-center font-medium truncate w-full">
                    {item.label}
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="bg-white rounded-2xl shadow-lg border border-gray-100 p-6">
      {title && (
        <div className="mb-4">
          <h3 className="text-lg font-semibold text-gray-900">{title}</h3>
        </div>
      )}
      <div className="relative" style={{ height: `${height}px` }}>
        <svg className="w-full h-full" viewBox="0 0 400 200" preserveAspectRatio="none">
          {/* Grid lines */}
          {[0, 25, 50, 75, 100].map((percent) => (
            <line
              key={percent}
              x1="0"
              y1={200 - (percent / 100) * 180}
              x2="400"
              y2={200 - (percent / 100) * 180}
              stroke="#E5E7EB"
              strokeWidth="1"
            />
          ))}
          
          {/* Line */}
          <polyline
            fill="none"
            stroke="#3B82F6"
            strokeWidth="3"
            strokeLinecap="round"
            strokeLinejoin="round"
            points={data.map((item, index) => {
              const x = (index / (data.length - 1)) * 400;
              const y = 200 - (item.value / maxValue) * 180;
              return `${x},${y}`;
            }).join(' ')}
          />
          
          {/* Data points */}
          {data.map((item, index) => {
            const x = (index / (data.length - 1)) * 400;
            const y = 200 - (item.value / maxValue) * 180;
            return (
              <g key={index}>
                <circle
                  cx={x}
                  cy={y}
                  r="6"
                  fill="#3B82F6"
                  className="hover:r-8 transition-all cursor-pointer"
                />
                <circle
                  cx={x}
                  cy={y}
                  r="3"
                  fill="white"
                />
              </g>
            );
          })}
        </svg>
        
        {/* Labels */}
        <div className="flex justify-between mt-2">
          {data.map((item, index) => (
            <div key={index} className="text-xs text-gray-600 font-medium text-center">
              {item.label}
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
