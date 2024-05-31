"use client";
import React, { useState, useEffect } from 'react';

import {
  APIProvider,
  Map,
  Marker,
} from "@vis.gl/react-google-maps";

export default function Roteiro() {
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
    <div>
      <APIProvider apiKey={process.env.REACT_APP_GOOGLE_MAPS_API_KEY}>
        <div style={{ height: "40vh", width: "70%", margin: "auto", borderRadius: "20px", overflow: "hidden" }}>
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
  );
}
