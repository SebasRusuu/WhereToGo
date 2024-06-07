import React, { useState } from 'react';
import closeIcon from '../../imgs/logos/close.png';
import ponteLogo from '../../imgs/logos/logoponte.png';
import backIcon from '../../imgs/logos/back.png';  
import './ResetEmail.css';

function ResetEmail({ isOpen, onClose }) {
  const [email, setEmail] = useState('');
  const [message, setMessage] = useState('');

  const handleBack = () => {
    onClose();
  };

  const handleSubmit = async (event) => {
    event.preventDefault();
    try {
      const response = await fetch('https://wheretogo-4kxz.onrender.com/forgot-password', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ email }),
      });

      if (response.ok) {
        setMessage('A password reset link has been sent to your email.');
      } else {
        const errorData = await response.json();
        setMessage(errorData.error || 'Error sending password reset email.');
      }
    } catch (error) {
      setMessage('Error sending password reset email.');
    }
  };

  if (!isOpen) return null;
  return (
    <div className="reset-email-container" onClick={onClose}>
      <div className="email-container" onClick={e => e.stopPropagation()}>
        <button onClick={handleBack} className="back-button">
          <img src={backIcon} alt="Back" />
        </button>
        <div className="email-header">
          <img src={ponteLogo} alt="Ponte" className="ponte-logo" />
          <h3><b>Enter the email to reset the password</b></h3>
        </div>

        <form className="email-form" onSubmit={handleSubmit}>
          <div className='container-email'>
            <label htmlFor="email">Email Address</label>
            <input
              className="txt"
              type="email"
              id="email"
              name="email"
              placeholder="Email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
            />
          </div>
          <div className="button-container">
            <button className="but-reset" type="submit">Next</button>
          </div>
        </form>
        {message && <p>{message}</p>}
        <button onClick={onClose} className="reset-close-button">
          <img src={closeIcon} alt="Close" />
        </button>
        <div className="reset-terms">
          <p>By proceeding, you agree to our Terms of Use and confirm you have read our Privacy and Cookie Statement</p>
          <p>This site is protected by reCAPTCHA and the Google Privacy Policy and Terms of Service apply.</p>
        </div>
      </div>
    </div>
  );
}

export default ResetEmail;
