import React from "react";
import { Link } from "react-router-dom";
import { useLanguage } from "../../../context/LanguageContext";
import logo from "../../../assets/embawod.png";
import styles from "./AboutUs.module.css";

const AboutUs = () => {
  const { lp, t } = useLanguage();

  return (
    <section className={styles.section}>
      <div className={styles.text}>
        <h2 className={styles.title}>{t("aboutTitle")}</h2>
        <p className={styles.description}>{t("aboutText")}</p>
        <Link to={lp("/room-builder")} className={styles.button}>
          {t("aboutBtn")}
        </Link>
      </div>
      <div className={styles.media}>
        <img
          src={logo}
          alt="Embawood"
          className={styles.image}
          loading="lazy"
          draggable="false"
        />
      </div>
    </section>
  );
};

export default AboutUs;
