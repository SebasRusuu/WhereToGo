import React, { useEffect, useState } from 'react';
import { motion } from 'framer-motion';
import axios from 'axios';
import './roteiro.css';
import RoteiroView from '../RoteiroView'; // Importa RoteiroView do diretório correto

function RotePrincipal() {
  const [roteiros, setRoteiros] = useState([]);
  const [selectedRoteiro, setSelectedRoteiro] = useState(null);

  useEffect(() => {
    const fetchRoteiros = async () => {
      try {
        const response = await axios.get('https://wheretogo-4kxz.onrender.com/roteiros', {
          headers: { Authorization: `Bearer ${localStorage.getItem('token')}` }
        });
        setRoteiros(response.data);
      } catch (error) {
        console.error('Error fetching roteiros:', error);
      }
    };

    fetchRoteiros();
  }, []);

  const handleRoteiroClick = async (roteiroId) => {
    try {
      const response = await axios.get(`https://wheretogo-4kxz.onrender.com/roteiros/${roteiroId}`, {
        headers: { Authorization: `Bearer ${localStorage.getItem('token')}` }
      });
      setSelectedRoteiro(response.data);
    } catch (error) {
      console.error('Error fetching roteiro details:', error);
    }
  };

  const textContainerVariants = {
    hidden: { x: '-50vw', opacity: 0 },
    visible: {
      x: 0,
      opacity: 1,
      transition: { duration: 0.5, type: 'spring', stiffness: 120 }
    },
  };

  const cardVariants = {
    hidden: { scale: 0 },
    visible: {
      scale: 1,
      transition: { delay: 0.2, duration: 0.5, type: 'spring', stiffness: 120 }
    },
  };

  return (
    <div>
      <motion.div className="feature-card" variants={cardVariants} initial="hidden" animate="visible">
        <motion.div className="text-container" variants={textContainerVariants} initial="hidden" animate="visible">
          <p className="sloganeat-p">Os teus roteiros guardados</p>
        </motion.div>
      </motion.div>

      <motion.div className="about-us-container" initial="hidden" animate="visible">
      </motion.div>

      <div className="roteiros-container">
        {roteiros.map((roteiro, index) => (
          <div key={index} className="item" onClick={() => handleRoteiroClick(roteiro.rot_id)}>
            <h3>{roteiro.rot_name}</h3>
            <p>{roteiro.loc_names.join(', ')}</p>
          </div>
        ))}
      </div>

      {selectedRoteiro && (
        <RoteiroView formData={selectedRoteiro} onClose={() => setSelectedRoteiro(null)} />
      )}
    </div>
  );
}

export default RotePrincipal;
