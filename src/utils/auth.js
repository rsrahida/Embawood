const USERS_KEY = "users";
const CURRENT_KEY = "currentUser";
export const AUTH_EVENT = "auth-change";

const read = (key, fallback) => {
  try {
    const value = localStorage.getItem(key);
    return value ? JSON.parse(value) : fallback;
  } catch {
    return fallback;
  }
};

const notifyAuthChange = () => window.dispatchEvent(new Event(AUTH_EVENT));

export function registerUser({ name, email, password }) {
  const users = read(USERS_KEY, []);
  const normalized = email.trim().toLowerCase();

  if (users.some((u) => u.email === normalized)) {
    return { ok: false, message: "Bu e-poçt artıq qeydiyyatdan keçib." };
  }

  const user = {
    id: Date.now(),
    name: name.trim(),
    email: normalized,
    password,
  };
  localStorage.setItem(USERS_KEY, JSON.stringify([...users, user]));
  return { ok: true };
}

export function loginUser({ email, password }) {
  const users = read(USERS_KEY, []);
  const normalized = email.trim().toLowerCase();
  const user = users.find(
    (u) => u.email === normalized && u.password === password,
  );

  if (!user) {
    return { ok: false, message: "E-poçt və ya şifrə yanlışdır." };
  }

  const { id, name } = user;
  localStorage.setItem(
    CURRENT_KEY,
    JSON.stringify({ id, name, email: user.email }),
  );
  notifyAuthChange();
  return { ok: true };
}

export const getCurrentUser = () => read(CURRENT_KEY, null);

export const logoutUser = () => {
  localStorage.removeItem(CURRENT_KEY);
  notifyAuthChange();
};
