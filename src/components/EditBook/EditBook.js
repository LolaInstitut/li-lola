import React, { useEffect, useState, useRef } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { auth, db } from '../../firebaseConfig';
import { onAuthStateChanged } from 'firebase/auth';
import { doc, getDoc, updateDoc } from 'firebase/firestore';
import styles from './EditBook.module.css';

function EditBook() {
  const navigate = useNavigate();
  const { bookId } = useParams();
  const [user, setUser] = useState(null);
  const [bookData, setBookData] = useState(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isOwner, setIsOwner] = useState(false);
  const [isAdmin, setIsAdmin] = useState(false);
  const fileInputRef = useRef(null);
  const letters = "ABCDEFGHIJKLMNOPQRSTUVWXYZ".split("");

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, async (currentUser) => {
      if (currentUser) {
        setUser(currentUser);

        try {
          const userDoc = await getDoc(doc(db, "users", currentUser.uid));
          const userData = userDoc.exists() ? userDoc.data() : {};
          setIsAdmin(userData.isAdmin || false);

          const bookDocRef = doc(db, 'books', bookId);
          const bookDoc = await getDoc(bookDocRef);

          if (bookDoc.exists()) {
            const bookData = bookDoc.data();
            setBookData(bookData);
            setIsOwner(bookData.userId === currentUser.uid);
          } else {
            alert('Knjiga nije pronađena.');
            navigate('/');
          }
        } catch (error) {
          console.error('Greška prilikom dohvatanja knjige:', error);
          alert('Greška prilikom dohvatanja podataka o knjizi.');
          navigate('/');
        } finally {
          setIsLoading(false);
        }
      } else {
        navigate('/login');
      }
    });

    return () => unsubscribe();
  }, [bookId, navigate]);

  const handleUpdateBook = async (e) => {
    e.preventDefault();
    if (!user || (!isOwner && !isAdmin)) {
      alert('Niste ovlašćeni da uređujete ovu knjigu.');
      navigate('/');
      return;
    }

    try {
      const bookDocRef = doc(db, 'books', bookId);
      await updateDoc(bookDocRef, bookData);
      alert('Knjiga je uspešno ažurirana.');
      navigate('/');
    } catch (error) {
      console.error('Greška prilikom ažuriranja knjige:', error);
      alert('Greška prilikom ažuriranja knjige: ' + error.message);
    }
  };

  const handleInputChange = (field, value) => {
    setBookData({ ...bookData, [field]: value });
  };

  const handleAddInput = (field) => {
    setBookData({ ...bookData, [field]: [...bookData[field], ""] });
  };

  const handleRemoveInput = (field, index) => {
    const updatedArray = bookData[field].filter((_, i) => i !== index);
    setBookData({ ...bookData, [field]: updatedArray });
  };

  const handleFileChange = (e) => {
    const file = e.target.files[0];
    const reader = new FileReader();
    reader.onloadend = () => {
      setBookData({ ...bookData, coverImage: reader.result });
    };
    reader.readAsDataURL(file);
  };

  const handleRemoveCoverImage = () => {
    setBookData({ ...bookData, coverImage: null });
    fileInputRef.current.value = "";
  };

  if (isLoading) {
    return <div className={styles.loading}>Učitavanje...</div>;
  }

  if (!isOwner && !isAdmin) {
    alert('Niste ovlašćeni da uređujete ovu knjigu.');
    navigate('/');
    return null;
  }

  return (
    <div className={`${styles.container} ${styles.darkMode ? styles['dark-mode'] : ''}`}>
      <div className={styles.filtersSidebar}>
        <img
          src="/logo.png"
          alt="LOLA Institut Logo"
          className={styles.logo}
        />
        <div className={styles['admin-sidebar-menu']}>
          <button
            type="submit"
            form="editBookForm"
            className={`${styles['admin-sidebar-btn']} ${styles['organization-btn']}`}
          >
            💾 Sačuvaj izmene
          </button>
          <button
            type="button"
            onClick={() => navigate('/')}
            className={`${styles['admin-sidebar-btn']} ${styles['organization-btn']}`}
          >
            🗑️ Odbaci izmene
          </button>
          <button
            type="button"
            onClick={() => navigate('/')}
            className={`${styles['admin-sidebar-btn']} ${styles['organization-btn']}`}
          >
            ⬅️ Vrati na prethodnu stranu
          </button>
        </div>
      </div>

      <div className={styles.mainContent}>
        <div className={styles['admin-welcome']}>
          <h2>Izmena knjige</h2>
          <p>Izmenite detalje za izabranu knjigu.</p>
        </div>
        <div className={styles.activeView}>
          <div className={styles.formContainer}>
            <form id="editBookForm" onSubmit={handleUpdateBook}>
              <div className={styles.section}>
                <div className={styles['section-header']}>Osnovni podaci</div>
                <div className={styles['section-content']}>
                  <label>Naslov:</label>
                  <input
                    type="text"
                    value={bookData.title || ""}
                    onChange={(e) => handleInputChange("title", e.target.value)}
                  />
                  <label>Podnaslov:</label>
                  <input
                    type="text"
                    value={bookData.subtitle || ""}
                    onChange={(e) => handleInputChange("subtitle", e.target.value)}
                  />
                  <label>Tip publikacije:</label>
                  <select
                    value={bookData.publicationType || "Knjiga"}
                    onChange={(e) => handleInputChange("publicationType", e.target.value)}
                  >
                    <option value="Knjiga">Knjiga</option>
                    <option value="Časopis">Časopis</option>
                    <option value="Dokument">Dokument</option>
                  </select>
                  <label>Tip knjige:</label>
                  <select
                    value={bookData.bookType || "Monografija"}
                    onChange={(e) => handleInputChange("bookType", e.target.value)}
                  >
                    <option value="Monografija">Monografija</option>
                    <option value="Udzbenik">Udzbenik</option>
                    <option value="Ostalo">Ostalo</option>
                  </select>
                  <label>Jezik:</label>
                  <select
                    value={bookData.language || "Srpski"}
                    onChange={(e) => handleInputChange("language", e.target.value)}
                  >
                    <option value="Srpski">Srpski</option>
                    <option value="Engleski">Engleski</option>
                    <option value="Nemacki">Nemacki</option>
                    <option value="Ruski">Ruski</option>
                  </select>
                  <label>Inventarski broj:</label>
                  <input
                    type="text"
                    value={bookData.inventoryNumber || ""}
                    onChange={(e) => handleInputChange("inventoryNumber", e.target.value)}
                  />
                  <label>Signatura:</label>
                  <input
                    type="text"
                    value={bookData.signature || ""}
                    onChange={(e) => handleInputChange("signature", e.target.value)}
                  />
                </div>
              </div>
              <div className={styles['section-divider']} />
              <div className={styles.section}>
                <div className={styles['section-header']}>Autorski deo</div>
                <div className={styles['section-content']}>
                  {bookData.authors && bookData.authors.map((author, index) => (
                    <div key={index} className={styles.authorEditorReviewerContainer}>
                      <label>Autor {index + 1}:</label>
                      <input
                        type="text"
                        value={author}
                        onChange={(e) => {
                          const authors = [...bookData.authors];
                          authors[index] = e.target.value;
                          setBookData({ ...bookData, authors });
                        }}
                        className={styles.customInput}
                      />
                      {bookData.authors.length > 1 && (
                        <button
                          type="button"
                          onClick={() => handleRemoveInput("authors", index)}
                          className={styles.removeAuthorButton}
                        >
                          -
                        </button>
                      )}
                      <button
                        type="button"
                        onClick={() => handleAddInput("authors")}
                        className={styles.addAuthorButton}
                      >
                        +
                      </button>
                    </div>
                  ))}
                  {bookData.editors && bookData.editors.map((editor, index) => (
                    <div key={index} className={styles.authorEditorReviewerContainer}>
                      <label>Urednik {index + 1}:</label>
                      <input
                        type="text"
                        value={editor}
                        onChange={(e) => {
                          const editors = [...bookData.editors];
                          editors[index] = e.target.value;
                          setBookData({ ...bookData, editors });
                        }}
                        className={styles.customInput}
                      />
                      {bookData.editors.length > 1 && (
                        <button
                          type="button"
                          onClick={() => handleRemoveInput("editors", index)}
                          className={styles.removeAuthorButton}
                        >
                          -
                        </button>
                      )}
                      <button
                        type="button"
                        onClick={() => handleAddInput("editors")}
                        className={styles.addAuthorButton}
                      >
                        +
                      </button>
                    </div>
                  ))}
                  {bookData.reviewers && bookData.reviewers.map((reviewer, index) => (
                    <div key={index} className={styles.authorEditorReviewerContainer}>
                      <label>Recenzent {index + 1}:</label>
                      <input
                        type="text"
                        value={reviewer}
                        onChange={(e) => {
                          const reviewers = [...bookData.reviewers];
                          reviewers[index] = e.target.value;
                          setBookData({ ...bookData, reviewers });
                        }}
                        className={styles.customInput}
                      />
                      {bookData.reviewers.length > 1 && (
                        <button
                          type="button"
                          onClick={() => handleRemoveInput("reviewers", index)}
                          className={styles.removeAuthorButton}
                        >
                          -
                        </button>
                      )}
                      <button
                        type="button"
                        onClick={() => handleAddInput("reviewers")}
                        className={styles.addAuthorButton}
                      >
                        +
                      </button>
                    </div>
                  ))}
                </div>
              </div>
              <div className={styles['section-divider']} />
              <div className={styles.section}>
                <div className={styles['section-header']}>Ostali podaci</div>
                <div className={styles['section-content']}>
                  <label>Izdavač:</label>
                  <input
                    type="text"
                    value={bookData.publisher || ""}
                    onChange={(e) => handleInputChange("publisher", e.target.value)}
                  />
                  <label>Godina izdanja:</label>
                  <input
                    type="date"
                    value={bookData.yearOfPublication || ""}
                    onChange={(e) => handleInputChange("yearOfPublication", e.target.value)}
                  />
                  <label>Mesto izdanja:</label>
                  <input
                    type="text"
                    value={bookData.placeOfPublication || ""}
                    onChange={(e) => handleInputChange("placeOfPublication", e.target.value)}
                  />
                  <label>Štamparija:</label>
                  <input
                    type="text"
                    value={bookData.placeOfPrint || ""}
                    onChange={(e) => handleInputChange("placeOfPrint", e.target.value)}
                  />
                  <label>Tiraž:</label>
                  <input
                    type="text"
                    value={bookData.numberOfPrint || ""}
                    onChange={(e) => handleInputChange("numberOfPrint", e.target.value)}
                  />
                  <label>ISBN:</label>
                  <input
                    type="text"
                    value={bookData.ISBN || ""}
                    onChange={(e) => handleInputChange("ISBN", e.target.value)}
                  />
                  <label>CIP:</label>
                  <input
                    type="text"
                    value={bookData.CIP || ""}
                    onChange={(e) => handleInputChange("CIP", e.target.value)}
                  />
                  <label>URL:</label>
                  <input
                    type="text"
                    value={bookData.URL || ""}
                    onChange={(e) => handleInputChange("URL", e.target.value)}
                  />
                  <label>Broj strana:</label>
                  <input
                    type="text"
                    value={bookData.numberOfPages || ""}
                    onChange={(e) => handleInputChange("numberOfPages", e.target.value)}
                  />
                  <label>Opis:</label>
                  <textarea
                    value={bookData.description || ""}
                    onChange={(e) => handleInputChange("description", e.target.value)}
                  />
                  <label>Tag:</label>
                  <input
                    type="text"
                    value={bookData.tag || ""}
                    onChange={(e) => handleInputChange("tag", e.target.value)}
                  />
                  <label>Tip medija:</label>
                  <select
                    value={bookData.mediaType || "Štampana publikacija"}
                    onChange={(e) => handleInputChange("mediaType", e.target.value)}
                  >
                    <option value="Štampana publikacija">Štampana publikacija</option>
                    <option value="E publikacija">E publikacija</option>
                    <option value="Audio publikacija">Audio publikacija</option>
                  </select>
                  <label>Kabinet:</label>
                  <input
                    type="text"
                    value={bookData.cabinet || ""}
                    onChange={(e) => handleInputChange("cabinet", e.target.value)}
                  />
                  <label>Polica:</label>
                  <select
                    value={bookData.shelf || ""}
                    onChange={(e) => handleInputChange("shelf", e.target.value)}
                  >
                    {letters.map((letter, index) => (
                      <option key={index} value={letter}>
                        {letter}
                      </option>
                    ))}
                  </select>
                  <label>Slika korica:</label>
                  <input
                    type="file"
                    accept="image/*"
                    onChange={handleFileChange}
                    style={{ display: 'none' }}
                    ref={fileInputRef}
                  />
                  <button type="button" onClick={() => fileInputRef.current.click()}>Upload Cover Image</button>
                  {bookData.coverImage && (
                    <div>
                      <img src={bookData.coverImage} alt="Cover Preview" style={{ maxWidth: '200px', maxHeight: '200px' }} />
                      <button type="button" onClick={handleRemoveCoverImage}>Remove Cover Image</button>
                    </div>
                  )}
                </div>
              </div>
            </form>
          </div>
        </div>
      </div>
    </div>
  );
}

export default EditBook;