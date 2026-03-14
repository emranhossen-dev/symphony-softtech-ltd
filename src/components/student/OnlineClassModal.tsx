"use client";

import { useState, useEffect } from 'react';
import { X, Video, Users, Clock, Calendar, Mic, MicOff, VideoOff, Monitor, MessageSquare, Hand } from 'lucide-react';

interface OnlineClassModalProps {
  isOpen: boolean;
  onClose: () => void;
  classData?: {
    title: string;
    instructor: string;
    startTime: string;
    duration: string;
    description: string;
    participants: number;
    meetingLink?: string;
  };
}

const OnlineClassModal = ({ isOpen, onClose, classData }: OnlineClassModalProps) => {
  const [isMuted, setIsMuted] = useState(false);
  const [isVideoOff, setIsVideoOff] = useState(false);
  const [timeLeft, setTimeLeft] = useState('');

  useEffect(() => {
    if (!isOpen) return;

    const timer = setInterval(() => {
      const now = new Date();
      const classTime = new Date(classData?.startTime || '');
      const diff = classTime.getTime() - now.getTime();
      
      if (diff > 0) {
        const minutes = Math.floor(diff / 60000);
        const seconds = Math.floor((diff % 60000) / 1000);
        setTimeLeft(`${minutes}:${seconds.toString().padStart(2, '0')}`);
      } else {
        setTimeLeft('Started');
      }
    }, 1000);

    return () => clearInterval(timer);
  }, [isOpen, classData?.startTime]);

  if (!isOpen) return null;

  const defaultClassData = {
    title: "Advanced React Development",
    instructor: "Dr. Sarah Johnson",
    startTime: new Date(Date.now() + 15 * 60000).toISOString(),
    duration: "2 hours",
    description: "Learn advanced React concepts including hooks, context, and performance optimization",
    participants: 24,
    meetingLink: "https://meet.jit.si/symphony-institute-react-class"
  };

  const classInfo = classData || defaultClassData;

  const handleJoinClass = () => {
    if (classInfo.meetingLink) {
      window.open(classInfo.meetingLink, '_blank');
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center">
      {/* Backdrop */}
      <div 
        className="absolute inset-0 bg-black/60 backdrop-blur-sm"
        onClick={onClose}
      />

      {/* Modal */}
      <div className="relative bg-white rounded-2xl shadow-2xl w-full max-w-4xl mx-4 max-h-[90vh] overflow-hidden">
        {/* Header */}
        <div className="bg-gradient-to-r from-green-600 to-emerald-600 p-6 text-white">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-4">
              <div className="w-12 h-12 bg-white/20 backdrop-blur-sm rounded-xl flex items-center justify-center">
                <Video className="w-6 h-6 text-white" />
              </div>
              <div>
                <h2 className="text-2xl font-bold">{classInfo.title}</h2>
                <p className="text-green-100">Instructor: {classInfo.instructor}</p>
              </div>
            </div>
            <button
              onClick={onClose}
              className="p-2 rounded-lg bg-white/20 hover:bg-white/30 transition-colors"
            >
              <X className="w-5 h-5 text-white" />
            </button>
          </div>
        </div>

        <div className="flex flex-col lg:flex-row">
          {/* Main Content */}
          <div className="flex-1 p-6">
            {/* Class Info */}
            <div className="mb-6">
              <h3 className="text-lg font-semibold text-gray-900 mb-3">Class Information</h3>
              <div className="bg-gray-50 rounded-xl p-4 space-y-3">
                <div className="flex items-center justify-between">
                  <div className="flex items-center text-gray-600">
                    <Calendar className="w-4 h-4 mr-2" />
                    <span className="text-sm">Date & Time</span>
                  </div>
                  <span className="text-sm font-medium text-gray-900">
                    {new Date(classInfo.startTime).toLocaleString()}
                  </span>
                </div>
                
                <div className="flex items-center justify-between">
                  <div className="flex items-center text-gray-600">
                    <Clock className="w-4 h-4 mr-2" />
                    <span className="text-sm">Duration</span>
                  </div>
                  <span className="text-sm font-medium text-gray-900">{classInfo.duration}</span>
                </div>
                
                <div className="flex items-center justify-between">
                  <div className="flex items-center text-gray-600">
                    <Users className="w-4 h-4 mr-2" />
                    <span className="text-sm">Participants</span>
                  </div>
                  <span className="text-sm font-medium text-gray-900">{classInfo.participants} enrolled</span>
                </div>
                
                <div className="flex items-center justify-between">
                  <div className="flex items-center text-gray-600">
                    <Video className="w-4 h-4 mr-2" />
                    <span className="text-sm">Status</span>
                  </div>
                  <span className={`text-sm font-medium ${timeLeft === 'Started' ? 'text-green-600' : 'text-orange-600'}`}>
                    {timeLeft === 'Started' ? 'Live Now' : `Starts in ${timeLeft}`}
                  </span>
                </div>
              </div>
            </div>

            {/* Description */}
            <div className="mb-6">
              <h3 className="text-lg font-semibold text-gray-900 mb-3">Description</h3>
              <p className="text-gray-600 leading-relaxed">{classInfo.description}</p>
            </div>

            {/* Video Preview Area */}
            <div className="mb-6">
              <h3 className="text-lg font-semibold text-gray-900 mb-3">Video Preview</h3>
              <div className="bg-gray-900 rounded-xl aspect-video flex items-center justify-center relative overflow-hidden">
                {isVideoOff ? (
                  <div className="text-center">
                    <VideoOff className="w-16 h-16 text-gray-500 mx-auto mb-2" />
                    <p className="text-gray-400">Camera is off</p>
                  </div>
                ) : (
                  <div className="w-full h-full bg-gradient-to-br from-gray-800 to-gray-900 flex items-center justify-center">
                    <div className="w-20 h-20 bg-gray-700 rounded-full flex items-center justify-center">
                      <span className="text-white text-2xl font-bold">ST</span>
                    </div>
                  </div>
                )}
                
                {/* Controls Overlay */}
                <div className="absolute bottom-4 left-4 right-4 flex items-center justify-center space-x-4">
                  <button
                    onClick={() => setIsMuted(!isMuted)}
                    className={`p-3 rounded-full transition-colors ${
                      isMuted ? 'bg-red-600 text-white' : 'bg-gray-700 text-white hover:bg-gray-600'
                    }`}
                  >
                    {isMuted ? <MicOff className="w-5 h-5" /> : <Mic className="w-5 h-5" />}
                  </button>
                  
                  <button
                    onClick={() => setIsVideoOff(!isVideoOff)}
                    className={`p-3 rounded-full transition-colors ${
                      isVideoOff ? 'bg-red-600 text-white' : 'bg-gray-700 text-white hover:bg-gray-600'
                    }`}
                  >
                    {isVideoOff ? <VideoOff className="w-5 h-5" /> : <Video className="w-5 h-5" />}
                  </button>
                  
                  <button className="p-3 bg-gray-700 text-white rounded-full hover:bg-gray-600 transition-colors">
                    <Monitor className="w-5 h-5" />
                  </button>
                  
                  <button className="p-3 bg-gray-700 text-white rounded-full hover:bg-gray-600 transition-colors">
                    <Hand className="w-5 h-5" />
                  </button>
                </div>
              </div>
            </div>
          </div>

          {/* Sidebar */}
          <div className="lg:w-80 bg-gray-50 p-6 border-t lg:border-t-0 lg:border-l border-gray-200">
            <h3 className="text-lg font-semibold text-gray-900 mb-4">Quick Actions</h3>
            
            <div className="space-y-3">
              <button
                onClick={handleJoinClass}
                className="w-full bg-gradient-to-r from-green-600 to-emerald-600 text-white py-3 px-4 rounded-xl font-medium hover:from-green-700 hover:to-emerald-700 transition-all duration-200 shadow-lg"
              >
                Join Class Now
              </button>
              
              <button className="w-full bg-white border border-gray-300 text-gray-700 py-3 px-4 rounded-xl font-medium hover:bg-gray-50 transition-colors">
                <MessageSquare className="w-4 h-4 inline mr-2" />
                Open Chat
              </button>
              
              <button className="w-full bg-white border border-gray-300 text-gray-700 py-3 px-4 rounded-xl font-medium hover:bg-gray-50 transition-colors">
                View Materials
              </button>
              
              <button className="w-full bg-white border border-gray-300 text-gray-700 py-3 px-4 rounded-xl font-medium hover:bg-gray-50 transition-colors">
                Set Reminder
              </button>
            </div>

            {/* Participants Preview */}
            <div className="mt-6">
              <h4 className="text-sm font-semibold text-gray-900 mb-3">Participants ({classInfo.participants})</h4>
              <div className="flex -space-x-2">
                {[...Array(Math.min(8, classInfo.participants))].map((_, i) => (
                  <div
                    key={i}
                    className="w-8 h-8 bg-gradient-to-br from-green-400 to-emerald-600 rounded-full border-2 border-white flex items-center justify-center"
                  >
                    <span className="text-white text-xs font-bold">
                      {String.fromCharCode(65 + i)}
                    </span>
                  </div>
                ))}
                {classInfo.participants > 8 && (
                  <div className="w-8 h-8 bg-gray-300 rounded-full border-2 border-white flex items-center justify-center">
                    <span className="text-gray-600 text-xs font-bold">
                      +{classInfo.participants - 8}
                    </span>
                  </div>
                )}
              </div>
            </div>

            {/* Class Rules */}
            <div className="mt-6">
              <h4 className="text-sm font-semibold text-gray-900 mb-3">Class Rules</h4>
              <ul className="text-xs text-gray-600 space-y-2">
                <li className="flex items-start">
                  <span className="text-green-600 mr-2">•</span>
                  Join 5 minutes before class starts
                </li>
                <li className="flex items-start">
                  <span className="text-green-600 mr-2">•</span>
                  Keep microphone muted when not speaking
                </li>
                <li className="flex items-start">
                  <span className="text-green-600 mr-2">•</span>
                  Use raise hand feature to ask questions
                </li>
                <li className="flex items-start">
                  <span className="text-green-600 mr-2">•</span>
                  Recordings will be available after class
                </li>
              </ul>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default OnlineClassModal;
