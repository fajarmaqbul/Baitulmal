import React, { useMemo } from 'react';
import {
    Chart as ChartJS,
    CategoryScale,
    LinearScale,
    BarElement,
    Title,
    Tooltip,
    Legend,
    ArcElement,
    PointElement,
    LineElement,
} from 'chart.js';
import { Bar, Doughnut } from 'react-chartjs-2';
import { ArrowUpRight } from 'lucide-react';

ChartJS.register(
    CategoryScale,
    LinearScale,
    BarElement,
    ArcElement,
    PointElement,
    LineElement,
    Title,
    Tooltip,
    Legend
);

const DashboardCharts = ({ rtChartData, chartOptions, distributionData, doughnutOptions }) => {
    return (
        <div style={{ display: 'grid', gridTemplateColumns: '7fr 3fr', gap: '2rem' }}>
            <div className="glass-card" style={{ padding: '2.5rem', boxShadow: '0 4px 20px rgba(0,0,0,0.02)', border: '1px solid var(--border-color)' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '2.5rem' }}>
                    <div>
                        <h4 style={{ fontSize: '1.25rem', fontWeight: 800, margin: 0, color: 'var(--text-main)' }}>Penyebaran Asnaf</h4>
                        <p style={{ fontSize: '0.9rem', color: 'var(--text-muted)', margin: '0.5rem 0 0' }}>Data Fakir & Miskin per wilayah RT</p>
                    </div>
                </div>
                <div style={{ height: '350px' }}>
                    <Bar data={rtChartData} options={chartOptions} />
                </div>
            </div>

            <div className="glass-card" style={{ padding: '2.5rem', display: 'flex', flexDirection: 'column', boxShadow: '0 4px 20px rgba(0,0,0,0.02)', border: '1px solid var(--border-color)' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '1rem' }}>
                    <div>
                        <h4 style={{ fontSize: '1.25rem', fontWeight: 800, margin: 0, color: 'var(--text-main)' }}>Komposisi Asnaf</h4>
                        <p style={{ fontSize: '0.9rem', color: 'var(--text-muted)', margin: '0.5rem 0 0' }}>Berdasarkan kategori</p>
                    </div>
                    <div style={{ background: 'rgba(241, 245, 249, 0.5)', padding: '0.5rem', borderRadius: '10px' }}>
                        <ArrowUpRight size={20} style={{ color: 'var(--text-muted)' }} />
                    </div>
                </div>
                <div style={{ height: '380px', display: 'flex', justifyContent: 'center', position: 'relative' }}>
                    <Doughnut
                        data={distributionData}
                        options={doughnutOptions}
                    />
                </div>
            </div>
        </div>
    );
};

export default DashboardCharts;
