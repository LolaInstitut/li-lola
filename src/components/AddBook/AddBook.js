import React, { useEffect, useState, useRef } from "react";
import { useNavigate } from "react-router-dom";
import { auth, db } from "../../firebaseConfig";
import { onAuthStateChanged } from "firebase/auth";
import { collection, addDoc } from "firebase/firestore";

function AddBook() {
  const navigate = useNavigate();
  const [user, setUser] = useState(null);
  const [authorInputs, setAuthorInputs] = useState([""]);
  const [urednikInputs, setUrednikInputs] = useState([""]);
  const [recenzentInputs, setRecenzentInputs] = useState([""]);
  const [title, setTitle] = useState("");
  const [subtitle, setSubtitle] = useState("");
  const [publicationType, setPublicationType] = useState("Knjiga");
  const [bookType, setBookType] = useState("Monografija");
  const [language, setLanguage] = useState("Srpski");
  const [publisher, setPublisher] = useState("");
  const [yearOfPublication, setYearOfPublication] = useState("");
  const [placeOfPublication, setPlaceOfPublication] = useState("");
  const [placeOfPrint, setPlaceOfPrint] = useState("");
  const [numberOfPrint, setNumberOfPrint] = useState("");
  const [ISBN, setISBN] = useState("");
  const [CIP, setCIP] = useState("");
  const [URL, setURL] = useState("");
  const [numberOfPages, setNumberOfPages] = useState("");
  const [description, setDescription] = useState("");
  const [tag, setTag] = useState("");
  const [mediaType, setMediaType] = useState("Štampana publikacija");
  const [cabinet, setCabinet] = useState("");
  const [shelf, setShelf] = useState("");
  const [coverImage, setCoverImage] = useState(null);
  const fileInputRef = useRef(null);

  const letters = "ABCDEFGHIJKLMNOPQRSTUVWXYZ".split("");

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, (currentUser) => {
      if (currentUser) {
        setUser(currentUser);
      } else {
        navigate("/login");
      }
    });

    return () => unsubscribe();
  }, [navigate]);

  const handleAddBook = async (e) => {
    e.preventDefault();
    if (!user) {
      alert("You must be logged in to add a book.");
      return;
    }

    try {
      const docRef = await addDoc(collection(db, "books"), {
        title,
        subtitle,
        publicationType,
        bookType,
        language,
        publisher,
        yearOfPublication,
        placeOfPublication,
        placeOfPrint,
        numberOfPrint,
        ISBN,
        CIP,
        URL,
        numberOfPages,
        description,
        tag,
        mediaType,
        cabinet,
        shelf,
        coverImage,
        authors: authorInputs,
        editors: urednikInputs,
        reviewers: recenzentInputs,
        userId: user.uid,
      });
      alert("Book added with ID: " + docRef.id);
      navigate("/");
    } catch (error) {
      console.error("Error adding document: ", error);
      alert("Error adding book: " + error.message);
    }
  };

  const handleInputChange = (setStateFunction, index, value) => {
    setStateFunction((prevState) => {
      const updatedState = [...prevState];
      updatedState[index] = value;
      return updatedState;
    });
  };

  const handleAddInput = (setStateFunction) => {
    setStateFunction((prevState) => [...prevState, ""]);
  };

  const handleRemoveInput = (setStateFunction, index) => {
    setStateFunction((prevState) => {
      if (prevState.length > 1) {
        // Ensure at least one input field remains
        const updatedState = [...prevState];
        updatedState.splice(index, 1);
        return updatedState;
      }
      return prevState;
    });
  };

  const handleCameraButtonClick = () => {
    fileInputRef.current.click();
  };

  const handleFileChange = (e) => {
    const file = e.target.files[0];
    const reader = new FileReader();
    reader.onloadend = () => {
      setCoverImage(reader.result);
    };
    reader.readAsDataURL(file);
  };

  const handleRemoveCoverImage = () => {
    setCoverImage(null);
    fileInputRef.current.value = ""; // Clear the file input
  };

  if (!user) {
    return <div>Loading or not authenticated...</div>;
  }

  return (
    <div>
      <h1>Add a New Book</h1>
      <form onSubmit={handleAddBook}>
        <label>Title:</label>
        <input
          type="text"
          value={title}
          onChange={(e) => setTitle(e.target.value)}
        />
        <label>Subtitle:</label>
        <input
          type="text"
          value={subtitle}
          onChange={(e) => setSubtitle(e.target.value)}
        />
        <label>Publication Type:</label>
        <select
          value={publicationType}
          onChange={(e) => setPublicationType(e.target.value)}
        >
          <option value="Knjiga">Knjiga</option>
          <option value="Časopis">Časopis</option>
          <option value="Dokument">Dokument</option>
        </select>
        <label>Book Type:</label>
        <select value={bookType} onChange={(e) => setBookType(e.target.value)}>
          <option value="Monografija">Monografija</option>
          <option value="Udzbenik">Udzbenik</option>
          <option value="Ostalo">Ostalo</option>
        </select>
        <label>Language:</label>
        <select value={language} onChange={(e) => setLanguage(e.target.value)}>
          <option value="Srpski">Srpski</option>
          <option value="Engleski">Engleski</option>
          <option value="Nemacki">Nemacki</option>
          <option value="Ruski">Ruski</option>
        </select>
        <label>Publisher:</label>
        <input
          type="text"
          value={publisher}
          onChange={(e) => setPublisher(e.target.value)}
        />
        <label>
          Godina izdanja:
          <input
            type="date"
            value={yearOfPublication}
            onChange={(e) => setYearOfPublication(e.target.value)}
          />
        </label>
        <label>Place of Publication:</label>
        <input
          type="text"
          value={placeOfPublication}
          onChange={(e) => setPlaceOfPublication(e.target.value)}
        />
        <label>Place of Print:</label>
        <input
          type="text"
          value={placeOfPrint}
          onChange={(e) => setPlaceOfPrint(e.target.value)}
        />
        <label>Number of Print:</label>
        <input
          type="text"
          value={numberOfPrint}
          onChange={(e) => setNumberOfPrint(e.target.value)}
        />
        <label>ISBN:</label>
        <input
          type="text"
          value={ISBN}
          onChange={(e) => setISBN(e.target.value)}
        />
        <label>CIP:</label>
        <input
          type="text"
          value={CIP}
          onChange={(e) => setCIP(e.target.value)}
        />
        <label>URL:</label>
        <input
          type="text"
          value={URL}
          onChange={(e) => setURL(e.target.value)}
        />
        <label>Number of Pages:</label>
        <input
          type="text"
          value={numberOfPages}
          onChange={(e) => setNumberOfPages(e.target.value)}
        />
        <label>Description:</label>
        <textarea
          value={description}
          onChange={(e) => setDescription(e.target.value)}
        />
        <label>Tag:</label>
        <input
          type="text"
          value={tag}
          onChange={(e) => setTag(e.target.value)}
        />
        <label>Media Type:</label>
        <select
          value={mediaType}
          onChange={(e) => setMediaType(e.target.value)}
        >
          <option value="Štampana publikacija">Štampana publikacija</option>
          <option value="E publikacija">E publikacija</option>
          <option value="Audio publikacija">Audio publikacija</option>
        </select>
        <label>Cabinet:</label>
        <select value={cabinet} onChange={(e) => setCabinet(e.target.value)}>
          <option value="Biblioteka">Biblioteka</option>
          {Array.from({ length: 40 }, (_, i) => (
            <option key={i + 1} value={`Kancelarija ${i + 1}`}>
              Kancelarija {i + 1}
            </option>
          ))}
        </select>
        <label>Shelf:</label>
        <select value={shelf} onChange={(e) => setShelf(e.target.value)}>
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
          style={{ display: "none" }}
          ref={fileInputRef}
        />
        <button type="button" onClick={handleCameraButtonClick}>
          Upload Cover Image
        </button>
        {coverImage && (
          <div>
            <img
              src={coverImage}
              alt="Cover Preview"
              style={{ maxWidth: "200px", maxHeight: "200px" }}
            />
            <button type="button" onClick={handleRemoveCoverImage}>
              Remove Cover Image
            </button>
          </div>
        )}

        {authorInputs.map((author, index) => (
          <div key={index}>
            <label>Author {index + 1}:</label>
            <input
              type="text"
              value={author}
              onChange={(e) =>
                handleInputChange(setAuthorInputs, index, e.target.value)
              }
            />
            {authorInputs.length > 1 && (
              <button
                type="button"
                onClick={() => handleRemoveInput(setAuthorInputs, index)}
              >
                Remove Author
              </button>
            )}
          </div>
        ))}
        <button type="button" onClick={() => handleAddInput(setAuthorInputs)}>
          Add Another Author
        </button>

        {urednikInputs.map((editor, index) => (
          <div key={index}>
            <label>Editor {index + 1}:</label>
            <input
              type="text"
              value={editor}
              onChange={(e) =>
                handleInputChange(setUrednikInputs, index, e.target.value)
              }
            />
            {urednikInputs.length > 1 && (
              <button
                type="button"
                onClick={() => handleRemoveInput(setUrednikInputs, index)}
              >
                Remove Editor
              </button>
            )}
          </div>
        ))}
        <button type="button" onClick={() => handleAddInput(setUrednikInputs)}>
          Add Another Editor
        </button>

        {recenzentInputs.map((reviewer, index) => (
          <div key={index}>
            <label>Reviewer {index + 1}:</label>
            <input
              type="text"
              value={reviewer}
              onChange={(e) =>
                handleInputChange(setRecenzentInputs, index, e.target.value)
              }
            />
            {recenzentInputs.length > 1 && (
              <button
                type="button"
                onClick={() => handleRemoveInput(setRecenzentInputs, index)}
              >
                Remove Reviewer
              </button>
            )}
          </div>
        ))}
        <button
          type="button"
          onClick={() => handleAddInput(setRecenzentInputs)}
        >
          Add Another Reviewer
        </button>

        <button type="submit">Add Book</button>
      </form>
    </div>
  );
}

export default AddBook;
