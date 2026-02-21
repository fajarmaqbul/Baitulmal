
import React from 'react';
import OfficialDocumentTemplate from '../Print/OfficialDocumentTemplate';

const SKPanitiaTemplate = ({ eventData, signer, documentNo, date }) => {
    return (
        <OfficialDocumentTemplate
            title="SURAT KEPUTUSAN"
            documentNo={documentNo || `SK/${new Date().getFullYear()}/...`}
            date={date}
            signer={signer}
        >
            <div className="space-y-6 text-sm font-serif text-black text-justify leading-relaxed">
                <div className="text-center font-bold uppercase mb-4">
                    <p>TENTANG</p>
                    <p>PEMBENTUKAN PANITIA PELAKSANA KEGIATAN</p>
                    <p>"{eventData.title}"</p>
                </div>

                {/* MENIMBANG */}
                <div>
                    <h3 className="font-bold uppercase mb-1">Menimbang:</h3>
                    <ol className="list-lower-alpha pl-8 space-y-1">
                        <li>Bahwa untuk kelancaran pelaksanaan kegiatan {eventData.title}, dipandang perlu membentuk Panitia Pelaksana.</li>
                        <li>Bahwa nama-nama yang tercantum dalam lampiran surat keputusan ini dianggap cakap dan mampu melaksanakan tugas tersebut.</li>
                    </ol>
                </div>

                {/* MENGINGAT */}
                <div>
                    <h3 className="font-bold uppercase mb-1">Mengingat:</h3>
                    <ol className="list-decimal pl-8 space-y-1">
                        <li>Program Kerja Baitulmal tahun {new Date().getFullYear()}.</li>
                        <li>Hasil rapat pengurus pada tanggal {new Date().toLocaleDateString('id-ID')}.</li>
                    </ol>
                </div>

                {/* MEMUTUSKAN */}
                <div>
                    <div className="text-center font-bold uppercase my-4">MEMUTUSKAN</div>
                    <h3 className="font-bold uppercase mb-1">Menetapkan:</h3>
                    <ol className="list-decimal pl-8 space-y-2">
                        <li>
                            <span className="font-bold">PERTAMA:</span> Membentuk Panitia Pelaksana Kegiatan "{eventData.title}" dengan susunan sebagaimana terlampir.
                        </li>
                        <li>
                            <span className="font-bold">KEDUA:</span> Panitia bertugas mempersiapkan, melaksanakan, dan melaporkan hasil kegiatan kepada Pengurus Baitulmal.
                        </li>
                        <li>
                            <span className="font-bold">KETIGA:</span> Keputusan ini berlaku sejak tanggal ditetapkan, dengan ketentuan apabila terdapat kekeliruan akan diperbaiki sebagaimana mestinya.
                        </li>
                    </ol>
                </div>

                {/* LAMPIRAN SIGNATURE PAGE BREAK */}
                <div className="page-break-before mt-8 pt-8 border-t-2 border-dashed border-gray-300 print:border-0">
                    <h2 className="text-center font-bold uppercase mb-4">LAMPIRAN SURAT KEPUTUSAN</h2>
                    <p className="mb-2"><span className="font-bold">Kegiatan:</span> {eventData.title}</p>

                    <table className="w-full border-collapse border border-black text-xs">
                        <thead className="bg-gray-100">
                            <tr>
                                <th className="border border-black p-2 text-center w-10">No</th>
                                <th className="border border-black p-2 text-left">Nama</th>
                                <th className="border border-black p-2 text-left">Jabatan Kepanitiaan</th>
                            </tr>
                        </thead>
                        <tbody>
                            {eventData.staff && eventData.staff.length > 0 ? (
                                eventData.staff.map((member, idx) => (
                                    <tr key={idx}>
                                        <td className="border border-black p-2 text-center">{idx + 1}</td>
                                        <td className="border border-black p-2">{member.name}</td>
                                        <td className="border border-black p-2">{member.role}</td>
                                    </tr>
                                ))
                            ) : (
                                <tr>
                                    <td colSpan={3} className="border border-black p-4 text-center italic">
                                        Belum ada data panitia.
                                    </td>
                                </tr>
                            )}
                        </tbody>
                    </table>
                </div>
            </div>
        </OfficialDocumentTemplate>
    );
};

export default SKPanitiaTemplate;
