import { useEffect } from "react";
import { Link } from "react-router-dom";
import { useLanguage } from "../../../context/LanguageContext";
import styles from "./Toast.module.css";

const icons = {
  success: <path d="M5 12.5l4.5 4.5L19 7.5" />,
  danger: <path d="M6 6l12 12M18 6L6 18" />,
  info: <path d="M12 8v.01M12 12v5" />,
};

const StatusIcon = ({ variant }) => (
  <svg
    viewBox="0 0 24 24"
    width="14"
    height="14"
    fill="none"
    stroke="currentColor"
    strokeWidth="3"
    strokeLinecap="round"
    strokeLinejoin="round"
    aria-hidden="true"
  >
    {icons[variant] || icons.success}
  </svg>
);

const CloseIcon = () => (
  <svg
    viewBox="0 0 24 24"
    width="16"
    height="16"
    fill="none"
    stroke="currentColor"
    strokeWidth="2"
    strokeLinecap="round"
    aria-hidden="true"
  >
    <path d="M6 6l12 12M18 6L6 18" />
  </svg>
);

const ToastItem = ({ toast, onClose }) => {
  const { lang } = useLanguage();
  const {
    id,
    variant,
    title,
    message,
    image,
    actionLabel,
    actionTo,
    duration,
  } = toast;

  useEffect(() => {
    const timer = setTimeout(() => onClose(id), duration);
    return () => clearTimeout(timer);
  }, [id, duration, onClose]);

  const closeLabel = lang === "az" ? "Bağla" : "Close";

  return (
    <div className={`${styles.toast} ${styles[variant] || styles.success}`}>
      {image ? (
        <div className={styles.thumb}>
          <img src={image} alt="" />
          <span className={styles.statusBadge}>
            <StatusIcon variant={variant} />
          </span>
        </div>
      ) : (
        <span className={styles.iconCircle}>
          <StatusIcon variant={variant} />
        </span>
      )}
      <div className={styles.content}>
        <p className={styles.title}>{title}</p>
        {message && <p className={styles.message}>{message}</p>}
        {actionLabel && actionTo && (
          <Link
            to={actionTo}
            className={styles.action}
            onClick={() => onClose(id)}
          >
            {actionLabel} →
          </Link>
        )}
      </div>
      <button
        type="button"
        className={styles.close}
        onClick={() => onClose(id)}
        aria-label={closeLabel}
      >
        <CloseIcon />
      </button>
      <span
        className={styles.progress}
        style={{ animationDuration: `${duration}ms` }}
      />
    </div>
  );
};

const ToastContainer = ({ toasts, onClose }) => {
  return (
    <div className={styles.wrap} role="status" aria-live="polite">
      {toasts.map((toast) => (
        <ToastItem key={toast.id} toast={toast} onClose={onClose} />
      ))}
    </div>
  );
};

export default ToastContainer;
