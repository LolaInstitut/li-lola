import React, { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import InputControl from "../InputControl/InputControl";
import { createUserWithEmailAndPassword, updateProfile } from "firebase/auth";
import { auth, db } from "../../firebaseConfig";
import { doc, setDoc } from "firebase/firestore"; // Import Firestore functions
import styles from "./Signup.module.css";

function Signup() {
  const navigate = useNavigate();
  const [values, setValues] = useState({
    name: "",
    lastname: "",
    email: "",
    password: "",
    phone: "",
    company: "",
    position: "",

  });

  const [errorMsg, setErrorMsg] = useState("");
  const [submitButtonDisabled, setSubmitButtonDisabled] = useState(false);

  const handleSubmissions = () => {
    if (!values.name || !values.lastname || !values.email || !values.password || !values.phone || !values.company || !values.position) {
      setErrorMsg("Fill all fields");
      return;
    }
    setErrorMsg("");
    setSubmitButtonDisabled(true);

    createUserWithEmailAndPassword(auth, values.email, values.password)
      .then(async (res) => {
        const user = res.user;
        await updateProfile(user, {
          displayName: values.name,
          displayLastname: values.lastname,
          displayEmail: values.email,
          displayPassword: values.password,
          displayPhone: values.phone,
          displayCompany: values.company,
          displayPosition: values.position,
        });
        // Add user data to Firestore
        await setDoc(doc(db, "users", user.uid), {
          name: values.name,
          lastname: values.lastname,
          email: values.email,
          password: values.password,
          phone: values.phone,
          company: values.company,
          position: values.position,
        });
        navigate("/");
      })
      .catch((err) => {
        setErrorMsg(err.message);
      })
      .finally(() => {
        setSubmitButtonDisabled(false);
      });
  };

  return (
    <div className={styles.container}>
      <div className={styles.innerBox}>
        <h1 className={styles.heading}>Signup</h1>
        <InputControl
          label="Name"
          placeholder="Enter your name..."
          onChange={(event) =>
            setValues((prev) => ({ ...prev, name: event.target.value }))
          }
        />
        <InputControl
          label="Lastname"
          placeholder="Enter your lastname..."
          onChange={(event) =>
            setValues((prev) => ({ ...prev, lastname: event.target.value }))
          }
        />
        <InputControl
          label="Email"
          placeholder="Enter your email address..."
          onChange={(event) =>
            setValues((prev) => ({ ...prev, email: event.target.value }))
          }
        />
        <InputControl
          label="Password"
          placeholder="Enter your password..."
          onChange={(event) =>
            setValues((prev) => ({ ...prev, password: event.target.value }))
          }
        />
                <InputControl
          label="Phone"
          placeholder="Enter your phone..."
          onChange={(event) =>
            setValues((prev) => ({ ...prev, phone: event.target.value }))
          }
        />
                <InputControl
          label="Company"
          placeholder="Enter your company name..."
          onChange={(event) =>
            setValues((prev) => ({ ...prev, company: event.target.value }))
          }
        />
                <InputControl
          label="Position"
          placeholder="Enter your position in company..."
          onChange={(event) =>
            setValues((prev) => ({ ...prev, position: event.target.value }))
          }
        />

        <div className={styles.footer}>
          <b className={styles.errorMsg}>{errorMsg}</b>
          <button onClick={handleSubmissions} disabled={submitButtonDisabled}>
            Sign up
          </button>
          <p>
            Already have an account?{" "}
            <span>
              <Link to="/login">Login</Link>
            </span>
          </p>
        </div>
      </div>
    </div>
  );
}

export default Signup;
