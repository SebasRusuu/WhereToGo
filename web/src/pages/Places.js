import React, { useState, useEffect } from 'react';
import '../App.css';
import CardsComponents from '../components/CardsComponents';
import CustomCard from '../components/CustomCard';
import { motion } from 'framer-motion';
import axios from 'axios';

function Places() {
  const [places, setPlaces] = useState([]);
  const [filteredPlaces, setFilteredPlaces] = useState([]);
  const [placeType, setPlaceType] = useState('');
  const [region, setRegion] = useState('');

  useEffect(() => {
    fetchPlaces();
  }, []);

  const fetchPlaces = async () => {
    try {
      const response = await axios.get('http://localhost:4000/places-to-visit');
      setPlaces(response.data.places);
      setFilteredPlaces(response.data.places);
    } catch (error) {
      console.error('Error fetching places:', error);
    }
  };

  const filterResults = async () => {
    try {
      const response = await axios.get('http://localhost:4000/places-to-visit', {
        params: {
          placeType,
          region,
        },
      });
      setFilteredPlaces(response.data.places);
    } catch (error) {
      console.error('Error filtering places:', error);
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
    <>
      <motion.div className="feature-card" variants={cardVariants} initial="hidden" animate="visible">
        <motion.div className="text-container" variants={textContainerVariants} initial="hidden" animate="visible">
          <p className="sloganloc-p">Explore mais connosco</p>
        </motion.div>
      </motion.div>

      <motion.div className="about-us-container" initial="hidden" animate="visible">
        {/* Sobre nós  */}
      </motion.div>

      <div className="search-bar">
        <select id="placeType" value={placeType} onChange={(e) => setPlaceType(e.target.value)}>
          <option value="">Tipo de Local</option>
          <option value="museus">Museus</option>
          <option value="monumentos">Monumentos</option>
          <option value="miradouro">Miradouros</option>
          <option value="praias">Praias</option>
          <option value="parques">Parques</option>
          <option value="parqueDiversao">Parques de Diversão</option>
          <option value="palacio">Palácios</option>
          <option value="rooftop">Rooftops</option>
        </select>
        <select id="region" value={region} onChange={(e) => setRegion(e.target.value)}>
          <option value="">Região</option>
          <option value="aveiro">Aveiro</option>
          <option value="beja">Beja</option>
          <option value="braga">Braga</option>
          <option value="braganca">Bragança</option>
          <option value="castelo_branco">Castelo Branco</option>
          <option value="coimbra">Coimbra</option>
          <option value="evora">Évora</option>
          <option value="faro">Faro</option>
          <option value="guarda">Guarda</option>
          <option value="leiria">Leiria</option>
          <option value="lisboa">Lisboa</option>
          <option value="portalegre">Portalegre</option>
          <option value="porto">Porto</option>
          <option value="santarem">Santarém</option>
          <option value="setubal">Setúbal</option>
          <option value="viana_do_castelo">Viana do Castelo</option>
          <option value="vila_real">Vila Real</option>
          <option value="viseu">Viseu</option>
          <option value="madeira">Madeira</option>
          <option value="acores">Açores</option>
        </select>
        <button onClick={filterResults}>Pesquisar</button>
      </div>

      <div className="container">
        <div className="row">
          {filteredPlaces.map((place, index) => (
            <CardsComponents key={index} place={place} />
          ))}
        </div>
      </div>

      <CustomCard />
    </>
  );
}

export default Places;