import React, { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { doc, getDoc, deleteDoc } from "firebase/firestore";
import { getAuth } from "firebase/auth";
import { db } from "../../firebaseConfig";
import { ChevronDown, ChevronRight } from "lucide-react";
import styles from "./Book.module.css";

function Book() {
  const { bookId } = useParams();
  const [book, setBook] = useState(null);
  const navigate = useNavigate();
  const auth = getAuth();
  const [darkMode, setDarkMode] = useState(false);
  const authorizedEmails = [
    "ognjen.tomic@li.rs",
    "srecko.manasijevic@li.rs",
    "vladimir.mitrovic@li.rs",
  ];

  useEffect(() => {
    const fetchBook = async () => {
      try {
        const docRef = doc(db, "books", bookId);
        const docSnap = await getDoc(docRef);
        if (docSnap.exists()) {
          setBook(docSnap.data());
        } else {
          console.log("No such document!");
          navigate("/user-books");
        }
      } catch (error) {
        console.error("Error fetching book: ", error);
      }
    };

    fetchBook();
  }, [bookId, navigate]);

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
        alert("Error deleting book: " + error.message);
      }
    }
  };

  const handleBack = () => {
    navigate(-1);
  };

  if (!book) {
    return <div className={styles.loading}>LOLA Institut</div>;
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
          <h2>{auth.currentUser?.email.split("@")[0] || "User"}</h2>
        </div>
        <div className={styles["admin-sidebar-menu"]}>
          <button
            onClick={handleDeleteBook}
            className={`${styles["admin-sidebar-btn"]} ${styles["organization-btn"]}`}
            disabled={!auth.currentUser || !authorizedEmails.includes(auth.currentUser.email)}
          >
            🗑️ Obrisi knjigu
          </button>
          <button
            onClick={() => navigate(`/edit-book/${bookId}`)}
            className={`${styles["admin-sidebar-btn"]} ${styles["organization-btn"]}`}
          >
            ✏️ Izmeni knjigu
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
          <h2>Podaci knjige</h2>
          <p>Pregledaj detalje knjige.</p>
        </div>
        <div className={styles.activeView}>
          <div className={styles.bookDetails}>
            <table className={styles.invisibleTable}>
              <tbody>
                <tr>
                  <td>
                    <strong>Naslov:</strong>
                  </td>
                  <td>{book.title}</td>
                </tr>
                <tr>
                  <td>
                    <strong>Podnaslov:</strong>
                  </td>
                  <td>{book.subtitle}</td>
                </tr>
                <tr>
                  <td>
                    <strong>Tip publikacije:</strong>
                  </td>
                  <td>{book.publicationType}</td>
                </tr>
                <tr>
                  <td>
                    <strong>Tip knjige:</strong>
                  </td>
                  <td>{book.bookType}</td>
                </tr>
                <tr>
                  <td>
                    <strong>Jezik:</strong>
                  </td>
                  <td>{book.language}</td>
                </tr>
                <tr>
                  <td>
                    <strong>Izdavac:</strong>
                  </td>
                  <td>{book.publisher}</td>
                </tr>
                <tr>
                  <td>
                    <strong>Godina izdanja:</strong>
                  </td>
                  <td>{book.yearOfPublication}</td>
                </tr>
                <tr>
                  <td>
                    <strong>Mesto izdavanja:</strong>
                  </td>
                  <td>{book.placeOfPublication}</td>
                </tr>
                <tr>
                  <td>
                    <strong>Mesto stampe:</strong>
                  </td>
                  <td>{book.placeOfPrint}</td>
                </tr>
                <tr>
                  <td>
                    <strong>Broj primeraka:</strong>
                  </td>
                  <td>{book.numberOfPrint}</td>
                </tr>
                <tr>
                  <td>
                    <strong>ISBN:</strong>
                  </td>
                  <td>{book.ISBN}</td>
                </tr>
                <tr>
                  <td>
                    <strong>CIP:</strong>
                  </td>
                  <td>{book.CIP}</td>
                </tr>
                <tr>
                  <td>
                    <strong>URL:</strong>
                  </td>
                  <td>
                    {book.URL && (
                      <a
                        href={book.URL}
                        target="_blank"
                        rel="noopener noreferrer"
                      >
                        {book.URL}
                      </a>
                    )}
                  </td>
                </tr>
                <tr>
                  <td>
                    <strong>Broj strana:</strong>
                  </td>
                  <td>{book.numberOfPages}</td>
                </tr>
                <tr>
                  <td>
                    <strong>Opis:</strong>
                  </td>
                  <td>{book.description}</td>
                </tr>
                <tr>
                  <td>
                    <strong>Tagovi:</strong>
                  </td>
                  <td>{book.tag}</td>
                </tr>
                <tr>
                  <td>
                    <strong>Tip medija:</strong>
                  </td>
                  <td>{book.mediaType}</td>
                </tr>
                <tr>
                  <td>
                    <strong>Kancelarija:</strong>
                  </td>
                  <td>{book.cabinet}</td>
                </tr>
                <tr>
                  <td>
                    <strong>Polica:</strong>
                  </td>
                  <td>{book.shelf}</td>
                </tr>
                <tr>
                  <td>
                    <strong>Inventarski broj:</strong>
                  </td>
                  <td>{book.inventoryNumber}</td>
                </tr>
                <tr>
                  <td>
                    <strong>Signatura:</strong>
                  </td>
                  <td>{book.signature}</td>
                </tr>
                <tr>
                  <td>
                    <strong>Slika korica:</strong>
                  </td>
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
                  <td>
                    <strong>Autori:</strong>
                  </td>
                  <td>
                    {Array.isArray(book.authors)
                      ? book.authors.join(", ")
                      : "No Authors"}
                  </td>
                </tr>
                <tr>
                  <td>
                    <strong>Lektori:</strong>
                  </td>
                  <td>
                    {Array.isArray(book.editors)
                      ? book.editors.join(", ")
                      : "No Editors"}
                  </td>
                </tr>
                <tr>
                  <td>
                    <strong>Recenzenti:</strong>
                  </td>
                  <td>
                    {Array.isArray(book.reviewers)
                      ? book.reviewers.join(", ")
                      : "No Reviewers"}
                  </td>
                </tr>
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </div>
  );
}

export default Book;