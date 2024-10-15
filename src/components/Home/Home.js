import React, { useEffect, useRef, useState } from "react";
import { Link } from "react-router-dom";
import { auth, db } from "../../firebaseConfig";
import { onAuthStateChanged } from "firebase/auth";
import { collection, getDocs, doc, getDoc } from "firebase/firestore";
import styles from "./Home.module.css";

function Home() {
  const [userName, setUserName] = useState("");
  const [lastName, setLastName] = useState("");
  const [showMenu, setShowMenu] = useState(false);
  const [showProfileMenu, setShowProfileMenu] = useState(false);
  const [books, setBooks] = useState([]);
  const [searchTerm, setSearchTerm] = useState("");

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

  const [akademskiRadoviSubTypes, setAkademskiRadoviSubTypes] = useState({
    "Doktorske disertacije": false,
    "Magistarski radovi": false,
    "Diplomski radovi": false,
  });

  const [mediaTypes, setMediaTypes] = useState({
    "Štampana publikacija": false,
    "E-publikacija": false,
    "Audio publikacija": false,
  });

  const [categories, setCategories] = useState({
    Informatika: false,
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

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, async (user) => {
      if (user) {
        const userDoc = await getDoc(doc(db, "users", user.uid));
        if (userDoc.exists()) {
          const userData = userDoc.data();
          setUserName(userData.name || "No name set");
          setLastName(userData.lastname || "No last name set");
        }
        setShowMenu(false);
      } else {
        setUserName(null);
        setLastName(null);
      }
    });

    return () => unsubscribe();
  }, []);

  useEffect(() => {
    const fetchBooks = async () => {
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
      }
    };

    fetchBooks();
  }, []);

  useEffect(() => {
    if (loginButtonRef.current) {
      setMenuWidth(loginButtonRef.current.offsetWidth);
    }
  }, [loginButtonRef.current]);

  useEffect(() => {
    if (profileButtonRef.current) {
      setMenuWidth(profileButtonRef.current.offsetWidth);
    }
  }, [profileButtonRef.current]);

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
              "Casopis",
              "Akademski radovi",
              "Konferencije - Proceedings",
              "Ostalo",
            ].includes(key) && updatedTypes[key]
        )
      ) {
        setCategories({
          Informatika: false,
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

  const handleAkademskiRadoviSubTypeChange = (subType) => {
    setAkademskiRadoviSubTypes((prevSubTypes) => ({
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

    const activeAcademicWorkTypes = Object.keys(akademskiRadoviSubTypes).filter(
      (subType) => akademskiRadoviSubTypes[subType]
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

  return (
    <div className="container">
      <h2>{userName ? `${userName} ${lastName}` : ""}</h2>

      <div className="books-list-header">
        <div className="search-container">
          <input
            type="text"
            placeholder="Search for books..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="search-input"
          />

          {!userName && (
            <>
              <div style={{ position: "relative" }}>
                <button
                  ref={loginButtonRef}
                  onClick={() => setShowMenu(!showMenu)}
                >
                  Login
                </button>
                {showMenu && (
                  <div
                    style={{
                      backgroundColor: "white",
                      position: "absolute",
                      top: "100%",
                      left: 0,
                      padding: "10px",
                      boxShadow: "0px 2px 10px rgba(0,0,0,0.1)",
                      fontSize: "50%",
                      width: `${menuWidth}px`,
                    }}
                  >
                    <h1>
                      <Link to="/login" onClick={() => setShowMenu(false)}>
                        Login
                      </Link>
                    </h1>
                    <h1>
                      <Link to="/signup" onClick={() => setShowMenu(false)}>
                        Signup
                      </Link>
                    </h1>
                  </div>
                )}
              </div>
            </>
          )}

          {userName && (
            <>
              <div style={{ position: "relative" }}>
                <button
                  ref={profileButtonRef}
                  onClick={() => setShowProfileMenu(!showProfileMenu)}
                >
                  Profil
                </button>
                {showProfileMenu && (
                  <div
                    style={{
                      backgroundColor: "white",
                      position: "absolute",
                      top: "100%",
                      left: 0,
                      padding: "10px",
                      boxShadow: "0px 2px 10px rgba(0,0,0,0.1)",
                      fontSize: "50%",
                      width: `${menuWidth}px`,
                    }}
                  >
                    <h1>
                      <Link
                        to="/profile"
                        onClick={() => setShowProfileMenu(false)}
                      >
                        Profil
                      </Link>
                    </h1>
                    <h1>
                      <Link
                        to="/addbook"
                        onClick={() => setShowProfileMenu(false)}
                      >
                        Add Book
                      </Link>
                    </h1>
                    <h1>
                      <Link
                        to="/userbook"
                        onClick={() => setShowProfileMenu(false)}
                      >
                        User Books
                      </Link>
                    </h1>
                    <h1>
                      <Link
                        to="/logout"
                        onClick={() => setShowProfileMenu(false)}
                      >
                        Signout
                      </Link>
                    </h1>
                  </div>
                )}
              </div>
            </>
          )}
        </div>
      </div>

      <div className="filters-container">
        <div className="filter-group">
          <label>Book Types:</label>
          {Object.keys(bookTypes)
            .slice(0, 3)
            .map(
              (
                type // Prikaži samo prve 3 filtera
              ) => (
                <label key={type}>
                  <input
                    type="checkbox"
                    checked={bookTypes[type]}
                    onChange={() => handleBookTypeChange(type)}
                  />{" "}
                  {type}
                </label>
              )
            )}
          {!showAllBookTypes && (
            <button
              onClick={() => setShowAllBookTypes(true)}
              className="show-more-button"
            >
              Show more filters
            </button>
          )}
          {showAllBookTypes && (
            <>
              {Object.keys(bookTypes)
                .slice(3)
                .map(
                  (
                    type // Prikaži preostale filtere
                  ) => (
                    <label key={type}>
                      <input
                        type="checkbox"
                        checked={bookTypes[type]}
                        onChange={() => handleBookTypeChange(type)}
                      />{" "}
                      {type}
                    </label>
                  )
                )}
              <button
                onClick={() => setShowAllBookTypes(false)}
                className="show-more-button"
              >
                Show fewer filters
              </button>
            </>
          )}

          {bookTypes["Knjige"] && (
            <div className="sub-filter-group">
              <label>Sub Types:</label>
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

          {bookTypes["Akademski radovi"] && (
            <div className="sub-filter-group">
              <label>Sub Types:</label>
              {Object.keys(akademskiRadoviSubTypes).map((subType) => (
                <label key={subType}>
                  <input
                    type="checkbox"
                    checked={akademskiRadoviSubTypes[subType]}
                    onChange={() => handleAkademskiRadoviSubTypeChange(subType)}
                  />{" "}
                  {subType}
                </label>
              ))}
            </div>
          )}
        </div>

        {showCategoryFilter && (
          <div className="filter-group">
            <label>Oblast:</label>
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
          <div className="filter-group">
            <label>Media Types:</label>
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
          <>
            <div className="filter-group">
              <label>Journal Type:</label>
              <select
                value={journalType}
                onChange={(e) => handleJournalTypeChange(e.target.value)}
              >
                <option value="">All Types</option>
                <option value="Domaci">Domaci</option>
                <option value="Strani">Strani</option>
              </select>
            </div>

            <div className="filter-group">
              <label>Journal Language:</label>
              <select
                value={journalLanguage}
                onChange={(e) => handleJournalLanguageChange(e.target.value)}
              >
                <option value="">All Languages</option>
                {journalType === "Domaci" && (
                  <option value="Srpski">Srpski</option>
                )}
                {journalType === "Strani" && (
                  <>
                    <option value="Engleski">Engleski</option>
                    <option value="Nemacki">Nemacki</option>
                    <option value="Ruski">Ruski</option>
                  </>
                )}
              </select>
            </div>
          </>
        )}
      </div>

      <div className="books-list">
        {filteredBooks.length > 0 ? (
          <table className={styles.booksTable}>
            <thead>
              <tr>
                <th>Title</th>
                <th>Author</th>
                <th>Type</th>
                <th>Tags</th>
                <th>Journal Language</th>
              </tr>
            </thead>
            <tbody>
              {filteredBooks.map((book) => (
                <tr key={book.id}>
                  <td>
                    <Link to={`/book/${book.id}`}>{book.title}</Link>
                  </td>
                  <td>{book.authors.join(", ")}</td>
                  <td>{book.publicationType}</td>
                  <td>
                    {Array.isArray(book.tag) ? book.tag.join(", ") : book.tag}
                  </td>
                  <td>{book.language}</td>
                </tr>
              ))}
            </tbody>
          </table>
        ) : (
          <p>No books found.</p>
        )}
      </div>
    </div>
  );
}

export default Home;
