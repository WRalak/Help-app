import React, { useState } from 'react';
import { PlayIcon, PauseIcon } from '@heroicons/react/24/solid';

const Meditation = () => {
  const [isPlaying, setIsPlaying] = useState(false);
  const [selectedExercise, setSelectedExercise] = useState(null);

  const exercises = [
    {
      id: 1,
      title: 'Deep Breathing',
      duration: '5 min',
      description: 'Calm your mind with deep breathing',
      icon: '🌬️'
    },
    {
      id: 2,
      title: 'Body Scan',
      duration: '10 min',
      description: 'Release tension throughout your body',
      icon: '🧘'
    },
    {
      id: 3,
      title: 'Loving-Kindness',
      duration: '7 min',
      description: 'Cultivate compassion for yourself and others',
      icon: '💖'
    },
    {
      id: 4,
      title: 'Mindful Walking',
      duration: '8 min',
      description: 'Connect with your body and surroundings',
      icon: '🚶'
    }
  ];

  return (
    <div className="min-h-screen bg-gradient-to-br from-indigo-50 to-purple-50">
      <div className="max-w-7xl mx-auto px-4 py-8">
        <h1 className="text-3xl font-bold text-gray-900 mb-8">Meditation</h1>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-12">
          {exercises.map((exercise) => (
            <button
              key={exercise.id}
              onClick={() => setSelectedExercise(exercise)}
              className="bg-white rounded-xl shadow-sm p-6 text-left hover:shadow-md transition"
            >
              <div className="text-4xl mb-4">{exercise.icon}</div>
              <h3 className="text-xl font-semibold text-gray-900 mb-2">
                {exercise.title}
              </h3>
              <p className="text-gray-600 text-sm mb-2">{exercise.description}</p>
              <p className="text-purple-600 text-sm">{exercise.duration}</p>
            </button>
          ))}
        </div>

        {selectedExercise && (
          <div className="bg-white rounded-xl shadow-lg p-8">
            <h2 className="text-2xl font-bold text-gray-900 mb-4">
              {selectedExercise.title}
            </h2>
            <div className="flex justify-center items-center space-x-4">
              <button
                onClick={() => setIsPlaying(!isPlaying)}
                className="w-16 h-16 bg-purple-600 rounded-full flex items-center justify-center text-white hover:bg-purple-700"
              >
                {isPlaying ? (
                  <PauseIcon className="h-8 w-8" />
                ) : (
                  <PlayIcon className="h-8 w-8" />
                )}
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default Meditation;