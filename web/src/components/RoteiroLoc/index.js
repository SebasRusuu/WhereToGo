import React, { useState, useEffect } from 'react';
import { useLocation } from 'react-router-dom';
import './roteirosLoc.css';
import { APIProvider, Map, Marker } from "@vis.gl/react-google-maps";
import axios from 'axios';

export default function RoteirosLoc() {
  const location = useLocation();
  const { formData } = location.state || {};

  const [initialCenter, setInitialCenter] = useState(null);
  const [initialZoom] = useState(15);
  const [topRatedPlaces, setTopRatedPlaces] = useState([]);
  const [remainingPlaces, setRemainingPlaces] = useState([]);
  const [selectedPlace, setSelectedPlace] = useState(null);

  useEffect(() => {
    if (formData && formData.lat && formData.lng) {
      setInitialCenter({ lat: formData.lat, lng: formData.lng });
    }
  }, [formData]);

  useEffect(() => {
    const fetchPlaces = async () => {
      try {
        const response = await axios.post('http://localhost:4000/get-places', {
          selectedOptions: formData.selectedOptions,
          lat: formData.lat,
          lng: formData.lng
        });
        setTopRatedPlaces(response.data.topRatedPlaces || []);
        setRemainingPlaces(response.data.remainingPlaces || []);
      } catch (error) {
        console.error('Error fetching places:', error);
      }
    };

    if (formData) {
      fetchPlaces();
    }
  }, [formData]);

  const handlePlaceClick = (place) => {
    setSelectedPlace(place);
    setInitialCenter({
      lat: place.geometry.location.lat,
      lng: place.geometry.location.lng
    });
  };

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
              {topRatedPlaces.map((place, index) => (
                <li key={index} onClick={() => handlePlaceClick(place)}>
                  <span>{place.name}</span>
                  <button className="delete-button">🗑️</button>
                </li>
              ))}
            </ul>
          </div>

          <div className="roteiro-section">
            <h2>Mais Opções</h2>
            <ul className="roteiro-list">
              {remainingPlaces.map((place, index) => (
                <li key={index} onClick={() => handlePlaceClick(place)}>
                  <span>{place.name}</span>
                  <button className="add-button">+</button>
                </li>
              ))}
            </ul>
          </div>
        </div>
      </div>

      <div className="roteiro-location">
        <div className="d-flex justify-content-center"> {/* Bootstrap utility classes for centering */}
          <div className="location-details">
            {selectedPlace ? (
              <>
                <img src={selectedPlace.photos[0]} alt={`Foto de ${selectedPlace.name}`} className="place-photo-large" />
                <div className="details-text">
                  <h3>{selectedPlace.name}</h3>
                  <p>Endereço: {selectedPlace.formatted_address}</p>
                  <p>Valor da entrada: {selectedPlace.price_level ? `${selectedPlace.price_level}€` : 'Gratuito'}</p>
                  <p>Local: {selectedPlace.vicinity}</p>
                  <div className="rating">
                    <span>{selectedPlace.rating}</span>
                  </div>
                </div>
              </>
            ) : (
              <p>Selecione um local para ver os detalhes</p>
            )}
          </div>
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
                  {selectedPlace && (
                    <Marker
                      position={{
                        lat: selectedPlace.geometry.location.lat,
                        lng: selectedPlace.geometry.location.lng
                      }}
                    />
                  )}
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
