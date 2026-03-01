import React, { Suspense, lazy } from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { Analytics } from '@vercel/analytics/react';

import AdminLayout from './components/layout/AdminLayout';
import ErrorBoundary from './components/ErrorBoundary';

// Lazy load pages
const NotificationLog = lazy(() => import('./pages/NotificationLog'));
const Dashboard = lazy(() => import('./pages/Dashboard'));
const ZakatFitrah = lazy(() => import('./pages/ZakatFitrah'));
const Sedekah = lazy(() => import('./pages/Sedekah'));
const Santunan = lazy(() => import('./pages/Santunan'));
const ZakatMall = lazy(() => import('./pages/ZakatMall'));
const ZakatProduktif = lazy(() => import('./pages/ZakatProduktif'));
const Kepengurusan = lazy(() => import('./pages/Kepengurusan'));
const KepengurusanLanding = lazy(() => import('./pages/KepengurusanLanding'));
const KepengurusanTakmir = lazy(() => import('./pages/KepengurusanTakmir'));
const KepengurusanRW = lazy(() => import('./pages/KepengurusanRW'));
const KepengurusanRT = lazy(() => import('./pages/KepengurusanRT'));
const AsnafManagement = lazy(() => import('./pages/AsnafManagement'));
const MuzakiPublicForm = lazy(() => import('./pages/MuzakiPublicForm'));
const EventList = lazy(() => import('./pages/EventList'));
const EventManagement = lazy(() => import('./pages/EventManagement'));
const EventDetail = lazy(() => import('./pages/EventDetail'));
const AgendaEditor = lazy(() => import('./pages/AgendaEditor'));
const UserPreference = lazy(() => import('./pages/UserPreference'));
const SettingPage = lazy(() => import('./pages/SettingPage'));
const LoginPage = lazy(() => import('./pages/LoginPage'));
const RegisterPage = lazy(() => import('./pages/RegisterPage'));
const ForgotPasswordPage = lazy(() => import('./pages/ForgotPasswordPage'));
const ResetPasswordPage = lazy(() => import('./pages/ResetPasswordPage'));
const GoogleCallbackPage = lazy(() => import('./pages/GoogleCallbackPage'));
const AssetList = lazy(() => import('./pages/Inventory/AssetList'));
const LoanManagement = lazy(() => import('./pages/Inventory/LoanManagement'));
const CampaignList = lazy(() => import('./pages/Crowdfunding/CampaignList'));
const Secretariat = lazy(() => import('./pages/Secretariat'));
const Etalase = lazy(() => import('./pages/Etalase'));
const ProductManagement = lazy(() => import('./pages/ProductManagement'));
const PublicTransparency = lazy(() => import('./pages/PublicTransparency'));
const TataKelola = lazy(() => import('./pages/TataKelola'));
const TataKelolaZakatFitrah = lazy(() => import('./pages/TataKelolaZakatFitrah'));
const TataKelolaZakatProduktif = lazy(() => import('./pages/TataKelolaZakatProduktif'));
const PersonCentricDashboard = lazy(() => import('./pages/PersonCentricDashboard'));


const App = () => {
  return (
    <Router>
      <ErrorBoundary>
        <Suspense fallback={
          <div style={{
            height: '100vh',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            background: 'var(--background)',
            color: 'var(--primary)',
            fontSize: '1.2rem',
            fontWeight: 'bold',
            flexDirection: 'column',
            gap: '1rem'
          }}>
            <div className="loading-spinner" style={{ width: '40px', height: '40px' }}></div>
            <span>Baitulmal Fajar Maqbul memuat...</span>
          </div>
        }>
          <Routes>
            {/* Public Routes */}
            <Route path="/public" element={<PublicTransparency />} />
            <Route path="/daftar-zakat" element={<MuzakiPublicForm />} />
            <Route path="/etalase" element={<Etalase />} />
            <Route path="/login" element={<LoginPage />} />
            <Route path="/register" element={<RegisterPage />} />
            <Route path="/forgot-password" element={<ForgotPasswordPage />} />
            <Route path="/reset-password" element={<ResetPasswordPage />} />
            <Route path="/login/callback" element={<GoogleCallbackPage />} />
            <Route path="/tatakelola" element={<TataKelola />} />
            <Route path="/tatakelola/zakat-fitrah" element={<TataKelolaZakatFitrah />} />
            <Route path="/tatakelola/zakat-produktif" element={<TataKelolaZakatProduktif />} />

            {/* Admin Routes with Layout */}
            <Route element={<AdminLayout />}>
              <Route path="/" element={<Navigate to="/dashboard" replace />} />
              <Route path="/dashboard" element={<Dashboard />} />
              <Route path="/asnaf" element={<AsnafManagement />} />
              <Route path="/zakat-fitrah" element={<ZakatFitrah />} />
              <Route path="/sedekah" element={<Sedekah />} />
              <Route path="/santunan" element={<Santunan />} />

              <Route path="/zakat-mall" element={<ZakatMall />} />
              <Route path="/zakat-produktif" element={<ZakatProduktif />} />
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
              <Route path="/sdm/overview" element={<PersonCentricDashboard />} />

              <Route path="/preference" element={<UserPreference />} />
              <Route path="/settings" element={<SettingPage />} />
            </Route>
          </Routes>
        </Suspense>
        <Analytics />
      </ErrorBoundary>
    </Router>
  );
};

export default App;
