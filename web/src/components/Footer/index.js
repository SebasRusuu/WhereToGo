import React from 'react'
import '../../App.css';
import { Link } from 'react-router-dom';

function Footer() {
  return (
    <footer className='footer'>
      <p className='txt-footer'> © 2024 WhereToGo Todos os direitos reservados. </p>
      <Link to="/Contactos" className="footer-link">Contacte-nos</Link>
    </footer>
  )
}

export default Footer
