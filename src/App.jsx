import React from "react";
import {
  BrowserRouter,
  Routes,
  Route,
  Navigate,
  Outlet,
  useLocation,
  useParams,
} from "react-router-dom";

import {
  LanguageProvider,
  useLanguage,
  SUPPORTED_LANGS,
  stripLangPrefix,
} from "./context/LanguageContext";

// Components
import Campaigns from "./components/Campaigns/Campaigns";
import Cart from "./components/Cart/Cart";
import HomePage from "./components/HomePage/HomePage";
import Navbar from "./components/Navbar/Navbar";

import BedRoom from "./components/Products/BedRoom/BedRoom";
import LivingRoom from "./components/Products/LivingRoom/LivingRoom";
import Mattresses from "./components/Products/Mattresses/Mattresses";
import Tables from "./components/Products/Tables/Tables";

import RoomBuilder from "./components/RoomBuilder/RoomBuilder";
import Shops from "./components/Shops/Shops";
import Wishlist from "./components/Wishlist/Wishlist";
import AllProducts from "./components/Products/AllProducts/AllProducts";

// Dil prefiksi olmayan (və ya səhv yazılmış) URL-ləri düzgün prefiksli URL-ə yönləndir
// /cart -> /az/cart, /AZ/cart -> /az/cart
const RedirectToLang = () => {
  const { lang } = useLanguage();
  const { pathname, search, hash } = useLocation();

  const rest = stripLangPrefix(pathname);
  const cleanRest = rest === "/" ? "" : rest;

  return <Navigate to={`/${lang}${cleanRest}${search}${hash}`} replace />;
};

// Layout: dili yoxlayır, Navbar və səhifələri göstərir
const LangLayout = () => {
  const { lang: urlLang } = useParams();

  const isSupported = SUPPORTED_LANGS.includes(urlLang?.toLowerCase());
  const isLowerCase = urlLang === urlLang?.toLowerCase();

  // Məs: /cart (lang="cart") və ya /AZ
  if (!isSupported || !isLowerCase) {
    return <RedirectToLang />;
  }

  return (
    <>
      <Navbar />
      <Outlet />
    </>
  );
};

const App = () => {
  return (
    <BrowserRouter>
      <LanguageProvider>
        <Routes>
          <Route path="/:lang" element={<LangLayout />}>
            <Route index element={<HomePage />} />

            {/* Bütün məhsullar */}
            <Route path="products" element={<AllProducts />} />

            <Route path="products/bedroom" element={<BedRoom />} />
            <Route path="products/living-room" element={<LivingRoom />} />
            <Route path="products/mattresses" element={<Mattresses />} />
            <Route path="products/tables" element={<Tables />} />

            <Route path="campaigns" element={<Campaigns />} />
            <Route path="cart" element={<Cart />} />
            <Route path="room-builder" element={<RoomBuilder />} />
            <Route path="shops" element={<Shops />} />
            <Route path="wishlist" element={<Wishlist />} />
          </Route>

          {/* /products/bedroom kimi prefikssiz URL-lər */}
          <Route path="*" element={<RedirectToLang />} />
        </Routes>
      </LanguageProvider>
    </BrowserRouter>
  );
};

export default App;
