import React, { useState, useEffect } from 'react';
import { auth, db } from "../../firebaseConfig";
import { doc, getDoc, updateDoc } from "firebase/firestore";
import { updateProfile } from "firebase/auth";
import InputControl from "../InputControl/InputControl";
import { useNavigate } from "react-router-dom";
import styles from "./Profile.module.css";

function Profile() {
    const [user, setUser] = useState(null);
    const [values, setValues] = useState({
        name: "",
        email: "",
    });
    const [errorMsg, setErrorMsg] = useState('');
    const navigate = useNavigate();

    useEffect(() => {
        if (auth.currentUser) {
            setUser(auth.currentUser);
            const fetchData = async () => {
                const userDoc = await getDoc(doc(db, "users", auth.currentUser.uid));
                if (userDoc.exists()) {
                    setValues(userDoc.data());
                } else {
                    setErrorMsg("No user data found.");
                }
            };
            fetchData();
        } else {
            navigate('/login');
        }
    }, [navigate]);

    const handleUpdate = async () => {
        if (!values.name) {
            setErrorMsg("Name field cannot be empty.");
            return;
        }
        setErrorMsg('');
        try {
            await updateProfile(auth.currentUser, { displayName: values.name });
            await updateDoc(doc(db, "users", auth.currentUser.uid), {
                name: values.name,
            });
            setErrorMsg("Profile updated successfully.");
        } catch (error) {
            setErrorMsg("Error updating profile: " + error.message);
        }
    };

    return (
        <div className={styles.container}>
            <h1>Profile</h1>
            <InputControl
                label="Name"
                value={values.name}
                onChange={(event) =>
                    setValues((prev) => ({ ...prev, name: event.target.value }))
                }
            />
            <InputControl
                label="Email"
                value={values.email}
                onChange={() => {}}
                disabled={true}
            />
            {errorMsg && <p className={styles.errorMsg}>{errorMsg}</p>}
            <button onClick={handleUpdate}>Update Profile</button>
            <button onClick={() => navigate('/')}>Back to Home</button>
        </div>
    );
}

export default Profile;
