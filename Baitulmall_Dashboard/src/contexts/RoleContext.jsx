import React, { createContext, useContext, useState, useEffect } from 'react';

// Define Role Constants
export const ROLES = {
    SUPER_ADMIN: 'Super Admin',
    ADMIN_KEUANGAN: 'Admin Keuangan',
    USER_RT: 'User RT'
};

const RoleContext = createContext();

export const RoleProvider = ({ children }) => {
    // Initialize from localStorage or default to Super Admin
    const [currentRole, setCurrentRole] = useState(() => {
        return localStorage.getItem('app_role') || ROLES.SUPER_ADMIN;
    });

    const setRole = (role) => {
        setCurrentRole(role);
        localStorage.setItem('app_role', role);
        // Force reload to ensure all components re-render cleanly with new permissions
        window.location.reload();
    };

    // Permission Logic
    const hasPermission = (menuName) => {
        if (currentRole === ROLES.SUPER_ADMIN) return true;

        if (currentRole === ROLES.ADMIN_KEUANGAN) {
            const allowed = [
                'Dashboard',
                'Donasi Tematik',
                'Zakat Fitrah',
                'Zakat Mal',
                'Sedekah',
                'Santunan',
                'Data Asnaf',
                'Riwayat Pesan' // Assuming finance needs to see notifications related to payments
            ];
            return allowed.includes(menuName);
        }

        if (currentRole === ROLES.USER_RT) {
            const allowed = [
                'Sedekah',
                'Dashboard' // Partially allowed, maybe restrict content inside dashboard later
            ];
            return allowed.includes(menuName);
        }

        return false;
    };

    return (
        <RoleContext.Provider value={{ currentRole, setRole, hasPermission, ROLES }}>
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
