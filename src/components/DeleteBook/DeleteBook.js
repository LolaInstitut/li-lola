import React, { useEffect, useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { doc, getDoc, deleteDoc } from 'firebase/firestore';
import { db } from '../../firebaseConfig';
import { getAuth, onAuthStateChanged } from 'firebase/auth';

function DeleteBook() {
  const { bookId } = useParams();
  const navigate = useNavigate();
  const [user, setUser] = useState(null);
  const [isOwner, setIsOwner] = useState(false);
  const auth = getAuth();

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, async (currentUser) => {
      if (currentUser) {
        setUser(currentUser);
        try {
          const bookDocRef = doc(db, 'books', bookId);
          const bookDoc = await getDoc(bookDocRef);
          if (bookDoc.exists() && bookDoc.data().userId === currentUser.uid) {
            setIsOwner(true);
          } else {
            alert('You are not authorized to delete this book.');
            navigate('/');
          }
        } catch (error) {
          console.error('Error fetching book:', error);
          alert('Error fetching book data.');
          navigate('/');
        }
      } else {
        navigate('/login');
      }
    });

    return () => unsubscribe();
  }, [bookId, navigate, auth]);

  const handleDeleteBook = async () => {
    if (!user || !isOwner) {
      alert('You are not authorized to delete this book.');
      return;
    }

    try {
      const bookDocRef = doc(db, 'books', bookId);
      await deleteDoc(bookDocRef);
      alert('Book deleted successfully');
      navigate('/');
    } catch (error) {
      console.error('Error deleting document:', error);
      alert('Error deleting book: ' + error.message);
    }
  };

  return (
    <div>
      <h1>Delete Book</h1>
      <p>Are you sure you want to delete this book?</p>
      <button onClick={handleDeleteBook}>Yes, Delete</button>
      <button onClick={() => navigate('/')}>Cancel</button>
    </div>
  );
}

export default DeleteBook;
