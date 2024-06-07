import React, { useEffect, useState } from "react";
import axios from 'axios';
import "./App.css";
import Header from './components/Header';
import BodyHome from './components/BodyHome';
import Footer from './components/Footer';
import Places from './pages/Places';
import Eat from './pages/Eat';
import Reviews from './pages/Reviews';
import Roteiro from './pages/Roteiro';
import Contactos from './pages/Contactos';
import LoginModal from "./components/LoginModal";
import Login from "./components/Login";
import Register from "./components/Register";
import 'bootstrap/dist/css/bootstrap.min.css';
import Admin from "./components/AdminDashboard";
import ResetPassword from "./components/ResetPassword";
import RoteirosLoc from "./components/RoteiroLoc";
import { BrowserRouter as Router, Route, Routes } from 'react-router-dom';

const Home = () => {
  return (
    <div>
      <BodyHome />
    </div>
  );
}

function App() {
  const [data, setData] = useState(null);

  useEffect(() => {
    axios.get(`${process.env.REACT_APP_API_URL}/api/endpoint`)
      .then(response => {
        setData(response.data);
      })
      .catch(error => {
        console.error('There was an error!', error);
      });
  }, []);

  return (
    <div className="App">
      <Router>
        <div className="main-container">
          <Header />
          {data && (
            <div className="api-data">
              <h2>Data from Backend:</h2>
              <pre>{JSON.stringify(data, null, 2)}</pre>
            </div>
          )}
          <Routes>
            <Route path="/" element={<Home />} />
            <Route path="/places" element={<Places />} />
            <Route path="/wheretoeat" element={<Eat />} />
            <Route path="/reviews" element={<Reviews />} />
            <Route path="/roteiro" element={<Roteiro />} />
            <Route path="/contactos" element={<Contactos />} />
            <Route path="/login-modal" element={<LoginModal />} />
            <Route path="/login" element={<Login />} />
            <Route path="/register" element={<Register />} />
            <Route path="/admin" element={<Admin />} />
            <Route path="/reset-password" element={<ResetPassword />} />
            <Route path="/roteiros-loc" element={<RoteirosLoc />} />
          </Routes>
        </div>
        <Footer />
      </Router>
    </div>
  );
}

export default App;
