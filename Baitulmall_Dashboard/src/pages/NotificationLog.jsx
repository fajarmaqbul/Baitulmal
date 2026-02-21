import React, { useState, useEffect } from 'react';
import { fetchNotificationLogs } from '../services/notificationApi';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '../components/ui/card';
import { Badge } from '../components/ui/badge';
import { MessageSquare, RefreshCw, CheckCircle, XCircle, Clock } from 'lucide-react';
import { format } from 'date-fns';
import { id as idLocale } from 'date-fns/locale';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter } from '../components/ui/dialog';
import { Button } from '../components/ui/button';

const NotificationLog = () => {
    const [logs, setLogs] = useState([]);
    const [loading, setLoading] = useState(true);
    const [pagination, setPagination] = useState({});
    const [filters, setFilters] = useState({
        search: '',
        status: 'all',
        page: 1
    });
    const [selectedLog, setSelectedLog] = useState(null);

    // Debounce search term
    const [debouncedSearch, setDebouncedSearch] = useState('');

    useEffect(() => {
        const timer = setTimeout(() => {
            setDebouncedSearch(filters.search);
        }, 500);
        return () => clearTimeout(timer);
    }, [filters.search]);

    // Reset page when filters change
    useEffect(() => {
        setFilters(prev => ({ ...prev, page: 1 }));
    }, [debouncedSearch, filters.status]);

    const loadData = async () => {
        setLoading(true);
        try {
            const params = {
                page: filters.page,
                search: debouncedSearch,
                status: filters.status !== 'all' ? filters.status : undefined
            };

            const data = await fetchNotificationLogs(params);
            setLogs(data.data || []);
            setPagination({
                current_page: data.current_page,
                last_page: data.last_page,
                total: data.total,
                from: data.from,
                to: data.to
            });
        } catch (error) {
            console.error("Failed to fetch logs", error);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        loadData();
    }, [filters.page, debouncedSearch, filters.status]); // Trigger load on these changes

    const handleSearchChange = (e) => {
        setFilters(prev => ({ ...prev, search: e.target.value }));
    };

    const handleStatusChange = (e) => {
        setFilters(prev => ({ ...prev, status: e.target.value }));
    };

    const handlePageChange = (newPage) => {
        if (newPage >= 1 && newPage <= pagination.last_page) {
            setFilters(prev => ({ ...prev, page: newPage }));
        }
    };

    const getStatusBadge = (status) => {
        switch (status) {
            case 'sent':
                return <Badge variant="default" className="bg-green-500 hover:bg-green-600"><CheckCircle size={12} className="mr-1" /> Terkirim</Badge>;
            case 'failed':
                return <Badge variant="destructive"><XCircle size={12} className="mr-1" /> Gagal</Badge>;
            default:
                return <Badge variant="secondary"><Clock size={12} className="mr-1" /> Pending</Badge>;
        }
    };

    return (
        <div className="space-y-6 p-6 animate-fade-in">
            <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
                <div>
                    <h2 className="text-3xl font-extrabold text-[var(--text-main)] flex items-center gap-3">
                        <MessageSquare className="text-green-500" size={32} />
                        Riwayat Notifikasi
                    </h2>
                    <p className="text-muted">Log pengiriman pesan WhatsApp otomatis</p>
                </div>
                <button onClick={loadData} className="p-2 rounded-full hover:bg-[var(--border-color)] transition-colors self-end md:self-auto" title="Muat Ulang">
                    <RefreshCw size={20} className={loading ? "animate-spin text-blue-500" : "text-muted"} />
                </button>
            </div>

            <Card className="glass-card border-0">
                <CardHeader className="pb-2">
                    <div className="flex flex-col md:flex-row justify-between items-center gap-4">
                        <div>
                            <CardTitle className="text-[var(--text-main)]">Log Pesan Keluar</CardTitle>
                            <CardDescription className="text-muted">
                                Menampilkan {pagination.from || 0} - {pagination.to || 0} dari total {pagination.total || 0} pesan
                            </CardDescription>
                        </div>

                        <div className="flex flex-col sm:flex-row gap-3 w-full md:w-auto">
                            <div className="relative">
                                <input
                                    type="text"
                                    placeholder="Cari penerima atau pesan..."
                                    className="pl-3 pr-10 py-2 bg-[var(--background)] border border-[var(--border-color)] rounded-md text-sm text-[var(--text-main)] focus:outline-none focus:ring-1 focus:ring-green-500 w-full sm:w-64"
                                    value={filters.search}
                                    onChange={handleSearchChange}
                                />
                                {filters.search && (
                                    <button
                                        onClick={() => setFilters(prev => ({ ...prev, search: '' }))}
                                        className="absolute right-3 top-2.5 text-muted hover:text-[var(--text-main)]"
                                    >
                                        <XCircle size={16} />
                                    </button>
                                )}
                            </div>

                            <select
                                className="px-3 py-2 bg-[var(--background)] border border-[var(--border-color)] rounded-md text-sm text-[var(--text-main)] focus:outline-none focus:ring-1 focus:ring-green-500"
                                value={filters.status}
                                onChange={handleStatusChange}
                            >
                                <option value="all">Semua Status</option>
                                <option value="sent">Terkirim</option>
                                <option value="failed">Gagal</option>
                                <option value="pending">Pending</option>
                            </select>
                        </div>
                    </div>
                </CardHeader>
                <CardContent>
                    <div className="table-container mb-4">
                        <table className="table-modern w-full text-sm">
                            <thead>
                                <tr className="border-b border-[var(--border-color)] bg-[var(--background)]">
                                    <th className="h-10 px-4 text-left align-middle font-medium text-muted">Waktu</th>
                                    <th className="h-10 px-4 text-left align-middle font-medium text-muted">Penerima</th>
                                    <th className="h-10 px-4 text-left align-middle font-medium text-muted w-[50%]">Pesan</th>
                                    <th className="h-10 px-4 text-center align-middle font-medium text-muted">Status</th>
                                </tr>
                            </thead>
                            <tbody>
                                {loading ? (
                                    <tr><td colSpan="4" className="p-8 text-center text-muted">
                                        <div className="flex justify-center items-center gap-2">
                                            <RefreshCw className="animate-spin" size={16} /> Memuat data...
                                        </div>
                                    </td></tr>
                                ) : logs.length === 0 ? (
                                    <tr><td colSpan="4" className="p-8 text-center text-muted">
                                        Tidak ada data yang ditemukan.
                                    </td></tr>
                                ) : (
                                    logs.map((log) => (
                                        <tr key={log.id} className="border-b border-[var(--border-color)] hover:bg-[var(--border-color)]/20 transition-colors group">
                                            <td className="p-4 align-middle whitespace-nowrap text-muted">
                                                {format(new Date(log.created_at), 'dd MMM HH:mm', { locale: idLocale })}
                                            </td>
                                            <td className="p-4 align-middle font-medium text-[var(--text-main)]">
                                                {log.recipient_phone}
                                            </td>
                                            <td
                                                className="p-4 align-middle text-muted max-w-md truncate cursor-pointer hover:text-[var(--text-main)] transition-colors"
                                                title="Klik untuk melihat detail"
                                                onClick={() => setSelectedLog(log)}
                                            >
                                                {log.message}
                                            </td>
                                            <td className="p-4 align-middle text-center">
                                                {getStatusBadge(log.status)}
                                            </td>
                                        </tr>
                                    ))
                                )}
                            </tbody>
                        </table>
                    </div>

                    {/* Pagination */}
                    {pagination.last_page > 1 && (
                        <div className="flex justify-between items-center border-t border-[var(--border-color)] pt-4">
                            <span className="text-xs text-muted">
                                Halaman {pagination.current_page} dari {pagination.last_page}
                            </span>
                            <div className="flex gap-2">
                                <button
                                    onClick={() => handlePageChange(pagination.current_page - 1)}
                                    disabled={pagination.current_page === 1 || loading}
                                    className="px-3 py-1 text-xs rounded border border-[var(--border-color)] text-[var(--text-main)] hover:bg-[var(--border-color)] disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                                >
                                    Sebelumnya
                                </button>
                                <button
                                    onClick={() => handlePageChange(pagination.current_page + 1)}
                                    disabled={pagination.current_page === pagination.last_page || loading}
                                    className="px-3 py-1 text-xs rounded border border-[var(--border-color)] text-[var(--text-main)] hover:bg-[var(--border-color)] disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                                >
                                    Selanjutnya
                                </button>
                            </div>
                        </div>
                    )}
                </CardContent>
            </Card>

            {/* Detail Dialog */}
            <Dialog open={!!selectedLog} onOpenChange={(open) => !open && setSelectedLog(null)}>
                <DialogContent className="max-w-md">
                    <DialogHeader>
                        <DialogTitle>Detail Notifikasi</DialogTitle>
                        <DialogDescription>
                            Detail pesan yang dikirimkan.
                        </DialogDescription>
                    </DialogHeader>
                    {selectedLog && (
                        <div className="space-y-4">
                            <div className="grid grid-cols-3 gap-2 text-sm">
                                <span className="font-semibold text-muted">Penerima:</span>
                                <span className="col-span-2 text-[var(--text-main)]">{selectedLog.recipient_phone}</span>

                                <span className="font-semibold text-muted">Waktu:</span>
                                <span className="col-span-2 text-[var(--text-main)]">
                                    {format(new Date(selectedLog.created_at), 'dd MMMM yyyy, HH:mm', { locale: idLocale })}
                                </span>

                                <span className="font-semibold text-muted">Status:</span>
                                <span className="col-span-2">{getStatusBadge(selectedLog.status)}</span>
                            </div>

                            <div className="space-y-1">
                                <span className="text-sm font-semibold text-muted">Isi Pesan:</span>
                                <div className="p-3 bg-[var(--background)] border border-[var(--border-color)] rounded-md text-sm whitespace-pre-wrap text-[var(--text-main)] max-h-[300px] overflow-y-auto">
                                    {selectedLog.message}
                                </div>
                            </div>
                        </div>
                    )}
                    <DialogFooter>
                        <Button variant="outline" onClick={() => setSelectedLog(null)}>
                            Tutup
                        </Button>
                    </DialogFooter>
                </DialogContent>
            </Dialog>
        </div>
    );
};

export default NotificationLog;
