import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import axios from 'axios';
import { format } from 'date-fns';

const RecentEntries = () => {
  const [entries, setEntries] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchRecentEntries();
  }, []);

  const fetchRecentEntries = async () => {
    try {
      const response = await axios.get('/api/journal/recent?limit=3');
      setEntries(response.data.entries);
    } catch (error) {
      console.error('Error fetching recent entries:', error);
    } finally {
      setLoading(false);
    }
  };

  const getEmotionEmoji = (emotion) => {
    const emojis = {
      happy: '😊',
      calm: '😌',
      peaceful: '🕊️',
      excited: '🤗',
      anxious: '😰',
      stressed: '😩',
      sad: '😢',
      angry: '😠',
      lonely: '🥺',
      grateful: '🙏',
      hopeful: '🌟',
      tired: '😴'
    };
    return emojis[emotion] || '📝';
  };

  if (loading) {
    return (
      <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm p-6">
        <div className="animate-pulse space-y-4">
          <div className="h-4 bg-gray-200 rounded w-1/4"></div>
          <div className="h-20 bg-gray-200 rounded"></div>
          <div className="h-20 bg-gray-200 rounded"></div>
        </div>
      </div>
    );
  }

  return (
    <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm p-6">
      <div className="flex justify-between items-center mb-4">
        <h2 className="text-lg font-semibold text-gray-900 dark:text-white">
          Recent Journal Entries
        </h2>
        <Link
          to="/journal"
          className="text-sm text-purple-600 hover:text-purple-700"
        >
          View all
        </Link>
      </div>

      {entries.length === 0 ? (
        <p className="text-gray-500 dark:text-gray-400 text-center py-4">
          No journal entries yet. Start writing!
        </p>
      ) : (
        <div className="space-y-3">
          {entries.map((entry) => (
            <div
              key={entry._id}
              className="p-3 bg-gray-50 dark:bg-gray-700 rounded-lg"
            >
              <div className="flex items-center space-x-3 mb-2">
                <span className="text-2xl">
                  {getEmotionEmoji(entry.mood?.emotion)}
                </span>
                <div className="flex-1">
                  <p className="text-sm font-medium text-gray-900 dark:text-white">
                    {entry.title || 'Untitled'}
                  </p>
                  <p className="text-xs text-gray-500 dark:text-gray-400">
                    {format(new Date(entry.timestamp), 'MMM d, yyyy')}
                  </p>
                </div>
              </div>
              <p className="text-sm text-gray-600 dark:text-gray-300 line-clamp-2">
                {entry.content}
              </p>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default RecentEntries;