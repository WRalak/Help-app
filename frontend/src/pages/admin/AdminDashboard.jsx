import React, { useState, useEffect } from 'react';
import {
  UsersIcon,
  ChartBarIcon,
  ExclamationTriangleIcon,
  CurrencyDollarIcon,
  ShieldCheckIcon
} from '@heroicons/react/24/outline';
import axios from 'axios';

const AdminDashboard = () => {
  const [stats, setStats] = useState({
    totalUsers: 0,
    activeUsers: 0,
    crisisAlerts: 0,
    revenue: 0,
    therapists: 0,
    reportedPosts: 0
  });
  const [recentAlerts, setRecentAlerts] = useState([]);
  const [reportedContent, setReportedContent] = useState([]);

  useEffect(() => {
    fetchAdminData();
  }, []);

  const fetchAdminData = async () => {
    try {
      const [statsRes, alertsRes, reportsRes] = await Promise.all([
        axios.get('/api/admin/stats'),
        axios.get('/api/admin/crisis-alerts'),
        axios.get('/api/admin/reported-content')
      ]);
      
      setStats(statsRes.data);
      setRecentAlerts(alertsRes.data.alerts);
      setReportedContent(reportsRes.data.content);
    } catch (error) {
      console.error('Error fetching admin data:', error);
    }
  };

  const handleModeratePost = async (postId, action) => {
    try {
      await axios.post(`/api/admin/moderate/${postId}`, { action });
      fetchAdminData();
    } catch (error) {
      console.error('Error moderating post:', error);
    }
  };

  const handleCrisisAlert = async (alertId, action) => {
    try {
      await axios.post(`/api/admin/handle-crisis/${alertId}`, { action });
      fetchAdminData();
    } catch (error) {
      console.error('Error handling crisis:', error);
    }
  };

  return (
    <div className="min-h-screen bg-gray-100">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <h1 className="text-3xl font-bold text-gray-900 mb-8">Admin Dashboard</h1>

        {/* Stats Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mb-8">
          <div className="bg-white rounded-xl shadow-sm p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600">Total Users</p>
                <p className="text-2xl font-bold text-gray-900">{stats.totalUsers}</p>
              </div>
              <UsersIcon className="h-8 w-8 text-blue-500" />
            </div>
          </div>

          <div className="bg-white rounded-xl shadow-sm p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600">Active Users (24h)</p>
                <p className="text-2xl font-bold text-gray-900">{stats.activeUsers}</p>
              </div>
              <ChartBarIcon className="h-8 w-8 text-green-500" />
            </div>
          </div>

          <div className="bg-white rounded-xl shadow-sm p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600">Crisis Alerts</p>
                <p className="text-2xl font-bold text-red-600">{stats.crisisAlerts}</p>
              </div>
              <ExclamationTriangleIcon className="h-8 w-8 text-red-500" />
            </div>
          </div>

          <div className="bg-white rounded-xl shadow-sm p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600">Monthly Revenue</p>
                <p className="text-2xl font-bold text-gray-900">${stats.revenue}</p>
              </div>
              <CurrencyDollarIcon className="h-8 w-8 text-yellow-500" />
            </div>
          </div>

          <div className="bg-white rounded-xl shadow-sm p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600">Active Therapists</p>
                <p className="text-2xl font-bold text-gray-900">{stats.therapists}</p>
              </div>
              <ShieldCheckIcon className="h-8 w-8 text-purple-500" />
            </div>
          </div>

          <div className="bg-white rounded-xl shadow-sm p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600">Reported Posts</p>
                <p className="text-2xl font-bold text-orange-600">{stats.reportedPosts}</p>
              </div>
              <ExclamationTriangleIcon className="h-8 w-8 text-orange-500" />
            </div>
          </div>
        </div>

        {/* Crisis Alerts */}
        <div className="bg-white rounded-xl shadow-sm p-6 mb-8">
          <h2 className="text-xl font-semibold text-gray-900 mb-4">Active Crisis Alerts</h2>
          <div className="space-y-4">
            {recentAlerts.map((alert) => (
              <div key={alert._id} className="border-l-4 border-red-500 bg-red-50 p-4">
                <div className="flex justify-between">
                  <div>
                    <p className="font-medium text-gray-900">User ID: {alert.userId}</p>
                    <p className="text-sm text-gray-600 mt-1">{alert.content}</p>
                    <p className="text-xs text-gray-500 mt-2">
                      Severity: <span className="font-medium text-red-600">{alert.severity}</span>
                    </p>
                  </div>
                  <div className="space-x-2">
                    <button
                      onClick={() => handleCrisisAlert(alert._id, 'contact')}
                      className="px-3 py-1 bg-blue-600 text-white rounded hover:bg-blue-700"
                    >
                      Contact
                    </button>
                    <button
                      onClick={() => handleCrisisAlert(alert._id, 'resolve')}
                      className="px-3 py-1 bg-green-600 text-white rounded hover:bg-green-700"
                    >
                      Resolve
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Reported Content */}
        <div className="bg-white rounded-xl shadow-sm p-6">
          <h2 className="text-xl font-semibold text-gray-900 mb-4">Reported Content</h2>
          <div className="space-y-4">
            {reportedContent.map((report) => (
              <div key={report._id} className="border border-gray-200 rounded-lg p-4">
                <div className="flex justify-between items-start">
                  <div>
                    <p className="font-medium text-gray-900">{report.title}</p>
                    <p className="text-sm text-gray-600 mt-1">{report.content}</p>
                    <p className="text-xs text-gray-500 mt-2">
                      Reported by {report.reportedBy} • {report.reportCount} reports
                    </p>
                  </div>
                  <div className="space-x-2">
                    <button
                      onClick={() => handleModeratePost(report._id, 'warn')}
                      className="px-3 py-1 bg-yellow-600 text-white rounded hover:bg-yellow-700"
                    >
                      Warn User
                    </button>
                    <button
                      onClick={() => handleModeratePost(report._id, 'remove')}
                      className="px-3 py-1 bg-red-600 text-white rounded hover:bg-red-700"
                    >
                      Remove
                    </button>
                    <button
                      onClick={() => handleModeratePost(report._id, 'ignore')}
                      className="px-3 py-1 bg-gray-600 text-white rounded hover:bg-gray-700"
                    >
                      Ignore
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};

export default AdminDashboard;