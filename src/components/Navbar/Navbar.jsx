import React, { useEffect, useState } from "react";
import { Link, NavLink, useLocation, useNavigate } from "react-router-dom";

import {
  Search,
  UserRound,
  Heart,
  ShoppingCart,
  ChevronDown,
  Phone,
  Menu,
  X,
} from "lucide-react";

import {
  FaFacebookF,
  FaInstagram,
  FaYoutube,
  FaLinkedinIn,
  FaWhatsapp,
} from "react-icons/fa";

import { useLanguage } from "../../context/LanguageContext";

import logo from "../../assets/logo.svg";
import styles from "./Navbar.module.css";

const socialLinks = [
  {
    name: "Facebook",
    icon: FaFacebookF,
    url: "https://www.facebook.com/",
  },
  {
    name: "Instagram",
    icon: FaInstagram,
    url: "https://www.instagram.com/",
  },
  {
    name: "YouTube",
    icon: FaYoutube,
    url: "https://www.youtube.com/",
  },
  {
    name: "LinkedIn",
    icon: FaLinkedinIn,
    url: "https://www.linkedin.com/",
  },
];

// Yuxarı menyu linkləri
const topLinks = [
  { key: "shops", path: "/shops" },
  { key: "roomBuilder", path: "/room-builder" },
  { key: "campaigns", path: "/campaigns" },
];

// Məhsul kateqoriyaları
const categories = [
  { key: "catAll", path: "/products" },
  { key: "catBedroom", path: "/products/bedroom" },
  { key: "catLivingRoom", path: "/products/living-room" },
  { key: "catTables", path: "/products/tables" },
  { key: "catMattresses", path: "/products/mattresses" },
];

const Navbar = () => {
  const { language, setLanguage, t } = useLanguage();

  const [search, setSearch] = useState("");
  const [menuOpen, setMenuOpen] = useState(false);

  const navigate = useNavigate();
  const location = useLocation();

  // Sonradan səbət context-inə qoşaraq real məhsul sayını göstərə bilərsən
  const cartCount = 0;

  const closeMenu = () => {
    setMenuOpen(false);
  };

  // Səhifə dəyişdikdə mobil menyunu bağla
  useEffect(() => {
    setMenuOpen(false);
  }, [location.pathname]);

  // Mobil menyu açıq olduqda scroll-u kilidlə və Escape ilə bağla
  useEffect(() => {
    if (!menuOpen) return undefined;

    const previousOverflow = document.body.style.overflow;

    document.body.style.overflow = "hidden";

    const handleKeyDown = (event) => {
      if (event.key === "Escape") {
        setMenuOpen(false);
      }
    };

    window.addEventListener("keydown", handleKeyDown);

    return () => {
      document.body.style.overflow = previousOverflow;
      window.removeEventListener("keydown", handleKeyDown);
    };
  }, [menuOpen]);

  // Məhsul axtarışı
  const handleSearch = (event) => {
    event.preventDefault();

    const query = search.trim();

    if (!query) return;

    navigate(`/?search=${encodeURIComponent(query)}`);
    setMenuOpen(false);
  };

  // Linkin aktivlik class-ı
  const categoryClass =
    (baseClass, activeClass) =>
    ({ isActive }) =>
      `${baseClass} ${isActive ? activeClass : ""}`;

  return (
    <header className={styles.navbar}>
      {/* Yuxarı menyu */}
      <div className={styles.navbarTop}>
        <nav className={styles.navbarTopLinks}>
          {topLinks.map(({ key, path }) => (
            <Link key={path} to={path}>
              {t(key)}
            </Link>
          ))}
        </nav>

        <div className={styles.navbarTopRight}>
          <a
            href="tel:126"
            className={styles.navbarPhone}
            aria-label={t("phone")}
            title={t("phone")}
          >
            <Phone size={15} />
            <span>126</span>
          </a>

          <div className={styles.languageSelector}>
            <select
              value={language}
              onChange={(event) => setLanguage(event.target.value)}
              aria-label="Dil seçimi / Language"
            >
              <option value="AZ">AZ</option>
              <option value="EN">EN</option>
            </select>

            <ChevronDown size={13} />
          </div>
        </div>
      </div>

      {/* Əsas menyu sətri */}
      <div className={styles.navbarMain}>
        {/* Mobil menyu düyməsi */}
        <button
          type="button"
          className={styles.hamburger}
          onClick={() => setMenuOpen(true)}
          aria-label={t("menu")}
          aria-expanded={menuOpen}
          aria-controls="mobile-menu"
        >
          <Menu />
        </button>

        {/* Loqo */}
        <Link to="/" className={styles.navbarLogo} aria-label={t("home")}>
          <img src={logo} alt="Embawood" />
        </Link>

        {/* Axtarış */}
        <form className={styles.navbarSearch} onSubmit={handleSearch}>
          <input
            type="search"
            value={search}
            onChange={(event) => setSearch(event.target.value)}
            placeholder={t("placeholder")}
            aria-label={t("placeholder")}
          />

          <button type="submit" aria-label={t("search")}>
            <Search />
          </button>
        </form>

        {/* Sosial şəbəkələr */}
        <div className={styles.navbarSocials}>
          {socialLinks.map(({ name, icon: Icon, url }) => (
            <a
              key={name}
              href={url}
              target="_blank"
              rel="noopener noreferrer"
              className={styles.socialIcon}
              aria-label={name}
              title={name}
            >
              <Icon />
            </a>
          ))}
        </div>

        {/* Profil, sevimlilər və səbət */}
        <div className={styles.navbarActions}>
          <Link
            to="/login"
            className={styles.navbarAction}
            title={t("account")}
            aria-label={t("account")}
          >
            <UserRound />
          </Link>

          <Link
            to="/wishlist"
            className={styles.navbarAction}
            title={t("wishlist")}
            aria-label={t("wishlist")}
          >
            <Heart />
          </Link>

          <Link
            to="/cart"
            className={`${styles.navbarAction} ${styles.cartAction}`}
            title={t("cart")}
            aria-label={t("cart")}
          >
            <ShoppingCart />

            {cartCount > 0 && (
              <span className={styles.cartBadge}>{cartCount}</span>
            )}
          </Link>
        </div>
      </div>

      {/* Desktop kateqoriya menyusu */}
      <nav className={styles.categoryBar} aria-label={t("products")}>
        <ul className={styles.categoryList}>
          {categories.map(({ key, path }) => (
            <li key={path}>
              <NavLink
                to={path}
                end
                className={categoryClass(
                  styles.categoryLink,
                  styles.categoryLinkActive,
                )}
              >
                {t(key)}
              </NavLink>
            </li>
          ))}
        </ul>
      </nav>

      {/* Mobil menyunun arxa fonu */}
      <div
        className={`${styles.drawerOverlay} ${menuOpen ? styles.open : ""}`}
        onClick={closeMenu}
        aria-hidden="true"
      />

      {/* Mobil menyu */}
      <aside
        id="mobile-menu"
        className={`${styles.drawer} ${menuOpen ? styles.open : ""}`}
        role="dialog"
        aria-modal="true"
        aria-label={t("menu")}
        aria-hidden={!menuOpen}
      >
        <div className={styles.drawerHeader}>
          <Link
            to="/"
            className={styles.drawerLogo}
            aria-label={t("home")}
            onClick={closeMenu}
          >
            <img src={logo} alt="Embawood" />
          </Link>

          <button
            type="button"
            className={styles.drawerClose}
            onClick={closeMenu}
            aria-label={t("close")}
          >
            <X />
          </button>
        </div>

        <div className={styles.drawerBody}>
          <p className={styles.drawerTitle}>{t("products")}</p>

          {/* Mobil məhsul kateqoriyaları */}
          <ul className={styles.drawerList}>
            {categories.map(({ key, path }) => (
              <li key={path}>
                <NavLink
                  to={path}
                  end
                  onClick={closeMenu}
                  className={categoryClass(
                    styles.drawerLink,
                    styles.drawerLinkActive,
                  )}
                >
                  {t(key)}
                </NavLink>
              </li>
            ))}
          </ul>

          {/* Digər səhifələr */}
          <ul className={`${styles.drawerList} ${styles.drawerListSecondary}`}>
            {topLinks.map(({ key, path }) => (
              <li key={path}>
                <NavLink
                  to={path}
                  onClick={closeMenu}
                  className={categoryClass(
                    styles.drawerLink,
                    styles.drawerLinkActive,
                  )}
                >
                  {t(key)}
                </NavLink>
              </li>
            ))}
          </ul>

          {/* Telefon və dil seçimi */}
          <div className={styles.drawerMeta}>
            <a href="tel:126" className={styles.drawerPhone}>
              <Phone size={18} />
              <span>126</span>
            </a>

            <div className={styles.drawerLanguage}>
              <select
                value={language}
                onChange={(event) => setLanguage(event.target.value)}
                aria-label="Dil seçimi / Language"
              >
                <option value="AZ">AZ</option>
                <option value="EN">EN</option>
              </select>

              <ChevronDown size={14} />
            </div>
          </div>

          {/* Mobil sosial şəbəkələr */}
          <div className={styles.drawerSocials}>
            {socialLinks.map(({ name, icon: Icon, url }) => (
              <a
                key={name}
                href={url}
                target="_blank"
                rel="noopener noreferrer"
                aria-label={name}
                title={name}
              >
                <Icon />
              </a>
            ))}
          </div>
        </div>
      </aside>
    </header>
  );
};

export default Navbar;
