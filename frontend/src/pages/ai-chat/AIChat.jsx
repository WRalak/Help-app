import React, { useState, useRef, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import axios from 'axios';
import toast from 'react-hot-toast';
import {
  PaperAirplaneIcon,
  SparklesIcon,
  ShieldCheckIcon,
  ExclamationTriangleIcon
} from '@heroicons/react/24/solid';
import ReactMarkdown from 'react-markdown';

const AIChat = () => {
  const [messages, setMessages] = useState([
    {
      id: 1,
      type: 'assistant',
      content: "Hello! I'm your AI wellness assistant. I'm here to listen, support, and help you navigate your feelings. How are you feeling today? Remember, I'm not a replacement for professional help, but I'm here to support you.",
      timestamp: new Date()
    }
  ]);
  const [input, setInput] = useState('');
  const [isTyping, setIsTyping] = useState(false);
  const [showDisclaimer, setShowDisclaimer] = useState(true);
  const messagesEndRef = useRef(null);
  const inputRef = useRef(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  const handleSendMessage = async () => {
    if (!input.trim()) return;

    const userMessage = {
      id: Date.now(),
      type: 'user',
      content: input,
      timestamp: new Date()
    };

    setMessages(prev => [...prev, userMessage]);
    setInput('');
    setIsTyping(true);

    try {
      const response = await axios.post('/api/ai/chat', {
        message: input,
        context: messages.slice(-5) // Send last 5 messages for context
      });

      // Check for crisis detection
      if (response.data.crisisDetected) {
        toast.error(
          'It sounds like you might be going through a difficult time. Help is available.',
          { duration: 8000 }
        );
      }

      const assistantMessage = {
        id: Date.now() + 1,
        type: 'assistant',
        content: response.data.message,
        timestamp: new Date(),
        resources: response.data.resources
      };

      setMessages(prev => [...prev, assistantMessage]);
    } catch (error) {
      toast.error('Failed to get response. Please try again.');
      console.error('AI Chat error:', error);
    } finally {
      setIsTyping(false);
    }
  };

  const handleKeyPress = (e) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSendMessage();
    }
  };

  const quickPrompts = [
    "I'm feeling anxious",
    "I need help sleeping",
    "I feel overwhelmed",
    "I want to practice gratitude",
    "Help me calm down",
    "I feel lonely"
  ];

  return (
    <div className="h-[calc(100vh-4rem)] bg-gradient-to-br from-indigo-50 to-purple-50 dark:from-gray-900 dark:to-gray-800">
      {/* Disclaimer Banner */}
      <AnimatePresence>
        {showDisclaimer && (
          <motion.div
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
            className="bg-yellow-50 dark:bg-yellow-900/30 border-b border-yellow-200 dark:border-yellow-800"
          >
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-3">
              <div className="flex items-center justify-between">
                <div className="flex items-center space-x-3">
                  <ShieldCheckIcon className="h-5 w-5 text-yellow-600 dark:text-yellow-400" />
                  <p className="text-sm text-yellow-700 dark:text-yellow-300">
                    I'm an AI assistant and not a substitute for professional mental health care. 
                    If you're in crisis, please reach out to a crisis hotline.
                  </p>
                </div>
                <button
                  onClick={() => setShowDisclaimer(false)}
                  className="text-yellow-600 dark:text-yellow-400 hover:text-yellow-700"
                >
                  ×
                </button>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-full py-6">
        <div className="flex h-full bg-white dark:bg-gray-800 rounded-2xl shadow-xl overflow-hidden">
          {/* Sidebar - Quick Actions */}
          <div className="w-64 border-r border-gray-200 dark:border-gray-700 p-4 hidden md:block">
            <h3 className="font-semibold text-gray-900 dark:text-white mb-4">Quick Prompts</h3>
            <div className="space-y-2">
              {quickPrompts.map((prompt, index) => (
                <button
                  key={index}
                  onClick={() => setInput(prompt)}
                  className="w-full p-3 text-left text-sm bg-gray-50 dark:bg-gray-700 
                           rounded-lg hover:bg-purple-50 dark:hover:bg-purple-900/30 
                           text-gray-700 dark:text-gray-300 transition"
                >
                  {prompt}
                </button>
              ))}
            </div>

            <div className="mt-6 p-4 bg-purple-50 dark:bg-purple-900/20 rounded-lg">
              <h4 className="font-medium text-purple-700 dark:text-purple-300 mb-2 flex items-center">
                <SparklesIcon className="h-4 w-4 mr-2" />
                How I can help
              </h4>
              <ul className="text-sm text-purple-600 dark:text-purple-400 space-y-1">
                <li>• Emotional support</li>
                <li>• Coping strategies</li>
                <li>• Mindfulness exercises</li>
                <li>• Gratitude practice</li>
                <li>• Sleep guidance</li>
              </ul>
            </div>
          </div>

          {/* Main Chat Area */}
          <div className="flex-1 flex flex-col">
            {/* Messages */}
            <div className="flex-1 overflow-y-auto p-4 space-y-4">
              {messages.map((message) => (
                <motion.div
                  key={message.id}
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  className={`flex ${message.type === 'user' ? 'justify-end' : 'justify-start'}`}
                >
                  <div
                    className={`max-w-[70%] rounded-2xl p-4 ${
                      message.type === 'user'
                        ? 'bg-purple-600 text-white'
                        : 'bg-gray-100 dark:bg-gray-700 text-gray-900 dark:text-white'
                    }`}
                  >
                    <ReactMarkdown className="prose prose-sm dark:prose-invert">
                      {message.content}
                    </ReactMarkdown>
                    
                    {message.resources && (
                      <div className="mt-3 p-3 bg-red-50 dark:bg-red-900/30 rounded-lg">
                        <p className="text-sm font-medium text-red-700 dark:text-red-300 mb-2">
                          Crisis Resources:
                        </p>
                        {message.resources.map((resource, idx) => (
                          <p key={idx} className="text-xs text-red-600 dark:text-red-400">
                            {resource.name}: {resource.number}
                          </p>
                        ))}
                      </div>
                    )}
                    
                    <p className="text-xs mt-2 opacity-70">
                      {message.timestamp.toLocaleTimeString()}
                    </p>
                  </div>
                </motion.div>
              ))}

              {isTyping && (
                <motion.div
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  className="flex justify-start"
                >
                  <div className="bg-gray-100 dark:bg-gray-700 rounded-2xl p-4">
                    <div className="flex space-x-2">
                      <div className="w-2 h-2 bg-gray-500 rounded-full animate-bounce" />
                      <div className="w-2 h-2 bg-gray-500 rounded-full animate-bounce" style={{ animationDelay: '0.2s' }} />
                      <div className="w-2 h-2 bg-gray-500 rounded-full animate-bounce" style={{ animationDelay: '0.4s' }} />
                    </div>
                  </div>
                </motion.div>
              )}
              
              <div ref={messagesEndRef} />
            </div>

            {/* Input Area */}
            <div className="border-t border-gray-200 dark:border-gray-700 p-4">
              <div className="flex items-end space-x-2">
                <div className="flex-1">
                  <textarea
                    ref={inputRef}
                    value={input}
                    onChange={(e) => setInput(e.target.value)}
                    onKeyPress={handleKeyPress}
                    placeholder="Type your message..."
                    rows="1"
                    className="w-full px-4 py-3 border border-gray-300 dark:border-gray-600 
                             rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white
                             focus:ring-2 focus:ring-purple-600 focus:border-transparent
                             resize-none"
                    style={{ minHeight: '50px', maxHeight: '150px' }}
                  />
                </div>
                <button
                  onClick={handleSendMessage}
                  disabled={!input.trim() || isTyping}
                  className="p-3 bg-purple-600 text-white rounded-lg hover:bg-purple-700 
                           disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  <PaperAirplaneIcon className="h-5 w-5" />
                </button>
              </div>

              {/* Crisis Warning */}
              <div className="mt-3 flex items-center justify-center space-x-2 text-xs text-gray-500 dark:text-gray-400">
                <ExclamationTriangleIcon className="h-4 w-4 text-yellow-500" />
                <span>If you're in crisis, please call 988 or text HOME to 741741</span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default AIChat;