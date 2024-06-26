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
        lastname: "",
        email: "",
        phone: "",
        company: "",
        position: "",
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
                lastname: values.lastname,
                phone: values.phone,
                company: values.company,
                position: values.position

                // Note: Do not store passwords in plaintext or directly update via client side in a real app.
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
                label="Last Name"
                value={values.lastname}
                onChange={(event) =>
                    setValues((prev) => ({ ...prev, lastname: event.target.value }))
                }
            />
            <InputControl
                label="Email"
                value={values.email}
                onChange={() => {}}
                disabled={true}
            />
            <InputControl
                label="Phone"
                value={values.phone}
                onChange={(event) =>
                    setValues((prev) => ({ ...prev, phone: event.target.value }))
                }
            />
            <InputControl
                label="Company"
                value={values.company}
                onChange={(event) =>
                    setValues((prev) => ({ ...prev, company: event.target.value }))
                }
            />
            <InputControl
                label="Position"
                value={values.position}
                onChange={(event) =>
                    setValues((prev) => ({ ...prev, position: event.target.value }))
                }
            />
            {errorMsg && <p className={styles.errorMsg}>{errorMsg}</p>}
            <button onClick={handleUpdate}>Update Profile</button>
            <button onClick={() => navigate('/')}>Back to Home</button>
        </div>
    );
}

export default Profile;
