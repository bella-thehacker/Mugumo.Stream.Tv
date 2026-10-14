import React from 'react';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { Sanctuary } from './pages/Sanctuary';
import { Login } from './pages/Login';
import { Register } from './pages/Register';
import { ChooseClearing } from './pages/ChooseClearing';
import { Grove } from './pages/Grove';
import { Cinema } from './pages/Cinema';
import { Signal } from './pages/Signal';
import { Vault } from './pages/Vault';
import { Logs } from './pages/Logs';
import { MyClearing } from './pages/MyClearing';
import { Settings } from './pages/Settings';
import { SanctuaryLayout } from './components/SanctuaryLayout';

export default function App() {
  return (
    <BrowserRouter>
      <Routes>
        {/* The Sanctuary Authentication & Gate Routes */}
        <Route path="/" element={<Sanctuary />} />
        <Route path="/sanctuary" element={<Sanctuary />} />
        <Route path="/login" element={<Login />} />
        <Route path="/enter-the-grove" element={<Login />} />
        <Route path="/register" element={<Register />} />
        <Route path="/find-your-roots" element={<Register />} />
        <Route path="/choose-your-clearing" element={<ChooseClearing />} />
        <Route path="/profiles" element={<ChooseClearing />} />

        {/* Global Authenticated Streaming Layout Routes */}
        <Route element={<SanctuaryLayout />}>
          <Route path="/grove" element={<Grove />} />
          <Route path="/cinema/:id" element={<Cinema />} />
          <Route path="/signal" element={<Signal />} />
          <Route path="/vault" element={<Vault />} />
          <Route path="/my-clearing" element={<MyClearing />} />
          <Route path="/profile" element={<MyClearing />} />
          <Route path="/settings" element={<Settings />} />
          <Route path="/logs" element={<Logs />} />
        </Route>

        {/* Fallback */}
        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>
    </BrowserRouter>
  );
}
