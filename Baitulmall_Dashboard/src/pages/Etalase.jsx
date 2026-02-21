import React, { useState, useEffect } from 'react';
import api from '../services/api';
import { Card, CardContent } from '../components/ui/card';
import { Badge } from '../components/ui/badge';
import { Search, ShoppingBag, MessageCircle, MapPin, Tag } from 'lucide-react';

const Etalase = () => {
    const [products, setProducts] = useState([]);
    const [loading, setLoading] = useState(true);
    const [filters, setFilters] = useState({
        search: '',
        category: 'All'
    });

    const categories = ['All', 'Kuliner', 'Kerajinan', 'Jasa', 'Lainnya'];

    useEffect(() => {
        fetchProducts();
    }, [filters.category]);

    const fetchProducts = async () => {
        setLoading(true);
        try {
            const params = {};
            if (filters.category !== 'All') params.category = filters.category;
            if (filters.search) params.search = filters.search;

            const response = await api.get('/products', { params });
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
        const message = `Halo ${product.seller_name}, saya lihat *${product.name}* di Etalase Baitulmall. Apakah stok masih tersedia?`;
        const url = `https://wa.me/${product.seller_phone}?text=${encodeURIComponent(message)}`;
        window.open(url, '_blank');
    };

    return (
        <div className="space-y-8 animate-fade-in pb-10">
            {/* Header */}
            <div className="flex items-center justify-between py-4 px-2">
                <div className="flex items-center gap-3">
                    <div className="w-10 h-10 bg-gradient-to-tr from-[var(--primary)] to-emerald-400 rounded-xl flex items-center justify-center text-white font-bold text-xl shadow-lg shadow-emerald-200">
                        B
                    </div>
                    <div>
                        <h1 className="font-bold text-xl text-[var(--text-main)] tracking-tight">Baitulmall</h1>
                        <p className="text-xs text-[var(--text-muted)]">Masjid Fajar Maqbul</p>
                    </div>
                </div>
                <a href="/login" className="px-5 py-2 rounded-xl border border-[var(--border-color)] text-[var(--text-muted)] hover:text-[var(--primary)] hover:border-[var(--primary)] hover:bg-[var(--primary)]/5 transition-all font-medium text-sm">
                    Login Admin
                </a>
            </div>

            {/* Hero Section */}
            <div className="bg-gradient-to-r from-[var(--primary)] to-[var(--primary-hover)] rounded-3xl p-8 md:p-12 text-white shadow-lg relative overflow-hidden">
                <div className="relative z-10 max-w-2xl">
                    <div className="flex items-center gap-3 mb-4">
                        <div className="p-2 bg-white/10 rounded-lg backdrop-blur-sm">
                            <ShoppingBag size={24} />
                        </div>
                        <span className="font-semibold tracking-wider text-sm uppercase bg-white/10 px-3 py-1 rounded-full text-white">Zakat Produktif</span>
                    </div>
                    <h1 className="text-4xl md:text-5xl font-bold mb-4 leading-tight">
                        Etalase UMKM Binaan
                    </h1>
                    <p className="text-lg opacity-90 mb-8 leading-relaxed">
                        Belanja sambil beramal. Dukung ekonomi lokal dengan membeli produk karya warga binaan dan mustahik Baitulmall.
                    </p>

                    {/* Search Bar in Hero */}
                    <form onSubmit={handleSearch} className="relative max-w-lg">
                        <input
                            type="text"
                            placeholder="Cari camilan, kerajinan, atau jasa..."
                            className="w-full pl-12 pr-4 py-4 rounded-xl text-[var(--text-main)] bg-[var(--card-bg)] focus:outline-none focus:ring-4 focus:ring-white/10 shadow-xl border border-[var(--border-color)] placeholder-[var(--text-muted)]"
                            value={filters.search}
                            onChange={(e) => setFilters(prev => ({ ...prev, search: e.target.value }))}
                        />
                        <Search className="absolute left-4 top-4 text-[var(--text-muted)]" size={24} />
                        <button type="submit" className="absolute right-2 top-2 bg-[var(--primary)] text-white px-6 py-2 rounded-lg hover:brightness-110 transition-all font-medium">
                            Cari
                        </button>
                    </form>
                </div>

                {/* Decorative Pattern */}
                <div className="absolute right-0 top-0 w-1/3 h-full opacity-10 hidden md:block">
                    <svg viewBox="0 0 200 200" xmlns="http://www.w3.org/2000/svg">
                        <path fill="#FFFFFF" d="M42.7,-62.9C50.9,-52.8,50.1,-34.4,51.7,-19.2C53.4,-4,57.4,8,54,17.7C50.6,27.4,39.8,34.8,29.3,46.3C18.8,57.8,8.5,73.4,-4.3,79.3C-17.1,85.2,-32.4,81.3,-43.3,70.5C-54.2,59.7,-60.7,41.9,-65.7,24.4C-70.7,6.9,-74.2,-10.3,-68.6,-24.8C-63,-39.3,-48.3,-51.1,-34.5,-58.5C-20.7,-65.9,-7.8,-68.9,4,-74.3C15.8,-79.8,34.5,-73,42.7,-62.9Z" transform="translate(100 100)" />
                    </svg>
                </div>
            </div>

            {/* Category Filter */}
            <div className="flex overflow-x-auto pb-2 gap-3 no-scrollbar">
                {categories.map(cat => (
                    <button
                        key={cat}
                        onClick={() => setFilters(prev => ({ ...prev, category: cat }))}
                        className={`px-6 py-2 rounded-full whitespace-nowrap transition-all font-medium ${filters.category === cat
                            ? 'bg-[var(--primary)] text-white shadow-md'
                            : 'bg-[var(--card-bg)] border border-[var(--border-color)] text-[var(--text-muted)] hover:bg-[var(--background)]'
                            }`}
                    >
                        {cat}
                    </button>
                ))}
            </div>

            {/* Product Grid */}
            {loading ? (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                    {[1, 2, 3, 4].map(i => (
                        <div key={i} className="h-80 bg-[var(--card-bg)] rounded-2xl animate-pulse"></div>
                    ))}
                </div>
            ) : products.length === 0 ? (
                <div className="text-center py-20 bg-[var(--card-bg)] rounded-3xl border border-dashed border-[var(--border-color)]">
                    <ShoppingBag size={48} className="mx-auto text-[var(--text-muted)] mb-4" />
                    <h3 className="text-xl font-bold text-[var(--text-muted)]">Belum ada produk ditemukan</h3>
                    <p className="text-[var(--text-muted)] opacity-70">Coba kata kunci lain atau kategori berbeda.</p>
                </div>
            ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
                    {products.map(product => (
                        <Card key={product.id} className="group hover:shadow-xl transition-all duration-300 border border-[var(--border-color)] bg-[var(--card-bg)] overflow-hidden rounded-2xl h-full flex flex-col">
                            {/* Image Placeholder */}
                            <div className="h-48 bg-[var(--background)] relative overflow-hidden">
                                {product.image_url ? (
                                    <img src={product.image_url} alt={product.name} className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500" />
                                ) : (
                                    <div className="w-full h-full flex items-center justify-center bg-[var(--background)] text-[var(--text-muted)]">
                                        <ShoppingBag size={48} />
                                    </div>
                                )}
                                <div className="absolute top-3 left-3">
                                    <Badge className="bg-[var(--card-bg)]/90 backdrop-blur-md text-[var(--text-main)] hover:bg-[var(--card-bg)] shadow-sm border border-[var(--border-color)]">
                                        {product.category}
                                    </Badge>
                                </div>
                            </div>

                            <CardContent className="p-5 flex-1 flex flex-col">
                                <div className="flex-1">
                                    <h3 className="font-bold text-lg text-[var(--text-main)] mb-1 line-clamp-1 group-hover:text-[var(--primary)] transition-colors">
                                        {product.name}
                                    </h3>
                                    <p className="text-sm text-[var(--text-muted)] mb-3 line-clamp-2 h-10">
                                        {product.description || 'Tidak ada deskripsi.'}
                                    </p>

                                    <div className="flex items-center gap-2 mb-4 text-xs font-medium text-[var(--text-muted)] bg-[var(--background)] border border-[var(--border-color)] p-2 rounded-lg">
                                        <div className="w-6 h-6 rounded-full bg-[var(--primary)]/10 text-[var(--primary)] flex items-center justify-center">
                                            {product.seller_name.charAt(0)}
                                        </div>
                                        <div className="flex-1 truncate">
                                            {product.seller_name}
                                        </div>
                                        <div className="flex items-center gap-1 text-[var(--primary)] text-xs">
                                            {product.rt ? `RT ${product.rt.kode}` : 'N/A'}
                                            {product.maps_link && (
                                                <a href={product.maps_link} target="_blank" rel="noreferrer" className="ml-2 bg-[var(--background)] p-1 rounded-full hover:bg-[var(--primary)] hover:text-white transition-colors" title="Lihat Lokasi">
                                                    <MapPin size={12} />
                                                </a>
                                            )}
                                        </div>
                                    </div>
                                </div>

                                <div className="flex items-center justify-between gap-3 mt-auto pt-4 border-t border-[var(--border-color)]">
                                    <div>
                                        <p className="text-xs text-[var(--text-muted)]">Harga</p>
                                        <p className="font-bold text-lg text-[var(--text-main)]">
                                            Rp {Number(product.price).toLocaleString('id-ID')}
                                        </p>
                                    </div>
                                    <button
                                        onClick={() => handleBuy(product)}
                                        className="bg-green-500 hover:bg-green-600 text-white p-2 rounded-xl flex items-center gap-2 px-4 transition-all shadow-green-200 shadow-lg hover:shadow-green-300"
                                    >
                                        <MessageCircle size={18} />
                                        <span className="text-sm font-bold">Beli</span>
                                    </button>
                                </div>
                            </CardContent>
                        </Card>
                    ))}
                </div>
            )}
        </div>
    );
};

export default Etalase;
