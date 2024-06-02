// src/components/Header.js

import React, { useState, useEffect, useContext } from 'react';
import '../../App.css';
import logoImage from '../../imgs/logos/logoponte.png';
import { motion } from 'framer-motion';
import { Link } from 'react-router-dom';
import LoginModal from '../LoginModal';
import AuthContext from '../../context/AuthProvider';

function Header() {
  const { auth, setAuth } = useContext(AuthContext);
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [isLoginModalOpen, setIsLoginModalOpen] = useState(false);

  useEffect(() => {
    const token = localStorage.getItem('token');
    const userId = localStorage.getItem('userId');
    if (token && userId) {
      setAuth({ token, user: { id: userId } });
    }
  }, [setAuth]);

  const toggleMenu = () => {
    setIsMenuOpen(isMenuOpen => !isMenuOpen);
  };

  const handleLogin = () => {
    setIsLoginModalOpen(false);
  };

  const handleLogout = () => {
    setAuth({});
    localStorage.removeItem('token');
    localStorage.removeItem('userId');
    window.location.href = '/';
  };

  const navMotions = {
    hover: {
      scale: 1.1,
      transition: {
        type: 'spring',
        stiffness: 300,
        damping: 10
      }
    }
  };

  return (
    <header className="header">
      <div className="branding">
        <Link to='/'><img src={logoImage} className='logoImg' alt="Logo" /></Link>
        <Link to='/'><div className="logo">WhereToGo</div></Link>
      </div>
      <div className="hamburger-menu" onClick={toggleMenu}>
        <div></div>
        <div></div>
        <div></div>
      </div>
      <nav className={`navigation ${isMenuOpen ? 'active' : ''}`}>
        <Link to="/places" className="nav-link" onClick={() => setIsMenuOpen(false)}>
          <motion.div className="nav-content" variants={navMotions} whileHover="hover">Locais</motion.div>
        </Link>
        <Link to="/reviews" className="nav-link">
          <motion.div className="nav-content" variants={navMotions} whileHover="hover">Avaliações</motion.div>
        </Link>
        <Link to="/roteiro" className="nav-link">
          <motion.div className="nav-content" variants={navMotions} whileHover="hover">Roteiro</motion.div>
        </Link>
        <Link to="/wheretoeat" className="nav-link">
          <motion.div className="nav-content" variants={navMotions} whileHover="hover">WhereToEat</motion.div>
        </Link>
        <div className="login-button-container">
          {auth?.user ? (
            <motion.button className="login-button" onClick={handleLogout}>
              Logout
            </motion.button>
          ) : (
            <motion.button className="login-button" onClick={() => setIsLoginModalOpen(true)}>
              Iniciar Sessão
            </motion.button>
          )}
        </div>
        <LoginModal isOpen={isLoginModalOpen} onClose={() => setIsLoginModalOpen(false)} onLogin={handleLogin} />
      </nav>
    </header>
  );
}

export default Header;
