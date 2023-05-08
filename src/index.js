import React from 'react';
import ReactDOM from 'react-dom/client';

import { Routes, Route , BrowserRouter} from "react-router-dom";

import Layout from './components/layout';
import Browser from './pages/browser';
import Board from './pages/board';

import 'bootstrap/dist/css/bootstrap.min.css';
import "./styling/index.css";


const root = ReactDOM.createRoot(document.getElementById('root'));
root.render(
  <React.StrictMode>
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<Layout />} >
          <Route path="/" element={<Browser />} />
          <Route path="board/:address" element={<Board />} />
        </Route>
      </Routes>
    </BrowserRouter>

  </React.StrictMode>
);