import React from 'react';
import './CustomCard.css'; // Assegure-se de que este arquivo está correto e no local adequado.

const CustomCard = () => {
    return (
        <div className="d-flex justify-content-center align-items-center mt-5 mb-5"> {/* Adiciona margem vertical externa */}
            <div className="card custom-card p-4"> {/* Adiciona padding geral ao cartão */}
                <div className="card-body d-flex justify-content-between p-3"> {/* Adiciona mais padding interno ao corpo do cartão */}
                    <div className="text-section">
                        <h5 className="card-title">Está com dúvidas de onde ir?</h5>
                        <div className='container-roteiro'>
                            <p className="card-text">Use a nossa função de criar roteiro para descobrir novos lugares incríveis!</p>
                        </div>
                    </div>

                </div>
            </div>
        </div>
    );
}

export default CustomCard;
