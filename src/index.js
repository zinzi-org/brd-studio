import React from 'react';
import ReactDOM from 'react-dom/client';

import { Routes, Route, BrowserRouter } from "react-router-dom";

import Layout from './components/layout';

import Boards from './pages/boards';
import Board from './pages/board';

import Projects from './pages/projects';
import Project from './pages/project';

import 'bootstrap/dist/css/bootstrap.min.css';
import "./styling/index.css";

import { EthereumProvider } from './ethContext';

const root = ReactDOM.createRoot(document.getElementById('root'));
root.render(
  <React.StrictMode>
    <EthereumProvider>
      <BrowserRouter>
        <Routes>
          <Route path="/" element={<Layout />} >
            <Route path="/" element={<Boards />} />
            <Route path="board/:boardAddress" element={<Board />} />
            <Route path="/projects" element={<Projects />} />
            <Route path="project/:projectAddress" element={<Project />} />
          </Route>
        </Routes>
      </BrowserRouter>
    </EthereumProvider>
  </React.StrictMode>
);