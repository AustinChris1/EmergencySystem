import { useState } from 'react'
import axios from 'axios';
import { ToastContainer } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';
import { BrowserRouter as Router, Routes, Route, useLocation, Navigate } from 'react-router-dom';
import FireDashboard from './Components/FireDashboard'
import HealthDashboard from './Components/HealthDashboard';
import SecurityDashboard from './Components/SecurityDashboard';
import GeneralDashboard from './Components/GeneralDashboard';
import AddUser from './Components/AddUser';

axios.defaults.withCredentials = true;
axios.defaults.withXSRFToken = true;
axios.defaults.baseURL = '/';
axios.defaults.headers.post['Content-Type'] = 'application/json';
axios.defaults.headers.post['Accept'] = 'application/json';

axios.interceptors.request.use(function (config) {
  const token = localStorage.getItem('auth_token');
  config.headers.Authorization = token ? `Bearer ${token}` : '';
  return config;
});

function App() {

  return (
    <div className="App font-raleway">
      <Router>
        <Routes>
        <Route path='/' element={<FireDashboard />}></Route>
        <Route path='/health' element={<HealthDashboard />}></Route>
        <Route path='/security' element={<SecurityDashboard />}></Route>
        <Route path='/general' element={<GeneralDashboard />}></Route>
        <Route path='/add' element={<AddUser/>}></Route>
        </Routes> </Router>

      {/* ToastContainer for global notifications */}
      <ToastContainer
        position="top-right"
        autoClose={3000}
        newestOnTop
        closeOnClick
        pauseOnFocusLoss
        draggable
        pauseOnHover
      />

    </div>
  )
}

export default App
