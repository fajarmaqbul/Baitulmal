import React, { useState, useMemo, useEffect } from 'react';
import { MapContainer, TileLayer, Marker, Popup, useMap } from 'react-leaflet';
import { fetchAsnafList } from '../services/asnafApi';
import AsnafChoroplethMap from '../components/Charts/AsnafChoroplethMap';
// Deprecated context removed
console.warn('Deprecated context detected in PetaAsnaf.jsx');
import { Map as MapIcon, MapPin, Users, Filter, Loader2, AlertCircle, BarChart3 } from 'lucide-react';
import L from 'leaflet';
import 'leaflet/dist/leaflet.css';

// Fix Leaflet icon issue in Vite
delete L.Icon.Default.prototype._getIconUrl;
L.Icon.Default.mergeOptions({
    iconRetinaUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon-2x.png',
    iconUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon.png',
    shadowUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-shadow.png',
});

const PetaAsnaf = () => {
    // Local state fallback (will be replaced with API calls)
    const [asnafData, setAsnafData] = React.useState([]);
    const [loading, setLoading] = React.useState(true);
    const [error, setError] = React.useState(null);
    const [usingFallback, setUsingFallback] = React.useState(false);

    // Fetch Asnaf data from API on mount (fallback to empty array on error)
    React.useEffect(() => {
        try {
            const loadData = async () => {
                const response = await fetchAsnafList({ per_page: 1000 });
                const transformed = response.data.map(asnaf => ({
                    id: asnaf.id,
                    rt: asnaf.rt.kode,
                    kategori: asnaf.kategori,
                    nama: asnaf.nama,
                    jumlahJiwa: asnaf.jumlah_jiwa,
                    tahun: asnaf.tahun,
                    latitude: asnaf.latitude,
                    longitude: asnaf.longitude
                }));
                setAsnafData(transformed);
                setUsingFallback(false);
            };
            loadData();
        } catch (err) {
            console.error('Failed to load Asnaf data:', err);
            setError(err?.message || 'Gagal memuat data Asnaf');
            setUsingFallback(true);
        } finally {
            setLoading(false);
        }
    }, []);








    // Filter States
    const [selectedRT, setSelectedRT] = useState('all');
    const [selectedKategori, setSelectedKategori] = useState([]);
    const [mapMode, setMapMode] = useState('leaflet'); // 'leaflet' or 'highcharts'






    // Generate coordinates for Asnaf without lat/lng
    const enrichedAsnafData = useMemo(() => {
        // Masjid Fajar Maqbul, Kandri, Gunungpati, Semarang
        const baseLat = -7.0594342;
        const baseLng = 110.358072;

        const rtOffsets = {
            '01': { lat: 0.005, lng: 0.005 },
            '02': { lat: 0.005, lng: -0.005 },
            '03': { lat: -0.005, lng: -0.005 },
            '04': { lat: -0.005, lng: 0.005 },
            '05': { lat: 0.008, lng: 0 },
            '06': { lat: 0, lng: 0.008 },
            '07': { lat: -0.008, lng: 0 }
        };

        return asnafData.map((asnaf, index) => {
            if (asnaf.latitude && asnaf.longitude) {
                return asnaf; // Already has coordinates
            }

            const offset = rtOffsets[asnaf.rt] || { lat: 0, lng: 0 };
            const scatter = (Math.sin(index) * 0.002); // Deterministic scatter based on index

            return {
                ...asnaf,
                latitude: baseLat + offset.lat + scatter,
                longitude: baseLng + offset.lng + (Math.cos(index) * 0.002)
            };
        });
    }, [asnafData]);

    // Filter data based on selected RT and category
    const filteredData = useMemo(() => {
        return enrichedAsnafData.filter(asnaf => {
            const rtMatch = selectedRT === 'all' || asnaf.rt === selectedRT;
            const kategoriMatch = selectedKategori.length === 0 || selectedKategori.includes(asnaf.kategori);
            return rtMatch && kategoriMatch;
        });
    }, [enrichedAsnafData, selectedRT, selectedKategori]);

    // Category colors
    const categoryColors = {
        'Fakir': '#ef4444',
        'Miskin': '#f97316',
        'Fisabilillah': '#a855f7',
        'Amil': '#22c55e'
    };

    // Create custom colored markers
    const createCustomIcon = (kategori) => {
        const color = categoryColors[kategori] || '#6b7280';
        const initial = kategori.charAt(0);

        return L.divIcon({
            className: 'custom-marker',
            html: `<div style="
                background-color: ${color};
                width: 32px;
                height: 32px;
                border-radius: 50%;
                border: 3px solid white;
                box-shadow: 0 2px 8px rgba(0,0,0,0.3);
                display: flex;
                align-items: center;
                justify-content: center;
                color: white;
                font-weight: bold;
                font-size: 14px;
            ">${initial}</div>`,
            iconSize: [32, 32],
            iconAnchor: [16, 16],
            popupAnchor: [0, -16]
        });
    };

    // Calculate stats
    const stats = useMemo(() => {
        const counts = {};
        enrichedAsnafData.forEach(asnaf => {
            counts[asnaf.kategori] = (counts[asnaf.kategori] || 0) + 1;
        });
        return counts;
    }, [enrichedAsnafData]);

    const handleKategoriToggle = (kategori) => {
        setSelectedKategori(prev =>
            prev.includes(kategori)
                ? prev.filter(k => k !== kategori)
                : [...prev, kategori]
        );
    };

    return (
        <div>
            {/* Loading State */}
            {loading && (
                <div className="glass-card" style={{ padding: '3rem', textAlign: 'center' }}>
                    <Loader2 size={48} style={{ color: 'var(--primary)', animation: 'spin 1s linear infinite', margin: '0 auto' }} />
                    <p style={{ marginTop: '1rem', color: 'var(--text-muted)' }}>Memuat data peta dari server...</p>
                </div>
            )}

            {/* Fallback Warning - Only show if using Context fallback */}
            {usingFallback && (
                <div className="glass-card" style={{ padding: '1rem', background: 'rgba(245, 158, 11, 0.1)', borderLeft: '4px solid #f59e0b', marginBottom: '1rem' }}>
                    <div style={{ display: 'flex', gap: '1rem', alignItems: 'center' }}>
                        <AlertCircle size={24} style={{ color: '#f59e0b' }} />
                        <div>
                            <h4 style={{ margin: '0 0 0.25rem 0', color: '#f59e0b', fontSize: '0.9rem', fontWeight: 600 }}>Mode Fallback Aktif</h4>
                            <p style={{ margin: 0, color: 'var(--text-muted)', fontSize: '0.875rem' }}>
                                {error} Data ditampilkan dari localStorage untuk keamanan development.
                            </p>
                        </div>
                    </div>
                </div>
            )}

            {/* Main Content - Show when data is loaded (API or fallback) */}
            {!loading && (
                <>
                    {/* Header */}
                    <header className="header">
                        <div>
                            <h1 style={{ fontSize: '2rem' }}>
                                <MapIcon size={32} style={{ display: 'inline', marginRight: '0.5rem', verticalAlign: 'middle' }} />
                                Peta Sebaran Asnaf
                            </h1>
                            <p style={{ color: 'var(--text-muted)' }}>
                                Visualisasi lokasi penerima zakat di <strong>Desa Kandri, Gunungpati, Semarang</strong> berdasarkan kategori dan RT untuk distribusi yang tepat sasaran.
                            </p>
                        </div>
                    </header>

                    {/* Stats Cards */}
                    <div className="stats-grid" style={{ marginBottom: '1.5rem' }}>
                        {Object.entries(categoryColors).map(([kategori, color]) => (
                            <div key={kategori} className="glass-card stat-card" style={{ borderLeft: `4px solid ${color}` }}>
                                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                                    <div>
                                        <p className="stat-label" style={{ color }}>{kategori}</p>
                                        <h3 style={{ fontSize: '1.75rem', margin: '0.25rem 0' }}>
                                            {stats[kategori] || 0}
                                        </h3>
                                        <p style={{ fontSize: '0.875rem', color: 'var(--text-muted)' }}>
                                            {enrichedAsnafData
                                                .filter(a => a.kategori === kategori)
                                                .reduce((sum, a) => sum + a.jumlahJiwa, 0)} jiwa
                                        </p>
                                    </div>
                                    <MapPin size={32} style={{ color, opacity: 0.3 }} />
                                </div>
                            </div>
                        ))}
                    </div>

                    {/* Filters */}
                    <div className="glass-card" style={{ marginBottom: '1.5rem', padding: '1rem' }}>
                        <div style={{ display: 'flex', gap: '1rem', flexWrap: 'wrap', alignItems: 'center' }}>
                            <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                                <Filter size={18} style={{ color: 'var(--text-muted)' }} />
                                <span style={{ fontWeight: 600 }}>Filter:</span>
                            </div>

                            {/* RT Filter */}
                            <select
                                className="input"
                                value={selectedRT}
                                onChange={(e) => setSelectedRT(e.target.value)}
                                style={{ width: 'auto', minWidth: '120px' }}
                            >
                                <option value="all">Semua RT</option>
                                {['01', '02', '03', '04', '05', '06', '07'].map(rt => (
                                    <option key={rt} value={rt}>RT {rt}</option>
                                ))}
                            </select>

                            {/* Category Filter */}
                            <div style={{ display: 'flex', gap: '0.5rem', flexWrap: 'wrap' }}>
                                {Object.entries(categoryColors).map(([kategori, color]) => (
                                    <button
                                        key={kategori}
                                        onClick={() => handleKategoriToggle(kategori)}
                                        className="btn btn-ghost"
                                        style={{
                                            padding: '0.5rem 1rem',
                                            background: selectedKategori.includes(kategori) ? color : 'rgba(255,255,255,0.05)',
                                            color: selectedKategori.includes(kategori) ? 'white' : 'var(--text-main)',
                                            border: `2px solid ${color}`,
                                            fontWeight: selectedKategori.includes(kategori) ? 600 : 400
                                        }}
                                    >
                                        {kategori}
                                    </button>
                                ))}
                            </div>

                            {selectedKategori.length > 0 && (
                                <button
                                    onClick={() => setSelectedKategori([])}
                                    className="btn btn-ghost"
                                    style={{ marginLeft: 'auto' }}
                                >
                                    Reset Filter
                                </button>
                            )}
                        </div>
                    </div>

                    {/* Map Mode Toggle */}
                    <div className="glass-card" style={{ marginBottom: '1rem', padding: '0.75rem' }}>
                        <div style={{ display: 'flex', gap: '0.5rem', alignItems: 'center' }}>
                            <span style={{ fontWeight: 600, marginRight: '0.5rem' }}>Mode Tampilan:</span>
                            <button
                                onClick={() => setMapMode('leaflet')}
                                className={`btn ${mapMode === 'leaflet' ? 'btn-primary' : 'btn-ghost'}`}
                                style={{ padding: '0.5rem 1rem', display: 'flex', alignItems: 'center', gap: '0.5rem' }}
                            >
                                <MapPin size={16} /> Peta Marker (Leaflet)
                            </button>
                            <button
                                onClick={() => setMapMode('highcharts')}
                                className={`btn ${mapMode === 'highcharts' ? 'btn-primary' : 'btn-ghost'}`}
                                style={{ padding: '0.5rem 1rem', display: 'flex', alignItems: 'center', gap: '0.5rem' }}
                            >
                                <BarChart3 size={16} /> Peta Choropleth (Highcharts)
                            </button>
                        </div>
                    </div>

                    {/* Highcharts Map */}
                    {mapMode === 'highcharts' && (
                        <div className="glass-card" style={{ padding: '1.5rem' }}>
                            <AsnafChoroplethMap
                                asnafData={enrichedAsnafData}
                                filterKategori={selectedKategori.length > 0 ? selectedKategori : ['Fakir', 'Miskin']}
                            />
                        </div>
                    )}

                    {/* Leaflet Map */}
                    {mapMode === 'leaflet' && (
                        <div className="glass-card">
                            <div style={{
                                height: '600px',
                                borderRadius: '12px',
                                overflow: 'hidden',
                                border: '1px solid rgba(255,255,255,0.1)'
                            }}>
                                <MapContainer
                                    center={[-7.0594342, 110.358072]}
                                    zoom={15}
                                    style={{ height: '100%', width: '100%' }}
                                    scrollWheelZoom={true}
                                >
                                    <TileLayer
                                        attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
                                        url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
                                    />

                                    <Marker
                                        position={[-7.0594342, 110.358072]}
                                        icon={L.divIcon({
                                            className: 'custom-marker',
                                            html: `<div style="
                                    background-color: #3b82f6;
                                    width: 40px;
                                    height: 40px;
                                    border-radius: 50%;
                                    border: 4px solid white;
                                    box-shadow: 0 3px 10px rgba(0,0,0,0.4);
                                    display: flex;
                                    align-items: center;
                                    justify-content: center;
                                    color: white;
                                    font-weight: bold;
                                    font-size: 18px;
                                ">🕌</div>`,
                                            iconSize: [40, 40],
                                            iconAnchor: [20, 20],
                                            popupAnchor: [0, -20]
                                        })}
                                    >
                                        <Popup>
                                            <div style={{ minWidth: '220px' }}>
                                                <h4 style={{ margin: '0 0 0.5rem 0', fontSize: '1.1rem', fontWeight: 700, color: '#3b82f6' }}>
                                                    🕌 Desa Kandri
                                                </h4>
                                                <div style={{ fontSize: '0.875rem', lineHeight: '1.6', color: '#64748b' }}>
                                                    <p style={{ margin: '0.25rem 0' }}><strong>Kecamatan:</strong> Gunungpati</p>
                                                    <p style={{ margin: '0.25rem 0' }}><strong>Kota:</strong> Semarang</p>
                                                    <p style={{ margin: '0.25rem 0' }}><strong>RW:</strong> 01</p>
                                                    <p style={{ margin: '0.25rem 0', fontSize: '0.75rem', color: '#94a3b8' }}>
                                                        Pusat Wilayah Masjid
                                                    </p>
                                                </div>
                                            </div>
                                        </Popup>
                                    </Marker>

                                    {/* Asnaf Markers */}  {filteredData.map(asnaf => (
                                        <Marker
                                            key={asnaf.id}
                                            position={[asnaf.latitude, asnaf.longitude]}
                                            icon={createCustomIcon(asnaf.kategori)}
                                        >
                                            <Popup>
                                                <div style={{ minWidth: '200px' }}>
                                                    <h4 style={{ margin: '0 0 0.5rem 0', fontSize: '1rem', fontWeight: 600 }}>
                                                        📍 {asnaf.nama}
                                                    </h4>
                                                    <div style={{ fontSize: '0.875rem', lineHeight: '1.6' }}>
                                                        <p style={{ margin: '0.25rem 0' }}>
                                                            <strong>Kategori:</strong>
                                                            <span style={{
                                                                marginLeft: '0.5rem',
                                                                padding: '2px 8px',
                                                                borderRadius: '12px',
                                                                background: categoryColors[asnaf.kategori],
                                                                color: 'white',
                                                                fontSize: '0.75rem',
                                                                fontWeight: 600
                                                            }}>
                                                                {asnaf.kategori}
                                                            </span>
                                                        </p>
                                                        <p style={{ margin: '0.25rem 0' }}><strong>RT:</strong> {asnaf.rt}</p>
                                                        <p style={{ margin: '0.25rem 0' }}><strong>Jumlah Jiwa:</strong> {asnaf.jumlahJiwa} jiwa</p>
                                                    </div>
                                                </div>
                                            </Popup>
                                        </Marker>
                                    ))}
                                </MapContainer>
                            </div>

                            <div style={{ marginTop: '1rem', padding: '0.75rem', background: 'rgba(255,255,255,0.03)', borderRadius: '8px' }}>
                                <p style={{ fontSize: '0.875rem', color: 'var(--text-muted)', margin: 0 }}>
                                    <Users size={16} style={{ display: 'inline', verticalAlign: 'middle', marginRight: '0.5rem' }} />
                                    Menampilkan <strong>{filteredData.length}</strong> dari <strong>{enrichedAsnafData.length}</strong> penerima zakat
                                    {selectedRT !== 'all' && ` di RT ${selectedRT}`}
                                    {selectedKategori.length > 0 && ` (${selectedKategori.join(', ')})`}
                                </p>
                            </div>
                        </div>
                    )}
                </>
            )}
        </div>
    );
};

export default PetaAsnaf;
