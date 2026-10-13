import React, { createContext, useContext, useEffect } from "react";
import { useLocation, useNavigate } from "react-router-dom";

const translations = {
  AZ: {
    home: "Ana səhifə",
    shops: "Mağazalar",
    roomBuilder: "Otağını qur",
    campaigns: "Kampaniyalar",
    placeholder: "Eviniz üçün nə axtarırsınız?",
    search: "Axtar",
    account: "Profilim",
    wishlist: "Sevimlilər",
    cart: "Səbət",
    phone: "Zəng et",
    menu: "Menyu",
    close: "Bağla",

    bedroom: "Yataq otağı",
    livingRoom: "Qonaq otağı",
    mattresses: "Döşəklər",
    tables: "Masalar",
    products: "Məhsullar",
    addToCart: "Səbətə əlavə et",
    viewAll: "Hamısına bax",
    price: "Qiymət",

    // Kateqoriya menyusu
    catAll: "Bütün məhsullar",
    catBedroom: "Yataq",
    catLivingRoom: "Qonaq",
    catTables: "Masa və stullar",
    catMattresses: "Döşəklər",
  },

  EN: {
    home: "Home",
    shops: "Stores",
    roomBuilder: "Build Your Room",
    campaigns: "Campaigns",
    placeholder: "What are you looking for?",
    search: "Search",
    account: "My account",
    wishlist: "Wishlist",
    cart: "Cart",
    phone: "Call us",
    menu: "Menu",
    close: "Close",

    bedroom: "Bedroom",
    livingRoom: "Living room",
    mattresses: "Mattresses",
    tables: "Tables",
    products: "Products",
    addToCart: "Add to cart",
    viewAll: "View all",
    price: "Price",

    // Category menu
    catAll: "All products",
    catBedroom: "Bedroom",
    catLivingRoom: "Living room",
    catTables: "Tables & Chairs",
    catMattresses: "Mattresses",
  },
};

export const SUPPORTED_LANGS = ["az", "en"];

// localStorage-dən son seçilmiş dili oxu ("az" | "en")
export const getSavedLang = () => {
  const saved = localStorage.getItem("language");
  return saved === "EN" ? "en" : "az";
};

// Yolun əvvəlindəki dil prefiksini (böyük/kiçik hərfdən asılı olmayaraq) sil
// "/AZ/cart" -> "/cart", "/cart" -> "/cart", "/en" -> "/"
export const stripLangPrefix = (pathname) => {
  const parts = pathname.split("/");
  const first = parts[1]?.toLowerCase();

  if (SUPPORTED_LANGS.includes(first)) {
    const rest = "/" + parts.slice(2).join("/");
    return rest;
  }

  return pathname;
};

const LanguageContext = createContext(null);

export const LanguageProvider = ({ children }) => {
  const { pathname, search, hash } = useLocation();
  const navigate = useNavigate();

  // URL-dən dili oxu: /az/... və ya /en/...
  const segment = pathname.split("/")[1]?.toLowerCase();
  const urlLang = SUPPORTED_LANGS.includes(segment) ? segment : null;

  const lang = urlLang ?? getSavedLang(); // "az" | "en"
  const language = lang.toUpperCase(); // "AZ" | "EN"

  useEffect(() => {
    localStorage.setItem("language", language);
    document.documentElement.lang = lang;
  }, [language, lang]);

  // Dili dəyiş -> URL-in prefiksini dəyiş
  const setLanguage = (next) => {
    const nextLang = String(next).toLowerCase();

    if (!SUPPORTED_LANGS.includes(nextLang) || nextLang === lang) return;

    const rest = stripLangPrefix(pathname);
    const cleanRest = rest === "/" ? "" : rest;

    navigate(`/${nextLang}${cleanRest}${search}${hash}`);
  };

  // Linkləri dilə uyğunlaşdır: lp("/cart") -> "/az/cart", lp("/") -> "/az"
  const lp = (path = "/") => `/${lang}${path === "/" ? "" : path}`;

  const t = (key) => translations[language]?.[key] ?? key;

  return (
    <LanguageContext.Provider value={{ language, lang, setLanguage, lp, t }}>
      {children}
    </LanguageContext.Provider>
  );
};

export const useLanguage = () => {
  const context = useContext(LanguageContext);

  if (!context) {
    throw new Error(
      "useLanguage LanguageProvider daxilində istifadə edilməlidir.",
    );
  }

  return context;
};
