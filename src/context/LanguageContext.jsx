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
    catBedroom: "Yataq otağı",
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
    fTitle: "Filtrlər",
    fClearAll: "Hamısını sil",
    fClose: "Filtrləri bağla",
    fSelected: "Seçilmiş filtrlər",
    fRemove: "{label} filtrini sil",
    fInStock: "Stokda var",
    fSale: "Endirimli",
    fNew: "Yeni",
    fSize: "Ölçü",
    fBedType: "Çarpayı növü",
    fMinPrice: "Minimum qiymət",
    fMaxPrice: "Maksimum qiymət",
    fColor: "Rəng",
    fBrand: "Brend",
    fRating: "Reytinq",
    fMinRating: "Minimum reytinq",
    fRatingTag: "{n}+ reytinq",
    fShow: "{n} məhsula bax",
    fFound: "məhsul tapıldı",
    fSortBy: "Sırala:",
    sortDefault: "Standart",
    sortPriceAsc: "Qiymət: ucuzdan bahaya",
    sortPriceDesc: "Qiymət: bahadan ucuza",
    sortRating: "Ən yüksək reytinq",
    sortDiscount: "Ən böyük endirim",
    fEmptyTitle: "Heç bir məhsul tapılmadı",
    fEmptyText:
      "Seçdiyiniz filtrlərə uyğun çarpayı yoxdur. Bəzi filtrləri çıxarıb yenidən cəhd edin.",
    fClear: "Filtrləri təmizlə",
    lSofaType: "Divan növü",
    lSeats: "Yer sayı",
    lSeatsLabel: "{n} nəfərlik",
    lMaterial: "Üzlük materialı",
    lEmptyText:
      "Seçdiyiniz filtrlərə uyğun divan yoxdur. Bəzi filtrləri çıxarıb yenidən cəhd edin.",
    tShape: "Masa forması",
    tChairs: "Stul sayı",
    tChairsLabel: "{n} stullu",
    tMaterial: "Material",
    tEmptyText:
      "Seçdiyiniz filtrlərə uyğun dəst yoxdur. Bəzi filtrləri çıxarıb yenidən cəhd edin.",
    mFirmness: "Sərtlik",
    mType: "Matras növü",
    mEmptyText:
      "Seçdiyiniz filtrlərə uyğun döşək yoxdur. Bəzi filtrləri çıxarıb yenidən cəhd edin.",
    outOfStock: "Stokda yoxdur",
    addToWishlist: "Seçilmişlərə əlavə et",
    allTitle: "Bütün məhsullarımız",
    allSubtitle:
      "Yataq otağından qonaq otağına, yemək masasından rahat döşəklərə qədər evinizin hər küncünə yaraşan, keyfiyyətli və zərif mebelləri bir yerdə kəşf edin.",
    pageLabel: "Səhifə {n} / {total}",
    pdNotFound: "Məhsul tapılmadı",
    pdBack: "Məhsullara qayıt",
    pdReviews: "rəy",
    pdSave: "qənaət edirsiniz",
    pdInStock: "Stokda var",
    pdPcs: "ədəd",
    pdOutOfStock: "Stokda yoxdur",
    pdSize: "Ölçü",
    pdColor: "Rəng",
    pdQty: "Miqdarı",
    pdAddCart: "Səbətə əlavə et",
    pdAdded: "Səbətə əlavə olundu",
    pdAddWish: "Sevimlilərə əlavə et",
    pdInWish: "Sevimlilərdə",
    pdWarranty: "zəmanət",
    pdSecure: "Təhlükəsiz ödəniş",
    pdDelivery: "Çatdırılma imkanı",
    pdAbout: "Məhsul haqqında",
    pdSpecs: "Xüsusiyyətlər",
    pdDelTab: "Çatdırılma və zəmanət",
    pdSimilar: "Bənzər məhsullar",
    pdIsNew: "Yeni",
    pdUnitCm: "sm",
    pdDelText:
      "Çatdırılma şəhər daxili 1–3 iş günü, bölgələrə 3–7 iş günü ərzində həyata keçirilir. Məhsullar ilkin yoxlamadan sonra təhvil verilir.",
    pdWarText:
      "Məhsula istehsalçı zəmanəti verilir. Zəmanət istehsal qüsurlarını əhatə edir, düzgün istifadə şərtləri daxilində qüvvədədir.",
    pdLblMaterial: "Material",
    pdLblColor: "Rəng",
    pdLblSize: "Ölçü",
    pdLblWarranty: "Zəmanət",
    pdLblBrand: "Brend",
    pdLblType: "Növ",
    pdLblSeats: "Oturacaq sayı",
    pdLblShape: "Forma",
    pdLblChairs: "Stul sayı",
    pdLblHeight: "Hündürlük",
    pdLblFirmness: "Sərtlik",
    pdLblCategory: "Kateqoriya",
    pdInstallment: "Hissə-hissə ödəniş",
    pdMonthShort: "ay",
    pdMonthlyPay: "Aylıq ödəniş",
    pdTotal: "Cəmi",
    wishlistTitle: "Seçilmişlər",
    wishlistSubtitle:
      "Bəyəndiyin məhsulları burada saxla və istədiyin vaxt geri qayıt",
    wishlistEmptyTitle: "Seçilmişlər siyahın boşdur",
    wishlistEmptyText:
      "Bəyəndiyin məhsulların üzərindəki ürək ikonuna bas, onlar burada görünəcək.",
    wishlistEmptyBtn: "Məhsullara bax",
    searchNoResults: "Heç nə tapılmadı:",
    searchViewAll: "Bütün nəticələrə bax",
    searchResultsTitle: "Axtarış nəticələri",
    searchResultsFor: "Axtarış:",
    searchEmptyTitle: "Heç bir məhsul tapılmadı",
    searchEmptyText:
      "Başqa açar söz yoxla, məsələn: çarpayı, divan, masa, döşək.",
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
    fTitle: "Filters",
    fClearAll: "Clear all",
    fClose: "Close filters",
    fSelected: "Selected filters",
    fRemove: "Remove {label} filter",
    fInStock: "In stock",
    fSale: "On sale",
    fNew: "New",
    fSize: "Size",
    fBedType: "Bed type",
    fMinPrice: "Minimum price",
    fMaxPrice: "Maximum price",
    fColor: "Color",
    fBrand: "Brand",
    fRating: "Rating",
    fMinRating: "Minimum rating",
    fRatingTag: "{n}+ rating",
    fShow: "View {n} products",
    fFound: "products found",
    fSortBy: "Sort by:",
    sortDefault: "Default",
    sortPriceAsc: "Price: low to high",
    sortPriceDesc: "Price: high to low",
    sortRating: "Top rated",
    sortDiscount: "Biggest discount",
    fEmptyTitle: "No products found",
    fEmptyText:
      "No beds match your selected filters. Try removing some filters and searching again.",
    fClear: "Clear filters",
    lSofaType: "Sofa type",
    lSeats: "Seats",
    lSeatsLabel: "{n} seats",
    lMaterial: "Upholstery material",
    lEmptyText:
      "No sofas match your selected filters. Try removing some filters and searching again.",
    tShape: "Table shape",
    tChairs: "Chairs",
    tChairsLabel: "{n} chairs",
    tMaterial: "Material",
    tEmptyText:
      "No sets match your selected filters. Try removing some filters and searching again.",
    mFirmness: "Firmness",
    mType: "Mattress type",
    mEmptyText:
      "No mattresses match your selected filters. Try removing some filters and searching again.",
    outOfStock: "Out of stock",
    addToWishlist: "Add to wishlist",
    allTitle: "All our products",
    allSubtitle:
      "From bedrooms to living rooms, dining tables to comfortable mattresses, discover quality and elegant furniture that suits every corner of your home, all in one place.",
    pageLabel: "Page {n} / {total}",
    pdNotFound: "Product not found",
    pdBack: "Back to products",
    pdReviews: "reviews",
    pdSave: "you save",
    pdInStock: "In stock",
    pdPcs: "pcs",
    pdOutOfStock: "Out of stock",
    pdSize: "Size",
    pdColor: "Color",
    pdQty: "Quantity",
    pdAddCart: "Add to cart",
    pdAdded: "Added to cart",
    pdAddWish: "Add to wishlist",
    pdInWish: "In wishlist",
    pdWarranty: "warranty",
    pdSecure: "Secure payment",
    pdDelivery: "Delivery available",
    pdAbout: "About the product",
    pdSpecs: "Specifications",
    pdDelTab: "Delivery & warranty",
    pdSimilar: "Similar products",
    pdIsNew: "New",
    pdUnitCm: "cm",
    pdDelText:
      "Delivery takes 1–3 business days within the city and 3–7 business days to other regions. Products are handed over after an initial inspection.",
    pdWarText:
      "The product comes with a manufacturer warranty covering production defects, valid under proper usage conditions.",
    pdLblMaterial: "Material",
    pdLblColor: "Color",
    pdLblSize: "Size",
    pdLblWarranty: "Warranty",
    pdLblBrand: "Brand",
    pdLblType: "Type",
    pdLblSeats: "Seats",
    pdLblShape: "Shape",
    pdLblChairs: "Chairs",
    pdLblHeight: "Height",
    pdLblFirmness: "Firmness",
    pdLblCategory: "Category",
    pdInstallment: "Installment plan",
    pdMonthShort: "mo",
    pdMonthlyPay: "Monthly payment",
    pdTotal: "Total",
    wishlistTitle: "Wishlist",
    wishlistSubtitle:
      "Keep the products you love here and come back to them anytime",
    wishlistEmptyTitle: "Your wishlist is empty",
    wishlistEmptyText:
      "Tap the heart icon on products you like and they will show up here.",
    wishlistEmptyBtn: "Browse products",
    searchNoResults: "No results for",
    searchViewAll: "View all results",
    searchResultsTitle: "Search results",
    searchResultsFor: "Results for",
    searchEmptyTitle: "No products found",
    searchEmptyText:
      "Try another keyword, for example: bed, sofa, table, mattress.",
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
  const t = (key, vars) => {
    let text = translations[language]?.[key] ?? key;
    if (vars) {
      Object.entries(vars).forEach(([name, value]) => {
        text = text.split(`{${name}}`).join(String(value));
      });
    }
    return text;
  };

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
