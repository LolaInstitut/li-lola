import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { getAuth, onAuthStateChanged } from "firebase/auth";
import { db } from "../../firebaseConfig";
import { collection, query, where, getDocs } from "firebase/firestore";

function UserBooks() {
  const [user, setUser] = useState(null);
  const [books, setBooks] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const navigate = useNavigate();
  const auth = getAuth();

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
  }, [navigate, auth]);

  if (isLoading) {
    return <div>Loading...</div>;
  }

  return (
    <div>
      <h1>Your Books</h1>
      {books.length === 0 ? (
        <div>No books found.</div>
      ) : (
        <table>
          <thead>
            <tr>
              <th>Book Title</th>
              <th>Actions</th>
            </tr>
          </thead>
          <tbody>
            {books.map((book) => (
              <tr key={book.id}>
                <td>{book.title}</td>
                <td>
                  <button onClick={() => navigate(`/edit-book/${book.id}`)}>Edit</button>
                  <button onClick={() => navigate(`/delete-book/${book.id}`)}>Delete</button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      )}
    </div>
  );
}

export default UserBooks;
