import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import axios from 'axios';
import toast from 'react-hot-toast';
import { format, subDays } from 'date-fns';
import { Line } from 'react-chartjs-2';
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  Title,
  Tooltip,
  Legend
} from 'chart.js';

ChartJS.register(
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  Title,
  Tooltip,
  Legend
);

const MoodTracker = () => {
  const [moods, setMoods] = useState([]);
  const [stats, setStats] = useState({});
  const [loading, setLoading] = useState(true);
  const [showQuickCheck, setShowQuickCheck] = useState(false);
  const [selectedPeriod, setSelectedPeriod] = useState('week');

  useEffect(() => {
    fetchMoodData();
    fetchMoodStats();
  }, []);

  // API: GET /api/mood
  const fetchMoodData = async () => {
    try {
      const response = await axios.get('/api/mood');
      setMoods(response.data.moods);
    } catch (error) {
      toast.error('Failed to load mood data');
    }
  };

  // API: GET /api/mood/stats
  const fetchMoodStats = async () => {
    try {
      const response = await axios.get('/api/mood/stats');
      setStats(response.data.stats);
    } catch (error) {
      console.error('Error fetching stats:', error);
    } finally {
      setLoading(false);
    }
  };

  // API: POST /api/mood
  const handleQuickMood = async (rating) => {
    try {
      await axios.post('/api/mood', {
        rating,
        emotion: getEmotionFromRating(rating),
        timestamp: new Date()
      });
      toast.success('Mood logged successfully!');
      fetchMoodData();
      fetchMoodStats();
    } catch (error) {
      toast.error('Failed to log mood');
    }
  };

  const getEmotionFromRating = (rating) => {
    if (rating >= 8) return 'happy';
    if (rating >= 6) return 'calm';
    if (rating >= 4) return 'neutral';
    if (rating >= 2) return 'sad';
    return 'angry';
  };

  // Chart data
  const chartData = {
    labels: moods.slice(-7).map(m => format(new Date(m.timestamp), 'EEE')),
    datasets: [
      {
        label: 'Mood Level',
        data: moods.slice(-7).map(m => m.rating),
        borderColor: 'rgb(147, 51, 234)',
        backgroundColor: 'rgba(147, 51, 234, 0.1)',
        tension: 0.4,
        fill: true
      }
    ]
  };

  const chartOptions = {
    responsive: true,
    plugins: {
      legend: { display: false },
      tooltip: {
        callbacks: {
          label: (context) => `Mood: ${context.raw}/10`
        }
      }
    },
    scales: {
      y: { min: 0, max: 10 }
    }
  };

  const emotions = [
    { emoji: '😊', label: 'Happy', color: 'bg-yellow-100', value: 8 },
    { emoji: '😌', label: 'Calm', color: 'bg-blue-100', value: 7 },
    { emoji: '😐', label: 'Neutral', color: 'bg-gray-100', value: 5 },
    { emoji: '😔', label: 'Sad', color: 'bg-indigo-100', value: 3 },
    { emoji: '😠', label: 'Angry', color: 'bg-red-100', value: 2 },
    { emoji: '😰', label: 'Anxious', color: 'bg-orange-100', value: 4 }
  ];

  if (loading) {
    return (
      <div className="flex justify-center items-center h-64">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-purple-600"></div>
      </div>
    );
  }

  return (
    <div className="max-w-7xl mx-auto">
      <div className="flex justify-between items-center mb-8">
        <h1 className="text-3xl font-bold text-gray-900 dark:text-white">
          Mood Tracker
        </h1>
        <button
          onClick={() => setShowQuickCheck(!showQuickCheck)}
          className="px-4 py-2 bg-purple-600 text-white rounded-lg hover:bg-purple-700"
        >
          Quick Check-in
        </button>
      </div>

      {/* Quick Mood Check */}
      {showQuickCheck && (
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          className="mb-8 bg-white dark:bg-gray-800 rounded-xl shadow-sm p-6"
        >
          <h2 className="text-xl font-semibold text-gray-900 dark:text-white mb-4">
            How are you feeling?
          </h2>
          <div className="grid grid-cols-3 md:grid-cols-6 gap-3">
            {emotions.map((emotion) => (
              <button
                key={emotion.label}
                onClick={() => handleQuickMood(emotion.value)}
                className={`p-4 ${emotion.color} dark:bg-opacity-20 rounded-xl text-center hover:scale-105 transition`}
              >
                <div className="text-3xl mb-2">{emotion.emoji}</div>
                <div className="text-sm font-medium text-gray-700 dark:text-gray-300">
                  {emotion.label}
                </div>
              </button>
            ))}
          </div>
        </motion.div>
      )}

      {/* Stats Grid */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
        <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm p-6">
          <p className="text-sm text-gray-600 dark:text-gray-400">Total Check-ins</p>
          <p className="text-2xl font-bold text-gray-900 dark:text-white">
            {stats.total || 0}
          </p>
        </div>
        <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm p-6">
          <p className="text-sm text-gray-600 dark:text-gray-400">Average Mood</p>
          <p className="text-2xl font-bold text-gray-900 dark:text-white">
            {stats.average?.toFixed(1) || 0}/10
          </p>
        </div>
        <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm p-6">
          <p className="text-sm text-gray-600 dark:text-gray-400">Current Streak</p>
          <p className="text-2xl font-bold text-gray-900 dark:text-white">
            {stats.streak || 0} days
          </p>
        </div>
        <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm p-6">
          <p className="text-sm text-gray-600 dark:text-gray-400">Most Common</p>
          <p className="text-2xl font-bold text-gray-900 dark:text-white capitalize">
            {Object.keys(stats.byEmotion || {}).sort((a, b) => 
              (stats.byEmotion?.[b] || 0) - (stats.byEmotion?.[a] || 0)
            )[0] || 'None'}
          </p>
        </div>
      </div>

      {/* Chart */}
      <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm p-6 mb-8">
        <div className="flex justify-between items-center mb-4">
          <h2 className="text-xl font-semibold text-gray-900 dark:text-white">
            Mood Trend
          </h2>
          <select
            value={selectedPeriod}
            onChange={(e) => setSelectedPeriod(e.target.value)}
            className="px-3 py-1 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
          >
            <option value="week">Last 7 Days</option>
            <option value="month">Last 30 Days</option>
            <option value="year">Last Year</option>
          </select>
        </div>
        {moods.length > 0 ? (
          <Line data={chartData} options={chartOptions} />
        ) : (
          <div className="h-64 flex items-center justify-center text-gray-500">
            No mood data yet. Start tracking your mood!
          </div>
        )}
      </div>

      {/* Emotion Distribution */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm p-6">
          <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">
            Emotion Distribution
          </h3>
          <div className="space-y-3">
            {Object.entries(stats.byEmotion || {}).map(([emotion, count]) => (
              <div key={emotion}>
                <div className="flex justify-between text-sm mb-1">
                  <span className="capitalize text-gray-700 dark:text-gray-300">
                    {emotion}
                  </span>
                  <span className="text-gray-600 dark:text-gray-400">{count}</span>
                </div>
                <div className="h-2 bg-gray-200 dark:bg-gray-700 rounded-full">
                  <div
                    className="h-2 bg-purple-600 rounded-full"
                    style={{ width: `${(count / stats.total) * 100}%` }}
                  />
                </div>
              </div>
            ))}
          </div>
        </div>

        <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm p-6">
          <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">
            Factors Affecting Mood
          </h3>
          <div className="space-y-3">
            {Object.entries(stats.byFactor || {}).map(([factor, count]) => (
              <div key={factor}>
                <div className="flex justify-between text-sm mb-1">
                  <span className="capitalize text-gray-700 dark:text-gray-300">
                    {factor}
                  </span>
                  <span className="text-gray-600 dark:text-gray-400">{count}</span>
                </div>
                <div className="h-2 bg-gray-200 dark:bg-gray-700 rounded-full">
                  <div
                    className="h-2 bg-blue-600 rounded-full"
                    style={{ width: `${(count / stats.total) * 100}%` }}
                  />
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Recent Entries */}
      <div className="mt-8 bg-white dark:bg-gray-800 rounded-xl shadow-sm p-6">
        <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">
          Recent Check-ins
        </h3>
        <div className="space-y-3">
          {moods.slice(0, 5).map((mood) => (
            <div key={mood._id} className="flex items-center justify-between p-3 bg-gray-50 dark:bg-gray-700 rounded-lg">
              <div className="flex items-center space-x-3">
                <div className={`w-10 h-10 rounded-full flex items-center justify-center text-lg
                  ${mood.rating >= 7 ? 'bg-green-100 text-green-600' :
                    mood.rating >= 4 ? 'bg-yellow-100 text-yellow-600' :
                    'bg-red-100 text-red-600'}`}
                >
                  {mood.rating}
                </div>
                <div>
                  <p className="font-medium text-gray-900 dark:text-white capitalize">
                    {mood.emotion}
                  </p>
                  <p className="text-xs text-gray-500 dark:text-gray-400">
                    {format(new Date(mood.timestamp), 'MMM d, yyyy h:mm a')}
                  </p>
                </div>
              </div>
              {mood.notes && (
                <p className="text-sm text-gray-600 dark:text-gray-400 max-w-md truncate">
                  {mood.notes}
                </p>
              )}
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

export default MoodTracker;