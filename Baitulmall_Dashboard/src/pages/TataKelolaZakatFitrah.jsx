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
    Info
} from 'lucide-react';
import {
    PieChart, Pie, Cell, ResponsiveContainer, BarChart, Bar, XAxis, YAxis, Tooltip, Legend
} from 'recharts';

const TataKelolaZakatFitrah = () => {
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

    const WorkflowCard = ({ number, title, steps, icon: Icon, color = 'primary', delay = '0s' }) => (
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
            <div style={{ display: 'flex', alignItems: 'center', gap: '16px', marginBottom: '2rem' }}>
                <div style={{
                    width: '42px', height: '42px', borderRadius: '14px',
                    background: `linear-gradient(135deg, var(--${color}), rgba(var(--${color}-rgb), 0.6))`,
                    color: '#fff', display: 'flex', alignItems: 'center', justifyContent: 'center',
                    fontWeight: 900, fontSize: '1.2rem', boxShadow: `0 10px 20px -5px rgba(var(--${color}-rgb), 0.4)`
                }}>{number}</div>
                <h3 style={{ fontSize: '1.4rem', color: '#fff', fontWeight: 800, letterSpacing: '-0.02em', margin: 0 }}>{title}</h3>
            </div>
            <ul style={{ listStyle: 'none', padding: 0, margin: 0, display: 'flex', flexDirection: 'column', gap: '14px' }}>
                {steps.map((step, idx) => (
                    <li key={idx} style={{
                        fontSize: '1rem', color: 'rgba(255, 255, 255, 0.65)',
                        display: 'flex', alignItems: 'flex-start', gap: '14px', lineHeight: '1.6'
                    }}>
                        <CheckCircle2 size={18} style={{ color: `var(--${color})`, marginTop: '3px', flexShrink: 0 }} />
                        <span>{step}</span>
                    </li>
                ))}
            </ul>
        </div>
    );

    // Mock Data for Visualizations
    const asnafData = [
        { name: 'Fakir', value: 25, color: '#ef4444' },
        { name: 'Miskin', value: 40, color: '#f59e0b' },
        { name: 'Amil', value: 15, color: '#3b82f6' },
        { name: 'Fisabilillah', value: 20, color: '#10b981' },
        { name: 'Mualaf', value: 0, color: '#8b5cf6' },
        { name: 'Riqab', value: 0, color: '#ec4899' },
        { name: 'Ibnu Sabil', value: 0, color: '#6366f1' },
    ].filter(d => d.value > 0);

    const portionData = [
        { name: 'Fakir', portions: 2, pct: 25 },
        { name: 'Miskin', portions: 3, pct: 40 },
        { name: 'Amil', portions: 1, pct: 15 },
        { name: 'Fisabilillah', portions: 1, pct: 20 },
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
                    background: radial-gradient(circle, rgba(59, 130, 246, 0.15) 0%, transparent 70%);
                    z-index: 0; pointer-events: none;
                }
            `}</style>

            {/* Navbar */}
            <nav className="glass-nav" style={{
                position: 'fixed', top: 0, left: 0, right: 0, zIndex: 1000,
                height: '72px', display: 'flex', alignItems: 'center', padding: '0 3rem'
            }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', flex: 1 }}>
                    <div style={{
                        width: '36px', height: '36px', background: 'var(--primary)', borderRadius: '10px',
                        display: 'flex', alignItems: 'center', justifyContent: 'center'
                    }}>
                        <Scale size={20} color="white" />
                    </div>
                    <h3 style={{ fontWeight: 900, fontSize: '1.25rem', margin: 0, letterSpacing: '-0.04em', color: 'white' }}>
                        Baitulmal<span style={{ color: 'var(--primary)' }}> Fajar Maqbul</span>
                    </h3>
                </div>
                <div style={{ display: 'flex', alignItems: 'center', gap: '2.5rem' }}>
                    <a href="/public" style={{ fontSize: '0.8rem', fontWeight: 700, color: '#94a3b8', textDecoration: 'none', transition: 'color 0.2s' }} onMouseOver={(e) => e.target.style.color = 'white'} onMouseOut={(e) => e.target.style.color = '#94a3b8'}>Public</a>
                    <a href="/tatakelola" style={{ fontSize: '0.8rem', fontWeight: 700, color: '#94a3b8', textDecoration: 'none', transition: 'color 0.2s' }} onMouseOver={(e) => e.target.style.color = 'white'} onMouseOut={(e) => e.target.style.color = '#94a3b8'}>Tata Kelola</a>
                    <a href="/tatakelola/zakat-fitrah" style={{ fontSize: '0.8rem', fontWeight: 700, color: 'white', textDecoration: 'none', borderBottom: '2px solid var(--primary)', paddingBottom: '4px' }}>Zakat Fitrah</a>
                    <a href="/tatakelola/zakat-produktif" style={{ fontSize: '0.8rem', fontWeight: 700, color: '#94a3b8', textDecoration: 'none', transition: 'color 0.2s' }} onMouseOver={(e) => e.target.style.color = 'white'} onMouseOut={(e) => e.target.style.color = '#94a3b8'}>Zakat Produktif</a>
                    <a href="/etalase" style={{ fontSize: '0.8rem', fontWeight: 700, color: '#94a3b8', textDecoration: 'none', transition: 'color 0.2s' }} onMouseOver={(e) => e.target.style.color = 'white'} onMouseOut={(e) => e.target.style.color = '#94a3b8'}>Etalase</a>
                    <a href="/login" style={{
                        padding: '10px 20px', borderRadius: '12px', background: 'var(--primary)',
                        fontSize: '0.8rem', fontWeight: 800, color: 'white', textDecoration: 'none',
                        boxShadow: '0 8px 16px -4px rgba(59, 130, 246, 0.5)'
                    }}>ADMIN PORTAL</a>
                </div>
            </nav>

            <div className="hero-gradient" />

            <div style={{ width: '100%', maxWidth: '1600px', margin: '0 auto', padding: '10rem 4rem 5rem' }}>
                {/* Hero Section */}
                <div style={{ textAlign: 'center', marginBottom: '8rem', position: 'relative', zIndex: 1 }}>
                    <div style={{
                        display: 'inline-flex', alignItems: 'center', gap: '12px',
                        background: 'rgba(59, 130, 246, 0.1)', padding: '10px 24px',
                        borderRadius: '100px', color: 'var(--primary)', fontWeight: 800,
                        fontSize: '0.75rem', marginBottom: '2.5rem', letterSpacing: '0.2em', textTransform: 'uppercase'
                    }}>
                        <ShieldCheck size={16} />
                        <span>Syariah Compliance & Transparency</span>
                    </div>
                    <h1 style={{
                        fontSize: 'clamp(3.5rem, 10vw, 5.5rem)', fontWeight: 950,
                        letterSpacing: '-0.07em', color: '#fff', marginBottom: '2rem', lineHeight: 0.95
                    }}>
                        TATA KELOLA <br />
                        <span style={{
                            background: 'linear-gradient(to right, #60a5fa, #3b82f6)',
                            WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent'
                        }}>ZAKAT FITRAH</span>
                    </h1>
                    <p style={{
                        fontSize: '1.4rem', color: '#94a3b8', maxWidth: '850px',
                        margin: '0 auto', lineHeight: 1.6, fontWeight: 500
                    }}>
                        Sistem pengelolaan distribusi otomatis berbasis prinsip keadilan,
                        skala prioritas, dan transparansi mutlak untuk kemaslahatan umat.
                    </p>

                    <div style={{ marginTop: '4rem', display: 'flex', justifyContent: 'center', gap: '1.5rem' }}>
                        <button onClick={() => scrollToSection('prinsip')} className="btn btn-primary rounded-pill px-5 py-3 fw-bold shadow-lg transition-all">
                            PELAJARI PRINSIP <ArrowRight size={18} className="ms-2" />
                        </button>
                    </div>
                </div>

                {/* Section 1: Prinsip Dasar */}
                <section id="prinsip" style={{ marginBottom: '12rem' }}>
                    <div className="row align-items-center g-5">
                        <div className="col-lg-6">
                            <div style={{ position: 'relative' }}>
                                <div style={{
                                    position: 'absolute', inset: '-10px', background: 'var(--primary)',
                                    opacity: 0.1, filter: 'blur(40px)', borderRadius: '40px'
                                }} />
                                <img
                                    src="/images/landing/hero.png"
                                    alt="Governance Hero"
                                    style={{ width: '100%', borderRadius: '40px', border: '1px solid rgba(255,255,255,0.1)', position: 'relative', zIndex: 1 }}
                                />
                            </div>
                        </div>
                        <div className="col-lg-6">
                            <WorkflowCard
                                number="1"
                                title="Prinsip Dasar Pengelolaan"
                                icon={ClipboardList}
                                steps={[
                                    "Kepatuhan Syariat Islam (QS. At-Taubah: 60)",
                                    "Prinsip Keadilan dan Pemerataan Distribusi",
                                    "Prioritas Kebutuhan Pangan Mustahik Lokal",
                                    "Transparansi & Akuntabilitas Publik Real-time",
                                    "Membersihkan Jiwa & Menghapus Kesenjangan"
                                ]}
                            />
                        </div>
                    </div>
                </section>

                {/* Section 2 & 3: Asnaf & Priority Distribution Visualization */}
                <section style={{ marginBottom: '12rem' }}>
                    <div className="text-center mb-5">
                        <h2 style={{ fontSize: '2.5rem', fontWeight: 900, letterSpacing: '-0.04em' }}>
                            ALOKASI <span style={{ color: 'var(--primary)' }}>8 ASNAF</span> & SKALA PRIORITAS
                        </h2>
                        <p style={{ color: '#94a3b8', maxWidth: '600px', margin: '1rem auto' }}>
                            Sistem membagi porsi secara proporsional dengan mengutamakan golongan yang paling rentan.
                        </p>
                    </div>

                    <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(450px, 1fr))', gap: '2.5rem', marginBottom: '3rem' }}>
                        <div style={{
                            background: 'rgba(255,255,255,0.02)', border: '1px solid rgba(255,255,255,0.05)',
                            padding: '2rem', borderRadius: '32px', height: '100%'
                        }}>
                            <h4 className="text-white mb-4 fw-bold d-flex align-items-center gap-2">
                                <PieIcon size={20} className="text-primary" /> Komposisi Penerima (Asnaf)
                            </h4>
                            <div style={{ height: '300px' }}>
                                <ResponsiveContainer width="100%" height="100%">
                                    <PieChart>
                                        <Pie
                                            data={asnafData}
                                            cx="50%"
                                            cy="50%"
                                            innerRadius={60}
                                            outerRadius={100}
                                            paddingAngle={5}
                                            dataKey="value"
                                        >
                                            {asnafData.map((entry, index) => (
                                                <Cell key={`cell-${index}`} fill={entry.color} />
                                            ))}
                                        </Pie>
                                        <Tooltip />
                                        <Legend verticalAlign="bottom" height={36} />
                                    </PieChart>
                                </ResponsiveContainer>
                            </div>
                            <div className="mt-4 p-3 rounded-4 bg-dark bg-opacity-50 small border border-secondary border-opacity-10" style={{ color: 'rgba(255, 255, 255, 0.5)' }}>
                                <Info size={14} className="me-2 text-info" />
                                Porsi 0% pada asnaf tertentu terjadi jika tidak ditemukan mustahik dalam kategori tersebut di wilayah distribusi.
                            </div>
                        </div>

                        <div style={{
                            background: 'rgba(255,255,255,0.02)', border: '1px solid rgba(255,255,255,0.05)',
                            padding: '2rem', borderRadius: '32px', height: '100%'
                        }}>
                            <h4 className="text-white mb-4 fw-bold d-flex align-items-center gap-2">
                                <TrendingUp size={20} className="text-warning" /> Prioritas Fakir & Miskin
                            </h4>
                            <div style={{ height: '300px' }}>
                                <ResponsiveContainer width="100%" height="100%">
                                    <BarChart data={portionData}>
                                        <XAxis dataKey="name" stroke="#64748b" fontSize={12} tickLine={false} axisLine={false} />
                                        <YAxis hide />
                                        <Tooltip cursor={{ fill: 'rgba(255,255,255,0.05)' }} contentStyle={{ background: '#121212', border: '1px solid #333' }} />
                                        <Bar dataKey="portions" fill="var(--primary)" radius={[8, 8, 0, 0]} />
                                    </BarChart>
                                </ResponsiveContainer>
                            </div>
                            <div className="mt-4">
                                <div className="d-flex align-items-start gap-3 mb-3">
                                    <div className="p-2 bg-danger bg-opacity-20 rounded-3 text-danger"><AlertCircle size={20} /></div>
                                    <p className="small m-0" style={{ color: 'rgba(255, 255, 255, 0.5)' }}>
                                        <strong className="text-white">Alasan Porsi Besar:</strong> Fakir dan Miskin adalah prioritas utama (Maqashid Syariah) untuk menjamin kebutuhan pokok sebelum Idul Fitri.
                                    </p>
                                </div>
                            </div>
                        </div>
                    </div>
                </section>

                {/* Sections 4-6 Sidebar Style */}
                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(320px, 1fr))', gap: '2.5rem', marginBottom: '8rem' }}>
                    <WorkflowCard
                        number="4"
                        title="Porsi Amil Syar'i"
                        icon={Briefcase}
                        steps={[
                            "Hak operasional petugas pengelola",
                            "Besaran disesuaikan (Proporsional)",
                            "Tidak membebani jatah mustahik",
                            "Digunakan untuk efisiensi amil"
                        ]}
                    />
                    <WorkflowCard
                        number="5"
                        title="Penyesuaian Faktual"
                        icon={Globe}
                        color="warning"
                        steps={[
                            "Asnaf 0% jika mustahik tidak ada",
                            "Bukan pengabaian syariat",
                            "Pengalihan ke kategori mendesak",
                            "Berbasis data riil di lapangan"
                        ]}
                    />
                    <WorkflowCard
                        number="6"
                        title="Simulasi Porsi"
                        icon={Monitor}
                        color="info"
                        steps={[
                            "Slider untuk kontrol alokasi tepat",
                            "Validasi total harus 100%",
                            "Menghindari human error",
                            "Dasar audit yang transparan"
                        ]}
                    />
                </div>

                {/* Section 7 & 8: Security & Data */}
                <section style={{ marginBottom: '12rem' }}>
                    <div className="row align-items-center g-5">
                        <div className="col-lg-6 order-lg-2">
                            <img
                                src="/images/landing/security.png"
                                alt="Security System"
                                style={{ width: '100%', borderRadius: '40px', border: '1px solid rgba(255,255,255,0.05)', boxShadow: '0 40px 80px rgba(0,0,0,0.5)' }}
                            />
                        </div>
                        <div className="col-lg-6 order-lg-1">
                            <div className="mb-4">
                                <h2 style={{ fontSize: '2rem', fontWeight: 900, color: 'white' }}>KEAMANAN DATA & INTEGRITAS</h2>
                                <p style={{ color: 'rgba(255, 255, 255, 0.6)' }}>Fitur penguncian dan basis data per jiwa menjamin keadilan yang terukur.</p>
                            </div>
                            <div className="d-flex flex-column gap-3">
                                <div style={{ background: 'rgba(255,255,255,0.02)', padding: '2rem', borderRadius: '24px', border: '1px solid rgba(255,255,255,0.05)' }}>
                                    <h5 className="text-white fw-bold d-flex align-items-center gap-2 mb-3">
                                        <Lock size={18} className="text-danger" /> Status Terkunci (Anti-Tamper)
                                    </h5>
                                    <p className="small mb-0" style={{ color: 'rgba(255, 255, 255, 0.7)', lineHeight: 1.6 }}>
                                        Mencegah perubahan alokasi sepihak setelah disepakati. Menjadi dasar legal sebelum eksekusi penyaluran resmi oleh pengurus.
                                    </p>
                                </div>
                                <div style={{ background: 'rgba(255,255,255,0.02)', padding: '2rem', borderRadius: '24px', border: '1px solid rgba(255,255,255,0.05)' }}>
                                    <h5 className="text-white fw-bold d-flex align-items-center gap-2 mb-3">
                                        <Users size={18} className="text-success" /> Berbasis Data Jiwa
                                    </h5>
                                    <p className="small mb-0" style={{ color: 'rgba(255, 255, 255, 0.7)', lineHeight: 1.6 }}>
                                        Setiap butir beras dihitung per jiwa mustahik. Menghindari ketimpangan antar keluarga dan memastikan distribusi tepat sasaran.
                                    </p>
                                </div>
                            </div>
                        </div>
                    </div>
                </section>

                {/* Section 9: Akuntabilitas & Conclusion */}
                <section style={{ marginBottom: '8rem' }}>
                    <div style={{
                        background: 'linear-gradient(135deg, rgba(59, 130, 246, 0.1), rgba(16, 185, 129, 0.1))',
                        padding: '5rem 3rem', borderRadius: '48px', border: '1px solid rgba(255, 255, 255, 0.08)',
                        textAlign: 'center'
                    }}>
                        <div style={{ color: 'var(--primary)', fontWeight: 800, fontSize: '0.8rem', letterSpacing: '0.4em', textTransform: 'uppercase', marginBottom: '1.5rem' }}>Final Integrity</div>
                        <h2 style={{ fontSize: '3rem', fontWeight: 900, marginBottom: '2rem', letterSpacing: '-0.05em' }}>SIP-TRANSPARANSI <span style={{ color: 'var(--primary)' }}>MUTLAK</span></h2>
                        <p style={{ color: '#94a3b8', maxWidth: '700px', margin: '0 auto 3rem', fontSize: '1.1rem', lineHeight: 1.8 }}>
                            Tata kelola ini dirancang agar setiap rupiah dan kilogram zakat tercatat jelas,
                            dapat dipertanggungjawabkan, dan mudah diaudit oleh publik maupun pengawas syariah.
                        </p>

                        <img
                            src="/images/landing/community.png"
                            alt="Community Success"
                            style={{ width: '100%', maxWidth: '900px', borderRadius: '32px', border: '1px solid rgba(255,255,255,0.1)', shadow: '0 20px 40px rgba(0,0,0,0.4)' }}
                        />

                        <div className="mt-5 pt-4 d-flex justify-content-center gap-5 flex-wrap">
                            <div className="text-center">
                                <h5 className="text-white fw-900 mb-1">Syariat</h5>
                                <div className="small text-primary fw-bold">KEPATUHAN 100%</div>
                            </div>
                            <div className="text-center">
                                <h5 className="text-white fw-900 mb-1">Prioritas</h5>
                                <div className="small text-primary fw-bold">KEADILAN SOSIAL</div>
                            </div>
                            <div className="text-center">
                                <h5 className="text-white fw-900 mb-1">Amanah</h5>
                                <div className="small text-primary fw-bold">AKUNTABILITAS</div>
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
                        <div style={{ width: '28px', height: '28px', background: 'rgba(59, 130, 246, 0.2)', borderRadius: '8px', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                            <Scale size={16} fill="currentColor" />
                        </div>
                        <span style={{ fontSize: '0.85rem', fontWeight: 900, color: 'white', letterSpacing: '0.2em' }}>BAITULMAL FAJAR MAQBUL</span>
                    </div>
                    <p style={{ fontSize: '0.95rem', maxWidth: '600px', margin: '0 auto 1.5rem', lineHeight: 1.6 }}>
                        "Zakat mensucikan jiwa, memuliakan mustahik, dan memberkahi harta muzaki."
                    </p>
                    <p style={{ fontSize: '0.8rem' }}>&copy; {new Date().getFullYear()} Baitulmal Fajar Maqbul. Designed with Integrity.</p>
                </footer>
            </div>
        </div>
    );
};

export default TataKelolaZakatFitrah;
