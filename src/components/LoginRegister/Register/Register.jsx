import { useState } from "react";
import { useLanguage } from "../../../context/LanguageContext";
import { registerUser } from "../../../utils/auth";
import loginImg from "../../../assets/login.png";
import styles from "./Register.module.css";

function EyeIcon({ open }) {
  return (
    <svg
      width="20"
      height="20"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
    >
      <path d="M1 12s4-7 11-7 11 7 11 7-4 7-11 7S1 12 1 12z" />
      <circle cx="12" cy="12" r="3" />
      {!open && <line x1="3" y1="3" x2="21" y2="21" />}
    </svg>
  );
}

const emptyForm = {
  name: "",
  email: "",
  password: "",
  confirm: "",
  accepted: false,
};

export default function Register({ onSwitch }) {
  const { t } = useLanguage();
  const [form, setForm] = useState(emptyForm);
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirm, setShowConfirm] = useState(false);
  const [error, setError] = useState("");

  const handleChange = (e) => {
    const { name, value, type, checked } = e.target;
    setForm((prev) => ({
      ...prev,
      [name]: type === "checkbox" ? checked : value,
    }));
    setError("");
  };

  const handleSubmit = (e) => {
    e.preventDefault();

    if (!form.name.trim() || !form.email.trim() || !form.password) {
      return setError("authErrFillAll");
    }
    if (!/^\S+@\S+\.\S+$/.test(form.email)) {
      return setError("authErrEmailInvalid");
    }
    if (form.password.length < 6) {
      return setError("authErrPasswordShort");
    }
    if (form.password !== form.confirm) {
      return setError("authErrPasswordMismatch");
    }
    if (!form.accepted) {
      return setError("authErrAccept");
    }

    const result = registerUser(form);
    if (!result.ok) return setError(result.message);

    setForm(emptyForm);
    onSwitch("login");
  };

  return (
    <div className={styles.card}>
      <div className={styles.side}>
        <img src={loginImg} alt="" className={styles.sideImg} />
      </div>
      <div className={styles.main}>
        <div className={styles.tabs}>
          <button
            type="button"
            className={styles.tab}
            onClick={() => onSwitch("login")}
          >
            {t("authLogin")}
          </button>
          <button type="button" className={`${styles.tab} ${styles.tabActive}`}>
            {t("authRegister")}
          </button>
        </div>

        <div className={styles.body}>
          <h2 className={styles.title}>{t("authCreateAccount")}</h2>
          <p className={styles.subtitle}>{t("authEnterInfo")}</p>

          <form className={styles.form} onSubmit={handleSubmit} noValidate>
            <div className={styles.field}>
              <input
                className={styles.input}
                type="text"
                name="name"
                placeholder={t("authFullName")}
                value={form.name}
                onChange={handleChange}
                autoComplete="name"
              />
            </div>

            <div className={styles.field}>
              <input
                className={styles.input}
                type="email"
                name="email"
                placeholder={t("authEmail")}
                value={form.email}
                onChange={handleChange}
                autoComplete="email"
              />
            </div>

            <div className={styles.field}>
              <input
                className={styles.input}
                type={showPassword ? "text" : "password"}
                name="password"
                placeholder={t("authPassword")}
                value={form.password}
                onChange={handleChange}
                autoComplete="new-password"
              />
              <button
                type="button"
                className={styles.eye}
                onClick={() => setShowPassword((s) => !s)}
                aria-label={
                  showPassword ? t("authHidePassword") : t("authShowPassword")
                }
              >
                <EyeIcon open={showPassword} />
              </button>
            </div>

            <div className={styles.field}>
              <input
                className={styles.input}
                type={showConfirm ? "text" : "password"}
                name="confirm"
                placeholder={t("authConfirmPassword")}
                value={form.confirm}
                onChange={handleChange}
                autoComplete="new-password"
              />
              <button
                type="button"
                className={styles.eye}
                onClick={() => setShowConfirm((s) => !s)}
                aria-label={
                  showConfirm ? t("authHidePassword") : t("authShowPassword")
                }
              >
                <EyeIcon open={showConfirm} />
              </button>
            </div>

            <label className={styles.terms}>
              <input
                type="checkbox"
                name="accepted"
                checked={form.accepted}
                onChange={handleChange}
              />
              {t("authAcceptTerms")}
            </label>

            {error && <p className={styles.error}>{t(error)}</p>}

            <button type="submit" className={styles.submit}>
              {t("authSubmitRegister")}
            </button>
          </form>

          <div className={styles.switch}>
            <span>{t("authHaveAccount")}</span>
            <button
              type="button"
              className={styles.switchBtn}
              onClick={() => onSwitch("login")}
            >
              {t("authLogin")}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
