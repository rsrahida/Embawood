import {
  createContext,
  useCallback,
  useContext,
  useMemo,
  useState,
} from "react";
import ToastContainer from "./Toast";

const DEFAULT_DURATION = 3000;
const MAX_TOASTS = 3;
const ToastContext = createContext(null);
let toastId = 0;

export const ToastProvider = ({ children }) => {
  const [toasts, setToasts] = useState([]);

  const closeToast = useCallback((id) => {
    setToasts((prev) => prev.filter((toast) => toast.id !== id));
  }, []);

  const showToast = useCallback((options) => {
    const id = ++toastId;

    setToasts((prev) => [
      ...prev.slice(-(MAX_TOASTS - 1)),
      {
        id,
        variant: "success",
        duration: DEFAULT_DURATION,
        ...options,
      },
    ]);

    return id;
  }, []);

  const value = useMemo(
    () => ({ showToast, closeToast }),
    [showToast, closeToast],
  );

  return (
    <ToastContext.Provider value={value}>
      {children}
      <ToastContainer toasts={toasts} onClose={closeToast} />
    </ToastContext.Provider>
  );
};

export const useToast = () => {
  const ctx = useContext(ToastContext);
  if (!ctx) throw new Error("useToast must be used within ToastProvider");
  return ctx;
};
