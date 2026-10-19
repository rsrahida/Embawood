import { useState } from "react";
import Login from "./Login/Login";
import Register from "./Register/Register";
import styles from "./Loginregister.module.css";

export default function LoginRegister({ initialMode = "login" }) {
  const [mode, setMode] = useState(initialMode);
  const flipped = mode === "register";

  return (
    <div className={styles.page}>
      <div className={styles.scene}>
        <div className={`${styles.inner} ${flipped ? styles.flipped : ""}`}>
          <div
            className={`${styles.face} ${styles.front} ${flipped ? styles.hidden : ""}`}
          >
            <Login onSwitch={setMode} />
          </div>
          <div
            className={`${styles.face} ${styles.back} ${!flipped ? styles.hidden : ""}`}
          >
            <Register onSwitch={setMode} />
          </div>
        </div>
      </div>
    </div>
  );
}
