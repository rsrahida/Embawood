import React, { useCallback, useEffect, useRef, useState } from "react";
import { Link } from "react-router-dom";
import { ChevronLeft, ChevronRight } from "lucide-react";
import { useLanguage } from "../../../context/LanguageContext";
import slider1 from "../../../assets/slides/slider1.png";
import slider2 from "../../../assets/slides/slider2.png";
import slider3 from "../../../assets/slides/slider3.png";
import styles from "./HeroSlider.module.css";

const slides = [
  {
    id: 1,
    image: slider1,
    badge: "heroBadge1",
    title: "heroTitle1",
    text: "heroText1",
    button: "heroBtn1",
    path: "/products/bedroom",
  },
  {
    id: 2,
    image: slider2,
    badge: "heroBadge2",
    title: "heroTitle2",
    text: "heroText2",
    button: "heroBtn2",
    path: "/products/living-room",
  },
  {
    id: 3,
    image: slider3,
    badge: "heroBadge3",
    title: "heroTitle3",
    text: "heroText3",
    button: "heroBtn3",
    path: "/room-builder",
  },
];

const AUTOPLAY_DELAY = 5000;
const SWIPE_THRESHOLD = 50;

const HeroSlider = () => {
  const { t, lp } = useLanguage();
  const [current, setCurrent] = useState(0);
  const [paused, setPaused] = useState(false);
  const touchStartX = useRef(null);
  const total = slides.length;
  const goTo = useCallback(
    (index) => {
      setCurrent((index + total) % total);
    },
    [total],
  );

  const next = useCallback(() => goTo(current + 1), [current, goTo]);
  const prev = useCallback(() => goTo(current - 1), [current, goTo]);

  useEffect(() => {
    if (paused) return undefined;

    const timer = setTimeout(next, AUTOPLAY_DELAY);

    return () => clearTimeout(timer);
  }, [current, paused, next]);

  const handleKeyDown = (event) => {
    if (event.key === "ArrowLeft") prev();
    if (event.key === "ArrowRight") next();
  };
  const handleTouchStart = (event) => {
    touchStartX.current = event.touches[0].clientX;
  };

  const handleTouchEnd = (event) => {
    if (touchStartX.current === null) return;
    const diff = touchStartX.current - event.changedTouches[0].clientX;
    if (Math.abs(diff) > SWIPE_THRESHOLD) {
      if (diff > 0) next();
      else prev();
    }

    touchStartX.current = null;
  };

  return (
    <section
      className={styles.slider}
      aria-roledescription="carousel"
      onMouseEnter={() => setPaused(true)}
      onMouseLeave={() => setPaused(false)}
      onFocus={() => setPaused(true)}
      onBlur={() => setPaused(false)}
      onKeyDown={handleKeyDown}
      onTouchStart={handleTouchStart}
      onTouchEnd={handleTouchEnd}
    >
      <div
        className={styles.track}
        style={{ transform: `translateX(-${current * 100}%)` }}
      >
        {slides.map((slide, index) => (
          <article
            key={slide.id}
            className={styles.slide}
            role="group"
            aria-roledescription="slide"
            aria-label={`${index + 1} / ${total}`}
            aria-hidden={index !== current}
          >
            <img
              src={slide.image}
              alt=""
              className={styles.image}
              loading={index === 0 ? "eager" : "lazy"}
              draggable="false"
            />
            <div className={styles.overlay} />
            <div
              className={`${styles.content} ${
                index === current ? styles.contentActive : ""
              }`}
            >
              <div className={styles.glass}>
                <span className={styles.badge}>{t(slide.badge)}</span>
                <h2 className={styles.title}>{t(slide.title)}</h2>
                <p className={styles.text}>{t(slide.text)}</p>
                <Link
                  to={lp(slide.path)}
                  className={styles.button}
                  tabIndex={index === current ? 0 : -1}
                >
                  {t(slide.button)}
                </Link>
              </div>
            </div>
          </article>
        ))}
      </div>
      <button
        type="button"
        className={`${styles.arrow} ${styles.arrowLeft}`}
        onClick={prev}
        aria-label={t("prevSlide")}
      >
        <ChevronLeft />
      </button>
      <button
        type="button"
        className={`${styles.arrow} ${styles.arrowRight}`}
        onClick={next}
        aria-label={t("nextSlide")}
      >
        <ChevronRight />
      </button>
      <div className={styles.dots}>
        {slides.map((slide, index) => (
          <button
            key={slide.id}
            type="button"
            className={`${styles.dot} ${
              index === current ? styles.dotActive : ""
            }`}
            onClick={() => goTo(index)}
            aria-label={`${t("goToSlide")} ${index + 1}`}
            aria-current={index === current}
          />
        ))}
      </div>
    </section>
  );
};

export default HeroSlider;