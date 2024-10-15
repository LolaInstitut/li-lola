import React, { useEffect, useState } from 'react';
import { useParams } from 'react-router-dom';
import { doc, getDoc } from 'firebase/firestore';
import { db } from '../../firebaseConfig';
import styles from "./Book.module.css";

function Book() {
  const { bookId } = useParams();
  const [book, setBook] = useState(null);

  useEffect(() => {
    const fetchBook = async () => {
      try {
        const docRef = doc(db, "books", bookId);
        const docSnap = await getDoc(docRef);
        if (docSnap.exists()) {
          setBook(docSnap.data());
        } else {
          console.log("No such document!");
        }
      } catch (error) {
        console.error("Error fetching book: ", error);
      }
    };

    fetchBook();
  }, [bookId]);

  if (!book) {
    return <div>Loading...</div>;
  }

  return (
    <div className={styles.container}>
      <table className={styles.invisibleTable}>
        <tbody>
          <tr>
            <td><strong>Title:</strong></td>
            <td>{book.title}</td>
          </tr>
          <tr>
            <td><strong>Subtitle:</strong></td>
            <td>{book.subtitle}</td>
          </tr>
          <tr>
            <td><strong>Publication Type:</strong></td>
            <td>{book.publicationType}</td>
          </tr>
          <tr>
            <td><strong>Book Type:</strong></td>
            <td>{book.bookType}</td>
          </tr>
          <tr>
            <td><strong>Language:</strong></td>
            <td>{book.language}</td>
          </tr>
          <tr>
            <td><strong>Publisher:</strong></td>
            <td>{book.publisher}</td>
          </tr>
          <tr>
            <td><strong>Year of Publication:</strong></td>
            <td>{book.yearOfPublication}</td>
          </tr>
          <tr>
            <td><strong>Place of Publication:</strong></td>
            <td>{book.placeOfPublication}</td>
          </tr>
          <tr>
            <td><strong>Place of Print:</strong></td>
            <td>{book.placeOfPrint}</td>
          </tr>
          <tr>
            <td><strong>Number of Print:</strong></td>
            <td>{book.numberOfPrint}</td>
          </tr>
          <tr>
            <td><strong>ISBN:</strong></td>
            <td>{book.ISBN}</td>
          </tr>
          <tr>
            <td><strong>CIP:</strong></td>
            <td>{book.CIP}</td>
          </tr>
          <tr>
            <td><strong>URL:</strong></td>
            <td><a href={book.URL} target="_blank" rel="noopener noreferrer">{book.URL}</a></td>
          </tr>
          <tr>
            <td><strong>Number of Pages:</strong></td>
            <td>{book.numberOfPages}</td>
          </tr>
          <tr>
            <td><strong>Description:</strong></td>
            <td>{book.description}</td>
          </tr>
          <tr>
            <td><strong>Tag:</strong></td>
            <td>{book.tag}</td>
          </tr>
          <tr>
            <td><strong>Media Type:</strong></td>
            <td>{book.mediaType}</td>
          </tr>
          <tr>
            <td><strong>Cabinet:</strong></td>
            <td>{book.cabinet}</td>
          </tr>
          <tr>
            <td><strong>Shelf:</strong></td>
            <td>{book.shelf}</td>
          </tr>
          <tr>
            <td><strong>Inventory Number:</strong></td>
            <td>{book.inventoryNumber}</td>
          </tr>
          <tr>
            <td><strong>Signature:</strong></td>
            <td>{book.signature}</td>
          </tr>
          <tr>
            <td><strong>Cover Image:</strong></td>
            <td>{book.coverImage && <img src={book.coverImage} alt={`${book.title} cover`} />}</td>
          </tr>
          <tr>
            <td><strong>Authors:</strong></td>
            <td>{book.authors.join(', ')}</td>
          </tr>
          <tr>
            <td><strong>Editors:</strong></td>
            <td>{book.editors.join(', ')}</td>
          </tr>
          <tr>
            <td><strong>Reviewers:</strong></td>
            <td>{book.reviewers.join(', ')}</td>
          </tr>
        </tbody>
      </table>
    </div>
  );
}

export default Book;
