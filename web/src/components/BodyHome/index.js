import React, { useState, useContext } from 'react';
import { motion } from 'framer-motion';
import "./BodyHome.css";
import bridgeImage from '../../imgs/imagens/ponte_azul.png';
import Cards from '../CardsComponents';
import useInView from '../../hooks/useInView';
import RoteiroForms from '../RoteiroForms';
import AuthContext from '../../context/AuthProvider';

function BodyHome() {
  const { auth } = useContext(AuthContext);
  const [isRoteiroFormOpen, setIsRoteiroFormOpen] = useState(false);
  const [cardRef, cardInView] = useInView({ threshold: 0.5 });
  const [textRef, textInView] = useInView({ threshold: 0.5 });
  const [imageRef, imageInView] = useInView({ threshold: 0.5 });
  const [recommendedRef, recommendedInView] = useInView({ threshold: 0.5 });

  const handleOpenForm = () => {
    setIsRoteiroFormOpen(true);
  };

  const handleCloseForm = () => {
    setIsRoteiroFormOpen(false);
  };

  const textContainerVariants = {
    hidden: { x: '-30vw', opacity: 0 },
    visible: {
      x: 0,
      opacity: 1,
      transition: { duration: 1, delay: 0.2, type: 'spring', stiffness: 100 }
    }
  };

  const imageVariants = {
    hidden: { x: '55vw', opacity: 0 },
    visible: {
      x: 0,
      opacity: 1,
      transition: { duration: 1, delay: 0.2, type: 'spring', stiffness: 70 }
    }
  };

  const recommendedVariants = {
    hidden: { x: '-30vw', opacity: 0 },
    visible: {
      x: 0,
      opacity: 1,
      transition: { duration: 1, delay: 0.4, type: 'spring', stiffness: 100 }
    }
  };

  const cardVariants = {
    hidden: { scale: 0, opacity: 0 },
    visible: {
      scale: 1,
      opacity: 1,
      transition: { duration: 1, delay: 0.2, type: 'spring', stiffness: 100 }
    }
  };

  return (
    <>
      <motion.div className="feature-card" ref={cardRef} variants={cardVariants} initial="hidden" animate={cardInView ? "visible" : "hidden"}>
        <motion.div className="text-container" ref={textRef} variants={textContainerVariants} initial="hidden" animate={textInView ? "visible" : "hidden"}>
          <h2 className='logo-txt'>Where To Go?</h2>
          <p className="slogan-p">Cria o teu roteiro em minutos!</p>
          <motion.button className="new-roteiro" onClick={handleOpenForm}>
            <span style={{ position: 'relative', zIndex: 1 }}>Novo Roteiro</span>
          </motion.button>
        </motion.div>
        <motion.img src={bridgeImage} alt="Ponte" ref={imageRef} className="feature-image" variants={imageVariants} initial="hidden" animate={imageInView ? "visible" : "hidden"} />
      </motion.div>
      <motion.div className="recommended-container" ref={recommendedRef} variants={recommendedVariants} initial="hidden" animate={recommendedInView ? "visible" : "hidden"}>
        <h2 className='title-recommended'>Os locais mais visitados, pelos os nossos exploradores</h2>
      </motion.div>
      <Cards>Recomendados</Cards>
      <Cards></Cards>
      {isRoteiroFormOpen && <RoteiroForms onClose={handleCloseForm} userId={auth.user?.id} />}
    </>
  );
}

export default BodyHome;
