import React, { useEffect, useRef, useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { auth, db } from "../../firebaseConfig";
import { onAuthStateChanged } from "firebase/auth";
import {
  collection,
  getDocs,
  doc,
  getDoc,
  deleteDoc,
} from "firebase/firestore";
import { ChevronDown, ChevronRight } from "lucide-react";
import styles from "./Home.module.css";

const authorizedEmails = [
  "ognjen.tomic@li.rs",
  "srecko.manasijevic@li.rs",
  "vladimir.mitrovic@li.rs",
];

function Home() {
  const [userName, setUserName] = useState(null);
  const [isAdmin, setIsAdmin] = useState(false);
  const [showMenu, setShowMenu] = useState(false);
  const [isBibliotekaOpen, setIsBibliotekaOpen] = useState(false);
  const [isKnjigeOpen, setIsKnjigeOpen] = useState(false);
  const [books, setBooks] = useState([]);
  const [searchTerm, setSearchTerm] = useState("");
  const [darkMode, setDarkMode] = useState(() => {
    return localStorage.getItem("darkMode") === "true";
  });
  const [isLoading, setIsLoading] = useState(true);
  const [isBooksLoading, setIsBooksLoading] = useState(false);
  const [isHeaderVisible, setIsHeaderVisible] = useState(true);

  const [bookTypes, setBookTypes] = useState({
    Knjige: false,
    "LOLA INSTITUT": false,
    "Konferencije - Proceedings": false,
    Casopis: false,
    "Akademski radovi": false,
    Ostalo: false,
  });

  const [knjigeSubTypes, setKnjigeSubTypes] = useState({
    Monografija: false,
    Udzbenik: false,
    Priručnici: false,
    Rečnici: false,
  });

  const [languageSubTypes, setLanguageSubTypes] = useState({
    Srpski: false,
    Engleski: false,
    Nemački: false,
    Ruski: false,
  });

  const [oblastSubTypes, setOblastSubTypes] = useState({
    IT: false,
    Mašinstvo: false,
    Elektrotehnika: false,
    Robotika: false,
    "Cad/Cam": false,
    IAMA: false,
  });

  const [akademskiSubTypes, setAkademskiSubTypes] = useState({
    "Doktorske radovište": false,
    "Magistarski radovi": false,
    "Diplomski radovi": false,
  });

  const [mediaTypes, setMediaTypes] = useState({
    "Štampana publikacija": false,
    "E-publikacija": false,
    "Audio publikacija": false,
  });

  const [categories, setCategories] = useState({
    IT: false,
    Mašinstvo: false,
    Elektrotehnika: false,
    Robotika: false,
    "Cad/Cam": false,
    IAMA: false,
  });

  const [journalType, setJournalType] = useState("");
  const [journalLanguage, setJournalLanguage] = useState("");
  const [showMediaTypeFilter, setShowMediaTypeFilter] = useState(false);
  const [showAllBookTypes, setShowAllBookTypes] = useState(false);

  const loginButtonRef = useRef(null);
  const profileButtonRef = useRef(null);
  const [menuWidth, setMenuWidth] = useState(null);
  const navigate = useNavigate();

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, async (user) => {
      setIsLoading(true);
      if (user) {
        const userDoc = await getDoc(doc(db, "users", user.uid));
        if (userDoc.exists()) {
          const userData = userDoc.data();
          setUserName(userData.name || user.email.split("@")[0] || "Korisnik");
          setIsAdmin(userData.isAdmin || false);
        }
      } else {
        setUserName(null);
        setIsAdmin(false);
      }
      setIsLoading(false);
    });

    return () => unsubscribe();
  }, []);

  useEffect(() => {
    const fetchBooks = async () => {
      setIsBooksLoading(true);
      try {
        const querySnapshot = await getDocs(collection(db, "books"));
        const booksList = querySnapshot.docs.map((doc) => ({
          id: doc.id,
          ...doc.data(),
        }));
        console.log("Fetched Books:", booksList);
        setBooks(booksList);
      } catch (error) {
        console.error("Error fetching books: ", error);
      } finally {
        setIsBooksLoading(false);
      }
    };

    fetchBooks();
  }, []);

  useEffect(() => {
    if (loginButtonRef.current) {
      setMenuWidth(loginButtonRef.current.offsetWidth);
    }
  }, []);

  useEffect(() => {
    if (profileButtonRef.current) {
      setMenuWidth(profileButtonRef.current.offsetWidth);
    }
  }, []);

  useEffect(() => {
    if (darkMode) {
      document.body.classList.add("dark-mode");
      localStorage.setItem("darkMode", "true");
    } else {
      document.body.classList.remove("dark-mode");
      localStorage.setItem("darkMode", "false");
    }
  }, [darkMode]);

  useEffect(() => {
    const handleScroll = () => {
      const scrollTop = window.pageYOffset || document.documentElement.scrollTop;
      setIsHeaderVisible(scrollTop < 100);
    };

    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  const handleBookTypeChange = (type) => {
    setBookTypes((prevTypes) => {
      const updatedTypes = {
        ...prevTypes,
        [type]: !prevTypes[type],
      };

      if (
        Object.keys(updatedTypes).some(
          (key) =>
            [
              "Knjige",
              "Monografija",
              "Priručnici",
              "Rečnici",
              "LOLA INSTITUT",
              "Casopisi",
              "Akademski radovi",
              "Konferencije - Proceedings",
              "Ostalo",
            ].includes(key) && updatedTypes[key]
        )
      ) {
        setCategories({
          IT: false,
          Mašinstvo: false,
          Elektrotehnika: false,
          Robotika: false,
          "Cad/Cam": false,
          IAMA: false,
        });
        setShowMediaTypeFilter(false);
      }

      return updatedTypes;
    });
  };

  const handleKnjigeSubTypeChange = (subType) => {
    setKnjigeSubTypes((prevSubTypes) => ({
      ...prevSubTypes,
      [subType]: !prevSubTypes[subType],
    }));
  };

  const handleLanguageSubTypeChange = (language) => {
    setLanguageSubTypes((prevSubTypes) => ({
      ...prevSubTypes,
      [language]: !prevSubTypes[language],
    }));
  };

  const handleOblastSubTypeChange = (oblast) => {
    setOblastSubTypes((prevSubTypes) => ({
      ...prevSubTypes,
      [oblast]: !prevSubTypes[oblast],
    }));
  };

  const handleAkademskiSubTypeChange = (subType) => {
    setAkademskiSubTypes((prevSubTypes) => ({
      ...prevSubTypes,
      [subType]: !prevSubTypes[subType],
    }));
  };

  const handleCategoryChange = (category) => {
    setCategories((prevCategories) => {
      const updatedCategories = {
        ...prevCategories,
        [category]: !prevCategories[category],
      };

      if (Object.values(updatedCategories).some((value) => value)) {
        setShowMediaTypeFilter(true);
      } else {
        setShowMediaTypeFilter(false);
      }

      return updatedCategories;
    });
  };

  const handleMediaTypeChange = (type) => {
    setMediaTypes((prevTypes) => ({
      ...prevTypes,
      [type]: !prevTypes[type],
    }));
  };

  const handleJournalTypeChange = (type) => {
    setJournalType(type);
    if (type === "Domaci") {
      setJournalLanguage("Srpski");
    } else if (type === "Strani") {
      setJournalLanguage("");
    }
  };

  const handleJournalLanguageChange = (language) => {
    setJournalLanguage(language);
  };

  const handleDeleteBook = async (bookId) => {
    const currentUser = auth.currentUser;
    if (!currentUser || !authorizedEmails.includes(currentUser.email)) {
      alert("Samo određeni korisnici mogu brisati knjige.");
      return;
    }

    if (
      !window.confirm("Da li ste sigurni da želite da obrišete ovu knjigu?")
    ) {
      return;
    }

    try {
      await deleteDoc(doc(db, "books", bookId));
      setBooks((prevBooks) => prevBooks.filter((book) => book.id !== bookId));
      alert("Knjiga je uspešno obrisana.");
    } catch (error) {
      console.error("Greška prilikom brisanja knjige: ", error);
      alert("Došlo je do greške prilikom brisanja knjige.");
    }
  };

  const filteredBooks = books.filter((book) => {
    const title = book.title ? book.title.toLowerCase() : "";
    const author = book.authors ? book.authors.join(", ").toLowerCase() : "";
    const matchesSearchTerm =
      title.includes(searchTerm.toLowerCase()) ||
      author.includes(searchTerm.toLowerCase());

    const activeBookTypes = Object.keys(bookTypes).filter(
      (type) => bookTypes[type]
    );

    const matchesBookType =
      activeBookTypes.length === 0 ||
      (bookTypes["Knjige"] && book.publicationType === "Knjiga") ||
      activeBookTypes.includes(book.publicationType);

    const activeKnjigeSubTypes = Object.keys(knjigeSubTypes).filter(
      (subType) => knjigeSubTypes[subType]
    );
    const matchesKnjigeSubType =
      !bookTypes["Knjige"] ||
      activeKnjigeSubTypes.length === 0 ||
      activeKnjigeSubTypes.includes(book.publicationType);

    const activeLanguageSubTypes = Object.keys(languageSubTypes).filter(
      (language) => languageSubTypes[language]
    );
    const matchesLanguageSubType =
      !bookTypes["Knjige"] ||
      activeLanguageSubTypes.length === 0 ||
      activeLanguageSubTypes.includes(book.language);

    const activeOblastSubTypes = Object.keys(oblastSubTypes).filter(
      (oblast) => oblastSubTypes[oblast]
    );
    const matchesOblastSubType =
      !bookTypes["Knjige"] ||
      activeOblastSubTypes.length === 0 ||
      activeOblastSubTypes.some((oblast) =>
        Array.isArray(book.tag)
          ? book.tag.includes(oblast)
          : book.tag === oblast
      );

    const activeAcademicWorkTypes = Object.keys(akademskiSubTypes).filter(
      (subType) => akademskiSubTypes[subType]
    );

    const matchesAcademicWorkType =
      !bookTypes["Akademski radovi"] ||
      activeAcademicWorkTypes.length === 0 ||
      activeAcademicWorkTypes.includes(book.publicationType);

    const activeMediaTypes = Object.keys(mediaTypes).filter(
      (type) => mediaTypes[type]
    );
    const matchesMediaType =
      activeMediaTypes.length === 0 ||
      activeMediaTypes.includes(book.mediaType);

    const activeCategories = Object.keys(categories).filter(
      (category) => categories[category]
    );
    const matchesCategory =
      activeCategories.length === 0 ||
      activeCategories.some((category) =>
        Array.isArray(book.tag)
          ? book.tag.includes(category)
          : book.tag === category
      );

    const matchesJournalType =
      journalType === "" || book.journalType === journalType;

    const matchesJournalLanguage =
      journalLanguage === "" || book.language === journalLanguage;

    return (
      matchesSearchTerm &&
      matchesBookType &&
      matchesKnjigeSubType &&
      matchesLanguageSubType &&
      matchesOblastSubType &&
      matchesAcademicWorkType &&
      matchesMediaType &&
      matchesCategory &&
      matchesJournalType &&
      matchesJournalLanguage
    );
  });

  const showCategoryFilter = bookTypes["Monografija"];
  const showJournalFilters = bookTypes["Casopis"];
  const showAcademicWorkFilters = bookTypes["Akademski radovi"];

  const totalUsers = 9;
  const totalBooks = books.length;
  const filteredBooksCount = filteredBooks.length;

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
    <div
      className={`${styles.container} ${darkMode ? styles["dark-mode"] : ""}`}
    >
      <div className={styles.filtersSidebar}>
        {userName ? (
          <>
            <img
              src="/logo.png"
              alt="LOLA Institut Logo"
              className={styles.logo}
            /> {/* Logo shown when logged in, replacing user profile */}
            <div className={styles["admin-sidebar-menu"]}>
              <button
                className={`${styles["admin-sidebar-btn"]} ${styles["organization-btn"]}`}
                onClick={() => setIsBibliotekaOpen(!isBibliotekaOpen)}
              >
                {isBibliotekaOpen ? (
                  <ChevronDown size={20} />
                ) : (
                  <ChevronRight size={20} />
                )}
                🏢 Sadrzaj biblioteke
              </button>
              {isBibliotekaOpen && (
                <div className={styles["admin-sidebar-submenu"]}>
                  <label>
                    <input
                      type="checkbox"
                      checked={bookTypes["Knjige"]}
                      onChange={() => handleBookTypeChange("Knjige")}
                    />{" "}
                    Knjige
                  </label>
                  <label>
                    <input
                      type="checkbox"
                      checked={bookTypes["Prirucnik"]}
                      onChange={() => handleBookTypeChange("Prirucnik")}
                    />{" "}
                    Priručnici
                  </label>
                  {bookTypes["Knjige"] && (
                    <div className={styles["admin-sidebar-subsubmenu"]}>
                      <h4>Podtipovi knjiga</h4>
                      {Object.keys(knjigeSubTypes).map((subType) => (
                        <label key={subType}>
                          <input
                            type="checkbox"
                            checked={knjigeSubTypes[subType]}
                            onChange={() => handleKnjigeSubTypeChange(subType)}
                          />{" "}
                          {subType}
                        </label>
                      ))}
                    </div>
                  )}
                  {bookTypes["Knjige"] && (
                    <div className={styles["admin-sidebar-subsubmenu"]}>
                      <h4>Jezik</h4>
                      {Object.keys(languageSubTypes).map((language) => (
                        <label key={language}>
                          <input
                            type="checkbox"
                            checked={languageSubTypes[language]}
                            onChange={() =>
                              handleLanguageSubTypeChange(language)
                            }
                          />{" "}
                          {language}
                        </label>
                      ))}
                    </div>
                  )}
                  {bookTypes["Knjige"] && (
                    <div className={styles["admin-sidebar-subsubmenu"]}>
                      <h4>Oblast</h4>
                      {Object.keys(oblastSubTypes).map((oblast) => (
                        <label key={oblast}>
                          <input
                            type="checkbox"
                            checked={oblastSubTypes[oblast]}
                            onChange={() => handleOblastSubTypeChange(oblast)}
                          />{" "}
                          {oblast}
                        </label>
                      ))}
                    </div>
                  )}
                  <label>
                    <input
                      type="checkbox"
                      checked={bookTypes["LOLA INSTITUT"]}
                      onChange={() => handleBookTypeChange("LOLA INSTITUT")}
                    />{" "}
                    LOLA INSTITUT
                  </label>
                  <label>
                    <input
                      type="checkbox"
                      checked={bookTypes["Konferencije - Proceedings"]}
                      onChange={() =>
                        handleBookTypeChange("Konferencije - Proceedings")
                      }
                    />{" "}
                    Zbornici - Proceedings
                  </label>
                  {!showAllBookTypes && (
                    <button
                      onClick={() => setShowAllBookTypes(true)}
                      className={styles.showMoreButton}
                    >
                      Prikaži više filtera
                    </button>
                  )}
                  {showAllBookTypes && (
                    <>
                      <label>
                        <input
                          type="checkbox"
                          checked={bookTypes["Casopis"]}
                          onChange={() => handleBookTypeChange("Casopis")}
                        />{" "}
                        Casopisi
                      </label>
                      <label>
                        <input
                          type="checkbox"
                          checked={bookTypes["Akademski radovi"]}
                          onChange={() =>
                            handleBookTypeChange("Akademski radovi")
                          }
                        />{" "}
                        Akademski radovi
                      </label>
                      <label>
                        <input
                          type="checkbox"
                          checked={bookTypes["Ostalo"]}
                          onChange={() => handleBookTypeChange("Ostalo")}
                        />{" "}
                        Ostalo
                      </label>
                      <button
                        onClick={() => setShowAllBookTypes(false)}
                        className={styles.showMoreButton}
                      >
                        Prikaži manje filtera
                      </button>
                    </>
                  )}
                </div>
              )}
              {userName && (
                <>
                  <button
                    className={`${styles["admin-sidebar-btn"]} ${styles["organization-btn"]} Home_admin-sidebar-btn__i6N8Q Home_organization-btn__VONga`}
                    onClick={() => setIsKnjigeOpen(!isKnjigeOpen)}
                  >
                    {isKnjigeOpen ? (
                      <ChevronDown size={20} />
                    ) : (
                      <ChevronRight size={20} />
                    )}
                    📚 Knjige
                  </button>
                  {isKnjigeOpen && (
                    <div className={styles["admin-sidebar-submenu"]}>
                      <Link
                        to="/addbook"
                        onClick={() => setIsKnjigeOpen(false)}
                        className={styles["admin-sidebar-subbtn"]}
                      >
                        📝 Dodaj novu knjigu
                      </Link>
                      <Link
                        to="/userbook"
                        onClick={() => setIsKnjigeOpen(false)}
                        className={styles["admin-sidebar-subbtn"]}
                      >
                        📖 Knjige korisnika
                      </Link>
                      <Link
                        to="/rented-books"
                        onClick={() => setIsKnjigeOpen(false)}
                        className={styles["admin-sidebar-subbtn"]}
                      >
                        📚 Lista iznajmljenih knjiga
                      </Link>
                    </div>
                  )}
                  <button
                    className={`${styles["admin-sidebar-btn"]} ${styles["organization-btn"]}`}
                    onClick={() => navigate("/profile")}
                  >
                    🔐 Profil
                  </button>
                  <button
                    className={styles["admin-sidebar-btn"]}
                    onClick={() => navigate("/logout")}
                  >
                    📤 Izloguj se
                  </button>
                </>
              )}
              <button
                className={`${styles["admin-sidebar-btn"]} ${styles["organization-btn"]}`}
                onClick={() => setDarkMode(!darkMode)}
              >
                🌗 {darkMode ? "Svetli mod" : "Tamni mod"}
              </button>
            </div>
            {userName && isAdmin && (
              <div className={styles["admin-stats"]}>
                <div
                  className={`${styles["stat-card"]} ${styles["users"]}`}
                  data-type="users"
                >
                  <h3>{totalUsers}</h3>
                  <p>Ukupno korisnika</p>
                </div>
                <div
                  className={`${styles["stat-card"]} ${styles["books"]}`}
                  data-type="books"
                >
                  <h3>{totalBooks}</h3>
                  <p>Ukupno knjiga</p>
                </div>
                <div
                  className={`${styles["stat-card"]} ${styles["filtered"]}`}
                  data-type="filtered"
                >
                  <h3>{filteredBooksCount}</h3>
                  <p>Filtrirane knjige</p>
                </div>
              </div>
            )}
          </>
        ) : (
          <>
            <img
              src="/logo.png"
              alt="LOLA Institut Logo"
              className={styles.logo}
            /> {/* Logo shown when not logged in */}
            <div className={styles["admin-sidebar-menu"]}>
              <button
                className={`${styles["admin-sidebar-btn"]} ${styles["organization-btn"]}`}
                onClick={() => setIsBibliotekaOpen(!isBibliotekaOpen)}
              >
                {isBibliotekaOpen ? (
                  <ChevronDown size={20} />
                ) : (
                  <ChevronRight size={20} />
                )}
                🏢 Sadrzaj biblioteke
              </button>
              {isBibliotekaOpen && (
                <div className={styles["admin-sidebar-submenu"]}>
                  <label>
                    <input
                      type="checkbox"
                      checked={bookTypes["Knjige"]}
                      onChange={() => handleBookTypeChange("Knjige")}
                    />{" "}
                    Knjige
                  </label>
                  <label>
                    <input
                      type="checkbox"
                      checked={bookTypes["Prirucnik"]}
                      onChange={() => handleBookTypeChange("Prirucnik")}
                    />{" "}
                    Priručnici
                  </label>
                  {bookTypes["Knjige"] && (
                    <div className={styles["admin-sidebar-subsubmenu"]}>
                      <h4>Podtipovi knjiga</h4>
                      {Object.keys(knjigeSubTypes).map((subType) => (
                        <label key={subType}>
                          <input
                            type="checkbox"
                            checked={knjigeSubTypes[subType]}
                            onChange={() => handleKnjigeSubTypeChange(subType)}
                          />{" "}
                          {subType}
                        </label>
                      ))}
                    </div>
                  )}
                  {bookTypes["Knjige"] && (
                    <div className={styles["admin-sidebar-subsubmenu"]}>
                      <h4>Jezik</h4>
                      {Object.keys(languageSubTypes).map((language) => (
                        <label key={language}>
                          <input
                            type="checkbox"
                            checked={languageSubTypes[language]}
                            onChange={() =>
                              handleLanguageSubTypeChange(language)
                            }
                          />{" "}
                          {language}
                        </label>
                      ))}
                    </div>
                  )}
                  {bookTypes["Knjige"] && (
                    <div className={styles["admin-sidebar-subsubmenu"]}>
                      <h4>Oblast</h4>
                      {Object.keys(oblastSubTypes).map((oblast) => (
                        <label key={oblast}>
                          <input
                            type="checkbox"
                            checked={oblastSubTypes[oblast]}
                            onChange={() => handleOblastSubTypeChange(oblast)}
                          />{" "}
                          {oblast}
                        </label>
                      ))}
                    </div>
                  )}
                  <label>
                    <input
                      type="checkbox"
                      checked={bookTypes["LOLA INSTITUT"]}
                      onChange={() => handleBookTypeChange("LOLA INSTITUT")}
                    />{" "}
                    LOLA INSTITUT
                  </label>
                  <label>
                    <input
                      type="checkbox"
                      checked={bookTypes["Konferencije - Proceedings"]}
                      onChange={() =>
                        handleBookTypeChange("Konferencije - Proceedings")
                      }
                    />{" "}
                    Zbornici - Proceedings
                  </label>
                  {!showAllBookTypes && (
                    <button
                      onClick={() => setShowAllBookTypes(true)}
                      className={styles.showMoreButton}
                    >
                      Prikaži više filtera
                    </button>
                  )}
                  {showAllBookTypes && (
                    <>
                      <label>
                        <input
                          type="checkbox"
                          checked={bookTypes["Casopis"]}
                          onChange={() => handleBookTypeChange("Casopis")}
                        />{" "}
                        Casopisi
                      </label>
                      <label>
                        <input
                          type="checkbox"
                          checked={bookTypes["Akademski radovi"]}
                          onChange={() =>
                            handleBookTypeChange("Akademski radovi")
                          }
                        />{" "}
                        Akademski radovi
                      </label>
                      <label>
                        <input
                          type="checkbox"
                          checked={bookTypes["Ostalo"]}
                          onChange={() => handleBookTypeChange("Ostalo")}
                        />{" "}
                        Ostalo
                      </label>
                      <button
                        onClick={() => setShowAllBookTypes(false)}
                        className={styles.showMoreButton}
                      >
                        Prikaži manje filtera
                      </button>
                    </>
                  )}
                </div>
              )}
              <button
                ref={loginButtonRef}
                className={styles["admin-sidebar-btn"]}
                onClick={() => navigate("/login")}
              >
                📥 Uloguj se / Registruj se
              </button>
              <button
                className={`${styles["admin-sidebar-btn"]} ${styles["organization-btn"]}`}
                onClick={() => setDarkMode(!darkMode)}
              >
                🌗 {darkMode ? "Svetli mod" : "Tamni mod"}
              </button>
            </div>
          </>
        )}
      </div>

      <div className={styles.mainContent}>
        <div className={styles["admin-welcome"]}>
          {isHeaderVisible && <h1>Biblioteka LOLA INSTITUTA</h1>}
        </div>

        <div className={styles.booksListHeader}>
          <div className={styles.searchContainer}>
            <input
              type="text"
              placeholder="Pretraži..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className={styles.searchInput}
            />
          </div>
        </div>

        <div className={styles.filtersContainer}>
          {showAcademicWorkFilters && (
            <div className={styles.filterSection}>
              <h4>Podtipovi akademskih radova</h4>
              {Object.keys(akademskiSubTypes).map((subType) => (
                <label key={subType}>
                  <input
                    type="checkbox"
                    checked={akademskiSubTypes[subType]}
                    onChange={() => handleAkademskiSubTypeChange(subType)}
                  />{" "}
                  {subType}
                </label>
              ))}
            </div>
          )}

          {showCategoryFilter && (
            <div className={styles.filterSection}>
              <h4>Kategorije</h4>
              {Object.keys(categories).map((category) => (
                <label key={category}>
                  <input
                    type="checkbox"
                    checked={categories[category]}
                    onChange={() => handleCategoryChange(category)}
                  />{" "}
                  {category}
                </label>
              ))}
            </div>
          )}

          {showMediaTypeFilter && (
            <div className={styles.filterSection}>
              <h4>Tip medija</h4>
              {Object.keys(mediaTypes).map((type) => (
                <label key={type}>
                  <input
                    type="checkbox"
                    checked={mediaTypes[type]}
                    onChange={() => handleMediaTypeChange(type)}
                  />{" "}
                  {type}
                </label>
              ))}
            </div>
          )}

          {showJournalFilters && (
            <div className={styles.filterSection}>
              <h4>Tip časopisa</h4>
              <select
                value={journalType}
                onChange={(e) => handleJournalTypeChange(e.target.value)}
              >
                <option value="">Svi</option>
                <option value="Domaci">Domaći</option>
                <option value="Strani">Strani</option>
              </select>
              {journalType && (
                <div>
                  <h4>Jezik</h4>
                  <select
                    value={journalLanguage}
                    onChange={(e) =>
                      handleJournalLanguageChange(e.target.value)
                    }
                  >
                    <option value="">Svi</option>
                    {journalType === "Domaci" && (
                      <option value="Srpski">Srpski</option>
                    )}
                    {journalType === "Strani" && (
                      <>
                        <option value="Engleski">Engleski</option>
                        <option value="Drugi">Drugi</option>
                      </>
                    )}
                  </select>
                </div>
              )}
            </div>
          )}
        </div>

        <div className={styles.booksList}>
          {isBooksLoading ? (
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
          ) : filteredBooks.length > 0 ? (
            <table className={styles.booksTable}>
              <thead>
                <tr>
                  <th>Naslov</th>
                  <th>Autor</th>
                  <th>Tip</th>
                  <th>Oblast</th>
                  <th>Jezik</th>
                  {userName && isAdmin && <th>Akcije</th>}
                </tr>
              </thead>
              <tbody>
                {filteredBooks
                  .sort((a, b) => a.title.localeCompare(b.title))
                  .map((book) => (
                    <tr key={book.id}>
                      <td
                        data-label="Naslov"
                        className={styles["title-column"]}
                      >
                        <Link to={`/book/${book.id}`}>{book.title}</Link>
                      </td>
                      <td data-label="Autor">{book.authors.join(", ")}</td>
                      <td data-label="Tip">{book.publicationType}</td>
                      <td data-label="Oznake">
                        {Array.isArray(book.tag)
                          ? book.tag.join(", ")
                          : book.tag}
                      </td>
                      <td data-label="Jezik časopisa">{book.language}</td>
                      {userName && isAdmin && (
                        <td data-label="Akcije">
                          <button
                            onClick={() => navigate(`/edit-book/${book.id}`)}
                          >
                            Uredi
                          </button>
                          <button
                            onClick={() => handleDeleteBook(book.id)}
                            disabled={
                              !authorizedEmails.includes(auth.currentUser.email)
                            }
                          >
                            Obriši
                          </button>
                        </td>
                      )}
                    </tr>
                  ))}
              </tbody>
            </table>
          ) : (
            <p>Nema pronađenih knjiga.</p>
          )}
        </div>
      </div>
    </div>
  );
}

export default Home;