import { useState } from "react";
import { useNavigate, useSearchParams } from "react-router-dom";
import { useLanguage } from "../../../context/LanguageContext";
import { loginUser } from "../../../utils/auth";
import loginImg from "../../../assets/login.png";
import styles from "./Login.module.css";

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

const isSafeRedirect = (path) =>
  typeof path === "string" && path.startsWith("/") && !path.startsWith("//");

export default function Login({ onSwitch }) {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const { lang, t } = useLanguage();
  const [form, setForm] = useState({
    email: "",
    password: "",
    accepted: false,
  });
  const [showPassword, setShowPassword] = useState(false);
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

    if (!form.email || !form.password) {
      return setError("authErrEmailPassword");
    }
    if (!form.accepted) {
      return setError("authErrAccept");
    }

    const result = loginUser(form);
    if (!result.ok) return setError(result.message);
    const redirect = searchParams.get("redirect");
    navigate(isSafeRedirect(redirect) ? redirect : `/${lang}/products`, {
      replace: true,
    });
  };

  return (
    <div className={styles.card}>
      <div className={styles.side}>
        <img src={loginImg} alt="" className={styles.sideImg} />
      </div>
      <div className={styles.main}>
        <div className={styles.tabs}>
          <button type="button" className={`${styles.tab} ${styles.tabActive}`}>
            {t("authLogin")}
          </button>
          <button
            type="button"
            className={styles.tab}
            onClick={() => onSwitch("register")}
          >
            {t("authRegister")}
          </button>
        </div>

        <div className={styles.body}>
          <h2 className={styles.title}>{t("authWelcome")}</h2>
          <p className={styles.subtitle}>{t("authLoginSubtitle")}</p>

          <form className={styles.form} onSubmit={handleSubmit} noValidate>
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
                autoComplete="current-password"
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
              {t("authLogin")}
            </button>
          </form>

          <div className={styles.switch}>
            <span>{t("authNoAccount")}</span>
            <button
              type="button"
              className={styles.switchBtn}
              onClick={() => onSwitch("register")}
            >
              {t("authRegister")}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
