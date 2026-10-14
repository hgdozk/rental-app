import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { MapContainer, TileLayer, Marker, useMapEvents } from "react-leaflet";
import "leaflet/dist/leaflet.css";

import Header from "../components/Header";
import AuthModal from "../components/AuthModal";
import { getCurrentUser, getProperties, saveProperties } from "../services/auth";

import "../styles/pages/create-property.css";
import cityIcon from "../assets/icons/city.png";
import elevatorIcon from "../assets/icons/elevator.png";
import carIcon from "../assets/icons/car.png";
import wifiIcon from "../assets/icons/wifi.png";
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
import phoneIcon from "../assets/icons/phine.png";
import coffeeIcon from "../assets/icons/coffee.png";
import ironIcon from "../assets/icons/iron.png";
import desckIcon from "../assets/icons/desck.png";
import wardrobeIcon from "../assets/icons/wardrobe.png";


const FLOORS = [
  "1-й этаж",
  "2-й этаж",
  "3-й этаж",
  "4-й этаж",
  "5-й этаж",
  "Последний этаж",
];

const FEATURES = [
  { key: "cityView", label: "Вид на город", icon: cityIcon },
  { key: "elevator", label: "Лифт", icon: elevatorIcon },
  { key: "parking", label: "Парковка", icon: carIcon },
  { key: "wifi", label: "Wi-Fi", icon: wifiIcon },
  { key: "dishwasher", label: "Посудомоечная машина", icon: dishwasherIcon },
  { key: "washingMachine", label: "Стиральная машина", icon: washIcon },
  { key: "disabledAccess", label: "Доступ для инвалидов", icon: disabledIcon },
];

const HOUSE_RULES = [
  { key: "noSmoking", label: "Курение запрещено", icon: smokeIcon },
  { key: "petsAllowed", label: "Животные разрешены", icon: petIcon },
  { key: "noParties", label: "Вечеринки запрещены", icon: partyIcon },
  { key: "quietHours", label: "Тихие часы", icon: clockIcon },
];

const SAFETY_MEASURES = [
  { key: "enhancedCleaning", label: "Усиленная уборка" },
  { key: "handSanitizer", label: "Антисептик" },
  { key: "masksAvailable", label: "Маски" },
  { key: "socialDistancing", label: "Соблюдение дистанции" },
];

const CANCELLATION_POLICY = [
  { key: "freeCancellation", label: "✓ Бесплатная отмена" },
  { key: "partialRefund", label: "✓ Частичный возврат" },
  { key: "noRefund", label: "✗ Без возврата" },
];

const AMENITIES = [
  { name: "Телевизор", icon: tvIcon },
  { name: "Холодильник", icon: fridgeIcon },
  { name: "Стиральная машина", icon: washIcon },
  { name: "Камин", icon: fireIcon },
  { name: "Чайник", icon: chainikIcon },
  { name: "Телефон", icon: phoneIcon },
  { name: "Кофемашина", icon: coffeeIcon },
  { name: "Утюг", icon: ironIcon },
  { name: "Рабочий стол", icon: desckIcon },
  { name: "Шкаф", icon: wardrobeIcon },
];

const DEFAULT_HOUSE_RULES = {
  noSmoking: "Курение в помещении запрещено",
  petsAllowed: "Животные разрешены по предварительному согласованию",
  noParties: "Вечеринки и мероприятия запрещены",
  quietHours: "22:00 - 08:00",
};

const DEFAULT_SAFETY = {
  enhancedCleaning: "Профессиональная уборка между заездами",
  handSanitizer: "Есть в общих зонах",
  masksAvailable: "Предоставляются по запросу гостя",
  socialDistancing: "Соблюдается в общих зонах",
};

const DEFAULT_CANCELLATION = {
  freeCancellation: "До 30 дней до заезда",
  partialRefund: "Возврат 50% до 14 дней до заезда",
  noRefund: "Без возврата в течение 7 дней до заезда",
};

const DEFAULT_NEIGHBOURHOOD =
  "Район с удобным транспортом, магазинами, ресторанами и парками. Дружелюбное сообщество и всё необходимое рядом.";

const MAP_CENTER = [53.9, 27.5667];

function LocationMarker({ position, onPick }) {
  useMapEvents({
    click(e) {
      onPick(e.latlng);
    },
  });

  return position ? <Marker position={position} /> : null;
}

export default function CreateProperty() {
  const navigate = useNavigate();

  const [currentUser, setCurrentUser] = useState(null);
  const [showAuth, setShowAuth] = useState(false);

  const [photos, setPhotos] = useState([]);
  const [mapPosition, setMapPosition] = useState(null);

  const [form, setForm] = useState({
    title: "",
    address: "",
    price: "",
    bedrooms: 1,
    bathrooms: 1,
    sqft: "",
    dealType: "rent",
    description: "",
    features: {
      cityView: false,
      floor: "3-й этаж",
      elevator: false,
      parking: false,
      wifi: true,
      dishwasher: false,
      washingMachine: false,
      disabledAccess: false,
    },
    amenities: [],
    houseRules: DEFAULT_HOUSE_RULES,
    safetyMeasures: DEFAULT_SAFETY,
    cancellationPolicy: DEFAULT_CANCELLATION,
    neighbourhoodDescription: DEFAULT_NEIGHBOURHOOD,
  });

  useEffect(() => {
    const user = getCurrentUser();
    if (!user || user.role !== "realtor") {
      navigate("/");
      return;
    }
    setCurrentUser(user);
  }, [navigate]);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setForm({ ...form, [name]: value });
  };

  const toggleFeature = (key) => {
    setForm({
      ...form,
      features: { ...form.features, [key]: !form.features[key] },
    });
  };

  const changeGroupField = (group, key, value) => {
    setForm({
      ...form,
      [group]: { ...form[group], [key]: value },
    });
  };

  const toggleAmenity = (name) => {
    const list = form.amenities.includes(name)
      ? form.amenities.filter((a) => a !== name)
      : [...form.amenities, name];
    setForm({ ...form, amenities: list });
  };

  const handlePhotoUpload = (e) => {
    const files = Array.from(e.target.files);
    const newPreviews = files.map((file) => URL.createObjectURL(file));
    setPhotos([...photos, ...newPreviews]);
  };

  const removePhoto = (index) => {
    setPhotos(photos.filter((_, i) => i !== index));
  };

  const handleSubmit = (e) => {
    e.preventDefault();

    if (photos.length === 0) {
      alert("Пожалуйста, загрузите хотя бы одно фото");
      return;
    }

    const metaParts = [];
    if (form.features.cityView) metaParts.push("Вид на город");
    if (form.features.floor) metaParts.push(form.features.floor);
    if (form.features.elevator) metaParts.push("Лифт");
    if (form.features.parking) metaParts.push("Парковка");
    if (form.features.disabledAccess) metaParts.push("Доступ для инвалидов");

    const newProperty = {
      id: Date.now(),
      realtorId: currentUser.id,
      realtorName: `${currentUser.firstName} ${currentUser.lastName}`,
      images: photos,
      title: form.title,
      location: form.address,
      lat: mapPosition ? mapPosition.lat : null,
      lng: mapPosition ? mapPosition.lng : null,
      price: parseFloat(form.price),
      bedrooms: Number(form.bedrooms),
      bathrooms: Number(form.bathrooms),
      sqft: form.sqft,
      dealType: form.dealType,
      description: form.description,
      features: form.features,
      meta: metaParts.join(" | "),
      amenities: form.amenities,
      houseRules: form.houseRules,
      safetyMeasures: form.safetyMeasures,
      cancellationPolicy: form.cancellationPolicy,
      neighbourhoodDescription: form.neighbourhoodDescription,
      createdAt: new Date().toISOString(),
      status: "active",
    };

    const all = getProperties();
    all.push(newProperty);
    saveProperties(all);

    alert("Объявление успешно создано!");
    navigate("/realtor-dashboard");
  };

  if (!currentUser) return null;

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
          onLogin={(user) => setCurrentUser(user)}
        />
      )}

      <div className="create-property">
        <h1>Создание объявления</h1>

        <form onSubmit={handleSubmit} className="property-form">
          <div className="form-section">
            <h2>Фотографии</h2>
            <input
              type="file"
              multiple
              accept="image/*"
              onChange={handlePhotoUpload}
              className="file-input"
            />
            <p className="upload-hint">Можно выбрать несколько файлов</p>

            <div className="image-previews">
              {photos.map((src, index) => (
                <div key={index} className="image-preview">
                  <img src={src} alt={`Фото ${index + 1}`} />
                  <button
                    type="button"
                    className="remove-image-btn"
                    onClick={() => removePhoto(index)}
                  >
                    ✕
                  </button>
                </div>
              ))}
            </div>
          </div>

          <div className="form-section">
            <h2>Основная информация</h2>

            <div className="form-group">
              <label>Название объявления *</label>
              <input
                type="text"
                name="title"
                value={form.title}
                onChange={handleChange}
                required
              />
            </div>

            <div className="form-group">
              <label>Адрес *</label>
              <input
                type="text"
                name="address"
                value={form.address}
                onChange={handleChange}
                placeholder="Введите адрес объекта"
                required
              />
            </div>

            <div className="form-group">
              <label>Точка на карте (нажмите, чтобы указать место)</label>
              <div className="map-box">
                <MapContainer center={MAP_CENTER} zoom={12} className="map">
                  <TileLayer url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png" />
                  <LocationMarker position={mapPosition} onPick={setMapPosition} />
                </MapContainer>
              </div>
              {mapPosition && (
                <p className="coords">
                  Координаты: {mapPosition.lat.toFixed(4)},{" "}
                  {mapPosition.lng.toFixed(4)}
                </p>
              )}
            </div>

            <div className="form-row">
              <div className="form-group">
                <label>Тип сделки *</label>
                <select
                  name="dealType"
                  value={form.dealType}
                  onChange={handleChange}
                  required
                >
                  <option value="rent">Аренда (долгосрочная)</option>
                  <option value="daily">Аренда посуточно</option>
                  <option value="sale">Продажа</option>
                </select>
              </div>

              <div className="form-group">
                <label>Цена (€/месяц) *</label>
                <input
                  type="number"
                  name="price"
                  value={form.price}
                  onChange={handleChange}
                  required
                />
              </div>
            </div>

            <div className="form-row">
              <div className="form-group">
                <label>Спальни</label>
                <input
                  type="number"
                  name="bedrooms"
                  min="1"
                  max="10"
                  value={form.bedrooms}
                  onChange={handleChange}
                />
              </div>

              <div className="form-group">
                <label>Ванные</label>
                <input
                  type="number"
                  name="bathrooms"
                  min="1"
                  max="10"
                  value={form.bathrooms}
                  onChange={handleChange}
                />
              </div>

              <div className="form-group">
                <label>Площадь (кв. фут)</label>
                <input
                  type="text"
                  name="sqft"
                  value={form.sqft}
                  onChange={handleChange}
                />
              </div>
            </div>

            <div className="form-group">
              <label>Описание *</label>
              <textarea
                name="description"
                rows="5"
                value={form.description}
                onChange={handleChange}
                required
              />
            </div>
          </div>

          <div className="form-section">
            <h2>Особенности</h2>
            <div className="features-grid">
              {FEATURES.map((f) => (
                <label
                  key={f.key}
                  className={`feature-checkbox ${
                    form.features[f.key] ? "selected" : ""
                  }`}
                >
                  <input
                    type="checkbox"
                    checked={form.features[f.key]}
                    onChange={() => toggleFeature(f.key)}
                  />
                  <img src={f.icon} alt="" />
                  <span>{f.label}</span>
                </label>
              ))}

              <div className="feature-select">
                <select
                  value={form.features.floor}
                  onChange={(e) =>
                    changeGroupField("features", "floor", e.target.value)
                  }
                >
                  {FLOORS.map((floor) => (
                    <option key={floor} value={floor}>
                      {floor}
                    </option>
                  ))}
                </select>
              </div>
            </div>
          </div>

          <div className="form-section">
            <h2>Удобства</h2>
            <div
              className="amenities-grid"
              style={{ "--rows": Math.ceil(AMENITIES.length / 2) }}
            >
              {AMENITIES.map(({ name, icon }) => {
                const selected = form.amenities.includes(name);
                return (
                  <label
                    key={name}
                    className={`amenity-checkbox ${selected ? "selected" : ""}`}
                  >
                    <input
                      type="checkbox"
                      checked={selected}
                      onChange={() => toggleAmenity(name)}
                    />
                    <img src={icon} alt="" />
                    <span>{name}</span>
                  </label>
                );
              })}
            </div>
          </div>

          <div className="form-section">
            <h2>Правила дома</h2>
            {HOUSE_RULES.map((rule) => (
              <div key={rule.key} className="rule-row">
                <div className="rule-label">
                  <img src={rule.icon} alt="" />
                  <span>{rule.label}</span>
                </div>
                <textarea
                  rows="2"
                  value={form.houseRules[rule.key]}
                  onChange={(e) =>
                    changeGroupField("houseRules", rule.key, e.target.value)
                  }
                />
              </div>
            ))}
          </div>

          <div className="form-section">
            <h2>Меры безопасности</h2>
            {SAFETY_MEASURES.map((m) => (
              <div key={m.key} className="form-group">
                <label>{m.label}</label>
                <textarea
                  rows="2"
                  value={form.safetyMeasures[m.key]}
                  onChange={(e) =>
                    changeGroupField("safetyMeasures", m.key, e.target.value)
                  }
                />
              </div>
            ))}
          </div>

          <div className="form-section">
            <h2>Политика отмены</h2>
            {CANCELLATION_POLICY.map((p) => (
              <div key={p.key} className="form-group">
                <label>{p.label}</label>
                <input
                  type="text"
                  value={form.cancellationPolicy[p.key]}
                  onChange={(e) =>
                    changeGroupField("cancellationPolicy", p.key, e.target.value)
                  }
                />
              </div>
            ))}
          </div>

          <div className="form-section">
            <h2>Описание района</h2>
            <div className="form-group">
              <textarea
                rows="4"
                name="neighbourhoodDescription"
                placeholder="Опишите район, окрестности, транспортную доступность..."
                value={form.neighbourhoodDescription}
                onChange={handleChange}
              />
            </div>
          </div>

          <div className="form-actions">
            <button type="submit" className="submit-btn">
              Опубликовать объявление
            </button>
            <button
              type="button"
              className="cancel-btn"
              onClick={() => navigate("/realtor-dashboard")}
            >
              Отмена
            </button>
          </div>
        </form>
      </div>
    </>
  );
}