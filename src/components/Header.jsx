import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";

import logo from "../assets/icons/logo.png";
import phoneIcon from "../assets/icons/phone.png";
import searchIcon from "../assets/icons/search.png";
import cartIcon from "../assets/icons/cart.png";
import chatIcon from "../assets/icons/chat.png";
import heartIcon from "../assets/icons/heart.png";
import profileIcon from "../assets/icons/profile.png";

import { logout, getChatsForUser } from "../services/auth";

import "../styles/components/header.css";

const ADDRESS = "г. Минск, торфяная, 35";
const WORK_HOURS = ["Пн–Пт: 9:00 – 18:00", "Сб: 10:00 – 16:00", "Вс: выходной"];
const CATALOG_PATH = "/all";
const CATALOG_LINKS = ["Квартиры", "Дома", "Коммерческая", "Аренда"];
const NAV_LINKS = [
  { label: "Главная", path: "/" },
  { label: "Объявления", path: "/all" },
  { label: "Избранное", path: "/favorites" },
  { label: "Риелторы", path: "/realtors" },
];
const UNREAD_CHECK_MS = 3000;

function countUnread(userId) {
  const dialogs = getChatsForUser(userId);
  return dialogs.reduce((sum, dialog) => sum + (dialog.unread || 0), 0);
}

function Badge({ count, inline = false }) {
  if (count <= 0) return null;

  const text = count > 99 ? "99+" : count;
  const className = inline ? "header-badge header-badge--inline" : "header-badge";
  return <span className={className}>{text}</span>;
}

function UserMenu({ currentUser, unreadCount, onAuthClick, onLogout }) {
  const navigate = useNavigate();
  const [isOpen, setIsOpen] = useState(false);

  const goTo = (path) => {
    setIsOpen(false);
    navigate(path);
  };

  const handleLogout = () => {
    logout();
    if (onLogout) onLogout();
    goTo("/");
  };

  const handleLogin = () => {
    setIsOpen(false);
    onAuthClick();
  };

  return (
    <div className="user-menu">
      <img
        src={profileIcon}
        alt="profile"
        className="clickable"
        onClick={() => setIsOpen((open) => !open)}
      />

      {isOpen && currentUser && (
        <div className="user-dropdown">
          <div className="user-dropdown__user">
            <strong>
              {currentUser.firstName} {currentUser.lastName}
            </strong>
            <p className="user-dropdown__email">{currentUser.email}</p>
            <p className="user-dropdown__role">
              {currentUser.role === "realtor" ? "Риелтор" : "👤 Пользователь"}
            </p>
          </div>

          {currentUser.role === "realtor" && (
            <button
              type="button"
              className="user-dropdown__btn user-dropdown__btn--warning"
              onClick={() => goTo("/realtor-dashboard")}
            >
              Панель риелтора
            </button>
          )}

          <button
            type="button"
            className="user-dropdown__btn"
            onClick={() => goTo("/chat")}
          >
            Чаты
            <Badge count={unreadCount} inline />
          </button>

          <button
            type="button"
            className="user-dropdown__btn"
            onClick={() => goTo("/favorites")}
          >
            Избранное
          </button>

          <button
            type="button"
            className="user-dropdown__btn user-dropdown__btn--danger"
            onClick={handleLogout}
          >
            Выйти
          </button>
        </div>
      )}

      {isOpen && !currentUser && (
        <div className="user-dropdown user-dropdown--guest">
          <button
            type="button"
            className="user-dropdown__btn user-dropdown__btn--warning user-dropdown__btn--login"
            onClick={handleLogin}
          >
            Войти / Зарегистрироваться
          </button>
        </div>
      )}
    </div>
  );
}

export default function Header({ currentUser, onAuthClick, onLogout }) {
  const navigate = useNavigate();
  const [unreadCount, setUnreadCount] = useState(0);

  useEffect(() => {
    if (!currentUser) {
      setUnreadCount(0);
      return undefined;
    }

    const refresh = () => setUnreadCount(countUnread(currentUser.id));
    refresh();

    const timer = setInterval(refresh, UNREAD_CHECK_MS);
    return () => clearInterval(timer);
  }, [currentUser]);

  const handleLinkClick = (path) => (event) => {
    event.preventDefault();
    navigate(path);
  };

  return (
    <header className="header">
      <div className="header-top">
        <div className="left">
          <img
            src={logo}
            alt="logo"
            className="logo clickable"
            onClick={() => navigate("/")}
          />
          <div className="divider"></div>
          <span className="tagline">
            Веб-приложение для аренды и продажи недвижимости
          </span>
        </div>

        <div className="center">
          <div className="work-wrap">
            <input type="checkbox" className="work-toggle" />
            <div className="work-time">Время работы</div>
            <div className="work-dropdown">
              {WORK_HOURS.map((line) => (
                <span key={line}>{line}</span>
              ))}
              <span className="address">{ADDRESS}</span>
            </div>
            <span className="address">{ADDRESS}</span>
          </div>
        </div>

        <div className="right">
          <div className="phones">
            <span>Для регионов: 8 (800) 777-21-20</span>
            <br />
            <span>Минск: 8 (831) 235-00-25</span>
          </div>
          <div className="phone-circle">
            <img src={phoneIcon} alt="phone" />
          </div>
        </div>
      </div>

      <div className="yellow-line"></div>

      <div className="header-bottom">
        <div className="catalog-wrap">
          <input type="checkbox" className="toggle" />
          <button type="button" className="catalog-btn">
            <div className="hamburger">
              <div></div>
            </div>
            <p>Каталог</p>
          </button>
          <div className="menu">
            <div className="menu-content">
              {CATALOG_LINKS.map((label) => (
                <a key={label} href="#" onClick={handleLinkClick(CATALOG_PATH)}>
                  {label}
                </a>
              ))}
            </div>
          </div>
        </div>

        <nav className="nav">
          {NAV_LINKS.map(({ label, path }) => (
            <a key={label} href="#" onClick={handleLinkClick(path)}>
              {label}
            </a>
          ))}
        </nav>

        <div className="actions">
          <div className="search">
            <input type="text" placeholder="Поиск..." />
            <img src={searchIcon} alt="search" />
          </div>

          <img
            src={cartIcon}
            alt="cart"
            className="clickable"
            onClick={() => navigate("/cart")}
          />

          <div className="header-icon">
            <img
              src={chatIcon}
              alt="chat"
              className="clickable"
              onClick={() => navigate("/chat")}
            />
            <Badge count={unreadCount} />
          </div>

          <UserMenu
            currentUser={currentUser}
            unreadCount={unreadCount}
            onAuthClick={onAuthClick}
            onLogout={onLogout}
          />

          <img
            src={heartIcon}
            alt="favorites"
            className="like clickable"
            onClick={() => navigate("/favorites")}
          />
        </div>
      </div>
    </header>
  );
}