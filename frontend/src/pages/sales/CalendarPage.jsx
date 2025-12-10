import { useState, useEffect, useCallback } from 'react';
import { Calendar, dateFnsLocalizer } from 'react-big-calendar';
import format from 'date-fns/format';
import parse from 'date-fns/parse';
import startOfWeek from 'date-fns/startOfWeek';
import getDay from 'date-fns/getDay';
import enUS from 'date-fns/locale/en-US';
import 'react-big-calendar/lib/css/react-big-calendar.css';
import { toast } from 'react-hot-toast';

import EventFormModal from '../../features/calendar/components/EventFormModal';
import CalendarToolbar from '../../features/calendar/components/CalendarToolbar';
import ConfirmationModal from '../../components/ConfirmationModal';
import SuccessModal from '../../components/SuccessModal';
import axios from 'axios';
import { FaPlus } from 'react-icons/fa';
import { useAIContext } from '../../context/useAIContext';

const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || 'http://localhost:5000/api/v1';

const locales = {
  'en-US': enUS,
};

const localizer = dateFnsLocalizer({
  format,
  parse,
  startOfWeek,
  getDay,
  locales,
});

const CustomDateHeader = ({ label, date, onDrillDown }) => {
  const today = new Date();
  const isToday =
    date.getDate() === today.getDate() &&
    date.getMonth() === today.getMonth() &&
    date.getFullYear() === today.getFullYear();

  return (
    <div className="rbc-date-cell px-2 pt-2">
      <button
        onClick={onDrillDown}
        className={`flex items-center justify-center w-8 h-8 rounded-full transition-colors text-sm font-medium ${
          isToday
            ? 'bg-blue-600 text-white'
            : 'text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-white/10'
        }`}
      >
        {label}
      </button>
    </div>
  );
};

const CalendarPage = () => {
  const [events, setEvents] = useState([]);
  const [selectedEvent, setSelectedEvent] = useState(null);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [loading, setLoading] = useState(true);

  const [view, setView] = useState('month');
  const [date, setDate] = useState(new Date());

  const [showConfirmDelete, setShowConfirmDelete] = useState(false);
  const [showSuccess, setShowSuccess] = useState(false);
  const [successMessage, setSuccessMessage] = useState('');

  const onNavigate = useCallback((newDate) => setDate(newDate), [setDate]);
  const onView = useCallback((newView) => setView(newView), [setView]);

  const fetchEvents = useCallback(async () => {
    try {
      const token = localStorage.getItem('authToken') || sessionStorage.getItem('authToken');
      const response = await axios.get(`${API_BASE_URL}/calendar`, {
        headers: { Authorization: `Bearer ${token}` },
      });

      const loadedEvents = response.data.map((evt) => ({
        ...evt,
        start: new Date(evt.start_time),
        end: new Date(evt.end_time),
      }));

      setEvents(loadedEvents);
    } catch (error) {
      console.error('Failed to fetch events', error);
      toast.error('Failed to load calendar events');
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchEvents();
  }, [fetchEvents]);

  const { setCalendarContext } = useAIContext();

  useEffect(() => {
    setCalendarContext(events);
  }, [events, setCalendarContext]);

  const handleSelectSlot = ({ start, end }) => {
    setSelectedEvent({ start, end, title: '', description: '', all_day: false, type: 'meeting' });
    setIsModalOpen(true);
  };

  const handleSelectEvent = (event) => {
    setSelectedEvent(event);
    setIsModalOpen(true);
  };

  const handleSave = async (formData) => {
    try {
      const token = localStorage.getItem('authToken') || sessionStorage.getItem('authToken');
      const payload = {
        ...formData,
        start_time: new Date(formData.start_time).toISOString(),
        end_time: new Date(formData.end_time).toISOString(),
      };

      if (selectedEvent && selectedEvent.event_id) {
        await axios.put(
          `${API_BASE_URL}/calendar/${selectedEvent.event_id}`,
          payload,
          {
            headers: { Authorization: `Bearer ${token}` },
          }
        );
        setSuccessMessage('Event updated successfully!');
      } else {
        await axios.post(`${API_BASE_URL}/calendar`, payload, {
          headers: { Authorization: `Bearer ${token}` },
        });
        setSuccessMessage('Event created successfully!');
      }
      setIsModalOpen(false);
      setShowSuccess(true);
      fetchEvents();
    } catch (error) {
      console.error(error);
      toast.error('Failed to save event');
    }
  };

  const handleDeleteClick = () => {
    if (!selectedEvent || !selectedEvent.event_id) return;
    setShowConfirmDelete(true);
  };

  const handleDeleteConfirm = async () => {
    try {
      const token = localStorage.getItem('authToken') || sessionStorage.getItem('authToken');
      await axios.delete(`${API_BASE_URL}/calendar/${selectedEvent.event_id}`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      setSuccessMessage('Event deleted successfully!');
      setIsModalOpen(false);
      setShowSuccess(true);
      fetchEvents();
    } catch (error) {
      console.error(error);
      toast.error('Failed to delete event');
    }
  };

  const eventStyleGetter = (event) => {
    let backgroundColor = '#3B82F6';

    switch (event.type) {
      case 'meeting':
        backgroundColor = '#8B5CF6';
        break;
      case 'call':
        backgroundColor = '#10B981';
        break;
      case 'task':
        backgroundColor = '#F59E0B';
        break;
      case 'personal':
        backgroundColor = '#EF4444';
        break;
      default:
        break;
    }
    return {
      style: {
        backgroundColor: backgroundColor,
        color: '#fff',
        border: 'none',
        borderRadius: '4px',
        fontSize: '0.85rem',
        fontWeight: '500',
        padding: '2px 6px',
        boxShadow: 'none',
      },
    };
  };

  return (
    <>
      <div className="p-6 h-full flex flex-col bg-gray-50 dark:bg-dark-bg">
        <div className="flex justify-between items-center mb-6 px-1">
          <div>
            <h1 className="text-3xl font-extrabold text-gray-900 dark:text-white tracking-tight">
              My Calendar
            </h1>
            <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">
              Organize your day efficiently
            </p>
          </div>
          <button
            onClick={() => {
              setSelectedEvent(null);
              setIsModalOpen(true);
            }}
            className="flex items-center space-x-2 px-5 py-2.5 bg-blue-600 text-white rounded-full hover:bg-blue-700 transition-colors duration-200 font-medium shadow-lg shadow-blue-500/30"
          >
            <FaPlus size={14} />
            <span>Create Event</span>
          </button>
        </div>

        <div className="flex-1 bg-white dark:bg-[#1a1a1a] p-4 rounded-xl relative overflow-hidden h-full transition-colors duration-200">
          {loading && (
            <div className="absolute inset-0 flex items-center justify-center bg-white/70 dark:bg-black/70 z-20 transition-opacity backdrop-blur-sm">
              <div className="flex flex-col items-center">
                <div className="w-8 h-8 border-4 border-blue-600 border-t-transparent rounded-full animate-spin mb-3"></div>
                <span className="text-blue-600 font-semibold text-sm">Loading...</span>
              </div>
            </div>
          )}
          <style>
            {`
              .dark .rbc-calendar * {
                  border-color: rgba(255, 255, 255, 0.02) !important;
              }
              .rbc-header {
                  padding: 12px 0;
                  font-weight: 600;
                  font-size: 0.8rem;
                  text-transform: uppercase;
                  letter-spacing: 0.5px;
                  color: #70757a;
                  border-bottom: none !important;
                  display: flex;
                  align-items: center;
                  justify-content: center;
                  min-height: 48px;
              }
              .dark .rbc-header {
                  color: #9AA0A6;
              }

              .rbc-header + .rbc-header {
                  border-left: none !important;
              }
              .rbc-time-header-content {
                  border-left: 1px solid transparent !important;
              }
              .dark .rbc-time-header-content {
                  border-left: 1px solid rgba(255, 255, 255, 0.05) !important;
              }
              .rbc-month-view {
                  border: none !important;
              }
              .rbc-month-row {
                  border-top: 1px solid #E5E7EB;
                  min-height: 120px;
              }
              .dark .rbc-month-row {
                  border-top: 1px solid rgba(255, 255, 255, 0.04) !important;
              }
              .rbc-day-bg + .rbc-day-bg {
                  border-left: 1px solid #E5E7EB;
              }
              .dark .rbc-day-bg + .rbc-day-bg {
                  border-left: 1px solid rgba(255, 255, 255, 0.04) !important;
              }

              .rbc-date-cell {
                  padding-right: 0 !important;
                  text-align: left;
              }
              .rbc-today {
                  background-color: transparent !important;
              }
              .rbc-off-range-bg {
                  background-color: transparent !important;
                  opacity: 0.5;
              }

              .rbc-agenda-view table.rbc-agenda-table {
                  border: none !important;
              }
              .rbc-agenda-view table.rbc-agenda-table tbody > tr > td {
                  padding: 12px 10px;
                  vertical-align: middle;
                  border-top: 1px solid #E5E7EB;
              }
              .dark .rbc-agenda-view table.rbc-agenda-table tbody > tr > td {
                  border-top: 1px solid rgba(255, 255, 255, 0.04) !important;
                  color: #E8EAED;
              }
              .rbc-agenda-view table.rbc-agenda-table thead {
                  display: none !important;
              }
              .rbc-agenda-date-cell {
                  font-weight: 600;
                  color: #3C4043;
              }
              .dark .rbc-agenda-date-cell {
                  color: #E8EAED;
              }
              .rbc-agenda-time-cell {
                  font-size: 0.85rem;
                  color: #70757a;
                  text-transform: lowercase;
              }
              .dark .rbc-agenda-time-cell {
                  color: #9AA0A6;
              }

              .rbc-time-view {
                  border: none !important;
              }

              .rbc-time-content {
                  border-top: 1px solid #E5E7EB;
              }
              .dark .rbc-time-content {
                  border-top: 1px solid rgba(255, 255, 255, 0.01) !important;
              }

              .rbc-timeslot-group {
                  border-bottom: 1px solid #F3F4F6;
                  min-height: 60px;
              }
              .dark .rbc-timeslot-group {
                  border-bottom: 1px solid rgba(255, 255, 255, 0.01) !important;
              }
              .rbc-day-slot .rbc-time-slot {
                  border-top: none !important;
              }

              .rbc-day-slot {
                  border-left: 1px solid #E5E7EB;
              }
              .dark .rbc-day-slot {
                  border-left: 1px solid rgba(255, 255, 255, 0.01) !important;
              }
              .rbc-day-slot + .rbc-day-slot {
                  border-left: 1px solid #E5E7EB;
              }
              .dark .rbc-day-slot + .rbc-day-slot {
                  border-left: 1px solid rgba(255, 255, 255, 0.01) !important;
              }

              .rbc-events-container {
                  margin-right: 0 !important;
              }

              .rbc-time-gutter .rbc-timeslot-group {
                  border-bottom: none !important;
              }

              .rbc-current-time-indicator {
                  background-color: #EA4335;
                  height: 2px;
              }
              .rbc-current-time-indicator::before {
                  content: '';
                  position: absolute;
                  left: -5px;
                  top: -4px;
                  width: 10px;
                  height: 10px;
                  background-color: #EA4335;
                  border-radius: 50%;
              }

              ::-webkit-scrollbar {
                width: 8px;
              }
              ::-webkit-scrollbar-thumb {
                background: #E5E7EB;
                border-radius: 8px;
                border: 2px solid #F9FAFB;
              }
              .dark ::-webkit-scrollbar-thumb {
                background: #404040;
                border: 2px solid #1A1A1A;
              }
            `}
          </style>

          <div className="h-[calc(100vh-190px)] text-gray-900 dark:text-gray-200">
            <Calendar
              localizer={localizer}
              events={events}
              startAccessor="start"
              endAccessor="end"
              style={{ height: '100%' }}
              onSelectEvent={handleSelectEvent}
              onSelectSlot={handleSelectSlot}
              selectable
              components={{
                toolbar: CalendarToolbar,
                month: {
                  dateHeader: CustomDateHeader,
                },
              }}
              eventPropGetter={eventStyleGetter}
              view={view}
              date={date}
              onView={onView}
              onNavigate={onNavigate}
              popup
            />
          </div>
        </div>
      </div>

      {isModalOpen && (
        <EventFormModal
          onClose={() => {
            setIsModalOpen(false);
            setSelectedEvent(null);
          }}
          onSave={handleSave}
          onDelete={selectedEvent?.event_id ? handleDeleteClick : null}
          initialEvent={selectedEvent}
        />
      )}

      <ConfirmationModal
        isOpen={showConfirmDelete}
        onClose={() => setShowConfirmDelete(false)}
        onConfirm={handleDeleteConfirm}
        title="Delete Event"
        message="Are you sure you want to delete this event? This action cannot be undone."
        confirmText="Delete"
        cancelText="Cancel"
        isDangerous={true}
      />

      <SuccessModal
        isOpen={showSuccess}
        onClose={() => setShowSuccess(false)}
        message={successMessage}
      />
    </>
  );
};

export default CalendarPage;
