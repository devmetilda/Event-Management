import React, { useState, useEffect } from 'react';
import { useSearchParams } from 'react-router-dom';
import { Calendar, List, Grid } from 'lucide-react';
import EventCard from '../components/events/EventCard';
import LoadingSpinner from '../components/common/LoadingSpinner';
import './EventList.css';
import api from '../axios'; // UPDATED: use axios instance

const EventList = () => {
  const [events, setEvents] = useState([]);
  const [loading, setLoading] = useState(true);
  const [viewMode, setViewMode] = useState('list'); // 'list' or 'calendar'
  const [searchParams, setSearchParams] = useSearchParams();
  const [filters, setFilters] = useState({
    category: searchParams.get('category') || 'all',
    search: searchParams.get('search') || ''
  });

  // Fetch events from API
  useEffect(() => {
    fetchEvents();
  }, [filters]);

  const fetchEvents = async () => {
    try {
      setLoading(true);
      const params = new URLSearchParams();
      if (filters.category !== 'all') {
        params.append('category', filters.category);
      }
      if (filters.search) {
        params.append('search', filters.search);
      }

      const response = await api.get(`/api/events?${params.toString()}`); // UPDATED
      setEvents(response.data.events || []);
    } catch (error) {
      console.error('Error fetching events:', error);
      setEvents([]);
    } finally {
      setLoading(false);
    }
  };

  const handleFilterChange = (key, value) => {
    const newFilters = { ...filters, [key]: value };
    setFilters(newFilters);
    
    // Update URL params
    const newSearchParams = new URLSearchParams();
    if (newFilters.category !== 'all') {
      newSearchParams.set('category', newFilters.category);
    }
    if (newFilters.search) {
      newSearchParams.set('search', newFilters.search);
    }
    setSearchParams(newSearchParams);
  };

  const categories = [
    { value: 'all', label: 'All Events' },
    { value: 'academic', label: 'Academic' },
    { value: 'cultural', label: 'Cultural' },
    { value: 'sports', label: 'Sports' },
    { value: 'workshop', label: 'Workshops' },
    { value: 'seminar', label: 'Seminars' }
  ];

  return (
    <div className="event-list-page">
      {/* Hero Section */}
      <div className="events-hero" style={{ backgroundImage: 'url(/assets/calender-flower.png)' }}>
        <div className="hero-content">
          <h2>Campus Events</h2>
          <p>Discover amazing events happening on campus</p>
        </div>
      </div>

      {/* Filters Section */}
      <div className="filters-section">
        <div className="filters-container">
          <div className="search-filter">
            <input
              type="text"
              placeholder="Search events..."
              value={filters.search}
              onChange={(e) => handleFilterChange('search', e.target.value)}
              className="search-input"
            />
          </div>

          <div className="category-filter">
            <select
              value={filters.category}
              onChange={(e) => handleFilterChange('category', e.target.value)}
              className="category-select"
            >
              {categories.map(category => (
                <option key={category.value} value={category.value}>
                  {category.label}
                </option>
              ))}
            </select>
          </div>

          {/* View Toggle Buttons */}
          <div className="view-toggle">
            <button
              className={`view-btn ${viewMode === 'list' ? 'active' : ''}`}
              onClick={() => setViewMode('list')}
              title="List View"
            >
              <List size={20} />
              List
            </button>
            <button
              className={`view-btn ${viewMode === 'calendar' ? 'active' : ''}`}
              onClick={() => setViewMode('calendar')}
              title="Calendar View"
            >
              <Calendar size={20} />
              Calendar
            </button>
          </div>
        </div>
      </div>

      {/* Events Section */}
      <div className="events-content">
        <div className="events-header">
          <h3>
            {filters.category === 'all' ? 'All Events' : 
             categories.find(c => c.value === filters.category)?.label}
            {filters.search && ` matching "${filters.search}"`}
          </h3>
          <p>{events.length} events found</p>
        </div>

        {loading ? (
          <LoadingSpinner message="Loading events..." />
        ) : (
          <>
            {viewMode === 'list' ? (
              <div className="events-grid">
                {events.length > 0 ? (
                  events.map(event => (
                    <EventCard key={event._id} event={event} />
                  ))
                ) : (
                  <div className="no-events">
                    <h3>No events found</h3>
                    <p>
                      {filters.search || filters.category !== 'all'
                        ? 'Try adjusting your search or filter criteria.'
                        : 'Check back soon for upcoming events!'
                      }
                    </p>
                  </div>
                )}
              </div>
            ) : (
              <CalendarView events={events} />
            )}
          </>
        )}
      </div>
    </div>
  );
};

// Calendar View Component
const CalendarView = ({ events }) => {
  const [currentDate, setCurrentDate] = useState(new Date());

  const getDaysInMonth = (date) => {
    return new Date(date.getFullYear(), date.getMonth() + 1, 0).getDate();
  };

  const getFirstDayOfMonth = (date) => {
    return new Date(date.getFullYear(), date.getMonth(), 1).getDay();
  };

  const getEventsForDate = (date) => {
    return events.filter(event => {
      const eventDate = new Date(event.date);
      return eventDate.toDateString() === date.toDateString();
    });
  };

  const navigateMonth = (direction) => {
    setCurrentDate(prev => {
      const newDate = new Date(prev);
      newDate.setMonth(prev.getMonth() + direction);
      return newDate;
    });
  };

  const daysInMonth = getDaysInMonth(currentDate);
  const firstDay = getFirstDayOfMonth(currentDate);
  const monthNames = [
    'January', 'February', 'March', 'April', 'May', 'June',
    'July', 'August', 'September', 'October', 'November', 'December'
  ];
  const dayNames = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];

  return (
    <div
      className="calendar-view"
      style={{
        backgroundImage: 'url(/assets/calender-flower.png)',
        backgroundSize: 'cover',
        backgroundPosition: 'center center',
        backgroundRepeat: 'no-repeat'
      }}
    >
      <div className="calendar-wrapper">
        <div className="calendar-header">
          <button onClick={() => navigateMonth(-1)} className="nav-btn">‹</button>
          <h3>{monthNames[currentDate.getMonth()]} {currentDate.getFullYear()}</h3>
          <button onClick={() => navigateMonth(1)} className="nav-btn">›</button>
        </div>

      <div className="calendar-grid">
        {dayNames.map(day => (
          <div key={day} className="calendar-day-header">{day}</div>
        ))}

        {Array.from({ length: firstDay }, (_, i) => (
          <div key={`empty-${i}`} className="calendar-day empty"></div>
        ))}

        {Array.from({ length: daysInMonth }, (_, i) => {
          const day = i + 1;
          const date = new Date(currentDate.getFullYear(), currentDate.getMonth(), day);
          const dayEvents = getEventsForDate(date);
          const isToday = date.toDateString() === new Date().toDateString();

          return (
            <div key={day} className={`calendar-day ${isToday ? 'today' : ''}`}>
              <div className="day-number">{day}</div>
              {dayEvents.length > 0 && (
                <div className="day-events">
                  {dayEvents.slice(0, 2).map(event => (
                    <div key={event._id} className="calendar-event" title={event.title}>
                      {event.title.length > 15 ? `${event.title.substring(0, 15)}...` : event.title}
                    </div>
                  ))}
                  {dayEvents.length > 2 && (
                    <div className="more-events">+{dayEvents.length - 2} more</div>
                  )}
                </div>
              )}
            </div>
          );
        })}
      </div>
      </div>
    </div>
  );
};

export default EventList;
