import React, { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import InputControl from "../InputControl/InputControl";
import { createUserWithEmailAndPassword, updateProfile } from "firebase/auth";
import { auth, db } from "../../firebaseConfig";
import { doc, setDoc } from "firebase/firestore";
import styles from "./Signup.module.css";

function Signup() {
  const navigate = useNavigate();
  const [values, setValues] = useState({
    name: "",
    lastname: "",
    email: "",
    password: "",
    phone: "",
    company: "",
    position: "",
  });

  const [errorMsg, setErrorMsg] = useState("");
  const [submitButtonDisabled, setSubmitButtonDisabled] = useState(false);
  const [passwordVisible, setPasswordVisible] = useState(false);

  const handleSubmissions = () => {
    if (
      !values.name ||
      !values.lastname ||
      !values.email ||
      !values.password ||
      !values.phone ||
      !values.company ||
      !values.position
    ) {
      setErrorMsg("Fill all fields");
      return;
    }
    setErrorMsg("");
    setSubmitButtonDisabled(true);

    createUserWithEmailAndPassword(auth, values.email, values.password)
      .then(async (res) => {
        const user = res.user;
        await updateProfile(user, {
          displayName: values.name,
          displayLastname: values.lastname,
          displayEmail: values.email,
          displayPassword: values.password,
          displayPhone: values.phone,
          displayCompany: values.company,
          displayPosition: values.position,
        });
        // Add user data to Firestore
        await setDoc(doc(db, "users", user.uid), {
          name: values.name,
          lastname: values.lastname,
          email: values.email,
          password: values.password,
          phone: values.phone,
          company: values.company,
          position: values.position,
        });
        navigate("/");
      })
      .catch((err) => {
        setErrorMsg(err.message);
      })
      .finally(() => {
        setSubmitButtonDisabled(false);
      });
  };

  return (
    <div
      className={`${styles.container} ${
        document.body.classList.contains("dark-mode") ? styles["dark-mode"] : ""
      }`}
    >
      <div className={styles.filtersSidebar}>
        <div className={styles["admin-sidebar-menu"]}>
          <button
            className={`${styles["admin-sidebar-btn"]} ${styles["organization-btn"]}`}
            onClick={handleSubmissions}
            disabled={submitButtonDisabled}
          >
            📝 Registruj se
          </button>
          <button
            className={`${styles["admin-sidebar-btn"]} ${styles["organization-btn"]}`}
            onClick={() => setPasswordVisible(!passwordVisible)}
          >
            👁️ Prikaži lozinku
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
          <h2>Registracija</h2>
          <p>Unesite svoje podatke za registraciju.</p>
        </div>
        <div className={styles.activeView}>
          <div className={styles.innerBox}>
            <InputControl
              label="Ime"
              placeholder="Unesite vaše ime..."
              onChange={(event) =>
                setValues((prev) => ({ ...prev, name: event.target.value }))
              }
            />
            <InputControl
              label="Prezime"
              placeholder="Unesite vaše prezime..."
              onChange={(event) =>
                setValues((prev) => ({ ...prev, lastname: event.target.value }))
              }
            />
            <InputControl
              label="Email"
              placeholder="Unesite vašu email adresu..."
              onChange={(event) =>
                setValues((prev) => ({ ...prev, email: event.target.value }))
              }
            />
            <InputControl
              label="Lozinka"
              type={passwordVisible ? "text" : "password"}
              placeholder="Unesite vašu lozinku..."
              onChange={(event) =>
                setValues((prev) => ({ ...prev, password: event.target.value }))
              }
            />
            <InputControl
              label="Telefon"
              placeholder="Unesite vaš telefon..."
              onChange={(event) =>
                setValues((prev) => ({ ...prev, phone: event.target.value }))
              }
            />
            <InputControl
              label="Kompanija"
              placeholder="Unesite naziv kompanije..."
              onChange={(event) =>
                setValues((prev) => ({ ...prev, company: event.target.value }))
              }
            />
            <InputControl
              label="Pozicija"
              placeholder="Unesite vašu poziciju u kompaniji..."
              onChange={(event) =>
                setValues((prev) => ({ ...prev, position: event.target.value }))
              }
            />
            <div className={styles.footer}>
              <p className={styles.errorMsg}>{errorMsg}</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

export default Signup;