import React, { useState, useEffect } from 'react';
import { Card, Table, Button, Modal, Form, Badge, Spinner } from 'react-bootstrap';
import { FileText, Plus, Printer, Eye, Wand2, Send } from 'lucide-react';
import { smartAssistantApi } from '../services/smartAssistantApi';
import api from '../services/api';

const Secretariat = () => {
    const [letters, setLetters] = useState([]);
    const [loading, setLoading] = useState(true);
    const [showModal, setShowModal] = useState(false);

    // Form State
    const [formData, setFormData] = useState({
        jenis_surat: 'Undangan',
        perihal: '',
        tujuan: '',
        tanggal_surat: new Date().toISOString().split('T')[0],
        isi_surat: ''
    });

    const [generating, setGenerating] = useState(false);

    useEffect(() => {
        fetchLetters();
    }, []);

    const fetchLetters = async () => {
        try {
            const response = await api.get('/correspondences');
            setLetters(response.data);
        } catch (error) {
            console.error("Error fetching letters", error);
        } finally {
            setLoading(false);
        }
    };

    const handleGenerate = async () => {
        if (!formData.perihal) return alert("Harap isi perihal acara/kegiatan");

        setGenerating(true);
        try {
            // Map types for backend
            const typeMap = { 'Undangan': 'undangan', 'Surat Tugas': 'tugas' };
            const type = typeMap[formData.jenis_surat] || 'undangan';

            const payload = {
                type: type,
                topic: formData.perihal,
                date: formData.tanggal_surat
            };

            const response = await api.post('/correspondences/generate', payload);
            setFormData(prev => ({
                ...prev,
                isi_surat: response.data.html
            }));
        } catch (error) {
            console.error("Gen Error", error);
            alert("Gagal generate draft");
        } finally {
            setGenerating(false);
        }
    };

    const handleSave = async () => {
        if (!formData.isi_surat) return alert("Konten surat kosong");
        try {
            await api.post('/correspondences', formData);
            setShowModal(false);
            fetchLetters();
            alert("Surat berhasil disimpan");
        } catch (error) {
            console.error("Save Error", error);
            alert("Gagal menyimpan");
        }
    };

    const printLetter = (html) => {
        const printWindow = window.open('', '', 'width=800,height=600');
        printWindow.document.write(html);
        printWindow.document.close();
        printWindow.focus();
        printWindow.print();
        printWindow.close();
    };



    return (
        <div className="p-4">
            <div className="d-flex justify-content-between align-items-center mb-4">
                <div>
                    <h3 className="mb-1 fw-bold" style={{ color: 'var(--text-main)' }}>Kesekretariatan & Persuratan</h3>
                    <p className="mb-0" style={{ color: 'var(--text-muted)' }}>Kelola surat masuk/keluar dan buat surat otomatis dengan AI.</p>
                </div>
                <Button variant="primary" onClick={() => setShowModal(true)} className="d-flex align-items-center gap-2">
                    <Plus size={18} /> Buat Surat Baru
                </Button>
            </div>

            <Card className="shadow-sm border-0" style={{ background: 'var(--card-bg)', color: 'var(--text-main)', border: '1px solid var(--border-color)' }}>
                <Card.Body>
                    {loading ? (
                        <div className="text-center p-5"><Spinner animation="border" variant="primary" /></div>
                    ) : (
                        <div className="table-responsive">
                            <Table hover className="align-middle mb-0" style={{ color: 'var(--text-main)', borderColor: 'var(--border-color)' }}>
                                <thead style={{ background: 'var(--card-footer-bg)', color: 'var(--text-muted)', borderBottom: '2px solid var(--border-color)' }}>
                                    <tr>
                                        <th style={{ background: 'transparent', color: 'inherit', borderColor: 'var(--border-color)' }}>Nomor Surat</th>
                                        <th style={{ background: 'transparent', color: 'inherit', borderColor: 'var(--border-color)' }}>Jenis</th>
                                        <th style={{ background: 'transparent', color: 'inherit', borderColor: 'var(--border-color)' }}>Perihal</th>
                                        <th style={{ background: 'transparent', color: 'inherit', borderColor: 'var(--border-color)' }}>Tanggal</th>
                                        <th style={{ background: 'transparent', color: 'inherit', borderColor: 'var(--border-color)' }}>Status</th>
                                        <th className="text-end" style={{ background: 'transparent', color: 'inherit', borderColor: 'var(--border-color)' }}>Aksi</th>
                                    </tr>
                                </thead>
                                <tbody>
                                    {letters.length > 0 ? letters.map(letter => (
                                        <tr key={letter.id}>
                                            <td className="fw-medium" style={{ background: 'transparent', color: 'var(--text-main)', borderColor: 'var(--border-color)' }}>{letter.nomor_surat}</td>
                                            <td style={{ background: 'transparent', borderColor: 'var(--border-color)' }}><Badge bg={letter.jenis_surat === 'Undangan' ? 'info' : 'warning'}>{letter.jenis_surat}</Badge></td>
                                            <td style={{ background: 'transparent', color: 'var(--text-muted)', borderColor: 'var(--border-color)' }}>{letter.perihal}</td>
                                            <td style={{ background: 'transparent', color: 'var(--text-muted)', borderColor: 'var(--border-color)' }}>{new Date(letter.tanggal_surat).toLocaleDateString()}</td>
                                            <td style={{ background: 'transparent', borderColor: 'var(--border-color)' }}><Badge bg="success">Final</Badge></td>
                                            <td className="text-end" style={{ background: 'transparent', borderColor: 'var(--border-color)' }}>
                                                <Button size="sm" variant="outline-secondary" className="me-2" onClick={() => printLetter(letter.isi_surat)} style={{ borderColor: 'var(--border-color)', color: 'var(--text-muted)' }}>

                                                    <Printer size={16} /> Print
                                                </Button>

                                            </td>
                                        </tr>
                                    )) : (
                                        <tr><td colSpan="6" className="text-center py-4 text-muted" style={{ background: 'transparent' }}>Belum ada surat dibuat.</td></tr>
                                    )}
                                </tbody>
                            </Table>
                        </div>
                    )}
                </Card.Body>
            </Card>

            {/* Create Modal */}
            <Modal show={showModal} onHide={() => setShowModal(false)} size="lg" backdrop="static" contentClassName="bg-dark text-light border-secondary">
                <Modal.Header closeButton closeVariant="white" style={{ borderBottomColor: 'var(--border-color)', background: '#1e293b' }}>
                    <Modal.Title><FileText className="me-2" /> Buat Surat Baru</Modal.Title>
                </Modal.Header>
                <Modal.Body style={{ background: '#0f172a' }}>
                    <Form>
                        <div className="row g-3">
                            <div className="col-md-6">
                                <Form.Group className="mb-3">
                                    <Form.Label className="text-muted small fw-bold">Jenis Surat</Form.Label>
                                    <Form.Select
                                        value={formData.jenis_surat}
                                        onChange={e => setFormData({ ...formData, jenis_surat: e.target.value })}
                                        style={{ background: '#1e293b', color: '#fff', borderColor: 'var(--border-color)' }}
                                    >
                                        <option>Undangan</option>
                                        <option>Surat Tugas</option>
                                    </Form.Select>
                                </Form.Group>
                            </div>
                            <div className="col-md-6">
                                <Form.Group className="mb-3">
                                    <Form.Label className="text-muted small fw-bold">Tanggal Surat</Form.Label>
                                    <Form.Control
                                        type="date"
                                        value={formData.tanggal_surat}
                                        onChange={e => setFormData({ ...formData, tanggal_surat: e.target.value })}
                                        style={{ background: '#1e293b', color: '#fff', borderColor: 'var(--border-color)' }}
                                    />
                                </Form.Group>
                            </div>
                            <div className="col-md-12">
                                <Form.Group className="mb-3">
                                    <Form.Label className="text-muted small fw-bold">Perihal / Kegiatan</Form.Label>
                                    <Form.Control
                                        type="text"
                                        placeholder="Contoh: Rapat Koordinasi Zakat, Santunan Yatim"
                                        value={formData.perihal}
                                        onChange={e => setFormData({ ...formData, perihal: e.target.value })}
                                        style={{ background: '#1e293b', color: '#fff', borderColor: 'var(--border-color)' }}
                                    />
                                </Form.Group>
                            </div>
                            <div className="col-md-12">
                                <div className="d-flex justify-content-between align-items-center mb-2">
                                    <Form.Label className="mb-0 text-muted small fw-bold">Isi Surat (Draft)</Form.Label>
                                    <Button
                                        variant="outline-primary"
                                        size="sm"
                                        onClick={handleGenerate}
                                        disabled={generating}
                                        className="d-flex align-items-center gap-1"
                                    >
                                        {generating ? <Spinner size="sm" /> : <Wand2 size={14} />}
                                        Generate with AI
                                    </Button>
                                </div>
                                <Form.Control
                                    as="textarea"
                                    rows={10}
                                    value={formData.isi_surat}
                                    onChange={e => setFormData({ ...formData, isi_surat: e.target.value })}
                                    style={{ fontFamily: 'monospace', fontSize: '0.9rem', background: '#1e293b', color: '#fff', borderColor: 'var(--border-color)' }}
                                />
                                <Form.Text className="text-muted">
                                    *Klik "Generate AI" untuk membuat draft otomatis, lalu edit jika perlu.
                                </Form.Text>
                            </div>
                        </div>
                    </Form>
                </Modal.Body>
                <Modal.Footer style={{ borderTopColor: 'var(--border-color)', background: '#1e293b' }}>
                    <Button variant="secondary" onClick={() => setShowModal(false)}>Batal</Button>
                    <Button variant="success" onClick={handleSave} disabled={!formData.isi_surat} className="d-flex align-items-center gap-2">
                        <Send size={16} /> Simpan Surat
                    </Button>
                </Modal.Footer>
            </Modal>
        </div>
    );
};

export default Secretariat;
