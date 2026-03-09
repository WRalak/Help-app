import React from 'react';
import { FireIcon } from '@heroicons/react/24/solid';

const StreakCard = ({ streak }) => {
  return (
    <div className="bg-gradient-to-br from-orange-400 to-red-400 rounded-xl shadow-sm p-6 text-white">
      <div className="flex items-center justify-between mb-4">
        <h3 className="text-lg font-semibold">Current Streak</h3>
        <FireIcon className="h-8 w-8" />
      </div>
      <div className="text-center">
        <div className="text-5xl font-bold mb-2">{streak}</div>
        <p className="text-orange-100">days in a row</p>
      </div>
      <div className="mt-4 grid grid-cols-7 gap-1">
        {[...Array(7)].map((_, i) => (
          <div
            key={i}
            className={`h-2 rounded-full ${
              i < streak ? 'bg-white' : 'bg-white/30'
            }`}
          />
        ))}
      </div>
    </div>
  );
};

export default StreakCard;