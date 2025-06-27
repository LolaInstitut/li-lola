import React, { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { signInWithEmailAndPassword, sendPasswordResetEmail } from "firebase/auth";
import { auth } from "../../firebaseConfig";
import InputControl from "../InputControl/InputControl";
import styles from "./Login.module.css";

function Login() {
  const navigate = useNavigate();
  const [values, setValues] = useState({
    email: "",
    password: "",
  });

  const [errorMsg, setErrorMsg] = useState("");
  const [submitButtonDisabled, setSubmitButtonDisabled] = useState(false);
  const [passwordVisible, setPasswordVisible] = useState(false);

  const handleSubmissions = () => {
    if (!values.email || !values.password) {
      setErrorMsg("Fill all fields");
      return;
    }
    setErrorMsg("");
    setSubmitButtonDisabled(true);

    signInWithEmailAndPassword(auth, values.email, values.password)
      .then(async (res) => {
        setSubmitButtonDisabled(false);
        navigate("/home");
      })
      .catch((err) => {
        setSubmitButtonDisabled(false);
        setErrorMsg(err.message);
      });
  };

  const handleForgotPassword = () => {
    if (!values.email) {
      setErrorMsg("Please enter your email address to reset your password.");
      return;
    }
    sendPasswordResetEmail(auth, values.email)
      .then(() => {
        setErrorMsg("Password reset email sent!");
      })
      .catch((err) => {
        setErrorMsg(err.message);
      });
  };

  return (
    <div className={`${styles.container} ${document.body.classList.contains("dark-mode") ? styles["dark-mode"] : ""}`}>
      <div className={styles.filtersSidebar}>
        <div className={styles["admin-sidebar-menu"]}>
          <button
            className={`${styles["admin-sidebar-btn"]} ${styles["organization-btn"]}`}
            onClick={() => setPasswordVisible(!passwordVisible)}
          >
            👁️ Prikaži lozinku
          </button>
          <button
            className={`${styles["admin-sidebar-btn"]} ${styles["organization-btn"]}`}
            onClick={handleForgotPassword}
          >
            🔑 Zaboravljena lozinka
          </button>
          <button
            className={`${styles["admin-sidebar-btn"]} ${styles["organization-btn"]}`}
            onClick={handleSubmissions}
            disabled={submitButtonDisabled}
          >
            🚪 Uloguj se
          </button>
          <button
            className={`${styles["admin-sidebar-btn"]} ${styles["organization-btn"]}`}
            onClick={() => navigate("/signup")}
          >
            📝 Registruj se
          </button>
          <button
            className={`${styles["admin-sidebar-btn"]} ${styles["organization-btn"]}`}
            onClick={() => navigate(-1)}
          >
            ⬅️ Vrati na prethodnu stranu
          </button>
        </div>
      </div>

      <div className={styles.mainContent}>
        <div className={styles["admin-welcome"]}>
          <h2>Prijava</h2>
          <p>Unesite svoje podatke za prijavu.</p>
        </div>
        <div className={styles.activeView}>
          <div className={styles.innerBox}>
            <InputControl
              label="Email"
              onChange={(event) =>
                setValues((prev) => ({ ...prev, email: event.target.value }))
              }
              placeholder="Unesite vašu email adresu..."
            />
            <InputControl
              label="Lozinka"
              type={passwordVisible ? "text" : "password"}
              onChange={(event) =>
                setValues((prev) => ({ ...prev, password: event.target.value }))
              }
              placeholder="Unesite vašu lozinku..."
            />
            <div className={styles.footer}>
              <p className={styles.error}>{errorMsg}</p>
              <button disabled={submitButtonDisabled} onClick={handleSubmissions}>
                Prijavi se
              </button>
              <p>
                Nemate nalog?{" "}
                <span>
                  <Link to="/signup">Registrujte se</Link>
                </span>
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

export default Login;