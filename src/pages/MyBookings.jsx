import { useNavigate } from "react-router-dom";
import { useLocalStorage } from "@uidotdev/usehooks";
import Header from "../components/Header";
import AuthModal from "../components/AuthModal";

import people from "../assets/icons/people.png";
import dateof from "../assets/icons/dateof.png";
import { useState } from "react";
import "../styles/pages/my-bookings.css";

export default function MyBookings() {
  const navigate = useNavigate();

  const [currentUser, setCurrentUser] = useLocalStorage("currentUser", null);
  const [bookings, setBookings] = useLocalStorage("userBookings", []);

  const [showAuth, setShowAuth] = useState(false);

  const userBookings = bookings.filter(
    (b) => b.userId === currentUser?.id
  );

  const cancelBooking = (bookingId) => {
    setBookings((prev) => prev.filter((b) => b.id !== bookingId));
  };

  if (!currentUser && !showAuth) {
    return (
      <>
        <Header
          currentUser={null}
          onAuthClick={() => setShowAuth(true)}
          onLogout={() => {}}
        />
        <div className="bookings-container">
          <div className="empty-state">
            <p>Войдите в систему, чтобы увидеть свои бронирования</p>
          </div>
        </div>
      </>
    );
  }

  return (
    <>
      <Header
        currentUser={currentUser}
        onAuthClick={() => setShowAuth(true)}
        onLogout={() => setCurrentUser(null)}
      />

      {showAuth && (
        <AuthModal
          onClose={() => setShowAuth(false)}
          onLogin={(user) => {
            setCurrentUser(user);
            setShowAuth(false);
          }}
        />
      )}

      <div className="bookings-container">
        <h1>Мои бронирования</h1>

        {userBookings.length === 0 ? (
          <div className="empty-state">
            <p>У вас пока нет бронирований</p>
            <button
              onClick={() => navigate("/all")}
              className="btn-primary"
            >
              Перейти к объявлениям
            </button>
          </div>
        ) : (
          <div className="bookings-grid">
            {userBookings.map((booking) => (
              <div key={booking.id} className="booking-item">
                <img
                  src={booking.propertyImage || "/placeholder.jpg"}
                  alt={booking.propertyTitle}
                />

                <div className="booking-info">
                  <h3>{booking.propertyTitle}</h3>
                  <p className="location">{booking.propertyLocation}</p>

                  <div className="booking-dates">
                    <span>
                      <img src={dateof} alt="" />
                      {new Date(booking.startDate).toLocaleDateString()} -{" "}
                      {new Date(booking.endDate).toLocaleDateString()}
                    </span>

                    <span>
                      <img src={people} alt="" />
                      {booking.guests} гостей
                    </span>
                  </div>

                  <p className="price">€{booking.totalPrice}</p>

                  <span className={`status ${booking.status}`}>
                    {booking.status === "pending"
                      ? "Ожидает подтверждения"
                      : "Подтверждено"}
                  </span>

                  <button
                    onClick={() => {
                      if (window.confirm("Вы уверены?")) {
                        cancelBooking(booking.id);
                      }
                    }}
                    className="cancel-booking-btn"
                  >
                    Отменить
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </>
  );
}