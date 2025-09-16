import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { Calendar, Clock, MapPin, Users, ArrowLeft } from 'lucide-react';
import { toast } from 'react-toastify';
import { useAuth } from '../contexts/AuthContext';
import api from '../axios'; // UPDATED: use axios instance

const EventDetails = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const { user } = useAuth();
  const [event, setEvent] = useState(null);
  const [loading, setLoading] = useState(true);
  const [isRegistered, setIsRegistered] = useState(false);

  useEffect(() => {
    fetchEventDetails();
  }, [id]);

  const fetchEventDetails = async () => {
    try {
      setLoading(true);
      const response = await api.get(`/api/events/${id}`); // UPDATED
      setEvent(response.data);

      if (user && response.data.registeredParticipants) {
        const registered = response.data.registeredParticipants.some(
          participant => participant.user._id === user.id || participant.user === user.id
        );
        setIsRegistered(registered);
      }
    } catch (error) {
      console.error('Error fetching event details:', error);
      toast.error('Failed to load event details');
    } finally {
      setLoading(false);
    }
  };

  const handleRegister = async () => {
    try {
      await api.post(`/api/events/${id}/register`); // UPDATED
      toast.success('Successfully registered for event!');
      setIsRegistered(true);
      fetchEventDetails();
    } catch (error) {
      console.error('Registration error:', error);
      toast.error(error.response?.data?.message || 'Failed to register for event');
    }
  };

  const handleUnregister = async () => {
    try {
      await api.delete(`/api/events/${id}/unregister`); // UPDATED
      toast.success('Successfully unregistered from event!');
      setIsRegistered(false);
      fetchEventDetails();
    } catch (error) {
      console.error('Unregistration error:', error);
      toast.error(error.response?.data?.message || 'Failed to unregister from event');
    }
  };

  if (loading) {
    return (
      <div style={{ padding: '60px 40px', maxWidth: '1200px', margin: '0 auto', textAlign: 'center' }}>
        <p>Loading event details...</p>
      </div>
    );
  }

  if (!event) {
    return (
      <div style={{ padding: '60px 40px', maxWidth: '1200px', margin: '0 auto', textAlign: 'center' }}>
        <h2>Event Not Found</h2>
        <p>The event you're looking for doesn't exist or has been removed.</p>
        <button onClick={() => navigate('/events')} style={{ marginTop: '20px', padding: '10px 20px' }}>
          Back to Events
        </button>
      </div>
    );
  }

  return (
    <div style={{ padding: '60px 40px', maxWidth: '1200px', margin: '0 auto' }}>
      <button
        onClick={() => navigate(-1)}
        style={{
          display: 'flex',
          alignItems: 'center',
          gap: '8px',
          background: 'none',
          border: 'none',
          color: '#8B6A3A',
          cursor: 'pointer',
          marginBottom: '20px',
          fontSize: '16px'
        }}
      >
        <ArrowLeft size={20} />
        Back
      </button>

      <div style={{ background: 'white', borderRadius: '12px', padding: '30px', boxShadow: '0 2px 10px rgba(0,0,0,0.1)' }}>
        <div style={{ display: 'flex', gap: '30px', marginBottom: '30px' }}>
          <img
            src={event.image || '/assets/Events.png'}
            alt={event.title}
            style={{ width: '300px', height: '200px', objectFit: 'cover', borderRadius: '8px' }}
          />

          <div style={{ flex: 1 }}>
            <h1 style={{ margin: '0 0 15px 0', color: '#333', fontSize: '28px' }}>{event.title}</h1>

            <div style={{ display: 'flex', flexDirection: 'column', gap: '10px', marginBottom: '20px' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '8px', color: '#666' }}>
                <Calendar size={18} />
                <span>{new Date(event.date).toLocaleDateString('en-US', {
                  weekday: 'long',
                  year: 'numeric',
                  month: 'long',
                  day: 'numeric'
                })}</span>
              </div>

              <div style={{ display: 'flex', alignItems: 'center', gap: '8px', color: '#666' }}>
                <Clock size={18} />
                <span>{event.startTime} - {event.endTime}</span>
              </div>

              <div style={{ display: 'flex', alignItems: 'center', gap: '8px', color: '#666' }}>
                <MapPin size={18} />
                <span>{event.location}</span>
              </div>

              <div style={{ display: 'flex', alignItems: 'center', gap: '8px', color: '#666' }}>
                <Users size={18} />
                <span>{event.registeredParticipants?.length || 0} / {event.maxParticipants} registered</span>
              </div>
            </div>

            {user && user.role === 'student' && (
              <button
                onClick={isRegistered ? handleUnregister : handleRegister}
                style={{
                  background: isRegistered ? '#dc3545' : '#8B6A3A',
                  color: 'white',
                  border: 'none',
                  padding: '12px 24px',
                  borderRadius: '8px',
                  cursor: 'pointer',
                  fontSize: '16px',
                  fontWeight: '500'
                }}
              >
                {isRegistered ? 'Unregister' : 'Register for Event'}
              </button>
            )}
          </div>
        </div>

        <div>
          <h3 style={{ color: '#333', marginBottom: '15px' }}>About This Event</h3>
          <p style={{ color: '#666', lineHeight: '1.6', fontSize: '16px' }}>
            {event.description}
          </p>
        </div>

        {event.tags && event.tags.length > 0 && (
          <div style={{ marginTop: '20px' }}>
            <h4 style={{ color: '#333', marginBottom: '10px' }}>Tags</h4>
            <div style={{ display: 'flex', gap: '8px', flexWrap: 'wrap' }}>
              {event.tags.map((tag, index) => (
                <span
                  key={index}
                  style={{
                    background: '#f0f0f0',
                    padding: '4px 12px',
                    borderRadius: '20px',
                    fontSize: '14px',
                    color: '#666'
                  }}
                >
                  {tag}
                </span>
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default EventDetails;
