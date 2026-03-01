import React, { useEffect } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { Loader2 } from 'lucide-react';
import { getUser } from '../services/authApi';

const GoogleCallbackPage = () => {
    const navigate = useNavigate();
    const [searchParams] = useSearchParams();
    const token = searchParams.get('token');

    useEffect(() => {
        const handleAuth = async () => {
            if (token) {
                try {
                    // Store token
                    localStorage.setItem('auth_token', token);

                    // Fetch full user data to get roles/assignments
                    const response = await getUser();
                    const user = response.data;

                    if (user) {
                        // Determine Role (Mirroring LoginPage logic)
                        let role = 'User';
                        const assignments = user?.person?.assignments || [];
                        const activeAssignment = assignments.find(a => a.status === 'Aktif' || a.status === 'aktif');

                        if (activeAssignment) {
                            const jabatan = activeAssignment.jabatan || '';
                            const permissions = activeAssignment.role?.permissions || [];

                            if (jabatan.includes('Bendahara')) role = 'Admin Keuangan';
                            else if (jabatan.includes('RT')) role = 'User RT';
                            else if (jabatan === 'Ketua Umum') role = 'Super Admin';

                            localStorage.setItem('app_user', JSON.stringify({
                                ...user,
                                permissions: permissions
                            }));
                        } else if (user?.email === 'admin@baitulmall.com' || user?.email === 'admin@baitulmal.com') {
                            role = 'Super Admin';
                            localStorage.setItem('app_user', JSON.stringify(user));
                        } else {
                            localStorage.setItem('app_user', JSON.stringify(user));
                        }

                        localStorage.setItem('app_role', role);
                        localStorage.setItem('user', JSON.stringify(user));

                        navigate('/dashboard');
                    } else {
                        navigate('/login?error=user_not_found');
                    }
                } catch (err) {
                    console.error('Google callback error:', err);
                    navigate('/login?error=callback_failed');
                }
            } else {
                navigate('/login?error=no_token');
            }
        };

        handleAuth();
    }, [token, navigate]);

    return (
        <div className="min-h-screen bg-slate-900 flex flex-col items-center justify-center text-white gap-4">
            <Loader2 className="animate-spin text-blue-500" size={48} />
            <div className="text-center">
                <h1 className="text-xl font-bold">Menyelesaikan Autentikasi...</h1>
                <p className="text-slate-400">Mohon tunggu sebentar.</p>
            </div>
        </div>
    );
};

export default GoogleCallbackPage;
