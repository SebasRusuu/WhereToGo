import React, { useState } from 'react';
import './Register.css';
import backIcon from '../../imgs/logos/back.png';
import ponteLogo from '../../imgs/logos/logoponte.png';
import axios from '../../api/axios';

function Register({ isOpen, onClose, onLoginOpen }) {
  const [firstName, setFirstName] = useState('');
  const [lastName, setLastName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [errorMessage, setErrorMessage] = useState('');
  const [passwordWrong, setPasswordWrong] = useState(false);

  const handleBack = () => {
    onClose();
  };

  const checkEmailExists = async (email) => {
    try {
      const response = await axios.post('/check-email', { email });
      return response.data.exists;
    } catch (error) {
      console.error('Erro ao verificar e-mail:', error);
      return false;
    }
  };

  const handleSubmit = async (event) => {
    event.preventDefault();
  
    if (!firstName || !lastName || !email || !password || !confirmPassword) {
      setErrorMessage("Todos os campos são obrigatórios!");
      return;
    }

    const emailExists = await checkEmailExists(email);
    if (emailExists) {
      setErrorMessage("O e-mail já está registrado!");
      return;
    }
  
    if (password !== confirmPassword) {
      setErrorMessage("Passwords do not match!");
      setPasswordWrong(true);
      return;
    }
  
    setPasswordWrong(false);
    setErrorMessage('');

    try {
      const response = await axios.post('/register', {
        firstName,
        lastName,
        email,
        password
      });
  
      if (response.status === 201) {
        onClose();
        onLoginOpen(); // Open the login modal after successful registration
      } else {
        setErrorMessage(`Registration failed: ${response.data.error}`);
      }
    } catch (error) {
      setErrorMessage(`Registration failed: ${error.message}`);
    }
  };

  if (!isOpen) return null;

  return (
    <div className="register-backdrop" onClick={onClose}>
      <div className="register-container" onClick={e => e.stopPropagation()}>
        <button onClick={handleBack} className="back-button">
          <img src={backIcon} alt="Back" />
        </button>
        <div className="register-header">
          <img src={ponteLogo} alt="Ponte" className="ponte-logo" />
          <h1>Junta-te a nós!</h1>
        </div>
        <form className="register-form" onSubmit={handleSubmit}>
          <label htmlFor="firstName">Primeiro Nome</label>
          <input
            type="text"
            id="firstName"
            name="firstName"
            value={firstName}
            onChange={e => setFirstName(e.target.value)}
            placeholder="Primeiro Nome"
            required
          />
          <label htmlFor="lastName">Último Nome</label>
          <input
            type="text"
            id="lastName"
            name="lastName"
            value={lastName}
            onChange={e => setLastName(e.target.value)}
            placeholder="Último Nome"
            required
          />
          <label htmlFor="email">Endereço de email</label>
          <input
            type="email"
            id="email"
            name="email"
            value={email}
            onChange={e => setEmail(e.target.value)}
            placeholder="Endereço de email"
            required
          />
          <label htmlFor="password">Palavra-passe</label>
          <input
            type="password"
            id="password"
            name="password"
            value={password}
            onChange={e => setPassword(e.target.value)}
            placeholder="Palavra-passe"
            required
          />
          <label htmlFor="confirmPassword">Confirmar Palavra-passe</label>
          <input
            type="password"
            id="confirmPassword"
            name="confirmPassword"
            value={confirmPassword}
            onChange={e => setConfirmPassword(e.target.value)}
            placeholder="Confirmar Palavra-passe"
            required
            className={passwordWrong ? 'wrong' : ''}
          />
          {errorMessage && <p className="error-message">{errorMessage}</p>}
          <div className="button-container">
            <button type="submit" className="register-button">Registe-se</button>
          </div>
        </form>
      </div>
    </div>
  );
}

export default Register;
