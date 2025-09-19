import React, { useState, useEffect } from 'react';
import { useAuth } from '../../contexts/AuthContext';
import { useNavigate, useLocation } from 'react-router-dom';
import { Calendar, BookOpen, Bell, User, LogOut } from 'lucide-react';

// CORRECTED: Importing your special axios.js file
import api from '../../api/axios.js'; 

import { toast } from 'react-toastify';
import './StudentDashboard.css';

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
    if (activeTab === 'events' || activeTab === 'overview') {
      fetchRegisteredEvents();
    }
  }, [activeTab]);
  
  useEffect(() => {
    const params = new URLSearchParams(location.search);
    const tabFromUrl = params.get('tab') || 'overview';
    if (tabFromUrl !== activeTab) {
      setActiveTab(tabFromUrl);
    }
  }, [location.search]);


  const fetchRegisteredEvents = async () => {
    try {
      setLoading(true);
      // CORRECTED: Using 'api' instead of 'axios'
      const response = await api.get('/users/registered-events');
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
      // CORRECTED: Using 'api' instead of 'axios'
      const response = await api.get('/users/notifications');
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

  const renderContent = () => {
    switch (activeTab) {
      case 'overview':
        return <DashboardOverview registeredEvents={registeredEvents} notifications={notifications} />;
      case 'events':
        return <MyRegisteredEvents events={registeredEvents} loading={loading} />;
      case 'notifications':
        return <Notifications
          notifications={notifications}
          loading={loading}
          setNotifications={setNotifications}
        />;
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

          <div
            className={`menu-item ${activeTab === 'overview' ? 'active' : ''}`}
            onClick={() => handleTabChange('overview')}
          >
            <Calendar size={20} />
            Dashboard Overview
          </div>

          <div
            className={`menu-item ${activeTab === 'events' ? 'active' : ''}`}
            onClick={() => handleTabChange('events')}
          >
            <BookOpen size={20} />
            My Registered Events
          </div>

          <div
            className={`menu-item ${activeTab === 'notifications' ? 'active' : ''}`}
            onClick={() => handleTabChange('notifications')}
          >
            <Bell size={20} />
            Notifications
            {notifications.filter(n => !n.read).length > 0 && (
              <span className="badge">{notifications.filter(n => !n.read).length}</span>
            )}
          </div>

          <div
            className={`menu-item ${activeTab === 'profile' ? 'active' : ''}`}
            onClick={() => handleTabChange('profile')}
          >
            <User size={20} />
            Profile Settings
          </div>

          <div className="menu-item" onClick={handleLogout}>
            <LogOut size={20} />
            Logout
          </div>
        </div>

        {/* Main Content */}
        <div className="main-content">
          {renderContent()}
        </div>
      </div>
    </div>
  );
};

const DashboardOverview = ({ registeredEvents, notifications }) => {
  const [events, setEvents] = useState([]);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    fetchAvailableEvents();
  }, []);

  const fetchAvailableEvents = async () => {
    try {
      setLoading(true);
      // CORRECTED: Using 'api' instead of 'axios'
      const response = await api.get('/events');
      setEvents(response.data.events || []);
    } catch (error) {
      console.error('Failed to fetch available events');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="dashboard-overview">
      <div className="welcome-box">
        <h2>Welcome to Your Dashboard</h2>
        <p>Stay updated with your registered events and campus activities.</p>
      </div>

      <div className="stats-boxes">
        <div className="stat-card">
          <h1>{registeredEvents.length}</h1>
          <p>Registered Events</p>
        </div>
        <div className="stat-card">
          <h1>{events.length}</h1>
          <p>Available Events</p>
        </div>
        <div className="stat-card">
          <h1>{notifications.filter(n => !n.read).length}</h1>
          <p>New Notifications</p>
        </div>
      </div>

      <div className="upcoming-events">
        <div className="upcoming-events-header">
          <h3>Available Events</h3>
          <a href="/events">View All</a>
        </div>
        {loading ? (
          <div className="loading">Loading events...</div>
        ) : (
          <div className="home-events-grid">
            {events.slice(0, 4).map(event => {
              const getEventImage = (eventTitle, category) => {
                const title = eventTitle?.toLowerCase() || '';
                const cat = category?.toLowerCase() || '';

                if (title.includes('tech') || title.includes('symposium') || cat === 'academic') {
                  return '/assets/annual-tech.png';
                } else if (title.includes('cultural') || title.includes('spring') || title.includes('fest') || cat === 'cultural') {
                  return '/assets/spring-fest.png';
                } else if (title.includes('career') || title.includes('workshop') || cat === 'workshop') {
                  return '/assets/career-dev.png';
                } else if (title.includes('sports') || title.includes('inter') || title.includes('college') || cat === 'sports') {
                  return '/assets/inter-clg.png';
                }
                return '/assets/Events.png';
              };

              const getCategoryColor = (category) => {
                switch(category?.toLowerCase()) {
                  case 'academic': return '#4A90E2';
                  case 'cultural': return '#50C878';
                  case 'workshop': return '#FFB347';
                  case 'sports': return '#FF6B6B';
                  default: return '#8B6A3A';
                }
              };

              return (
                <div key={event._id} className="home-event-card">
                  <div className="home-event-image">
                    <img
                      src={event.image || getEventImage(event.title, event.category)}
                      alt={event.title}
                      onError={(e) => {
                        e.target.src = '/assets/Events.png';
                      }}
                    />
                    <div
                      className="home-category-tag"
                      style={{ backgroundColor: getCategoryColor(event.category) }}
                    >
                      {event.category || 'Event'}
                    </div>
                  </div>

                  <div className="home-event-content">
                    <h4 className="home-event-title">{event.title}</h4>
                    <p className="home-event-description">
                      {event.description?.substring(0, 80)}...
                    </p>

                    <div className="home-event-details">
                      <div className="home-event-date">
                        <Calendar size={14} />
                        <span>{new Date(event.date).toLocaleDateString('en-US', {
                          month: 'short',
                          day: 'numeric',
                          year: 'numeric'
                        })}</span>
                      </div>
                      <div className="home-event-time">
                        <span>{event.startTime} - {event.endTime}</span>
                      </div>
                      <div className="home-event-location">
                        <span>{event.location}</span>
                      </div>
                      <div className="home-event-participants">
                        <span>{event.registeredParticipants?.length || 0} registered</span>
                      </div>
                    </div>
                  </div>
                </div>
              );
            })}
            {events.length === 0 && (
              <p style={{ textAlign: 'center', color: '#666', padding: '20px' }}>
                No events available. Check back later!
              </p>
            )}
          </div>
        )}
      </div>
    </div>
  );
};

const MyRegisteredEvents = ({ events, loading }) => {
  const navigate = useNavigate();

  const handleViewDetails = (eventId) => {
    navigate(`/events/${eventId}`);
  };

  const getEventImage = (eventTitle) => {
    const title = eventTitle?.toLowerCase() || '';
    if (title.includes('tech') || title.includes('symposium')) {
      return '/assets/annual-tech.png';
    } else if (title.includes('career') || title.includes('workshop')) {
      return '/assets/career-dev.png';
    } else if (title.includes('spring') || title.includes('fest')) {
      return '/assets/spring-fest.png';
    } else if (title.includes('inter') || title.includes('college')) {
      return '/assets/inter-clg.png';
    }
    return '/assets/Events.png';
  };

  return (
    <div className="my-registered-events">
      <div className="page-header">
        <h2>My Registered Events</h2>
      </div>

      {loading ? (
        <div className="loading">Loading your events...</div>
      ) : (
        <div className="registered-events-list">
          {events.length > 0 ? events.map((registration, index) => {
            const event = registration.event || registration;
            const status = registration.status || 'Registered';

            return (
              <div key={event._id || event.id || index} className="event-item-horizontal">
                <div className="event-image-container">
                  <img
                    src={event.image || getEventImage(event.title)}
                    alt={event.title}
                    className="event-thumbnail"
                    onError={(e) => {
                      e.target.src = '/assets/Events.png';
                    }}
                  />
                </div>
                <div className="event-content">
                  <div className="event-header-row">
                    <h3 className="event-title">{event.title}</h3>
                    <span className={`status-tag ${status.toLowerCase()}`}>
                      {status}
                    </span>
                  </div>
                  <div className="event-datetime">
                    <div className="date-info">
                      <Calendar size={14} />
                      <span>{new Date(event.date).toLocaleDateString('en-US', {
                        month: 'short',
                        day: 'numeric',
                        year: 'numeric'
                      })}</span>
                    </div>
                    <div className="time-info">
                      <span>{event.time}</span>
                    </div>
                  </div>
                  <button
                    className="details-button"
                    onClick={() => handleViewDetails(event._id || event.id)}
                  >
                    View Event Details
                  </button>
                </div>
              </div>
            );
          }) : (
            <div className="no-events">
              <p>You haven't registered for any events yet.</p>
              <p>Browse available events to get started!</p>
            </div>
          )}
        </div>
      )}
    </div>
  );
};

const Notifications = ({ notifications, loading, setNotifications }) => {
  const markAsRead = async (notificationId) => {
    try {
      const readNotifications = JSON.parse(localStorage.getItem('readNotifications') || '[]');
      if (!readNotifications.includes(notificationId)) {
        readNotifications.push(notificationId);
        localStorage.setItem('readNotifications', JSON.stringify(readNotifications));
      }

      setNotifications(prev =>
        prev.map(notif =>
          notif.id === notificationId ? { ...notif, read: true } : notif
        )
      );

      // CORRECTED: Using 'api' instead of 'axios'
      await api.put(`/users/notifications/${notificationId}/read`);
    } catch (error) {
      console.error('Error marking notification as read:', error);
    }
  };

  return (
    <div className="notifications">
      <div className="page-header">
        <h2>Notifications</h2>
        <p>Stay updated with the latest announcements and reminders</p>
      </div>

      {loading ? (
        <div className="loading">Loading notifications...</div>
      ) : (
        <div className="notifications-list">
          {notifications.length > 0 ? notifications.map(notification => (
            <div
              key={notification.id}
              className={`notification-item ${!notification.read ? 'unread' : ''}`}
              onClick={() => !notification.read && markAsRead(notification.id)}
              style={{ cursor: !notification.read ? 'pointer' : 'default' }}
            >
              <div className="notification-content">
                <p>{notification.message}</p>
                <span className="notification-time">{notification.time}</span>
              </div>
              {!notification.read && <div className="unread-indicator"></div>}
            </div>
          )) : (
            <div className="no-notifications">
              <p>No notifications yet.</p>
            </div>
          )}
        </div>
      )}
    </div>
  );
};

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
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const handleImageChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      const reader = new FileReader();
      reader.onload = (e) => {
        setProfileImage(e.target.result);
      };
      reader.readAsDataURL(file);
      toast.success('Profile picture updated! Click Save Changes to apply.');
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);

    try {
      const profileData = {
        ...formData,
        profileImage: profileImage
      };
      // CORRECTED: Using 'api' instead of 'axios'
      const response = await api.put('/users/profile', profileData);
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
      <h2>Profile Settings</h2>

      <div className="student-profile-header">
        <img src={profileImage} alt="Profile" className="student-profile-image" />
        <div className="student-profile-info">
          <h3>{formData.fullName || user?.fullName || 'Student'}</h3>
          <p>
            {formData.department && formData.year
              ? `${formData.department} • ${formData.year}`
              : formData.department || formData.year || 'Update your information below'
            }
          </p>
          <label className="change-profile-picture">
            Change Profile Picture
            <input
              type="file"
              accept="image/*"
              onChange={handleImageChange}
              style={{ display: 'none' }}
            />
          </label>
        </div>
      </div>

      <form onSubmit={handleSubmit} className="student-profile-form">
        <div className="student-form-grid">
          <div className="student-form-group">
            <label>Full Name</label>
            <input
              type="text"
              name="fullName"
              value={formData.fullName}
              onChange={handleChange}
              required
            />
          </div>
          <div className="student-form-group">
            <label>Email Address</label>
            <input
              type="email"
              name="email"
              value={formData.email}
              onChange={handleChange}
              required
            />
          </div>
          <div className="student-form-group">
            <label>Department</label>
            <input
              type="text"
              name="department"
              value={formData.department}
              onChange={handleChange}
              placeholder="e.g., Computer Science"
            />
          </div>
          <div className="student-form-group">
            <label>Year</label>
            <input
              type="text"
              name="year"
              value={formData.year}
              onChange={handleChange}
              placeholder="e.g., 3rd Year"
            />
          </div>
          <div className="student-form-group">
            <label>Student ID</label>
            <input
              type="text"
              name="studentId"
              value={formData.studentId}
              onChange={handleChange}
              placeholder="e.g., 2362180"
            />
          </div>
          <div className="student-form-group">
            <label>Phone Number</label>
            <input
              type="tel"
              name="phoneNumber"
              value={formData.phoneNumber}
              onChange={handleChange}
              placeholder="e.g., (555) 123-4567"
            />
          </div>
        </div>
        <button type="submit" className="student-save-btn" disabled={loading}>
          {loading ? 'Saving...' : 'Save Changes'}
        </button>
      </form>
    </div>
  );
};

export default StudentDashboard;
