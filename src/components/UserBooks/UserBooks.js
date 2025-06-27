import React, { useEffect, useState } from "react";
import { Link, useNavigate } from "react-router-dom"; // Added Link import
import { getAuth, onAuthStateChanged } from "firebase/auth";
import { db } from "../../firebaseConfig";
import { collection, query, where, getDocs } from "firebase/firestore";
import { ChevronDown, ChevronRight } from "lucide-react"; // Import icons
import styles from "./UserBooks.module.css";

function UserBooks() {
  const [user, setUser] = useState(null);
  const [books, setBooks] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const navigate = useNavigate();
  const auth = getAuth();
  const [darkMode, setDarkMode] = useState(false); // Added darkMode state

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, async (currentUser) => {
      if (currentUser) {
        setUser(currentUser);
        try {
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

  if (isLoading) {
    return <div>Loading...</div>;
  }

  return (
    <div className={`${styles.container} ${darkMode ? styles["dark-mode"] : ""}`}>
      {/* Sidebar */}
      <div className={styles.filtersSidebar}>
        <div
          className={styles["admin-sidebar-title"]}
          onClick={() => navigate("/profile")}
        >
          <img src="https://via.placeholder.com/32" alt="Profile" />
          <h2>{user.email.split("@")[0]}</h2> {/* Use email as placeholder */}
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
          <h2>Your Books</h2>
          <p>Pregledaj svoje knjige.</p>
        </div>
        <div className={styles.activeView}>
          <div className={styles.booksList}>
            {books.length === 0 ? (
              <div>No books found.</div>
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