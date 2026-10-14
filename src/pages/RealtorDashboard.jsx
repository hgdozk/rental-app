import { useState, useEffect, useRef } from "react";
import { useNavigate } from 'react-router-dom';
import Header from "../components/Header";
import AuthModal from "../components/AuthModal";
import Calendar from 'react-calendar';
import 'react-calendar/dist/Calendar.css';
import {
  getCurrentUser,
  getProperties,
  saveProperties,
  getBookings,
  saveBookings,
  createChat,
  completeBooking,
  deleteBooking,
  getCompletedDeals,
  getRatings,
  addRating,
  getRealtorRatings,
  getRealtorAverageRating
} from "../services/auth";
import "../styles/pages/calendar.css";
import "../styles/pages/realtor-dashboard.css";

export default function RealtorDashboard() {
  const navigate = useNavigate();
  const [currentUser, setCurrentUser] = useState(null);
  const [showAuth, setShowAuth] = useState(false);
  const [myProperties, setMyProperties] = useState([]);
  const [bookings, setBookings] = useState([]);
  const [completedDeals, setCompletedDeals] = useState([]);
  const [showCalendar, setShowCalendar] = useState(false);
  const [selectedDate, setSelectedDate] = useState(new Date());
  const [selectedProperty, setSelectedProperty] = useState(null);
  const [showReportModal, setShowReportModal] = useState(false);
  const [reportData, setReportData] = useState({ dealAmount: "", notes: "", files: [], fileData: [] });
  const [chatMessages, setChatMessages] = useState({});
  const [showDropdown, setShowDropdown] = useState(false);
  const [activeSection, setActiveSection] = useState("properties");
  const [calendarEvents, setCalendarEvents] = useState([]);
  const [showNoteModal, setShowNoteModal] = useState(false);
  const [noteText, setNoteText] = useState("");
  const [selectedCalendarDate, setSelectedCalendarDate] = useState(null);
  const [selectedEvent, setSelectedEvent] = useState(null);
  const [showEventModal, setShowEventModal] = useState(false);
  const calendarRef = useRef(null);

  const [showRatingModal, setShowRatingModal] = useState(false);
  const [completedDealForRating, setCompletedDealForRating] = useState(null);
  const [selectedRating, setSelectedRating] = useState(0);
  const [ratingComment, setRatingComment] = useState("");
  const [showViewRatingModal, setShowViewRatingModal] = useState(false);
  const [selectedRatingToView, setSelectedRatingToView] = useState(null);

  const isDealRated = (dealId) => {
    const ratings = getRatings();
    return ratings.some(r => r.dealId === dealId);
  };

  const getRatingForDeal = (dealId) => {
    const ratings = getRatings();
    return ratings.find(r => r.dealId === dealId);
  };

  const requestRating = (deal) => {
    if (isDealRated(deal.id)) {
      alert("Эта сделка уже оценена");
      return;
    }

    const ratingRequests = JSON.parse(localStorage.getItem("ratingRequests") || "{}");
    ratingRequests[deal.id] = {
      dealId: deal.id,
      realtorId: currentUser.id,
      realtorName: `${currentUser.firstName} ${currentUser.lastName}`,
      clientEmail: deal.userEmail,
      clientName: deal.userName,
      propertyTitle: deal.propertyTitle,
      expiresAt: Date.now() + 7 * 24 * 60 * 60 * 1000
    };
    localStorage.setItem("ratingRequests", JSON.stringify(ratingRequests));

    setCompletedDealForRating(deal);
    setShowRatingModal(true);
  };

  const copyRatingLink = () => {
    const link = `${window.location.origin}/rate-realtor/${completedDealForRating.id}`;
    navigator.clipboard.writeText(link);
    alert("Ссылка для оценки скопирована! Отправьте её клиенту.");
  };

  const submitRating = () => {
    if (selectedRating === 0) {
      alert("Пожалуйста, выберите оценку");
      return;
    }

    addRating({
      realtorId: completedDealForRating.realtorId,
      userId: completedDealForRating.userId,
      userName: completedDealForRating.userName,
      dealId: completedDealForRating.id,
      propertyTitle: completedDealForRating.propertyTitle,
      rating: selectedRating,
      comment: ratingComment
    });

    alert("Спасибо за вашу оценку!");
    setShowRatingModal(false);
    setSelectedRating(0);
    setRatingComment("");
    setCompletedDealForRating(null);

    const allCompleted = getCompletedDeals();
    const userCompleted = allCompleted.filter(d => d.realtorId === currentUser.id);
    setCompletedDeals(userCompleted);
  };

  const viewRating = (dealId) => {
    const rating = getRatingForDeal(dealId);
    if (rating) {
      setSelectedRatingToView(rating);
      setShowViewRatingModal(true);
    }
  };

  useEffect(() => {
    const user = getCurrentUser();
    if (!user || user.role !== "realtor") {
      navigate("/");
      return;
    }
    setCurrentUser(user);

    const allProperties = getProperties();
    const userProperties = allProperties.filter(p => p.realtorId === user.id);
    setMyProperties(userProperties);

    const allBookings = getBookings();
    const userBookings = allBookings.filter(b => b.realtorId === user.id);
    setBookings(userBookings);

    const allCompleted = getCompletedDeals();
    const userCompleted = allCompleted.filter(d => d.realtorId === user.id);
    setCompletedDeals(userCompleted);

    const savedEvents = localStorage.getItem(`calendarEvents_${user.id}`);
    if (savedEvents) {
      setCalendarEvents(JSON.parse(savedEvents));
    }

    const savedChats = localStorage.getItem(`chats_${user.id}`);
    if (savedChats) {
      setChatMessages(JSON.parse(savedChats));
    }
  }, [navigate]);

  const deleteProperty = (propertyId) => {
    if (window.confirm("Вы уверены, что хотите удалить это объявление?")) {
      const allProperties = getProperties();
      const updatedProperties = allProperties.filter(p => p.id !== propertyId);
      saveProperties(updatedProperties);
      setMyProperties(myProperties.filter(p => p.id !== propertyId));
      alert("Объявление удалено!");
    }
  };

  const updateBookingStatus = (bookingId, status) => {
    const allBookings = getBookings();
    const updatedBookings = allBookings.map(b =>
      b.id === bookingId ? { ...b, status } : b
    );
    saveBookings(updatedBookings);
    setBookings(updatedBookings.filter(b => b.realtorId === currentUser?.id));
  };

  const addToCalendar = (booking) => {
    setSelectedProperty(booking);
    setShowCalendar(true);
  };

  const saveToCalendar = () => {
    const newEvent = {
      id: Date.now(),
      date: selectedDate,
      title: selectedProperty.propertyTitle,
      client: selectedProperty.userName,
      clientPhone: selectedProperty.userPhone,
      clientEmail: selectedProperty.userEmail,
      amount: selectedProperty.totalPrice,
      guests: selectedProperty.guests,
      startDate: selectedProperty.startDate,
      endDate: selectedProperty.endDate,
      notes: "",
      bookingId: selectedProperty.id,
      type: "deal"
    };

    const updatedEvents = [...calendarEvents, newEvent];
    setCalendarEvents(updatedEvents);
    localStorage.setItem(`calendarEvents_${currentUser.id}`, JSON.stringify(updatedEvents));

    setShowCalendar(false);
    alert("Событие добавлено в календарь!");
  };

  const deleteEvent = (eventId) => {
    if (window.confirm("Вы уверены, что хотите удалить это событие?")) {
      const updatedEvents = calendarEvents.filter(e => e.id !== eventId);
      setCalendarEvents(updatedEvents);
      localStorage.setItem(`calendarEvents_${currentUser.id}`, JSON.stringify(updatedEvents));
      setShowEventModal(false);
      alert("Событие удалено!");
    }
  };

  const addNoteToDate = (date) => {
    setSelectedCalendarDate(date);
    setNoteText("");
    setShowNoteModal(true);
  };

  const saveNote = () => {
    if (!noteText.trim()) return;

    const newNote = {
      id: Date.now(),
      date: selectedCalendarDate,
      title: "Заметка",
      notes: noteText,
      type: "note"
    };
    const updatedEvents = [...calendarEvents, newNote];
    setCalendarEvents(updatedEvents);
    localStorage.setItem(`calendarEvents_${currentUser.id}`, JSON.stringify(updatedEvents));

    setShowNoteModal(false);
    alert("Заметка сохранена!");
  };

  const openEventDetails = (event) => {
    setSelectedEvent(event);
    setShowEventModal(true);
  };

  const addReport = (booking) => {
    setSelectedProperty(booking);
    setReportData({ dealAmount: booking.totalPrice || "", notes: "", files: [], fileData: [] });
    setShowReportModal(true);
  };

  const handleFileUpload = (e) => {
    const files = Array.from(e.target.files);

    const readers = files.map(file => {
      return new Promise((resolve) => {
        const reader = new FileReader();
        reader.onloadend = () => {
          resolve({
            name: file.name,
            type: file.type,
            data: reader.result
          });
        };
        reader.readAsDataURL(file);
      });
    });

    Promise.all(readers).then(fileDataArray => {
      setReportData({
        ...reportData,
        files: fileDataArray.map(f => f.name),
        fileData: fileDataArray
      });
    });
  };

  const downloadFile = (fileData) => {
    if (!fileData || !fileData.data) {
      alert("Файл не найден");
      return;
    }

    const link = document.createElement('a');
    link.href = fileData.data;
    link.download = fileData.name;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  const completeDeal = () => {
    if (!selectedProperty) return;

    completeBooking(selectedProperty, {
      dealAmount: reportData.dealAmount,
      notes: reportData.notes,
      files: reportData.files,
      fileData: reportData.fileData
    }, reportData.fileData);

    setBookings(bookings.filter(b => b.id !== selectedProperty.id));
    setCompletedDeals([...completedDeals, {
      ...selectedProperty,
      report: {
        dealAmount: reportData.dealAmount,
        notes: reportData.notes,
        files: reportData.files,
        fileData: reportData.fileData
      }
    }]);

    setShowReportModal(false);
    alert("Сделка завершена! Детали сохранены в архиве.");
  };

  const deleteBookingItem = (bookingId) => {
    if (window.confirm("Вы уверены, что хотите удалить эту заявку?")) {
      deleteBooking(bookingId);
      setBookings(bookings.filter(b => b.id !== bookingId));
    }
  };

  const openChatWithUser = (booking) => {
    if (!currentUser) return;

    const newChat = createChat({
      userId: booking.userId,
      realtorId: currentUser.id,
      userName: booking.userName,
      realtorName: `${currentUser.firstName} ${currentUser.lastName}`,
      propertyId: booking.propertyId,
      propertyTitle: booking.propertyTitle
    });

    localStorage.setItem('selectedChatId', newChat.id);
    navigate("/chat");
  };

  const getEventsForDate = (date) => {
    return calendarEvents.filter(event =>
      new Date(event.date).toDateString() === date.toDateString()
    );
  };

  const tileContent = ({ date, view }) => {
    if (view === 'month') {
      const events = getEventsForDate(date);
      if (events.length > 0) {
        return (
          <div className="calendar-events-list">
            {events.slice(0, 2).map((event, idx) => (
              <div
                key={idx}
                className={`calendar-event-badge ${event.type === 'deal' ? 'deal' : 'note'}`}
                onClick={(e) => { e.stopPropagation(); openEventDetails(event); }}
              >
                {event.type === 'deal' ? 'Сделка' : 'Заметка'} - {event.title?.length > 15 ? event.title.slice(0, 15) + '...' : event.title}
              </div>
            ))}
            {events.length > 2 && (
              <div className="calendar-event-more">+{events.length - 2}</div>
            )}
          </div>
        );
      }
    }
    return null;
  };

  const sectionOptions = [
    { id: "properties", label: "Мои объявления", count: myProperties.length },
    { id: "bookings", label: "Заявки", count: bookings.length },
    { id: "calendar", label: "Календарь" },
    { id: "completed", label: "Завершенные", count: completedDeals.length }
  ];

  if (!currentUser) return null;

  return (
    <>
      <Header
        currentUser={currentUser}
        onAuthClick={() => setShowAuth(true)}
        onLogout={() => setCurrentUser(null)}
      />
      {showAuth && <AuthModal onClose={() => setShowAuth(false)} onLogin={(user) => setCurrentUser(user)} />}

      <div className="realtor-dashboard">
        <div className="dashboard-header">
          <h1>Панель риелтора</h1>
          <button onClick={() => navigate("/create-property")} className="create-btn">
            + Создать объявление
          </button>
        </div>

        <div className="dropdown-nav">
          <button className="dropdown-nav-btn" onClick={() => setShowDropdown(!showDropdown)}>
            {sectionOptions.find(s => s.id === activeSection)?.label}
            <span className="dropdown-arrow">{showDropdown ? '▲' : '▼'}</span>
          </button>
          {showDropdown && (
            <div className="dropdown-nav-menu">
              {sectionOptions.map(option => (
                <button
                  key={option.id}
                  className={`dropdown-item ${activeSection === option.id ? 'active' : ''}`}
                  onClick={() => {
                    setActiveSection(option.id);
                    setShowDropdown(false);
                  }}
                >
                  {option.label}
                  {option.count !== undefined && <span className="dropdown-count">{option.count}</span>}
                </button>
              ))}
            </div>
          )}
        </div>

        {activeSection === "properties" && (
          <div className="dashboard-section">
            <div className="properties-list">
              {myProperties.length === 0 ? (
                <div className="empty-state">
                  <p>У вас пока нет объявлений</p>
                  <button onClick={() => navigate("/create-property")} className="create-btn-small">
                    + Создать первое объявление
                  </button>
                </div>
              ) : (
                myProperties.map(property => (
                  <div key={property.id} className="property-card">
                    <img
                      src={property.images?.[0] || "https://via.placeholder.com/120x120?text=No+Image"}
                      alt={property.title}
                      className="property-card-img"
                    />
                    <div className="property-info">
                      <h3>{property.title}</h3>
                      <p className="property-location">{property.location}</p>
                      <p className="property-price">€{property.price}/мес</p>
                      <div className="property-stats">
                        <span>🛏 {property.bedrooms}</span>
                        <span>🛁 {property.bathrooms}</span>
                        {property.sqft && <span>📐 {property.sqft} sq.ft</span>}
                      </div>
                    </div>
                    <div className="property-actions">
                      <button onClick={() => navigate(`/property/${property.id}`)} className="view-btn">Просмотр</button>
                      <button onClick={() => deleteProperty(property.id)} className="delete-btn">Удалить</button>
                    </div>
                  </div>
                ))
              )}
            </div>
          </div>
        )}

        {activeSection === "bookings" && (
          <div className="dashboard-section">
            <div className="bookings-list">
              {bookings.length === 0 ? (
                <div className="empty-state">Нет активных заявок</div>
              ) : (
                bookings.map((booking) => (
                  <div key={booking.id} className="booking-card">
                    <div className="booking-header">
                      <h3>{booking.propertyTitle}</h3>
                      <span className={`status ${booking.status}`}>
                        {booking.status === "pending" ? "Ожидает" :
                         booking.status === "confirmed" ? "Подтверждено" : "Отменено"}
                      </span>
                    </div>
                    <div className="booking-details">
                      <p><strong>Клиент:</strong> {booking.userName}</p>
                      <p><strong>Телефон:</strong> {booking.userPhone || "не указан"}</p>
                      <p><strong>Email:</strong> {booking.userEmail}</p>
                      <p><strong>Дата заявки:</strong> {new Date(booking.createdAt).toLocaleDateString()}</p>

                      {booking.requestText ? (
                        <div className="booking-request">
                          <strong>Пожелания клиента:</strong>
                          <p className="request-text">{booking.requestText}</p>
                        </div>
                      ) : (
                        <p><strong>Сумма:</strong> €{booking.totalPrice}</p>
                      )}
                    </div>

                    <div className="booking-actions">
                      <button onClick={() => openChatWithUser(booking)} className="chat-btn">Чат</button>
                      <button onClick={() => deleteBookingItem(booking.id)} className="delete-btn">Удалить</button>
                    </div>

                    {booking.status === "pending" && (
                      <div className="booking-actions">
                        <button onClick={() => updateBookingStatus(booking.id, "confirmed")}>Подтвердить</button>
                        <button onClick={() => updateBookingStatus(booking.id, "cancelled")} className="cancel-btn">Отклонить</button>
                      </div>
                    )}
                    {booking.status === "confirmed" && (
                      <div className="booking-actions">
                        <button onClick={() => addToCalendar(booking)}>В календарь</button>
                        <button onClick={() => addReport(booking)}>Завершить сделку</button>
                      </div>
                    )}
                  </div>
                ))
              )}
            </div>
          </div>
        )}

        {activeSection === "calendar" && (
          <div className="dashboard-section calendar-section">
            <div className="calendar-container" ref={calendarRef}>
              <div className="calendar-header">
                <h2>Календарь событий</h2>
                <button className="calendar-close-btn" onClick={() => setActiveSection("properties")}>✕</button>
              </div>
              <Calendar
                onChange={(date) => addNoteToDate(date)}
                value={new Date()}
                tileContent={tileContent}
                className="realtor-calendar"
              />
            </div>

            <div className="events-list">
              <h3>Все события</h3>
              {calendarEvents.length === 0 ? (
                <div className="empty-state">Нет событий в календаре</div>
              ) : (
                calendarEvents
                  .sort((a, b) => new Date(a.date) - new Date(b.date))
                  .map(event => (
                    <div key={event.id} className="event-card" onClick={() => openEventDetails(event)}>
                      <div className="event-card-date">{new Date(event.date).toLocaleDateString('ru-RU', { day: 'numeric', month: 'long', year: 'numeric' })}</div>
                      <div className="event-card-content">
                        <div className="event-card-title">
                          <span className={`event-type-badge ${event.type === 'deal' ? 'deal' : 'note'}`}>
                            {event.type === 'deal' ? 'Сделка' : 'Заметка'}
                          </span>
                          <strong>{event.title}</strong>
                        </div>
                        {event.type === 'deal' && (
                          <div className="event-card-details">
                            <p>Клиент: {event.client}</p>
                            <p>Телефон: {event.clientPhone || 'не указан'}</p>
                            <p>Сумма: €{event.amount}</p>
                            <p>Гостей: {event.guests}</p>
                            <p>Объект: {event.title}</p>
                          </div>
                        )}
                        {event.notes && <p className="event-card-notes">Заметка: {event.notes}</p>}
                      </div>
                    </div>
                  ))
              )}
            </div>
          </div>
        )}

        {activeSection === "completed" && (
          <div className="dashboard-section">
            <div className="completed-list">
              {completedDeals.length === 0 ? (
                <div className="empty-state">Нет завершенных сделок</div>
              ) : (
                completedDeals.map((deal) => {
                  const report = deal.report || {};
                  const files = report.files || [];
                  const fileData = report.fileData || [];
                  const isRated = isDealRated(deal.id);

                  return (
                    <div key={deal.id} className="completed-card">
                      <div className="completed-header">
                        <div>
                          <h3>{deal.propertyTitle || 'Без названия'}</h3>
                          <p className="completed-date">Завершено: {deal.completedAt ? new Date(deal.completedAt).toLocaleDateString() : 'дата неизвестна'}</p>
                        </div>
                        <span className="status completed">Завершено</span>
                      </div>

                      <div className="completed-info-grid">
                        <div className="completed-info-item">
                          <label>Клиент</label>
                          <span>{deal.userName || 'не указан'}</span>
                        </div>
                        <div className="completed-info-item">
                          <label>Телефон</label>
                          <span>{deal.userPhone || 'не указан'}</span>
                        </div>
                        <div className="completed-info-item">
                          <label>Email</label>
                          <span>{deal.userEmail || 'не указан'}</span>
                        </div>
                      </div>

                      {deal.requestText && (
                        <div className="completed-request">
                          <label>Пожелания клиента:</label>
                          <p className="request-text">{deal.requestText}</p>
                        </div>
                      )}

                      <div className="completed-info-grid">
                        <div className="completed-info-item">
                          <label>Сумма сделки</label>
                          <span className="completed-amount">€{report.dealAmount || deal.totalPrice || '—'}</span>
                        </div>
                      </div>

                      {report.notes && (
                        <div className="completed-notes">
                          <label>Заметки по сделке</label>
                          <p>{report.notes}</p>
                        </div>
                      )}

                      {files.length > 0 && (
                        <div className="completed-files">
                          <label>Прикрепленные файлы</label>
                          <div className="files-list">
                            {files.map((file, i) => (
                              <div key={i} className="file-item">
                                <span>{typeof file === 'string' ? file : file.name || 'Файл'}</span>
                                <button
                                  className="download-btn"
                                  onClick={() => {
                                    const fileDataItem = fileData[i];
                                    if (fileDataItem && fileDataItem.data) {
                                      const link = document.createElement('a');
                                      link.href = fileDataItem.data;
                                      link.download = fileDataItem.name || 'file';
                                      document.body.appendChild(link);
                                      link.click();
                                      document.body.removeChild(link);
                                    } else {
                                      alert("Файл не найден");
                                    }
                                  }}
                                >
                                  Скачать
                                </button>
                              </div>
                            ))}
                          </div>
                        </div>
                      )}

                      {isRated && (
                        <div className="rating-done-area">
                          <div className="rating-done">✅ Оценка получена</div>
                          <button onClick={() => viewRating(deal.id)} className="view-rating-btn">
                            Посмотреть отзыв
                          </button>
                        </div>
                      )}
                    </div>
                  );
                })
              )}
            </div>
          </div>
        )}
      </div>

      {showCalendar && (
        <div className="modal-overlay" onClick={() => setShowCalendar(false)}>
          <div className="modal-content" onClick={(e) => e.stopPropagation()}>
            <h3>Добавить в календарь</h3>
            <div className="form-group">
              <label>Дата встречи</label>
              <input
                type="date"
                value={selectedDate.toISOString().split('T')[0]}
                onChange={(e) => setSelectedDate(new Date(e.target.value))}
              />
            </div>
            <div className="modal-actions">
              <button onClick={saveToCalendar}>Добавить</button>
              <button onClick={() => setShowCalendar(false)}>Отмена</button>
            </div>
          </div>
        </div>
      )}

      {showNoteModal && (
        <div className="modal-overlay" onClick={() => setShowNoteModal(false)}>
          <div className="modal-content" onClick={(e) => e.stopPropagation()}>
            <h3>Добавить заметку на {selectedCalendarDate?.toLocaleDateString()}</h3>
            <textarea
              rows="4"
              value={noteText}
              onChange={(e) => setNoteText(e.target.value)}
              placeholder="Введите заметку..."
            />
            <div className="modal-actions">
              <button onClick={saveNote}>Сохранить</button>
              <button onClick={() => setShowNoteModal(false)}>Отмена</button>
            </div>
          </div>
        </div>
      )}

      {showEventModal && selectedEvent && (
        <div className="modal-overlay" onClick={() => setShowEventModal(false)}>
          <div className="modal-content event-details-modal" onClick={(e) => e.stopPropagation()}>
            <h3>{selectedEvent.title}</h3>
            <div className="event-details">
              <p><strong>Дата:</strong> {new Date(selectedEvent.date).toLocaleDateString('ru-RU', { day: 'numeric', month: 'long', year: 'numeric' })}</p>
              {selectedEvent.type === 'deal' && (
                <>
                  <p><strong>Клиент:</strong> {selectedEvent.client}</p>
                  <p><strong>Телефон:</strong> {selectedEvent.clientPhone || 'не указан'}</p>
                  <p><strong>Email:</strong> {selectedEvent.clientEmail || 'не указан'}</p>
                  <p><strong>Сумма сделки:</strong> €{selectedEvent.amount}</p>
                  <p><strong>Количество гостей:</strong> {selectedEvent.guests}</p>
                  <p><strong>Объект:</strong> {selectedEvent.title}</p>
                </>
              )}
              {selectedEvent.notes && (
                <div className="event-notes-full">
                  <strong>Заметки:</strong>
                  <p>{selectedEvent.notes}</p>
                </div>
              )}
            </div>
            <div className="modal-actions">
              <button onClick={() => deleteEvent(selectedEvent.id)} className="delete-event-btn">Удалить</button>
              <button onClick={() => setShowEventModal(false)}>Закрыть</button>
            </div>
          </div>
        </div>
      )}

      {showRatingModal && completedDealForRating && (
        <div className="modal-overlay" onClick={() => setShowRatingModal(false)}>
          <div className="rating-link-modal" onClick={(e) => e.stopPropagation()}>
            <h2>Запросить оценку клиента</h2>

            <div className="rating-deal-info">
              <p><strong>Клиент:</strong> {completedDealForRating.userName}</p>
              <p><strong>Email:</strong> {completedDealForRating.userEmail}</p>
              <p><strong>Сделка:</strong> {completedDealForRating.propertyTitle}</p>
            </div>

            <div className="rating-link-box">
              <label>Ссылка для оценки:</label>
              <div className="link-copy-container">
                <input
                  type="text"
                  readOnly
                  value={`${window.location.origin}/rate-realtor/${completedDealForRating.id}`}
                  id="ratingLink"
                />
                <button onClick={copyRatingLink} className="copy-link-btn">
                  📋 Копировать
                </button>
              </div>
              <p className="rating-link-hint">
                Отправьте эту ссылку клиенту. Он сможет оценить вашу работу.
                Ссылка действительна 7 дней.
              </p>
            </div>

            <div className="modal-actions">
              <button onClick={() => setShowRatingModal(false)} className="cancel-btn">
                Закрыть
              </button>
            </div>
          </div>
        </div>
      )}

      {showViewRatingModal && selectedRatingToView && (
        <div className="modal-overlay" onClick={() => setShowViewRatingModal(false)}>
          <div className="view-rating-modal" onClick={(e) => e.stopPropagation()}>
            <h2>Отзыв клиента</h2>

            <div className="view-rating-stars">
              {[1, 2, 3, 4, 5].map(star => (
                <span key={star} className={`view-star ${selectedRatingToView.rating >= star ? 'active' : ''}`}>
                  ★
                </span>
              ))}
              <span className="view-rating-value">{selectedRatingToView.rating}/5</span>
            </div>

            {selectedRatingToView.comment && (
              <div className="view-rating-comment">
                <label>Комментарий:</label>
                <p>{selectedRatingToView.comment}</p>
              </div>
            )}

            <div className="view-rating-meta">
              <p><strong>Клиент:</strong> {selectedRatingToView.userName}</p>
              <p><strong>Сделка:</strong> {selectedRatingToView.propertyTitle}</p>
              <p><strong>Дата:</strong> {new Date(selectedRatingToView.createdAt).toLocaleDateString()}</p>
            </div>

            <div className="modal-actions">
              <button onClick={() => setShowViewRatingModal(false)} className="cancel-btn">
                Закрыть
              </button>
            </div>
          </div>
        </div>
      )}

      {showReportModal && (
        <div className="modal-overlay" onClick={() => setShowReportModal(false)}>
          <div className="modal-content large" onClick={(e) => e.stopPropagation()}>
            <h3>Завершить сделку</h3>
            <div className="form-group">
              <label>Сумма сделки (€)</label>
              <input
                type="number"
                value={reportData.dealAmount}
                onChange={(e) => setReportData({ ...reportData, dealAmount: e.target.value })}
              />
            </div>
            <div className="form-group">
              <label>Примечания</label>
              <textarea
                rows="4"
                value={reportData.notes}
                onChange={(e) => setReportData({ ...reportData, notes: e.target.value })}
              />
            </div>
            <div className="form-group">
              <label>Прикрепить файлы (PDF, изображения)</label>
              <input
                type="file"
                multiple
                accept=".pdf,.jpg,.jpeg,.png"
                onChange={handleFileUpload}
              />
              {reportData.files.length > 0 && (
                <div className="uploaded-files">
                  <strong>Загружено файлов: {reportData.files.length}</strong>
                  <ul>
                    {reportData.files.map((f, i) => (
                      <li key={i}>{f}</li>
                    ))}
                  </ul>
                </div>
              )}
            </div>
            <div className="modal-actions">
              <button onClick={completeDeal} className="complete-btn">Завершить сделку</button>
              <button onClick={() => setShowReportModal(false)}>Отмена</button>
            </div>
          </div>
        </div>
      )}
    </>
  );
}