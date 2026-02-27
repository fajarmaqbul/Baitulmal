import React, { useState } from 'react';
import {
    Heart,
    ShieldCheck,
    ArrowRight,
    CheckCircle2,
    PieChart as PieIcon,
    Users,
    TrendingUp,
    Shield,
    Lock,
    Settings,
    FileText,
    TrendingDown,
    Zap,
    Briefcase,
    Globe,
    Scale,
    Activity,
    AlertCircle,
    ClipboardList,
    Search,
    Monitor,
    Info,
    Rocket,
    BarChart3,
    Target,
    MapPin,
    PenTool,
    GraduationCap,
    ArrowUpRight,
    ArrowLeftRight
} from 'lucide-react';
import {
    PieChart, Pie, Cell, ResponsiveContainer, BarChart, Bar, XAxis, YAxis, Tooltip, Legend, LineChart, Line, CartesianGrid
} from 'recharts';

const TataKelolaZakatProduktif = () => {
    // Scroll handling
    const scrollToSection = (id) => {
        const element = document.getElementById(id);
        if (element) {
            const offset = 80;
            const bodyRect = document.body.getBoundingClientRect().top;
            const elementRect = element.getBoundingClientRect().top;
            const elementPosition = elementRect - bodyRect;
            const offsetPosition = elementPosition - offset;
            window.scrollTo({ top: offsetPosition, behavior: 'smooth' });
        }
    };

    const WorkflowCard = ({ number, title, focus, steps, icon: Icon, color = 'primary', delay = '0s' }) => (
        <div style={{
            padding: '2.5rem',
            height: '100%',
            background: 'rgba(18, 18, 18, 0.6)',
            backdropFilter: 'blur(16px)',
            border: '1px solid rgba(255, 255, 255, 0.08)',
            borderRadius: '28px',
            position: 'relative',
            overflow: 'hidden',
            transition: 'all 0.4s cubic-bezier(0.175, 0.885, 0.32, 1.275)',
            animation: `fadeInUp 0.6s ease forwards ${delay}`,
            opacity: 0,
            transform: 'translateY(20px)'
        }}
            className="hover-lift"
        >
            <div style={{ position: 'absolute', top: '-15px', right: '-15px', opacity: 0.03, transform: 'rotate(-10deg)' }}>
                <Icon size={160} />
            </div>
            <div style={{ display: 'flex', alignItems: 'center', gap: '16px', marginBottom: '1.5rem' }}>
                <div style={{
                    width: '42px', height: '42px', borderRadius: '14px',
                    background: `linear-gradient(135deg, var(--${color}), rgba(var(--${color}-rgb), 0.6))`,
                    color: '#fff', display: 'flex', alignItems: 'center', justifyContent: 'center',
                    fontWeight: 900, fontSize: '1.2rem', boxShadow: `0 10px 20px -5px rgba(var(--${color}-rgb), 0.4)`
                }}>{number}</div>
                <h3 style={{ fontSize: '1.4rem', color: '#fff', fontWeight: 800, letterSpacing: '-0.02em', margin: 0 }}>{title}</h3>
            </div>
            {focus && (
                <div style={{
                    fontSize: '0.75rem', fontWeight: 800, color: `var(--${color})`,
                    textTransform: 'uppercase', marginBottom: '1rem', letterSpacing: '0.1em'
                }}>
                    Fokus: {focus}
                </div>
            )}
            <ul style={{ listStyle: 'none', padding: 0, margin: 0, display: 'flex', flexDirection: 'column', gap: '12px' }}>
                {steps.map((step, idx) => (
                    <li key={idx} style={{
                        fontSize: '0.95rem', color: 'rgba(255, 255, 255, 0.65)',
                        display: 'flex', alignItems: 'flex-start', gap: '12px', lineHeight: '1.5'
                    }}>
                        <CheckCircle2 size={16} style={{ color: `var(--${color})`, marginTop: '3px', flexShrink: 0 }} />
                        <span>{step}</span>
                    </li>
                ))}
            </ul>
        </div>
    );

    // Mock Data for Visualizations
    const impactData = [
        { month: 'Jan', mandiri: 5, produktivitas: 45 },
        { month: 'Feb', mandiri: 8, produktivitas: 52 },
        { month: 'Mar', mandiri: 12, produktivitas: 65 },
        { month: 'Apr', mandiri: 20, produktivitas: 80 },
    ];

    return (
        <div style={{
            minHeight: '100vh', backgroundColor: '#050505', color: '#e2e8f0',
            fontFamily: "'Inter', system-ui, sans-serif", overflowX: 'hidden'
        }}>
            <style>{`
                @keyframes fadeInUp {
                    from { opacity: 0; transform: translateY(30px); }
                    to { opacity: 1; transform: translateY(0); }
                }
                .hover-lift:hover {
                    transform: translateY(-8px) !important;
                    border-color: rgba(255,255,255,0.2) !important;
                    background: rgba(255,255,255,0.05) !important;
                }
                .glass-nav {
                    background: rgba(5, 5, 5, 0.7) !important;
                    backdrop-filter: blur(20px) !important;
                    border-bottom: 1px solid rgba(255, 255, 255, 0.05) !important;
                }
                .hero-gradient {
                    position: absolute;
                    top: -10%; left: -10%; width: 40%; height: 60%;
                    background: radial-gradient(circle, rgba(255, 171, 0, 0.1) 0%, transparent 70%);
                    z-index: 0; pointer-events: none;
                }
                .strategic-card {
                    background: rgba(255, 255, 255, 0.02);
                    border: 1px solid rgba(255, 255, 255, 0.05);
                    padding: 2.5rem;
                    border-radius: 32px;
                    text-align: center;
                    transition: all 0.3s ease;
                }
                .strategic-card:hover {
                    background: rgba(255, 255, 255, 0.04);
                    border-color: var(--primary);
                }
            `}</style>

            {/* Navbar */}
            <nav className="glass-nav" style={{
                position: 'fixed', top: 0, left: 0, right: 0, zIndex: 1000,
                height: '72px', display: 'flex', alignItems: 'center', padding: '0 3rem'
            }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', flex: 1 }}>
                    <div style={{
                        width: '36px', height: '36px', background: 'var(--warning)', borderRadius: '10px',
                        display: 'flex', alignItems: 'center', justifyContent: 'center'
                    }}>
                        <Briefcase size={20} color="white" />
                    </div>
                    <h3 style={{ fontWeight: 900, fontSize: '1.25rem', margin: 0, letterSpacing: '-0.04em', color: 'white' }}>
                        Baitulmal<span style={{ color: 'var(--warning)' }}> Fajar Maqbul</span>
                    </h3>
                </div>
                <div style={{ display: 'flex', alignItems: 'center', gap: '2.5rem' }}>
                    <a href="/public" style={{ fontSize: '0.8rem', fontWeight: 700, color: '#94a3b8', textDecoration: 'none', transition: 'color 0.2s' }} onMouseOver={(e) => e.target.style.color = 'white'} onMouseOut={(e) => e.target.style.color = '#94a3b8'}>Public</a>
                    <a href="/tatakelola" style={{ fontSize: '0.8rem', fontWeight: 700, color: '#94a3b8', textDecoration: 'none', transition: 'color 0.2s' }} onMouseOver={(e) => e.target.style.color = 'white'} onMouseOut={(e) => e.target.style.color = '#94a3b8'}>Tata Kelola</a>
                    <a href="/tatakelola/zakat-fitrah" style={{ fontSize: '0.8rem', fontWeight: 700, color: '#94a3b8', textDecoration: 'none', transition: 'color 0.2s' }} onMouseOver={(e) => e.target.style.color = 'white'} onMouseOut={(e) => e.target.style.color = '#94a3b8'}>Zakat Fitrah</a>
                    <a href="/tatakelola/zakat-produktif" style={{ fontSize: '0.8rem', fontWeight: 700, color: 'white', textDecoration: 'none', borderBottom: '2px solid var(--warning)', paddingBottom: '4px' }}>Zakat Produktif</a>
                    <a href="/etalase" style={{ fontSize: '0.8rem', fontWeight: 700, color: '#94a3b8', textDecoration: 'none', transition: 'color 0.2s' }} onMouseOver={(e) => e.target.style.color = 'white'} onMouseOut={(e) => e.target.style.color = '#94a3b8'}>Etalase</a>
                    <a href="/login" style={{
                        padding: '10px 20px', borderRadius: '12px', background: 'var(--warning)',
                        fontSize: '0.8rem', fontWeight: 800, color: 'white', textDecoration: 'none',
                        boxShadow: '0 8px 16px -4px rgba(255, 171, 0, 0.4)'
                    }}>ADMIN PORTAL</a>
                </div>
            </nav>

            <div className="hero-gradient" />

            <div style={{ width: '100%', maxWidth: '1600px', margin: '0 auto', padding: '10rem 4rem 5rem' }}>
                {/* Hero Section */}
                <div style={{ textAlign: 'center', marginBottom: '8rem', position: 'relative', zIndex: 1 }}>
                    <div style={{
                        display: 'inline-flex', alignItems: 'center', gap: '12px',
                        background: 'rgba(255, 171, 0, 0.1)', padding: '10px 24px',
                        borderRadius: '100px', color: 'var(--warning)', fontWeight: 800,
                        fontSize: '0.75rem', marginBottom: '2.5rem', letterSpacing: '0.2em', textTransform: 'uppercase'
                    }}>
                        <Rocket size={16} />
                        <span>Empowering Economic Independence</span>
                    </div>
                    <h1 style={{
                        fontSize: 'clamp(3.5rem, 10vw, 5.5rem)', fontWeight: 950,
                        letterSpacing: '-0.07em', color: '#fff', marginBottom: '2rem', lineHeight: 0.95
                    }}>
                        ZAKAT MAL <br />
                        <span style={{
                            background: 'linear-gradient(to right, #fbbf24, #f59e0b)',
                            WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent'
                        }}>PRODUKTIF</span>
                    </h1>
                    <p style={{
                        fontSize: '1.4rem', color: '#94a3b8', maxWidth: '850px',
                        margin: '0 auto', lineHeight: 1.6, fontWeight: 500
                    }}>
                        Skema pemberdayaan ekonomi berbasis aset dan modal usaha untuk
                        meningkatkan kemandirian mustahik secara berkelanjutan.
                    </p>

                    <div style={{ marginTop: '4rem', display: 'flex', justifyContent: 'center', gap: '1.5rem' }}>
                        <button onClick={() => scrollToSection('workflow')} className="btn btn-warning rounded-pill px-5 py-3 fw-bold shadow-lg transition-all text-dark">
                            LIHAT MEKANISME <ArrowRight size={18} className="ms-2" />
                        </button>
                    </div>
                </div>

                {/* Workflow Cards Section */}
                <section id="workflow" style={{ marginBottom: '12rem' }}>
                    <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(380px, 1fr))', gap: '2.5rem' }}>
                        <WorkflowCard
                            number="1"
                            title="Identifikasi & Seleksi"
                            focus="Menentukan mustahik yang layak"
                            icon={Search}
                            color="info"
                            delay="0.1s"
                            steps={[
                                "Pendataan mustahik fakir/miskin produktif",
                                "Verifikasi kondisi ekonomi & aset keluarga",
                                "Survey potensi usaha (existing / rencana)",
                                "Analisis kelayakan bisnis (cashflow & pasar)",
                                "Wawancara komitmen & kesiapan pembinaan",
                                "Validasi tidak menerima bantuan ganda"
                            ]}
                        />

                        <WorkflowCard
                            number="2"
                            title="Perencanaan Program"
                            focus="Menyusun skema bantuan tepat"
                            icon={PenTool}
                            color="primary"
                            delay="0.2s"
                            steps={[
                                "Penentuan jenis: Modal tunai / Alat produksi",
                                "Pengadaan Mesin / Perlengkapan kerja / Ternak",
                                "Penyusunan RAB (Rencana Anggaran Biaya)",
                                "Skema: Hibah produktif / Dana bergulir",
                                "Penetapan KPI (Omzet, Laba, Stabilitas)",
                                "Penandatanganan akad syariah"
                            ]}
                        />

                        <WorkflowCard
                            number="3"
                            title="Pelaksanaan Program"
                            focus="Realisasi bantuan & kapasitas"
                            icon={Zap}
                            color="warning"
                            delay="0.3s"
                            steps={[
                                "Transfer modal / Pembelian alat langsung",
                                "Pengadaan ternak & serah terima resmi",
                                "Pelatihan manajemen usaha mikro",
                                "Pelatihan literasi keuangan syariah",
                                "Pendampingan teknis UMKM & Operasional",
                                "Aktivasi dana bergulir & jadwal"
                            ]}
                        />

                        <WorkflowCard
                            number="4"
                            title="Pendampingan"
                            focus="Menjaga keberlanjutan usaha"
                            icon={Users}
                            color="success"
                            delay="0.4s"
                            steps={[
                                "Kunjungan monitoring berkala (Bulanan)",
                                "Evaluasi omzet & perkembangan usaha",
                                "Konsultasi kendala bisnis & solusi",
                                "Pembinaan spiritual & etika usaha",
                                "Pelaporan di dashboard sistem",
                                "Mitigasi risiko kegagalan usaha"
                            ]}
                        />

                        <WorkflowCard
                            number="5"
                            title="Exit Strategy"
                            focus="Transformasi Mustahik → Mandiri"
                            icon={ArrowUpRight}
                            color="danger"
                            delay="0.5s"
                            steps={[
                                "Usaha stabil minimal 6–12 bulan",
                                "Penghasilan melampaui batas nisab",
                                "Verifikasi kemandirian ekonomi",
                                "Graduasi: Mustahik → Muzaki",
                                "Testimoni & dokumentasi keberhasilan",
                                "Replikasi bantuan ke mustahik baru"
                            ]}
                        />

                        {/* Visual Impact Chart Card */}
                        <div style={{
                            padding: '2.5rem',
                            background: 'rgba(255, 255, 255, 0.02)',
                            backdropFilter: 'blur(10px)',
                            border: '1px solid rgba(255, 255, 255, 0.05)',
                            borderRadius: '28px',
                            display: 'flex',
                            flexDirection: 'column'
                        }}>
                            <h4 className="text-white mb-4 fw-bold d-flex align-items-center gap-2">
                                <TrendingUp size={20} className="text-success" /> Proyeksi Kemandirian
                            </h4>
                            <div style={{ flex: 1, minHeight: '200px' }}>
                                <ResponsiveContainer width="100%" height="100%">
                                    <LineChart data={impactData}>
                                        <CartesianGrid strokeDasharray="3 3" stroke="#333" vertical={false} />
                                        <XAxis dataKey="month" stroke="#64748b" fontSize={12} tickLine={false} axisLine={false} />
                                        <YAxis hide />
                                        <Tooltip contentStyle={{ background: '#121212', border: '1px solid #333' }} />
                                        <Line type="monotone" dataKey="produktivitas" stroke="var(--primary)" strokeWidth={3} dot={{ fill: 'var(--primary)', r: 4 }} />
                                        <Line type="monotone" dataKey="mandiri" stroke="var(--success)" strokeWidth={3} dot={{ fill: 'var(--success)', r: 4 }} />
                                    </LineChart>
                                </ResponsiveContainer>
                            </div>
                            <div className="mt-4 p-3 rounded-4 bg-dark bg-opacity-50 small border border-secondary border-opacity-10" style={{ color: 'rgba(255, 255, 255, 0.5)' }}>
                                <Info size={14} className="me-2 text-info" />
                                Grafik menunjukkan tren peningkatan omzet usaha (biru) dan jumlah mustahik yang lulus kemandirian (hijau).
                            </div>
                        </div>
                    </div>
                </section>

                {/* Strategic Objectives Section */}
                <section style={{ marginBottom: '12rem' }}>
                    <div className="text-center mb-5">
                        <h2 style={{ fontSize: '2.5rem', fontWeight: 900, letterSpacing: '-0.04em' }}>
                            TUJUAN <span style={{ color: 'var(--warning)' }}>STRATEGIS</span>
                        </h2>
                        <p style={{ color: '#94a3b8', maxWidth: '600px', margin: '1rem auto' }}>
                            Transformasi fundamental dalam pengelolaan zakat dari Charity ke Empowerment.
                        </p>
                    </div>

                    <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))', gap: '2rem' }}>
                        <div className="strategic-card">
                            <div style={{ width: '56px', height: '56px', background: 'rgba(59, 130, 246, 0.1)', borderRadius: '18px', display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto 1.5rem', color: 'var(--primary)' }}>
                                <TrendingDown size={28} />
                            </div>
                            <h4 className="text-white fw-bold mb-3">Kemandirian</h4>
                            <p className="small m-0" style={{ color: 'rgba(255,255,255,0.6)' }}>Mengurangi ketergantungan bantuan konsumtif jangka panjang.</p>
                        </div>

                        <div className="strategic-card">
                            <div style={{ width: '56px', height: '56px', background: 'rgba(16, 185, 129, 0.1)', borderRadius: '18px', display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto 1.5rem', color: 'var(--success)' }}>
                                <ArrowLeftRight size={28} />
                            </div>
                            <h4 className="text-white fw-bold mb-3">Ekonomi Umat</h4>
                            <p className="small m-0" style={{ color: 'rgba(255,255,255,0.6)' }}>Menciptakan perputaran ekonomi yang merata di akar rumput.</p>
                        </div>

                        <div className="strategic-card">
                            <div style={{ width: '56px', height: '56px', background: 'rgba(245, 158, 11, 0.1)', borderRadius: '18px', display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto 1.5rem', color: 'var(--warning)' }}>
                                <Target size={28} />
                            </div>
                            <h4 className="text-white fw-bold mb-3">Mobilitas Sosial</h4>
                            <p className="small m-0" style={{ color: 'rgba(255,255,255,0.6)' }}>Mendorong kenaikan derajat ekonomi mustahik menjadi berkelimpahan.</p>
                        </div>

                        <div className="strategic-card">
                            <div style={{ width: '56px', height: '56px', background: 'rgba(239, 68, 68, 0.1)', borderRadius: '18px', display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto 1.5rem', color: 'var(--danger)' }}>
                                <ShieldCheck size={28} />
                            </div>
                            <h4 className="text-white fw-bold mb-3">Keadilan</h4>
                            <p className="small m-0" style={{ color: 'rgba(255,255,255,0.6)' }}>Mewujudkan keadilan sosial melalui distribusi modal yang produktif.</p>
                        </div>
                    </div>
                </section>

                {/* Final Accountability Section */}
                <section style={{ marginBottom: '8rem' }}>
                    <div style={{
                        background: 'linear-gradient(135deg, rgba(251, 191, 36, 0.1), rgba(59, 130, 246, 0.1))',
                        padding: '5rem 3rem', borderRadius: '48px', border: '1px solid rgba(255, 255, 255, 0.08)',
                        textAlign: 'center'
                    }}>
                        <div style={{ color: 'var(--warning)', fontWeight: 800, fontSize: '0.8rem', letterSpacing: '0.4em', textTransform: 'uppercase', marginBottom: '1.5rem' }}>Empowerment Core</div>
                        <h2 style={{ fontSize: '3rem', fontWeight: 900, marginBottom: '2rem', letterSpacing: '-0.05em' }}>DARI MUSTAHIK <span style={{ color: 'var(--warning)' }}>MENJADI MUZAKI</span></h2>
                        <p style={{ color: '#94a3b8', maxWidth: '700px', margin: '0 auto 3rem', fontSize: '1.1rem', lineHeight: 1.8 }}>
                            Sistem zakat produktif kami tidak hanya memberi ikan, tetapi memastikan mustahik
                            memiliki kail, perahu, dan pasar untuk menjalin kehidupan yang lebih mulia dan mandiri.
                        </p>

                        <div className="row g-4 justify-content-center">
                            <div className="col-lg-3 col-6">
                                <div style={{ background: 'rgba(255,255,255,0.03)', padding: '2rem', borderRadius: '24px', border: '1px solid rgba(255,255,255,0.05)' }}>
                                    <h3 style={{ fontSize: '2rem', fontWeight: 900, color: 'white', marginBottom: '0.5rem' }}>100%</h3>
                                    <div className="small text-warning fw-bold">AMANAH SYARIAH</div>
                                </div>
                            </div>
                            <div className="col-lg-3 col-6">
                                <div style={{ background: 'rgba(255,255,255,0.03)', padding: '2rem', borderRadius: '24px', border: '1px solid rgba(255,255,255,0.05)' }}>
                                    <h3 style={{ fontSize: '2rem', fontWeight: 900, color: 'white', marginBottom: '0.5rem' }}>24/7</h3>
                                    <div className="small text-warning fw-bold">AUDIT TRANSPARAN</div>
                                </div>
                            </div>
                        </div>
                    </div>
                </section>

                {/* Footer */}
                <footer style={{
                    textAlign: 'center', padding: '10rem 0 4rem', color: 'rgba(255, 255, 255, 0.2)',
                    borderTop: '1px solid rgba(255, 255, 255, 0.05)'
                }}>
                    <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '0.75rem', marginBottom: '2rem' }}>
                        <div style={{ width: '28px', height: '28px', background: 'rgba(251, 191, 36, 0.2)', borderRadius: '8px', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                            <Scale size={16} fill="currentColor" color="var(--warning)" />
                        </div>
                        <span style={{ fontSize: '0.85rem', fontWeight: 900, color: 'white', letterSpacing: '0.2em' }}>BAITULMAL FAJAR MAQBUL</span>
                    </div>
                    <p style={{ fontSize: '0.95rem', maxWidth: '600px', margin: '0 auto 1.5rem', lineHeight: 1.6 }}>
                        "Zakat produktif adalah investasi akhirat yang menghidupkan kemuliaan mustahik."
                    </p>
                    <p style={{ fontSize: '0.8rem' }}>&copy; {new Date().getFullYear()} Baitulmal Fajar Maqbul. Designed for Empowerment.</p>
                </footer>
            </div>
        </div>
    );
};

export default TataKelolaZakatProduktif;
