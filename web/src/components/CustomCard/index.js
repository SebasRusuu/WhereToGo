import React, { useState, useContext } from 'react';
import { motion } from 'framer-motion';
import './CustomCard.css';
import RoteiroForms from '../RoteiroForms';
import AuthContext from '../../context/AuthProvider';
import LoginModal from '../LoginModal';





function CustomCard()  {
    const { auth } = useContext(AuthContext);
    const [isRoteiroFormOpen, setIsRoteiroFormOpen] = useState(false);
    const [isLoginModalOpen, setIsLoginModalOpen] = useState(false);

    const handleOpenForm = () => {
        if (auth?.user) {
          setIsRoteiroFormOpen(true);
        } else {
          setIsLoginModalOpen(true);
        }
      };

    const handleCloseForm = () => {
    setIsRoteiroFormOpen(false);
    };

    const handleLogin = () => {
    setIsLoginModalOpen(false);
    };

    return (
        <>
        <div className="d-flex justify-content-center align-items-center mt-5 mb-5">
            <div className="card custom-card p-4">
                <div className="card-body d-flex justify-content-between p-3">
                    <div className="text-section">
                        <h5 className="custom-card-title">Está com dúvidas de onde ir?</h5>
                    </div>
                    <div className="action-section">
                        <p className="custom-card-text">Usa a nossa função de criar roteiro</p>
                        <motion.button className="new-roteiro" onClick={handleOpenForm}>
                            <span style={{ position: 'relative', zIndex: 1 }}>Novo Roteiro</span>
                        </motion.button>
                    </div>
                </div>
            </div>
        </div>
        {isRoteiroFormOpen && <RoteiroForms onClose={handleCloseForm} userId={auth.user?.id} />}
        <LoginModal isOpen={isLoginModalOpen} onClose={() => setIsLoginModalOpen(false)} onLogin={handleLogin} />
        </>
    );
}

export default CustomCard;