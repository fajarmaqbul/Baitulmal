import { useState, useEffect } from 'react';
import api from '../services/api';

export const useSignatureRule = (page, category = 'ALL', rt = 'ALL') => {
    const [leftSigner, setLeftSigner] = useState(null);
    const [rightSigner, setRightSigner] = useState(null);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const fetchRule = async () => {
            setLoading(true);
            try {
                // Determine effective params (handle dynamic props effectively)
                // If page/category/rt changes significantly we refetch

                const response = await api.post('/resolve-signature', {
                    page,
                    category,
                    rt,
                    _t: Date.now() // Force fresh request
                });

                if (response.data.success && response.data.data) {
                    setLeftSigner(response.data.data.left);
                    setRightSigner(response.data.data.right);
                } else {
                    setLeftSigner(null);
                    setRightSigner(null);
                }
            } catch (err) {
                console.error("Failed to resolve signature", err);
                setLeftSigner(null);
                setRightSigner(null);
            } finally {
                setLoading(false);
            }
        };

        if (page) {
            fetchRule();
        }
    }, [page, category, rt]);

    return { leftSigner, rightSigner, loading };
};
