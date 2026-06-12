'use client';

import { useState, useEffect } from 'react';
import { Edit2, Trash2, Plus, Search, BookOpen, Calendar, FileText, Eye } from 'lucide-react';

interface Note {
  id: string;
  title: string;
  content: string;
  createdAt: string;
  updatedAt: string;
  course?: {
    title: string;
    slug: string;
  };
  module?: {
    title: string;
  };
}

export default function StudentNotes() {
  const [notes, setNotes] = useState<Note[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [editingNote, setEditingNote] = useState<Note | null>(null);
  const [showModal, setShowModal] = useState(false);
  const [noteToDelete, setNoteToDelete] = useState<string | null>(null);
  const [modalMode, setModalMode] = useState<'create' | 'edit'>('create');
  const [noteTitle, setNoteTitle] = useState('');
  const [noteContent, setNoteContent] = useState('');
  const [isSaving, setIsSaving] = useState(false);

  useEffect(() => {
    fetchNotes();
  }, []);

  const fetchNotes = async () => {
    try {
      const response = await fetch('/api/student/notes', {
        credentials: 'include'
      });
      const data = await response.json();

      if (data.success) {
        setNotes(data.notes);
      }
      setLoading(false);
    } catch (error) {
      console.error('Error fetching notes:', error);
      setLoading(false);
    }
  };

  const handleCreateNote = () => {
    setModalMode('create');
    setNoteTitle('');
    setNoteContent('');
    setShowModal(true);
  };

  const handleEditNote = (note: Note) => {
    setModalMode('edit');
    setEditingNote(note);
    setNoteTitle(note.title);
    setNoteContent(note.content);
    setShowModal(true);
  };

  const handleDeleteConfirm = async (id: string) => {

    try {
      const response = await fetch(`/api/student/notes?id=${id}`, {
        method: 'DELETE',
        credentials: 'include'
      });
      const data = await response.json();

      if (data.success) {
        setNotes(notes.filter(note => note.id !== id));
        setNoteToDelete(null);
      } else {
        alert(data.error || 'Failed to delete note');
        setNoteToDelete(null);
      }
    } catch (error) {
      console.error('Error deleting note:', error);
      alert('Network or server error deleting note');
      setNoteToDelete(null);
    }
  };

  const handleSaveNote = async () => {
    if (!noteTitle.trim() || !noteContent.trim()) {
      alert('Title and content are required');
      return;
    }

    setIsSaving(true);

    try {
      if (modalMode === 'create') {
        const response = await fetch('/api/student/notes', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          credentials: 'include',
          body: JSON.stringify({
            title: noteTitle,
            content: noteContent
          })
        });
        const data = await response.json();

        if (data.success) {
          setNotes([data.note, ...notes]);
          setShowModal(false);
          setNoteTitle('');
          setNoteContent('');
        }
      } else {
        const response = await fetch('/api/student/notes', {
          method: 'PUT',
          headers: { 'Content-Type': 'application/json' },
          credentials: 'include',
          body: JSON.stringify({
            id: editingNote?.id,
            title: noteTitle,
            content: noteContent
          })
        });
        const data = await response.json();

        if (data.success) {
          setNotes(notes.map(note => 
            note.id === editingNote?.id ? data.note : note
          ));
          setShowModal(false);
          setNoteTitle('');
          setNoteContent('');
          setEditingNote(null);
        }
      }
    } catch (error) {
      console.error('Error saving note:', error);
      alert('Failed to save note');
    } finally {
      setIsSaving(false);
    }
  };

  const filteredNotes = notes.filter(note =>
    note.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
    note.content.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="bg-gradient-to-r from-[#1a1f4c] to-[#0d1b3e] border border-blue-500/20 rounded-2xl p-6 sm:p-8 text-white shadow-xl">
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between">
          <div>
            <h1 className="text-2xl sm:text-3xl font-bold mb-2">My Notes</h1>
            <p className="text-blue-200 text-sm sm:text-base">View, edit, and manage your study notes.</p>
          </div>
          <button
            onClick={handleCreateNote}
            className="mt-4 sm:mt-0 flex items-center gap-2 px-4 py-2 bg-blue-600/20 border border-blue-500/30 text-blue-400 rounded-lg hover:bg-blue-600/40 hover:text-white transition-colors font-medium"
          >
            <Plus className="w-5 h-5" />
            <span>Add Note</span>
          </button>
        </div>
      </div>

      {/* Search Bar */}
      <div className="bg-[#1a1f4c]/50 backdrop-blur-sm rounded-xl shadow-lg border border-blue-500/20 p-4">
        <div className="relative">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-blue-400 w-5 h-5" />
          <input
            type="text"
            placeholder="Search notes..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full pl-10 pr-4 py-2 bg-[#0a0e27]/50 border border-blue-500/30 text-white rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent placeholder-blue-400/50"
          />
        </div>
      </div>

      {/* Loading State */}
      {loading && (
        <div className="bg-[#1a1f4c]/50 backdrop-blur-sm rounded-xl shadow-lg border border-blue-500/20 p-8 text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-400 mx-auto"></div>
          <p className="mt-4 text-blue-200">Loading notes...</p>
        </div>
      )}

      {/* Notes Grid */}
      {!loading && filteredNotes.length === 0 && (
        <div className="bg-[#1a1f4c]/50 backdrop-blur-sm rounded-xl shadow-lg border border-blue-500/20 p-8 sm:p-12 text-center">
          <div className="w-16 h-16 sm:w-20 sm:h-20 mx-auto bg-[#0a0e27] border border-blue-500/30 rounded-full flex items-center justify-center mb-6 shadow-inner">
            <FileText className="w-8 h-8 sm:w-10 sm:h-10 text-blue-400" />
          </div>
          <h3 className="text-lg font-medium text-white mb-2">No notes yet</h3>
          <p className="text-blue-200 text-sm sm:text-base">You haven't created any notes yet. Click "Add Note" to get started.</p>
        </div>
      )}

      {!loading && filteredNotes.length > 0 && (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {filteredNotes.map((note) => (
            <div key={note.id} className="bg-[#1a1f4c]/50 backdrop-blur-sm rounded-xl shadow-lg border border-blue-500/20 overflow-hidden hover:shadow-blue-500/10 hover:border-blue-500/40 transition-all duration-300">
              <div className="p-5">
                <div className="flex items-start justify-between mb-3">
                  <h3 className="font-semibold text-white text-lg line-clamp-2">{note.title}</h3>
                  <div className="flex gap-2 ml-2">
                    <button
                      onClick={() => handleEditNote(note)}
                      className="p-1.5 text-blue-400 hover:text-white bg-blue-500/10 hover:bg-blue-500/30 border border-blue-500/20 rounded-lg transition-all"
                      title="View/Edit Note"
                    >
                      <Eye className="w-4 h-4" />
                    </button>
                    <button
                      onClick={() => setNoteToDelete(note.id)}
                      className="p-1.5 text-red-400 hover:text-white bg-red-500/10 hover:bg-red-500/30 border border-red-500/20 rounded-lg transition-all"
                      title="Delete Note"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>
                </div>
                <p className="text-blue-100 text-sm line-clamp-4 mb-4">{note.content}</p>
                <div className="flex items-center justify-between text-xs text-blue-300">
                  {note.course && (
                    <div className="flex items-center gap-1">
                      <BookOpen className="w-3 h-3" />
                      <span className="truncate max-w-[120px]">{note.course.title}</span>
                    </div>
                  )}
                  <div className="flex items-center gap-1">
                    <Calendar className="w-3 h-3" />
                    <span>{new Date(note.updatedAt).toLocaleDateString()}</span>
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Modal */}
      {showModal && (
        <div className="fixed inset-0 bg-black/75 backdrop-blur-sm flex items-center justify-center z-50 p-4">
          <div className="bg-gradient-to-b from-[#1a1f4c] to-[#0a0e27] rounded-2xl shadow-2xl w-full max-w-2xl max-h-[90vh] overflow-y-auto border border-blue-500/30">
            <div className="p-6">
              <h2 className="text-2xl font-bold text-white mb-4">
                {modalMode === 'create' ? 'Create Note' : 'View Note'}
              </h2>
              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-blue-200 mb-1">Title</label>
                  <input
                    type="text"
                    value={noteTitle}
                    onChange={(e) => setNoteTitle(e.target.value)}
                    className="w-full px-4 py-2 bg-[#0a0e27]/50 border border-blue-500/30 text-white rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent placeholder-blue-400/50"
                    placeholder="Note title..."
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-blue-200 mb-1">Content</label>
                  <textarea
                    value={noteContent}
                    onChange={(e) => setNoteContent(e.target.value)}
                    rows={8}
                    className="w-full px-4 py-2 bg-[#0a0e27]/50 border border-blue-500/30 text-white rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent placeholder-blue-400/50"
                    placeholder="Write your note content..."
                  />
                </div>
              </div>
              <div className="flex gap-3 mt-6">
                <button
                  onClick={handleSaveNote}
                  disabled={isSaving}
                  className="flex-1 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-500 transition-colors font-medium disabled:opacity-50 disabled:cursor-not-allowed shadow-lg shadow-blue-500/20"
                >
                  {isSaving ? 'Saving...' : modalMode === 'create' ? 'Create Note' : 'Update Note'}
                </button>
                <button
                  onClick={() => {
                    setShowModal(false);
                    setNoteTitle('');
                    setNoteContent('');
                    setEditingNote(null);
                  }}
                  className="flex-1 px-4 py-2 bg-[#0a0e27] text-blue-200 border border-blue-500/30 rounded-lg hover:bg-[#1a1f4c] hover:text-white transition-colors font-medium"
                >
                  Cancel
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Delete Confirmation Modal */}
      {noteToDelete && (
        <div className="fixed inset-0 bg-black/75 backdrop-blur-sm flex items-center justify-center z-50 p-4">
          <div className="bg-gradient-to-b from-[#1a1f4c] to-[#0a0e27] rounded-2xl shadow-2xl w-full max-w-md p-6 border border-red-500/30 text-center">
            <div className="w-16 h-16 mx-auto bg-red-500/10 border border-red-500/20 rounded-full flex items-center justify-center mb-4">
              <Trash2 className="w-8 h-8 text-red-400" />
            </div>
            <h2 className="text-xl font-bold text-white mb-2">Delete Note</h2>
            <p className="text-blue-200 mb-6">Are you sure you want to delete this note? This action cannot be undone.</p>
            <div className="flex gap-3">
              <button
                onClick={() => handleDeleteConfirm(noteToDelete)}
                className="flex-1 px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-500 transition-colors font-medium shadow-lg shadow-red-500/20"
              >
                Delete
              </button>
              <button
                onClick={() => setNoteToDelete(null)}
                className="flex-1 px-4 py-2 bg-[#0a0e27] text-blue-200 border border-blue-500/30 rounded-lg hover:bg-[#1a1f4c] hover:text-white transition-colors font-medium"
              >
                Cancel
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
