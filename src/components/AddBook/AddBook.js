import React, { useEffect, useRef, useState } from "react";
import { useNavigate } from "react-router-dom";
import { auth, db } from "../../firebaseConfig";
import { onAuthStateChanged } from "firebase/auth";
import { collection, addDoc, getDocs, query, orderBy, limit } from "firebase/firestore"; // Added 'limit' import
import styles from "./AddBook.module.css";

function AddBook() {
  const navigate = useNavigate();
  const [user, setUser] = useState(null);
  const [step, setStep] = useState(1); // Track the current step
  const [authorInputs, setAuthorInputs] = useState([""]);
  const [recenzentInputs, setRecenzentInputs] = useState([""]);
  const [editorInputs, setEditorInputs] = useState([""]);
  const [title, setTitle] = useState("");
  const [subtitle, setSubtitle] = useState("");
  const [publicationType, setPublicationType] = useState("Knjiga");
  const [language, setLanguage] = useState("Srpski");
  const [publisher, setPublisher] = useState("");
  const [yearOfPublication, setYearOfPublication] = useState("");
  const [placeOfPublication, setPlaceOfPublication] = useState("");
  const [placeOfPrint, setPlaceOfPrint] = useState("");
  const [numberOfPrint, setNumberOfPrint] = useState("");
  const [ISBN, setISBN] = useState("");
  const [CIP, setCIP] = useState("");
  const [URL, setURL] = useState("");
  const [numberOfPages, setNumberOfPages] = useState("");
  const [description, setDescription] = useState("");
  const [tag, setTag] = useState("");
  const [mediaType, setMediaType] = useState("Štampana publikacija");
  const [cabinet, setCabinet] = useState("");
  const [shelf, setShelf] = useState("");
  const [row, setRow] = useState("");
  const [coverImage, setCoverImage] = useState(null);
  const [inventoryNumber, setInventoryNumber] = useState(""); // Will be auto-generated
  const [signature, setSignature] = useState("");
  const [faculty, setFaculty] = useState("");
  const [defenseDate, setDefenseDate] = useState("");
  const [conferenceName, setConferenceName] = useState("");
  const [conferenceStartDate, setConferenceStartDate] = useState("");
  const [conferenceEndDate, setConferenceEndDate] = useState("");
  const [organizer, setOrganizer] = useState("");
  const [conferenceCountry, setConferenceCountry] = useState("");
  const [domaciStrani, setDomaciStrani] = useState("");
  const fileInputRef = useRef(null);
  const [darkMode, setDarkMode] = useState(false);
  const letters = "ABCDEFGHIJKLMNOPQRSTUVWXYZ".split("");

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, (currentUser) => {
      if (currentUser) {
        setUser(currentUser);
      } else {
        navigate("/login");
      }
    });

    return () => unsubscribe();
  }, [navigate]);

  // Fetch the latest inventory number on component mount
  useEffect(() => {
    const fetchLatestInventoryNumber = async () => {
      try {
        const q = query(collection(db, "books"), orderBy("inventoryNumber", "desc"), limit(1));
        const querySnapshot = await getDocs(q);
        const latestBook = querySnapshot.docs[0];
        const latestInventoryNumber = latestBook ? parseInt(latestBook.data().inventoryNumber) : 170;
        setInventoryNumber((latestInventoryNumber + 1).toString());
      } catch (error) {
        console.error("Error fetching latest inventory number: ", error);
        setInventoryNumber("171"); // Default to 171 if fetch fails
      }
    };

    fetchLatestInventoryNumber();
  }, []);

  const validateStep = () => {
    if (step === 1) {
      return signature && title && publicationType && language; // Removed inventoryNumber from validation
    }
    if (step === 2) {
      return (
        authorInputs.every((author) => author) &&
        editorInputs.every((editor) => editor) &&
        recenzentInputs.every((reviewer) => reviewer) &&
        cabinet &&
        shelf &&
        row
      );
    }
    return true; // Step 3 has optional fields
  };

  const handleNextStep = () => {
    if (validateStep()) {
      setStep(step + 1);
    } else {
      alert("Molimo popunite sva obavezna polja pre nego što nastavite.");
    }
  };

  const handlePrevStep = () => {
    setStep(step - 1);
  };

  const handleAddBook = async (e) => {
    e.preventDefault();
    if (!user) {
      alert("You must be logged in to add a book.");
      return;
    }

    const bookData = {
      title,
      subtitle,
      publicationType,
      domaciStrani,
      language,
      numberOfPages,
      description,
      tag,
      mediaType,
      cabinet,
      shelf,
      row,
      coverImage,
      authors: authorInputs,
      reviewers: recenzentInputs,
      editors: editorInputs,
      inventoryNumber, // Auto-generated and unique
      signature,
      userId: user.uid,
    };

    if (
      publicationType === "Doktorske disertacije" ||
      publicationType === "Magistarski radovi" ||
      publicationType === "Diplomski radovi"
    ) {
      bookData.faculty = faculty;
      bookData.defenseDate = defenseDate;
    } else if (publicationType === "Konferencije") {
      bookData.conferenceName = conferenceName;
      bookData.conferenceStartDate = conferenceStartDate;
      bookData.conferenceEndDate = conferenceEndDate;
      bookData.organizer = organizer;
      bookData.conferenceCountry = conferenceCountry;
    } else {
      bookData.publisher = publisher;
      bookData.yearOfPublication = yearOfPublication;
      bookData.placeOfPublication = placeOfPublication;
      bookData.placeOfPrint = placeOfPrint;
      bookData.numberOfPrint = numberOfPrint;
      bookData.ISBN = ISBN;
      bookData.CIP = CIP;
      bookData.URL = URL;
    }

    try {
      const docRef = await addDoc(collection(db, "books"), bookData);
      alert("Book added with ID: " + docRef.id);
      resetForm();
      setStep(1); // Reset to first step
    } catch (error) {
      console.error("Error adding document: ", error);
      alert("Error adding book: " + error.message);
    }
  };

  const handleInputChange = (setStateFunction, index, value) => {
    setStateFunction((prevState) => {
      const updatedState = [...prevState];
      updatedState[index] = value;
      return updatedState;
    });
  };

  const handleAddInputInline = (setStateFunction, index) => {
    setStateFunction((prevState) => {
      const updatedState = [...prevState];
      updatedState.splice(index + 1, 0, "");
      return updatedState;
    });
  };

  const handleRemoveInput = (setStateFunction, index) => {
    setStateFunction((prevState) => {
      if (prevState.length > 1) {
        const updatedState = [...prevState];
        updatedState.splice(index, 1);
        return updatedState;
      }
      return prevState;
    });
  };

  const handleCameraButtonClick = () => {
    fileInputRef.current.click();
  };

  const handleFileChange = (e) => {
    const file = e.target.files[0];
    const reader = new FileReader();
    reader.onloadend = () => {
      setCoverImage(reader.result);
    };
    reader.readAsDataURL(file);
  };

  const handleRemoveCoverImage = () => {
    setCoverImage(null);
    fileInputRef.current.value = "";
  };

  const resetForm = () => {
    setAuthorInputs([""]);
    setRecenzentInputs([""]);
    setEditorInputs([""]);
    setTitle("");
    setSubtitle("");
    setPublicationType("Knjiga");
    setDomaciStrani("");
    setLanguage("Srpski");
    setPublisher("");
    setYearOfPublication("");
    setPlaceOfPublication("");
    setPlaceOfPrint("");
    setNumberOfPrint("");
    setISBN("");
    setCIP("");
    setURL("");
    setNumberOfPages("");
    setDescription("");
    setTag("");
    setMediaType("Štampana publikacija");
    setCabinet("");
    setShelf("");
    setRow("");
    setCoverImage(null);
    // Inventory number will be re-generated on next mount
    setSignature("");
    setFaculty("");
    setDefenseDate("");
    setConferenceName("");
    setConferenceStartDate("");
    setConferenceEndDate("");
    setOrganizer("");
    setConferenceCountry("");
  };

  const showAuthorEditorReviewerFields =
    publicationType !== "Konferencije" &&
    publicationType !== "Doktorske disertacije" &&
    publicationType !== "Magistarski radovi" &&
    publicationType !== "Diplomski radovi";

  const showMentorFields =
    publicationType === "Doktorske disertacije" ||
    publicationType === "Magistarski radovi" ||
    publicationType === "Diplomski radovi";

  const showAuthorsField =
    publicationType === "Doktorske disertacije" ||
    publicationType === "Magistarski radovi" ||
    publicationType === "Diplomski radovi" ||
    publicationType !== "Konferencije";

  if (!user) {
    return <div>Loading or not authenticated...</div>;
  }

  return (
    <div className={`${styles.container} ${darkMode ? styles["dark-mode"] : ""}`}>
      <div className={styles.filtersSidebar}>
        <div
          className={styles["admin-sidebar-title"]}
          onClick={() => navigate("/profile")}
        >
          <img src="https://via.placeholder.com/32" alt="Profile" />
          <h2>{user.email.split("@")[0]}</h2>
        </div>
        <div className={styles["admin-sidebar-menu"]}>
          {step === 3 && (
            <button
              onClick={handleAddBook}
              className={`${styles["admin-sidebar-btn"]} ${styles["organization-btn"]}`}
            >
              💾 Zapamti
            </button>
          )}
          <button
            onClick={resetForm}
            className={`${styles["admin-sidebar-btn"]} ${styles["organization-btn"]}`}
          >
            🗑️ Obriši sva polja
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

      <div className={styles.mainContent}>
        <div className={styles["admin-welcome"]}>
          <h2>Dodavanje nove publikacije - Korak {step}/3</h2>
          <p>Unesite detalje za novu publikaciju.</p>
        </div>
        <div className={styles.activeView}>
          <div className={styles.formContainer}>
            <form onSubmit={(e) => e.preventDefault()}>
              {step === 1 && (
                <div className={styles.section}>
                  <div className={styles["section-header"]}>Osnovni podaci</div>
                  <div className={styles["section-content"]}>
                    {/* Removed ID Publikacije field */}
                    <label>Inventarski broj:</label>
                    <input
                      type="text"
                      value={inventoryNumber}
                      onChange={(e) => setInventoryNumber(e.target.value)} // Read-only in UI, but can be updated by state
                      readOnly
                      required
                    />
                    <label>Signatura:</label>
                    <input
                      type="text"
                      value={signature}
                      onChange={(e) => setSignature(e.target.value)}
                      required
                    />
                    <label>Naslov:</label>
                    <input
                      type="text"
                      value={title}
                      onChange={(e) => setTitle(e.target.value)}
                      required
                    />
                    <label>Podnaslov:</label>
                    <input
                      type="text"
                      value={subtitle}
                      onChange={(e) => setSubtitle(e.target.value)}
                    />
                    <label>Tip publikacije:</label>
                    <select
                      value={publicationType}
                      onChange={(e) => setPublicationType(e.target.value)}
                      required
                    >
                      <option value="Monografija">Monografija</option>
                      <option value="Knjiga">Knjiga</option>
                      <option value="Priručnik">Priručnik</option>
                      <option value="Rečnik">Rečnik</option>
                      <option value="LOLA INSTITUT">LOLA INSTITUT</option>
                      <option value="Časopis">Časopis</option>
                      <option value="Konferencije">Konferencije</option>
                      <option value="Dokument">Dokument</option>
                      <option value="Doktorske disertacije">Doktorske disertacije</option>
                      <option value="Magistarski radovi">Magistarski radovi</option>
                      <option value="Diplomski radovi">Diplomski radovi</option>
                    </select>
                    {(publicationType === "Doktorske disertacije" ||
                      publicationType === "Magistarski radovi" ||
                      publicationType === "Diplomski radovi") && (
                      <>
                        <label>Fakultet:</label>
                        <input
                          type="text"
                          value={faculty}
                          onChange={(e) => setFaculty(e.target.value)}
                        />
                        <label>Datum odbrane:</label>
                        <input
                          type="date"
                          value={defenseDate}
                          onChange={(e) => setDefenseDate(e.target.value)}
                        />
                      </>
                    )}
                    {publicationType === "Konferencije" && (
                      <>
                        <label>Naziv konferencije:</label>
                        <input
                          type="text"
                          value={conferenceName}
                          onChange={(e) => setConferenceName(e.target.value)}
                        />
                        <label>Datum održavanja od:</label>
                        <input
                          type="date"
                          value={conferenceStartDate}
                          onChange={(e) => setConferenceStartDate(e.target.value)}
                        />
                        <label>Datum održavanja do:</label>
                        <input
                          type="date"
                          value={conferenceEndDate}
                          onChange={(e) => setConferenceEndDate(e.target.value)}
                        />
                        <label>Organizator:</label>
                        <input
                          type="text"
                          value={organizer}
                          onChange={(e) => setOrganizer(e.target.value)}
                        />
                        <label>Zemlja održavanja konferencije:</label>
                        <input
                          type="text"
                          value={conferenceCountry}
                          onChange={(e) => setConferenceCountry(e.target.value)}
                        />
                      </>
                    )}
                    {publicationType === "Časopis" && (
                      <>
                        <label>Domaći ili strani:</label>
                        <select
                          value={domaciStrani}
                          onChange={(e) => setDomaciStrani(e.target.value)}
                        >
                          <option value="">Izaberite</option>
                          <option value="Domaći">Domaći</option>
                          <option value="Strani">Strani</option>
                        </select>
                      </>
                    )}
                    <label>Jezik:</label>
                    <select
                      value={language}
                      onChange={(e) => setLanguage(e.target.value)}
                      required
                    >
                      <option value="Srpski">Srpski</option>
                      <option value="Engleski">Engleski</option>
                      <option value="Nemački">Nemački</option>
                      <option value="Ruski">Ruski</option>
                      <option value="Sprsko-hrvatski">Srpsko-hrvatski</option>
                      <option value="Rumunski">Rumunski</option>
                      <option value="Kineski">Kineski</option>
                      <option value="Korejski">Korejski</option>
                      <option value="Bosanski">Bosanski</option>
                      <option value="Crnogorski">Crnogorski</option>
                      <option value="Češki">Češki</option>
                      <option value="Danski">Danski</option>
                      <option value="Finski">Finski</option>
                      <option value="Francuski">Francuski</option>
                      <option value="Hrvatski">Hrvatski</option>
                      <option value="Italijanski">Italijanski</option>
                      <option value="Holandski">Holandski</option>
                      <option value="Mađarski">Mađarski</option>
                      <option value="Poljski">Poljski</option>
                      <option value="Portugalski">Portugalski</option>
                      <option value="Slovački">Slovački</option>
                      <option value="Španski">Španski</option>
                      <option value="Turski">Turski</option>
                      <option value="Grčki">Grčki</option>
                      <option value="Ukrajinski">Ukrajinski</option>
                    </select>
                    <label>Tagovi:</label>
                    <input
                      type="text"
                      value={tag}
                      onChange={(e) => setTag(e.target.value)}
                    />
                  </div>
                  <button
                    type="button"
                    onClick={handleNextStep}
                    className={styles.nextButton}
                  >
                    Dalje
                  </button>
                </div>
              )}

              {step === 2 && (
                <div className={styles.section}>
                  <div className={styles["section-header"]}>Autorski deo</div>
                  <div className={styles["section-content"]}>
                    {showAuthorsField && (
                      <>
                        <div className={styles["section-header"]}>Autori</div>
                        {authorInputs.map((author, index) => (
                          <div
                            key={index}
                            className={styles.authorEditorReviewerContainer}
                          >
                            <input
                              type="text"
                              value={author}
                              placeholder={`Autor ${index + 1}`}
                              onChange={(e) =>
                                handleInputChange(
                                  setAuthorInputs,
                                  index,
                                  e.target.value
                                )
                              }
                              className={styles.customInput}
                              required
                            />
                            <button
                              type="button"
                              onClick={() =>
                                handleAddInputInline(setAuthorInputs, index)
                              }
                              className={styles.addAuthorButton}
                            >
                              +
                            </button>
                            {authorInputs.length > 1 && (
                              <button
                                type="button"
                                onClick={() =>
                                  handleRemoveInput(setAuthorInputs, index)
                                }
                                className={styles.removeAuthorButton}
                              >
                                -
                              </button>
                            )}
                          </div>
                        ))}
                      </>
                    )}
                    {showAuthorEditorReviewerFields && (
                      <>
                        <div className={styles["section-header"]}>Urednici</div>
                        {editorInputs.map((editor, index) => (
                          <div
                            key={index}
                            className={styles.authorEditorReviewerContainer}
                          >
                            <input
                              type="text"
                              value={editor}
                              placeholder={`Urednik ${index + 1}`}
                              onChange={(e) =>
                                handleInputChange(
                                  setEditorInputs,
                                  index,
                                  e.target.value
                                )
                              }
                              className={styles.customInput}
                              required
                            />
                            <button
                              type="button"
                              onClick={() =>
                                handleAddInputInline(setEditorInputs, index)
                              }
                              className={styles.addAuthorButton}
                            >
                              +
                            </button>
                            {editorInputs.length > 1 && (
                              <button
                                type="button"
                                onClick={() =>
                                  handleRemoveInput(setEditorInputs, index)
                                }
                                className={styles.removeAuthorButton}
                              >
                                -
                              </button>
                            )}
                          </div>
                        ))}
                        <div className={styles["section-header"]}>Recenzenti</div>
                        {recenzentInputs.map((reviewer, index) => (
                          <div
                            key={index}
                            className={styles.authorEditorReviewerContainer}
                          >
                            <input
                              type="text"
                              value={reviewer}
                              placeholder={`Recenzent ${index + 1}`}
                              onChange={(e) =>
                                handleInputChange(
                                  setRecenzentInputs,
                                  index,
                                  e.target.value
                                )
                              }
                              className={styles.customInput}
                              required
                            />
                            <button
                              type="button"
                              onClick={() =>
                                handleAddInputInline(setRecenzentInputs, index)
                              }
                              className={styles.addAuthorButton}
                            >
                              +
                            </button>
                            {recenzentInputs.length > 1 && (
                              <button
                                type="button"
                                onClick={() =>
                                  handleRemoveInput(setRecenzentInputs, index)
                                }
                                className={styles.removeAuthorButton}
                              >
                                -
                              </button>
                            )}
                          </div>
                        ))}
                      </>
                    )}
                    {showMentorFields && (
                      <>
                        <div className={styles["section-header"]}>Mentori</div>
                        {recenzentInputs.map((reviewer, index) => (
                          <div
                            key={index}
                            className={styles.authorEditorReviewerContainer}
                          >
                            <input
                              type="text"
                              value={reviewer}
                              placeholder={`Mentor ${index + 1}`}
                              onChange={(e) =>
                                handleInputChange(
                                  setRecenzentInputs,
                                  index,
                                  e.target.value
                                )
                              }
                              className={styles.customInput}
                              required
                            />
                            <button
                              type="button"
                              onClick={() =>
                                handleAddInputInline(setRecenzentInputs, index)
                              }
                              className={styles.addAuthorButton}
                            >
                              +
                            </button>
                            {recenzentInputs.length > 1 && (
                              <button
                                type="button"
                                onClick={() =>
                                  handleRemoveInput(setRecenzentInputs, index)
                                }
                                className={styles.removeAuthorButton}
                              >
                                -
                              </button>
                            )}
                          </div>
                        ))}
                      </>
                    )}
                    <div className={styles["section-header"]}>Lokacija knjige</div>
                    <label>Kabinet:</label>
                    <select
                      value={cabinet}
                      onChange={(e) => setCabinet(e.target.value)}
                      required
                    >
                      <option value="Biblioteka">Biblioteka</option>
                      {Array.from({ length: 40 }, (_, i) => (
                        <option key={i + 1} value={`Kancelarija ${i + 1}`}>
                          Kancelarija {i + 1}
                        </option>
                      ))}
                    </select>
                    <label>Polica:</label>
                    <select
                      value={shelf}
                      onChange={(e) => setShelf(e.target.value)}
                      required
                    >
                      {letters.map((letter, index) => (
                        <option key={index} value={letter}>
                          {letter}
                        </option>
                      ))}
                    </select>
                    <label>Red:</label>
                    <input
                      type="number"
                      value={row}
                      onChange={(e) => setRow(e.target.value)}
                      placeholder="Unesite broj reda"
                      min="1"
                      required
                    />
                  </div>
                  <div className={styles.buttonGroup}>
                    <button
                      type="button"
                      onClick={handlePrevStep}
                      className={styles.prevButton}
                    >
                      Nazad
                    </button>
                    <button
                      type="button"
                      onClick={handleNextStep}
                      className={styles.nextButton}
                    >
                      Dalje
                    </button>
                  </div>
                </div>
              )}

              {step === 3 && (
                <div className={styles.section}>
                  <div className={styles["section-header"]}>Ostali podaci</div>
                  <div className={styles["section-content"]}>
                    {publicationType !== "Konferencije" && (
                      <>
                        {publicationType !== "Doktorske disertacije" &&
                          publicationType !== "Magistarski radovi" &&
                          publicationType !== "Diplomski radovi" && (
                            <>
                              <label>Izdavač:</label>
                              <input
                                type="text"
                                value={publisher}
                                onChange={(e) => setPublisher(e.target.value)}
                              />
                              <label>Godina izdanja:</label>
                              <input
                                type="date"
                                value={yearOfPublication}
                                onChange={(e) =>
                                  setYearOfPublication(e.target.value)
                                }
                              />
                              <label>Mesto izdanja:</label>
                              <input
                                type="text"
                                value={placeOfPublication}
                                onChange={(e) =>
                                  setPlaceOfPublication(e.target.value)
                                }
                              />
                              <label>Štamparija:</label>
                              <input
                                type="text"
                                value={placeOfPrint}
                                onChange={(e) => setPlaceOfPrint(e.target.value)}
                              />
                              <label>Tiraž:</label>
                              <input
                                type="text"
                                value={numberOfPrint}
                                onChange={(e) => setNumberOfPrint(e.target.value)}
                              />
                              <label>ISBN:</label>
                              <input
                                type="text"
                                value={ISBN}
                                onChange={(e) => setISBN(e.target.value)}
                              />
                              <label>CIP:</label>
                              <input
                                type="text"
                                value={CIP}
                                onChange={(e) => setCIP(e.target.value)}
                              />
                            </>
                          )}
                        <label>URL:</label>
                        <input
                          type="text"
                          value={URL}
                          onChange={(e) => setURL(e.target.value)}
                        />
                        {publicationType !== "Konferencije" && (
                          <>
                            <label>Broj strana:</label>
                            <input
                              type="text"
                              value={numberOfPages}
                              onChange={(e) => setNumberOfPages(e.target.value)}
                            />
                          </>
                        )}
                        <label>Opis:</label>
                        <textarea
                          value={description}
                          onChange={(e) => setDescription(e.target.value)}
                        />
                        <label>Tip medija:</label>
                        <select
                          value={mediaType}
                          onChange={(e) => setMediaType(e.target.value)}
                        >
                          <option value="Štampana publikacija">Štampana publikacija</option>
                          <option value="E publikacija">E publikacija</option>
                          <option value="Audio publikacija">Audio publikacija</option>
                          <option value="URL">URL</option>
                        </select>
                        <label>Slika korica:</label>
                        <input
                          type="file"
                          ref={fileInputRef}
                          style={{ display: "none" }}
                          onChange={handleFileChange}
                        />
                        <button type="button" onClick={handleCameraButtonClick}>
                          Upload Cover Image
                        </button>
                        {coverImage && (
                          <button
                            type="button"
                            onClick={handleRemoveCoverImage}
                          >
                            Remove Cover Image
                          </button>
                        )}
                      </>
                    )}
                  </div>
                  <div className={styles.buttonGroup}>
                    <button
                      type="button"
                      onClick={handlePrevStep}
                      className={styles.prevButton}
                    >
                      Nazad
                    </button>
                    <button
                      type="submit"
                      onClick={handleAddBook}
                      className={styles.nextButton}
                    >
                      Zapamti
                    </button>
                  </div>
                </div>
              )}
            </form>
          </div>
        </div>
      </div>
    </div>
  );
}

export default AddBook;