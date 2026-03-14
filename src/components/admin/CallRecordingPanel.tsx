"use client";

import { useState, useEffect } from 'react';
import { Phone, PhoneIncoming, PhoneOutgoing, Play, Pause, Download, Search, Filter, Clock, DollarSign, Mic, MicOff } from 'lucide-react';

interface CallRecord {
  id: string;
  type: 'incoming' | 'outgoing';
  status: 'completed' | 'missed' | 'ongoing';
  callerName: string;
  calleeName: string;
  phoneNumber: string;
  duration: number;
  recordingUrl?: string;
  transcript?: string;
  notes?: string;
  cost: number;
  revenue: number;
  user: {
    id: string;
    name: string;
    email: string;
    role: string;
  };
  createdAt: string;
}

interface CallStats {
  totalCalls: number;
  incomingCalls: number;
  outgoingCalls: number;
  totalDuration: number;
  totalCost: number;
  totalRevenue: number;
}

const CallRecordingPanel = () => {
  const [calls, setCalls] = useState<CallRecord[]>([]);
  const [stats, setStats] = useState<CallStats>({
    totalCalls: 0,
    incomingCalls: 0,
    outgoingCalls: 0,
    totalDuration: 0,
    totalCost: 0,
    totalRevenue: 0
  });
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCall, setSelectedCall] = useState<CallRecord | null>(null);
  const [isRecording, setIsRecording] = useState(false);
  const [isPlaying, setIsPlaying] = useState<string | null>(null);
  const [filter, setFilter] = useState<'all' | 'incoming' | 'outgoing'>('all');

  useEffect(() => {
    fetchCalls();
  }, [searchQuery, filter]);

  const fetchCalls = async () => {
    try {
      const params = new URLSearchParams({
        search: searchQuery,
        type: filter === 'all' ? '' : filter
      });
      
      const response = await fetch(`/api/admin/calls?${params}`);
      const data = await response.json();
      
      if (data.success) {
        setCalls(data.data);
        setStats(data.stats);
      }
    } catch (error) {
      console.error('Error fetching calls:', error);
    } finally {
      setLoading(false);
    }
  };

  const formatDuration = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}:${secs.toString().padStart(2, '0')}`;
  };

  const formatCurrency = (amount: number) => {
    return `৳${amount.toFixed(2)}`;
  };

  const startRecording = () => {
    // In real implementation, this would start Twilio recording
    setIsRecording(true);
    setTimeout(() => {
      setIsRecording(false);
      // Add new call record
      fetchCalls();
    }, 5000); // Simulate 5 second call
  };

  const playRecording = (callId: string) => {
    if (isPlaying === callId) {
      setIsPlaying(null);
    } else {
      setIsPlaying(callId);
      // In real implementation, play audio from recordingUrl
    }
  };

  return (
    <div className="p-4 space-y-4">
      {/* Recording Controls */}
      <div className="bg-gray-800 rounded-lg p-4">
        <div className="flex items-center justify-between mb-3">
          <h3 className="text-white font-semibold flex items-center gap-2">
            <Phone className="w-5 h-5 text-green-500" />
            Call Recording
          </h3>
          <button
            onClick={startRecording}
            disabled={isRecording}
            className={`flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-medium transition-all ${
              isRecording 
                ? 'bg-red-600 text-white animate-pulse' 
                : 'bg-green-600 text-white hover:bg-green-700'
            }`}
          >
            {isRecording ? (
              <>
                <MicOff className="w-4 h-4" />
                Recording...
              </>
            ) : (
              <>
                <Mic className="w-4 h-4" />
                Start Call
              </>
            )}
          </button>
        </div>

        {/* Call Stats */}
        <div className="grid grid-cols-2 gap-3">
          <div className="bg-gray-700 rounded p-3">
            <div className="flex items-center gap-2 text-green-400 text-sm">
              <PhoneIncoming className="w-4 h-4" />
              {stats.incomingCalls}
            </div>
            <div className="text-xs text-gray-400">Incoming</div>
          </div>
          <div className="bg-gray-700 rounded p-3">
            <div className="flex items-center gap-2 text-blue-400 text-sm">
              <PhoneOutgoing className="w-4 h-4" />
              {stats.outgoingCalls}
            </div>
            <div className="text-xs text-gray-400">Outgoing</div>
          </div>
        </div>
      </div>

      {/* Search and Filter */}
      <div className="space-y-2">
        <div className="relative">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-gray-400" />
          <input
            type="text"
            placeholder="Search calls..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full pl-10 pr-4 py-2 bg-gray-800 border border-gray-700 rounded-lg text-white placeholder-gray-400 focus:outline-none focus:border-green-500"
          />
        </div>
        
        <div className="flex gap-2">
          {(['all', 'incoming', 'outgoing'] as const).map((type) => (
            <button
              key={type}
              onClick={() => setFilter(type)}
              className={`px-3 py-1 rounded-lg text-sm capitalize transition-all ${
                filter === type
                  ? 'bg-green-600 text-white'
                  : 'bg-gray-800 text-gray-300 hover:bg-gray-700'
              }`}
            >
              {type}
            </button>
          ))}
        </div>
      </div>

      {/* Call List */}
      <div className="space-y-2 max-h-96 overflow-y-auto">
        {loading ? (
          <div className="text-center py-8 text-gray-400">
            Loading calls...
          </div>
        ) : calls.length === 0 ? (
          <div className="text-center py-8 text-gray-400">
            No calls found
          </div>
        ) : (
          calls.map((call) => (
            <div
              key={call.id}
              className="bg-gray-800 rounded-lg p-3 hover:bg-gray-700 transition-colors cursor-pointer"
              onClick={() => setSelectedCall(call)}
            >
              <div className="flex items-start justify-between mb-2">
                <div className="flex items-center gap-2">
                  {call.type === 'incoming' ? (
                    <PhoneIncoming className="w-4 h-4 text-green-500" />
                  ) : (
                    <PhoneOutgoing className="w-4 h-4 text-blue-500" />
                  )}
                  <div>
                    <div className="text-white text-sm font-medium">
                      {call.type === 'incoming' ? call.callerName : call.calleeName}
                    </div>
                    <div className="text-gray-400 text-xs">
                      {call.phoneNumber}
                    </div>
                  </div>
                </div>
                <div className="text-right">
                  <div className="text-gray-300 text-xs">
                    {new Date(call.createdAt).toLocaleTimeString()}
                  </div>
                  <div className="flex items-center gap-1 text-gray-400 text-xs">
                    <Clock className="w-3 h-3" />
                    {formatDuration(call.duration)}
                  </div>
                </div>
              </div>

              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  {call.recordingUrl && (
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        playRecording(call.id);
                      }}
                      className="p-1 rounded hover:bg-gray-600 transition-colors"
                    >
                      {isPlaying === call.id ? (
                        <Pause className="w-3 h-3 text-green-500" />
                      ) : (
                        <Play className="w-3 h-3 text-gray-400" />
                      )}
                    </button>
                  )}
                  {call.notes && (
                    <span className="text-xs text-gray-400 truncate max-w-32">
                      {call.notes}
                    </span>
                  )}
                </div>
                <div className="text-xs text-gray-400">
                  {formatCurrency(call.cost)}
                </div>
              </div>
            </div>
          ))
        )}
      </div>

      {/* Call Details Modal */}
      {selectedCall && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-gray-900 rounded-lg max-w-2xl w-full max-h-[80vh] overflow-y-auto">
            <div className="p-6">
              <div className="flex items-center justify-between mb-4">
                <h3 className="text-white font-semibold">Call Details</h3>
                <button
                  onClick={() => setSelectedCall(null)}
                  className="p-2 rounded-lg hover:bg-gray-800 transition-colors"
                >
                  ×
                </button>
              </div>

              <div className="space-y-4">
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <div className="text-gray-400 text-sm">Type</div>
                    <div className="text-white capitalize">{selectedCall.type}</div>
                  </div>
                  <div>
                    <div className="text-gray-400 text-sm">Status</div>
                    <div className="text-white capitalize">{selectedCall.status}</div>
                  </div>
                  <div>
                    <div className="text-gray-400 text-sm">Duration</div>
                    <div className="text-white">{formatDuration(selectedCall.duration)}</div>
                  </div>
                  <div>
                    <div className="text-gray-400 text-sm">Cost</div>
                    <div className="text-white">{formatCurrency(selectedCall.cost)}</div>
                  </div>
                </div>

                <div>
                  <div className="text-gray-400 text-sm mb-2">Participants</div>
                  <div className="space-y-1">
                    <div className="flex items-center gap-2">
                      <PhoneIncoming className="w-4 h-4 text-green-500" />
                      <span className="text-white">{selectedCall.callerName}</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <PhoneOutgoing className="w-4 h-4 text-blue-500" />
                      <span className="text-white">{selectedCall.calleeName}</span>
                    </div>
                  </div>
                </div>

                {selectedCall.recordingUrl && (
                  <div>
                    <div className="text-gray-400 text-sm mb-2">Recording</div>
                    <div className="flex items-center gap-2">
                      <button
                        onClick={() => playRecording(selectedCall.id)}
                        className="flex items-center gap-2 px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors"
                      >
                        {isPlaying === selectedCall.id ? (
                          <Pause className="w-4 h-4" />
                        ) : (
                          <Play className="w-4 h-4" />
                        )}
                        {isPlaying === selectedCall.id ? 'Pause' : 'Play'}
                      </button>
                      <button className="p-2 rounded-lg bg-gray-800 hover:bg-gray-700 transition-colors">
                        <Download className="w-4 h-4 text-gray-300" />
                      </button>
                    </div>
                  </div>
                )}

                {selectedCall.transcript && (
                  <div>
                    <div className="text-gray-400 text-sm mb-2">Transcript</div>
                    <div className="bg-gray-800 rounded-lg p-3 text-gray-300 text-sm">
                      {selectedCall.transcript}
                    </div>
                  </div>
                )}

                {selectedCall.notes && (
                  <div>
                    <div className="text-gray-400 text-sm mb-2">Notes</div>
                    <div className="bg-gray-800 rounded-lg p-3 text-gray-300 text-sm">
                      {selectedCall.notes}
                    </div>
                  </div>
                )}

                <div>
                  <div className="text-gray-400 text-sm mb-2">Handled By</div>
                  <div className="bg-gray-800 rounded-lg p-3">
                    <div className="text-white">{selectedCall.user.name}</div>
                    <div className="text-gray-400 text-sm">{selectedCall.user.email}</div>
                    <div className="text-gray-500 text-xs capitalize">{selectedCall.user.role}</div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default CallRecordingPanel;
