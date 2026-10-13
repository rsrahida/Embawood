import React, { useEffect, useState } from "react";
import { useLocation } from "react-router-dom";
import { ArrowUp } from "lucide-react";
import { useLanguage, stripLangPrefix } from "../../context/LanguageContext";
import styles from "./ScrollToTop.module.css";

const SHOW_AFTER = 300;
const RADIUS = 22;
const CIRCUMFERENCE = 2 * Math.PI * RADIUS;

const ScrollToTop = () => {
  const { pathname } = useLocation();
  const { t } = useLanguage();
  const [visible, setVisible] = useState(false);
  const [progress, setProgress] = useState(0);
  const pagePath = stripLangPrefix(pathname);

  useEffect(() => {
    window.scrollTo(0, 0);
  }, [pagePath]);

  useEffect(() => {
    let ticking = false;

    const update = () => {
      const scrollTop = window.scrollY;
      const maxScroll =
        document.documentElement.scrollHeight - window.innerHeight;

      setVisible(scrollTop > SHOW_AFTER);
      setProgress(maxScroll > 0 ? Math.min(scrollTop / maxScroll, 1) : 0);

      ticking = false;
    };

    const onScroll = () => {
      if (ticking) return;

      ticking = true;
      requestAnimationFrame(update);
    };

    update();

    window.addEventListener("scroll", onScroll, { passive: true });
    window.addEventListener("resize", onScroll);

    return () => {
      window.removeEventListener("scroll", onScroll);
      window.removeEventListener("resize", onScroll);
    };
  }, [pagePath]);

  const handleClick = () => {
    const reduceMotion = window.matchMedia(
      "(prefers-reduced-motion: reduce)",
    ).matches;

    window.scrollTo({ top: 0, behavior: reduceMotion ? "auto" : "smooth" });
  };

  return (
    <button
      type="button"
      className={`${styles.button} ${visible ? styles.visible : ""}`}
      onClick={handleClick}
      aria-label={t("scrollTop")}
      title={t("scrollTop")}
      tabIndex={visible ? 0 : -1}
    >
      <svg className={styles.ring} viewBox="0 0 52 52" aria-hidden="true">
        <circle className={styles.track} cx="26" cy="26" r={RADIUS} />
        <circle
          className={styles.bar}
          cx="26"
          cy="26"
          r={RADIUS}
          strokeDasharray={CIRCUMFERENCE}
          strokeDashoffset={CIRCUMFERENCE * (1 - progress)}
        />
      </svg>

      <ArrowUp className={styles.icon} />
    </button>
  );
};

export default ScrollToTop;
