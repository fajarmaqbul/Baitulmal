import React, { useState, useEffect } from 'react';
import api from '../services/api';
import { Card, CardContent } from '../components/ui/card';
import { Badge } from '../components/ui/badge';
import { Search, ShoppingBag, MessageCircle, MapPin, Tag, Heart, Zap, ArrowRight, Landmark } from 'lucide-react';

const Etalase = () => {
    const [products, setProducts] = useState([]);
    const [loading, setLoading] = useState(true);
    const [filters, setFilters] = useState({
        search: '',
        category: 'All'
    });

    const categories = ['All', 'Kuliner', 'Kerajinan', 'Jasa', 'Lainnya'];

    const productImageMap = {
        'Kripik Pisang Kepok Manis': '/images/products/kripik_pisang_etalase_1771967201005.png',
        'Kerajinan Anyaman Bambu': '/images/products/anyaman_bambu_etalase_1771967219545.png',
        'Sambal Pecel Madiun Asli': '/images/products/sambal_pecel_etalase_1771967237842.png',
        'Jasa Laundry Setrika': '/images/products/laundry_service_etalase_1771967256614.png',
        'Gantungan Kunci Kayu Ukir': '/images/products/ukir_kayu_etalase_1771967272266.png',
        'Telur Asin Aneka Rasa': '/images/products/telur_asin_etalase_1771967293624.png',
        'Keripik Singkong': '/images/products/kripik_singkong_etalase_1771967311878.png',
        'Tas Anyaman Pandan': '/images/products/tas_pandan_etalase_1771967330970.png',
        'Jasa Jahit & Permak': '/images/products/jasa_jahit_etalase_1771967352340.png',
        'Kemeja Batik Cap': '/images/products/batik_cap_etalase_1771967372319.png',
        'Sambal Bawang Botol': '/images/products/sambal_bawang_botol_etalase_v2_1771989232801.png',
    };

    useEffect(() => {
        fetchProducts();
    }, [filters.category]);



    const fetchProducts = async () => {
        setLoading(true);
        try {
            const params = {};
            if (filters.category !== 'All') params.category = filters.category;
            if (filters.search) params.search = filters.search;

            const response = await api.get('/products-public', { params });
            setProducts(response.data.data);
        } catch (error) {
            console.error("Failed to fetch products", error);
        } finally {
            setLoading(false);
        }
    };

    const handleSearch = (e) => {
        e.preventDefault();
        fetchProducts();
    };

    const handleBuy = (product) => {
        const message = `Halo ${product.seller_name}, saya lihat *${product.name}* di Etalase Baitulmal. Apakah stok masih tersedia?`;
        const url = `https://wa.me/${product.seller_phone}?text=${encodeURIComponent(message)}`;
        window.open(url, '_blank');
    };

    return (
        <div className="min-h-screen bg-[#0a0a0a] text-[#e4e4e7] selection:bg-primary selection:text-white font-['Inter',_sans-serif] scroll-smooth">
            {/* Navbar */}
            <nav className="fixed top-0 left-0 right-0 z-50 border-b border-white/[0.05] bg-[#0a0a0a]/80 backdrop-blur-2xl">
                <div className="w-full px-10 h-[72px] flex items-center justify-between">
                    <div className="flex items-center gap-3">
                        <div className="w-9 h-9 bg-primary rounded-xl flex items-center justify-center shadow-lg shadow-primary/10">
                            <Heart className="text-white" size={18} fill="currentColor" />
                        </div>
                        <h3 className="font-black text-xl tracking-tighter text-white m-0 leading-none">Baitulmal<span className="text-primary"> Fajar Maqbul</span></h3>
                    </div>
                    <div className="flex items-center gap-10">
                        <a href="/public" className="text-[13px] font-bold text-[#94a3b8] hover:text-white transition-all decoration-none">Public</a>
                        <a href="/tatakelola" className="text-[13px] font-bold text-[#94a3b8] hover:text-white transition-all decoration-none">Tata Kelola</a>
                        <a href="/tatakelola/zakat-fitrah" className="text-[13px] font-bold text-[#94a3b8] hover:text-white transition-all decoration-none">Zakat Fitrah</a>
                        <a href="/tatakelola/zakat-produktif" className="text-[13px] font-bold text-[#94a3b8] hover:text-white transition-all decoration-none">Zakat Produktif</a>
                        <a href="/etalase" className="text-[13px] font-bold text-white transition-all decoration-none border-b-2 border-primary pb-1">Etalase</a>
                        <a href="/login" style={{
                            padding: '10px 20px', borderRadius: '12px', background: 'var(--primary)',
                            fontSize: '0.8rem', fontWeight: 800, color: 'white', textDecoration: 'none',
                            boxShadow: '0 8px 16px -4px rgba(59, 130, 246, 0.5)'
                        }}>ADMIN PORTAL</a>
                    </div>
                </div>
            </nav>

            {/* Hero Section */}
            <header className="relative pt-48 pb-24 px-10 overflow-hidden">
                <div className="absolute top-0 left-1/2 -translate-x-1/2 w-[1200px] h-[600px] bg-emerald-500/5 blur-[120px] rounded-full -mt-40"></div>
                <div className="max-w-6xl mx-auto text-center relative z-10">
                    <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-emerald-500/5 border border-emerald-500/10 text-emerald-500 text-[10px] font-bold tracking-[0.2em] uppercase mb-8">
                        <ShoppingBag size={10} fill="currentColor" /> Zakat Produktif Program
                    </div>
                    <h1 className="text-5xl md:text-7xl font-black text-white mb-6 tracking-tight leading-[1.1]">
                        Etalase <span className="text-emerald-500">Public</span> <br />
                        UMKM Binaan Fajar Maqbul
                    </h1>
                    <p className="max-w-2xl mx-auto text-[#a1a1aa] text-lg md:text-xl leading-relaxed font-medium mb-12">
                        Dukung ekonomi lokal dengan membeli produk karya mustahik & warga binaan. Belanja berkah, memberdayakan umat.
                    </p>

                    {/* Search Bar - Solid Design */}
                    <form onSubmit={handleSearch} className="relative max-w-xl mx-auto">
                        <input
                            type="text"
                            placeholder="Cari camilan, kerajinan, atau jasa..."
                            className="w-full pl-12 pr-4 py-4 rounded-xl text-white bg-white/[0.03] focus:outline-none focus:ring-1 focus:ring-emerald-500/50 border border-white/[0.05] placeholder-[#71717a] text-sm font-medium transition-all"
                            value={filters.search}
                            onChange={(e) => setFilters(prev => ({ ...prev, search: e.target.value }))}
                        />
                        <Search className="absolute left-4 top-4 text-[#71717a]" size={18} />
                        <button type="submit" className="absolute right-2 top-2 bg-emerald-500 text-white px-6 py-2 rounded-lg hover:bg-emerald-600 transition-all font-bold text-[10px] uppercase tracking-widest shadow-lg shadow-emerald-500/20">
                            Cari
                        </button>
                    </form>
                </div>
            </header>

            {/* Main Content */}
            <main className="w-full px-10 pb-32">
                {/* Category Filter */}
                <div className="flex overflow-x-auto pb-6 gap-3 no-scrollbar justify-center mb-16 border-b border-white/[0.03]">
                    {categories.map(cat => (
                        <button
                            key={cat}
                            onClick={() => setFilters(prev => ({ ...prev, category: cat }))}
                            className={`px-6 py-2.5 rounded-lg whitespace-nowrap transition-all font-bold text-[10px] uppercase tracking-widest border ${filters.category === cat
                                ? 'bg-emerald-500 border-emerald-500 text-white shadow-lg shadow-emerald-500/10'
                                : 'bg-white/[0.02] border-white/[0.05] text-[#71717a] hover:text-white hover:border-white/[0.1]'
                                }`}
                        >
                            {cat}
                        </button>
                    ))}
                </div>

                {/* Product Grid */}
                {loading ? (
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 2xl:grid-cols-5 gap-8">
                        {[1, 2, 3, 4, 5].map(i => (
                            <div key={i} className="h-96 bg-white/[0.02] rounded-3xl animate-pulse border border-white/[0.03]"></div>
                        ))}
                    </div>
                ) : products.length === 0 ? (
                    <div className="text-center py-32 bg-white/[0.01] rounded-3xl border border-white/[0.03]">
                        <ShoppingBag size={40} className="text-[#27272a] mx-auto mb-6" />
                        <h3 className="text-xl font-bold text-white mb-2">Belum ada produk</h3>
                        <p className="text-[#71717a] text-sm">Coba kata kunci lain atau pilih kategori yang berbeda.</p>
                    </div>
                ) : (
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 2xl:grid-cols-5 gap-8">
                        {products.map(product => (
                            <div key={product.id} className="group bg-[#121212] border border-white/[0.03] hover:border-emerald-500/20 transition-all duration-500 rounded-3xl overflow-hidden flex flex-col shadow-xl">
                                {/* Image Area */}
                                <div className="h-56 bg-black/40 relative overflow-hidden group/img">
                                    {(product.image_url || productImageMap[product.name]) ? (
                                        <img
                                            src={product.image_url || productImageMap[product.name]}
                                            alt={product.name}
                                            className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-700 opacity-90 group-hover:opacity-100"
                                        />
                                    ) : (
                                        <div className="w-full h-full flex items-center justify-center text-[#27272a]">
                                            <ShoppingBag size={48} strokeWidth={1} />
                                        </div>
                                    )}
                                    <div className="absolute top-4 left-4">
                                        <span className="px-3 py-1 rounded-lg bg-black/60 backdrop-blur-md text-[#e4e4e7] text-[9px] font-bold uppercase tracking-widest border border-white/5">
                                            {product.category}
                                        </span>
                                    </div>
                                </div>

                                {/* Content Area */}
                                <div className="p-6 flex-1 flex flex-col">
                                    <div className="mb-6">
                                        <h3 className="text-lg font-bold text-white mb-2 line-clamp-1 tracking-tight">
                                            {product.name}
                                        </h3>
                                        <p className="text-[#71717a] text-xs leading-relaxed line-clamp-2 h-8 font-medium">
                                            {product.description || 'Produk UMKM binaan Masjid Baitulmal Fajar Maqbul.'}
                                        </p>
                                    </div>

                                    {/* Seller Info */}
                                    <div className="flex items-center gap-3 p-3 rounded-xl bg-white/[0.02] border border-white/[0.03] mb-6">
                                        <div className="w-8 h-8 rounded-lg bg-emerald-500/10 text-emerald-500 flex items-center justify-center text-xs font-black">
                                            {product.seller_name.charAt(0)}
                                        </div>
                                        <div className="flex-1 min-w-0">
                                            <p className="text-[11px] font-bold text-white truncate m-0 uppercase">{product.seller_name}</p>
                                            <div className="flex items-center gap-1 text-[9px] font-bold text-[#71717a] uppercase tracking-wider mt-0.5">
                                                <MapPin size={8} className="text-emerald-500" /> {product.rt ? `RT ${product.rt.kode}` : 'Kandri'}
                                            </div>
                                        </div>
                                    </div>

                                    {/* Action Area */}
                                    <div className="mt-auto pt-5 border-t border-white/[0.03] flex items-center justify-between gap-4">
                                        <div>
                                            <p className="text-[9px] font-bold text-[#71717a] uppercase tracking-widest m-0 mb-0.5">Harga</p>
                                            <p className="text-lg font-black text-white m-0 tracking-tighter">
                                                Rp {Number(product.price).toLocaleString('id-ID')}
                                            </p>
                                        </div>
                                        <button
                                            onClick={() => handleBuy(product)}
                                            className="px-5 py-2.5 rounded-xl bg-emerald-500 text-white font-bold text-[9px] tracking-widest uppercase hover:bg-emerald-600 transition-all flex items-center gap-2 shadow-lg shadow-emerald-500/10"
                                        >
                                            <MessageCircle size={14} /> WhatsApp
                                        </button>
                                    </div>
                                </div>
                            </div>
                        ))}
                    </div>
                )}
            </main>

            {/* Footer */}
            <footer className="py-24 border-t border-white/[0.03] text-center bg-black/20">
                <div className="flex items-center justify-center gap-3 mb-8">
                    <div className="w-6 h-6 bg-emerald-500/10 rounded-md flex items-center justify-center text-emerald-500">
                        <ShoppingBag size={14} fill="currentColor" />
                    </div>
                    <span className="text-sm font-bold text-white tracking-widest uppercase">Baitulmal Fajar Maqbul Etalase</span>
                </div>
                <p className="text-[#71717a] text-[9px] font-bold tracking-[0.5em] uppercase mb-10 m-0">Economic Empowerment &bull; Local Wisdom &bull; Productivity</p>
                <div className="text-[10px] text-[#71717a] font-medium">&copy; {new Date().getFullYear()} UMKM Digital Ecosystem.</div>
            </footer>
        </div>
    );
};

export default Etalase;
