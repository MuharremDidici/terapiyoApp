import React, { useState } from 'react';
import FullCalendar from '@fullcalendar/react';
import dayGridPlugin from '@fullcalendar/daygrid';
import timeGridPlugin from '@fullcalendar/timegrid';
import interactionPlugin from '@fullcalendar/interaction';
import trLocale from '@fullcalendar/core/locales/tr';
import {
  PlusIcon,
  RefreshIcon,
  CogIcon
} from '@heroicons/react/outline';
import { useCalendar } from '../../hooks/useCalendar';
import LoadingSpinner from '../Common/LoadingSpinner';
import ErrorMessage from '../Common/ErrorMessage';
import EventModal from './EventModal';
import CalendarSettings from './CalendarSettings';

const Calendar = () => {
  const {
    useEvents,
    createEvent,
    updateEvent,
    deleteEvent,
    syncGoogleCalendar,
    isLoading
  } = useCalendar();

  const [currentView, setCurrentView] = useState('timeGridWeek');
  const [currentRange, setCurrentRange] = useState({
    start: new Date(),
    end: new Date()
  });

  const { data: events, isLoading: isLoadingEvents } = useEvents(
    currentRange.start,
    currentRange.end
  );

  const [showEventModal, setShowEventModal] = useState(false);
  const [showSettings, setShowSettings] = useState(false);
  const [selectedEvent, setSelectedEvent] = useState(null);
  const [selectedDate, setSelectedDate] = useState(null);

  // Tarih aralığı değiştiğinde
  const handleDatesSet = (arg) => {
    setCurrentRange({
      start: arg.start,
      end: arg.end
    });
  };

  // Etkinlik tıklandığında
  const handleEventClick = (info) => {
    setSelectedEvent(info.event);
    setShowEventModal(true);
  };

  // Boş alana tıklandığında
  const handleDateSelect = (selectInfo) => {
    setSelectedDate(selectInfo);
    setShowEventModal(true);
  };

  // Etkinlik sürükleme/boyutlandırma
  const handleEventChange = (changeInfo) => {
    const event = changeInfo.event;
    updateEvent({
      eventId: event.id,
      eventData: {
        start: event.start,
        end: event.end
      }
    });
  };

  return (
    <div className="bg-white rounded-lg shadow">
      {/* Başlık */}
      <div className="p-4 border-b flex items-center justify-between">
        <h2 className="text-lg font-medium text-gray-900">Takvim</h2>
        <div className="flex items-center space-x-2">
          <button
            onClick={() => setShowEventModal(true)}
            className="inline-flex items-center px-3 py-2 border border-transparent text-sm font-medium rounded-md shadow-sm text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
          >
            <PlusIcon className="h-4 w-4 mr-1" />
            Etkinlik Ekle
          </button>
          <button
            onClick={syncGoogleCalendar}
            disabled={isLoading.sync}
            className="inline-flex items-center px-3 py-2 border border-gray-300 text-sm font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
          >
            <RefreshIcon className="h-4 w-4 mr-1" />
            Senkronize Et
          </button>
          <button
            onClick={() => setShowSettings(true)}
            className="p-2 rounded-full text-gray-400 hover:text-gray-500 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
          >
            <CogIcon className="h-5 w-5" />
          </button>
        </div>
      </div>

      {/* Takvim */}
      <div className="p-4">
        {isLoadingEvents ? (
          <LoadingSpinner />
        ) : (
          <FullCalendar
            plugins={[dayGridPlugin, timeGridPlugin, interactionPlugin]}
            initialView={currentView}
            headerToolbar={{
              left: 'prev,next today',
              center: 'title',
              right: 'dayGridMonth,timeGridWeek,timeGridDay'
            }}
            locale={trLocale}
            events={events}
            editable={true}
            selectable={true}
            selectMirror={true}
            dayMaxEvents={true}
            weekends={true}
            datesSet={handleDatesSet}
            eventClick={handleEventClick}
            select={handleDateSelect}
            eventChange={handleEventChange}
            slotMinTime="08:00:00"
            slotMaxTime="20:00:00"
            allDaySlot={false}
            slotDuration="00:30:00"
            eventTimeFormat={{
              hour: '2-digit',
              minute: '2-digit',
              hour12: false
            }}
            buttonText={{
              today: 'Bugün',
              month: 'Ay',
              week: 'Hafta',
              day: 'Gün'
            }}
            views={{
              timeGridWeek: {
                titleFormat: { year: 'numeric', month: 'long', day: '2-digit' }
              }
            }}
          />
        )}
      </div>

      {/* Modallar */}
      <EventModal
        isOpen={showEventModal}
        onClose={() => {
          setShowEventModal(false);
          setSelectedEvent(null);
          setSelectedDate(null);
        }}
        event={selectedEvent}
        selectedDate={selectedDate}
        onSave={createEvent}
        onUpdate={updateEvent}
        onDelete={deleteEvent}
      />

      <CalendarSettings
        isOpen={showSettings}
        onClose={() => setShowSettings(false)}
      />
    </div>
  );
};

export default Calendar;
