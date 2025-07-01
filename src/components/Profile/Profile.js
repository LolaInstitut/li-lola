import React, { useState, useEffect } from "react";
import { auth, db } from "../../firebaseConfig";
import { doc, getDoc, updateDoc } from "firebase/firestore";
import { updateProfile } from "firebase/auth";
import InputControl from "../InputControl/InputControl";
import { useNavigate } from "react-router-dom";
import { ChevronDown, ChevronRight } from "lucide-react";
import styles from "./Profile.module.css";

function Profile() {
  const [user, setUser] = useState(null);
  const [values, setValues] = useState({
    name: "",
    lastname: "",
    email: "",
    phone: "",
    company: "",
    position: "",
  });
  const [errorMsg, setErrorMsg] = useState("");
  const navigate = useNavigate();
  const [darkMode, setDarkMode] = useState(() => {
    return localStorage.getItem("darkMode") === "true";
  });

  useEffect(() => {
    if (auth.currentUser) {
      setUser(auth.currentUser);
      const fetchData = async () => {
        const userDoc = await getDoc(doc(db, "users", auth.currentUser.uid));
        if (userDoc.exists()) {
          const userData = userDoc.data();
          setValues(userData);
        } else {
          setErrorMsg("No user data found.");
        }
      };
      fetchData();
    } else {
      navigate("/login");
    }
  }, [navigate]);

  useEffect(() => {
    if (darkMode) {
      document.body.classList.add("dark-mode");
      localStorage.setItem("darkMode", "true");
    } else {
      document.body.classList.remove("dark-mode");
      localStorage.setItem("darkMode", "false");
    }
  }, [darkMode]);

  const handleUpdate = async () => {
    if (!values.name || !values.lastname) {
      setErrorMsg("Name and Last Name fields cannot be empty.");
      return;
    }
    setErrorMsg("");
    try {
      await updateProfile(auth.currentUser, {
        displayName: `${values.name} ${values.lastname}`,
      });
      await updateDoc(doc(db, "users", auth.currentUser.uid), {
        name: values.name,
        lastname: values.lastname,
        phone: values.phone,
        company: values.company,
        position: values.position,
      });
      navigate("/"); // Redirect to Home page after successful update
    } catch (error) {
      setErrorMsg("Error updating profile: " + error.message);
    }
  };

  if (!user) {
    return <div>Loading or not authenticated...</div>;
  }

  return (
    <div className={`${styles.container} ${darkMode ? styles["dark-mode"] : ""}`}>
      {/* Sidebar */}
      <div className={styles.filtersSidebar}>
        <div
          className={styles["admin-sidebar-title"]}
          onClick={() => navigate("/profile")}
        >
          <img src="/user.png" alt="Profile" />
          <h2>{user.email.split("@")[0]}</h2>
        </div>
        <div className={styles["admin-sidebar-menu"]}>
          <button
            onClick={handleUpdate}
            className={`${styles["admin-sidebar-btn"]} ${styles["organization-btn"]}`}
          >
            🔄 Izmeni podatke profila
          </button>
          <button
            onClick={() => navigate("/userbook")}
            className={`${styles["admin-sidebar-btn"]} ${styles["organization-btn"]}`}
          >
            📖 Knjige korisnika
          </button>
          <button
            onClick={() => navigate("/")}
            className={`${styles["admin-sidebar-btn"]} ${styles["organization-btn"]}`}
          >
            ⬅️ Vrati na prethodnu stranu
          </button>
          <button
            className={`${styles["admin-sidebar-btn"]} ${styles["organization-btn"]}`}
            onClick={() => setDarkMode(!darkMode)}
          >
            🌗 {darkMode ? "Svetli mod" : "Tamni mod"}
          </button>
        </div>
      </div>

      {/* Main Content */}
      <div className={styles.mainContent}>
        <div className={styles["admin-welcome"]}>
          <h2>Profil</h2>
          <p>Ažurirajte svoje podatke.</p>
        </div>
        <div className={styles.activeView}>
          <div className={styles.formContainer}>
            <div className={styles["inputControl"]}>
              <label>Name</label>
              <InputControl
                value={values.name}
                onChange={(event) =>
                  setValues((prev) => ({ ...prev, name: event.target.value }))
                }
              />
            </div>
            <div className={styles["inputControl"]}>
              <label>Last Name</label>
              <InputControl
                value={values.lastname}
                onChange={(event) =>
                  setValues((prev) => ({ ...prev, lastname: event.target.value }))
                }
              />
            </div>
            <div className={styles["inputControl"]}>
              <label>Email</label>
              <InputControl
                value={values.email}
                onChange={() => {}}
                disabled={true}
              />
            </div>
            <div className={styles["inputControl"]}>
              <label>Phone</label>
              <InputControl
                value={values.phone}
                onChange={(event) =>
                  setValues((prev) => ({ ...prev, phone: event.target.value }))
                }
              />
            </div>
            <div className={styles["inputControl"]}>
              <label>Company</label>
              <InputControl
                value={values.company}
                onChange={(event) =>
                  setValues((prev) => ({ ...prev, company: event.target.value }))
                }
              />
            </div>
            <div className={styles["inputControl"]}>
              <label>Position</label>
              <InputControl
                value={values.position}
                onChange={(event) =>
                  setValues((prev) => ({ ...prev, position: event.target.value }))
                }
              />
            </div>
            {errorMsg && <p className={styles.errorMsg}>{errorMsg}</p>}
          </div>
        </div>
      </div>
    </div>
  );
}

export default Profile;