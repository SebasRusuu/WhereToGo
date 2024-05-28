import React, { useState } from 'react';
import closeIcon from '../../imgs/logos/close.png';
import ponteLogo from '../../imgs/logos/logoponte.png';
import backIcon from '../../imgs/logos/back.png';  // Adicione um ícone de back
import './ResetEmail.css';

function ResetEmail({ isOpen, onClose, onOpenResetPassword }) {
  const [email, setEmail] = useState('');
  const [message, setMessage] = useState('');

  const handleBack = () => {
    onClose();
  };

  const handleSubmit = async (event) => {
    event.preventDefault();
    try {
      const response = await fetch('http://localhost:4000/forgot-password', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ email }),
      });

      if (response.ok) {
        const data = await response.json();
        setMessage('Um link de redefinição de senha foi enviado para o seu email.');
        onOpenResetPassword(data.token); // Pass the token to open the ResetPassword pop-up
      } else {
        setMessage('Erro ao enviar o email de redefinição de senha.');
      }
    } catch (error) {
      setMessage('Erro ao enviar o email de redefinição de senha.');
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
          <h3><b>Insere o e-mail que deseja mudar a password</b></h3>
        </div>

        <form className="email-form" onSubmit={handleSubmit}>
          <div className='container-email'>
            <label htmlFor="email">Endereço de email</label>
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
