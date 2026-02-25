import React, { createContext, useContext, useState, useEffect } from 'react';

// Define Role Constants
export const ROLES = {
    SUPER_ADMIN: 'Super Admin',
    ADMIN_KEUANGAN: 'Admin Keuangan',
    USER_RT: 'User RT'
};

const RoleContext = createContext();

// Legacy string to Perm ID mapping for backward compatibility
const PERMISSION_MAP = {
    'Dashboard': 'view_dashboard',
    'Zakat Fitrah': 'manage_zakat_fitrah',
    'Zakat Mal': 'manage_zakat_mall',
    'Sedekah': 'manage_sedekah',
    'Santunan': 'manage_santunan',
    'Donasi Tematik': 'manage_campaigns',
    'Kepengurusan': 'view_kepengurusan',
    'Data Asnaf': 'manage_asnaf',
    'Event & Panitia': 'manage_assignments',
    'Inventaris Aset': 'manage_inventory',
    'Riwayat Pesan': 'view_dashboard', // Fallback to dashboard for notifications
    'Pengaturan': 'manage_settings'
};

export const RoleProvider = ({ children }) => {
    // Current role name (legacy)
    const [currentRole, setCurrentRole] = useState(() => {
        return localStorage.getItem('app_role') || ROLES.SUPER_ADMIN;
    });

    // Detailed User Data (including dynamic permissions)
    const [userData, setUserData] = useState(() => {
        try {
            return JSON.parse(localStorage.getItem('app_user')) || null;
        } catch {
            return null;
        }
    });

    const setRole = (role, user = null) => {
        setCurrentRole(role);
        localStorage.setItem('app_role', role);
        if (user) {
            setUserData(user);
            localStorage.setItem('app_user', JSON.stringify(user));
        }
        // Force reload to ensure all components re-render cleanly
        window.location.reload();
    };

    // Permission Logic
    const hasPermission = (permIdOrLegacyName) => {
        // 1. Super Admin always excelsior
        if (currentRole === ROLES.SUPER_ADMIN ||
            userData?.email === 'admin@baitulmall.com' ||
            userData?.email === 'admin@baitulmal.com' ||
            userData?.email === 'fajarmaqbulkandri@gmail.com') {
            return true;
        }

        // 2. Resolve Perm ID if legacy name is passed
        const actualPermId = PERMISSION_MAP[permIdOrLegacyName] || permIdOrLegacyName;

        // 3. Check Dynamic Permissions from Role
        // Assuming user.person.assignments[0].role.permissions (if joined)
        // Or we rely on what LoginPage stores.
        const permissions = userData?.permissions || [];
        if (permissions.includes(actualPermId)) return true;

        // 4. Legacy Hardcoded Fallback for old roles
        if (currentRole === ROLES.ADMIN_KEUANGAN) {
            const allowed = ['Dashboard', 'Donasi Tematik', 'Zakat Fitrah', 'Zakat Mal', 'Sedekah', 'Santunan', 'Data Asnaf'];
            if (allowed.includes(permIdOrLegacyName)) return true;
        }

        if (currentRole === ROLES.USER_RT) {
            const allowed = ['Sedekah', 'Dashboard'];
            if (allowed.includes(permIdOrLegacyName)) return true;
        }

        return false;
    };

    return (
        <RoleContext.Provider value={{ currentRole, userData, setRole, hasPermission, ROLES }}>
            {children}
        </RoleContext.Provider>
    );
};

export const useRole = () => {
    const context = useContext(RoleContext);
    if (!context) {
        throw new Error('useRole must be used within a RoleProvider');
    }
    return context;
};
