import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { auth, db } from "../../firebaseConfig";
import { collection, query, where, getDocs, doc, updateDoc, getDoc } from "firebase/firestore";
import { ChevronDown, ChevronRight } from "lucide-react";
import styles from "../Home/Home.module.css";

function RentedBooks() {
  const [user, setUser] = useState(null);
  const [userName, setUserName] = useState("Korisnik");
  const [rentals, setRentals] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [errorMsg, setErrorMsg] = useState("");
  const [successMsg, setSuccessMsg] = useState("");
  const [darkMode, setDarkMode] = useState(() => {
    return localStorage.getItem("darkMode") === "true";
  });
  const navigate = useNavigate();

  useEffect(() => {
    const unsubscribe = auth.onAuthStateChanged(async (currentUser) => {
      if (currentUser) {
        setUser(currentUser);
        try {
          const userDoc = await getDoc(doc(db, "users", currentUser.uid));
          if (userDoc.exists()) {
            const userData = userDoc.data();
            setUserName(userData.name || currentUser.email.split("@")[0] || "Korisnik");
          }
          const rentalsQuery = query(
            collection(db, "rentals"),
            where("userId", "==", currentUser.uid),
            where("status", "==", "active")
          );
          const querySnapshot = await getDocs(rentalsQuery);
          const rentalsList = querySnapshot.docs.map((doc) => ({
            id: doc.id,
            ...doc.data(),
          }));
          setRentals(rentalsList);
        } catch (error) {
          console.error("Error fetching rentals: ", error);
          setErrorMsg("Greška prilikom učitavanja iznajmljenih knjiga.");
        } finally {
          setIsLoading(false);
        }
      } else {
        navigate("/login");
      }
    });

    return () => unsubscribe();
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

  const handleBack = () => {
    navigate("/");
  };

  const handleReturnBook = async (rentalId, bookTitle) => {
    if (!window.confirm(`Da li ste sigurni da želite da vratite knjigu "${bookTitle}"?`)) {
      return;
    }

    try {
      await updateDoc(doc(db, "rentals", rentalId), {
        status: "returned",
        returnDate: new Date(),
      });
      setRentals((prevRentals) => prevRentals.filter((rental) => rental.id !== rentalId));
      setSuccessMsg(`Knjiga "${bookTitle}" je uspešno vraćena.`);
      setTimeout(() => setSuccessMsg(""), 3000);
    } catch (error) {
      console.error("Error returning book: ", error);
      setErrorMsg("Greška prilikom vraćanja knjige.");
    }
  };

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
            className={`${styles["admin-sidebar-btn"]} ${styles["organization-btn"]} Home_admin-sidebar-btn__i6N8Q Home_organization-btn__VONga`}
            onClick={handleBack}
          >
            ⬅️ Vrati na prethodnu stranu
          </button>
          <button
            className={`${styles["admin-sidebar-btn"]} ${styles["organization-btn"]} Home_admin-sidebar-btn__i6N8Q Home_organization-btn__VONga`}
            onClick={() => setDarkMode(!darkMode)}
          >
            🌗 {darkMode ? "Svetli mod" : "Tamni mod"}
          </button>
        </div>
      </div>

      {/* Main Content */}
      <div className={styles.mainContent}>
        <div className={styles["admin-welcome"]}>
          <h2>Lista iznajmljenih knjiga</h2>
          <p>Pregled knjiga koje ste iznajmili.</p>
        </div>
        <div className={styles.activeView}>
          {errorMsg && <p className={styles.errorMsg}>{errorMsg}</p>}
          {successMsg && <p className={styles.successMsg}>{successMsg}</p>}
          {rentals.length > 0 ? (
            <table className={styles.booksTable}>
              <thead>
                <tr>
                  <th>Naslov knjige</th>
                  <th>Datum iznajmljivanja</th>
                  <th>Trajanje (dani)</th>
                  <th>Lokacija</th>
                  <th>Vrati knjigu</th>
                </tr>
              </thead>
              <tbody>
                {rentals.map((rental) => (
                  <tr key={rental.id}>
                    <td data-label="Naslov knjige">
                      <a href={`/book/${rental.bookId}`}>{rental.bookTitle}</a>
                    </td>
                    <td data-label="Datum iznajmljivanja">
                      {rental.rentalDate
                        ? new Date(rental.rentalDate.toDate()).toLocaleDateString("sr-RS")
                        : "N/A"}
                    </td>
                    <td data-label="Trajanje">{rental.durationDays}</td>
                    <td data-label="Lokacija">
                      {rental.isOutside
                        ? "Izneto van zgrade"
                        : `Kancelarija ${rental.officeNumber}`}
                    </td>
                    <td data-label="Vrati knjigu">
                      <button
                        className={`${styles["admin-sidebar-btn"]} ${styles["organization-btn"]}`}
                        onClick={() => handleReturnBook(rental.id, rental.bookTitle)}
                      >
                        📚 Vrati
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          ) : (
            <p>Nemate iznajmljenih knjiga.</p>
          )}
        </div>
      </div>
    </div>
  );
}

export default RentedBooks;