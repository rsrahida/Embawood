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
    // Slider
    heroBadge1: "Yeni kolleksiya",
    heroTitle1: "Yuxu rahatlığı evinizdə başlayır",
    heroText1:
      "Yataq otağı dəstləri ilə evinizə zərif və rahat görünüş qazandırın.",
    heroBtn1: "Yataqlara bax",

    heroBadge2: "Ən çox satılanlar",
    heroTitle2: "Qonaq otağınız sizi təmsil edir",
    heroText2:
      "Divanlar, künc dəstləri və jurnal masaları ilə isti ab-hava yaradın.",
    heroBtn2: "Qonaq otağına bax",

    heroBadge3: "Yeni imkan",
    heroTitle3: "Otağınızı özünüz qurun",
    heroText3: "Mebelləri seçin, düzün və xəyalınızdakı otağı öncədən görün.",
    heroBtn3: "Otağını qur",

    prevSlide: "Əvvəlki slayd",
    nextSlide: "Növbəti slayd",
    goToSlide: "Slayda keç",
    scrollTop: "Yuxarı qalx",
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
    // Slider
    heroBadge1: "New collection",
    heroTitle1: "Sweet dreams start at home",
    heroText1:
      "Give your bedroom an elegant and comfortable look with our bedroom sets.",
    heroBtn1: "Shop bedrooms",

    heroBadge2: "Best sellers",
    heroTitle2: "Your living room tells your story",
    heroText2:
      "Create a warm atmosphere with sofas, corner sets and coffee tables.",
    heroBtn2: "Shop living room",

    heroBadge3: "New feature",
    heroTitle3: "Build your own room",
    heroText3:
      "Pick furniture, arrange it and preview your dream room in advance.",
    heroBtn3: "Build your room",

    prevSlide: "Previous slide",
    nextSlide: "Next slide",
    goToSlide: "Go to slide",
    scrollTop: "Back to top",
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
