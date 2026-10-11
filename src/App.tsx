import React from 'react';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { AccessGate } from './pages/AccessGate';
import { Grove } from './pages/Grove';
import { Cinema } from './pages/Cinema';
import { Signal } from './pages/Signal';
import { Vault } from './pages/Vault';
import { Logs } from './pages/Logs';

export default function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<AccessGate />} />
        <Route path="/grove" element={<Grove />} />
        <Route path="/cinema/:id" element={<Cinema />} />
        <Route path="/signal" element={<Signal />} />
        <Route path="/vault" element={<Vault />} />
        <Route path="/logs" element={<Logs />} />
        <Route path="*" element={<Navigate to="/grove" replace />} />
      </Routes>
    </BrowserRouter>
  );
}
