import React from 'react';
import { motion } from 'framer-motion';
import '../../App.css';
import './BodyContactos.css';
import bridgeImage from '../../imgs/imagens/ponte_azul.png';

function BodyContactos() {

    const imageVariants = {
        hidden: { x: '50vw', opacity: 0 },
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
        <motion.div className="feature-card-contact" variants={cardVariants} initial="hidden" animate="visible">
            <div className="feature-text-container">
                <h2 className="feature-title">WhereToGo</h2>
                <p className="feature-email">Emails: </p>
                <p className="feature-email">20220907@iade.pt</p>
                <p className="feature-email">20220905@iade.pt</p>
                <p className="feature-email">20220837@iade.pt</p>
            </div>
            <motion.img src={bridgeImage} alt="Ponte" className="feature-image-contact" variants={imageVariants} initial="hidden" animate="visible" />
        </motion.div>
    );
}

export default BodyContactos;
