import React, { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { auth } from "../../firebaseConfig";
import { onAuthStateChanged } from "firebase/auth";

function Home() {
  const [userName, setUserName] = useState("");
  const [showMenu, setShowMenu] = useState(false);  // State za prikazivanje dropdown menija
  const [showProfileMenu, setShowProfileMenu] = useState(false);  // State za prikazivanje profila i opcija za logout

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

  return (
    <div>
      <h2>{userName ? `Welcome - ${userName}` : "Login please"}</h2>

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
              <h1><Link to="/logout" onClick={() => setShowProfileMenu(false)}>Signout</Link></h1>
            </div>
          )}
        </>
      )}
    </div>
  );
}

export default Home;