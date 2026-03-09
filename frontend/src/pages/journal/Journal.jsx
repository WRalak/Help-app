import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { format } from 'date-fns';
import axios from 'axios';
import toast from 'react-hot-toast';
import {
  PencilIcon,
  MicrophoneIcon,
  SparklesIcon,
  TrashIcon,
  HeartIcon,
  BookmarkIcon,
  ChevronLeftIcon,
  ChevronRightIcon
} from '@heroicons/react/24/outline';
import { HeartIcon as HeartIconSolid } from '@heroicons/react/24/solid';

const Journal = () => {
  const [entries, setEntries] = useState([]);
  const [selectedEntry, setSelectedEntry] = useState(null);
  const [isWriting, setIsWriting] = useState(false);
  const [newEntry, setNewEntry] = useState({
    title: '',
    content: '',
    mood: '',
    tags: []
  });
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [isRecording, setIsRecording] = useState(false);
  const [aiPrompt, setAiPrompt] = useState('');
  const [showPrompts, setShowPrompts] = useState(false);
  const [loading, setLoading] = useState(true);

  const prompts = [
    "What made you smile today?",
    "What's one thing you're grateful for?",
    "How did you practice self-care today?",
    "What's challenging you right now?",
    "Describe a moment of peace you experienced",
    "What would you tell your future self?",
    "What's something you learned about yourself?",
    "How can you be kinder to yourself tomorrow?"
  ];

  useEffect(() => {
    fetchEntries();
  }, [currentPage]);

  const fetchEntries = async () => {
    try {
      const response = await axios.get(`/api/journal?page=${currentPage}&limit=10`);
      setEntries(response.data.entries);
      setTotalPages(response.data.totalPages);
    } catch (error) {
      toast.error('Failed to load journal entries');
    } finally {
      setLoading(false);
    }
  };

  const handleSaveEntry = async () => {
    if (!newEntry.content.trim()) {
      toast.error('Please write something');
      return;
    }

    try {
      const response = await axios.post('/api/journal', newEntry);
      setEntries([response.data.entry, ...entries]);
      setIsWriting(false);
      setNewEntry({ title: '', content: '', mood: '', tags: [] });
      toast.success('Entry saved successfully!');
    } catch (error) {
      toast.error('Failed to save entry');
    }
  };

  const handleDeleteEntry = async (entryId) => {
    if (window.confirm('Are you sure you want to delete this entry?')) {
      try {
        await axios.delete(`/api/journal/${entryId}`);
        setEntries(entries.filter(e => e._id !== entryId));
        toast.success('Entry deleted');
      } catch (error) {
        toast.error('Failed to delete entry');
      }
    }
  };

  const handleToggleFavorite = async (entryId) => {
    try {
      const response = await axios.patch(`/api/journal/${entryId}/favorite`);
      setEntries(entries.map(e => 
        e._id === entryId ? { ...e, isFavorite: response.data.isFavorite } : e
      ));
    } catch (error) {
      toast.error('Failed to update favorite');
    }
  };

  const generateAIPrompt = () => {
    const randomPrompt = prompts[Math.floor(Math.random() * prompts.length)];
    setAiPrompt(randomPrompt);
    setNewEntry({ ...newEntry, content: randomPrompt + '\n\n' });
  };

  // Voice recording simulation
  const toggleRecording = () => {
    if (!isRecording) {
      setIsRecording(true);
      toast.success('Recording started...');
      setTimeout(() => {
        setIsRecording(false);
        setNewEntry({
          ...newEntry,
          content: newEntry.content + '\n[Voice transcription would appear here]'
        });
        toast.success('Recording finished');
      }, 3000);
    } else {
      setIsRecording(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-amber-50 to-orange-50 dark:from-gray-900 dark:to-gray-800">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Header */}
        <div className="flex justify-between items-center mb-8">
          <div>
            <h1 className="text-3xl font-bold text-gray-900 dark:text-white">Journal</h1>
            <p className="text-gray-600 dark:text-gray-400 mt-1">
              {format(new Date(), 'EEEE, MMMM do, yyyy')}
            </p>
          </div>
          <div className="flex space-x-3">
            <button
              onClick={() => setShowPrompts(!showPrompts)}
              className="px-4 py-2 bg-purple-600 text-white rounded-lg hover:bg-purple-700 flex items-center space-x-2"
            >
              <SparklesIcon className="h-5 w-5" />
              <span>Prompts</span>
            </button>
            <button
              onClick={() => setIsWriting(true)}
              className="px-4 py-2 bg-amber-600 text-white rounded-lg hover:bg-amber-700 flex items-center space-x-2"
            >
              <PencilIcon className="h-5 w-5" />
              <span>New Entry</span>
            </button>
          </div>
        </div>

        {/* AI Prompts Panel */}
        <AnimatePresence>
          {showPrompts && (
            <motion.div
              initial={{ opacity: 0, y: -20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -20 }}
              className="mb-6 bg-white dark:bg-gray-800 rounded-xl shadow-sm p-6"
            >
              <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">
                Writing Prompts
              </h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                {prompts.map((prompt, index) => (
                  <button
                    key={index}
                    onClick={() => {
                      setAiPrompt(prompt);
                      setNewEntry({ ...newEntry, content: prompt + '\n\n' });
                      setIsWriting(true);
                      setShowPrompts(false);
                    }}
                    className="p-3 text-left bg-amber-50 dark:bg-gray-700 rounded-lg hover:bg-amber-100 dark:hover:bg-gray-600 transition"
                  >
                    <p className="text-gray-700 dark:text-gray-300">{prompt}</p>
                  </button>
                ))}
              </div>
            </motion.div>
          )}
        </AnimatePresence>

        {/* New Entry Form */}
        <AnimatePresence>
          {isWriting && (
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: 20 }}
              className="mb-8 bg-white dark:bg-gray-800 rounded-xl shadow-sm p-6"
            >
              <div className="flex justify-between items-center mb-4">
                <h2 className="text-xl font-semibold text-gray-900 dark:text-white">
                  New Journal Entry
                </h2>
                <div className="flex space-x-2">
                  <button
                    onClick={generateAIPrompt}
                    className="p-2 text-purple-600 hover:bg-purple-50 rounded-lg"
                    title="Get AI prompt"
                  >
                    <SparklesIcon className="h-5 w-5" />
                  </button>
                  <button
                    onClick={toggleRecording}
                    className={`p-2 rounded-lg ${
                      isRecording 
                        ? 'text-red-600 bg-red-100 animate-pulse' 
                        : 'text-gray-600 hover:bg-gray-100'
                    }`}
                    title="Voice journal"
                  >
                    <MicrophoneIcon className="h-5 w-5" />
                  </button>
                </div>
              </div>

              {aiPrompt && (
                <div className="mb-4 p-3 bg-purple-50 dark:bg-purple-900/20 rounded-lg">
                  <p className="text-purple-700 dark:text-purple-300">{aiPrompt}</p>
                </div>
              )}

              <input
                type="text"
                placeholder="Title (optional)"
                value={newEntry.title}
                onChange={(e) => setNewEntry({ ...newEntry, title: e.target.value })}
                className="w-full mb-4 px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg
                         bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
              />

              <textarea
                placeholder="Write your thoughts..."
                value={newEntry.content}
                onChange={(e) => setNewEntry({ ...newEntry, content: e.target.value })}
                rows="8"
                className="w-full mb-4 px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg
                         bg-white dark:bg-gray-700 text-gray-900 dark:text-white resize-none"
                autoFocus
              />

              <div className="flex justify-end space-x-3">
                <button
                  onClick={() => {
                    setIsWriting(false);
                    setNewEntry({ title: '', content: '', mood: '', tags: [] });
                  }}
                  className="px-4 py-2 text-gray-600 dark:text-gray-400 hover:text-gray-900"
                >
                  Cancel
                </button>
                <button
                  onClick={handleSaveEntry}
                  className="px-6 py-2 bg-amber-600 text-white rounded-lg hover:bg-amber-700"
                >
                  Save Entry
                </button>
              </div>
            </motion.div>
          )}
        </AnimatePresence>

        {/* Entries List */}
        {loading ? (
          <div className="flex justify-center items-center h-64">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-amber-600"></div>
          </div>
        ) : (
          <div className="space-y-4">
            {entries.length === 0 ? (
              <div className="text-center py-12">
                <BookmarkIcon className="h-16 w-16 mx-auto text-gray-400 mb-4" />
                <h3 className="text-xl font-medium text-gray-900 dark:text-white mb-2">
                  No journal entries yet
                </h3>
                <p className="text-gray-600 dark:text-gray-400 mb-4">
                  Start writing your first entry to begin your journey
                </p>
                <button
                  onClick={() => setIsWriting(true)}
                  className="px-6 py-2 bg-amber-600 text-white rounded-lg hover:bg-amber-700"
                >
                  Write Your First Entry
                </button>
              </div>
            ) : (
              entries.map((entry, index) => (
                <motion.div
                  key={entry._id}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: index * 0.05 }}
                  className="bg-white dark:bg-gray-800 rounded-xl shadow-sm p-6 hover:shadow-md transition"
                >
                  <div className="flex justify-between items-start mb-3">
                    <div>
                      <h3 className="text-lg font-semibold text-gray-900 dark:text-white">
                        {entry.title || 'Untitled Entry'}
                      </h3>
                      <p className="text-sm text-gray-500 dark:text-gray-400">
                        {format(new Date(entry.timestamp), 'MMMM do, yyyy • h:mm a')}
                      </p>
                    </div>
                    <div className="flex space-x-2">
                      <button
                        onClick={() => handleToggleFavorite(entry._id)}
                        className="p-2 text-gray-400 hover:text-amber-500"
                      >
                        {entry.isFavorite ? (
                          <HeartIconSolid className="h-5 w-5 text-amber-500" />
                        ) : (
                          <HeartIcon className="h-5 w-5" />
                        )}
                      </button>
                      <button
                        onClick={() => handleDeleteEntry(entry._id)}
                        className="p-2 text-gray-400 hover:text-red-500"
                      >
                        <TrashIcon className="h-5 w-5" />
                      </button>
                    </div>
                  </div>

                  <p className="text-gray-700 dark:text-gray-300 whitespace-pre-line line-clamp-3">
                    {entry.content}
                  </p>

                  {entry.tags && entry.tags.length > 0 && (
                    <div className="mt-3 flex flex-wrap gap-2">
                      {entry.tags.map(tag => (
                        <span
                          key={tag}
                          className="px-2 py-1 bg-amber-100 dark:bg-amber-900/30 text-amber-700 dark:text-amber-300 text-xs rounded-full"
                        >
                          #{tag}
                        </span>
                      ))}
                    </div>
                  )}

                  {entry.aiInsights && (
                    <div className="mt-3 p-2 bg-purple-50 dark:bg-purple-900/20 rounded-lg">
                      <p className="text-sm text-purple-700 dark:text-purple-300">
                        ✨ AI Insight: {entry.aiInsights.summary}
                      </p>
                    </div>
                  )}
                </motion.div>
              ))
            )}

            {/* Pagination */}
            {totalPages > 1 && (
              <div className="flex justify-center space-x-2 mt-6">
                <button
                  onClick={() => setCurrentPage(p => Math.max(1, p - 1))}
                  disabled={currentPage === 1}
                  className="p-2 text-gray-600 hover:text-gray-900 disabled:opacity-50"
                >
                  <ChevronLeftIcon className="h-5 w-5" />
                </button>
                <span className="px-4 py-2 text-gray-700 dark:text-gray-300">
                  Page {currentPage} of {totalPages}
                </span>
                <button
                  onClick={() => setCurrentPage(p => Math.min(totalPages, p + 1))}
                  disabled={currentPage === totalPages}
                  className="p-2 text-gray-600 hover:text-gray-900 disabled:opacity-50"
                >
                  <ChevronRightIcon className="h-5 w-5" />
                </button>
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
};

export default Journal;