import React, { useEffect, useState, useRef } from "react";
import { useNavigate } from "react-router-dom";
import { auth, db } from "../../firebaseConfig";
import { onAuthStateChanged } from "firebase/auth";
import { collection, addDoc } from "firebase/firestore";
import styles from "./AddBook.module.css";

function AddBook() {
  const navigate = useNavigate();
  const [user, setUser] = useState(null);
  const [authorInputs, setAuthorInputs] = useState([""]);
  const [recenzentInputs, setRecenzentInputs] = useState([""]);
  const [title, setTitle] = useState("");
  const [subtitle, setSubtitle] = useState("");
  const [publicationType, setPublicationType] = useState("Knjiga");
  const [domaciStrani, setDomaciStrani] = useState(""); // Dodato stanje za domaći ili strani
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
  const [coverImage, setCoverImage] = useState(null);
  const [inventoryNumber, setInventoryNumber] = useState(""); // Dodato stanje za inventarski broj
  const [signature, setSignature] = useState(""); // Dodato stanje za signaturu
  const [faculty, setFaculty] = useState(""); // Dodato stanje za fakultet
  const [defenseDate, setDefenseDate] = useState(""); // Dodato stanje za datum odbrane
  const [conferenceName, setConferenceName] = useState(""); // Dodato stanje za naziv konferencije
  const [conferenceStartDate, setConferenceStartDate] = useState(""); // Dodato stanje za datum početka konferencije
  const [conferenceEndDate, setConferenceEndDate] = useState(""); // Dodato stanje za datum završetka konferencije
  const [organizer, setOrganizer] = useState(""); // Dodato stanje za organizatora konferencije
  const [conferenceCountry, setConferenceCountry] = useState(""); // Dodato stanje za zemlju održavanja konferencije
  const fileInputRef = useRef(null);

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
      domaciStrani, // Dodato stanje za domaći ili strani
      language,
      numberOfPages,
      description,
      tag,
      mediaType,
      cabinet,
      shelf,
      coverImage,
      authors: authorInputs,
      reviewers: recenzentInputs,
      inventoryNumber,
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
      navigate("/");
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

  const handleAddInput = (setStateFunction) => {
    setStateFunction((prevState) => [...prevState, ""]);
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
    <div className="container">
      <div className="form-container">
        <h1>Add a New Publication</h1>
        <form onSubmit={handleAddBook}>
          <div className="section">
            <div className="section-header">Osnovni podaci</div>
            <div className="section-content">
              <label>ID Publikacije:</label>
              <input type="text" disabled />
              <label>Inventarski broj:</label>
              <input
                type="text"
                value={inventoryNumber}
                onChange={(e) => setInventoryNumber(e.target.value)}
              />{" "}
              {/* Dodato input polje za inventarski broj */}
              <label>Signatura:</label>
              <input
                type="text"
                value={signature}
                onChange={(e) => setSignature(e.target.value)}
              />{" "}
              {/* Dodato input polje za signaturu */}
              <label>Tip publikacije:</label>
              <select
                value={publicationType}
                onChange={(e) => setPublicationType(e.target.value)}
              >
                <option value="Monografija">Monografija</option>
                <option value="Knjiga">Knjiga</option>
                <option value="Prirucnik">Priručnik</option>
                <option value="Recnik">Rečnik</option>
                <option value="LOLA INSTITUT">LOLA INSTITUT</option>
                <option value="Casopis">Časopis</option>
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
                  <label>Naslov:</label>
                  <input
                    type="text"
                    value={title}
                    onChange={(e) => setTitle(e.target.value)}
                  />
                  <label>Podnaslov:</label>
                  <input
                    type="text"
                    value={subtitle}
                    onChange={(e) => setSubtitle(e.target.value)}
                  />
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
              {publicationType !== "Konferencije" &&
                publicationType !== "Doktorske disertacije" &&
                publicationType !== "Magistarski radovi" &&
                publicationType !== "Diplomski radovi" && (
                  <>
                    <label>Naslov:</label>
                    <input
                      type="text"
                      value={title}
                      onChange={(e) => setTitle(e.target.value)}
                    />
                    <label>Podnaslov:</label>
                    <input
                      type="text"
                      value={subtitle}
                      onChange={(e) => setSubtitle(e.target.value)}
                    />
                  </>
                )}
              {publicationType === "Casopis" && (
                <>
                  <label>Domaći ili strani:</label>
                  <select
                    value={domaciStrani}
                    onChange={(e) => setDomaciStrani(e.target.value)}
                  >
                    <option value="">Izaberite</option>
                    <option value="Domaci">Domaći</option>
                    <option value="Strani">Strani</option>
                  </select>
                </>
              )}
              <label>Jezik:</label>
              <select
                value={language}
                onChange={(e) => setLanguage(e.target.value)}
              >
                <option value="Srpski">Srpski</option>
                <option value="Engleski">Engleski</option>
                <option value="Nemacki">Nemacki</option>
                <option value="Ruski">Ruski</option>
              </select>
            </div>
          </div>
          <div className="section">
            <div className="section-header">Ostali podaci</div>
            <div className="section-content">
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
                          onChange={(e) => setYearOfPublication(e.target.value)}
                        />
                        <label>Mesto izdanja:</label>
                        <input
                          type="text"
                          value={placeOfPublication}
                          onChange={(e) => setPlaceOfPublication(e.target.value)}
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
                    <option value="Štampana publikacija">
                      Štampana publikacija
                    </option>
                    <option value="E publikacija">E publikacija</option>
                    <option value="Audio publikacija">Audio publikacija</option>
                    <option value="URL">URL</option>
                  </select>
                </>
              )}
            </div>
          </div>
          <div className="section">
            <div className="section-header">Lokacija</div>
            <div className="section-content">
              <label>Kabinet:</label>
              <select
                value={cabinet}
                onChange={(e) => setCabinet(e.target.value)}
              >
                <option value="Biblioteka">Biblioteka</option>
                {Array.from({ length: 40 }, (_, i) => (
                  <option key={i + 1} value={`Kancelarija ${i + 1}`}>
                    Kancelarija {i + 1}
                  </option>
                ))}
              </select>
              <label>Polica:</label>
              <select value={shelf} onChange={(e) => setShelf(e.target.value)}>
                {letters.map((letter, index) => (
                  <option key={index} value={letter}>
                    {letter}
                  </option>
                ))}
              </select>
            </div>
          </div>
          {showAuthorsField && (
            <div className="section">
              <div className="section-header">Autori</div>
              <div className="section-content">
                {authorInputs.map((author, index) => (
                  <div key={index}>
                    <label>Author {index + 1}:</label>
                    <input
                      type="text"
                      value={author}
                      onChange={(e) =>
                        handleInputChange(setAuthorInputs, index, e.target.value)
                      }
                    />
                    {authorInputs.length > 1 && (
                      <button
                        type="button"
                        onClick={() =>
                          handleRemoveInput(setAuthorInputs, index)
                        }
                      >
                        Remove Author
                      </button>
                    )}
                  </div>
                ))}
                <button
                  type="button"
                  onClick={() => handleAddInput(setAuthorInputs)}
                >
                  Add Another Author
                </button>
              </div>
            </div>
          )}
          {showAuthorEditorReviewerFields && (
            <>
              <div className="section">
                <div className="section-header">Urednici</div>
                <div className="section-content">
                  {recenzentInputs.map((editor, index) => (
                    <div key={index}>
                      <label>Editor {index + 1}:</label>
                      <input
                        type="text"
                        value={editor}
                        onChange={(e) =>
                          handleInputChange(
                            setRecenzentInputs,
                            index,
                            e.target.value
                          )
                        }
                      />
                      {recenzentInputs.length > 1 && (
                        <button
                          type="button"
                          onClick={() =>
                            handleRemoveInput(setRecenzentInputs, index)
                          }
                        >
                          Remove Editor
                        </button>
                      )}
                    </div>
                  ))}
                  <button
                    type="button"
                    onClick={() => handleAddInput(setRecenzentInputs)}
                  >
                    Add Another Editor
                  </button>
                </div>
              </div>
              <div className="section">
                <div className="section-header">Recenzenti</div>
                <div className="section-content">
                  {recenzentInputs.map((reviewer, index) => (
                    <div key={index}>
                      <label>Reviewer {index + 1}:</label>
                      <input
                        type="text"
                        value={reviewer}
                        onChange={(e) =>
                          handleInputChange(
                            setRecenzentInputs,
                            index,
                            e.target.value
                          )
                        }
                      />
                      {recenzentInputs.length > 1 && (
                        <button
                          type="button"
                          onClick={() =>
                            handleRemoveInput(setRecenzentInputs, index)
                          }
                        >
                          Remove Reviewer
                        </button>
                      )}
                    </div>
                  ))}
                  <button
                    type="button"
                    onClick={() => handleAddInput(setRecenzentInputs)}
                  >
                    Add Another Reviewer
                  </button>
                </div>
              </div>
            </>
          )}
          {showMentorFields && (
            <div className="section">
              <div className="section-header">Mentori</div>
              <div className="section-content">
                {recenzentInputs.map((reviewer, index) => (
                  <div key={index}>
                    <label>Mentor {index + 1}:</label>
                    <input
                      type="text"
                      value={reviewer}
                      onChange={(e) =>
                        handleInputChange(
                          setRecenzentInputs,
                          index,
                          e.target.value
                        )
                      }
                    />
                    {recenzentInputs.length > 1 && (
                      <button
                        type="button"
                        onClick={() =>
                          handleRemoveInput(setRecenzentInputs, index)
                        }
                      >
                        Remove Mentor
                      </button>
                    )}
                  </div>
                ))}
                <button
                  type="button"
                  onClick={() => handleAddInput(setRecenzentInputs)}
                >
                  Add Another Mentor
                </button>
              </div>
            </div>
          )}
          <button type="submit">Save</button>
        </form>
      </div>
    </div>
  );
}

export default AddBook;
