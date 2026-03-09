import React, { useState, useEffect } from 'react';
import axios from 'axios';

const Crisis = () => {
  const [resources, setResources] = useState([]);

  useEffect(() => {
    fetchResources();
  }, []);

  const fetchResources = async () => {
    try {
      const response = await axios.get('/api/crisis/resources');
      setResources(response.data.resources);
    } catch (error) {
      console.error('Error fetching crisis resources:', error);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-red-50 to-orange-50">
      <div className="max-w-4xl mx-auto px-4 py-12">
        <div className="text-center mb-12">
          <h1 className="text-4xl font-bold text-red-700 mb-4">You Are Not Alone</h1>
          <p className="text-xl text-gray-700">
            Help is available 24/7. Reach out to any of these resources.
          </p>
        </div>

        <div className="grid gap-6 md:grid-cols-2">
          {resources.map((resource, index) => (
            <div key={index} className="bg-white rounded-xl shadow-lg p-6">
              <h3 className="text-xl font-semibold text-gray-900 mb-2">
                {resource.name}
              </h3>
              <p className="text-3xl font-bold text-red-600 mb-2">
                {resource.number}
              </p>
              <p className="text-gray-600">{resource.description}</p>
              <button className="mt-4 w-full bg-red-600 text-white py-2 rounded-lg hover:bg-red-700 transition">
                Call Now
              </button>
            </div>
          ))}
        </div>

        <div className="mt-12 bg-white rounded-xl shadow-lg p-8">
          <h2 className="text-2xl font-bold text-gray-900 mb-4">
            Immediate Safety Plan
          </h2>
          <ol className="list-decimal list-inside space-y-3 text-gray-700">
            <li>Call a crisis hotline immediately</li>
            <li>Reach out to a trusted friend or family member</li>
            <li>Remove any means of harm from your immediate environment</li>
            <li>Go to a safe, public place</li>
            <li>If in immediate danger, call 911 or go to the nearest emergency room</li>
          </ol>
        </div>
      </div>
    </div>
  );
};

export default Crisis;