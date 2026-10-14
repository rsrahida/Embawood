import React from "react";
import { Link } from "react-router-dom";
import { Phone, MapPin } from "lucide-react";
import {
  FaFacebookF,
  FaInstagram,
  FaYoutube,
  FaLinkedinIn,
  FaWhatsapp,
} from "react-icons/fa";
import { useLanguage } from "../../context/LanguageContext";
import darkLeaf from "../../assets/dark-green.svg";
import lightLeaf from "../../assets/light-green.svg";
import visa from "../../assets/visa.svg";
import mastercard from "../../assets/mastercard.svg";
import styles from "./Footer.module.css";

const socialLinks = [
  { name: "Facebook", icon: FaFacebookF },
  { name: "Instagram", icon: FaInstagram },
  { name: "YouTube", icon: FaYoutube },
  { name: "LinkedIn", icon: FaLinkedinIn },
  { name: "WhatsApp", icon: FaWhatsapp },
];

const productLinks = [
  { key: "catAll", path: "/products" },
  { key: "catBedroom", path: "/products/bedroom" },
  { key: "catLivingRoom", path: "/products/living-room" },
  { key: "catTables", path: "/products/tables" },
  { key: "catMattresses", path: "/products/mattresses" },
];

const pageLinks = [
  { key: "shops", path: "/shops" },
  { key: "roomBuilder", path: "/room-builder" },
  { key: "campaigns", path: "/campaigns" },
  { key: "wishlist", path: "/wishlist" },
  { key: "cart", path: "/cart" },
  { key: "account", path: "/login" },
];

const Footer = () => {
  const { lp, t } = useLanguage();
  const year = new Date().getFullYear();

  return (
    <footer className={styles.footer}>
      <div className={styles.leaves} aria-hidden="true">
        <img src={lightLeaf} alt="" className={styles.leafLight} />
        <img src={darkLeaf} alt="" className={styles.leafDark} />
      </div>
      <div className={styles.inner}>
        <div className={styles.main}>
          <div className={styles.socials}>
            {socialLinks.map(({ name, icon: Icon }) => (
              <span
                key={name}
                className={styles.socialIcon}
                role="img"
                aria-label={name}
              >
                <Icon aria-hidden="true" />
              </span>
            ))}
          </div>
          <nav className={styles.column} aria-label={t("products")}>
            <h3 className={styles.heading}>{t("products")}</h3>
            <ul className={styles.list}>
              {productLinks.map(({ key, path }) => (
                <li key={path}>
                  <Link to={lp(path)} className={styles.link}>
                    {t(key)}
                  </Link>
                </li>
              ))}
            </ul>
          </nav>
          <nav className={styles.column} aria-label={t("footerLinks")}>
            <h3 className={styles.heading}>{t("footerLinks")}</h3>
            <ul className={styles.list}>
              {pageLinks.map(({ key, path }) => (
                <li key={path}>
                  <Link to={lp(path)} className={styles.link}>
                    {t(key)}
                  </Link>
                </li>
              ))}
            </ul>
          </nav>
          <div className={styles.column}>
            <h3 className={styles.heading}>{t("footerContact")}</h3>
            <ul className={styles.list}>
              <li>
                <a href="tel:126" className={styles.contactItem}>
                  <Phone aria-hidden="true" />
                  <span>{t("footerService")}: 126</span>
                </a>
              </li>
              <li>
                <span className={styles.contactItem}>
                  <FaWhatsapp aria-hidden="true" />
                  <span>{t("footerWhatsapp")}</span>
                </span>
              </li>
              <li>
                <Link to={lp("/shops")} className={styles.contactItem}>
                  <MapPin aria-hidden="true" />
                  <span>{t("footerLocations")}</span>
                </Link>
              </li>
            </ul>
          </div>
        </div>
        <div className={styles.bottom}>
          <p className={styles.copy}>
            © {year} Embawood. {t("footerRights")}
          </p>
          <div className={styles.payments}>
            <img src={visa} alt="Visa" />
            <img src={mastercard} alt="Mastercard" />
          </div>
        </div>
      </div>
    </footer>
  );
};

export default Footer;
