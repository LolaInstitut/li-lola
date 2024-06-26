import React, { useState } from 'react';
import { sendPasswordResetEmail } from 'firebase/auth';
import { auth } from '../../firebaseConfig';
import InputControl from '../InputControl/InputControl';
import styles from './ResetPassword.module.css';

function ResetPassword() {
  const [email, setEmail] = useState('');
  const [message, setMessage] = useState('');

  const handleResetPassword = () => {
    sendPasswordResetEmail(auth, email)
      .then(() => {
        setMessage("Password reset email sent!");
      })
      .catch((err) => {
        setMessage(err.message);
      });
  };

  return (
    <div className={styles.container}>
      <div className={styles.innerBox}>
        <h1 className={styles.heading}>Reset Your Password</h1>
        <InputControl
          label="Email"
          placeholder="Enter your email address..."
          onChange={(event) => setEmail(event.target.value)}
        />
        <button onClick={handleResetPassword}>Send Reset Email</button>
        {message && <p>{message}</p>}
      </div>
    </div>
  );
}

export default ResetPassword;
