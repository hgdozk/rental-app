import { useState, useEffect } from "react";
import logo from "../assets/icons/logo.png";
import phone from "../assets/icons/phone.png";
import search from "../assets/icons/search.png";
import cart from "../assets/icons/cart.png";
import chat from "../assets/icons/chat.png";
import heart from "../assets/icons/heart.png";
import profile from "../assets/icons/profile.png";

import img1 from "../assets/photos/photo1.png";
import img2 from "../assets/photos/photo2.png";
import img3 from "../assets/photos/photo3.png";
import img4 from "../assets/photos/photo4.png";
import img5 from "../assets/photos/photo5.png";
import img6 from "../assets/photos/photo6.png";
import img7 from "../assets/photos/photo7.png";



import "react-date-range/dist/styles.css";
import "react-date-range/dist/theme/default.css";
import "../styles/pages/properties.css";
import "../styles/pages/property.css";

export default function Properties() {
  const images = [img1, img2, img3, img4, img5, img6, img7];

  const [current, setCurrent] = useState(0);
  const [progress, setProgress] = useState(0);

  const [guests, setGuests] = useState(1);
  const basePrice = 3990;

  const [showCalendar, setShowCalendar] = useState(false);

  const [dateRange, setDateRange] = useState([
    {
      startDate: new Date(),
      endDate: new Date(),
      key: "selection",
    },
  ]);

  useEffect(() => {
    const slide = setInterval(() => {
      setCurrent((prev) => (prev + 1) % images.length);
      setProgress(0);
    }, 4000);

    const prog = setInterval(() => {
      setProgress((p) => (p >= 100 ? 0 : p + 2));
    }, 80);

    return () => {
      clearInterval(slide);
      clearInterval(prog);
    };
  }, []);

  const visibleImages = [];
  for (let i = 0; i < 5; i++) {
    visibleImages.push(images[(current + i) % images.length]);
  }

  const totalPrice = basePrice * guests;

  return (
    <>
      <div className="header">
        <header className="header">
          <div className="header-top">
            <div className="left">
              <img src={logo} className="logo" />
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
                  <span>Пн–Пт: 9:00 – 18:00</span>
                  <span>Сб: 10:00 – 16:00</span>
                  <span>Вс: выходной</span>
                  <span className="address">г. Минск, торфяная, 35</span>
                </div>

                <span className="address">г. Минск, торфяная, 35</span>
              </div>
            </div>

            <div className="right">
              <div className="phones">
                <span>Для регионов: 8 (800) 777-21-20</span>
                <br />
                <span>Минск: 8 (831) 235-00-25</span>
              </div>

              <div className="phone-circle">
                <img src={phone} />
              </div>
            </div>
          </div>

          <div className="yellow-line"></div>

          <div className="header-bottom">
            <nav className="nav">
              <a href="#">О нас</a>
              <a href="#">Медиа</a>
              <a href="#">Сервис</a>
              <a href="#">Новости</a>
              <a href="#">Контакты</a>
            </nav>

            <div className="actions">
              <div className="search">
                <input type="text" />
                <img src={search} />
              </div>

              <img src={cart} />
              <img src={chat} />
              <img src={profile} />
              <img src={heart} />
            </div>
          </div>
        </header>
      </div>

      <div className="property">

        <div className="gallery">

          <div className="main-image">
            <img src={visibleImages[0]} />
            <button className="view-btn">View more photos</button>
          </div>

          <div className="side-images">
            {visibleImages.slice(1).map((img, i) => (
              <img key={i} src={img} />
            ))}
          </div>

          <div className="progress-bar">
            <div
              className="progress"
              style={{ width: `${progress}%` }}
            />
          </div>
        </div>

        <div className="property-grid">
          <div className="property-info">
            <h1>Rhoncus suspendisse</h1>
            <p className="location">London, Notting Hill</p>

            <div className="features 1">
              <span>🛏 2 bedroom</span>
              <span>🛁 2 bath</span>
              
            </div>
            <div className="features 2">
              <span>500 sq.ft</span>
              <span>City view</span>
              <span>3rd floor</span>
              <span>Elevator</span>
            </div>
            <h2>Description</h2>
            <p>
              A truly global city, London has long been considered a cutting-edge metropolis.
            </p>

            <h3>In sed</h3>
            <p>In nullam eget urna suspendisse odio nunc.</p>

            <h3>Adipiscing risus</h3>
            <p>Laoreet risus accumsan pellentesque lacus.</p>
          </div>

          <div className="booking">
            <h2>£{totalPrice} / Month</h2>

            <div className="dates">
              <div onClick={() => setShowCalendar(true)}>
                Move in
                <span>
                  {dateRange[0].startDate.toLocaleDateString()}
                </span>
              </div>

              <div onClick={() => setShowCalendar(true)}>
                Move out
                <span>
                  {dateRange[0].endDate.toLocaleDateString()}
                </span>
              </div>
            </div>

            {showCalendar && (
              <div className="calendar">
                <div
                  className="close"
                  onClick={() => setShowCalendar(false)}
                >
                  ✕
                </div>

                <DateRange
                  onChange={(item) =>
                    setDateRange([item.selection])
                  }
                  ranges={dateRange}
                  months={2}
                  direction="horizontal"
                />
              </div>
            )}

            <div className="guests">
              Guests
              <button
                onClick={() =>
                  setGuests((g) => (g > 1 ? g - 1 : g))
                }
              >
                -
              </button>

              <span>{guests}</span>

              <button onClick={() => setGuests((g) => g + 1)}>
                +
              </button>
            </div>

            <p>All utilities are included</p>

            <div className="price">
              <div>
                Average monthly rent
                <span>£{basePrice}</span>
              </div>

              <div>
                Pay upon booking
                <span>£{(totalPrice * 0.999).toFixed(2)}</span>
              </div>

              <div>
                Total costs
                <span>£{(totalPrice * 1.003).toFixed(2)}</span>
              </div>
            </div>

            <button className="book-btn">
              Continue booking
            </button>

            <p className="note">
              When you book this apartment, your reservation will be confirmed instantly
            </p>
          </div>
        </div>

        <div className="amenities">
          <h2>Amenities</h2>

          <div className="amenities-grid">
            <div>TV</div>
            <div>Fridge</div>
            <div>Washing machine</div>

            <div>Fireplace</div>
            <div>Kettle</div>
            <div>Dryer</div>

            <div>Phone</div>
            <div>Coffee machine</div>
            <div>Iron</div>

            <div>Work desk</div>
            <div>Dishes</div>
            <div>Wardrobe</div>
          </div>
        </div>

        <div className="neighbourhood">
          <h2>Neighbourhood</h2>

          <p>
            Ultricies etiam sit auctor aenean donec nunc, elementum etiam nisl.
          </p>

          <p>
            Molestie amet, pretium eu massa a, pharetra.
          </p>
        </div>

      </div>
    </>
  );
}