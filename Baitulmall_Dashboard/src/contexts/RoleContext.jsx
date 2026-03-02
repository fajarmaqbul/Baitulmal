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
    'Riwayat Pesan': 'view_dashboard',
    'Pengaturan': 'manage_settings',
    'Manajemen Produk': 'manage_products',
    'Etalase UMKM': 'view_etalase',
    'Portal Publik': 'view_public',
    'Sekretariat': 'manage_correspondence',
    'Input Muzaki': 'manage_muzaki',
    'Hapus Muzaki': 'delete_muzaki',
    'Atur Kalkulasi': 'edit_zakat_config',
    'Manajemen Role': 'manage_roles',
    'manage_roles': 'manage_roles'
};

export const RoleProvider = ({ children }) => {
    // Current role name (legacy)
    const [currentRole, setCurrentRole] = useState(() => {
        return localStorage.getItem('app_role') || ROLES.USER_RT;
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
    };

    // Permission Logic
    const hasPermission = (permIdOrLegacyName) => {
        if (!permIdOrLegacyName) return false;

        // 1. Super Admin/Email Bypass always excelsior
        const isSuperAdminState = currentRole === ROLES.SUPER_ADMIN;
        const isBypassEmail = [
            'admin@baitulmall.com',
            'admin@baitulmal.com',
            'masyazid@baitulmall.com',
            'fani@baitulmall.com',
            'pandu@baitulmall.com'
        ].includes((userData?.email || '').toLowerCase().trim());

        if (isSuperAdminState || isBypassEmail) {
            return true;
        }

        // 2. Resolve Perm ID if legacy name is passed
        const actualPermId = PERMISSION_MAP[permIdOrLegacyName] || permIdOrLegacyName;

        // 3. Check Dynamic Permissions from Role
        // Normalize everything to lowercase for robust matching
        const permissions = (userData?.permissions || []).map(p => String(p).toLowerCase());
        const targetPermId = String(actualPermId).toLowerCase();

        if (permissions.includes(targetPermId)) return true;

        // 4. Legacy Hardcoded Fallback for old roles
        // IMPORTANT: Only trigger if the user has NO dynamic permissions defined at all (null/undefined)
        // If they have an empty array [], it means they explicitly have 0 permissions.
        if (userData?.permissions && Array.isArray(userData.permissions)) {
            return false;
        }

        const normalizedRole = (currentRole || '').toLowerCase();
        const searchPerm = (permIdOrLegacyName || '').toLowerCase();

        // ONLY keep User RT fallback as it's a very simple role
        if (normalizedRole === ROLES.USER_RT.toLowerCase()) {
            const allowed = ['Sedekah', 'Dashboard', 'manage_sedekah', 'view_dashboard'].map(a => a.toLowerCase());
            if (allowed.includes(searchPerm)) return true;
        }

        return false;
    };

    const deriveUserAccess = (user) => {
        const bypassEmails = [
            'admin@baitulmall.com',
            'admin@baitulmal.com',
            'masyazid@baitulmall.com',
            'fani@baitulmall.com',
            'pandu@baitulmall.com'
        ];

        const userEmail = (user?.email || '').toLowerCase().trim();
        const assignments = user.person?.assignments || [];
        const activeAssignment = assignments.find(a => a.status === 'Aktif' || a.status === 'aktif');

        let role = 'User';
        let perms = activeAssignment?.role?.permissions || [];

        // 1. Direct Email Bypass for Developers/Super Admins
        if (bypassEmails.includes(userEmail)) {
            role = ROLES.SUPER_ADMIN;
        }
        // 2. Structured Role Assignment
        else if (activeAssignment) {
            const jabatan = activeAssignment.jabatan || '';
            const roleName = activeAssignment.role?.name || '';

            // Check by Title OR Role Name
            if (jabatan === 'Bendahara Umum' || jabatan === 'Ketua Umum' || jabatan === 'Super Admin' || roleName === ROLES.SUPER_ADMIN) {
                role = ROLES.SUPER_ADMIN;
            } else if (jabatan === 'Admin Keuangan' || jabatan.includes('Bendahara') || roleName === ROLES.ADMIN_KEUANGAN) {
                role = ROLES.ADMIN_KEUANGAN;
            } else if (jabatan === 'User RT' || jabatan.includes('RT') || roleName === ROLES.USER_RT) {
                role = ROLES.USER_RT;
            } else if (jabatan === 'Admin Zakat' || roleName === ROLES.ADMIN_ZAKAT) {
                role = ROLES.ADMIN_ZAKAT;
            } else {
                role = roleName || 'User';
            }
        }

        return { role, perms };
    };

    const refreshUser = async () => {
        try {
            const { getUser } = await import('../../services/authApi');
            const res = await getUser();
            if (res.success && res.data) {
                const { role, perms } = deriveUserAccess(res.data);
                const updatedUser = { ...res.data, permissions: perms };

                // Update Storage only if changed to avoid unnecessary re-renders
                if (role !== currentRole || JSON.stringify(perms) !== JSON.stringify(userData?.permissions)) {
                    setUserData(updatedUser);
                    setCurrentRole(role);
                    localStorage.setItem('app_role', role);
                    localStorage.setItem('app_user', JSON.stringify(updatedUser));
                }
                return updatedUser;
            }
        } catch (error) {
            console.error('Failed to refresh user role/perms:', error);
        }
    };

    return (
        <RoleContext.Provider value={{ currentRole, userData, setRole, hasPermission, refreshUser, ROLES }}>
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
