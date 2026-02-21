import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
// Import CSS AdminLTE & Bootstrap
import 'admin-lte/dist/css/adminlte.min.css';
import 'admin-lte/dist/js/adminlte.min.js'; // Import JS AdminLTE
// import 'bootstrap/dist/js/bootstrap.bundle.min.js'; // Kadang diperlukan jika adminlte js tidak mencakup semua fitur bootstrap

import './index.css';
import App from './App.jsx'


import { RoleProvider } from './contexts/RoleContext';

createRoot(document.getElementById('root')).render(
  <StrictMode>
    <RoleProvider>
      <App />
    </RoleProvider>
  </StrictMode>,
)
