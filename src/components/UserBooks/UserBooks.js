import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { auth, db } from "../../firebaseConfig";
import { onAuthStateChanged } from "firebase/auth";
import { collection, query, where, getDocs } from "firebase/firestore";

function UserBooks() {
  const [user, setUser] = useState(null);
  const [books, setBooks] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const navigate = useNavigate();

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, async (currentUser) => {
      if (currentUser) {
        setUser(currentUser);
        try {
          const q = query(collection(db, "books"), where("userId", "==", currentUser.uid));
          const querySnapshot = await getDocs(q);
          const userBooks = querySnapshot.docs.map((doc) => ({ id: doc.id, ...doc.data() }));
          setBooks(userBooks);
        } catch (error) {
          console.error("Error fetching user books:", error);
        }
      } else {
        navigate("/login");
      }
      setIsLoading(false);
    });

    return () => unsubscribe();
  }, [navigate]);

  if (isLoading) {
    return <div>Loading...</div>;
  }

  return (
    <div>
      <h1>Your Books</h1>
      {books.length === 0 ? (
        <div>No books found.</div>
      ) : (
        <ul>
          {books.map((book) => (
            <li key={book.id}>
              <h2>{book.title}</h2>
              <p>{book.subtitle}</p>
              <button onClick={() => navigate(`/edit-book/${book.id}`)}>Edit</button>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}

export default UserBooks;
