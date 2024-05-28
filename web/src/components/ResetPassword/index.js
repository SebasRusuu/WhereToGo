import React, { useState } from 'react';
import closeIcon from '../../imgs/logos/close.png';
import ponteLogo from '../../imgs/logos/logoponte.png';
import './Reset.css';

function ResetPassword({ isOpen, onClose, token }) {
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [message, setMessage] = useState('');

  const handleSubmit = async (event) => {
    event.preventDefault();
    if (newPassword !== confirmPassword) {
      setMessage('Passwords do not match');
      return;
    }

    try {
      const response = await fetch('http://localhost:4000/reset-password', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ token, newPassword }),
      });

      if (response.ok) {
        setMessage('Password reset successful!');
      } else {
        setMessage('Error resetting password.');
      }
    } catch (error) {
      setMessage('Error resetting password.');
    }
  };

  if (!isOpen) return null;
  return (
    <div className="reset-password-container" onClick={onClose}>
      <div className="password-container" onClick={e => e.stopPropagation()}>
        <button onClick={onClose} className="reset-close-button">
          <img src={closeIcon} alt="Close" />
        </button>
        <div className="password-header">
          <img src={ponteLogo} alt="Ponte" className="ponte-logo" />
          <h3><b>Redefinir a sua palavra-passe</b></h3>
        </div>

        <form className="password-form" onSubmit={handleSubmit}>
          <div className='container-password'>
            <label htmlFor="newPassword">Nova Palavra-passe</label>
            <input
              className="txt"
              type="password"
              id="newPassword"
              name="newPassword"
              placeholder="Nova Palavra-passe"
              value={newPassword}
              onChange={(e) => setNewPassword(e.target.value)}
              required
            />
          </div>
          <div className='container-password'>
            <label htmlFor="confirmPassword">Confirmar Palavra-passe</label>
            <input
              className="txt"
              type="password"
              id="confirmPassword"
              name="confirmPassword"
              placeholder="Confirmar Palavra-passe"
              value={confirmPassword}
              onChange={(e) => setConfirmPassword(e.target.value)}
              required
            />
          </div>
          <div className="button-container">
            <button className="but-reset" type="submit">Redefinir</button>
          </div>
        </form>
        {message && <p>{message}</p>}
        <div className="reset-terms">
          <p>By proceeding, you agree to our Terms of Use and confirm you have read our Privacy and Cookie Statement</p>
          <p>This site is protected by reCAPTCHA and the Google Privacy Policy and Terms of Service apply.</p>
        </div>
      </div>
    </div>
  );
}

export default ResetPassword;
