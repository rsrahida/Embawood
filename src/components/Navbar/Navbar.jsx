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

// Sosial ikonlar statikdir (link yoxdur)
const socialLinks = [
  {
    name: "Facebook",
    icon: FaFacebookF,
  },
  {
    name: "Instagram",
    icon: FaInstagram,
  },
  {
    name: "YouTube",
    icon: FaYoutube,
  },
  {
    name: "LinkedIn",
    icon: FaLinkedinIn,
  },
  {
    name: "WhatsApp",
    icon: FaWhatsapp,
  },
];

const topLinks = [
  { key: "shops", path: "/shops" },
  { key: "roomBuilder", path: "/room-builder" },
  { key: "campaigns", path: "/campaigns" },
];

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
  const cartCount = 0;

  const closeMenu = () => {
    setMenuOpen(false);
  };
  useEffect(() => {
    setMenuOpen(false);
  }, [location.pathname]);
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

  const handleSearch = (event) => {
    event.preventDefault();
    const query = search.trim();
    if (!query) return;
    navigate(`/?search=${encodeURIComponent(query)}`);
    setMenuOpen(false);
  };

  const categoryClass =
    (baseClass, activeClass) =>
    ({ isActive }) =>
      `${baseClass} ${isActive ? activeClass : ""}`;

  return (
    <header className={styles.navbar}>
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
      <div className={styles.navbarMain}>
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
        <Link to="/" className={styles.navbarLogo} aria-label={t("home")}>
          <img src={logo} alt="Embawood" />
        </Link>
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
        <div className={styles.navbarSocials}>
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
      <div
        className={`${styles.drawerOverlay} ${menuOpen ? styles.open : ""}`}
        onClick={closeMenu}
        aria-hidden="true"
      />
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
          <div className={styles.drawerSocials}>
            {socialLinks.map(({ name, icon: Icon }) => (
              <span key={name} role="img" aria-label={name}>
                <Icon aria-hidden="true" />
              </span>
            ))}
          </div>
        </div>
      </aside>
    </header>
  );
};

export default Navbar;