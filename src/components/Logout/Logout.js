import React, { useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { signOut } from 'firebase/auth';
import { auth } from '../../firebaseConfig';

function Logout() {
  const navigate = useNavigate();

  useEffect(() => {
    signOut(auth)
      .then(() => {
        navigate("/", { replace: true }); // Ensuring redirect resets the navigation stack
      })
      .catch((error) => {
        console.error('Logout failed:', error);
      });
  }, [navigate]);

  return <div>Logging out...</div>;
}

export default Logout;