import React, { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { doc, getDoc, deleteDoc, setDoc, serverTimestamp, collection, query, where, getDocs } from "firebase/firestore";
import { getAuth } from "firebase/auth";
import { db } from "../../firebaseConfig";
import { ChevronDown, ChevronRight } from "lucide-react";
import styles from "./Book.module.css";

function Book() {
  const { bookId } = useParams();
  const [book, setBook] = useState(null);
  const [userName, setUserName] = useState(null);
  const [isAdmin, setIsAdmin] = useState(false);
  const [showRentalForm, setShowRentalForm] = useState(false);
  const [rentalDuration, setRentalDuration] = useState(7);
  const [isBookOutside, setIsBookOutside] = useState(false);
  const [officeNumber, setOfficeNumber] = useState("");
  const [rentals, setRentals] = useState([]);
  const [errorMsg, setErrorMsg] = useState("");
  const [successMsg, setSuccessMsg] = useState("");
  const [submitButtonDisabled, setSubmitButtonDisabled] = useState(false);
  const navigate = useNavigate();
  const auth = getAuth();
  const [darkMode, setDarkMode] = useState(() => {
    return localStorage.getItem("darkMode") === "true";
  });
  const authorizedEmails = [
    "ognjen.tomic@li.rs",
    "srecko.manasijevic@li.rs",
    "vladimir.mitrovic@li.rs",
  ];

  useEffect(() => {
    const unsubscribe = auth.onAuthStateChanged(async (currentUser) => {
      if (currentUser) {
        try {
          const userDoc = await getDoc(doc(db, "users", currentUser.uid));
          if (userDoc.exists()) {
            const userData = userDoc.data();
            setUserName(userData.name || currentUser.email.split("@")[0] || "Korisnik");
            setIsAdmin(userData.isAdmin || false);
          }
        } catch (error) {
          console.error("Error fetching user data: ", error);
        }
      } else {
        setUserName(null);
        setIsAdmin(false);
      }

      try {
        const docRef = doc(db, "books", bookId);
        const docSnap = await getDoc(docRef);
        if (docSnap.exists()) {
          setBook(docSnap.data());
        } else {
          console.log("No such document!");
          navigate("/");
        }
        const rentalsQuery = query(
          collection(db, "rentals"),
          where("bookId", "==", bookId),
          where("status", "==", "active")
        );
        const querySnapshot = await getDocs(rentalsQuery);
        const rentalsList = await Promise.all(
          querySnapshot.docs.map(async (rentalDoc) => {
            const rentalData = rentalDoc.data();
            const userDoc = await getDoc(doc(db, "users", rentalData.userId));
            const userData = userDoc.exists() ? userDoc.data() : {};
            return {
              id: rentalDoc.id,
              ...rentalData,
              userName: userData.name || "N/A",
              userLastName: userData.lastname || "N/A",
            };
          })
        );
        setRentals(rentalsList);
      } catch (error) {
        console.error("Error fetching data: ", error);
        setErrorMsg("Greška prilikom učitavanja podataka.");
      }
    });

    return () => unsubscribe();
  }, [bookId, navigate]);

  useEffect(() => {
    if (darkMode) {
      document.body.classList.add("dark-mode");
      localStorage.setItem("darkMode", "true");
    } else {
      document.body.classList.remove("dark-mode");
      localStorage.setItem("darkMode", "false");
    }
  }, [darkMode]);

  const handleDeleteBook = async () => {
    if (!auth.currentUser || !authorizedEmails.includes(auth.currentUser.email)) {
      alert("Samo određeni korisnici mogu brisati knjige.");
      return;
    }

    if (window.confirm("Da li ste sigurni da želite da obrišete ovu knjigu?")) {
      try {
        await deleteDoc(doc(db, "books", bookId));
        navigate("/user-books");
      } catch (error) {
        console.error("Error deleting book: ", error);
        alert("Greška prilikom brisanja knjige: " + error.message);
      }
    }
  };

  const handleRentBook = async (e) => {
    e.preventDefault();
    if (!auth.currentUser) {
      setErrorMsg("Morate biti ulogovani da biste iznajmili knjigu.");
      return;
    }

    if (!rentalDuration || rentalDuration < 1) {
      setErrorMsg("Unesite validno trajanje iznajmljivanja.");
      return;
    }

    if (!isBookOutside && (!officeNumber || officeNumber < 1 || officeNumber > 40)) {
      setErrorMsg("Unesite validan broj kancelarije (1–40) ili označite da je knjiga izneta.");
      return;
    }

    if (!window.confirm("Da li ste sigurni da želite da iznajmite ovu knjigu?")) {
      return;
    }

    setErrorMsg("");
    setSuccessMsg("");
    setSubmitButtonDisabled(true);

    try {
      const rentalData = {
        userId: auth.currentUser.uid,
        bookId: bookId,
        bookTitle: book.title,
        rentalDate: serverTimestamp(),
        durationDays: parseInt(rentalDuration),
        status: "active",
        isOutside: isBookOutside,
        officeNumber: isBookOutside ? null : parseInt(officeNumber),
      };

      await setDoc(
        doc(db, "rentals", `${auth.currentUser.uid}_${bookId}_${Date.now()}`),
        rentalData
      );
      setSuccessMsg("Knjiga je uspešno iznajmljena!");
      setShowRentalForm(false);
      setRentalDuration(7);
      setIsBookOutside(false);
      setOfficeNumber("");
      const rentalsQuery = query(
        collection(db, "rentals"),
        where("bookId", "==", bookId),
        where("status", "==", "active")
      );
      const querySnapshot = await getDocs(rentalsQuery);
      const rentalsList = await Promise.all(
        querySnapshot.docs.map(async (rentalDoc) => {
          const rentalData = rentalDoc.data();
          const userDoc = await getDoc(doc(db, "users", rentalData.userId));
          const userData = userDoc.exists() ? userDoc.data() : {};
          return {
            id: rentalDoc.id,
            ...rentalData,
            userName: userData.name || "N/A",
            userLastName: userData.lastname || "N/A",
          };
        })
      );
      setRentals(rentalsList);
      setTimeout(() => setSuccessMsg(""), 3000);
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

  const toggleRentalForm = () => {
    setShowRentalForm(!showRentalForm);
    setErrorMsg("");
    setSuccessMsg("");
  };

  if (!book) {
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
      <div className={styles.filtersSidebar}>
        <img
          src="/logo.png"
          alt="LOLA Institut Logo"
          className={styles.logo}
        />
        <div className={styles["admin-sidebar-menu"]}>
          {userName && (
            <>
              <button
                onClick={toggleRentalForm}
                className={`${styles["admin-sidebar-btn"]} ${styles["organization-btn"]} Book_admin-sidebar-btn__ApPOz Book_organization-btn__oziKD`}
              >
                📖 Iznajmi knjigu
              </button>
              {(isAdmin || book.userId === auth.currentUser?.uid) && (
                <button
                  onClick={() => navigate(`/edit-book/${bookId}`)}
                  className={`${styles["admin-sidebar-btn"]} ${styles["organization-btn"]}`}
                >
                  ✏️ Izmeni knjigu
                </button>
              )}
              <button
                onClick={handleDeleteBook}
                className={`${styles["admin-sidebar-btn"]} ${styles["organization-btn"]}`}
                disabled={!auth.currentUser || !authorizedEmails.includes(auth.currentUser.email)}
              >
                🗑️ Obriši knjigu
              </button>
            </>
          )}
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

      <div className={styles.mainContent}>
        <div className={styles["admin-welcome"]}>
          <h2>Podaci knjige</h2>
          <p>Pregledaj detalje knjige.</p>
        </div>
        <div className={styles.activeView}>
          {showRentalForm && userName ? (
            <div className={styles.formContainer}>
              <div className={styles["form-header"]}>
                <h2>Iznajmljivanje knjige</h2>
                <h3>{book.title}</h3>
              </div>
              <form onSubmit={handleRentBook}>
                <div className={styles.inputControl}>
                  <label>Trajanje iznajmljivanja (dani)</label>
                  <input
                    type="number"
                    min="1"
                    value={rentalDuration}
                    onChange={(e) => setRentalDuration(e.target.value)}
                    className={styles.numberInput}
                    required
                  />
                </div>
                <div className={styles.inputControl}>
                  <label>
                    <input
                      type="checkbox"
                      checked={isBookOutside}
                      onChange={(e) => {
                        setIsBookOutside(e.target.checked);
                        if (e.target.checked) setOfficeNumber("");
                      }}
                    />
                    Knjiga je izneta van zgrade
                  </label>
                </div>
                {!isBookOutside && (
                  <div className={styles.inputControl}>
                    <label>Broj kancelarije (1–40)</label>
                    <input
                      type="number"
                      min="1"
                      max="40"
                      value={officeNumber}
                      onChange={(e) => setOfficeNumber(e.target.value)}
                      className={styles.numberInput}
                      required
                    />
                  </div>
                )}
                {errorMsg && <p className={styles.errorMsg}>{errorMsg}</p>}
                {successMsg && <p className={styles.successMsg}>{successMsg}</p>}
                <div className={styles.formButtons}>
                  <button
                    type="submit"
                    className={`${styles["admin-sidebar-btn"]} ${styles["organization-btn"]}`}
                    disabled={submitButtonDisabled}
                  >
                    📖 Iznajmi knjigu
                  </button>
                  <button
                    type="button"
                    className={`${styles["admin-sidebar-btn"]} ${styles["organization-btn"]}`}
                    onClick={toggleRentalForm}
                  >
                    Otkaži
                  </button>
                </div>
              </form>
            </div>
          ) : (
            <div className={styles.bookDetails}>
              <table className={styles.invisibleTable}>
                <tbody>
                  <tr>
                    <td><strong>Naslov:</strong></td>
                    <td>{book.title}</td>
                  </tr>
                  <tr>
                    <td><strong>Podnaslov:</strong></td>
                    <td>{book.subtitle}</td>
                  </tr>
                  <tr>
                    <td><strong>Tip publikacije:</strong></td>
                    <td>{book.publicationType}</td>
                  </tr>
                  <tr>
                    <td><strong>Tip knjige:</strong></td>
                    <td>{book.bookType}</td>
                  </tr>
                  <tr>
                    <td><strong>Jezik:</strong></td>
                    <td>{book.language}</td>
                  </tr>
                  <tr>
                    <td><strong>Izdavač:</strong></td>
                    <td>{book.publisher}</td>
                  </tr>
                  <tr>
                    <td><strong>Godina izdanja:</strong></td>
                    <td>{book.yearOfPublication}</td>
                  </tr>
                  <tr>
                    <td><strong>Mesto izdavanja:</strong></td>
                    <td>{book.placeOfPublication}</td>
                  </tr>
                  <tr>
                    <td><strong>Mesto štampe:</strong></td>
                    <td>{book.placeOfPrint}</td>
                  </tr>
                  <tr>
                    <td><strong>Broj primeraka:</strong></td>
                    <td>{book.numberOfPrint}</td>
                  </tr>
                  <tr>
                    <td><strong>ISBN:</strong></td>
                    <td>{book.ISBN}</td>
                  </tr>
                  <tr>
                    <td><strong>CIP:</strong></td>
                    <td>{book.CIP}</td>
                  </tr>
                  <tr>
                    <td><strong>URL:</strong></td>
                    <td>
                      {book.URL && (
                        <a href={book.URL} target="_blank" rel="noopener noreferrer">
                          {book.URL}
                        </a>
                      )}
                    </td>
                  </tr>
                  <tr>
                    <td><strong>Broj strana:</strong></td>
                    <td>{book.numberOfPages}</td>
                  </tr>
                  <tr>
                    <td><strong>Opis:</strong></td>
                    <td>{book.description}</td>
                  </tr>
                  <tr>
                    <td><strong>Tagovi:</strong></td>
                    <td>{book.tag}</td>
                  </tr>
                  <tr>
                    <td><strong>Tip medija:</strong></td>
                    <td>{book.mediaType}</td>
                  </tr>
                  <tr>
                    <td><strong>Kancelarija:</strong></td>
                    <td>{book.cabinet}</td>
                  </tr>
                  <tr>
                    <td><strong>Polica:</strong></td>
                    <td>{book.shelf}</td>
                  </tr>
                  <tr>
                    <td><strong>Inventarski broj:</strong></td>
                    <td>{book.inventoryNumber}</td>
                  </tr>
                  <tr>
                    <td><strong>Signatura:</strong></td>
                    <td>{book.signature}</td>
                  </tr>
                  <tr>
                    <td><strong>Slika korica:</strong></td>
                    <td>
                      {book.coverImage && (
                        <img
                          src={book.coverImage}
                          alt={`${book.title} cover`}
                          className={styles.coverImage}
                        />
                      )}
                    </td>
                  </tr>
                  <tr>
                    <td><strong>Autori:</strong></td>
                    <td>
                      {Array.isArray(book.authors) ? book.authors.join(", ") : "Nema autora"}
                    </td>
                  </tr>
                  <tr>
                    <td><strong>Lektori:</strong></td>
                    <td>
                      {Array.isArray(book.editors) ? book.editors.join(", ") : "Nema lektora"}
                    </td>
                  </tr>
                  <tr>
                    <td><strong>Recenzenti:</strong></td>
                    <td>
                      {Array.isArray(book.reviewers) ? book.reviewers.join(", ") : "Nema recenzenata"}
                    </td>
                  </tr>
                </tbody>
              </table>
              {rentals.length > 0 && (
                <div className={styles.rentalHistory}>
                  <h3>Istorija iznajmljivanja</h3>
                  <table className={styles.rentalTable}>
                    <thead>
                      <tr>
                        <th>Ime</th>
                        <th>Prezime</th>
                        <th>Lokacija</th>
                      </tr>
                    </thead>
                    <tbody>
                      {rentals.map((rental) => (
                        <tr key={rental.id}>
                          <td>{rental.userName}</td>
                          <td>{rental.userLastName}</td>
                          <td>
                            {rental.isOutside
                              ? "Izneto van zgrade"
                              : `Kancelarija ${rental.officeNumber}`}
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              )}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

export default Book;