import React from 'react'
import '../App.css'
import CardsComponents from '../components/CardsComponents';
import CustomCard from '../components/CustomCard';
import { motion } from 'framer-motion';


function Places() {
  const textContainerVariants = {
    hidden: { x: '-50vw', opacity: 0 },
    visible: {
      x: 0,
      opacity: 1,
      transition: { duration: 0.5, type: 'spring', stiffness: 120 }
    },
  };

  // Variantes para a animação da imagem
  // const imageVariants = {
  //   hidden: { x: '50vw', opacity: 0 },
  //   visible: {
  //     x: 0,
  //     opacity: 1,
  //     transition: { duration: 0.5, type: 'spring', stiffness: 120 }
  //   },
  // };

  // Variante para a animação do card
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

      <div class="search-bar">
        <select id="foodType" onchange="filterResults()">
          <option value="">Tipo de Local</option>
          <option value="portuguesa">Museus</option>
          <option value="italiana">Monumentos</option>
          <option value="mexicana">Praias</option>
        </select>
        <select id="region" onchange="filterResults()">
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
        <button onclick="filterResults()">Pesquisar</button>
      </div>

      <CardsComponents>Museus</CardsComponents>
      <CardsComponents>Monumentos</CardsComponents>
      <CardsComponents>Praias</CardsComponents>

      <CustomCard />
      
      
    </>
  );
}

export default Places
