import React, { useMemo } from 'react';
import Highcharts from 'highcharts';
import HighchartsReact from 'highcharts-react-official';

// Import modules with default export check
import heatmapInit from 'highcharts/modules/heatmap';
import tilemapInit from 'highcharts/modules/tilemap';
import mapInit from 'highcharts/modules/map';

// Initialize Highcharts modules only once (handle both CJS and ESM)
const heatmap = typeof heatmapInit === 'function' ? heatmapInit : (heatmapInit?.default || (() => { }));
const tilemap = typeof tilemapInit === 'function' ? tilemapInit : (tilemapInit?.default || (() => { }));
const mapModule = typeof mapInit === 'function' ? mapInit : (mapInit?.default || (() => { }));

if (typeof Highcharts === 'object') {
    heatmap(Highcharts);
    tilemap(Highcharts);
    mapModule(Highcharts);
}

/**
 * AsnafChoroplethMap Component - Blue Theme with Region Statistics
 * Similar to AdminLTE visitor map widget
 */
const AsnafChoroplethMap = ({ asnafData = [], filterKategori = ['Fakir', 'Miskin'] }) => {

    // Aggregate data by RT
    const aggregatedData = useMemo(() => {
        const rtStats = {};

        ['01', '02', '03', '04', '05', '06', '07'].forEach(rt => {
            rtStats[rt] = { rt, totalKK: 0, totalJiwa: 0, fakir: 0, miskin: 0 };
        });

        asnafData.forEach(asnaf => {
            const rt = asnaf.rt;
            if (!rtStats[rt]) {
                rtStats[rt] = { rt, totalKK: 0, totalJiwa: 0, fakir: 0, miskin: 0 };
            }

            if (filterKategori.includes(asnaf.kategori)) {
                rtStats[rt].totalKK += 1;
                rtStats[rt].totalJiwa += Number(asnaf.jumlahJiwa || 0);

                if (asnaf.kategori === 'Fakir') rtStats[rt].fakir += 1;
                if (asnaf.kategori === 'Miskin') rtStats[rt].miskin += 1;
            }
        });

        return Object.values(rtStats);
    }, [asnafData, filterKategori]);

    // Prepare tilemap series data
    const tilemapData = useMemo(() => {
        const positions = {
            '01': { x: 1, y: 0 },
            '02': { x: 2, y: 0 },
            '03': { x: 0, y: 1 },
            '04': { x: 1, y: 1 },
            '05': { x: 2, y: 1 },
            '06': { x: 0, y: 2 },
            '07': { x: 1, y: 2 }
        };

        return aggregatedData.map(rtData => ({
            'hc-key': rtData.rt,
            name: `RT ${rtData.rt}`,
            x: positions[rtData.rt]?.x || 0,
            y: positions[rtData.rt]?.y || 0,
            value: rtData.totalKK,
            totalJiwa: rtData.totalJiwa,
            fakir: rtData.fakir,
            miskin: rtData.miskin
        }));
    }, [aggregatedData]);

    // Highcharts configuration - Blue Theme
    const chartOptions = {
        chart: {
            type: 'tilemap',
            backgroundColor: '#2196F3',
            height: 350,
            marginTop: 20,
            marginBottom: 20
        },

        title: {
            text: 'Sebaran Asnaf per RT',
            style: { color: '#fff', fontWeight: 700, fontSize: '16px' }
        },

        subtitle: {
            text: 'Desa Kandri, Gunungpati',
            style: { color: 'rgba(255,255,255,0.7)', fontSize: '12px' }
        },

        xAxis: { visible: false },
        yAxis: { visible: false },

        colorAxis: {
            min: 0,
            minColor: '#90CAF9',
            maxColor: '#1565C0',
            labels: { style: { color: '#fff' } }
        },

        tooltip: {
            useHTML: true,
            headerFormat: '',
            pointFormat: `
                <div style="padding: 10px; background: #1976D2; color: #fff; border-radius: 8px; min-width: 150px;">
                    <strong style="font-size: 14px;">{point.name}</strong>
                    <hr style="margin: 6px 0; border: 0; border-top: 1px solid rgba(255,255,255,0.3);"/>
                    <div style="display: grid; grid-template-columns: 1fr 1fr; gap: 4px; font-size: 12px;">
                        <span>Total KK:</span><span style="font-weight:700;">{point.value}</span>
                        <span>Total Jiwa:</span><span style="font-weight:700;">{point.totalJiwa}</span>
                        <span style="color:#ffcdd2;">Fakir:</span><span style="font-weight:700;">{point.fakir}</span>
                        <span style="color:#ffe0b2;">Miskin:</span><span style="font-weight:700;">{point.miskin}</span>
                    </div>
                </div>
            `
        },

        legend: { enabled: false },

        plotOptions: {
            tilemap: {
                tileShape: 'square',
                dataLabels: {
                    enabled: true,
                    format: '{point.name}',
                    style: {
                        textOutline: 'none',
                        fontWeight: 600,
                        fontSize: '11px',
                        color: '#fff'
                    }
                },
                borderColor: 'rgba(255,255,255,0.5)',
                borderWidth: 2,
                nullColor: '#64B5F6',
                pointPadding: 4
            }
        },

        series: [{
            name: 'RT',
            data: tilemapData,
            cursor: 'pointer',
            states: {
                hover: {
                    brightness: 0.2,
                    borderColor: '#fff',
                    borderWidth: 3
                }
            }
        }],

        credits: { enabled: false }
    };

    // Calculate totals for stats
    const totals = useMemo(() => ({
        kk: aggregatedData.reduce((sum, d) => sum + d.totalKK, 0),
        jiwa: aggregatedData.reduce((sum, d) => sum + d.totalJiwa, 0),
        fakir: aggregatedData.reduce((sum, d) => sum + d.fakir, 0),
        miskin: aggregatedData.reduce((sum, d) => sum + d.miskin, 0)
    }), [aggregatedData]);

    return (
        <div className="choropleth-map-widget" style={{
            background: '#2196F3',
            borderRadius: '12px',
            overflow: 'hidden',
            boxShadow: '0 4px 20px rgba(0,0,0,0.15)'
        }}>
            {/* Header */}
            <div style={{
                padding: '1rem 1.25rem',
                display: 'flex',
                justifyContent: 'space-between',
                alignItems: 'center',
                borderBottom: '1px solid rgba(255,255,255,0.1)'
            }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', color: '#fff' }}>
                    <span style={{ fontSize: '1.25rem' }}>📍</span>
                    <span style={{ fontWeight: 600 }}>Peta Asnaf</span>
                </div>
                <div style={{ display: 'flex', gap: '0.5rem' }}>
                    <button style={{
                        background: 'rgba(255,255,255,0.2)',
                        border: 'none',
                        borderRadius: '6px',
                        padding: '0.5rem 0.75rem',
                        color: '#fff',
                        cursor: 'pointer',
                        fontSize: '0.8rem'
                    }}>
                        🗓️
                    </button>
                </div>
            </div>

            {/* Map */}
            <div style={{ padding: '0 1rem' }}>
                <HighchartsReact
                    highcharts={Highcharts}
                    options={chartOptions}
                    constructorType={'chart'}
                />
            </div>

            {/* Stats Footer */}
            <div style={{
                display: 'grid',
                gridTemplateColumns: 'repeat(4, 1fr)',
                borderTop: '1px solid rgba(255,255,255,0.1)',
                background: 'rgba(0,0,0,0.1)'
            }}>
                <div style={{ padding: '1rem', textAlign: 'center', borderRight: '1px solid rgba(255,255,255,0.1)' }}>
                    <div style={{ fontSize: '1.5rem', fontWeight: 700, color: '#fff' }}>{totals.kk}</div>
                    <div style={{ fontSize: '0.75rem', color: 'rgba(255,255,255,0.7)' }}>Total KK</div>
                </div>
                <div style={{ padding: '1rem', textAlign: 'center', borderRight: '1px solid rgba(255,255,255,0.1)' }}>
                    <div style={{ fontSize: '1.5rem', fontWeight: 700, color: '#fff' }}>{totals.jiwa}</div>
                    <div style={{ fontSize: '0.75rem', color: 'rgba(255,255,255,0.7)' }}>Total Jiwa</div>
                </div>
                <div style={{ padding: '1rem', textAlign: 'center', borderRight: '1px solid rgba(255,255,255,0.1)' }}>
                    <div style={{ fontSize: '1.5rem', fontWeight: 700, color: '#FFCDD2' }}>{totals.fakir}</div>
                    <div style={{ fontSize: '0.75rem', color: 'rgba(255,255,255,0.7)' }}>Fakir</div>
                </div>
                <div style={{ padding: '1rem', textAlign: 'center' }}>
                    <div style={{ fontSize: '1.5rem', fontWeight: 700, color: '#FFE0B2' }}>{totals.miskin}</div>
                    <div style={{ fontSize: '0.75rem', color: 'rgba(255,255,255,0.7)' }}>Miskin</div>
                </div>
            </div>
        </div>
    );
};

export default AsnafChoroplethMap;
