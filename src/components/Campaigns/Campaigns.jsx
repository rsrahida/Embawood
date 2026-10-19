import React, { useCallback, useEffect, useRef, useState } from "react";
import { Link } from "react-router-dom";
import { useLanguage } from "../../context/LanguageContext";
import banner1 from "../../assets/kampaniya1.jpg";
import banner2 from "../../assets/kampaniya2.jpg";
import styles from "./Campaigns.module.css";

const AUTOPLAY_MS = 5500;
const SWIPE_THRESHOLD = 50;
const PHONE = "126";
const WHATSAPP_LABEL = "055 222 01 26";
const WHATSAPP_LINK = "https://wa.me/994552220126";

const ChevronIcon = ({ dir = "right" }) => (
  <svg
    viewBox="0 0 24 24"
    width="22"
    height="22"
    fill="none"
    stroke="currentColor"
    strokeWidth="2"
    strokeLinecap="round"
    strokeLinejoin="round"
    aria-hidden="true"
  >
    <path d={dir === "right" ? "M9 5l7 7-7 7" : "M15 5l-7 7 7 7"} />
  </svg>
);

const PhoneIcon = () => (
  <svg
    viewBox="0 0 24 24"
    width="18"
    height="18"
    fill="none"
    stroke="currentColor"
    strokeWidth="1.8"
    strokeLinecap="round"
    strokeLinejoin="round"
    aria-hidden="true"
  >
    <path d="M22 16.9v3a2 2 0 0 1-2.2 2 19.8 19.8 0 0 1-8.6-3.1 19.5 19.5 0 0 1-6-6A19.8 19.8 0 0 1 2.1 4.2 2 2 0 0 1 4.1 2h3a2 2 0 0 1 2 1.7c.1 1 .4 1.9.7 2.8a2 2 0 0 1-.5 2.1L8.1 9.9a16 16 0 0 0 6 6l1.3-1.2a2 2 0 0 1 2.1-.4c.9.3 1.8.6 2.8.7a2 2 0 0 1 1.7 2z" />
  </svg>
);

const ChatIcon = () => (
  <svg
    viewBox="0 0 24 24"
    width="18"
    height="18"
    fill="none"
    stroke="currentColor"
    strokeWidth="1.8"
    strokeLinecap="round"
    strokeLinejoin="round"
    aria-hidden="true"
  >
    <path d="M21 11.5a8.4 8.4 0 0 1-12.4 7.4L3 21l2.1-5.4A8.5 8.5 0 1 1 21 11.5z" />
  </svg>
);

const getCampaigns = (t) => [
  {
    id: "credit",
    image: banner1,
    badge: t("campCreditBadge"),
    badgeNote: t("campCreditNote"),
    title: t("campCreditTitle"),
    lead: t("campCreditLead"),
    text: t("campCreditText"),
    footer: t("campCreditFooter"),
  },
  {
    id: "warranty",
    image: banner2,
    badge: t("campWarrBadge"),
    badgeNote: t("campWarrNote"),
    title: t("campWarrTitle"),
    lead: t("campWarrLead"),
    text: t("campWarrText"),
    footer: t("campWarrFooter"),
  },
];

const Campaigns = () => {
  const { lp, t } = useLanguage();
  const campaigns = getCampaigns(t);
  const total = campaigns.length;

  const [index, setIndex] = useState(0);
  const [paused, setPaused] = useState(false);
  const sliderRef = useRef(null);
  const touchStartX = useRef(null);

  const goTo = useCallback(
    (next) => setIndex(((next % total) + total) % total),
    [total],
  );
  const prev = () => goTo(index - 1);
  const next = () => goTo(index + 1);

  useEffect(() => {
    const reduce =
      typeof window !== "undefined" &&
      window.matchMedia?.("(prefers-reduced-motion: reduce)").matches;
    if (paused || reduce || total < 2) return undefined;

    const timer = setTimeout(() => goTo(index + 1), AUTOPLAY_MS);
    return () => clearTimeout(timer);
  }, [index, paused, total, goTo]);

  const handleKeyDown = (event) => {
    if (event.key === "ArrowLeft") prev();
    if (event.key === "ArrowRight") next();
  };

  const handleTouchStart = (event) => {
    touchStartX.current = event.touches[0].clientX;
    setPaused(true);
  };

  const handleTouchEnd = (event) => {
    if (touchStartX.current !== null) {
      const delta = event.changedTouches[0].clientX - touchStartX.current;
      if (delta > SWIPE_THRESHOLD) prev();
      else if (delta < -SWIPE_THRESHOLD) next();
    }
    touchStartX.current = null;
    setPaused(false);
  };

  const selectFromCard = (i) => {
    goTo(i);
    sliderRef.current?.scrollIntoView({ behavior: "smooth", block: "center" });
  };

  return (
    <section className={styles.page}>
      <div className={styles.container}>
        <header className={styles.head}>
          <h1 className={styles.title}>{t("campaigns")}</h1>
          <p className={styles.subtitle}>{t("campSubtitle")}</p>
        </header>
        <div
          ref={sliderRef}
          className={styles.slider}
          role="region"
          aria-roledescription="carousel"
          aria-label={t("campSliderLabel")}
          tabIndex={0}
          onKeyDown={handleKeyDown}
          onMouseEnter={() => setPaused(true)}
          onMouseLeave={() => setPaused(false)}
          onFocus={() => setPaused(true)}
          onBlur={() => setPaused(false)}
          onTouchStart={handleTouchStart}
          onTouchEnd={handleTouchEnd}
        >
          <div
            className={styles.track}
            style={{ transform: `translateX(-${index * 100}%)` }}
          >
            {campaigns.map((c, i) => (
              <div
                key={c.id}
                className={styles.slide}
                role="group"
                aria-roledescription="slide"
                aria-label={`${i + 1} / ${total}`}
                aria-hidden={i !== index}
              >
                <img
                  src={c.image}
                  alt={c.title}
                  className={styles.slideImg}
                  loading={i === 0 ? "eager" : "lazy"}
                  draggable="false"
                />
              </div>
            ))}
          </div>
          <button
            type="button"
            className={`${styles.arrow} ${styles.arrowPrev}`}
            onClick={prev}
            aria-label={t("campPrev")}
          >
            <ChevronIcon dir="left" />
          </button>
          <button
            type="button"
            className={`${styles.arrow} ${styles.arrowNext}`}
            onClick={next}
            aria-label={t("campNext")}
          >
            <ChevronIcon dir="right" />
          </button>{" "}
          <div className={styles.dots}>
            {campaigns.map((c, i) => (
              <button
                key={c.id}
                type="button"
                className={`${styles.dot} ${i === index ? styles.dotActive : ""}`}
                onClick={() => goTo(i)}
                aria-label={`${i + 1}. ${c.title}`}
                aria-current={i === index}
              />
            ))}
          </div>
        </div>
        <div className={styles.cards}>
          {campaigns.map((c, i) => (
            <article
              key={c.id}
              className={`${styles.card} ${i === index ? styles.cardActive : ""}`}
            >
              <button
                type="button"
                className={styles.cardMedia}
                onClick={() => selectFromCard(i)}
                aria-label={c.title}
              >
                <img src={c.image} alt="" className={styles.cardImg} />
                <span className={styles.cardBadge}>
                  <b>{c.badge}</b>
                  <small>{c.badgeNote}</small>
                </span>
              </button>
              <div className={styles.cardBody}>
                <h2 className={styles.cardTitle}>{c.title}</h2>
                <p className={styles.cardLead}>{c.lead}</p>
                <p className={styles.cardText}>{c.text}</p>
                <div className={styles.contact}>
                  <a href={`tel:${PHONE}`} className={styles.contactBtn}>
                    <PhoneIcon />
                    <span>{PHONE}</span>
                  </a>
                  <a
                    href={WHATSAPP_LINK}
                    target="_blank"
                    rel="noopener noreferrer"
                    className={styles.contactBtn}
                  >
                    <ChatIcon />
                    <span>WhatsApp: {WHATSAPP_LABEL}</span>
                  </a>
                </div>
                <div className={styles.cardFoot}>
                  <span className={styles.cardSlogan}>{c.footer}</span>
                  <Link to={lp("/products")} className={styles.cta}>
                    {t("cartBrowse")}
                  </Link>
                </div>
              </div>
            </article>
          ))}
        </div>
      </div>
    </section>
  );
};

export default Campaigns;
