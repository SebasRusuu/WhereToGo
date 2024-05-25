import React, { useState } from 'react';
import './Register.css';

function Register({ isOpen, onClose }) {
    const [errorMessage, setErrorMessage] = useState('');
    const [passwordWrong, setPasswordWrong] = useState(false);
    const verifyPassword = (event) => {
        const password = document.getElementById('password').value;
        const confirmPassword = document.getElementById('confirmPassword').value;
        if (password !== confirmPassword) {
            setErrorMessage('As Palavras-passes não coincidem!');
            setPasswordWrong(true);
            event.preventDefault(); // Não permite que o formulário seja enviado
        } else {
            setPasswordWrong(false);
            setErrorMessage('');
        }
    };

    
    if (!isOpen) return null;

    return (
        <div className="register-backdrop" onClick={onClose}>
            <div className="register-container" onClick={e => e.stopPropagation()}>
                <h1>Junta-te a nós!</h1>
                <form className="register-form" onSubmit={verifyPassword}>
                    <label htmlFor="firstName">Primeiro Nome</label>
                    <input type="text" id="firstName" name="firstName" placeholder="Primeiro Nome" required />
                    <label htmlFor="lastName">Último Nome</label>
                    <input type="text" id="lastName" name="lastName" placeholder="Último Nome" required />
                    <label htmlFor="email">Endereço de email</label>
                    <input type="email" id="email" name="email" placeholder="Endereço de email" required />
                    <label htmlFor="password">Palavra-passe</label>
                    <input type="password" id="password" name="password" placeholder="Palavra-passe" required />
                    <label htmlFor="confirmPassword">Confirmar Palavra-passe</label>
                    <input type="password" id="confirmPassword" name="confirmPassword" placeholder="Confirmar Palavra-passe" required className={passwordWrong ? 'wrong' : ''} />
                    {errorMessage && <p className="error-message">{errorMessage}</p>}
                    <button type="submit" className="register-button">Registe-se</button>
                </form>
            </div>
        </div>
    );
}

export default Register;
