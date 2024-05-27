import React, { useState, useEffect } from 'react';
import '../../App.css';
import logoImage from '../../imgs/logos/logoponte.png';
import { motion } from 'framer-motion';
import { Link } from 'react-router-dom';
import LoginModal from '../LoginModal';

function Header() {
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [isLoginModalOpen, setIsLoginModalOpen] = useState(false);
  const [isAuthenticated, setIsAuthenticated] = useState(false);

  useEffect(() => {
    // Verificar se o usuário está autenticado ao carregar o componente
    const loggedIn = localStorage.getItem('isAuthenticated');
    if (loggedIn) {
      setIsAuthenticated(true);
    }
  }, []);

  const toggleMenu = () => {
    setIsMenuOpen(isMenuOpen => !isMenuOpen);
  };

  const handleLogin = () => {
    setIsAuthenticated(true);
    localStorage.setItem('isAuthenticated', 'true');
    setIsLoginModalOpen(false);
  };

  const handleLogout = () => {
    setIsAuthenticated(false);
    localStorage.removeItem('isAuthenticated');
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
          {isAuthenticated ? (
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
