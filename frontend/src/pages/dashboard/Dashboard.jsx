import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { useAuth } from '../../context/AuthContext';
import { useNotifications } from '../../context/NotificationContext';
import { Line, Doughnut } from 'react-chartjs-2';
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  Title,
  Tooltip,
  Legend,
  ArcElement
} from 'chart.js';
import { 
  HeartIcon, 
  BookOpenIcon, 
  SparklesIcon,
  CalendarIcon,
  ChartBarIcon,
  BellAlertIcon
} from '@heroicons/react/24/outline';
import axios from 'axios';
import { format, subDays } from 'date-fns';
import QuickMoodCheck from '../../components/mood/QuickMoodCheck';
import DailyQuote from '../../components/common/DailyQuote';
import StreakCard from '../../components/dashboard/StreakCard';
import RecentEntries from '../../components/dashboard/RecentEntries';
import RecommendationCard from '../../components/dashboard/RecommendationCard';

ChartJS.register(
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  Title,
  Tooltip,
  Legend,
  ArcElement
);

const Dashboard = () => {
  const { user } = useAuth();
  const { unreadCount } = useNotifications();
  const [moodData, setMoodData] = useState([]);
  const [stats, setStats] = useState({
    journalStreak: 0,
    totalMoods: 0,
    averageMood: 0,
    mindfulnessMinutes: 0
  });
  const [loading, setLoading] = useState(true);
  const [showMoodCheck, setShowMoodCheck] = useState(false);

  useEffect(() => {
    fetchDashboardData();
    // Check if mood check needed today
    checkDailyMood();
  }, []);

  const fetchDashboardData = async () => {
    try {
      const [moodRes, statsRes] = await Promise.all([
        axios.get('/api/mood/recent'),
        axios.get('/api/users/stats')
      ]);
      
      setMoodData(moodRes.data.moods);
      setStats(statsRes.data.stats);
    } catch (error) {
      console.error('Error fetching dashboard data:', error);
    } finally {
      setLoading(false);
    }
  };

  const checkDailyMood = async () => {
    try {
      const response = await axios.get('/api/mood/today');
      if (!response.data.hasMood) {
        setShowMoodCheck(true);
      }
    } catch (error) {
      console.error('Error checking daily mood:', error);
    }
  };

  // Chart data
  const moodChartData = {
    labels: moodData.slice(-7).map(m => format(new Date(m.timestamp), 'EEE')),
    datasets: [
      {
        label: 'Mood Level',
        data: moodData.slice(-7).map(m => m.rating),
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
      legend: {
        display: false
      },
      tooltip: {
        callbacks: {
          label: (context) => `Mood: ${context.raw}/10`
        }
      }
    },
    scales: {
      y: {
        min: 0,
        max: 10,
        grid: {
          color: 'rgba(255, 255, 255, 0.1)'
        }
      },
      x: {
        grid: {
          display: false
        }
      }
    }
  };

  // Emotion distribution for doughnut chart
  const emotionData = {
    labels: ['Positive', 'Neutral', 'Negative'],
    datasets: [
      {
        data: [
          moodData.filter(m => m.rating >= 7).length,
          moodData.filter(m => m.rating >= 4 && m.rating < 7).length,
          moodData.filter(m => m.rating < 4).length
        ],
        backgroundColor: ['#10B981', '#F59E0B', '#EF4444'],
        borderWidth: 0
      }
    ]
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-purple-50 to-blue-50 dark:from-gray-900 dark:to-gray-800">
      {/* Quick mood check modal */}
      {showMoodCheck && (
        <QuickMoodCheck 
          onClose={() => setShowMoodCheck(false)}
          onComplete={() => {
            setShowMoodCheck(false);
            fetchDashboardData();
          }}
        />
      )}

      {/* Header */}
      <div className="bg-white dark:bg-gray-800 shadow-sm">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
          <div className="flex justify-between items-center">
            <div>
              <h1 className="text-3xl font-bold text-gray-900 dark:text-white">
                Welcome back, {user?.name}! 👋
              </h1>
              <p className="text-gray-600 dark:text-gray-400 mt-1">
                {format(new Date(), 'EEEE, MMMM do, yyyy')}
              </p>
            </div>
            <div className="flex items-center space-x-4">
              {unreadCount > 0 && (
                <motion.div
                  initial={{ scale: 0 }}
                  animate={{ scale: 1 }}
                  className="relative"
                >
                  <BellAlertIcon className="h-6 w-6 text-purple-600" />
                  <span className="absolute -top-2 -right-2 bg-red-500 text-white text-xs rounded-full h-5 w-5 flex items-center justify-center">
                    {unreadCount}
                  </span>
                </motion.div>
              )}
              <button
                onClick={() => setShowMoodCheck(true)}
                className="bg-purple-600 text-white px-4 py-2 rounded-lg hover:bg-purple-700 transition"
              >
                How are you feeling?
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Main content */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {loading ? (
          <div className="flex justify-center items-center h-64">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-purple-600"></div>
          </div>
        ) : (
          <div className="space-y-6">
            {/* Stats Grid */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                className="bg-white dark:bg-gray-800 rounded-xl shadow-sm p-6"
              >
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm text-gray-600 dark:text-gray-400">Journal Streak</p>
                    <p className="text-2xl font-bold text-gray-900 dark:text-white">{stats.journalStreak} days</p>
                  </div>
                  <div className="bg-orange-100 dark:bg-orange-900 p-3 rounded-full">
                    <BookOpenIcon className="h-6 w-6 text-orange-600 dark:text-orange-300" />
                  </div>
                </div>
              </motion.div>

              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.1 }}
                className="bg-white dark:bg-gray-800 rounded-xl shadow-sm p-6"
              >
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm text-gray-600 dark:text-gray-400">Average Mood</p>
                    <p className="text-2xl font-bold text-gray-900 dark:text-white">{stats.averageMood}/10</p>
                  </div>
                  <div className="bg-green-100 dark:bg-green-900 p-3 rounded-full">
                    <HeartIcon className="h-6 w-6 text-green-600 dark:text-green-300" />
                  </div>
                </div>
              </motion.div>

              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.2 }}
                className="bg-white dark:bg-gray-800 rounded-xl shadow-sm p-6"
              >
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm text-gray-600 dark:text-gray-400">Mindfulness Minutes</p>
                    <p className="text-2xl font-bold text-gray-900 dark:text-white">{stats.mindfulnessMinutes} min</p>
                  </div>
                  <div className="bg-purple-100 dark:bg-purple-900 p-3 rounded-full">
                    <SparklesIcon className="h-6 w-6 text-purple-600 dark:text-purple-300" />
                  </div>
                </div>
              </motion.div>

              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.3 }}
                className="bg-white dark:bg-gray-800 rounded-xl shadow-sm p-6"
              >
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm text-gray-600 dark:text-gray-400">Total Check-ins</p>
                    <p className="text-2xl font-bold text-gray-900 dark:text-white">{stats.totalMoods}</p>
                  </div>
                  <div className="bg-blue-100 dark:bg-blue-900 p-3 rounded-full">
                    <CalendarIcon className="h-6 w-6 text-blue-600 dark:text-blue-300" />
                  </div>
                </div>
              </motion.div>
            </div>

            {/* Charts Row */}
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
              <motion.div
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                className="lg:col-span-2 bg-white dark:bg-gray-800 rounded-xl shadow-sm p-6"
              >
                <h2 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">Mood Trend</h2>
                {moodData.length > 0 ? (
                  <Line data={moodChartData} options={chartOptions} />
                ) : (
                  <div className="h-64 flex items-center justify-center text-gray-500">
                    No mood data yet. Start tracking your mood!
                  </div>
                )}
              </motion.div>

              <motion.div
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                className="bg-white dark:bg-gray-800 rounded-xl shadow-sm p-6"
              >
                <h2 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">Emotion Balance</h2>
                {moodData.length > 0 ? (
                  <div className="h-64">
                    <Doughnut data={emotionData} options={{ cutout: '70%' }} />
                  </div>
                ) : (
                  <div className="h-64 flex items-center justify-center text-gray-500">
                    No data yet
                  </div>
                )}
              </motion.div>
            </div>

            {/* Bottom Row */}
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.4 }}
                className="lg:col-span-1"
              >
                <StreakCard streak={stats.journalStreak} />
              </motion.div>

              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.5 }}
                className="lg:col-span-2"
              >
                <RecentEntries />
              </motion.div>
            </div>

            {/* Daily Quote & Recommendations */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              <DailyQuote />
              <RecommendationCard mood={stats.averageMood} />
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default Dashboard;