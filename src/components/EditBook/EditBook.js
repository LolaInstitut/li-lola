import React, { useEffect, useState, useRef } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { auth, db } from '../../firebaseConfig';
import { onAuthStateChanged } from 'firebase/auth';
import { doc, getDoc, updateDoc } from 'firebase/firestore';

function EditBook() {
  const navigate = useNavigate();
  const { bookId } = useParams();
  const [user, setUser] = useState(null);
  const [bookData, setBookData] = useState(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isOwner, setIsOwner] = useState(false);
  const fileInputRef = useRef(null);
  const letters = "ABCDEFGHIJKLMNOPQRSTUVWXYZ".split("");

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, async (currentUser) => {
      if (currentUser) {
        setUser(currentUser);

        try {
          const bookDocRef = doc(db, 'books', bookId);
          const bookDoc = await getDoc(bookDocRef);

          if (bookDoc.exists()) {
            const bookData = bookDoc.data();
            setBookData(bookData);
            setIsOwner(bookData.userId === currentUser.uid);
          } else {
            alert('Book not found');
            navigate('/');
          }
        } catch (error) {
          console.error('Error fetching book:', error);
          alert('Error fetching book data.');
          navigate('/');
        } finally {
          setIsLoading(false);
        }
      } else {
        navigate('/login');
      }
    });

    return () => unsubscribe();
  }, [bookId, navigate]);

  const handleUpdateBook = async (e) => {
    e.preventDefault();
    if (!user || !isOwner) {
      alert('You are not authorized to edit this book.');
      return;
    }

    try {
      const bookDocRef = doc(db, 'books', bookId);
      await updateDoc(bookDocRef, bookData);
      alert('Book updated successfully');
      navigate('/');
    } catch (error) {
      console.error('Error updating document:', error);
      alert('Error updating book: ' + error.message);
    }
  };

  const handleInputChange = (field, value) => {
    setBookData({ ...bookData, [field]: value });
  };

  const handleAddInput = (field) => {
    setBookData({ ...bookData, [field]: [...bookData[field], ""] });
  };

  const handleRemoveInput = (field, index) => {
    const updatedArray = bookData[field].filter((_, i) => i !== index);
    setBookData({ ...bookData, [field]: updatedArray });
  };

  const handleFileChange = (e) => {
    const file = e.target.files[0];
    const reader = new FileReader();
    reader.onloadend = () => {
      setBookData({ ...bookData, coverImage: reader.result });
    };
    reader.readAsDataURL(file);
  };

  const handleRemoveCoverImage = () => {
    setBookData({ ...bookData, coverImage: null });
    fileInputRef.current.value = "";
  };

  if (isLoading) {
    return <div>Loading...</div>;
  }

  if (!isOwner) {
    return <div>You are not authorized to edit this book.</div>;
  }

  return (
    <div>
      <h1>Edit Book</h1>
      <form onSubmit={handleUpdateBook}>
        <label>Title:</label>
        <input
          type="text"
          value={bookData.title || ""}
          onChange={(e) => handleInputChange("title", e.target.value)}
        />
        <label>Subtitle:</label>
        <input
          type="text"
          value={bookData.subtitle || ""}
          onChange={(e) => handleInputChange("subtitle", e.target.value)}
        />
        <label>Publication Type:</label>
        <select
          value={bookData.publicationType || "Knjiga"}
          onChange={(e) => handleInputChange("publicationType", e.target.value)}
        >
          <option value="Knjiga">Knjiga</option>
          <option value="Časopis">Časopis</option>
          <option value="Dokument">Dokument</option>
        </select>
        <label>Book Type:</label>
        <select
          value={bookData.bookType || "Monografija"}
          onChange={(e) => handleInputChange("bookType", e.target.value)}
        >
          <option value="Monografija">Monografija</option>
          <option value="Udzbenik">Udzbenik</option>
          <option value="Ostalo">Ostalo</option>
        </select>
        <label>Language:</label>
        <select
          value={bookData.language || "Srpski"}
          onChange={(e) => handleInputChange("language", e.target.value)}
        >
          <option value="Srpski">Srpski</option>
          <option value="Engleski">Engleski</option>
          <option value="Nemacki">Nemacki</option>
          <option value="Ruski">Ruski</option>
        </select>
        <label>Publisher:</label>
        <input
          type="text"
          value={bookData.publisher || ""}
          onChange={(e) => handleInputChange("publisher", e.target.value)}
        />
        <label>Year of Publication:</label>
        <input
          type="date"
          value={bookData.yearOfPublication || ""}
          onChange={(e) => handleInputChange("yearOfPublication", e.target.value)}
        />
        <label>Place of Publication:</label>
        <input
          type="text"
          value={bookData.placeOfPublication || ""}
          onChange={(e) => handleInputChange("placeOfPublication", e.target.value)}
        />
        <label>Place of Print:</label>
        <input
          type="text"
          value={bookData.placeOfPrint || ""}
          onChange={(e) => handleInputChange("placeOfPrint", e.target.value)}
        />
        <label>Number of Print:</label>
        <input
          type="text"
          value={bookData.numberOfPrint || ""}
          onChange={(e) => handleInputChange("numberOfPrint", e.target.value)}
        />
        <label>ISBN:</label>
        <input
          type="text"
          value={bookData.ISBN || ""}
          onChange={(e) => handleInputChange("ISBN", e.target.value)}
        />
        <label>CIP:</label>
        <input
          type="text"
          value={bookData.CIP || ""}
          onChange={(e) => handleInputChange("CIP", e.target.value)}
        />
        <label>URL:</label>
        <input
          type="text"
          value={bookData.URL || ""}
          onChange={(e) => handleInputChange("URL", e.target.value)}
        />
        <label>Number of Pages:</label>
        <input
          type="text"
          value={bookData.numberOfPages || ""}
          onChange={(e) => handleInputChange("numberOfPages", e.target.value)}
        />
        <label>Description:</label>
        <textarea
          value={bookData.description || ""}
          onChange={(e) => handleInputChange("description", e.target.value)}
        />
        <label>Tag:</label>
        <input
          type="text"
          value={bookData.tag || ""}
          onChange={(e) => handleInputChange("tag", e.target.value)}
        />
        <label>Media Type:</label>
        <select
          value={bookData.mediaType || "Štampana publikacija"}
          onChange={(e) => handleInputChange("mediaType", e.target.value)}
        >
          <option value="Štampana publikacija">Štampana publikacija</option>
          <option value="E publikacija">E publikacija</option>
          <option value="Audio publikacija">Audio publikacija</option>
        </select>
        <label>Cabinet:</label>
        <input
          type="text"
          value={bookData.cabinet || ""}
          onChange={(e) => handleInputChange("cabinet", e.target.value)}
        />
        <label>Shelf:</label>
        <select
          value={bookData.shelf || ""}
          onChange={(e) => handleInputChange("shelf", e.target.value)}
        >
          {letters.map((letter, index) => (
            <option key={index} value={letter}>
              {letter}
            </option>
          ))}
        </select>
        <label>Cover Image:</label>
        <input
          type="file"
          accept="image/*"
          onChange={handleFileChange}
          style={{ display: 'none' }}
          ref={fileInputRef}
        />
        <button type="button" onClick={() => fileInputRef.current.click()}>Upload Cover Image</button>
        {bookData.coverImage && (
          <div>
            <img src={bookData.coverImage} alt="Cover Preview" style={{ maxWidth: '200px', maxHeight: '200px' }} />
            <button type="button" onClick={handleRemoveCoverImage}>Remove Cover Image</button>
          </div>
        )}
        
        {bookData.authors && bookData.authors.map((author, index) => (
          <div key={index}>
            <label>Author {index + 1}:</label>
            <input
              type="text"
              value={author}
              onChange={(e) => {
                const authors = [...bookData.authors];
                authors[index] = e.target.value;
                setBookData({ ...bookData, authors });
              }}
            />
            {bookData.authors.length > 1 && (
              <button type="button" onClick={() => handleRemoveInput("authors", index)}>Remove Author</button>
            )}
          </div>
        ))}
        <button type="button" onClick={() => handleAddInput("authors")}>Add Another Author</button>

        {bookData.editors && bookData.editors.map((editor, index) => (
          <div key={index}>
            <label>Editor {index + 1}:</label>
            <input
              type="text"
              value={editor}
              onChange={(e) => {
                const editors = [...bookData.editors];
                editors[index] = e.target.value;
                setBookData({ ...bookData, editors });
              }}
            />
            {bookData.editors.length > 1 && (
              <button type="button" onClick={() => handleRemoveInput("editors", index)}>Remove Editor</button>
            )}
          </div>
        ))}
        <button type="button" onClick={() => handleAddInput("editors")}>Add Another Editor</button>

        {bookData.reviewers && bookData.reviewers.map((reviewer, index) => (
          <div key={index}>
            <label>Reviewer {index + 1}:</label>
            <input
              type="text"
              value={reviewer}
              onChange={(e) => {
                const reviewers = [...bookData.reviewers];
                reviewers[index] = e.target.value;
                setBookData({ ...bookData, reviewers });
              }}
            />
            {bookData.reviewers.length > 1 && (
              <button type="button" onClick={() => handleRemoveInput("reviewers", index)}>Remove Reviewer</button>
            )}
          </div>
        ))}
        <button type="button" onClick={() => handleAddInput("reviewers")}>Add Another Reviewer</button>
        
        <button type="submit">Update Book</button>
      </form>
    </div>
  );
}

export default EditBook;