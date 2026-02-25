import React from 'react';
import {
    ClipboardList,
    Search,
    CheckCircle2,
    TrendingUp,
    ArrowRight,
    UserCheck,
    Calendar,
    FileText,
    Heart,
    GraduationCap,
    PlusCircle,
    Activity,
    Home,
    Briefcase,
    Settings,
    ShieldCheck,
    PieChart,
    Layers,
    Save,
    Share2,
    Eye,
    Coins,
    Globe
} from 'lucide-react';

const TataKelola = () => {
    // Scroll handling for smooth behavior
    const scrollToSection = (id) => {
        const element = document.getElementById(id);
        if (element) {
            const offset = 80; // Account for fixed navbar
            const bodyRect = document.body.getBoundingClientRect().top;
            const elementRect = element.getBoundingClientRect().top;
            const elementPosition = elementRect - bodyRect;
            const offsetPosition = elementPosition - offset;

            window.scrollTo({
                top: offsetPosition,
                behavior: 'smooth'
            });
        }
    };

    const WorkflowCard = ({ number, title, steps, icon: Icon, color = 'primary' }) => (
        <div style={{
            padding: '2rem',
            height: '100%',
            borderLeft: `4px solid var(--${color})`,
            transition: 'all 0.3s cubic-bezier(0.4, 0, 0.2, 1)',
            position: 'relative',
            overflow: 'hidden',
            background: 'rgba(18, 18, 18, 0.8)',
            backdropFilter: 'blur(12px)',
            border: '1px solid rgba(255, 255, 255, 0.08)',
            borderRadius: '24px',
            boxShadow: '0 25px 50px -12px rgba(0, 0, 0, 0.5)'
        }}>
            <div style={{ position: 'absolute', top: '-10px', right: '-10px', opacity: 0.05 }}>
                <Icon size={140} />
            </div>
            <div style={{ display: 'flex', alignItems: 'center', gap: '16px', marginBottom: '1.5rem' }}>
                <div style={{
                    width: '36px',
                    height: '36px',
                    borderRadius: '10px',
                    background: `var(--${color})`,
                    color: '#fff',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    fontWeight: 800,
                    fontSize: '1.1rem',
                    boxShadow: `0 8px 16px -4px rgba(var(--${color}-rgb), 0.3)`
                }}>{number}</div>
                <h3 style={{ fontSize: '1.25rem', color: '#fff', fontWeight: 800, letterSpacing: '-0.02em', margin: 0 }}>{title}</h3>
            </div>
            <ul style={{ listStyle: 'none', padding: 0, margin: 0, display: 'flex', flexDirection: 'column', gap: '12px' }}>
                {steps.map((step, idx) => (
                    <li key={idx} style={{
                        fontSize: '0.95rem',
                        color: 'rgba(255, 255, 255, 0.6)',
                        display: 'flex',
                        alignItems: 'flex-start',
                        gap: '12px',
                        lineHeight: '1.5'
                    }}>
                        <CheckCircle2 size={18} style={{ color: `var(--${color})`, marginTop: '2px', flexShrink: 0 }} />
                        <span>{step}</span>
                    </li>
                ))}
            </ul>
        </div>
    );

    const TypeBadge = ({ text, color = 'primary' }) => (
        <div style={{
            fontSize: '0.8rem',
            padding: '6px 14px',
            borderRadius: '100px',
            background: `rgba(var(--${color}-rgb), 0.1)`,
            color: `var(--${color})`,
            fontWeight: 700,
            display: 'inline-flex',
            alignItems: 'center',
            gap: '6px',
            border: `1px solid rgba(var(--${color}-rgb), 0.1)`
        }}>
            {text}
        </div>
    );

    return (
        <div style={{
            minHeight: '100vh',
            backgroundColor: '#0a0a0a',
            color: '#e4e4e7',
            fontFamily: "'Inter', sans-serif",
            scrollBehavior: 'smooth'
        }}>
            {/* Navbar */}
            <nav style={{
                position: 'fixed',
                top: 0,
                left: 0,
                right: 0,
                zIndex: 1000,
                borderBottom: '1px solid rgba(255, 255, 255, 0.05)',
                background: 'rgba(10, 10, 10, 0.8)',
                backdropFilter: 'blur(20px)',
                height: '64px',
                display: 'flex',
                alignItems: 'center',
                padding: '0 2.5rem'
            }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', flex: 1 }}>
                    <div style={{
                        width: '32px',
                        height: '32px',
                        background: 'var(--primary)',
                        borderRadius: '8px',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center'
                    }}>
                        <Heart size={16} color="white" fill="currentColor" />
                    </div>
                    <h3 style={{
                        fontWeight: 800,
                        fontSize: '1.125rem',
                        margin: 0,
                        letterSpacing: '-0.05em',
                        color: 'white'
                    }}>
                        Baitulmal<span style={{ color: 'var(--primary)' }}> Fajar Maqbul</span>
                    </h3>
                </div>

                <div style={{ display: 'flex', alignItems: 'center', gap: '2rem' }}>
                    <a href="/public" style={{ fontSize: '0.75rem', fontWeight: 700, color: '#a1a1aa', textDecoration: 'none', transition: 'color 0.2s' }} onMouseOver={(e) => e.target.style.color = 'white'} onMouseOut={(e) => e.target.style.color = '#a1a1aa'}>Public</a>
                    <a href="/tatakelola" style={{ fontSize: '0.75rem', fontWeight: 700, color: 'white', textDecoration: 'none' }}>Tata Kelola</a>
                    <a href="/etalase" style={{ fontSize: '0.75rem', fontWeight: 700, color: '#a1a1aa', textDecoration: 'none', transition: 'color 0.2s' }} onMouseOver={(e) => e.target.style.color = 'white'} onMouseOut={(e) => e.target.style.color = '#a1a1aa'}>Etalase</a>
                    <a href="/login" style={{
                        padding: '8px 16px',
                        borderRadius: '8px',
                        background: 'rgba(255, 255, 255, 0.05)',
                        border: '1px solid rgba(255, 255, 255, 0.05)',
                        fontSize: '0.75rem',
                        fontWeight: 700,
                        color: 'white',
                        textDecoration: 'none',
                        display: 'flex',
                        alignItems: 'center',
                        gap: '8px',
                        transition: 'all 0.2s'
                    }} onMouseOver={(e) => e.target.style.background = 'rgba(255, 255, 255, 0.1)'} onMouseOut={(e) => e.target.style.background = 'rgba(255, 255, 255, 0.05)'}>
                        Admin <ArrowRight size={12} />
                    </a>
                </div>
            </nav>

            <div className="page-container" style={{ maxWidth: '1200px', margin: '0 auto', padding: '8rem 2rem 2rem' }}>
                {/* Hero Section */}
                <div style={{ textAlign: 'center', marginBottom: '6rem' }}>
                    <div style={{
                        display: 'inline-flex',
                        alignItems: 'center',
                        gap: '12px',
                        background: 'rgba(59, 130, 246, 0.1)',
                        padding: '10px 24px',
                        borderRadius: '100px',
                        color: 'var(--primary)',
                        fontWeight: 700,
                        fontSize: '0.85rem',
                        marginBottom: '2rem',
                        letterSpacing: '0.05em'
                    }}>
                        <ShieldCheck size={18} />
                        <span>GOVERNANCE & TRANSPARENCY</span>
                    </div>
                    <h1 style={{
                        fontSize: 'clamp(3rem, 8vw, 4.5rem)',
                        fontWeight: 900,
                        letterSpacing: '-0.06em',
                        color: '#fff',
                        marginBottom: '1.5rem',
                        lineHeight: 1
                    }}>
                        TATA KELOLA <span style={{ color: 'var(--primary)' }}>BAITULMAL</span>
                    </h1>
                    <p style={{
                        fontSize: '1.25rem',
                        color: 'rgba(255, 255, 255, 0.5)',
                        maxWidth: '800px',
                        margin: '0 auto',
                        lineHeight: 1.6,
                        fontWeight: 500
                    }}>
                        Standar Prosedur Operasional (SOP) profesional untuk memastikan pengelolaan
                        dana umat yang mandiri, akuntabel, dan memberikan manfaat luas.
                    </p>
                </div>

                {/* Navigation Scroll */}
                <div style={{ display: 'flex', justifyContent: 'center', gap: '1.5rem', marginBottom: '6rem' }}>
                    <button
                        onClick={() => scrollToSection('konsumtif')}
                        style={{
                            borderRadius: '100px',
                            padding: '14px 28px',
                            background: 'var(--primary)',
                            color: 'white',
                            border: 'none',
                            fontWeight: 800,
                            fontSize: '0.85rem',
                            cursor: 'pointer',
                            display: 'flex',
                            alignItems: 'center',
                            gap: '10px',
                            boxShadow: '0 10px 20px rgba(59, 130, 246, 0.2)'
                        }}
                    >
                        <Heart size={18} />
                        PROGRAM KONSUMTIF
                    </button>
                    <button
                        onClick={() => scrollToSection('produktif')}
                        style={{
                            borderRadius: '100px',
                            padding: '14px 28px',
                            background: 'rgba(255, 255, 255, 0.05)',
                            color: 'white',
                            border: '1px solid rgba(255, 255, 255, 0.1)',
                            fontWeight: 800,
                            fontSize: '0.85rem',
                            cursor: 'pointer',
                            display: 'flex',
                            alignItems: 'center',
                            gap: '10px'
                        }}
                    >
                        <TrendingUp size={18} />
                        PROGRAM PRODUKTIF
                    </button>
                    <button
                        onClick={() => scrollToSection('umum')}
                        style={{
                            borderRadius: '100px',
                            padding: '14px 28px',
                            background: 'transparent',
                            color: 'rgba(255, 255, 255, 0.6)',
                            border: 'none',
                            fontWeight: 800,
                            fontSize: '0.85rem',
                            cursor: 'pointer',
                            display: 'flex',
                            alignItems: 'center',
                            gap: '10px'
                        }}
                    >
                        <Layers size={18} />
                        WORKFLOW UMUM
                    </button>
                </div>

                {/* A. WORKFLOW KEGIATAN KONSUMTIF */}
                <section id="konsumtif" style={{ marginBottom: '8rem' }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '20px', marginBottom: '3rem' }}>
                        <div style={{ width: '50px', height: '50px', background: 'var(--primary)', borderRadius: '16px', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#fff' }}>
                            <Heart size={28} />
                        </div>
                        <div>
                            <h2 style={{ fontSize: '2rem', fontWeight: 900, margin: 0, color: 'white', letterSpacing: '-0.04em' }}>A. WORKFLOW KEGIATAN KONSUMTIF</h2>
                            <p style={{ color: 'rgba(255, 255, 255, 0.4)', fontSize: '1rem', fontWeight: 500, margin: '4px 0 0' }}>Bantuan jangka pendek untuk pemenuhan kebutuhan dasar mustahik.</p>
                        </div>
                    </div>

                    <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))', gap: '2rem', marginBottom: '3rem' }}>
                        <WorkflowCard
                            number="1"
                            title="Perencanaan"
                            icon={ClipboardList}
                            steps={[
                                "Identifikasi kebutuhan mustahik",
                                "Pendataan & verifikasi (survey lapangan)",
                                "Penetapan kriteria penerima",
                                "Penyusunan anggaran program",
                                "Persetujuan pimpinan/pengurus"
                            ]}
                        />
                        <WorkflowCard
                            number="2"
                            title="Pengajuan & Seleksi"
                            icon={Search}
                            steps={[
                                "Penerimaan proposal / permohonan",
                                "Verifikasi dokumen (KK, KTP, SKTM)",
                                "Survey kelayakan",
                                "Rapat penetapan penerima"
                            ]}
                        />
                        <WorkflowCard
                            number="3"
                            title="Penyaluran Bantuan"
                            icon={Save}
                            color="success"
                            steps={[
                                "Santunan fakir & miskin (Tunai/Sembako)",
                                "Bantuan pendidikan (ke sekolah/siswa)",
                                "Bantuan kesehatan (ke RS/Klaim)",
                                "Respons cepat darurat & logistik",
                                "Santunan yatim & dhuafa rutin",
                                "Bantuan jenazah (fast track)"
                            ]}
                        />
                        <WorkflowCard
                            number="4"
                            title="Monitoring & Evaluasi"
                            icon={Activity}
                            steps={[
                                "Dokumentasi penyaluran",
                                "Tanda terima & laporan resmi",
                                "Evaluasi dampak jangka pendek",
                                "Laporan ke pengurus & donatur"
                            ]}
                        />
                    </div>

                    {/* Sub-types Visualization */}
                    <div style={{
                        padding: '2.5rem',
                        border: '1px dashed rgba(255, 255, 255, 0.12)',
                        borderRadius: '32px',
                        background: 'rgba(18, 18, 18, 0.4)',
                        backdropFilter: 'blur(8px)'
                    }}>
                        <h4 style={{ marginBottom: '2rem', fontSize: '1.1rem', fontWeight: 800, color: 'white', display: 'flex', alignItems: 'center', gap: '10px' }}>
                            <PlusCircle size={20} color="var(--primary)" /> KLASIFIKASI PENYALURAN KONSUMTIF
                        </h4>
                        <div style={{ display: 'flex', flexWrap: 'wrap', gap: '16px' }}>
                            <TypeBadge text="🥖 Santunan Fakir" color="danger" />
                            <TypeBadge text="🎒 Pendidikan" color="primary" />
                            <TypeBadge text="🏥 Kesehatan" color="success" />
                            <TypeBadge text="🏠 Logistik Darurat" color="warning" />
                            <TypeBadge text="🍚 Sembako" color="danger" />
                            <TypeBadge text="🧕 Santunan Yatim" color="info" />
                            <TypeBadge text="⚰️ Bantuan Kematian" color="dark" />
                            <TypeBadge text="🎉 Event Budaya" color="primary" />
                        </div>
                    </div>
                </section>

                {/* B. WORKFLOW KEGIATAN PRODUKTIF */}
                <section id="produktif" style={{ marginBottom: '8rem' }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '20px', marginBottom: '3rem' }}>
                        <div style={{ width: '50px', height: '50px', background: 'var(--warning)', borderRadius: '16px', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#fff' }}>
                            <TrendingUp size={28} />
                        </div>
                        <div>
                            <h2 style={{ fontSize: '2rem', fontWeight: 900, margin: 0, color: 'white', letterSpacing: '-0.04em' }}>B. WORKFLOW KEGIATAN PRODUKTIF</h2>
                            <p style={{ color: 'rgba(255, 255, 255, 0.4)', fontSize: '1rem', fontWeight: 500, margin: '4px 0 0' }}>Program pemberdayaan untuk mengubah status Mustahik menjadi Muzaki.</p>
                        </div>
                    </div>

                    <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))', gap: '2.5rem', marginBottom: '3rem' }}>
                        <WorkflowCard
                            number="1"
                            title="Identifikasi & Seleksi"
                            icon={UserCheck}
                            color="warning"
                            steps={[
                                "Pendataan mustahik potensial usaha",
                                "Survey usaha / minat usaha",
                                "Analisis kelayakan bisnis",
                                "Wawancara & komitmen peserta"
                            ]}
                        />
                        <WorkflowCard
                            number="2"
                            title="Perencanaan Program"
                            icon={Calendar}
                            color="warning"
                            steps={[
                                "Penentuan jenis bantuan modal/alat",
                                "Penyusunan RAB program",
                                "Penetapan target & indikator (KPI)",
                                "Penandatanganan akad syariah"
                            ]}
                        />
                        <WorkflowCard
                            number="3"
                            title="Pelaksanaan Program"
                            icon={Briefcase}
                            color="success"
                            steps={[
                                "Modal usaha (Transfer/Alat)",
                                "Pelatihan & Sertifikasi Skill",
                                "Bantuan Ternak & Pengadaan",
                                "Pendampingan teknis UMKM",
                                "Dana bergulir & Akad"
                            ]}
                        />
                        <div style={{ display: 'flex', flexDirection: 'column', gap: '2.5rem' }}>
                            <WorkflowCard
                                number="4"
                                title="Pendampingan"
                                icon={Activity}
                                color="info"
                                steps={[
                                    "Kunjungan berkala (Mentoring)",
                                    "Laporan perkembangan usaha",
                                    "Evaluasi omzet bulanan"
                                ]}
                            />
                            <WorkflowCard
                                number="5"
                                title="Exit Strategy"
                                icon={ArrowRight}
                                color="primary"
                                steps={[
                                    "Verifikasi kemandirian ekonomi",
                                    "Naik status: Mustahik → Muzaki",
                                    "Replikasi ke penerima baru"
                                ]}
                            />
                        </div>
                    </div>
                </section>

                {/* 🔄 WORKFLOW UMUM */}
                <section id="umum" style={{
                    marginBottom: '4rem',
                    background: 'rgba(18, 18, 18, 0.6)',
                    padding: '5rem 3rem',
                    borderRadius: '48px',
                    border: '1px solid rgba(255, 255, 255, 0.08)',
                    backdropFilter: 'blur(10px)'
                }}>
                    <div style={{ textAlign: 'center', marginBottom: '4rem' }}>
                        <div style={{ color: 'var(--primary)', fontWeight: 800, fontSize: '0.8rem', letterSpacing: '0.4em', textTransform: 'uppercase', marginBottom: '1rem' }}>End-to-End Pipeline</div>
                        <h2 style={{ fontSize: '2.5rem', fontWeight: 900, marginBottom: '1rem', color: 'white', letterSpacing: '-0.05em' }}>WORKFLOW INTEGRASI <span style={{ color: 'var(--primary)' }}>(HULU KE HILIR)</span></h2>
                        <p style={{ color: 'rgba(255, 255, 255, 0.4)', maxWidth: '600px', margin: '0 auto' }}>Siklus utuh pengelolaan dana umat untuk menjamin akuntabilitas di setiap tahapan.</p>
                    </div>

                    <div style={{
                        display: 'flex',
                        flexDirection: 'column',
                        alignItems: 'center',
                        maxWidth: '850px',
                        margin: '0 auto',
                        gap: '20px'
                    }}>
                        {[
                            { title: 'Penghimpunan Dana', icon: <Coins size={22} />, sub: 'Zakat, Infak, Sedekah, Wakaf' },
                            { title: 'Perencanaan Program', icon: <Settings size={22} />, sub: 'Penyusunan Anggaran & Strategi' },
                            { title: 'Seleksi Penerima', icon: <UserCheck size={22} />, sub: 'Verifikasi & Validasi Mustahik' },
                            { title: 'Penyaluran', icon: <Share2 size={22} />, sub: 'Distribusi Dana/Barang' },
                            { title: 'Monitoring', icon: <Activity size={22} />, sub: 'Pengawasan Pelaksanaan' },
                            { title: 'Pelaporan & Audit', icon: <FileText size={22} />, sub: 'Pertanggungjawaban Keuangan' },
                            { title: 'Publikasi & Transparansi', icon: <Eye size={22} />, sub: 'Informasi kepada Publik' },
                        ].map((item, index, arr) => (
                            <React.Fragment key={index}>
                                <div style={{
                                    width: '100%',
                                    padding: '1.75rem 2.5rem',
                                    display: 'flex',
                                    alignItems: 'center',
                                    gap: '24px',
                                    background: '#121212',
                                    border: '1px solid rgba(255, 255, 255, 0.08)',
                                    borderRadius: '24px',
                                    transition: 'all 0.3s ease',
                                    cursor: 'default',
                                    boxShadow: '0 20px 40px -10px rgba(0, 0, 0, 0.4)'
                                }} onMouseOver={(e) => {
                                    e.currentTarget.style.transform = 'scale(1.02) translateY(-4px)';
                                    e.currentTarget.style.borderColor = 'rgba(59, 130, 246, 0.4)';
                                    e.currentTarget.style.boxShadow = '0 30px 60px -12px rgba(0, 0, 0, 0.6)';
                                }} onMouseOut={(e) => {
                                    e.currentTarget.style.transform = 'scale(1)';
                                    e.currentTarget.style.borderColor = 'rgba(255, 255, 255, 0.08)';
                                    e.currentTarget.style.boxShadow = '0 20px 40px -10px rgba(0, 0, 0, 0.4)';
                                }}>
                                    <div style={{
                                        width: '50px',
                                        height: '50px',
                                        borderRadius: '14px',
                                        background: 'var(--primary)',
                                        color: '#fff',
                                        display: 'flex',
                                        alignItems: 'center',
                                        justifyContent: 'center',
                                        boxShadow: '0 10px 20px -5px rgba(59, 130, 246, 0.4)'
                                    }}>
                                        {item.icon}
                                    </div>
                                    <div style={{ flex: 1 }}>
                                        <h4 style={{ margin: 0, fontWeight: 800, color: 'white', fontSize: '1.15rem' }}>{item.title}</h4>
                                        <p style={{ margin: '4px 0 0', fontSize: '0.95rem', color: 'rgba(255,255,255,0.4)', fontWeight: 500 }}>{item.sub}</p>
                                    </div>
                                    <div style={{ opacity: 0.1, fontSize: '2.5rem', fontWeight: 900, color: 'white', fontStyle: 'italic', letterSpacing: '-0.05em' }}>
                                        {index + 1 < 10 ? `0${index + 1}` : index + 1}
                                    </div>
                                </div>
                                {index < arr.length - 1 && (
                                    <ArrowRight size={28} style={{ color: 'rgba(255,255,255,0.1)', transform: 'rotate(90deg)', margin: '4px 0' }} />
                                )}
                            </React.Fragment>
                        ))}
                    </div>
                </section>

                <footer style={{
                    textAlign: 'center',
                    padding: '8rem 0 4rem',
                    color: 'rgba(255, 255, 255, 0.3)',
                    borderTop: '1px solid rgba(255, 255, 255, 0.05)',
                    marginTop: '4rem'
                }}>
                    <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '0.75rem', marginBottom: '1.5rem' }}>
                        <div style={{ width: '24px', height: '24px', background: 'rgba(255, 255, 255, 0.05)', borderRadius: '6px', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                            <Heart size={12} fill="currentColor" />
                        </div>
                        <span style={{ fontSize: '0.75rem', fontWeight: 800, color: 'white', letterSpacing: '0.1em', textTransform: 'uppercase' }}>BAITULMAL FAJAR MAQBUL GLOBAL</span>
                    </div>
                    <p style={{ fontSize: '0.85rem', fontWeight: 600, maxWidth: '500px', margin: '0 auto 1rem', lineHeight: 1.6 }}>Sistem Tata Kelola Dana Ummat Berbasis Transparansi, Akuntabilitas, dan Integritas Tinggi.</p>
                    <p style={{ fontSize: '0.75rem', fontWeight: 500 }}>&copy; {new Date().getFullYear()} Baitulmal Fajar Maqbul Development. All Rights Reserved.</p>
                </footer>
            </div>
        </div>
    );
};

export default TataKelola;
