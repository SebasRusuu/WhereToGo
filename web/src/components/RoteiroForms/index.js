import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import './RoteiroForms.css';

function RoteiroForms({ onClose }) {
  const [region, setRegion] = useState('');
  const [eatDuringTrip, setEatDuringTrip] = useState('');
  const [visitOptions, setVisitOptions] = useState({
    museus: false,
    monumentos: false,
    praias: false,
    parques: false,
    parqueDiversao: false,
    palacio: false,
    rooftop: false,
  });

  const navigate = useNavigate();

  const handleCheckboxChange = (event) => {
    const { name, checked } = event.target;
    setVisitOptions({ ...visitOptions, [name]: checked });
  };

  const handleSubmit = (event) => {
    event.preventDefault();
    const selectedOptions = Object.keys(visitOptions).filter(key => visitOptions[key]);
    const formData = {
      region,
      eatDuringTrip,
      selectedOptions
    };

    // Navigate to the roteirosLoc page with form data
    navigate('/roteiros-loc', { state: { formData } });
  };

  return (
    <div className="roteiro-backdrop">
      <div className="roteiro-container">
        <button className="close-button" onClick={onClose}>X</button>
        <form className="roteiro-form" onSubmit={handleSubmit}>
          <h1>Perguntas para o Roteiro</h1>
          <p>Responda conforme o seu gosto</p>
          
          <div className="question-container">
            <label>Qual a região do país que pretende conhecer?</label>
            <select value={region} onChange={(e) => setRegion(e.target.value)}>
              <option value="">Selecione uma região</option>
              <option value="norte">Norte</option>
              <option value="centro">Centro</option>
              <option value="sul">Sul</option>
            </select>
          </div>
          
          <div className="question-container">
            <label>Pretende comer durante a sua viagem?</label>
            <select value={eatDuringTrip} onChange={(e) => setEatDuringTrip(e.target.value)}>
              <option value="">Selecione</option>
              <option value="sim">Sim</option>
              <option value="nao">Não</option>
            </select>
          </div>
          
          <div className="question-container">
            <label>O que gostaria de visitar?</label>
            <div className="checkbox-container">
              <div className="checkbox-column">
                <input
                  type="checkbox"
                  id="museus"
                  name="museus"
                  checked={visitOptions.museus}
                  onChange={handleCheckboxChange}
                />
                <label htmlFor="museus">Museus</label>
                
                <input
                  type="checkbox"
                  id="monumentos"
                  name="monumentos"
                  checked={visitOptions.monumentos}
                  onChange={handleCheckboxChange}
                />
                <label htmlFor="monumentos">Monumentos</label>
                
                <input
                  type="checkbox"
                  id="praias"
                  name="praias"
                  checked={visitOptions.praias}
                  onChange={handleCheckboxChange}
                />
                <label htmlFor="praias">Praias</label>
              </div>
              <div className="checkbox-column">
                <input
                  type="checkbox"
                  id="parques"
                  name="parques"
                  checked={visitOptions.parques}
                  onChange={handleCheckboxChange}
                />
                <label htmlFor="parques">Parques</label>
                
                <input
                  type="checkbox"
                  id="parqueDiversao"
                  name="parqueDiversao"
                  checked={visitOptions.parqueDiversao}
                  onChange={handleCheckboxChange}
                />
                <label htmlFor="parqueDiversao">Parque de Diversão</label>
                
                <input
                  type="checkbox"
                  id="palacio"
                  name="palacio"
                  checked={visitOptions.palacio}
                  onChange={handleCheckboxChange}
                />
                <label htmlFor="palacio">Palácio</label>
                
                <input
                  type="checkbox"
                  id="rooftop"
                  name="rooftop"
                  checked={visitOptions.rooftop}
                  onChange={handleCheckboxChange}
                />
                <label htmlFor="rooftop">Rooftop</label>
              </div>
            </div>
          </div>
          
          <button type="submit" className="submit-button">Submit</button>
        </form>
      </div>
    </div>
  );
}

export default RoteiroForms;
