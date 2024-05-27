import React from 'react';
import closeIcon from '../../imgs/logos/close.png';
import ponteLogo from '../../imgs/logos/logoponte.png';
import backIcon from '../../imgs/logos/back.png';  // Adicione um ícone de back
import './ResetEmail.css';

function ResetEmail({ isOpen, onClose }) {

  const handleBack = () => {
    onClose();
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
          <h3><b>Insere o e-mail que deseja mudar a password</b></h3>
        </div>

        <form className="email-form">
          <div className='container-email'>
            <label htmlFor="email">Endereço de email</label>
            <input className="txt" type="email" id="email" name="email" placeholder="Email" required />
          </div>
          <div className="button-container">
            <button className="but-reset" type="submit">next</button>
          </div>
        </form>
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
