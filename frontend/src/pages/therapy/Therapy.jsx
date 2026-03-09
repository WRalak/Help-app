import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import axios from 'axios';
import { format, addDays } from 'date-fns';
import { Calendar, dateFnsLocalizer } from 'react-big-calendar';
import 'react-big-calendar/lib/css/react-big-calendar.css';
import toast from 'react-hot-toast';
import {
  VideoCameraIcon,
  ChatBubbleLeftRightIcon,
  CalendarIcon,
  UserCircleIcon
} from '@heroicons/react/24/outline';

const localizer = dateFnsLocalizer({
  format,
  parse: (str) => new Date(str),
  startOfWeek: () => 0,
  getDay: (date) => date.getDay(),
  locales: {}
});

const Therapy = () => {
  const [therapists, setTherapists] = useState([]);
  const [selectedTherapist, setSelectedTherapist] = useState(null);
  const [appointments, setAppointments] = useState([]);
  const [selectedDate, setSelectedDate] = useState(new Date());
  const [availableSlots, setAvailableSlots] = useState([]);
  const [showBooking, setShowBooking] = useState(false);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchTherapists();
    fetchAppointments();
  }, []);

  const fetchTherapists = async () => {
    try {
      const response = await axios.get('/api/therapy/therapists');
      setTherapists(response.data.therapists);
    } catch (error) {
      toast.error('Failed to load therapists');
    } finally {
      setLoading(false);
    }
  };

  const fetchAppointments = async () => {
    try {
      const response = await axios.get('/api/therapy/appointments');
      setAppointments(response.data.appointments);
    } catch (error) {
      console.error('Error fetching appointments:', error);
    }
  };

  const fetchAvailableSlots = async (therapistId, date) => {
    try {
      const response = await axios.get(`/api/therapy/available-slots`, {
        params: { therapistId, date: date.toISOString() }
      });
      setAvailableSlots(response.data.slots);
    } catch (error) {
      toast.error('Failed to load available slots');
    }
  };

  const handleSelectTherapist = (therapist) => {
    setSelectedTherapist(therapist);
    setShowBooking(true);
    fetchAvailableSlots(therapist._id, selectedDate);
  };

  const handleBookAppointment = async (slot) => {
    try {
      await axios.post('/api/therapy/book', {
        therapistId: selectedTherapist._id,
        startTime: slot.start,
        endTime: slot.end,
        type: 'video'
      });
      
      toast.success('Appointment booked successfully!');
      setShowBooking(false);
      fetchAppointments();
    } catch (error) {
      toast.error('Failed to book appointment');
    }
  };

  const eventStyleGetter = (event) => {
    const style = {
      backgroundColor: event.status === 'confirmed' ? '#10B981' : '#F59E0B',
      borderRadius: '8px',
      opacity: 0.8,
      color: 'white',
      border: 'none',
      display: 'block'
    };
    return { style };
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-50 dark:from-gray-900 dark:to-gray-800">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900 dark:text-white">Therapy & Counseling</h1>
          <p className="text-gray-600 dark:text-gray-400 mt-1">
            Connect with licensed therapists for professional support
          </p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Therapists List */}
          <div className="lg:col-span-1">
            <h2 className="text-xl font-semibold text-gray-900 dark:text-white mb-4">
              Available Therapists
            </h2>
            
            {loading ? (
              <div className="flex justify-center items-center h-64">
                <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
              </div>
            ) : (
              <div className="space-y-4">
                {therapists.map((therapist) => (
                  <motion.div
                    key={therapist._id}
                    whileHover={{ scale: 1.02 }}
                    className={`bg-white dark:bg-gray-800 rounded-xl shadow-sm p-4 cursor-pointer
                              ${selectedTherapist?._id === therapist._id ? 'ring-2 ring-blue-600' : ''}`}
                    onClick={() => handleSelectTherapist(therapist)}
                  >
                    <div className="flex items-center space-x-4">
                      <div className="flex-shrink-0">
                        {therapist.avatar ? (
                          <img
                            src={therapist.avatar}
                            alt={therapist.name}
                            className="h-12 w-12 rounded-full"
                          />
                        ) : (
                          <UserCircleIcon className="h-12 w-12 text-gray-400" />
                        )}
                      </div>
                      <div>
                        <h3 className="font-semibold text-gray-900 dark:text-white">
                          {therapist.name}
                        </h3>
                        <p className="text-sm text-gray-600 dark:text-gray-400">
                          {therapist.specialization}
                        </p>
                        <div className="flex items-center mt-1 text-sm text-gray-500">
                          <span>⭐ {therapist.rating}</span>
                          <span className="mx-2">•</span>
                          <span>{therapist.experience} years exp</span>
                        </div>
                      </div>
                    </div>
                    
                    <div className="mt-3 flex flex-wrap gap-2">
                      {therapist.specialties.slice(0, 3).map((specialty, idx) => (
                        <span
                          key={idx}
                          className="px-2 py-1 bg-blue-100 dark:bg-blue-900/30 text-blue-700 dark:text-blue-300 text-xs rounded-full"
                        >
                          {specialty}
                        </span>
                      ))}
                    </div>
                  </motion.div>
                ))}
              </div>
            )}
          </div>

          {/* Calendar and Booking */}
          <div className="lg:col-span-2">
            {/* Upcoming Appointments */}
            <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm p-6 mb-6">
              <h2 className="text-xl font-semibold text-gray-900 dark:text-white mb-4">
                Your Appointments
              </h2>
              
              {appointments.length === 0 ? (
                <p className="text-gray-500 dark:text-gray-400 text-center py-4">
                  No upcoming appointments
                </p>
              ) : (
                <div className="space-y-3">
                  {appointments.map((apt) => (
                    <div
                      key={apt._id}
                      className="flex items-center justify-between p-3 bg-gray-50 dark:bg-gray-700 rounded-lg"
                    >
                      <div className="flex items-center space-x-3">
                        <CalendarIcon className="h-5 w-5 text-blue-500" />
                        <div>
                          <p className="font-medium text-gray-900 dark:text-white">
                            with {apt.therapist.name}
                          </p>
                          <p className="text-sm text-gray-600 dark:text-gray-400">
                            {format(new Date(apt.startTime), 'MMM d, yyyy h:mm a')}
                          </p>
                        </div>
                      </div>
                      <button className="px-3 py-1 bg-blue-600 text-white rounded-lg hover:bg-blue-700 text-sm">
                        Join Session
                      </button>
                    </div>
                  ))}
                </div>
              )}
            </div>

            {/* Booking Modal */}
            {showBooking && selectedTherapist && (
              <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
                <div className="bg-white dark:bg-gray-800 rounded-2xl max-w-2xl w-full p-6">
                  <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-4">
                    Book with {selectedTherapist.name}
                  </h2>

                  {/* Date Selection */}
                  <div className="mb-6">
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                      Select Date
                    </label>
                    <div className="flex space-x-2 overflow-x-auto pb-2">
                      {[0, 1, 2, 3, 4, 5, 6].map((offset) => {
                        const date = addDays(new Date(), offset);
                        return (
                          <button
                            key={offset}
                            onClick={() => {
                              setSelectedDate(date);
                              fetchAvailableSlots(selectedTherapist._id, date);
                            }}
                            className={`flex-shrink-0 p-3 rounded-lg text-center min-w-[80px]
                              ${format(date, 'yyyy-MM-dd') === format(selectedDate, 'yyyy-MM-dd')
                                ? 'bg-blue-600 text-white'
                                : 'bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-300'
                              }`}
                          >
                            <div className="text-xs">
                              {format(date, 'EEE')}
                            </div>
                            <div className="font-semibold">
                              {format(date, 'd')}
                            </div>
                          </button>
                        );
                      })}
                    </div>
                  </div>

                  {/* Available Slots */}
                  <div className="mb-6">
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                      Available Times
                    </label>
                    <div className="grid grid-cols-3 gap-2">
                      {availableSlots.map((slot, idx) => (
                        <button
                          key={idx}
                          onClick={() => handleBookAppointment(slot)}
                          className="p-2 border border-gray-200 dark:border-gray-700 rounded-lg 
                                   hover:bg-blue-50 dark:hover:bg-blue-900/30 text-center"
                        >
                          <div className="font-medium text-gray-900 dark:text-white">
                            {format(new Date(slot.start), 'h:mm a')}
                          </div>
                          <div className="text-xs text-gray-500">
                            {slot.duration} min
                          </div>
                        </button>
                      ))}
                    </div>
                  </div>

                  {/* Session Type */}
                  <div className="mb-6">
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                      Session Type
                    </label>
                    <div className="flex space-x-4">
                      <button className="flex-1 p-3 border-2 border-blue-600 bg-blue-50 rounded-lg">
                        <VideoCameraIcon className="h-6 w-6 mx-auto mb-1 text-blue-600" />
                        <span className="text-sm font-medium text-blue-600">Video</span>
                      </button>
                      <button className="flex-1 p-3 border border-gray-200 rounded-lg hover:border-blue-600">
                        <ChatBubbleLeftRightIcon className="h-6 w-6 mx-auto mb-1 text-gray-400" />
                        <span className="text-sm font-medium text-gray-500">Chat</span>
                      </button>
                    </div>
                  </div>

                  <div className="flex justify-end space-x-3">
                    <button
                      onClick={() => setShowBooking(false)}
                      className="px-4 py-2 text-gray-600 dark:text-gray-400 hover:text-gray-900"
                    >
                      Cancel
                    </button>
                    <button
                      onClick={() => toast.success('Booking feature coming soon!')}
                      className="px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
                    >
                      Confirm Booking
                    </button>
                  </div>
                </div>
              </div>
            )}

            {/* Full Calendar */}
            <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm p-6 h-[500px]">
              <Calendar
                localizer={localizer}
                events={appointments}
                startAccessor="startTime"
                endAccessor="endTime"
                style={{ height: '100%' }}
                eventPropGetter={eventStyleGetter}
                views={['month', 'week', 'day']}
                defaultView="week"
              />
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Therapy;