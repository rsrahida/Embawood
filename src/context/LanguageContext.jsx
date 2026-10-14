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
    catAll: "Bütün məhsullar",
    catBedroom: "Yataq",
    catLivingRoom: "Qonaq",
    catTables: "Masa və stullar",
    catMattresses: "Döşəklər",
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
    budgetTitle: "Büdcənizə uyğun seçimlər",
    budgetSubtitle: "Hər kateqoriyada ən sərfəli qiymətlə başlayan məhsullar",
    startingFromPrefix: "",
    startingFromSuffix: "-dən başlayaraq",
    catNameBedroom: "Yataq otağı mebelləri",
    catNameLivingRoom: "Qonaq otağı mebelləri",
    catNameTablesChairs: "Masa və stullar",
    catNameMattresses: "Döşəklər",
    featWarrantyTitle: "3 il zəmanət",
    featWarrantyText: "Məhsullarımıza arxayınıq",
    featDeliveryTitle: "Pulsuz çatdırılma",
    featDeliveryText: "Sürətli, etibarlı və həmişə vaxtında",
    featCreditTitle: "Onlayn kredit",
    featCreditText: "Bir kliklə kredit müraciəti",
    featPaymentTitle: "Onlayn ödəniş",
    featPaymentText: "Bir kliklə təhlükəsiz ödəniş",
    featuresTitle: "Niyə bizi seçməlisiniz?",
    featuresSubtitle: "Alış-verişi rahat və etibarlı edən xidmətlərimiz",
    lovedTitle: "Ən çox bəyənilənlər",
    lovedSubtitle: "Müştərilərimizin ən yüksək qiymətləndirdiyi məhsullar",
    reviewsLabel: "rəy",
    aboutTitle: "Gündəlik həyatı daha rahat edən bir mühit yaradın!",
    aboutText:
      "1996-cı ildə əsası qoyulmuş ilk milli mebel brendi olan Embawood müştəri yönümlü strategiyanı əsas prinsip kimi seçmiş və bu istiqamətdə fəaliyyətini davam etdirir. Şirkət müştəri məmnuniyyətini təmin etmək üçün istehsalat sistemini yeniləyərək, göstərilən xidməti daha yüksək səviyyəyə çatdırmağa nail olmuşdur.",
    aboutBtn: "Otağını qurmağa başla",
    footerLinks: "Faydalı keçidlər",
    footerContact: "Əlaqə",
    footerService: "Xidmət mərkəzi",
    footerWhatsapp: "WhatsApp ilə yazın",
    footerLocations: "Mağaza ünvanları",
    footerRights: "Bütün hüquqlar qorunur.",
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
    catAll: "All products",
    catBedroom: "Bedroom",
    catLivingRoom: "Living room",
    catTables: "Tables & Chairs",
    catMattresses: "Mattresses",
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
    budgetTitle: "Picks that fit your budget",
    budgetSubtitle: "Products starting at the best price in every category",
    startingFromPrefix: "Starting from ",
    startingFromSuffix: "",
    catNameBedroom: "Bedroom furniture",
    catNameLivingRoom: "Living room furniture",
    catNameTablesChairs: "Tables & chairs",
    catNameMattresses: "Mattresses",
    featWarrantyTitle: "3-year warranty",
    featWarrantyText: "We stand behind our products",
    featDeliveryTitle: "Free delivery",
    featDeliveryText: "Fast, reliable and always on time",
    featCreditTitle: "Online credit",
    featCreditText: "Apply for credit in one click",
    featPaymentTitle: "Online payment",
    featPaymentText: "Secure payment in one click",
    featuresTitle: "Why choose us?",
    featuresSubtitle: "Services that make shopping easy and reliable",
    lovedTitle: "Most loved",
    lovedSubtitle: "The products our customers rate highest",
    reviewsLabel: "reviews",
    aboutTitle: "Create an environment that makes everyday life easier!",
    aboutText:
      "Embawood, the first national furniture brand, founded in 1996, has made a customer-oriented strategy its core principle and continues to operate in this direction. To ensure customer satisfaction, the company has renewed its production system and raised the quality of its service to a higher level.",
    aboutBtn: "Start building your room",
    footerLinks: "Quick links",
    footerContact: "Contact",
    footerService: "Customer service",
    footerWhatsapp: "Chat on WhatsApp",
    footerLocations: "Store locations",
    footerRights: "All rights reserved.",
  },
};

export const SUPPORTED_LANGS = ["az", "en"];
export const getSavedLang = () => {
  const saved = localStorage.getItem("language");
  return saved === "EN" ? "en" : "az";
};
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
  const segment = pathname.split("/")[1]?.toLowerCase();
  const urlLang = SUPPORTED_LANGS.includes(segment) ? segment : null;
  const lang = urlLang ?? getSavedLang();
  const language = lang.toUpperCase();

  useEffect(() => {
    localStorage.setItem("language", language);
    document.documentElement.lang = lang;
  }, [language, lang]);

  const setLanguage = (next) => {
    const nextLang = String(next).toLowerCase();

    if (!SUPPORTED_LANGS.includes(nextLang) || nextLang === lang) return;

    const rest = stripLangPrefix(pathname);
    const cleanRest = rest === "/" ? "" : rest;

    navigate(`/${nextLang}${cleanRest}${search}${hash}`);
  };

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
