import React, { useState, useEffect } from 'react';
import { useAuth } from '../../contexts/AuthContext';
import { useNavigate, useLocation } from 'react-router-dom';
import { Calendar, BookOpen, Bell, User, LogOut } from 'lucide-react';
import { toast } from 'react-toastify';
import './StudentDashboard.css';
import api from '../../axios'; // axios instance with token interceptor

// ✅ Make sure to import these child components
import DashboardOverview from './DashboardOverview';
import MyRegisteredEvents from './MyRegisteredEvents';
import Notifications from './Notifications';
import ProfileSettings from './ProfileSettings';

const StudentDashboard = () => {
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();

  const getInitialTab = () => {
    const params = new URLSearchParams(location.search);
    return params.get('tab') || 'overview';
  };

  const [activeTab, setActiveTab] = useState(getInitialTab());
  const [registeredEvents, setRegisteredEvents] = useState([]);
  const [notifications, setNotifications] = useState([]);
  const [loading, setLoading] = useState(false);

  // Fetch data after user is loaded
  useEffect(() => {
    if (!user) return;

    const fetchData = async () => {
      setLoading(true);
      try {
        if (activeTab === 'events') {
          const eventsRes = await api.get('/api/users/registered-events');
          setRegisteredEvents(eventsRes.data || []);
        }

        if (activeTab === 'notifications' || activeTab === 'overview') {
          const notifRes = await api.get('/api/users/notifications');
          const fetchedNotifications = notifRes.data.notifications || [];
          const readNotifications = JSON.parse(localStorage.getItem('readNotifications') || '[]');

          setNotifications(
            fetchedNotifications.map(n => ({
              ...n,
              read: readNotifications.includes(n.id) || n.read,
            }))
          );
        }
      } catch (err) {
        console.error(err);
        toast.error('Failed to fetch data');
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, [activeTab, user]);

  const handleTabChange = (tab) => {
    setActiveTab(tab);
    const newUrl = tab === 'overview' ? '/dashboard' : `/dashboard?tab=${tab}`;
    navigate(newUrl, { replace: true });
  };

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  const markNotificationAsRead = async (notificationId) => {
    try {
      const readNotifications = JSON.parse(localStorage.getItem('readNotifications') || '[]');
      if (!readNotifications.includes(notificationId)) readNotifications.push(notificationId);
      localStorage.setItem('readNotifications', JSON.stringify(readNotifications));

      setNotifications(prev =>
        prev.map(n => (n.id === notificationId ? { ...n, read: true } : n))
      );

      await api.put(`/api/users/notifications/${notificationId}/read`);
    } catch (err) {
      console.error('Error marking notification as read', err);
    }
  };

  const renderContent = () => {
    // ✅ Always render a fallback message if child data is empty
    switch (activeTab) {
      case 'overview':
        return <DashboardOverview registeredEvents={registeredEvents} notifications={notifications} />;
      case 'events':
        return <MyRegisteredEvents events={registeredEvents} loading={loading} />;
      case 'notifications':
        return <Notifications notifications={notifications} loading={loading} markAsRead={markNotificationAsRead} />;
      case 'profile':
        return <ProfileSettings user={user} />;
      default:
        return <DashboardOverview registeredEvents={registeredEvents} notifications={notifications} />;
    }
  };

  return (
    <div className="student-dashboard">
      <div className="container">
        <div className="sidebar">
          <div className="sidebar-header">
            <img src="/assets/Profile.png" alt="User" />
            <h3>{user?.fullName || 'Student Name'}</h3>
            <p>{user?.department || 'Department'}</p>
          </div>

          <div className={`menu-item ${activeTab === 'overview' ? 'active' : ''}`} onClick={() => handleTabChange('overview')}>
            <Calendar size={20} /> Dashboard Overview
          </div>
          <div className={`menu-item ${activeTab === 'events' ? 'active' : ''}`} onClick={() => handleTabChange('events')}>
            <BookOpen size={20} /> My Registered Events
          </div>
          <div className={`menu-item ${activeTab === 'notifications' ? 'active' : ''}`} onClick={() => handleTabChange('notifications')}>
            <Bell size={20} /> Notifications
            {notifications.filter(n => !n.read).length > 0 && <span className="badge">{notifications.filter(n => !n.read).length}</span>}
          </div>
          <div className={`menu-item ${activeTab === 'profile' ? 'active' : ''}`} onClick={() => handleTabChange('profile')}>
            <User size={20} /> Profile Settings
          </div>
          <div className="menu-item" onClick={handleLogout}>
            <LogOut size={20} /> Logout
          </div>
        </div>

        <div className="main-content">
          {renderContent() || <h2>Loading dashboard...</h2>}
        </div>
      </div>
    </div>
  );
};

export default StudentDashboard;
