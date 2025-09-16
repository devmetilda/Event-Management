import React, { useState, useEffect } from 'react';
import { useAuth } from '../../contexts/AuthContext';
import { useNavigate, useLocation } from 'react-router-dom';
import { Calendar, BookOpen, Bell, User, LogOut } from 'lucide-react';
import { toast } from 'react-toastify';
import './StudentDashboard.css';
import api from '../../axios'; // UPDATED: use axios instance

const StudentDashboard = () => {
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();

  const getInitialTab = () => {
    const params = new URLSearchParams(location.search);
    const tab = params.get('tab');
    return tab || 'overview';
  };

  const [activeTab, setActiveTab] = useState(getInitialTab());
  const [registeredEvents, setRegisteredEvents] = useState([]);
  const [notifications, setNotifications] = useState([]);
  const [loading, setLoading] = useState(false);

  const handleTabChange = (tab) => {
    setActiveTab(tab);
    const newUrl = tab === 'overview' ? '/dashboard' : `/dashboard?tab=${tab}`;
    navigate(newUrl, { replace: true });
  };

  useEffect(() => {
    fetchNotifications();

    if (activeTab === 'events') {
      fetchRegisteredEvents();
    }
  }, [activeTab]);

  useEffect(() => {
    fetchNotifications();
  }, []);

  const fetchRegisteredEvents = async () => {
    try {
      setLoading(true);
      const response = await api.get('/api/users/registered-events'); // UPDATED
      setRegisteredEvents(response.data || []);
    } catch (error) {
      console.error('Error fetching registered events:', error);
      toast.error('Failed to fetch registered events');
    } finally {
      setLoading(false);
    }
  };

  const fetchNotifications = async () => {
    try {
      setLoading(true);
      const response = await api.get('/api/users/notifications'); // UPDATED
      const fetchedNotifications = response.data.notifications || [];

      const readNotifications = JSON.parse(localStorage.getItem('readNotifications') || '[]');
      const updatedNotifications = fetchedNotifications.map(notif => ({
        ...notif,
        read: readNotifications.includes(notif.id) || notif.read
      }));

      setNotifications(updatedNotifications);
    } catch (error) {
      console.error('Error fetching notifications:', error);
      toast.error('Failed to fetch notifications');
    } finally {
      setLoading(false);
    }
  };

  const handleLogout = () => {
    logout();
  };

  useEffect(() => {
    const params = new URLSearchParams(location.search);
    const tab = params.get('tab');
    if (tab && tab !== activeTab) {
      setActiveTab(tab);
    }
  }, [location.search, activeTab]);

  useEffect(() => {
    if (activeTab === 'events') {
      fetchRegisteredEvents();
    } else if (activeTab === 'notifications') {
      fetchNotifications();
    }
  }, [activeTab]);

  const renderContent = () => {
    switch (activeTab) {
      case 'overview':
        return <DashboardOverview registeredEvents={registeredEvents} notifications={notifications} />;
      case 'events':
        return <MyRegisteredEvents events={registeredEvents} loading={loading} />;
      case 'notifications':
        return <Notifications notifications={notifications} loading={loading} setNotifications={setNotifications} />;
      case 'profile':
        return <ProfileSettings user={user} />;
      default:
        return <DashboardOverview registeredEvents={registeredEvents} notifications={notifications} />;
    }
  };

  return (
    <div className="student-dashboard">
      <div className="container">
        {/* Sidebar */}
        <div className="sidebar">
          <div className="sidebar-header">
            <img src="/assets/Profile.png" alt="User" />
            <h3>{user?.fullName || 'Alex Johnson'}</h3>
            <p>{user?.department || 'Computer Science'}</p>
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

        {/* Main Content */}
        <div className="main-content">{renderContent()}</div>
      </div>
    </div>
  );
};

// Dashboard Overview Component
const DashboardOverview = ({ registeredEvents, notifications }) => {
  const [events, setEvents] = useState([]);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    fetchAvailableEvents();
  }, []);

  const fetchAvailableEvents = async () => {
    try {
      setLoading(true);
      const response = await api.get('/api/events'); // UPDATED
      setEvents(response.data.events || []);
    } catch (error) {
      console.error('Failed to fetch available events');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="dashboard-overview">
      {/* ... same JSX as before ... */}
    </div>
  );
};

// My Registered Events Component
const MyRegisteredEvents = ({ events, loading }) => {
  const navigate = useNavigate();

  const handleViewDetails = (eventId) => {
    navigate(`/events/${eventId}`);
  };

  const getEventImage = (eventTitle) => {
    const title = eventTitle?.toLowerCase() || '';
    if (title.includes('tech') || title.includes('symposium')) return '/assets/annual-tech.png';
    if (title.includes('career') || title.includes('workshop')) return '/assets/career-dev.png';
    if (title.includes('spring') || title.includes('fest')) return '/assets/spring-fest.png';
    if (title.includes('inter') || title.includes('college')) return '/assets/inter-clg.png';
    return '/assets/Events.png';
  };

  return (
    <div className="my-registered-events">
      {/* ... same JSX as before ... */}
    </div>
  );
};

// Notifications Component
const Notifications = ({ notifications, loading, setNotifications }) => {
  const markAsRead = async (notificationId) => {
    try {
      const readNotifications = JSON.parse(localStorage.getItem('readNotifications') || '[]');
      if (!readNotifications.includes(notificationId)) {
        readNotifications.push(notificationId);
        localStorage.setItem('readNotifications', JSON.stringify(readNotifications));
      }

      setNotifications(prev => prev.map(notif => notif.id === notificationId ? { ...notif, read: true } : notif));

      await api.put(`/api/users/notifications/${notificationId}/read`); // UPDATED
    } catch (error) {
      console.error('Error marking notification as read:', error);
    }
  };

  return (
    <div className="notifications">
      {/* ... same JSX as before ... */}
    </div>
  );
};

// Profile Settings Component
const ProfileSettings = ({ user }) => {
  const { updateUser } = useAuth();
  const [formData, setFormData] = useState({
    fullName: user?.fullName || '',
    email: user?.email || '',
    department: user?.department || '',
    year: user?.year || '',
    studentId: user?.studentId || '',
    phoneNumber: user?.phoneNumber || ''
  });
  const [loading, setLoading] = useState(false);
  const [profileImage, setProfileImage] = useState(user?.profileImage || '/assets/Profile.png');

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const handleImageChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      const reader = new FileReader();
      reader.onload = (e) => setProfileImage(e.target.result);
      reader.readAsDataURL(file);
      toast.success('Profile picture updated! Click Save Changes to apply.');
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    try {
      const profileData = { ...formData, profileImage };
      const response = await api.put('/api/users/profile', profileData); // UPDATED
      updateUser(response.data.user);
      toast.success('Profile updated successfully!');
    } catch (error) {
      toast.error('Failed to update profile');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="student-profile-settings">
      {/* ... same JSX as before ... */}
    </div>
  );
};

export default StudentDashboard;
