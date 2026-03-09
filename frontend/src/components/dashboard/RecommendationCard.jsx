import React from 'react';
import { LightBulbIcon } from '@heroicons/react/24/outline';

const RecommendationCard = ({ mood }) => {
  const getRecommendations = (moodScore) => {
    if (moodScore < 4) {
      return [
        'Take a few deep breaths',
        'Reach out to a friend',
        'Try a guided meditation',
        'Write down your feelings'
      ];
    } else if (moodScore < 7) {
      return [
        'Go for a short walk',
        'Practice gratitude',
        'Listen to calming music',
        'Do something you enjoy'
      ];
    } else {
      return [
        'Share your positivity with others',
        'Try something new today',
        'Set a new goal',
        'Help someone in need'
      ];
    }
  };

  const recommendations = getRecommendations(mood);

  return (
    <div className="bg-gradient-to-br from-purple-400 to-indigo-400 rounded-xl shadow-sm p-6 text-white">
      <div className="flex items-center space-x-2 mb-4">
        <LightBulbIcon className="h-6 w-6" />
        <h3 className="text-lg font-semibold">Personalized Recommendations</h3>
      </div>
      <ul className="space-y-2">
        {recommendations.map((rec, index) => (
          <li key={index} className="flex items-center space-x-2">
            <span className="text-white/80">•</span>
            <span className="text-sm">{rec}</span>
          </li>
        ))}
      </ul>
    </div>
  );
};

export default RecommendationCard;