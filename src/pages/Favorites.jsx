import { useState, useEffect } from "react";
import { useNavigate } from 'react-router-dom';
import Header from "../components/Header";
import AuthModal from "../components/AuthModal";
import bed from "../assets/icons/bed.png";
import bath from "../assets/icons/bath.png";
import wifi from "../assets/icons/wifi.png";
import heartIcon from "../assets/icons/heart.png";
import room1 from "../assets/photos/room1.png";


import { getCurrentUser, getLikes, saveLikes, getProperties } from "../services/auth";
import "../styles/pages/all.css";
import "../styles/pages/favorites.css";

export default function Favorites() {
  const navigate = useNavigate();
  const [currentUser, setCurrentUser] = useState(null);
  const [showAuth, setShowAuth] = useState(false);
  const [favorites, setFavorites] = useState([]);
  const [allProperties, setAllProperties] = useState([]);

  useEffect(() => {
    const user = getCurrentUser();
    setCurrentUser(user);
    
    const properties = getProperties();
    setAllProperties(properties);
    
    if (user) {
      const likes = getLikes();
      const userLikes = likes[user.id] || [];
      const fullProperties = userLikes.map(liked => {
        const fullProp = properties.find(p => p.id === liked.id);
        return fullProp || liked;
      });
      setFavorites(fullProperties);
    }
  }, []);

  const removeFromFavorites = (propertyId) => {
    if (!currentUser) return;
    
    const updatedFavorites = favorites.filter(p => p.id !== propertyId);
    setFavorites(updatedFavorites);
    
    const allLikes = getLikes();
    allLikes[currentUser.id] = updatedFavorites;
    saveLikes(allLikes);
  };

  if (!currentUser) {
    return (
      <>
        <Header currentUser={null} onAuthClick={() => setShowAuth(true)} onLogout={() => {}} />
        {showAuth && <AuthModal onClose={() => setShowAuth(false)} onLogin={(user) => {
          setCurrentUser(user);
          setShowAuth(false);
        }} />}
        <div className="favorites-container">
          <h1 className="favorites-title">Мои избранные объявления</h1>
          <div className="favorites-empty">
            <p>Войдите в систему, чтобы увидеть избранные объявления</p>
            <button onClick={() => setShowAuth(true)} className="favorites-btn">
              Войти
            </button>
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
      {showAuth && <AuthModal onClose={() => setShowAuth(false)} onLogin={(user) => {
        setCurrentUser(user);
        setShowAuth(false);
      }} />}

      <div className="favorites-container">
        <h1 className="favorites-title">Мои избранные объявления</h1>
        {favorites.length === 0 ? (
          <div className="favorites-empty">
            <p>У вас пока нет избранных объявлений</p>
            <button onClick={() => navigate("/all")} className="favorites-btn">
              Перейти к поиску
            </button>
          </div>
        ) : (
          <div className="all-list">
            {favorites.map((property) => (
              <div className="all-card" key={property.id}>
                <img
                  src={heartIcon}
                  className="all-like active"
                  onClick={() => removeFromFavorites(property.id)}
                  style={{ cursor: 'pointer' }}
                  alt="remove from favorites"
                />
                <img 
                  src={property.images?.[0] || room1}
                  className="all-img" 
                  alt={property.title}
                />
                <div className="all-info">
                  <h3>{property.title}</h3>
                  <div className="all-icons">
                    <span><img src={bed} alt="bed" /> {property.bedrooms} bedroom</span>
                    <span><img src={bath} alt="bath" /> {property.bathrooms} bath</span>
                    <span><img src={wifi} alt="wifi" /> WiFi</span>
                  </div>
                  <div className="all-meta">
                    {property.meta || property.location}
                  </div>
                  <p className="all-desc">
                    {property.description || "Neque faucibus pharetra condimentum tincidunt commodo velit."}
                  </p>
                  <div className="price">€{property.price} /month</div>
                  <button
                    className="all-btn"
                    onClick={() => navigate(`/property/${property.id}`)}
                  >
                    Просмотреть объявление
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