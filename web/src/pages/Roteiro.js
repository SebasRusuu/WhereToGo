"use client";
import React, { useState, useEffect } from 'react';
import { createRoot } from 'react-dom/client';
import RoteiroForms from '../components/RoteiroForms';
import {
  APIProvider,
  Map,
  PlacesAutocomplete,
  AdvancedMarker,
  Marker,
} from "@vis.gl/react-google-maps";

export default function Roteiro() {
  const [position, setPosition] = useState(null); // Inicialmente, sem posição
  const [initialCenter, setInitialCenter] = useState(null); // Centro inicial do mapa
  const [initialZoom, setInitialZoom] = useState(15); // Zoom inicial do mapa

  useEffect(() => {
    // Função para obter a localização atual
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

    // Chame a função para obter a localização ao montar o componente
    getCurrentLocation();
  }, []);

  return (
    <div>
      <APIProvider apiKey={process.env.REACT_APP_GOOGLE_MAPS_API_KEY}>
        <div style={{ height: "70vh", width: "70%", margin: "auto",  borderRadius: "20px", overflow: "hidden" }}>
          {initialCenter ? (
            <Map
              defaultZoom={initialZoom} // Define o zoom inicial
              defaultCenter={initialCenter} // Define o centro inicial
              mapId={process.env.REACT_APP_MAP_ID}
              options={{
                gestureHandling: "true",
                greedy: true,
              }}
            >
              <Marker position={position} />
            </Map>
          ) : (
            <p>Loading...</p> // Mensagem de carregamento enquanto a localização é obtida
          )}
        </div>
      </APIProvider>
    </div>
  );
}
