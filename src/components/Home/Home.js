import React, { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { auth, db } from "../../firebaseConfig";
import { onAuthStateChanged } from "firebase/auth";
import { collection, getDocs } from "firebase/firestore";  // Import Firestore functions

function Home() {
  const [userName, setUserName] = useState("");
  const [showMenu, setShowMenu] = useState(false);  // State za prikazivanje dropdown menija
  const [showProfileMenu, setShowProfileMenu] = useState(false);  // State za prikazivanje profila i opcija za logout
  const [books, setBooks] = useState([]);  // State za čuvanje knjiga
  const [searchTerm, setSearchTerm] = useState(""); // State za pretragu
  const [bookTypes, setBookTypes] = useState({ Monografija: false, Udzbenik: false, Ostalo: false }); // State za tipove knjiga
  const [mediaTypes, setMediaTypes] = useState({ 'Štampana publikacija': false, 'E-publikacija': false, 'Audio publikacija': false }); // State za tipove medija

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, (user) => {
      if (user) {
        setUserName(user.displayName || "No name set");
        setShowMenu(false); // Zatvara meni za prijavu/registraciju ako je korisnik prijavljen
      } else {
        setUserName(null);  // Resetovanje imena kada korisnik nije prijavljen
      }
    });

    return () => unsubscribe();
  }, []);

  useEffect(() => {
    const fetchBooks = async () => {
      try {
        console.log("Fetching books from Firestore...");
        const querySnapshot = await getDocs(collection(db, "books"));
        const booksList = querySnapshot.docs.map(doc => ({
          id: doc.id,
          ...doc.data()
        }));
        console.log("Books fetched from Firestore:", booksList); // Log fetched books
        setBooks(booksList);
        console.log("Books state set:", booksList);
      } catch (error) {
        console.error("Error fetching books: ", error);
      }
    };

    fetchBooks();
  }, []);

  // Funkcija za promenu stanja checkbox-a za tip knjige
  const handleBookTypeChange = (type) => {
    setBookTypes((prevTypes) => ({
      ...prevTypes,
      [type]: !prevTypes[type]
    }));
  };

  // Funkcija za promenu stanja checkbox-a za tip medija
  const handleMediaTypeChange = (type) => {
    setMediaTypes((prevTypes) => ({
      ...prevTypes,
      [type]: !prevTypes[type]
    }));
  };

  // Filtriramo knjige na osnovu unetog termina za pretragu, tipa knjige i tipa medija
  const filteredBooks = books.filter(book => {
    const title = book.title ? book.title.toLowerCase() : "";
    const author = book.author ? book.author.toLowerCase() : "";
    const matchesSearchTerm = title.includes(searchTerm.toLowerCase()) || author.includes(searchTerm.toLowerCase());

    const activeBookTypes = Object.keys(bookTypes).filter(type => bookTypes[type]);
    const matchesBookType = activeBookTypes.length === 0 || activeBookTypes.includes(book.bookType);

    const activeMediaTypes = Object.keys(mediaTypes).filter(type => mediaTypes[type]);
    const matchesMediaType = activeMediaTypes.length === 0 || activeMediaTypes.includes(book.mediaType);

    return matchesSearchTerm && matchesBookType && matchesMediaType;
  });

  console.log("Selected Book Types:", bookTypes);
  console.log("Selected Media Types:", mediaTypes);
  console.log("Filtered Books:", filteredBooks);

  return (
    <div className="container">
      <h2>{userName ? `Welcome - ${userName}` : "Browse Books"}</h2>

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
              <button onClick={() => setShowMenu(!showMenu)}>Login</button>
              {showMenu && (
                <div style={{ backgroundColor: "white", position: "absolute", padding: "10px", boxShadow: "0px 2px 10px rgba(0,0,0,0.1)" }}>
                  <h1><Link to="/login" onClick={() => setShowMenu(false)}>Login</Link></h1>
                  <h1><Link to="/signup" onClick={() => setShowMenu(false)}>Signup</Link></h1>
                </div>
              )}
            </>
          )}

          {userName && (
            <>
              <button onClick={() => setShowProfileMenu(!showProfileMenu)}>Profil</button>
              {showProfileMenu && (
                <div style={{ backgroundColor: "white", position: "absolute", padding: "10px", boxShadow: "0px 2px 10px rgba(0,0,0,0.1)" }}>
                  <h1><Link to="/profile" onClick={() => setShowProfileMenu(false)}>Profil</Link></h1>
                  <h1><Link to="/addbook" onClick={() => setShowProfileMenu(false)}>Add Book</Link></h1>
                  <h1><Link to="/userbook" onClick={() => setShowProfileMenu(false)}>User Books</Link></h1>
                  <h1><Link to="/logout" onClick={() => setShowProfileMenu(false)}>Signout</Link></h1>
                </div>
              )}
            </>
          )}
        </div>
      </div>

      {/* Filter za tip knjige */}
      <div className="filters-container">
        <div className="filter-group">
          <label>Book Types:</label>
          {Object.keys(bookTypes).map((type) => (
            <label key={type}>
              <input
                type="checkbox"
                checked={bookTypes[type]}
                onChange={() => handleBookTypeChange(type)}
              /> {type}
            </label>
          ))}
        </div>

        <div className="filter-group">
          <label>Media Types:</label>
          {Object.keys(mediaTypes).map((type) => (
            <label key={type}>
              <input
                type="checkbox"
                checked={mediaTypes[type]}
                onChange={() => handleMediaTypeChange(type)}
              /> {type}
            </label>
          ))}
        </div>
      </div>

      {/* Prikaz knjiga */}
      <div className="books-list-container">
        {filteredBooks.length > 0 ? (
          <ul>
            {filteredBooks.map((book) => (
              <li key={book.id}>
                <h4>{book.title}</h4>
                <p>{book.author}</p>
              </li>
            ))}
          </ul>
        ) : (
          <p>No books available</p>
        )}
      </div>
    </div>
  );
}

export default Home;
