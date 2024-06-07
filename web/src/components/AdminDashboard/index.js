"use client";
import React, { useState } from 'react';
import Plot from 'react-plotly.js';

// Função para buscar estatísticas de lugares do servidor
const fetchPlaceStats = async (city, type) => {
  try {
    const response = await fetch(`https://wheretogo-4kxz.onrender.com/place-stats?city=${city}&type=${type}`);
    const data = await response.json();
    return data;
  } catch (error) {
    console.error('Error fetching place stats:', error);
    return null;
  }
};

// Função para buscar a quantidade de locais por cidade
const fetchPlaceCounts = async (type) => {
  try {
    const response = await fetch(`https://wheretogo-4kxz.onrender.com/place-counts?type=${type}`);
    const data = await response.json();
    return data;
  } catch (error) {
    console.error('Error fetching place counts:', error);
    return null;
  }
};

export default function Stats() {
  const [city, setCity] = useState(''); // Estado para armazenar a cidade
  const [type, setType] = useState(''); // Estado para armazenar o tipo de lugar
  const [stats, setStats] = useState(null); // Estado para armazenar as estatísticas
  const [counts, setCounts] = useState(null); // Estado para armazenar as quantidades por cidade

  // Função para lidar com o envio do formulário de estatísticas
  const handleStatsSubmit = async (event) => {
    event.preventDefault();
    const placeStats = await fetchPlaceStats(city, type);
    if (placeStats) {
      setStats(placeStats);
    }
  };

  // Função para lidar com o envio do formulário de quantidades por cidade
  const handleCountsSubmit = async (event) => {
    event.preventDefault();
    const placeCounts = await fetchPlaceCounts(type);
    if (placeCounts) {
      setCounts(placeCounts);
    }
  };

  return (
    <div>
      <form onSubmit={handleStatsSubmit}>
        <h2>Buscar Estatísticas de Avaliações</h2>
        <label>
          Cidade:
          <input type="text" value={city} onChange={(e) => setCity(e.target.value)} />
        </label>
        <label>
          Tipo:
          <input type="text" value={type} onChange={(e) => setType(e.target.value)} />
        </label>
        <button type="submit">Buscar</button>
      </form>
      {stats && (
        <div>
          <h3>Estatísticas de Avaliações</h3>
          <p>Valor Médio das Avaliações: {stats.averageRating} ± {stats.marginOfError}</p>
          <p>Melhor Avaliação: {stats.maxRating}</p>
          <p>Pior Avaliação: {stats.minRating}</p>
        </div>
      )}

      <form onSubmit={handleCountsSubmit}>
        <h2>Buscar Quantidades por Cidade</h2>
        <label>
          Tipo:
          <input type="text" value={type} onChange={(e) => setType(e.target.value)} />
        </label>
        <button type="submit">Buscar</button>
      </form>
      {counts && (
        <Plot
          data={[
            {
              x: Object.keys(counts),
              y: Object.values(counts),
              type: 'bar',
            },
          ]}
          layout={{ title: `Quantidade de ${type} nas Maiores Cidades de Portugal` }}
          style={{ width: "100%", height: "400px" }}
        />
      )}
    </div>
  );
}
