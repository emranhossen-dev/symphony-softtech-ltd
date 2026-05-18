"use client";

import { useState, useEffect } from 'react';
import { 
  Phone, 
  PhoneOff, 
  MessageSquare, 
  Play, 
  Pause, 
  Download,
  Clock,
  User,
  Calendar,
  Volume2,
  CheckCircle,
  XCircle,
  AlertCircle
} from 'lucide-react';

interface CallLog {
  id: string;
  applicantId: string;
  employeeId: string;
  phoneNumber: string;
  callStatus: string;
  callDirection: string;
  callDuration: number;
  recordingUrl?: string;
  callResult?: string;
  notes?: string;
  twilioCallSid?: string;
  cost: number;
  createdAt: string;
  updatedAt: string;
  applicant: {
    id: string;
    name: string;
    email: string;
    phone: string;
    course: string;
    category: string;
  };
  employee: {
    id: string;
    name: string;
    email: string;
  };
}

interface CallManagementPanelProps {
  applicantId: string;
  applicantName: string;
  applicantPhone: string;
  currentUserId: string;
}

const CallManagementPanel = ({ 
  applicantId, 
  applicantName, 
  applicantPhone, 
  currentUserId 
}: CallManagementPanelProps) => {
  const [callHistory, setCallHistory] = useState<CallLog[]>([]);
  const [loading, setLoading] = useState(false);
  const [isCalling, setIsCalling] = useState(false);
  const [currentCallId, setCurrentCallId] = useState<string | null>(null);
  const [playingRecording, setPlayingRecording] = useState<string | null>(null);
  const [showNoteModal, setShowNoteModal] = useState(false);
  const [callResult, setCallResult] = useState('');
  const [notes, setNotes] = useState('');
  const [selectedCallId, setSelectedCallId] = useState<string | null>(null);

  useEffect(() => {
    fetchCallHistory();
  }, [applicantId]);

  const fetchCallHistory = async () => {
    try {
      setLoading(true);
      const response = await fetch(`/api/admin/calls/history?applicantId=${applicantId}`);
      const data = await response.json();
      
      if (data.success) {
        setCallHistory(data.data);
      }
    } catch (error) {
      console.error('Error fetching call history:', error);
    } finally {
      setLoading(false);
    }
  };

  const initiateCall = async () => {
    try {
      setIsCalling(true);
      
      const response = await fetch('/api/admin/calls/initiate', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          applicantId,
          employeeId: currentUserId,
          phoneNumber: applicantPhone
        }),
      });

      const data = await response.json();
      
      if (data.success) {
        setCurrentCallId(data.data.callLogId);
        // Simulate call completion after 5 seconds
        setTimeout(() => {
          setIsCalling(false);
          setShowNoteModal(true);
          setSelectedCallId(data.data.callLogId);
          fetchCallHistory();
        }, 5000);
      } else {
        setIsCalling(false);
        alert('Failed to initiate call: ' + data.error);
      }
    } catch (error) {
      console.error('Error initiating call:', error);
      setIsCalling(false);
      alert('Error initiating call');
    }
  };

  const saveCallNote = async () => {
    try {
      const response = await fetch('/api/admin/calls/history', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          callId: selectedCallId,
          callResult,
          notes
        }),
      });

      if (response.ok) {
        setShowNoteModal(false);
        setCallResult('');
        setNotes('');
        setSelectedCallId(null);
        fetchCallHistory();
      }
    } catch (error) {
      console.error('Error saving call note:', error);
      alert('Error saving call note');
    }
  };

  const playRecording = (callId: string, recordingUrl: string) => {
    if (playingRecording === callId) {
      setPlayingRecording(null);
    } else {
      setPlayingRecording(callId);
      // In real implementation, play audio from recordingUrl
      const audio = new Audio(recordingUrl);
      audio.play();
      audio.onended = () => setPlayingRecording(null);
    }
  };

  const formatDuration = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}:${secs.toString().padStart(2, '0')}`;
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      month: 'short',
      day: 'numeric',
      year: 'numeric'
    });
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'COMPLETED':
        return 'bg-green-100 text-green-800';
      case 'IN_PROGRESS':
        return 'bg-blue-100 text-blue-800';
      case 'FAILED':
        return 'bg-red-100 text-red-800';
      case 'MISSED':
        return 'bg-yellow-100 text-yellow-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  const getResultColor = (result: string) => {
    switch (result) {
      case 'INTERESTED':
        return 'bg-green-100 text-green-800';
      case 'NOT_INTERESTED':
        return 'bg-red-100 text-red-800';
      case 'CALL_LATER':
        return 'bg-blue-100 text-blue-800';
      case 'NO_ANSWER':
        return 'bg-yellow-100 text-yellow-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  return (
    <div className="space-y-6">
      {/* Call Actions */}
      <div className="flex flex-wrap gap-3">
        <button
          onClick={initiateCall}
          disabled={isCalling}
          className={`flex items-center gap-2 px-4 py-2 rounded-lg font-medium transition-all ${
            isCalling 
              ? 'bg-red-600 text-white animate-pulse' 
              : 'bg-green-600 text-white hover:bg-green-700'
          }`}
        >
          {isCalling ? (
            <>
              <PhoneOff className="w-4 h-4" />
              Calling...
            </>
          ) : (
            <>
              <Phone className="w-4 h-4" />
              Call
            </>
          )}
        </button>

        <button
          onClick={() => {
            setShowNoteModal(true);
            setSelectedCallId(null);
          }}
          className="flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
        >
          <MessageSquare className="w-4 h-4" />
          Add Note
        </button>

        <button
          onClick={() => {/* Show recording history */}}
          className="flex items-center gap-2 px-4 py-2 bg-purple-600 text-white rounded-lg hover:bg-purple-700 transition-colors"
        >
          <Volume2 className="w-4 h-4" />
          Recording History
        </button>
      </div>

      {/* Call History */}
      <div className="bg-white rounded-lg shadow border border-gray-200 overflow-hidden">
        <div className="px-4 py-3 border-b border-gray-200">
          <h3 className="font-semibold text-gray-900">Call History</h3>
        </div>
        
        {loading ? (
          <div className="p-8 text-center text-gray-500">
            Loading call history...
          </div>
        ) : callHistory.length === 0 ? (
          <div className="p-8 text-center text-gray-500">
            <Phone className="w-12 h-12 mx-auto mb-4 text-gray-300" />
            <p>No call history found</p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="min-w-full">
              <thead className="bg-gray-50 border-b border-gray-200">
                <tr>
                  <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                    Date
                  </th>
                  <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                    Employee
                  </th>
                  <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                    Duration
                  </th>
                  <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                    Status
                  </th>
                  <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                    Result
                  </th>
                  <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                    Recording
                  </th>
                  <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                    Notes
                  </th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-200">
                {callHistory.map((call) => (
                  <tr key={call.id} className="hover:bg-gray-50">
                    <td className="px-4 py-3 text-sm text-gray-900">
                      <div className="flex items-center gap-2">
                        <Calendar className="w-4 h-4 text-gray-400" />
                        {formatDate(call.createdAt)}
                      </div>
                    </td>
                    <td className="px-4 py-3 text-sm text-gray-900">
                      <div className="flex items-center gap-2">
                        <User className="w-4 h-4 text-gray-400" />
                        {call.employee.name}
                      </div>
                    </td>
                    <td className="px-4 py-3 text-sm text-gray-900">
                      <div className="flex items-center gap-2">
                        <Clock className="w-4 h-4 text-gray-400" />
                        {formatDuration(call.callDuration)}
                      </div>
                    </td>
                    <td className="px-4 py-3">
                      <span className={`inline-flex items-center px-2 py-1 text-xs font-medium rounded-full ${getStatusColor(call.callStatus)}`}>
                        {call.callStatus}
                      </span>
                    </td>
                    <td className="px-4 py-3">
                      {call.callResult && (
                        <span className={`inline-flex items-center px-2 py-1 text-xs font-medium rounded-full ${getResultColor(call.callResult)}`}>
                          {call.callResult.replace('_', ' ')}
                        </span>
                      )}
                    </td>
                    <td className="px-4 py-3">
                      {call.recordingUrl && (
                        <div className="flex items-center gap-2">
                          <button
                            onClick={() => playRecording(call.id, call.recordingUrl!)}
                            className="p-1 text-blue-600 hover:bg-blue-50 rounded transition-colors"
                          >
                            {playingRecording === call.id ? (
                              <Pause className="w-4 h-4" />
                            ) : (
                              <Play className="w-4 h-4" />
                            )}
                          </button>
                          <a
                            href={call.recordingUrl}
                            download
                            className="p-1 text-gray-600 hover:bg-gray-50 rounded transition-colors"
                          >
                            <Download className="w-4 h-4" />
                          </a>
                        </div>
                      )}
                    </td>
                    <td className="px-4 py-3 text-sm text-gray-500 max-w-xs truncate">
                      {call.notes || '-'}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* Call Note Modal */}
      {showNoteModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-lg max-w-md w-full">
            <div className="p-6">
              <h3 className="text-lg font-semibold text-gray-900 mb-4">
                {selectedCallId ? 'Update Call Result' : 'Add Call Note'}
              </h3>
              
              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Call Result
                  </label>
                  <select
                    value={callResult}
                    onChange={(e) => setCallResult(e.target.value)}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                  >
                    <option value="">Select result...</option>
                    <option value="INTERESTED">Interested</option>
                    <option value="NOT_INTERESTED">Not Interested</option>
                    <option value="CALL_LATER">Call Later</option>
                    <option value="NO_ANSWER">No Answer</option>
                  </select>
                </div>
                
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Notes
                  </label>
                  <textarea
                    value={notes}
                    onChange={(e) => setNotes(e.target.value)}
                    rows={4}
                    placeholder="Add detailed notes about the call..."
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                  />
                </div>
              </div>
              
              <div className="flex gap-3 mt-6">
                <button
                  onClick={saveCallNote}
                  className="flex-1 bg-blue-600 text-white py-2 rounded-lg hover:bg-blue-700 transition-colors"
                >
                  Save
                </button>
                <button
                  onClick={() => {
                    setShowNoteModal(false);
                    setCallResult('');
                    setNotes('');
                    setSelectedCallId(null);
                  }}
                  className="flex-1 bg-gray-200 text-gray-800 py-2 rounded-lg hover:bg-gray-300 transition-colors"
                >
                  Cancel
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default CallManagementPanel;
