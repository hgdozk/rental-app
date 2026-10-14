import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { DateRange } from "react-date-range";
import "react-date-range/dist/styles.css";
import "react-date-range/dist/theme/default.css";

import Header from "../components/Header";
import AuthModal from "../components/AuthModal";
import {
  getCurrentUser,
  getLikes,
  saveLikes,
  getProperties,
} from "../services/auth";

import "../styles/pages/all.css";

import searchIcon from "../assets/icons/sear.png";
import dealIcon from "../assets/icons/transaction.png";
import dateIcon from "../assets/icons/inspection.png";
import guestsIcon from "../assets/icons/people.png";
import arrowIcon from "../assets/icons/arr.png";
import heartIcon from "../assets/icons/heart.png";
import clockIcon from "../assets/icons/clock.png";
import bedIcon from "../assets/icons/bed.png";
import bathIcon from "../assets/icons/bath.png";
import wifiIcon from "../assets/icons/wifi.png";
import carIcon from "../assets/icons/car.png";
import disabledIcon from "../assets/icons/disabled.png";
import elevatorIcon from "../assets/icons/elevator.png";
import dishwasherIcon from "../assets/icons/dishwasher.png";
import washIcon from "../assets/icons/wash.png";
import fallbackImage from "../assets/photos/room1.png";

const DEAL_TYPES = ["Тип сделки", "Аренда", "Продажа"];
const BEDROOM_OPTIONS = ["studio", 1, 2, 3];
const BATHROOM_OPTIONS = [1, 2, 3];
const DEFAULT_DESCRIPTION =
  "Neque faucibus pharetra condimentum tincidunt commodo velit.";

const FEATURE_FILTERS = [
  { key: "disabled", field: "disabledAccess", label: "Disabled access", icon: disabledIcon },
  { key: "parking", field: "parking", label: "Parking", icon: carIcon },
  { key: "elevator", field: "elevator", label: "Elevator", icon: elevatorIcon },
  { key: "dishwasher", field: "dishwasher", label: "Dishwasher", icon: dishwasherIcon },
  { key: "washing", field: "washingMachine", label: "Washing machine", icon: washIcon },
];

const EMPTY_FILTERS = {
  bedrooms: null,
  bathrooms: null,
  disabled: false,
  parking: false,
  elevator: false,
  dishwasher: false,
  washing: false,
};

function matchesFilters(property, searchTerm, filters) {
  const query = searchTerm.toLowerCase();
  const title = property.title?.toLowerCase() ?? "";
  const location = property.location?.toLowerCase() ?? "";

  if (query && !title.includes(query) && !location.includes(query)) {
    return false;
  }

  if (filters.bedrooms && property.bedrooms !== filters.bedrooms) {
    return false;
  }

  if (filters.bathrooms && property.bathrooms !== filters.bathrooms) {
    return false;
  }

  return FEATURE_FILTERS.every(
    (feature) => !filters[feature.key] || property.features?.[feature.field] === true
  );
}

function getActiveTags(filters) {
  const tags = [];

  if (filters.bedrooms) {
    tags.push({ key: "bedrooms", label: `Bedrooms: ${filters.bedrooms}`, icon: bedIcon });
  }

  if (filters.bathrooms) {
    tags.push({ key: "bathrooms", label: `Bathrooms: ${filters.bathrooms}`, icon: bathIcon });
  }

  FEATURE_FILTERS.forEach((feature) => {
    if (filters[feature.key]) {
      tags.push({ key: feature.key, label: feature.label, icon: feature.icon });
    }
  });

  return tags;
}

function PropertyCard({ property, isLiked, onLike, onOpen }) {
  return (
    <div className="all-card">
      <img
        src={heartIcon}
        alt="like"
        className={`all-like ${isLiked ? "active" : ""}`}
        onClick={() => onLike(property)}
      />

      <img
        src={property.images?.[0] || fallbackImage}
        alt={property.title}
        className="all-img"
      />

      <div className="all-info">
        <h3>{property.title}</h3>

        <div className="all-icons">
          <span>
            <img src={bedIcon} alt="" /> {property.bedrooms} bedroom
          </span>
          <span>
            <img src={bathIcon} alt="" /> {property.bathrooms} bath
          </span>
          <span>
            <img src={wifiIcon} alt="" /> WiFi
          </span>
        </div>

        <div className="all-meta">{property.meta || property.location}</div>

        <p className="all-desc">{property.description || DEFAULT_DESCRIPTION}</p>

        <div className="all-footer">
          <div className="all-price">€{property.price} /month</div>
          <button className="all-btn" onClick={() => onOpen(property)}>
            Просмотреть объявление
          </button>
        </div>
      </div>
    </div>
  );
}

export default function All() {
  const navigate = useNavigate();

  const [currentUser, setCurrentUser] = useState(null);
  const [showAuth, setShowAuth] = useState(false);
  const [liked, setLiked] = useState([]);
  const [properties, setProperties] = useState([]);

  const [searchTerm, setSearchTerm] = useState("");
  const [filters, setFilters] = useState(EMPTY_FILTERS);
  const [dateRange, setDateRange] = useState([
    { startDate: new Date(), endDate: new Date(), key: "selection" },
  ]);
  const [showCalendar, setShowCalendar] = useState(false);
  const [showFilters, setShowFilters] = useState(false);
  const [guests, setGuests] = useState(1);

  useEffect(() => {
    const user = getCurrentUser();
    setCurrentUser(user);
    setProperties(getProperties());

    if (user) {
      const likes = getLikes();
      setLiked(likes[user.id] || []);
    }
  }, []);

  const isLiked = (property) => liked.some((p) => p.id === property.id);

  const handleLike = (property) => {
    if (!currentUser) {
      setShowAuth(true);
      return;
    }

    const updated = isLiked(property)
      ? liked.filter((p) => p.id !== property.id)
      : [...liked, property];

    setLiked(updated);

    const allLikes = getLikes();
    allLikes[currentUser.id] = updated;
    saveLikes(allLikes);
  };

  const handleLogin = (user) => {
    setCurrentUser(user);
    const likes = getLikes();
    setLiked(likes[user.id] || []);
  };

  const setFilter = (key, value) => {
    setFilters((prev) => ({ ...prev, [key]: value }));
  };

  const toggleFeature = (key) => {
    setFilters((prev) => ({ ...prev, [key]: !prev[key] }));
  };

  const removeFilter = (key) => {
    const emptyValue = key === "bedrooms" || key === "bathrooms" ? null : false;
    setFilter(key, emptyValue);
  };

  const visibleProperties = properties.filter((property) =>
    matchesFilters(property, searchTerm, filters)
  );

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
          onLogin={handleLogin}
        />
      )}

      <div className="rent-search">
        <div className="rent-box">
          <div className="rent-grid">
            <div className="rent-item">
              <img src={searchIcon} alt="" />
              <input
                type="text"
                placeholder="Search..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
              />
            </div>

            <div className="rent-divider"></div>

            <div className="rent-item">
              <img src={dealIcon} alt="" />
              <select className="rent-select">
                {DEAL_TYPES.map((type) => (
                  <option key={type}>{type}</option>
                ))}
              </select>
            </div>

            <div className="rent-divider"></div>

            <div
              className="rent-item"
              onClick={() => setShowCalendar(!showCalendar)}
            >
              <img src={dateIcon} alt="" />
              <span>
                {dateRange[0].startDate.toLocaleDateString()} -{" "}
                {dateRange[0].endDate.toLocaleDateString()}
              </span>
            </div>

            {showCalendar && (
              <div className="calendar-wrapper">
                <div
                  className="calendar-close"
                  onClick={() => setShowCalendar(false)}
                >
                  ✕
                </div>
                <DateRange
                  onChange={(item) => setDateRange([item.selection])}
                  ranges={dateRange}
                  months={2}
                  direction="horizontal"
                />
              </div>
            )}

            <div className="rent-divider"></div>

            <div className="rent-item">
              <img src={guestsIcon} alt="" />
              <span>Guests</span>
              <div className="rent-counter">
                <button onClick={() => setGuests((g) => Math.max(1, g - 1))}>
                  -
                </button>
                <span>{guests}</span>
                <button onClick={() => setGuests((g) => g + 1)}>+</button>
              </div>
            </div>

            <button className="rent-btn">Search</button>
          </div>
        </div>

        <div className="rent-filters">
          <div className="rent-filter-btn" onClick={() => setShowFilters(true)}>
            <button>More filters</button>
            <img src={arrowIcon} alt="" />
          </div>

          {showFilters && (
            <div className="filters-modal">
              <div className="filters-box">
                <div
                  className="filters-close"
                  onClick={() => setShowFilters(false)}
                >
                  ✕
                </div>

                <div className="filter-row">
                  <img src={bedIcon} alt="" />
                  <span>Bedrooms:</span>
                  <div className="filter-options">
                    {BEDROOM_OPTIONS.map((count) => (
                      <span
                        key={count}
                        className={filters.bedrooms === count ? "active" : ""}
                        onClick={() => setFilter("bedrooms", count)}
                      >
                        {count}
                      </span>
                    ))}
                  </div>
                </div>

                <div className="filter-row">
                  <img src={bathIcon} alt="" />
                  <span>Bathrooms:</span>
                  <div className="filter-options">
                    {BATHROOM_OPTIONS.map((count) => (
                      <span
                        key={count}
                        className={filters.bathrooms === count ? "active" : ""}
                        onClick={() => setFilter("bathrooms", count)}
                      >
                        {count}
                      </span>
                    ))}
                  </div>
                </div>

                {FEATURE_FILTERS.map((feature) => (
                  <div
                    key={feature.key}
                    className={`filter-row ${filters[feature.key] ? "active" : ""}`}
                    onClick={() => toggleFeature(feature.key)}
                  >
                    <img src={feature.icon} alt="" />
                    <span>{feature.label}</span>
                  </div>
                ))}
              </div>
            </div>
          )}

          <div className="rent-active-list">
            {getActiveTags(filters).map((tag) => (
              <div className="rent-active" key={tag.key}>
                <img src={tag.icon} alt="" />
                {tag.label}
                <span className="remove" onClick={() => removeFilter(tag.key)}>
                  ✕
                </span>
              </div>
            ))}
          </div>

          <div className="rent-sort">
            Sort by: <span>Availability</span>
          </div>
        </div>

        <div className="rent-results">{visibleProperties.length} results</div>
      </div>

      <div className="all-list">
        {visibleProperties.map((property) => (
          <PropertyCard
            key={property.id}
            property={property}
            isLiked={isLiked(property)}
            onLike={handleLike}
            onOpen={(p) => navigate(`/property/${p.id}`)}
          />
        ))}
      </div>
    </>
  );
}