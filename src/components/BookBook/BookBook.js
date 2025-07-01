import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { auth, db } from "../../firebaseConfig";
import { collection, getDocs, setDoc, doc, serverTimestamp } from "firebase/firestore";
import { ChevronDown, ChevronRight } from "lucide-react";
import styles from "./BookBook.module.css"; // Reusing Book module styles for consistency

function BookBook() {
  const [user, setUser] = useState(null);
  const [books, setBooks] = useState([]);
  const [selectedBookId, setSelectedBookId] = useState("");
  const [rentalDuration, setRentalDuration] = useState(7); // Default to 7 days
  const [errorMsg, setErrorMsg] = useState("");
  const [successMsg, setSuccessMsg] = useState("");
  const [submitButtonDisabled, setSubmitButtonDisabled] = useState(false);
  const [darkMode, setDarkMode] = useState(() => {
    return localStorage.getItem("darkMode") === "true";
  });
  const navigate = useNavigate();

  useEffect(() => {
    if (auth.currentUser) {
      setUser(auth.currentUser);
      const fetchBooks = async () => {
        try {
          const querySnapshot = await getDocs(collection(db, "books"));
          const booksList = querySnapshot.docs.map((doc) => ({
            id: doc.id,
            ...doc.data(),
          }));
          setBooks(booksList);
        } catch (error) {
          console.error("Error fetching books: ", error);
          setErrorMsg("Greška prilikom učitavanja knjiga.");
        }
      };
      fetchBooks();
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

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!selectedBookId) {
      setErrorMsg("Izaberite knjigu za iznajmljivanje.");
      return;
    }
    if (!rentalDuration || rentalDuration < 1) {
      setErrorMsg("Unesite validno trajanje iznajmljivanja.");
      return;
    }

    if (!window.confirm("Da li ste sigurni da želite da iznajmite ovu knjigu?")) {
      return;
    }

    setErrorMsg("");
    setSuccessMsg("");
    setSubmitButtonDisabled(true);

    try {
      const selectedBook = books.find((book) => book.id === selectedBookId);
      const rentalData = {
        userId: auth.currentUser.uid,
        bookId: selectedBookId,
        bookTitle: selectedBook.title,
        rentalDate: serverTimestamp(),
        durationDays: parseInt(rentalDuration),
        status: "active",
      };

      await setDoc(
        doc(db, "rentals", `${auth.currentUser.uid}_${selectedBookId}_${Date.now()}`),
        rentalData
      );
      setSuccessMsg("Knjiga je uspešno iznajmljena!");
      setTimeout(() => navigate("/home"), 2000);
    } catch (error) {
      setErrorMsg("Greška prilikom iznajmljivanja knjige: " + error.message);
      console.error("Error renting book:", error);
    } finally {
      setSubmitButtonDisabled(false);
    }
  };

  const handleBack = () => {
    navigate(-1);
  };

  if (!user) {
    return <div className={styles.loading}>Učitavanje...</div>;
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
          <h2>{auth.currentUser?.email.split("@")[0] || "Korisnik"}</h2>
        </div>
        <div className={styles["admin-sidebar-menu"]}>
          <button
            onClick={() => navigate("/profile")}
            className={`${styles["admin-sidebar-btn"]} ${styles["organization-btn"]}`}
          >
            🔐 Profil
          </button>
          <button
            onClick={handleBack}
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
          <h2>Iznajmljivanje knjige</h2>
          <p>Popunite formu za iznajmljivanje knjige.</p>
        </div>
        <div className={styles.activeView}>
          <div className={styles.formContainer}>
            <form onSubmit={handleSubmit}>
              <div className={styles["inputControl"]}>
                <label>Izaberite knjigu</label>
                <select
                  value={selectedBookId}
                  onChange={(e) => setSelectedBookId(e.target.value)}
                  className={styles.selectInput}
                >
                  <option value="">-- Izaberite knjigu --</option>
                  {books.map((book) => (
                    <option key={book.id} value={book.id}>
                      {book.title} - {book.authors.join(", ")}
                    </option>
                  ))}
                </select>
              </div>
              <div className={styles["inputControl"]}>
                <label>Trajanje iznajmljivanja (dani)</label>
                <input
                  type="number"
                  min="1"
                  value={rentalDuration}
                  onChange={(e) => setRentalDuration(e.target.value)}
                  className={styles.numberInput}
                />
              </div>
              {errorMsg && <p className={styles.errorMsg}>{errorMsg}</p>}
              {successMsg && <p className={styles.successMsg}>{successMsg}</p>}
              <button
                type="submit"
                className={`${styles["admin-sidebar-btn"]} ${styles["organization-btn"]}`}
                disabled={submitButtonDisabled}
              >
                📖 Iznajmi knjigu
              </button>
            </form>
          </div>
        </div>
      </div>
    </div>
  );
}

export default BookBook;