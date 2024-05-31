import React, { useState, useEffect } from 'react';
import { useLocation } from 'react-router-dom';
import './roteirosLoc.css';
import { APIProvider, Map, Marker } from "@vis.gl/react-google-maps";

export default function RoteirosLoc() {
  const location = useLocation();
  const { formData } = location.state || {};

  const [position, setPosition] = useState(null);
  const [initialCenter, setInitialCenter] = useState(null);
  const [initialZoom] = useState(15);

  useEffect(() => {
    const getCurrentLocation = () => {
      if (navigator.geolocation) {
        navigator.geolocation.getCurrentPosition(
          (position) => {
            const currentPosition = {
              lat: position.coords.latitude,
              lng: position.coords.longitude,
            };
            setPosition(currentPosition);
            setInitialCenter(currentPosition);
          },
          (error) => {
            console.error("Error getting location: ", error);
          }
        );
      } else {
        console.error("Geolocation is not supported by this browser.");
      }
    };

    getCurrentLocation();
  }, []);

  return (
    <div className="roteiro-page">

      <div className="roteiro-container">
        <div className="roteiro-title"> 
          <h1><b>Crie o seu Roteiro</b></h1>
        </div>
        <div className="roteiro-name">
          <input type="text" placeholder="Nome do roteiro" />
          <button className="create-roteiro-button">Criar Roteiro</button>
        </div>

        <div className="roteiro-content">
          <div className="roteiro-section">
            <h2>O Meu Roteiro</h2>
            <ul className="roteiro-list">
              <li>
                <span>Local 1</span>
                <button className="delete-button">🗑️</button>
              </li>
              <li>
                <span>Local 2</span>
                <button className="delete-button">🗑️</button>
              </li>
              <li>
                <span>Local 3</span>
                <button className="delete-button">🗑️</button>
              </li>
            </ul>
          </div>

          <div className="roteiro-section">
            <h2>Mais Opções</h2>
            <ul className="roteiro-list">
              <li><button className="add-button">+</button></li>
              <li><button className="add-button">+</button></li>
              <li><button className="add-button">+</button></li>
            </ul>
          </div>
        </div>
      </div>

      <div className="roteiro-location">
        <div className="location-details">
          <h3>Padrão dos Descobrimentos</h3>
          <p>Endereço: Av. Brasília – Belém Belem, Lisboa 1400-038 Portugal</p>
          <p>Valor da entrada: 0€</p>
          <p>Local: Belém</p>
          <p>⭐ 4.6</p>
        </div>
        <div className="map-container">
          <APIProvider apiKey={process.env.REACT_APP_GOOGLE_MAPS_API_KEY}>
            <div className="map-wrapper">
              {initialCenter ? (
                <Map
                  defaultZoom={initialZoom}
                  defaultCenter={initialCenter}
                  mapId={process.env.REACT_APP_MAP_ID}
                  options={{
                    gestureHandling: "true",
                    greedy: true,
                  }}
                >
                  <Marker position={position} />
                </Map>
              ) : (
                <p>Loading...</p>
              )}
            </div>
          </APIProvider>
        </div>
      </div>
    </div>
  );
}
