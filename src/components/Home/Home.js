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

  // Filtriramo knjige na osnovu unetog termina za pretragu
  const filteredBooks = books.filter(book => {
    const title = book.title ? book.title.toLowerCase() : "";
    const author = book.author ? book.author.toLowerCase() : "";
    return title.includes(searchTerm.toLowerCase()) || author.includes(searchTerm.toLowerCase());
  });

  return (
    <div>
      <h2>{userName ? `Welcome - ${userName}` : "Browse Books"}</h2>

      {/* Toggle dugme za prikazivanje opcija, prikazuje se samo ako korisnik nije prijavljen */}
      {!userName && (
        <>
          <button onClick={() => setShowMenu(!showMenu)}>Login</button>
          {/* Dropdown meni koji se prikazuje kada je dugme aktivirano */}
          {showMenu && (
            <div style={{ backgroundColor: "white", position: "absolute", padding: "10px", boxShadow: "0px 2px 10px rgba(0,0,0,0.1)" }}>
              <h1><Link to="/login" onClick={() => setShowMenu(false)}>Login</Link></h1>
              <h1><Link to="/signup" onClick={() => setShowMenu(false)}>Signup</Link></h1>
            </div>
          )}
        </>
      )}

      {/* Prikaz dugmeta Profil samo ako je korisnik prijavljen */}
      {userName && (
        <>
          <button onClick={() => setShowProfileMenu(!showProfileMenu)}>Profil</button>
          {/* Dropdown meni za profil i odjavu */}
          {showProfileMenu && (
            <div style={{ backgroundColor: "white", position: "absolute", padding: "10px", boxShadow: "0px 2px 10px rgba(0,0,0,0.1)" }}>
              <h1><Link to="/profile" onClick={() => setShowProfileMenu(false)}>Profil</Link></h1>
              <h1><Link to="/addbook" onClick={() => setShowProfileMenu(false)}>Add Book</Link></h1>
              <h1><Link to="/editbook" onClick={() => setShowProfileMenu(false)}>Edit Book</Link></h1>
              <h1><Link to="/userbook" onClick={() => setShowProfileMenu(false)}>User Books</Link></h1>
              <h1><Link to="/logout" onClick={() => setShowProfileMenu(false)}>Signout</Link></h1>
            </div>
          )}
        </>
      )}

      {/* Pretraga knjiga */}
      <div>
        <input
          type="text"
          placeholder="Search for books..."
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          style={{ margin: "20px 0", padding: "10px", width: "100%", boxSizing: "border-box" }}
        />
      </div>

      {/* Prikaz knjiga */}
      <div>
        <h3>Books List:</h3>
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
