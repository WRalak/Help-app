import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { XMarkIcon } from '@heroicons/react/24/outline';
import axios from 'axios';
import toast from 'react-hot-toast';

const emotions = [
  { id: 'happy', emoji: '😊', label: 'Happy', color: 'bg-yellow-100', textColor: 'text-yellow-700' },
  { id: 'calm', emoji: '😌', label: 'Calm', color: 'bg-blue-100', textColor: 'text-blue-700' },
  { id: 'peaceful', emoji: '🕊️', label: 'Peaceful', color: 'bg-green-100', textColor: 'text-green-700' },
  { id: 'excited', emoji: '🤗', label: 'Excited', color: 'bg-purple-100', textColor: 'text-purple-700' },
  { id: 'anxious', emoji: '😰', label: 'Anxious', color: 'bg-orange-100', textColor: 'text-orange-700' },
  { id: 'stressed', emoji: '😩', label: 'Stressed', color: 'bg-red-100', textColor: 'text-red-700' },
  { id: 'sad', emoji: '😢', label: 'Sad', color: 'bg-indigo-100', textColor: 'text-indigo-700' },
  { id: 'angry', emoji: '😠', label: 'Angry', color: 'bg-rose-100', textColor: 'text-rose-700' },
  { id: 'lonely', emoji: '🥺', label: 'Lonely', color: 'bg-teal-100', textColor: 'text-teal-700' },
  { id: 'grateful', emoji: '🙏', label: 'Grateful', color: 'bg-emerald-100', textColor: 'text-emerald-700' },
  { id: 'hopeful', emoji: '🌟', label: 'Hopeful', color: 'bg-amber-100', textColor: 'text-amber-700' },
  { id: 'tired', emoji: '😴', label: 'Tired', color: 'bg-slate-100', textColor: 'text-slate-700' },
];

const factors = [
  { id: 'sleep', icon: '😴', label: 'Sleep' },
  { id: 'exercise', icon: '🏃', label: 'Exercise' },
  { id: 'social', icon: '👥', label: 'Social' },
  { id: 'work', icon: '💼', label: 'Work' },
  { id: 'medication', icon: '💊', label: 'Medication' },
  { id: 'therapy', icon: '🗣️', label: 'Therapy' },
  { id: 'diet', icon: '🍎', label: 'Diet' },
  { id: 'weather', icon: '☀️', label: 'Weather' },
];

const QuickMoodCheck = ({ onClose, onComplete }) => {
  const [step, setStep] = useState(1);
  const [moodData, setMoodData] = useState({
    rating: 5,
    emotion: '',
    secondaryEmotions: [],
    factors: [],
    notes: '',
    intensity: 5
  });
  const [submitting, setSubmitting] = useState(false);

  const handleRatingSelect = (rating) => {
    setMoodData({ ...moodData, rating });
    setStep(2);
  };

  const handleEmotionSelect = (emotion) => {
    setMoodData({ ...moodData, emotion });
    setStep(3);
  };

  const handleFactorToggle = (factorId) => {
    const newFactors = moodData.factors.includes(factorId)
      ? moodData.factors.filter(f => f !== factorId)
      : [...moodData.factors, factorId];
    setMoodData({ ...moodData, factors: newFactors });
  };

  const handleSubmit = async () => {
    setSubmitting(true);
    try {
      await axios.post('/api/mood', moodData);
      toast.success('Mood logged successfully!');
      onComplete();
    } catch (error) {
      toast.error('Failed to log mood. Please try again.');
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <AnimatePresence>
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4"
        onClick={onClose}
      >
        <motion.div
          initial={{ scale: 0.9, y: 20 }}
          animate={{ scale: 1, y: 0 }}
          exit={{ scale: 0.9, y: 20 }}
          className="bg-white dark:bg-gray-800 rounded-2xl max-w-lg w-full p-6"
          onClick={e => e.stopPropagation()}
        >
          <div className="flex justify-between items-center mb-6">
            <h2 className="text-2xl font-bold text-gray-900 dark:text-white">
              How are you feeling?
            </h2>
            <button
              onClick={onClose}
              className="text-gray-500 hover:text-gray-700 dark:text-gray-400"
            >
              <XMarkIcon className="h-6 w-6" />
            </button>
          </div>

          {/* Progress bar */}
          <div className="mb-6">
            <div className="h-2 bg-gray-200 rounded-full">
              <motion.div
                className="h-2 bg-purple-600 rounded-full"
                initial={{ width: `${(step / 4) * 100}%` }}
                animate={{ width: `${(step / 4) * 100}%` }}
              />
            </div>
            <div className="flex justify-between mt-2 text-sm text-gray-600 dark:text-gray-400">
              <span>Rate</span>
              <span>Emotion</span>
              <span>Factors</span>
              <span>Notes</span>
            </div>
          </div>

          {/* Step 1: Rate your mood */}
          {step === 1 && (
            <motion.div
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -20 }}
            >
              <p className="text-center text-gray-600 dark:text-gray-400 mb-6">
                On a scale of 1-10, how would you rate your overall mood?
              </p>
              <div className="grid grid-cols-5 gap-2 mb-6">
                {[1, 2, 3, 4, 5, 6, 7, 8, 9, 10].map((num) => (
                  <motion.button
                    key={num}
                    whileHover={{ scale: 1.1 }}
                    whileTap={{ scale: 0.9 }}
                    onClick={() => handleRatingSelect(num)}
                    className={`aspect-square rounded-lg flex items-center justify-center text-lg font-semibold
                      ${moodData.rating === num 
                        ? 'bg-purple-600 text-white' 
                        : 'bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-300 hover:bg-purple-100'
                      }`}
                  >
                    {num}
                  </motion.button>
                ))}
              </div>
              <div className="flex justify-between text-sm text-gray-500">
                <span>Very Low</span>
                <span>Very High</span>
              </div>
            </motion.div>
          )}

          {/* Step 2: Select primary emotion */}
          {step === 2 && (
            <motion.div
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -20 }}
            >
              <p className="text-center text-gray-600 dark:text-gray-400 mb-6">
                What emotion best describes how you're feeling?
              </p>
              <div className="grid grid-cols-3 gap-3 mb-6">
                {emotions.map((emotion) => (
                  <motion.button
                    key={emotion.id}
                    whileHover={{ scale: 1.05 }}
                    whileTap={{ scale: 0.95 }}
                    onClick={() => handleEmotionSelect(emotion.id)}
                    className={`p-3 rounded-xl ${emotion.color} ${emotion.textColor} flex flex-col items-center space-y-1
                      ${moodData.emotion === emotion.id ? 'ring-2 ring-purple-600 ring-offset-2' : ''}`}
                  >
                    <span className="text-2xl">{emotion.emoji}</span>
                    <span className="text-sm font-medium">{emotion.label}</span>
                  </motion.button>
                ))}
              </div>
            </motion.div>
          )}

          {/* Step 3: Select factors */}
          {step === 3 && (
            <motion.div
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -20 }}
            >
              <p className="text-center text-gray-600 dark:text-gray-400 mb-6">
                What factors are affecting your mood? (Select all that apply)
              </p>
              <div className="grid grid-cols-2 gap-3 mb-6">
                {factors.map((factor) => (
                  <motion.button
                    key={factor.id}
                    whileHover={{ scale: 1.02 }}
                    whileTap={{ scale: 0.98 }}
                    onClick={() => handleFactorToggle(factor.id)}
                    className={`p-3 rounded-lg border-2 flex items-center space-x-2
                      ${moodData.factors.includes(factor.id)
                        ? 'border-purple-600 bg-purple-50 dark:bg-purple-900/20'
                        : 'border-gray-200 dark:border-gray-700'
                      }`}
                  >
                    <span className="text-xl">{factor.icon}</span>
                    <span className="text-sm font-medium text-gray-700 dark:text-gray-300">
                      {factor.label}
                    </span>
                  </motion.button>
                ))}
              </div>
            </motion.div>
          )}

          {/* Step 4: Add notes */}
          {step === 4 && (
            <motion.div
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -20 }}
            >
              <p className="text-center text-gray-600 dark:text-gray-400 mb-6">
                Add any notes about how you're feeling (optional)
              </p>
              <textarea
                value={moodData.notes}
                onChange={(e) => setMoodData({ ...moodData, notes: e.target.value })}
                placeholder="Write your thoughts..."
                className="w-full h-32 p-3 border border-gray-300 dark:border-gray-600 rounded-lg 
                         bg-white dark:bg-gray-700 text-gray-900 dark:text-white
                         focus:ring-2 focus:ring-purple-600 focus:border-transparent"
              />
              <div className="mt-4">
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                  Intensity of emotions
                </label>
                <input
                  type="range"
                  min="1"
                  max="10"
                  value={moodData.intensity}
                  onChange={(e) => setMoodData({ ...moodData, intensity: parseInt(e.target.value) })}
                  className="w-full"
                />
                <div className="flex justify-between text-sm text-gray-500">
                  <span>Mild</span>
                  <span>Intense</span>
                </div>
              </div>
            </motion.div>
          )}

          {/* Navigation buttons */}
          <div className="flex justify-between mt-6">
            {step > 1 && (
              <button
                onClick={() => setStep(step - 1)}
                className="px-4 py-2 text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-white"
              >
                Back
              </button>
            )}
            {step < 4 ? (
              <button
                onClick={() => setStep(step + 1)}
                disabled={step === 2 && !moodData.emotion}
                className={`ml-auto px-6 py-2 bg-purple-600 text-white rounded-lg
                  ${(step === 2 && !moodData.emotion) ? 'opacity-50 cursor-not-allowed' : 'hover:bg-purple-700'}`}
              >
                Next
              </button>
            ) : (
              <button
                onClick={handleSubmit}
                disabled={submitting}
                className="ml-auto px-6 py-2 bg-purple-600 text-white rounded-lg hover:bg-purple-700 disabled:opacity-50"
              >
                {submitting ? 'Saving...' : 'Save Entry'}
              </button>
            )}
          </div>
        </motion.div>
      </motion.div>
    </AnimatePresence>
  );
};

export default QuickMoodCheck;