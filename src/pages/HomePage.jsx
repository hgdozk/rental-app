import { useNavigate } from 'react-router-dom';
import { useState, useEffect } from "react";
import Header from "../components/Header";
import AuthModal from "../components/AuthModal";
import transaction from "../assets/icons/transaction.png";
import sear from "../assets/icons/sear.png";
import people from "../assets/icons/people.png";
import inspection from "../assets/icons/inspection.png";
import arr from "../assets/icons/arr.png"
import "leaflet/dist/leaflet.css";

import { MapContainer, TileLayer, Marker } from "react-leaflet";
import L from "leaflet";
import room1 from "../assets/photos/room1.png";
import room2 from "../assets/photos/room2.png";
import room3 from "../assets/photos/room3.png";
import room4 from "../assets/photos/room4.png";
import room5 from "../assets/photos/room5.png";
import room6 from "../assets/photos/room6.png";
import bed from "../assets/icons/bed.png";
import bath from "../assets/icons/bath.png";
import wifi from "../assets/icons/wifi.png";
import "react-date-range/dist/styles.css";
import "react-date-range/dist/theme/default.css";
import { DateRange } from "react-date-range";
import carIcon from "../assets/icons/car.png";
import disabledIcon from "../assets/icons/disabled.png";
import elevatorIcon from "../assets/icons/elevator.png";
import dishwasherIcon from "../assets/icons/dishwasher.png";
import washIcon from "../assets/icons/wash.png";
import { getCurrentUser, getLikes, saveLikes, logout, getProperties } from "../services/auth";

import heart from "../assets/icons/heart.png";
import "../styles/pages/home-page.css";
const rooms = [room1, room2, room3, room4, room5, room6];

const getPropertiesData = () => {
  const saved = getProperties();
  if (saved && saved.length > 0) {
    return saved.map(p => ({
      id: p.id,
      title: p.title,
      img: p.images?.[0] || room1,
      price: `€${p.price}`,
      bedrooms: p.bedrooms,
      bathrooms: p.bathrooms,
      hasWifi: p.features?.wifi || true,
      meta: p.meta || p.location,
      description: p.description,
      location: p.location,
      type: p.type || "rent",
      category: p.category || "apartment"
    }));
  }
  return [
    { 
      id: 0, 
      title: "Rhoncus suspendisse penatibus mauris, sit non", 
      img: room1,
      price: "€3490",
      bedrooms: 1,
      bathrooms: 1,
      hasWifi: true,
      meta: "City view | 3rd floor | Elevator | Parking",
      type: "rent",
      category: "apartment"
    },
    { 
      id: 1, 
      title: "Modern apartment in city center", 
      img: room2,
      price: "€4200",
      bedrooms: 2,
      bathrooms: 1,
      hasWifi: true,
      meta: "City view | 5th floor | Elevator | Parking",
      type: "rent",
      category: "apartment"
    },
    { 
      id: 2, 
      title: "Cozy studio near park", 
      img: room3,
      price: "€2800",
      bedrooms: 1,
      bathrooms: 1,
      hasWifi: true,
      meta: "Park view | 2nd floor | Parking",
      type: "rent",
      category: "apartment"
    },
    { 
      id: 3, 
      title: "Luxury penthouse with view", 
      img: room4,
      price: "€8900",
      bedrooms: 3,
      bathrooms: 2,
      hasWifi: true,
      meta: "Panoramic view | Top floor | Elevator | Parking",
      type: "rent",
      category: "apartment"
    },
    { 
      id: 4, 
      title: "Family house with garden", 
      img: room5,
      price: "€5500",
      bedrooms: 4,
      bathrooms: 2,
      hasWifi: true,
      meta: "Garden view | Ground floor | Parking",
      type: "rent",
      category: "house"
    },
    { 
      id: 5, 
      title: "Downtown loft", 
      img: room6,
      price: "€3700",
      bedrooms: 2,
      bathrooms: 1,
      hasWifi: true,
      meta: "City center | 4th floor | Elevator",
      type: "rent",
      category: "apartment"
    },
  ];
};

export default function App() {
  
const [showAuth, setShowAuth] = useState(false);
const [currentUser, setCurrentUser] = useState(null);
const [likedProperties, setLikedProperties] = useState([]);
const [allProperties, setAllProperties] = useState([]);
const navigate = useNavigate();
const [peopleCount, SetPeopleCount] = useState(1);
const [showCalendar, setShowCalendar] = useState(false);

const [showFilters, setShowFilters] = useState(false);
const [catalogFilter, setCatalogFilter] = useState("all");

const [filters, setFilters] = useState({
  bedrooms: null,
  bathrooms: null,
  parking: false,
  elevator: false,
  dishwasher: false,
  washing: false,
  disabled: false,
});
const [dateRange, setDateRange] = useState([
{
  startDate: new Date(),
  endDate: new Date(),
  key: "selection",
},
]);

useEffect(() => {
  const user = getCurrentUser();
  setCurrentUser(user);
  if (user) {
    const likes = getLikes();
    setLikedProperties(likes[user.id] || []);
  }
  
  const properties = getPropertiesData();
  setAllProperties(properties);
}, []);

const toggleLike = (property) => {
  if (!currentUser) {
    setShowAuth(true);
    return;
  }

  const isLiked = likedProperties.some(p => p.id === property.id);
  
  let updatedLikes;
  if (isLiked) {
    updatedLikes = likedProperties.filter(p => p.id !== property.id);
  } else {
    updatedLikes = [...likedProperties, property];
  }
  
  setLikedProperties(updatedLikes);
  
  const allLikes = getLikes();
  allLikes[currentUser.id] = updatedLikes;
  saveLikes(allLikes);
};

const handleLogout = () => {
  logout();
  setCurrentUser(null);
  setLikedProperties([]);
  navigate("/");
};

const removeFilter = (key) => {
  setFilters(prev => ({
    ...prev,
    [key]: key === "bedrooms" || key === "bathrooms" ? null : false
  }));
};

const getFilteredProperties = () => {
  let properties = [...allProperties];
  
  if (catalogFilter !== "all") {
    properties = properties.filter(p => {
      if (catalogFilter === "apartment") {
        return p.category === "apartment" || p.title?.toLowerCase().includes("квартир") || p.title?.toLowerCase().includes("apartment");
      }
      if (catalogFilter === "house") {
        return p.category === "house" || p.title?.toLowerCase().includes("дом") || p.title?.toLowerCase().includes("house");
      }
      if (catalogFilter === "commercial") {
        return p.category === "commercial" || p.title?.toLowerCase().includes("отель") || p.title?.toLowerCase().includes("номер") || p.title?.toLowerCase().includes("hotel");
      }
      if (catalogFilter === "rent") {
        return p.type === "rent";
      }
      return true;
    });
  }
  
  if (filters.bedrooms) {
    properties = properties.filter(p => p.bedrooms === filters.bedrooms);
  }
  if (filters.bathrooms) {
    properties = properties.filter(p => p.bathrooms === filters.bathrooms);
  }
  if (filters.parking) {
    properties = properties.filter(p => p.meta?.toLowerCase().includes("parking") || p.features?.parking);
  }
  if (filters.elevator) {
    properties = properties.filter(p => p.meta?.toLowerCase().includes("elevator") || p.features?.elevator);
  }
  if (filters.dishwasher) {
    properties = properties.filter(p => p.meta?.toLowerCase().includes("dishwasher") || p.features?.dishwasher);
  }
  if (filters.washing) {
    properties = properties.filter(p => p.meta?.toLowerCase().includes("washing") || p.features?.washingMachine);
  }
  if (filters.disabled) {
    properties = properties.filter(p => p.meta?.toLowerCase().includes("disabled") || p.features?.disabledAccess);
  }
  
  return properties;
};

const filteredProperties = getFilteredProperties();

const createCustomIcon = (count) => {
  return L.divIcon({
    html: `<div class="map-marker">${count}</div>`,
    className: "",
    iconSize: [40, 40],
  });
};

const points = [
  { id: 1, position: [53.9, 27.5667], count: 1 },
  { id: 2, position: [53.91, 27.55], count: 1 },
  { id: 3, position: [53.92, 27.58], count: 1 },

];

  return (
    <>
      <Header 
        currentUser={currentUser} 
        onAuthClick={() => setShowAuth(true)} 
        onLogout={handleLogout}
      />
      {showAuth && <AuthModal onClose={() => setShowAuth(false)} onLogin={(user) => {
        setCurrentUser(user);
        const likes = getLikes();
        setLikedProperties(likes[user.id] || []);
      }} />}
      
      <div className="rent-search">
        <div className="rent-box">
          <div className="rent-grid">
            <div className="rent-item">
              <img src={sear} />
              <span>Select a city</span>
            </div>
            <div className="rent-divider"></div>
            <div className="rent-item">
              <img src={transaction} />
              <select className="rent-select">
                <option>Тип сделки</option>
                <option>Аренда</option>
                <option>Продажа</option>
                <option>Посуточно</option>
              </select>
            </div>
            <div className="rent-divider"></div>
            <div className="rent-item" onClick={() => setShowCalendar(prev => !prev)}>
              <img src={inspection} />
              <span>
                {dateRange[0].startDate.toLocaleDateString()} - {dateRange[0].endDate.toLocaleDateString()}
              </span>
            </div>
            {showCalendar && (
              <div className="calendar-wrapper">
                <div className="calendar-close" onClick={() => setShowCalendar(false)}>✕</div>
                <DateRange onChange={(item) => setDateRange([item.selection])} ranges={dateRange} months={2} direction="horizontal" />
              </div>
            )}
            <div className="rent-divider"></div>
            <div className="rent-item">
              <img src={people} />
              <span>Guests</span>
              <div className="rent-counter">  
                <button onClick={() => SetPeopleCount(prev => (prev > 1) ? prev-1 : prev)}>-</button>
                <span>{peopleCount}</span>
                <button onClick={() => SetPeopleCount(prev => prev +1)}>+</button>
              </div>
            </div>
            <button className="rent-btn">Search</button>
          </div>
        </div>
        
        <div className="rent-filters">
          <div className="rent-filter-btn" onClick={() => setShowFilters(true)}>
            <button>More filters</button>
            <img src={arr} />
          </div>
          
          {showFilters && (
            <div className="filters-modal">
              <div className="filters-box">
                <div className="filters-close" onClick={() => setShowFilters(false)}>✕</div>
                <div className="filter-row">
                  <img src={bed} />
                  <span>Bedrooms:</span>
                  <div className="filter-options">
                    {["studio", 1, 2, 3].map((b) => (
                      <span key={b} className={filters.bedrooms === b ? "active" : ""} onClick={() => setFilters(prev => ({ ...prev, bedrooms: b }))}>{b}</span>
                    ))}
                  </div>
                </div>
                <div className="filter-row">
                  <img src={bath} />
                  <span>Bathrooms:</span>
                  <div className="filter-options">
                    {[1, 2, 3].map((b) => (
                      <span key={b} className={filters.bathrooms === b ? "active" : ""} onClick={() => setFilters(prev => ({ ...prev, bathrooms: b }))}>{b}</span>
                    ))}
                  </div>
                </div>
                {[
                  { key: "disabled", label: "Disabled access", icon: disabledIcon },
                  { key: "parking", label: "Parking", icon: carIcon },
                  { key: "elevator", label: "Elevator", icon: elevatorIcon },
                  { key: "dishwasher", label: "Dishwasher", icon: dishwasherIcon },
                  { key: "washing", label: "Washing machine", icon: washIcon },
                ].map((item) => (
                  <div key={item.key} className={`filter-row ${filters[item.key] ? "active" : ""}`} onClick={() => setFilters(prev => ({ ...prev, [item.key]: !prev[item.key] }))}>
                    <img src={item.icon} /> 
                    <span>{item.label}</span>
                  </div>
                ))}
              </div>
            </div>
          )}
          
          <div className="rent-active-list">
            {Object.entries(filters).map(([key, value]) => {
              if (!value) return null;
              const config = {
                parking: { label: "Parking", icon: carIcon },
                elevator: { label: "Elevator", icon: elevatorIcon },
                dishwasher: { label: "Dishwasher", icon: dishwasherIcon },
                washing: { label: "Washing machine", icon: washIcon },
                disabled: { label: "Disabled access", icon: disabledIcon },
                bedrooms: { label: `Bedrooms: ${value}`, icon: bed },
                bathrooms: { label: `Bathrooms: ${value}`, icon: bath },
              };
              const item = config[key];
              if (!item) return null;
              return (
                <div className="rent-active" key={key}>
                  <img src={item.icon} />
                  {item.label}
                  <span className="remove" onClick={() => removeFilter(key)}>✕</span>
                </div>
              );
            })}
          </div>
          <div className="rent-sort">Sort by: <span>Availability</span></div>
        </div>

        <div className="rent-results">
          {filteredProperties.length} results for {catalogFilter !== "all" ? catalogFilter : "all properties"}
        </div>
      </div>

      <div className="rent-layout">
        <div className="rent-list">
          {filteredProperties.map((property) => (
            <div className="rent-card" key={property.id}>
              <div className="rent-card-image" style={{ position: 'relative' }}>
                <img 
                  src={heart} 
                  className={`card-like ${likedProperties.some(p => p.id === property.id) ? "active" : ""}`}
                  onClick={() => toggleLike(property)}
                  style={{ cursor: 'pointer', position: 'absolute', top: '10px', right: '10px', zIndex: 10, width: '24px' }}
                  alt="like"
                />
                <img src={property.img} className="rent-img" style={{ width: '100%', height: '180px', objectFit: 'cover' }} />
              </div>
              <div className="rent-info">
                <h3>{property.title}</h3>
                <div className="rent-icons">
                  <div><img src={bed} alt="bed" /> {property.bedrooms} bedroom</div>
                  <div><img src={bath} alt="bath" /> {property.bathrooms} bath</div>
                  <div><img src={wifi} alt="wifi" /> WiFi</div>
                </div>
                <div className="rent-meta">
                  {property.meta}
                </div>
                <div className="rent-bottom">
                  <span className="badge" onClick={() => navigate(`/property/${property.id}`)} style={{ cursor: 'pointer' }}>Подробнее</span>
                  <span className="price">from {property.price} /month</span>
                </div>
              </div>
            </div>
          ))}
          <button className="more-btn" onClick={() => navigate("/all")}>
            Show more apartments
          </button>
        </div>
        
        <div className="map">
          <MapContainer center={[53.9, 27.5667]} zoom={12} style={{ height: "100%", width: "100%" }}> 
            <TileLayer url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png" />
            {points.map((p) => (
              <Marker key={p.id} position={p.position} icon={createCustomIcon(p.count)} />
            ))}
          </MapContainer>
        </div>
      </div>
    </>
  )
}