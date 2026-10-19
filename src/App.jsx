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
import { WishlistProvider } from "./context/WishlistContext";
import { CartProvider } from "./context/CartContext";
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
import ScrollToTop from "./components/ScrollToTop/ScrollToTop";
import Footer from "./components/Footer/Footer";
import ProductsDetail from "./shared/components/ProductsDetail/ProductsDetail";
import { ToastProvider } from "./shared/components/Toast/ToastProvider";
import SearchResults from "./components/SearchResults/SearchResults";
import LoginRegister from "./components/LoginRegister/Loginregister";

const RedirectToLang = () => {
  const { lang } = useLanguage();
  const { pathname, search, hash } = useLocation();
  const rest = stripLangPrefix(pathname);
  const cleanRest = rest === "/" ? "" : rest;

  return <Navigate to={`/${lang}${cleanRest}${search}${hash}`} replace />;
};

const LangLayout = () => {
  const { lang: urlLang } = useParams();
  const isSupported = SUPPORTED_LANGS.includes(urlLang?.toLowerCase());
  const isLowerCase = urlLang === urlLang?.toLowerCase();
  if (!isSupported || !isLowerCase) {
    return <RedirectToLang />;
  }

  return (
    <>
      <Navbar />
      <Outlet />
      <Footer />
    </>
  );
};

const App = () => {
  return (
    <BrowserRouter>
      <LanguageProvider>
        <ToastProvider>
          <WishlistProvider>
            <CartProvider>
              <Routes>
                <Route path="/:lang" element={<LangLayout />}>
                  <Route index element={<HomePage />} />
                  <Route path="products" element={<AllProducts />} />
                  <Route path="products/bedroom" element={<BedRoom />} />
                  <Route path="products/living-room" element={<LivingRoom />} />
                  <Route path="products/mattresses" element={<Mattresses />} />
                  <Route path="products/tables" element={<Tables />} />
                  <Route path="product/:id" element={<ProductsDetail />} />
                  <Route path="campaigns" element={<Campaigns />} />
                  <Route path="cart" element={<Cart />} />
                  <Route path="room-builder" element={<RoomBuilder />} />
                  <Route path="shops" element={<Shops />} />
                  <Route path="wishlist" element={<Wishlist />} />
                  <Route path="search" element={<SearchResults />} />
                  <Route path="login" element={<LoginRegister />} />
                  <Route
                    path="register"
                    element={<LoginRegister initialMode="register" />}
                  />
                </Route>
                <Route path="*" element={<RedirectToLang />} />
              </Routes>
              <ScrollToTop />
            </CartProvider>
          </WishlistProvider>
        </ToastProvider>
      </LanguageProvider>
    </BrowserRouter>
  );
};

export default App;
