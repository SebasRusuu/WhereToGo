import React, { useState, useEffect } from 'react';
import './LoginModal.css';
import emailLogo from '../../imgs/logos/mail.png';
import googleLogo from '../../imgs/logos/google.png';
import ponteLogo from '../../imgs/logos/logoponte.png';
import closeIcon from '../../imgs/logos/close.png';
import Login from '../Login';
import Register from '../Register';
import ResetEmail from '../ResetEmail';
import ResetPassword from '../ResetPassword';
import { useLocation } from 'react-router-dom';

function LoginModal({ isOpen, onClose, onLogin }) {
  const [isLoginOpen, setIsLoginOpen] = useState(false);
  const [isRegisterOpen, setIsRegisterOpen] = useState(false);
  const [isResetEmailOpen, setIsResetEmailOpen] = useState(false);
  const [isResetPasswordOpen, setIsResetPasswordOpen] = useState(false);
  const [token, setToken] = useState('');
  const [message, setMessage] = useState('');

  const location = useLocation();

  useEffect(() => {
    const params = new URLSearchParams(location.search);
    const token = params.get('token');
    if (token) {
      verifyToken(token);
    }
  }, [location]);

  const verifyToken = async (token) => {
    try {
      const response = await fetch(`http://localhost:4000/verify-reset-token?token=${token}`);
      if (response.ok) {
        setToken(token);
        setIsResetPasswordOpen(true);
      } else {
        const data = await response.json();
        setMessage(data.error || 'Invalid or expired token.');
        setIsResetPasswordOpen(false);
      }
    } catch (error) {
      setMessage('Error verifying token.');
      setIsResetPasswordOpen(false);
    }
  };

  const handleEmailClick = () => {
    setIsLoginOpen(true);
    onClose();
  };

  const handleRegisterOpen = () => {
    setIsRegisterOpen(true);
    setIsLoginOpen(false);
  };

  const handleResetEmail = () => {
    setIsLoginOpen(false);
    setIsResetEmailOpen(true);
  };

  const handleOpenResetPassword = (token) => {
    setToken(token);
    setIsResetPasswordOpen(true);
    setIsResetEmailOpen(false); // Close the ResetEmail pop-up if open
  };

  const handleCloseResetPassword = () => {
    setIsResetPasswordOpen(false);
    setToken('');
  };

  if (!isOpen && !isLoginOpen && !isRegisterOpen && !isResetEmailOpen && !isResetPasswordOpen) return null;

  return (
    <>
      {isOpen && (
        <div className="login-modal-backdrop" onClick={onClose}>
          <div className="login-modal-content" onClick={e => e.stopPropagation()}>
            <div className="login-modal-header">
              <img src={ponteLogo} alt="Ponte" className="ponte-logo" />
              <h3><b>Entre e explore o melhor com WhereToGo.</b></h3>
            </div>
            <div className='login-modal-container'>
              <button className="login-modal-button">
                <img src={googleLogo} alt="Google" className="google-logo" />
                <span>Continue with Google</span>
              </button>
              <button className="login-modal-button" onClick={handleEmailClick}>
                <img src={emailLogo} alt="Email" className="email-logo" />
                <span>Continue with Email</span>
              </button>
            </div>
            <p className="terms-modal">By proceeding, you agree to our Terms of Use and confirm you have read our Privacy and Cookie Statement</p>
            <button onClick={onClose} className="login-modal-close-button">
              <img src={closeIcon} alt="Close" />
            </button>
          </div>
        </div>
      )}
      {isLoginOpen && <Login isOpen={isLoginOpen} onClose={() => setIsLoginOpen(false)} onRegisterOpen={handleRegisterOpen} onResetEmailOpen={handleResetEmail} onLogin={onLogin} />}
      {isResetEmailOpen && <ResetEmail isOpen={isResetEmailOpen} onClose={() => setIsResetEmailOpen(false)} onOpenResetPassword={handleOpenResetPassword} />}
      {isRegisterOpen && <Register isOpen={isRegisterOpen} onClose={() => setIsRegisterOpen(false)} />}
      {isResetPasswordOpen && <ResetPassword isOpen={isResetPasswordOpen} onClose={handleCloseResetPassword} token={token} />}
      {message && <p className="error-message">{message}</p>}
    </>
  );
}

export default LoginModal;
