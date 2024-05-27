import React, { useState } from 'react';
import './Register.css';
import backIcon from '../../imgs/logos/back.png';  // Adicione um ícone de back

function Register({ isOpen, onClose }) {
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

  const handleSubmit = async (event) => {
    event.preventDefault();
  
    // Verificação dos campos vazios
    if (!firstName || !lastName || !email || !password || !confirmPassword) {
      setErrorMessage("Todos os campos são obrigatórios!");
      return;
    }
  
    // Verificação se as senhas coincidem
    if (password !== confirmPassword) {
      setErrorMessage("Passwords do not match!");
      setPasswordWrong(true);
      return;
    }
  
    setPasswordWrong(false);
    setErrorMessage('');
  
    try {
      const response = await fetch("http://localhost:4000/register", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          firstName,
          lastName,
          email,
          password
        }),
      });
  
      if (response.ok) {
        alert("Registration successful!");
        onClose();
      } else {
        const errorData = await response.json();
        setErrorMessage(`Registration failed: ${errorData.error}`);
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
        <h1>Junta-te a nós!</h1>
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
          <button type="submit" className="register-button">Registe-se</button>
        </form>
      </div>
    </div>
  );
}

export default Register;
