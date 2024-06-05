import React from 'react';
import './CardsComponents.css';

function CardsComponents({ place }) {
  return (
    <div className="col-12 col-sm-6 col-md-4 mb-4">
      <div className="card">
        <img src={place.photos[0]} alt={place.name} className="card-photo" />
        <div className="card-content">
          <h3 className="card-title">{place.name}</h3>
          <p className="card-text">{place.formatted_address}</p>
          <div className="card-rating">
            <span>{place.rating} ⭐️</span>
          </div>
        </div>
      </div>
    </div>
  );
}

export default CardsComponents;
