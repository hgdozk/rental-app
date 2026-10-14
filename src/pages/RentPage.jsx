import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";

import Header from "../components/Header";

import heroImg from "../assets/photos/rent-hero.png";
import office1 from "../assets/photos/office1.png";
import office2 from "../assets/photos/office2.png";
import office3 from "../assets/photos/office3.png";
import office4 from "../assets/photos/office4.png";

import calendarIcon from "../assets/icons/inspection.png";
import sofaIcon from "../assets/icons/sofa.png";
import wifiIcon from "../assets/icons/wifi.png";
import supportIcon from "../assets/icons/chat.png";
import clockIcon from "../assets/icons/clock.png";

import minsk from "../assets/photos/minsk.png";
import brest from "../assets/photos/brest.png";
import grodno from "../assets/photos/grodno.png";
import vitebsk from "../assets/photos/vitebsk.png";
import gomel from "../assets/photos/gomel.png";
import mogilev from "../assets/photos/mogilev.png";

import property1 from "../assets/photos/property1.png";
import property2 from "../assets/photos/property2.png";
import property3 from "../assets/photos/property3.png";

import "../styles/pages/rent.css";

const PROPERTIES = [
  {
    image: property1,
    title: "Skyline Residence",
    location: "Минск",
    description: "Современные апартаменты с панорамными окнами и премиальным интерьером.",
    price: "$850 / month",
  },
  {
    image: property2,
    title: "Forest Villa",
    location: "Брест",
    description: "Уютный дом с просторной территорией и дизайнерским ремонтом.",
    price: "$1200 / month",
  },
  {
    image: property3,
    title: "Minimal Loft",
    location: "Гродно",
    description: "Минималистичное пространство для жизни и удалённой работы.",
    price: "$970 / month",
  },
];

const BLOG_POSTS = [
  {
    image: "https://images.unsplash.com/photo-1560518883-ce09059eeffa",
    title: "Как изменился рынок аренды жилья в Минске",
    text: "Разбираем цены на квартиры, спрос и самые популярные районы для аренды в 2026 году.",
    time: "2 мин чтения",
  },
  {
    image: "https://images.unsplash.com/photo-1484154218962-a197022b5858",
    title: "Покупка квартиры в Беларуси: что важно знать",
    text: "Юридические нюансы, оформление документов и советы перед покупкой недвижимости.",
    time: "4 мин чтения",
  },
  {
    image: "https://images.unsplash.com/photo-1494526585095-c41746248156",
    title: "Лучшие районы Бреста для жизни",
    text: "Сравниваем инфраструктуру, стоимость жилья и транспортную доступность.",
    time: "3 мин чтения",
  },
  {
    image: "https://images.unsplash.com/photo-1460317442991-0ec209397118",
    title: "Инвестиции в недвижимость Беларуси",
    text: "Какие города сейчас наиболее перспективны для покупки жилья под аренду.",
    time: "5 мин чтения",
  },
];

const ADVANTAGES = [
  {
    icon: calendarIcon,
    title: "Гибкие условия аренды",
    text: "Подбираем недвижимость на короткий и длительный срок с удобными условиями проживания.",
  },
  {
    icon: sofaIcon,
    title: "Полностью готовое жилье",
    text: "Все объекты проходят проверку и готовы к заселению сразу после оформления.",
  },
  {
    icon: wifiIcon,
    title: "Комфорт для работы и жизни",
    text: "Квартиры и дома оснащены всем необходимым для комфортного проживания и удаленной работы.",
  },
  {
    icon: supportIcon,
    title: "Поддержка 24/7",
    text: "Наша команда всегда на связи и помогает решать любые вопросы на всех этапах.",
  },
];

const CITIES = [
  { name: "Минск", image: minsk },
  { name: "Брест", image: brest },
  { name: "Гродно", image: grodno },
  { name: "Витебск", image: vitebsk },
  { name: "Гомель", image: gomel },
  { name: "Могилев", image: mogilev },
];

const BLOG_SLIDE_WIDTH = 253;
const PROPERTY_INTERVAL_MS = 4000;
const BLOG_INTERVAL_MS = 3500;

export default function RentPage() {
  const navigate = useNavigate();

  const [currentUser, setCurrentUser] = useState(null);
  const [activeProperty, setActiveProperty] = useState(0);
  const [activeBlog, setActiveBlog] = useState(0);

  const property = PROPERTIES[activeProperty];
  const blogSlides = [...BLOG_POSTS, ...BLOG_POSTS, ...BLOG_POSTS];

  useEffect(() => {
    const timer = setInterval(() => {
      setActiveProperty((prev) => (prev === PROPERTIES.length - 1 ? 0 : prev + 1));
    }, PROPERTY_INTERVAL_MS);

    return () => clearInterval(timer);
  }, []);

  useEffect(() => {
    const timer = setInterval(() => {
      setActiveBlog((prev) => (prev === BLOG_POSTS.length - 1 ? 0 : prev + 1));
    }, BLOG_INTERVAL_MS);

    return () => clearInterval(timer);
  }, []);

  return (
    <div className="rent-page">
      <Header
        currentUser={currentUser}
        onAuthClick={() => console.log("auth")}
        onLogout={() => setCurrentUser(null)}
      />

      <section className="rent-hero">
        <img src={heroImg} className="hero-image" alt="" />

        <div className="hero-card">
          <h1>Найдите недвижимость без лишних забот</h1>
          <p>
            Мы помогаем собственникам быстро находить надежных арендаторов,
            оформлять сделки и полностью сопровождать процесс аренды.
          </p>
        </div>
      </section>

      <section className="future-section">
        <div className="future-left">
          <img src={office1} alt="" />
          <img src={office2} alt="" />
          <img src={office3} alt="" />
          <img src={office4} alt="" />
        </div>

        <div className="future-right">
          <h2>Недвижимость для современного ритма жизни</h2>
          <p>
            Работа, переезд, временное проживание или инвестиции — мы подберем
            оптимальный вариант недвижимости под ваши цели и бюджет. Все
            процессы — от поиска до оформления — берем на себя.
          </p>
        </div>
      </section>

      <section className="advantages">
        <div className="advantages-top">
          <h2>Почему выбирают именно нас</h2>
          <p className="advantages-subtitle">
            Мы создаем комфортный сервис для аренды и покупки недвижимости,
            объединяя безопасность, скорость и профессиональный подход.
          </p>
        </div>

        <div className="advantages-grid">
          {ADVANTAGES.map((item) => (
            <div className="adv-card" key={item.title}>
              <img src={item.icon} alt="" />

              <div className="adv-content">
                <h3>{item.title}</h3>
                <p>{item.text}</p>
              </div>
            </div>
          ))}
        </div>
      </section>

      <section className="locations-section">
        <h2>Выберите город</h2>

        <div className="locations-grid">
          {CITIES.map((city) => (
            <div className="location-card" key={city.name}>
              <span>{city.name}</span>
              <img src={city.image} alt="" />
            </div>
          ))}
        </div>

        <button className="locations-btn" onClick={() => navigate("/home")}>
          Смотреть все объекты
        </button>
      </section>

      <section className="estate-slider">
        <div className="estate-info">
          <div key={activeProperty} className="estate-info-content">
            <span className="estate-tag">premium property</span>
            <h2>{property.title}</h2>
            <h4>{property.location}</h4>
            <p>{property.description}</p>

            <div className="estate-actions">
              <button onClick={() => navigate("/home")}>
                Смотреть объекты
              </button>
              <span>{property.price}</span>
            </div>
          </div>

          <div className="estate-dots">
            {PROPERTIES.map((_, index) => (
              <button
                key={index}
                className={activeProperty === index ? "estate-dot active" : "estate-dot"}
                onClick={() => setActiveProperty(index)}
              />
            ))}
          </div>
        </div>

        <div className="estate-image-wrapper">
          <img
            key={activeProperty}
            src={property.image}
            className="estate-image"
            alt=""
          />
        </div>
      </section>

      <section className="blog-section">
        <div className="section-title">
          <h2>Новости недвижимости</h2>
          <p>
            Актуальные новости, аналитика и советы по недвижимости в Беларуси
          </p>
        </div>

        <div
          className="blog-slider"
          style={{ transform: `translateX(-${activeBlog * BLOG_SLIDE_WIDTH}px)` }}
        >
          {blogSlides.map((post, index) => (
            <div className="blog-card" key={index}>
              <img src={post.image} alt="" />

              <div className="blog-content">
                <h3>{post.title}</h3>
                <p>{post.text}</p>

                <span className="blog-time">
                  <img src={clockIcon} alt="" />
                  {post.time}
                </span>
              </div>
            </div>
          ))}
        </div>

        <button className="read-more-btn" onClick={() => navigate("/news")}>
          Читать ещё
        </button>
      </section>

      <footer className="rent-footer">
        <div className="footer-content">
          <div className="footer-brand">
            <h2>KVARTO</h2>
            <p>Удобная аренда и покупка недвижимости в Беларуси без лишних забот.</p>
          </div>

          <div className="footer-column">
            <h4>Навигация</h4>
            <a href="#">Главная</a>
            <a href="#">Каталог</a>
            <a href="#">О нас</a>
          </div>

          <div className="footer-column">
            <h4>Контакты</h4>
            <span>+375 (29) 777-77-77</span>
            <span>hello@kvarto.by</span>
            <span>Минск, Беларусь</span>
          </div>
        </div>

        <div className="footer-bottom">
          2026 KVARTO. Все права защищены.
        </div>
      </footer>
    </div>
  );
}