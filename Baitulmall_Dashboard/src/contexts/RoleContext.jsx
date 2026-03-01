import React, { createContext, useContext, useState, useEffect } from 'react';

// Define Role Constants
export const ROLES = {
    SUPER_ADMIN: 'Super Admin',
    ADMIN_KEUANGAN: 'Admin Keuangan',
    ADMIN_ZAKAT: 'Admin Zakat',
    USER_RT: 'User RT'
};

const RoleContext = createContext();

// Legacy string to Perm ID mapping for backward compatibility
const PERMISSION_MAP = {
    'Dashboard': 'view_dashboard',
    'Zakat Fitrah': 'manage_zakat_fitrah',
    'Zakat Mal': 'manage_zakat_mall',
    'Zakat Produktif': 'manage_zakat_produktif',
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
        const permissions = (userData?.permissions || []).map(p => p.toLowerCase());
        const targetPermId = actualPermId.toLowerCase();
        if (permissions.includes(targetPermId)) return true;

        // 4. Legacy Hardcoded Fallback for old roles or name mismatches
        const normalizedRole = (currentRole || '').toLowerCase();
        const searchPerm = (permIdOrLegacyName || '').toLowerCase();

        if (normalizedRole === ROLES.ADMIN_KEUANGAN.toLowerCase() ||
            normalizedRole === ROLES.ADMIN_ZAKAT.toLowerCase() ||
            normalizedRole === 'admin zakat') {
            const allowed = [
                'Dashboard', 'Donasi Tematik', 'Zakat Fitrah', 'Zakat Mal',
                'Zakat Produktif', 'Sedekah', 'Santunan', 'Data Asnaf',
                'manage_zakat_fitrah', 'manage_zakat_mall', 'manage_zakat_produktif',
                'manage_sedekah', 'manage_santunan', 'manage_campaigns', 'manage_asnaf',
                'manage_muzaki', 'delete_muzaki', 'edit_zakat_config', 'confirm_distribution',
                'view_dashboard'
            ].map(a => a.toLowerCase());

            if (allowed.includes(searchPerm)) return true;
        }

        if (normalizedRole === ROLES.USER_RT.toLowerCase()) {
            const allowed = ['Sedekah', 'Dashboard', 'manage_sedekah', 'view_dashboard'].map(a => a.toLowerCase());
            if (allowed.includes(searchPerm)) return true;
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
