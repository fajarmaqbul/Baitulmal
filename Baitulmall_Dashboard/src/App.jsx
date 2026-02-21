import React from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';

import NotificationLog from './pages/NotificationLog';
import AdminLayout from './components/layout/AdminLayout';
import Dashboard from './pages/Dashboard';
import Kependudukan from './pages/Kependudukan';
import ZakatFitrah from './pages/ZakatFitrah';
import Sedekah from './pages/Sedekah';
import Santunan from './pages/Santunan';
import ZakatMall from './pages/ZakatMall';
import Kepengurusan from './pages/Kepengurusan';
import KepengurusanLanding from './pages/KepengurusanLanding';
import KepengurusanTakmir from './pages/KepengurusanTakmir';
import KepengurusanRW from './pages/KepengurusanRW';
import KepengurusanRT from './pages/KepengurusanRT';
import AsnafManagement from './pages/AsnafManagement';
import MuzakiPublicForm from './pages/MuzakiPublicForm';
import EventList from './pages/EventList';
import EventManagement from './pages/EventManagement';
import EventDetail from './pages/EventDetail';
import AgendaEditor from './pages/AgendaEditor';
import UserPreference from './pages/UserPreference';
import SettingPage from './pages/SettingPage';
import LoginPage from './pages/LoginPage';
import RegisterPage from './pages/RegisterPage';
import AssetList from './pages/Inventory/AssetList';
import LoanManagement from './pages/Inventory/LoanManagement';
import CampaignList from './pages/Crowdfunding/CampaignList';

import Secretariat from './pages/Secretariat';
import Etalase from './pages/Etalase';
import ProductManagement from './pages/ProductManagement';



const App = () => {
  return (
    <Router>
      <Routes>
        {/* Public Routes */}
        <Route path="/daftar-zakat" element={<MuzakiPublicForm />} />
        <Route path="/etalase" element={<Etalase />} />
        <Route path="/login" element={<LoginPage />} />
        <Route path="/register" element={<RegisterPage />} />

        {/* Admin Routes with Layout */}
        <Route element={<AdminLayout />}>
          <Route path="/" element={<Dashboard />} />
          <Route path="/kependudukan" element={<Kependudukan />} />
          <Route path="/asnaf" element={<AsnafManagement />} />
          <Route path="/zakat-fitrah" element={<ZakatFitrah />} />
          <Route path="/sedekah" element={<Sedekah />} />
          <Route path="/santunan" element={<Santunan />} />

          <Route path="/zakat-mall" element={<ZakatMall />} />
          <Route path="/kepengurusan" element={<KepengurusanLanding />} />
          <Route path="/kepengurusan-baitulmall" element={<Kepengurusan />} />
          <Route path="/kepengurusan-takmir" element={<KepengurusanTakmir />} />
          <Route path="/kepengurusan-rw" element={<KepengurusanRW />} />
          <Route path="/kepengurusan-rt" element={<KepengurusanRT />} />
          <Route path="/event-management" element={<EventList />} />
          <Route path="/event-management/new" element={<EventManagement />} />
          <Route path="/event-management/:id" element={<EventManagement />} />
          <Route path="/events/:id" element={<EventDetail />} />
          <Route path="/events/:eventId/agenda/new" element={<AgendaEditor />} />
          <Route path="/events/:eventId/agenda/:postId" element={<AgendaEditor />} />
          <Route path="/events/:eventId/agenda/:postId/edit" element={<AgendaEditor />} />

          {/* Inventory Routes */}
          <Route path="/inventory" element={<AssetList />} />
          <Route path="/inventory/loans" element={<LoanManagement />} />

          {/* Crowdfunding Routes */}
          <Route path="/crowdfunding" element={<CampaignList />} />
          <Route path="/notifications" element={<NotificationLog />} />

          <Route path="/secretariat" element={<Secretariat />} />
          {/* Etalase moved to public */}
          <Route path="/product-management" element={<ProductManagement />} />

          <Route path="/preference" element={<UserPreference />} />
          <Route path="/settings" element={<SettingPage />} />
        </Route>
      </Routes>
    </Router>
  );
};

export default App;
