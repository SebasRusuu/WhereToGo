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
  const [position, setPosition] = useState(null);
  const [initialCenter, setInitialCenter] = useState(null);
  const [initialZoom, setInitialZoom] = useState(15);
  const [placeDetails, setPlaceDetails] = useState(null);

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

  useEffect(() => {
    const placeId = "ChIJN1t_tDeuEmsRUsoyG83frY4"; // Example place_id
    fetchPlaceDetails(placeId);
  }, [position]);

  const fetchPlaceDetails = async (placeId) => {
    try {
      const response = await fetch(`http://localhost:4000/place-details?place_id=${placeId}`);
      const data = await response.json();
      if (data.error) {
        console.error('Error fetching place details:', data.error);
      } else {
        setPlaceDetails(data);
      }
    } catch (error) {
      console.error('Error fetching place details:', error);
    }
  };

 

  return (
    <div>
      <APIProvider apiKey={process.env.REACT_APP_GOOGLE_MAPS_API_KEY}>
        <div style={{ height: "70vh", width: "70%", margin: "auto", borderRadius: "20px", overflow: "hidden" }}>
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
        {placeDetails && (
          <div>
            <h3>{placeDetails.name}</h3>
            <p>Rating: {placeDetails.rating}</p>
            <p>Price Level: {placeDetails.price_level}</p>
            <p>User Ratings Total: {placeDetails.user_ratings_total}</p>
            <p>Address: {placeDetails.geometry.location}</p>
          </div>
        )}
      </APIProvider>
    </div>
  );
}
