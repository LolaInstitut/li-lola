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
        if (!values.name || !values.lastname) {
            setErrorMsg("Name and Last Name fields cannot be empty.");
            return;
        }
        setErrorMsg('');
        try {
            await updateProfile(auth.currentUser, { displayName: `${values.name} ${values.lastname}` });
            await updateDoc(doc(db, "users", auth.currentUser.uid), {
                name: values.name,
                lastname: values.lastname,
                phone: values.phone,
                company: values.company,
                position: values.position
            });
            navigate('/');  // Preusmeri na Home stranicu nakon uspešnog ažuriranja
        } catch (error) {
            setErrorMsg("Error updating profile: " + error.message);
        }
    };

    return (
        <div className={styles.container}>
            <h1>Profile</h1>
            <div className={styles.formContainer}>
                <div className={styles.inputControl}>
                    <label>Name</label>
                    <InputControl
                        value={values.name}
                        onChange={(event) =>
                            setValues((prev) => ({ ...prev, name: event.target.value }))
                        }
                    />
                </div>
                <div className={styles.inputControl}>
                    <label>Last Name</label>
                    <InputControl
                        value={values.lastname}
                        onChange={(event) =>
                            setValues((prev) => ({ ...prev, lastname: event.target.value }))
                        }
                    />
                </div>
                <div className={styles.inputControl}>
                    <label>Email</label>
                    <InputControl
                        value={values.email}
                        onChange={() => {}}
                        disabled={true}
                    />
                </div>
                <div className={styles.inputControl}>
                    <label>Phone</label>
                    <InputControl
                        value={values.phone}
                        onChange={(event) =>
                            setValues((prev) => ({ ...prev, phone: event.target.value }))
                        }
                    />
                </div>
                <div className={styles.inputControl}>
                    <label>Company</label>
                    <InputControl
                        value={values.company}
                        onChange={(event) =>
                            setValues((prev) => ({ ...prev, company: event.target.value }))
                        }
                    />
                </div>
                <div className={styles.inputControl}>
                    <label>Position</label>
                    <InputControl
                        value={values.position}
                        onChange={(event) =>
                            setValues((prev) => ({ ...prev, position: event.target.value }))
                        }
                    />
                </div>
                {errorMsg && <p className={styles.errorMsg}>{errorMsg}</p>}
                <button onClick={handleUpdate}>Update Profile</button>
                <button onClick={() => navigate('/')}>Back to Home</button>
            </div>
        </div>
    );
}

export default Profile;
