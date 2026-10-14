import { useState } from "react";
import { getUsers, saveUsers, setCurrentUser } from "../services/auth";
import "../styles/components/auth-modal.css";


export default function AuthModal({ onClose, onLogin }) {
  const [mode, setMode] = useState("login");
  const [role, setRole] = useState("user");

  const [firstName, setFirstName] = useState("");
  const [lastName, setLastName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [photo, setPhoto] = useState("");

  const [agreeToPersonalData, setAgreeToPersonalData] = useState(true);

  const handlePhotoUpload = (e) => {
    const file = e.target.files[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onloadend = () => {
      setPhoto(reader.result);
    };
    reader.readAsDataURL(file);
  };

  const handleRegister = (e) => {
    e.preventDefault();

    if (!agreeToPersonalData) {
      alert("Необходимо согласиться на обработку персональных данных");
      return;
    }

    const users = getUsers();
    const exists = users.find((u) => u.email === email);

    if (exists) {
      alert("Пользователь с таким email уже существует");
      return;
    }

    const newUser = {
      id: Date.now(),
      firstName,
      lastName,
      email,
      password,
      role,
      photo: role === "realtor" ? photo : "",
    };

    saveUsers([...users, newUser]);
    setCurrentUser(newUser);

    if (onLogin) onLogin(newUser);
    onClose();
  };

  const [passwordError, setPasswordError] = useState("");

  const validatePassword = (value) => {
    if (value.length < 8) {
      return "Пароль должен содержать не менее 8 символов";
    }

    if (!/\d/.test(value)) {
      return "Пароль должен содержать хотя бы одну цифру";
    }

    if (!/[A-Za-zА-Яа-яЁё]/.test(value)) {
      return "Пароль должен содержать хотя бы одну букву";
    }

    if (!/[A-ZА-ЯЁ]/.test(value)) {
      return "Пароль должен содержать хотя бы одну заглавную букву";
    }

    return "";
  };

  const handlePasswordChange = (e) => {
    const value = e.target.value;
    setPassword(value);
    setPasswordError(validatePassword(value));
  };

  const handleLogin = (e) => {
    e.preventDefault();

    const users = getUsers();

    const user = users.find(
      (u) => u.email === email && u.password === password
    );

    if (!user) {
      alert("Неверный email или пароль");
      return;
    }

    setCurrentUser(user);

    if (onLogin) onLogin(user);
    onClose();
  };

  return (
    <div className="auth-overlay">
      <div
        className={`auth-container ${
          mode === "register" ? "right-panel-active" : ""
        }`}
      >
        <div className="form-container sign-up-container">
          <form onSubmit={handleRegister} className="auth-form">
            <div className="form-scroll">
              <h1>Регистрация</h1>

              <div className="role-switch">
                <button
                  type="button"
                  className={role === "user" ? "active" : ""}
                  onClick={() => setRole("user")}
                >
                  Пользователь
                </button>

                <button
                  type="button"
                  className={role === "realtor" ? "active" : ""}
                  onClick={() => setRole("realtor")}
                >
                  Риелтор
                </button>
              </div>

              <input
                placeholder="Имя"
                value={firstName}
                onChange={(e) => setFirstName(e.target.value)}
                required
              />

              <input
                placeholder="Фамилия"
                value={lastName}
                onChange={(e) => setLastName(e.target.value)}
                required
              />

              {role === "realtor" && (
                <>
                  <label className="upload-label">
                    Фотография профиля
                  </label>

                  <input
                    type="file"
                    accept="image/*"
                    onChange={handlePhotoUpload}
                    required
                  />
                </>
              )}

              <input
                type="email"
                placeholder="Электронная почта"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
              />

              <input
                type="password"
                placeholder="Пароль"
                value={password}
                onChange={handlePasswordChange}
                required
                minLength={8}
                title="Минимум 8 символов, хотя бы одна цифра и одна заглавная буква"
              />

              {/* Показываем ошибку только при регистрации */}
              {mode === "register" && passwordError && (
                <p className="password-error">{passwordError}</p>
              )}

              <label className="checkbox-label">
                <input
                  type="checkbox"
                  checked={agreeToPersonalData}
                  onChange={(e) =>
                    setAgreeToPersonalData(e.target.checked)
                  }
                />
                <span>
                  Согласен на обработку персональных данных
                </span>
              </label>

              <button
                type="submit"
                className="main-btn"
                disabled={!agreeToPersonalData || !!passwordError}
              >
                Зарегистрироваться
              </button>
            </div>
          </form>
        </div>

        <div className="form-container sign-in-container">
          <form onSubmit={handleLogin} className="auth-form">
            <div className="form-scroll">
              <h1>Вход</h1>

              <input
                type="email"
                placeholder="Электронная почта"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
              />

              <input
                type="password"
                placeholder="Пароль"
                value={password}
                onChange={handlePasswordChange}
                required
                minLength={8}
                title="Минимум 8 символов, хотя бы одна цифра и одна заглавная буква"
              />

              <button type="submit" className="main-btn">
                Войти
              </button>
            </div>
          </form>
        </div>

        <div className="overlay-container">
          <div className="overlay">
            <div className="overlay-panel overlay-left">
              <h1>С возвращением!</h1>
              <p>
                Чтобы продолжить работу, войдите в свою учетную запись
              </p>

              <button
                type="button"
                className="ghost"
                onClick={() => setMode("login")}
              >
                Войти
              </button>
            </div>

            <div className="overlay-panel overlay-right">
              <h1>Здравствуйте!</h1>
              <p>
                Создайте аккаунт и начните пользоваться сервисом
                недвижимости
              </p>

              <button
                type="button"
                className="ghost"
                onClick={() => setMode("register")}
              >
                Регистрация
              </button>
            </div>
          </div>
        </div>

        <button
          type="button"
          className="close-btn"
          onClick={onClose}
        >
          ×
        </button>
      </div>
    </div>
  );
}