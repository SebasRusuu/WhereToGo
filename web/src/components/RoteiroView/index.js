import React, { useEffect, useState } from 'react';
import { APIProvider, Map, Marker } from "@vis.gl/react-google-maps";
import './roteiroview.css';

const RoteiroView = ({ formData, onClose }) => {
  const [initialCenter, setInitialCenter] = useState(null);

  useEffect(() => {
    if (formData && formData.places && formData.places.length > 0) {
      setInitialCenter({
        lat: formData.places[0].geometry.location.lat,
        lng: formData.places[0].geometry.location.lng
      });
    }
  }, [formData]);

  if (!formData) return null;

  return (
    <div className="roteiro-popup-backdrop" onClick={onClose}>
      <div className="roteiro-popup-container" onClick={e => e.stopPropagation()}>
        <button className="close-button" onClick={onClose}>X</button>
        <h2>{formData.rot_name}</h2>
        <ul>
          {formData.places.map((place, index) => (
            <li key={index}>
              <h3>{place.name}</h3>
              <p>Endereço: {place.formatted_address}</p>
              <p>Valor da entrada: {place.price_level ? `${place.price_level}€` : 'Gratuito'}</p>
              <div className="rating">
                <span>{place.rating}</span>
              </div>
              {place.photos.length > 0 && (
                <div className="photos-container">
                  {place.photos.map((photo, index) => (
                    <img key={index} src={photo} alt={`Foto de ${place.name}`} className="place-photo" />
                  ))}
                </div>
              )}
            </li>
          ))}
        </ul>
        <div className="map-container">
          <APIProvider apiKey={process.env.REACT_APP_GOOGLE_MAPS_API_KEY}>
            <div className="map-wrapper">
              {initialCenter ? (
                <Map
                  defaultZoom={15}
                  defaultCenter={initialCenter}
                  mapId={process.env.REACT_APP_MAP_ID}
                >
                  {formData.places.map((place, index) => (
                    <Marker
                      key={index}
                      position={{
                        lat: place.geometry.location.lat,
                        lng: place.geometry.location.lng
                      }}
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
};

export default RoteiroView;
