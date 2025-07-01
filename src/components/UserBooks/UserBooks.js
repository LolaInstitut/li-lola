import React, { useEffect, useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { getAuth, onAuthStateChanged } from "firebase/auth";
import { db } from "../../firebaseConfig";
import { collection, query, where, getDocs, doc, getDoc } from "firebase/firestore";
import { ChevronDown, ChevronRight } from "lucide-react";
import styles from "./UserBooks.module.css";

function UserBooks() {
  const [user, setUser] = useState(null);
  const [userName, setUserName] = useState("Korisnik");
  const [books, setBooks] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const navigate = useNavigate();
  const auth = getAuth();
  const [darkMode, setDarkMode] = useState(() => {
    return localStorage.getItem("darkMode") === "true";
  });

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, async (currentUser) => {
      if (currentUser) {
        setUser(currentUser);
        try {
          const userDoc = await getDoc(doc(db, "users", currentUser.uid));
          if (userDoc.exists()) {
            const userData = userDoc.data();
            setUserName(userData.name || currentUser.email.split("@")[0] || "Korisnik");
          }
          const q = query(
            collection(db, "books"),
            where("userId", "==", currentUser.uid)
          );
          const querySnapshot = await getDocs(q);
          const userBooks = querySnapshot.docs.map((doc) => ({
            id: doc.id,
            ...doc.data(),
          }));
          setBooks(userBooks);
        } catch (error) {
          console.error("Error fetching user books:", error);
        }
      } else {
        navigate("/login");
      }
      setIsLoading(false);
    });

    return () => unsubscribe();
  }, [navigate, auth]);

  useEffect(() => {
    if (darkMode) {
      document.body.classList.add("dark-mode");
      localStorage.setItem("darkMode", "true");
    } else {
      document.body.classList.remove("dark-mode");
      localStorage.setItem("darkMode", "false");
    }
  }, [darkMode]);

  if (isLoading) {
    return (
      <div className={styles.loaderContainer}>
        <div className={styles.dancingLetters}>
          {"LOLA Institut".split("").map((letter, index) => (
            <span
              key={index}
              className={styles.letter}
              style={{ animationDelay: `${index * 0.15}s` }}
            >
              {letter === " " ? "\u00A0" : letter}
            </span>
          ))}
        </div>
      </div>
    );
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
          <h2>{userName}</h2>
        </div>
        <div className={styles["admin-sidebar-menu"]}>
          <button
            onClick={() => navigate("/profile")}
            className={`${styles["admin-sidebar-btn"]} ${styles["organization-btn"]}`}
          >
            🔐 Profil
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
          <h2>Pregledaj svoje knjige</h2>
        </div>
        <div className={styles.activeView}>
          <div className={styles.booksList}>
            {books.length === 0 ? (
              <div>Nema dodatih knjiga.</div>
            ) : (
              <table className={styles.booksTable}>
                <thead>
                  <tr>
                    <th>Book Title</th>
                  </tr>
                </thead>
                <tbody>
                  {books.map((book) => (
                    <tr key={book.id}>
                      <td>
                        <Link to={`/book/${book.id}`} className={styles.bookTitleLink}>
                          {book.title}
                        </Link>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}

export default UserBooks;