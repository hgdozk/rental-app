import { useState, useEffect, useRef } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { DateRange } from "react-date-range";
import { MapContainer, TileLayer, Marker } from "react-leaflet";
import Header from "../components/Header";
import {
  getCurrentUser,
  getProperties,
  createBooking,
  getUserBookings,
  saveUserBookings,
  checkPropertyAvailability,
  getPropertyBookedDates,
} from "../services/auth";

import "react-date-range/dist/styles.css";
import "react-date-range/dist/theme/default.css";
import "leaflet/dist/leaflet.css";
import "../styles/pages/property-details.css";
import "../styles/pages/property.css";
import "../styles/components/header.css";

import bedIcon from "../assets/icons/bed.png";
import bathIcon from "../assets/icons/bath.png";
import wifiIcon from "../assets/icons/wifi.png";
import cityIcon from "../assets/icons/city.png";
import carIcon from "../assets/icons/car.png";
import elevatorIcon from "../assets/icons/elevator.png";
import dishwasherIcon from "../assets/icons/dishwasher.png";
import washIcon from "../assets/icons/wash.png";
import disabledIcon from "../assets/icons/disabled.png";
import smokeIcon from "../assets/icons/smoke.png";
import petIcon from "../assets/icons/pet.png";
import partyIcon from "../assets/icons/party.png";
import clockIcon from "../assets/icons/clock.png";
import tvIcon from "../assets/icons/tv.png";
import fridgeIcon from "../assets/icons/fridge.png";
import fireIcon from "../assets/icons/fire.png";
import chainikIcon from "../assets/icons/chainik.png";
import phineIcon from "../assets/icons/phine.png";
import coffeeIcon from "../assets/icons/coffee.png";
import ironIcon from "../assets/icons/iron.png";
import deskIcon from "../assets/icons/desck.png";
import wardrobeIcon from "../assets/icons/wardrobe.png";

const AMENITY_ICONS = {
  "Телевизор": tvIcon,
  "Холодильник": fridgeIcon,
  "Стиральная машина": washIcon,
  "Камин": fireIcon,
  "Чайник": chainikIcon,
  "Телефон": phineIcon,
  "Кофемашина": coffeeIcon,
  "Утюг": ironIcon,
  "Рабочий стол": deskIcon,
  "Шкаф": wardrobeIcon,
  TV: tvIcon,
  Fridge: fridgeIcon,
  "Washing machine": washIcon,
  Fireplace: fireIcon,
  Kettle: chainikIcon,
  Phone: phineIcon,
  "Coffee machine": coffeeIcon,
  Iron: ironIcon,
  "Work desk": deskIcon,
  Wardrobe: wardrobeIcon,
};

const DEFAULT_AMENITIES = ["Телевизор", "WiFi", "Кухня", "Отопление", "Стиральная машина", "Сушилка"];

const DEFAULT_HOUSE_RULES = {
  noSmoking: "Курение в помещении запрещено",
  petsAllowed: "Питомцы приветствуются с предварительного одобрения",
  noParties: "Вечеринки и мероприятия не разрешены",
  quietHours: "22:00 - 08:00",
};

const DEFAULT_SAFETY = {
  enhancedCleaning: "Профессиональная уборка между заездами",
  handSanitizer: "Доступен в общих зонах",
  masksAvailable: "Для гостей по запросу",
  socialDistancing: "Соблюдается в общих зонах",
};

const DEFAULT_CANCELLATION = {
  freeCancellation: "До 30 дней до заезда",
  partialRefund: "Возврат 50% до 14 дней до заезда",
  noRefund: "Менее 7 дней до заезда",
};

const DEFAULT_NEIGHBOURHOOD =
  "Расположен в оживлённом районе с удобным доступом к общественному транспорту, магазинам, ресторанам и паркам.";

const RULE_ITEMS = [
  { key: "noSmoking", icon: smokeIcon, title: "Нет курения" },
  { key: "petsAllowed", icon: petIcon, title: "Можно с питомцами" },
  { key: "noParties", icon: partyIcon, title: "Нет вечеринок" },
  { key: "quietHours", icon: clockIcon, title: "Тихий час" },
];

const SAFETY_ITEMS = [
  { key: "enhancedCleaning", mark: "✓", title: "Усиленная уборка" },
  { key: "handSanitizer", mark: "✓", title: "Антисептик" },
  { key: "masksAvailable", mark: "✓", title: "Маски" },
  { key: "socialDistancing", mark: "✓", title: "Социальная дистанция" },
];

const CANCEL_ITEMS = [
  { key: "freeCancellation", mark: "✓", title: "Бесплатная отмена" },
  { key: "partialRefund", mark: "✓", title: "Частичный возврат" },
  { key: "noRefund", mark: "✗", title: "Без возврата" },
];

const SERVICE_FEE_RATE = 0.1;
const MS_PER_DAY = 1000 * 60 * 60 * 24;
const DEFAULT_MAX_GUESTS = 10;

const pluralize = (n, one, few, many) => {
  const mod10 = n % 10;
  const mod100 = n % 100;
  if (mod10 === 1 && mod100 !== 11) return one;
  if (mod10 >= 2 && mod10 <= 4 && (mod100 < 12 || mod100 > 14)) return few;
  return many;
};

const startOfDay = (date) => {
  const d = new Date(date);
  d.setHours(0, 0, 0, 0);
  return d;
};

const expandBookings = (bookings) => {
  const days = [];
  bookings.forEach((booking) => {
    const current = new Date(booking.startDate);
    const end = new Date(booking.endDate);
    while (current <= end) {
      days.push(new Date(current));
      current.setDate(current.getDate() + 1);
    }
  });
  return days;
};

export default function PropertyDetails() {
  const { id } = useParams();
  const navigate = useNavigate();

  const [currentUser, setCurrentUser] = useState(null);
  const [property, setProperty] = useState(null);
  const [guests, setGuests] = useState(1);
  const [showCalendar, setShowCalendar] = useState(false);
  // null — галерея закрыта, число — индекс открытого фото
  const [lightboxIndex, setLightboxIndex] = useState(null);
  const [showBookingModal, setShowBookingModal] = useState(false);
  const [bookedDates, setBookedDates] = useState([]);
  const calendarRef = useRef(null);
  const [bookingForm, setBookingForm] = useState({
    name: "",
    phone: "",
    email: "",
    message: "",
    paymentMethod: "cash",
  });
  const [dateRange, setDateRange] = useState([
    { startDate: new Date(), endDate: new Date(), key: "selection" },
  ]);

  useEffect(() => {
    const handleClickOutside = (event) => {
      if (calendarRef.current && !calendarRef.current.contains(event.target)) {
        setShowCalendar(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  useEffect(() => {
    const user = getCurrentUser();
    setCurrentUser(user);

    const found = getProperties().find((p) => p.id === Number(id));
    if (!found) {
      navigate("/");
      return;
    }

    setProperty(found);
    setBookedDates(expandBookings(getPropertyBookedDates(found.id)));

    if (user) {
      setBookingForm((prev) => ({
        ...prev,
        name: `${user.firstName} ${user.lastName}`,
        email: user.email,
      }));
    }
  }, [id, navigate]);

  // Галерея: клавиатура (Esc, ←, →) и блокировка прокрутки страницы
  useEffect(() => {
    if (lightboxIndex === null) return;
    const total = property?.images?.length || 0;
    if (total === 0) return;

    const onKeyDown = (e) => {
      if (e.key === "Escape") setLightboxIndex(null);
      if (e.key === "ArrowRight") setLightboxIndex((i) => (i + 1) % total);
      if (e.key === "ArrowLeft") setLightboxIndex((i) => (i - 1 + total) % total);
    };

    window.addEventListener("keydown", onKeyDown);
    const prevOverflow = document.body.style.overflow;
    document.body.style.overflow = "hidden";

    return () => {
      window.removeEventListener("keydown", onKeyDown);
      document.body.style.overflow = prevOverflow;
    };
  }, [lightboxIndex === null, property]); // eslint-disable-line react-hooks/exhaustive-deps

  const [startDate, endDate] = [dateRange[0].startDate, dateRange[0].endDate];
  const daysCount = Math.max(
    1,
    Math.ceil((startOfDay(endDate) - startOfDay(startDate)) / MS_PER_DAY)
  );
  const totalPrice = property ? Number(property.price) * daysCount * guests : 0;
  const serviceFee = totalPrice * SERVICE_FEE_RATE;
  const totalWithFee = totalPrice + serviceFee;
  const canInstantBook = daysCount <= 14;

  const maxGuests = Number(property?.maxGuests) || DEFAULT_MAX_GUESTS;
  const increaseGuests = () => setGuests((g) => Math.min(maxGuests, g + 1));
  const decreaseGuests = () => setGuests((g) => Math.max(1, g - 1));

  const isRangeFree = () =>
    checkPropertyAvailability(property.id, startDate, endDate);

  const buildBooking = (overrides) => ({
    id: Date.now(),
    propertyId: property.id,
    propertyTitle: property.title,
    propertyImage: property.images?.[0],
    propertyPrice: property.price,
    propertyLocation: property.location,
    realtorId: property.realtorId,
    realtorName: property.realtorName,
    userId: currentUser.id,
    startDate,
    endDate,
    guests,
    totalPrice: totalWithFee,
    paymentMethod: bookingForm.paymentMethod,
    createdAt: new Date().toISOString(),
    ...overrides,
  });

  const handleInstantBooking = () => {
    if (!currentUser) {
      alert("Пожалуйста, войдите в систему для бронирования");
      navigate("/");
      return;
    }
    if (!isRangeFree()) {
      alert("Извините, выбранные даты уже заняты. Пожалуйста, выберите другие даты.");
      return;
    }
    setShowBookingModal(true);
  };

  const handleRequestBooking = () => {
    if (!currentUser) {
      alert("Пожалуйста, войдите в систему для отправки заявки");
      navigate("/");
      return;
    }
    if (!isRangeFree()) {
      alert("Извините, выбранные даты уже заняты. Пожалуйста, выберите другие даты.");
      return;
    }

    createBooking(
      buildBooking({
        userName: `${currentUser.firstName} ${currentUser.lastName}`,
        userPhone: bookingForm.phone,
        userEmail: bookingForm.email,
        status: "pending",
        type: "request",
        message: bookingForm.message,
      })
    );
    alert("Заявка на бронирование отправлена! Риелтор свяжется с вами.");
  };

  const submitBooking = () => {
    if (!bookingForm.name || !bookingForm.phone || !bookingForm.email) {
      alert("Пожалуйста, заполните все поля");
      return;
    }
    if (!isRangeFree()) {
      alert("Извините, выбранные даты уже заняты. Пожалуйста, выберите другие даты.");
      setShowBookingModal(false);
      return;
    }

    const booking = buildBooking({
      userName: bookingForm.name,
      userPhone: bookingForm.phone,
      userEmail: bookingForm.email,
      status: "confirmed",
      type: "instant",
      message: bookingForm.message,
    });

    createBooking(booking);
    saveUserBookings([...getUserBookings(), booking]);
    setBookedDates(expandBookings(getPropertyBookedDates(property.id)));

    alert("Бронирование подтверждено! Детали сохранены в Моих бронированиях.");
    setShowBookingModal(false);
  };

  if (!property) return <div className="loading">Загрузка...</div>;

  const photos = property.images || [];
  const sideTiles = photos.slice(1, 4); // до 3 маленьких фото справа
  const hiddenCount = Math.max(0, photos.length - 4);

  const openLightbox = (index) => setLightboxIndex(index);
  const closeLightbox = () => setLightboxIndex(null);
  const showPrev = () => setLightboxIndex((i) => (i - 1 + photos.length) % photos.length);
  const showNext = () => setLightboxIndex((i) => (i + 1) % photos.length);

  const rules = property.houseRules ?? DEFAULT_HOUSE_RULES;
  const safety = property.safetyMeasures ?? DEFAULT_SAFETY;
  const cancellation = property.cancellationPolicy ?? DEFAULT_CANCELLATION;
  const neighbourhoodText = property.neighbourhoodDescription || DEFAULT_NEIGHBOURHOOD;
  const amenities = property.amenities?.length ? property.amenities : DEFAULT_AMENITIES;

  const dealTypeText = {
    rent: "Долгосрочная аренда",
    daily: "Посуточная аренда",
    sale: "Продажа",
  }[property.dealType] || "Аренда";

  const guestsWord = pluralize(guests, "гость", "гостя", "гостей");
  const bedroomsWord = pluralize(property.bedrooms, "спальня", "спальни", "спален");
  const bathroomsWord = pluralize(property.bathrooms, "ванная", "ванные", "ванных");

  const featureTags = property.features
    ? [
        property.features.cityView && { icon: cityIcon, text: "Вид на город" },
        property.features.floor && { icon: null, text: property.features.floor },
        property.features.elevator && { icon: elevatorIcon, text: "Лифт" },
        property.features.parking && { icon: carIcon, text: "Парковка" },
        property.features.dishwasher && { icon: dishwasherIcon, text: "Посудомоечная машина" },
        property.features.washingMachine && { icon: washIcon, text: "Стиральная машина" },
        property.features.disabledAccess && { icon: disabledIcon, text: "Доступ для инвалидов" },
      ].filter(Boolean)
    : [];

  return (
    <>
      <Header
        currentUser={currentUser}
        onAuthClick={() => {}}
        onLogout={() => setCurrentUser(null)}
      />

      <div className="property">
        {/* ---------- ГАЛЕРЕЯ ---------- */}
        {photos.length === 0 ? (
          <div className="gallery-grid gallery-grid--empty">Фотографий пока нет</div>
        ) : (
          <div className={`gallery-grid${sideTiles.length === 0 ? " gallery-grid--single" : ""}`}>
            <button
              type="button"
              className="gallery-tile gallery-main"
              onClick={() => openLightbox(0)}
              aria-label="Открыть фото 1"
            >
              <img src={photos[0]} alt={property.title} />
            </button>

            {sideTiles.length > 0 && (
              <div className={`gallery-side gallery-side--${sideTiles.length}`}>
                {sideTiles.map((src, i) => {
                  const index = i + 1;
                  const isLast = i === sideTiles.length - 1;
                  return (
                    <button
                      type="button"
                      key={index}
                      className="gallery-tile"
                      onClick={() => openLightbox(index)}
                      aria-label={`Открыть фото ${index + 1}`}
                    >
                      <img src={src} alt={`${property.title} — фото ${index + 1}`} />
                      {isLast && hiddenCount > 0 && (
                        <span className="more-photos-overlay">+{hiddenCount}</span>
                      )}
                    </button>
                  );
                })}
              </div>
            )}

            {photos.length > 1 && (
              <button type="button" className="view-all-btn" onClick={() => openLightbox(0)}>
                Показать все фото ({photos.length})
              </button>
            )}
          </div>
        )}

        <div className="property-grid">
          <div className="property-info">
            <h1>{property.title}</h1>
            <p className="location">{property.location}</p>
            <p className="deal-type-badge">{dealTypeText}</p>

            <div className="features-row">
              <div className="feature-item">
                <img src={bedIcon} alt="" />
                <span>{property.bedrooms} {bedroomsWord}</span>
              </div>
              <div className="feature-item">
                <img src={bathIcon} alt="" />
                <span>{property.bathrooms} {bathroomsWord}</span>
              </div>
              {property.sqft && (
                <div className="feature-item">
                  <span>📐</span>
                  <span>{property.sqft} кв.м</span>
                </div>
              )}
              <div className="feature-item">
                <img src={wifiIcon} alt="" />
                <span>WiFi</span>
              </div>
            </div>

            <h2>Описание</h2>
            <p className="description-text">
              {property.description || "Прекрасная недвижимость в отличном месте. Идеально подходит для вашего проживания."}
            </p>

            {featureTags.length > 0 && (
              <>
                <h2>Особенности</h2>
                <div className="features-list">
                  {featureTags.map((tag) => (
                    <div key={tag.text} className="feature-tag">
                      {tag.icon && <img src={tag.icon} alt="" />} {tag.text}
                    </div>
                  ))}
                </div>
              </>
            )}
          </div>

          <div className="booking">
            <div className="booking-price-block">
              <span className="booking-price-amount">€{totalPrice.toFixed(2)}</span>
              <br />
              <span className="booking-price-period">
                ({property.price}€ × {daysCount} сут × {guests} {guestsWord})
              </span>
            </div>

            <div className="booking-dates-row">
              <div className="booking-date-field" onClick={() => setShowCalendar(true)}>
                <span className="booking-date-label">Заезд</span>
                <span className="booking-date-value">{startDate.toLocaleDateString("ru-RU")}</span>
              </div>
              <div className="booking-date-field" onClick={() => setShowCalendar(true)}>
                <span className="booking-date-label">Выезд</span>
                <span className="booking-date-value">{endDate.toLocaleDateString("ru-RU")}</span>
              </div>
            </div>

            {showCalendar && (
              <div className="booking-calendar-popup" ref={calendarRef}>
                <div className="booking-calendar-header">
                  <span>Выберите даты</span>
                  <button className="booking-calendar-close" onClick={() => setShowCalendar(false)}>✕</button>
                </div>
                <DateRange
                  onChange={(item) => setDateRange([item.selection])}
                  ranges={dateRange}
                  months={2}
                  direction="horizontal"
                  disabledDates={bookedDates}
                />
                <div className="booking-calendar-legend">
                  <span className="legend-booked"></span>
                  Уже забронировано
                </div>
              </div>
            )}

            <div className="guests-box">
              <div className="guests-info">
                <span className="guests-title">Гости</span>
                <span className="guests-hint">максимум {maxGuests}</span>
              </div>
              <div className="guests-stepper">
                <button
                  type="button"
                  className="guests-btn"
                  onClick={decreaseGuests}
                  disabled={guests <= 1}
                  aria-label="Уменьшить количество гостей"
                >
                  −
                </button>
                <span className="guests-count" aria-live="polite">{guests}</span>
                <button
                  type="button"
                  className="guests-btn"
                  onClick={increaseGuests}
                  disabled={guests >= maxGuests}
                  aria-label="Увеличить количество гостей"
                >
                  +
                </button>
              </div>
            </div>

            <div className="booking-divider-line"></div>

            <div className="booking-cost-details">
              <div className="booking-cost-row">
                <span>
                  €{property.price} × {daysCount} сут × {guests} {guestsWord}
                </span>
                <span className="price-value">€{totalPrice.toFixed(2)}</span>
              </div>
              <div className="booking-cost-row">
                <span>Сервисный сбор (10%)</span>
                <span className="price-value">€{serviceFee.toFixed(2)}</span>
              </div>
              <div className="booking-cost-row total">
                <span>Итого</span>
                <span className="price-value total-price">€{totalWithFee.toFixed(2)}</span>
              </div>
            </div>

            <div className="booking-action-block">
              {canInstantBook ? (
                <button onClick={handleInstantBooking} className="booking-btn-primary">
                  Продолжить бронирование
                </button>
              ) : (
                <button onClick={handleRequestBooking} className="booking-btn-secondary">
                  Оставить заявку
                </button>
              )}
              <p className="booking-action-note">
                {canInstantBook ? "Мгновенное подтверждение" : "Риелтор свяжется с вами"}
              </p>
            </div>
          </div>
        </div>

        <div className="full-width-section amenities-section">
          <div className="full-width-container">
            <h2 className="section-title">Удобства</h2>
            <div className="amenities-full-grid">
              {amenities.map((amenity) => (
                <div key={amenity} className="amenity-full-card">
                  {AMENITY_ICONS[amenity] ? (
                    <img src={AMENITY_ICONS[amenity]} alt={amenity} />
                  ) : (
                    <span className="amenity-default-icon-large">✓</span>
                  )}
                  <span>{amenity}</span>
                </div>
              ))}
            </div>
          </div>
        </div>

        <div className="full-width-section neighbourhood-section">
          <div className="full-width-container">
            <h2 className="section-title">Район</h2>
            <p className="neighbourhood-full-text">{neighbourhoodText}</p>
          </div>
        </div>

        {property.lat && property.lng && (
          <div className="full-width-section map-section">
            <div className="full-width-container">
              <h2 className="section-title">Расположение на карте</h2>
              <div className="property-map-full">
                <MapContainer
                  center={[property.lat, property.lng]}
                  zoom={15}
                  style={{ height: "100%", width: "100%" }}
                >
                  <TileLayer url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png" />
                  <Marker position={[property.lat, property.lng]} />
                </MapContainer>
              </div>
            </div>
          </div>
        )}

        <div className="full-width-section policy-section">
          <div className="full-width-container">
            <h2 className="section-title">Детали политики</h2>
            <div className="policy-full-three-columns">
              <div className="policy-full-column">
                <h3>Правила дома</h3>
                {RULE_ITEMS.map((rule) => (
                  <div key={rule.key} className="policy-full-item">
                    <div className="policy-full-icon">
                      <img src={rule.icon} alt={rule.title} />
                    </div>
                    <div className="policy-full-text">
                      <strong>{rule.title}</strong>
                      <p>{rules[rule.key]}</p>
                    </div>
                  </div>
                ))}
              </div>

              <div className="policy-full-column">
                <h3>Здоровье и безопасность</h3>
                {SAFETY_ITEMS.map((item) => (
                  <div key={item.key} className="policy-full-item">
                    <div className="policy-full-text">
                      <strong><span>{item.mark}</span> {item.title}</strong>
                      <p>{safety[item.key]}</p>
                    </div>
                  </div>
                ))}
              </div>

              <div className="policy-full-column">
                <h3>Политика отмены</h3>
                {CANCEL_ITEMS.map((item) => (
                  <div key={item.key} className="policy-full-item">
                    <div className="policy-full-text">
                      <strong><span>{item.mark}</span> {item.title}</strong>
                      <p>{cancellation[item.key]}</p>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      </div>

      {showBookingModal && (
        <div className="modal-overlay" onClick={() => setShowBookingModal(false)}>
          <div className="booking-modal" onClick={(e) => e.stopPropagation()}>
            <button className="modal-close-btn" onClick={() => setShowBookingModal(false)}>✕</button>
            <h2>Подтверждение бронирования</h2>
            <div className="booking-modal-content">
              <div className="booking-modal-property">
                <img src={photos[0]} alt={property.title} />
                <div>
                  <h4>{property.title}</h4>
                  <p>{property.location}</p>
                  <p>€{property.price} / сутки</p>
                </div>
              </div>

              <div className="booking-modal-dates">
                <div>
                  <label>Заезд</label>
                  <span>{startDate.toLocaleDateString("ru-RU")}</span>
                </div>
                <div>
                  <label>Выезд</label>
                  <span>{endDate.toLocaleDateString("ru-RU")}</span>
                </div>
                <div>
                  <label>Гостей</label>
                  <span>{guests}</span>
                </div>
                <div>
                  <label>Суток</label>
                  <span>{daysCount}</span>
                </div>
              </div>

              <div className="booking-modal-price">
                <div>
                  <span>Стоимость проживания</span>
                  <span>€{totalPrice.toFixed(2)}</span>
                </div>
                <div>
                  <span>Сервисный сбор (10%)</span>
                  <span>€{serviceFee.toFixed(2)}</span>
                </div>
                <div className="total">
                  <span>Итого</span>
                  <span>€{totalWithFee.toFixed(2)}</span>
                </div>
              </div>

              <div className="booking-form">
                <div className="form-group">
                  <label>Ваше имя *</label>
                  <input
                    type="text"
                    value={bookingForm.name}
                    onChange={(e) => setBookingForm({ ...bookingForm, name: e.target.value })}
                    placeholder="Имя и фамилия"
                  />
                </div>
                <div className="form-group">
                  <label>Телефон *</label>
                  <input
                    type="tel"
                    value={bookingForm.phone}
                    onChange={(e) => setBookingForm({ ...bookingForm, phone: e.target.value })}
                    placeholder="+7 (XXX) XXX-XX-XX"
                  />
                </div>
                <div className="form-group">
                  <label>Email *</label>
                  <input
                    type="email"
                    value={bookingForm.email}
                    onChange={(e) => setBookingForm({ ...bookingForm, email: e.target.value })}
                    placeholder="example@mail.com"
                  />
                </div>
                <div className="form-group">
                  <label>Сообщение (необязательно)</label>
                  <textarea
                    rows="3"
                    value={bookingForm.message}
                    onChange={(e) => setBookingForm({ ...bookingForm, message: e.target.value })}
                    placeholder="Ваши пожелания или вопросы..."
                  />
                </div>
                <button onClick={submitBooking} className="submit-booking-btn">
                  Подтвердить бронирование
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {lightboxIndex !== null && photos.length > 0 && (
        <div className="lightbox" onClick={closeLightbox} role="dialog" aria-modal="true">
          <div className="lightbox-top" onClick={(e) => e.stopPropagation()}>
            <span>{lightboxIndex + 1} / {photos.length}</span>
            <button
              type="button"
              className="lightbox-close"
              onClick={closeLightbox}
              aria-label="Закрыть галерею"
            >
              ✕
            </button>
          </div>

          <div className="lightbox-stage">
            {photos.length > 1 && (
              <button
                type="button"
                className="lightbox-nav prev"
                onClick={(e) => { e.stopPropagation(); showPrev(); }}
                aria-label="Предыдущее фото"
              >
                ‹
              </button>
            )}

            <img
              src={photos[lightboxIndex]}
              alt={`${property.title} — фото ${lightboxIndex + 1}`}
              onClick={(e) => e.stopPropagation()}
            />

            {photos.length > 1 && (
              <button
                type="button"
                className="lightbox-nav next"
                onClick={(e) => { e.stopPropagation(); showNext(); }}
                aria-label="Следующее фото"
              >
                ›
              </button>
            )}
          </div>

          {photos.length > 1 && (
            <div className="lightbox-thumbs" onClick={(e) => e.stopPropagation()}>
              {photos.map((src, idx) => (
                <button
                  type="button"
                  key={idx}
                  className={`lightbox-thumb${idx === lightboxIndex ? " active" : ""}`}
                  onClick={() => setLightboxIndex(idx)}
                  ref={
                    idx === lightboxIndex
                      ? (el) => el?.scrollIntoView({ block: "nearest", inline: "center" })
                      : null
                  }
                  aria-label={`Фото ${idx + 1}`}
                >
                  <img src={src} alt="" />
                </button>
              ))}
            </div>
          )}
        </div>
      )}
    </>
  );
}