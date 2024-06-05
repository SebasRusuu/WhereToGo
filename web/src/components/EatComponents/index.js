import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import './EatComponents.css';
import CardsComponents from '../CardsComponents';
import axios from 'axios';

function EatComponents() {
  const [places, setPlaces] = useState([]);
  const [filteredPlaces, setFilteredPlaces] = useState([]);
  const [foodType, setFoodType] = useState('');
  const [region, setRegion] = useState('');

  useEffect(() => {
    fetchPlaces();
  }, []);

  const fetchPlaces = async () => {
    try {
      const response = await axios.get('http://localhost:4000/places-to-eat');
      setPlaces(response.data.places);
      setFilteredPlaces(response.data.places);
    } catch (error) {
      console.error('Error fetching places:', error);
    }
  };

  const filterResults = async () => {
    try {
      const response = await axios.get('http://localhost:4000/places-to-eat', {
        params: {
          foodType,
          region,
        },
      });
      setFilteredPlaces(response.data.places);
    } catch (error) {
      console.error('Error filtering places:', error);
    }
  };

  return (
    <>
      <motion.div className="feature-card" initial="hidden" animate="visible">
        <motion.div className="text-container" initial="hidden" animate="visible">
          <p className="sloganeat-p">Para cada fome, um destino delicioso</p>
        </motion.div>
      </motion.div>

      <div className="search-bar">
        <select id="foodType" value={foodType} onChange={(e) => setFoodType(e.target.value)}>
          <option value="">Tipo de Cozinha</option>
          <option value="portuguesa">Portuguesa</option>
          <option value="italiana">Italiana</option>
          <option value="mexicana">Mexicana</option>
          <option value="japonesa">Japonesa</option>
          <option value="marisqueira">Marisqueira</option>
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
    </>
  );
}

export default EatComponents;