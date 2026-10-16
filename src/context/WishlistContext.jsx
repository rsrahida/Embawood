import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useState,
} from "react";
import { useLanguage } from "./LanguageContext";
import { useToast } from "../shared/components/Toast/ToastProvider";

const STORAGE_KEY = "embawood_wishlist";

const WishlistContext = createContext(null);

const TEXTS = {
  az: {
    added: "Wishlist-ə əlavə olundu",
    removed: "Wishlist-dən çıxarıldı",
  },
  en: {
    added: "Added to wishlist",
    removed: "Removed from wishlist",
  },
};

const readStorage = () => {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    const parsed = raw ? JSON.parse(raw) : [];
    return Array.isArray(parsed) ? parsed : [];
  } catch {
    return [];
  }
};

export const WishlistProvider = ({ children }) => {
  const { lang } = useLanguage();
  const { showToast } = useToast();
  const [items, setItems] = useState(readStorage);

  useEffect(() => {
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(items));
    } catch {}
  }, [items]);

  const isInWishlist = useCallback(
    (id) => items.some((item) => item.id === id),
    [items],
  );

  const toggleWishlist = useCallback(
    (product) => {
      const exists = items.some((item) => item.id === product.id);
      const isAz = lang === "az";
      const text = TEXTS[isAz ? "az" : "en"];
      const name = isAz ? product.nameAz : product.nameEn;

      setItems((prev) =>
        exists
          ? prev.filter((item) => item.id !== product.id)
          : [...prev, product],
      );

      showToast({
        variant: exists ? "danger" : "success",
        title: exists ? text.removed : text.added,
        message: name,
        image: product.image,
      });
    },
    [items, lang, showToast],
  );

  const removeFromWishlist = useCallback((id) => {
    setItems((prev) => prev.filter((item) => item.id !== id));
  }, []);

  const value = useMemo(
    () => ({
      items,
      count: items.length,
      isInWishlist,
      toggleWishlist,
      removeFromWishlist,
    }),
    [items, isInWishlist, toggleWishlist, removeFromWishlist],
  );

  return (
    <WishlistContext.Provider value={value}>
      {children}
    </WishlistContext.Provider>
  );
};

export const useWishlist = () => {
  const ctx = useContext(WishlistContext);
  if (!ctx) throw new Error("useWishlist must be used within WishlistProvider");
  return ctx;
};
