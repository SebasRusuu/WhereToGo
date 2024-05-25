import React, { useState } from 'react';
import './LoginModal.css';
import emailLogo from '../../imgs/logos/mail.png';
import googleLogo from '../../imgs/logos/google.png';
import ponteLogo from '../../imgs/logos/logoponte.png';
import closeIcon from '../../imgs/logos/close.png';
import Login from '../Login';
import Register from '../Register'; 
import ResetPassword from '../ResetPassword';
import ResetEmail from '../ResetEmail';

function LoginModal({ isOpen, onClose }) {
  const [isLoginOpen, setIsLoginOpen] = useState(false);
  const [isRegisterOpen, setIsRegisterOpen] = useState(false);
  const [isResetEmailOpen, setIsResetEmailOpen] = useState(false);

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

  if (!isOpen && !isLoginOpen && !isRegisterOpen && !isResetEmailOpen) return null;

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
      {isLoginOpen && <Login isOpen={isLoginOpen} onClose={() => setIsLoginOpen(false)} onRegisterOpen={handleRegisterOpen} onResetEmailOpen={handleResetEmail} />}
      {isResetEmailOpen && <ResetEmail isOpen={isResetEmailOpen} onClose={() => setIsResetEmailOpen(false)} />}
      {isRegisterOpen && <Register isOpen={isRegisterOpen} onClose={() => setIsRegisterOpen(false)} />}
    </>
  );
}

export default LoginModal;
