import React from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';

import AdminLayout from './components/layout/AdminLayout';
import Dashboard from './pages/Dashboard';
import Kependudukan from './pages/Kependudukan';
import ZakatFitrah from './pages/ZakatFitrah';
import Sedekah from './pages/Sedekah';
import Santunan from './pages/Santunan';
import ZakatMall from './pages/ZakatMall';
import Kepengurusan from './pages/Kepengurusan';
import AsnafManagement from './pages/AsnafManagement';
import PetaAsnaf from './pages/PetaAsnaf';
import MuzakiPublicForm from './pages/MuzakiPublicForm';
import EventManagement from './pages/EventManagement';
import UserPreference from './pages/UserPreference';
import SettingPage from './pages/SettingPage';

const App = () => {
  return (
    <Router>
      <Routes>
        {/* Public Route */}
        <Route path="/daftar-zakat" element={<MuzakiPublicForm />} />

        {/* Admin Routes with Layout */}
        <Route element={<AdminLayout />}>
          <Route path="/" element={<Dashboard />} />
          <Route path="/kependudukan" element={<Kependudukan />} />
          <Route path="/asnaf" element={<AsnafManagement />} />
          <Route path="/peta-asnaf" element={<PetaAsnaf />} />
          <Route path="/zakat-fitrah" element={<ZakatFitrah />} />
          <Route path="/sedekah" element={<Sedekah />} />
          <Route path="/santunan" element={<Santunan />} />
          <Route path="/zakat-mall" element={<ZakatMall />} />
          <Route path="/kepengurusan" element={<Kepengurusan />} />
          <Route path="/event-management" element={<EventManagement />} />
          <Route path="/preference" element={<UserPreference />} />
          <Route path="/settings" element={<SettingPage />} />
        </Route>
      </Routes>
    </Router>
  );
};

export default App;
