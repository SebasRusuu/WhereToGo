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
  const [places, setPlaces] = useState([]);

  useEffect(() => {
    const getCurrentLocation = () => {
      if (navigator.geolocation) {
        navigator.geolocation.getCurrentPosition(
          (position) => {
            const currentPosition = {
              lat: position.coords.latitude,
              lng: position.coords.longitude,
            };
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

  useEffect(() => {
    const fetchPlaces = async () => {
      try {
        const response = await axios.post('http://localhost:4000/get-places', { selectedOptions: formData.selectedOptions });
        setPlaces(response.data.places);
      } catch (error) {
        console.error('Error fetching places:', error);
      }
    };

    if (formData) {
      fetchPlaces();
    }
  }, [formData]);

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
              {places.map((place, index) => (
                <li key={index}>
                  <span>{place.name}</span>
                  <button className="delete-button">🗑️</button>
                </li>
              ))}
            </ul>
          </div>

          <div className="roteiro-section">
            <h2>Mais Opções</h2>
            <ul className="roteiro-list">
              {places.map((place, index) => (
                <li key={index}>
                  <span>{place.name}</span>
                  <button className="add-button">+</button>
                </li>
              ))}
            </ul>
          </div>
        </div>
      </div>

      <div className="roteiro-location">
        <div className="location-details">
          {places.length > 0 && (
            <>
              <h3>{places[0].name}</h3>
              <p>Endereço: {places[0].formatted_address}</p>
              <p>Valor da entrada: {places[0].price_level ? `${places[0].price_level}€` : 'Gratuito'}</p>
              <p>Local: {places[0].vicinity}</p>
              <p>⭐ {places[0].rating}</p>
            </>
          )}
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
                  {places.map((place, index) => (
                    <Marker
                      key={index}
                      position={{ lat: place.geometry.location.lat, lng: place.geometry.location.lng }}
                    />
                  ))}
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
