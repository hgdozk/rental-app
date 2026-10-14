import { useState } from "react";
import Header from "../components/Header";
import { getUsers, getCurrentUser, getBookings, saveBookings, getRealtorAverageRating, getRealtorRatings, addRating, getRatings } from "../services/auth";
import "../styles/pages/realtors-page.css";
import "../styles/pages/realtors.css";

export default function RealtorsPage({
  currentUser,
  onAuthClick,
  onLogout,
}) {
  const users = getUsers();
  const realtors = users.filter((user) => user.role === "realtor");
  const [showRequestModal, setShowRequestModal] = useState(false);
  const [showRateModal, setShowRateModal] = useState(false);
  const [selectedRealtor, setSelectedRealtor] = useState(null);
  const [requestText, setRequestText] = useState("");
  const [selectedRating, setSelectedRating] = useState(0);
  const [ratingComment, setRatingComment] = useState("");
  const [hoverRating, setHoverRating] = useState(0);

  const renderStars = (rating) => {
    if (!rating) return null;
    const fullStars = Math.floor(rating);
    const hasHalfStar = rating % 1 >= 0.5;

    return (
      <div className="rating-stars-display">
        {'★'.repeat(fullStars)}
        {hasHalfStar && '½'}
        {'☆'.repeat(5 - Math.ceil(rating))}
        <span className="rating-value">{rating}</span>
      </div>
    );
  };

  const handleSubmitRequest = () => {
    const loggedUser = getCurrentUser();

    if (!loggedUser) {
      alert("Пожалуйста, авторизуйтесь чтобы оставить заявку");
      onAuthClick();
      return;
    }

    const newBooking = {
      id: Date.now(),
      realtorId: selectedRealtor.id,
      userId: loggedUser.id,
      userName: `${loggedUser.firstName} ${loggedUser.lastName}`,
      userEmail: loggedUser.email,
      userPhone: loggedUser.phone || "не указан",
      propertyId: null,
      propertyTitle: "Консультация с риелтором",
      startDate: new Date().toISOString(),
      endDate: new Date().toISOString(),
      guests: 1,
      totalPrice: 0,
      status: "pending",
      requestText: requestText,
      createdAt: new Date().toISOString()
    };

    const existingBookings = getBookings();
    saveBookings([...existingBookings, newBooking]);

    alert(`Заявка риелтору ${selectedRealtor.firstName} ${selectedRealtor.lastName} успешно отправлена!`);
    setShowRequestModal(false);
    setRequestText("");
    setSelectedRealtor(null);
  };

  const handleSubmitRating = () => {
    const loggedUser = getCurrentUser();

    if (!loggedUser) {
      alert("Пожалуйста, авторизуйтесь чтобы оценить");
      onAuthClick();
      return;
    }

    if (selectedRating === 0) {
      alert("Пожалуйста, выберите оценку");
      return;
    }

    const existingRatings = getRatings();
    const alreadyRated = existingRatings.some(
      r => r.realtorId === selectedRealtor.id && r.userId === loggedUser.id
    );

    if (alreadyRated) {
      alert("Вы уже оценивали этого риелтора");
      setShowRateModal(false);
      return;
    }

    addRating({
      realtorId: selectedRealtor.id,
      userId: loggedUser.id,
      userName: `${loggedUser.firstName} ${loggedUser.lastName}`,
      dealId: null,
      propertyTitle: "Общая оценка",
      rating: selectedRating,
      comment: ratingComment
    });

    alert(`Спасибо за вашу оценку риелтора ${selectedRealtor.firstName}!`);
    setShowRateModal(false);
    setSelectedRating(0);
    setRatingComment("");
    setSelectedRealtor(null);
  };

  return (
    <>
      <Header
        currentUser={currentUser}
        onAuthClick={onAuthClick}
        onLogout={onLogout}
      />

      <div className="realtors-page">
        <div className="realtors-container">
          <h1 className="realtors-title">Риелторы</h1>
          <p className="realtors-subtitle">
            Выберите специалиста и оставьте заявку на консультацию
          </p>

          {realtors.length === 0 ? (
            <p className="no-realtors">
              Пока нет зарегистрированных риелторов.
            </p>
          ) : (
            <div className="realtors-grid">
              {realtors.map((realtor) => {
                const averageRating = getRealtorAverageRating(realtor.id);
                const ratingsCount = getRealtorRatings(realtor.id).length;
                return (
                  <div key={realtor.id} className="realtor-card">
                    <div className="realtor-photo-wrapper">
                      <img
                        src={
                          realtor.photo ||
                          "https://via.placeholder.com/150?text=Photo"
                        }
                        alt={`${realtor.firstName} ${realtor.lastName}`}
                        className="realtor-photo"
                      />
                    </div>

                    <h3 className="realtor-name">
                      {realtor.firstName} {realtor.lastName}
                    </h3>

                    <p className="realtor-role">Риелтор</p>

                    <div className="realtor-rating">
                      {averageRating ? (
                        <>
                          {renderStars(parseFloat(averageRating))}
                          <span className="rating-count">
                            {ratingsCount} отзывов
                          </span>
                        </>
                      ) : (
                        <span className="no-rating">
                          Нет отзывов
                        </span>
                      )}
                    </div>

                    <p className="realtor-email">{realtor.email}</p>

                    <div className="realtor-buttons">
                      <button
                        className="contact-btn"
                        onClick={() => {
                          setSelectedRealtor(realtor);
                          setShowRequestModal(true);
                        }}
                      >
                        Оставить заявку
                      </button>
                      <button
                        className="rate-btn"
                        onClick={() => {
                          setSelectedRealtor(realtor);
                          setShowRateModal(true);
                        }}
                      >
                        Оценить
                      </button>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>
      </div>

      {showRequestModal && selectedRealtor && (
        <div className="modal-overlay" onClick={() => setShowRequestModal(false)}>
          <div className="request-modal" onClick={(e) => e.stopPropagation()}>
            <h2>Оставить заявку</h2>

            <div className="realtor-info-in-modal">
              <img
                src={selectedRealtor.photo || "https://via.placeholder.com/80?text=Photo"}
                alt={selectedRealtor.firstName}
              />
              <div>
                <h3>{selectedRealtor.firstName} {selectedRealtor.lastName}</h3>
                <p>{selectedRealtor.email}</p>
              </div>
            </div>

            <div className="user-info-in-modal">
              <h4>Ваши данные:</h4>
              {(() => {
                const user = getCurrentUser();
                if (user) {
                  return (
                    <>
                      <p><strong>Имя:</strong> {user.firstName} {user.lastName}</p>
                      <p><strong>Email:</strong> {user.email}</p>
                      <p><strong>Телефон:</strong> {user.phone || "не указан"}</p>
                    </>
                  );
                } else {
                  return <p className="warning">Для отправки заявки необходимо авторизоваться</p>;
                }
              })()}
            </div>

            <div className="form-group">
              <label>Ваше пожелание / запрос:</label>
              <textarea
                value={requestText}
                onChange={(e) => setRequestText(e.target.value)}
                placeholder="Напишите, что вас интересует, какой объект недвижимости вы ищете, и т.д."
                rows="5"
              />
            </div>

            <div className="modal-actions">
              <button
                onClick={handleSubmitRequest}
                className="submit-request-btn"
                disabled={!getCurrentUser()}
              >
                Отправить заявку
              </button>
              <button onClick={() => setShowRequestModal(false)} className="cancel-btn">
                Отмена
              </button>
            </div>
          </div>
        </div>
      )}

      {showRateModal && selectedRealtor && (
        <div className="modal-overlay" onClick={() => setShowRateModal(false)}>
          <div className="rate-modal" onClick={(e) => e.stopPropagation()}>
            <h2>Оценить риелтора</h2>

            <div className="realtor-info-in-modal">
              <img
                src={selectedRealtor.photo || "https://via.placeholder.com/80?text=Photo"}
                alt={selectedRealtor.firstName}
              />
              <div>
                <h3>{selectedRealtor.firstName} {selectedRealtor.lastName}</h3>
                <p>{selectedRealtor.email}</p>
              </div>
            </div>

            <div className="rating-section">
              <label>Ваша оценка:</label>
              <div className="rating-stars-large">
                {[1, 2, 3, 4, 5].map((star) => (
                  <span
                    key={star}
                    className={`rating-star ${(hoverRating || selectedRating) >= star ? 'active' : ''}`}
                    onClick={() => setSelectedRating(star)}
                    onMouseEnter={() => setHoverRating(star)}
                    onMouseLeave={() => setHoverRating(0)}
                  >
                    ★
                  </span>
                ))}
              </div>
            </div>

            <div className="form-group">
              <label>Комментарий (необязательно):</label>
              <textarea
                value={ratingComment}
                onChange={(e) => setRatingComment(e.target.value)}
                placeholder="Расскажите о вашем опыте работы с риелтором..."
                rows="4"
              />
            </div>

            <div className="modal-actions">
              <button
                onClick={handleSubmitRating}
                className="submit-rating-btn"
                disabled={!getCurrentUser() || selectedRating === 0}
              >
                Отправить оценку
              </button>
              <button onClick={() => setShowRateModal(false)} className="cancel-btn">
                Отмена
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
}