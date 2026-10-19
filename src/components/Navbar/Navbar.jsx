import React, { useEffect, useMemo, useRef, useState } from "react";
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
  LogOut,
} from "lucide-react";
import {
  FaFacebookF,
  FaInstagram,
  FaYoutube,
  FaLinkedinIn,
  FaWhatsapp,
} from "react-icons/fa";
import { useLanguage } from "../../context/LanguageContext";
import { useWishlist } from "../../context/WishlistContext";
import { useCart } from "../../context/CartContext";
import products from "../../data/products";
import { searchProducts } from "../../utils/searchProducts";
import { getCurrentUser, logoutUser, AUTH_EVENT } from "../../utils/auth";
import logo from "../../assets/logo.svg";
import styles from "./Navbar.module.css";

const CURRENCY = "₼";
const MAX_SUGGESTIONS = 6;

const socialLinks = [
  { name: "Facebook", icon: FaFacebookF },
  { name: "Instagram", icon: FaInstagram },
  { name: "YouTube", icon: FaYoutube },
  { name: "LinkedIn", icon: FaLinkedinIn },
  { name: "WhatsApp", icon: FaWhatsapp },
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
  const { language, setLanguage, lang, t } = useLanguage();
  const { count: wishlistCount } = useWishlist();
  const { count: cartCount } = useCart();
  const [search, setSearch] = useState("");
  const [searchOpen, setSearchOpen] = useState(false);
  const [activeIndex, setActiveIndex] = useState(-1);
  const [menuOpen, setMenuOpen] = useState(false);
  const [currentUser, setCurrentUser] = useState(() => getCurrentUser());
  const loggedIn = Boolean(currentUser);
  const [accountOpen, setAccountOpen] = useState(false);
  const accountRef = useRef(null);
  const searchRef = useRef(null);
  const navigate = useNavigate();
  const location = useLocation();
  const isAz = lang === "az";

  const withLang = (path = "") => `/${lang}${path === "/" ? "" : path}`;
  const closeMenu = () => {
    setMenuOpen(false);
  };

  const query = search.trim();

  const suggestions = useMemo(
    () => (query ? searchProducts(products, query, MAX_SUGGESTIONS) : []),
    [query],
  );
  const totalMatches = useMemo(
    () => (query ? searchProducts(products, query).length : 0),
    [query],
  );

  const showDropdown = searchOpen && query.length > 0;

  useEffect(() => {
    setMenuOpen(false);
    setSearchOpen(false);
    setAccountOpen(false);
    setActiveIndex(-1);
  }, [location.pathname]);

  useEffect(() => {
    const sync = () => setCurrentUser(getCurrentUser());
    window.addEventListener(AUTH_EVENT, sync);
    window.addEventListener("storage", sync);
    return () => {
      window.removeEventListener(AUTH_EVENT, sync);
      window.removeEventListener("storage", sync);
    };
  }, []);

  useEffect(() => {
    if (!accountOpen) return undefined;

    const handleOutside = (event) => {
      if (accountRef.current && !accountRef.current.contains(event.target)) {
        setAccountOpen(false);
      }
    };
    const handleKey = (event) => {
      if (event.key === "Escape") setAccountOpen(false);
    };

    document.addEventListener("mousedown", handleOutside);
    document.addEventListener("touchstart", handleOutside);
    document.addEventListener("keydown", handleKey);

    return () => {
      document.removeEventListener("mousedown", handleOutside);
      document.removeEventListener("touchstart", handleOutside);
      document.removeEventListener("keydown", handleKey);
    };
  }, [accountOpen]);

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

  useEffect(() => {
    if (!searchOpen) return undefined;

    const handleOutside = (event) => {
      if (searchRef.current && !searchRef.current.contains(event.target)) {
        setSearchOpen(false);
        setActiveIndex(-1);
      }
    };

    document.addEventListener("mousedown", handleOutside);
    document.addEventListener("touchstart", handleOutside);

    return () => {
      document.removeEventListener("mousedown", handleOutside);
      document.removeEventListener("touchstart", handleOutside);
    };
  }, [searchOpen]);

  const logoutLabel = isAz ? "Çıxış" : "Log out";

  const handleLogout = () => {
    logoutUser();
    setAccountOpen(false);
    setMenuOpen(false);
    navigate(withLang("/"));
  };

  const closeSearch = () => {
    setSearchOpen(false);
    setActiveIndex(-1);
  };

  const handleSearchChange = (event) => {
    setSearch(event.target.value);
    setSearchOpen(true);
    setActiveIndex(-1);
  };

  const handleSearchKeyDown = (event) => {
    if (event.key === "Escape") {
      closeSearch();
      return;
    }

    if (!showDropdown || suggestions.length === 0) return;

    if (event.key === "ArrowDown") {
      event.preventDefault();
      setActiveIndex((i) => (i + 1) % suggestions.length);
    } else if (event.key === "ArrowUp") {
      event.preventDefault();
      setActiveIndex((i) => (i <= 0 ? suggestions.length - 1 : i - 1));
    }
  };

  const handleSearch = (event) => {
    event.preventDefault();
    if (!query) return;

    const selected = suggestions[activeIndex];

    if (selected) {
      navigate(withLang(`/product/${selected.id}`));
    } else {
      navigate(`${withLang("/search")}?q=${encodeURIComponent(query)}`);
    }

    closeSearch();
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
            <Link key={path} to={withLang(path)}>
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
        <Link
          to={withLang("/")}
          className={styles.navbarLogo}
          aria-label={t("home")}
        >
          <img src={logo} alt="Embawood" />
        </Link>
        <form
          ref={searchRef}
          className={styles.navbarSearch}
          onSubmit={handleSearch}
          role="search"
        >
          <input
            type="search"
            value={search}
            onChange={handleSearchChange}
            onFocus={() => setSearchOpen(true)}
            onKeyDown={handleSearchKeyDown}
            placeholder={t("placeholder")}
            aria-label={t("placeholder")}
            autoComplete="off"
            aria-expanded={showDropdown}
            aria-controls="search-suggestions"
          />
          <button type="submit" aria-label={t("search")}>
            <Search />
          </button>

          {showDropdown && (
            <div
              id="search-suggestions"
              className={styles.searchDropdown}
              role="listbox"
            >
              {suggestions.length === 0 ? (
                <p className={styles.searchEmpty}>
                  {t("searchNoResults")} “{query}”
                </p>
              ) : (
                <>
                  <ul className={styles.searchList}>
                    {suggestions.map((product, index) => {
                      const name = isAz ? product.nameAz : product.nameEn;
                      const category = isAz
                        ? product.categoryNameAz
                        : product.categoryNameEn;

                      return (
                        <li key={product.id} role="option">
                          <Link
                            to={withLang(`/product/${product.id}`)}
                            className={`${styles.searchItem} ${
                              index === activeIndex
                                ? styles.searchItemActive
                                : ""
                            }`}
                            onMouseEnter={() => setActiveIndex(index)}
                            onClick={closeSearch}
                          >
                            <img
                              src={product.image}
                              alt=""
                              className={styles.searchThumb}
                            />
                            <span className={styles.searchInfo}>
                              <span className={styles.searchName}>{name}</span>
                              <span className={styles.searchCategory}>
                                {category}
                              </span>
                            </span>
                            <span className={styles.searchPrice}>
                              {product.price} {CURRENCY}
                            </span>
                          </Link>
                        </li>
                      );
                    })}
                  </ul>
                  <Link
                    to={`${withLang("/search")}?q=${encodeURIComponent(query)}`}
                    className={styles.searchAll}
                    onClick={closeSearch}
                  >
                    {t("searchViewAll")} ({totalMatches}) →
                  </Link>
                </>
              )}
            </div>
          )}
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
          {loggedIn ? (
            <div className={styles.accountWrap} ref={accountRef}>
              <button
                type="button"
                className={`${styles.navbarAction} ${styles.loggedIn}`}
                onClick={() => setAccountOpen((o) => !o)}
                title={currentUser.name}
                aria-label={t("account")}
                aria-haspopup="menu"
                aria-expanded={accountOpen}
              >
                <UserRound />
              </button>

              {accountOpen && (
                <div className={styles.accountMenu} role="menu">
                  <div className={styles.accountInfo}>
                    <span className={styles.accountName}>
                      {currentUser.name}
                    </span>
                    <span className={styles.accountEmail}>
                      {currentUser.email}
                    </span>
                  </div>
                  <button
                    type="button"
                    role="menuitem"
                    className={styles.logoutBtn}
                    onClick={handleLogout}
                  >
                    <LogOut size={18} />
                    <span>{logoutLabel}</span>
                  </button>
                </div>
              )}
            </div>
          ) : (
            <Link
              to={withLang("/login")}
              className={styles.navbarAction}
              title={t("account")}
              aria-label={t("account")}
            >
              <UserRound />
            </Link>
          )}
          <Link
            to={withLang("/wishlist")}
            className={`${styles.navbarAction} ${styles.cartAction}`}
            title={t("wishlist")}
            aria-label={t("wishlist")}
          >
            <Heart />
            {wishlistCount > 0 && (
              <span className={styles.cartBadge}>{wishlistCount}</span>
            )}
          </Link>
          <Link
            to={withLang("/cart")}
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
                to={withLang(path)}
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
            to={withLang("/")}
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
                  to={withLang(path)}
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
                  to={withLang(path)}
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
          {loggedIn && (
            <div className={styles.drawerAccount}>
              <div className={styles.drawerAccountInfo}>
                <span className={styles.drawerAccountName}>
                  {currentUser.name}
                </span>
                <span className={styles.drawerAccountEmail}>
                  {currentUser.email}
                </span>
              </div>
              <button
                type="button"
                className={styles.drawerLogout}
                onClick={handleLogout}
              >
                <LogOut size={18} />
                <span>{logoutLabel}</span>
              </button>
            </div>
          )}
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
