import React, { useState, useEffect } from 'react';
import axios from 'axios';

const quotes = [
  { text: "You are enough just as you are.", author: "Meghan Markle" },
  { text: "Your present circumstances don't determine where you can go; they merely determine where you start.", author: "Nido Qubein" },
  { text: "The only way out is through.", author: "Robert Frost" },
  { text: "You don't have to be positive all the time. It's perfectly okay to feel sad, angry, annoyed, frustrated, scared and anxious.", author: "Lori Deschene" },
  { text: "Healing is not linear.", author: "Unknown" },
  { text: "You are not your thoughts.", author: "Unknown" },
  { text: "This too shall pass.", author: "Persian Proverb" },
];

const DailyQuote = () => {
  const [quote, setQuote] = useState(null);

  useEffect(() => {
    // Get quote based on day of year
    const dayOfYear = Math.floor((Date.now() - new Date(new Date().getFullYear(), 0, 0)) / 86400000);
    const quoteIndex = dayOfYear % quotes.length;
    setQuote(quotes[quoteIndex]);
  }, []);

  if (!quote) return null;

  return (
    <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm p-6">
      <p className="text-lg text-gray-700 dark:text-gray-300 italic mb-2">
        "{quote.text}"
      </p>
      <p className="text-sm text-gray-500 dark:text-gray-400 text-right">
        — {quote.author}
      </p>
    </div>
  );
};

export default DailyQuote;