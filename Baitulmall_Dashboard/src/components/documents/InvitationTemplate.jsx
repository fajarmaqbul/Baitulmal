
import React from 'react';
import OfficialDocumentTemplate from '../Print/OfficialDocumentTemplate';

const InvitationTemplate = ({ eventData, signer, documentNo, date }) => {
    return (
        <OfficialDocumentTemplate
            title="UNDANGAN"
            documentNo={documentNo || `UND/${new Date().getFullYear()}/...`}
            date={date}
            signer={signer}
        >
            <div className="space-y-4 text-sm font-serif text-black leading-relaxed">
                {/* Header Section: Nomor & Tanggal */}
                <div className="flex justify-between items-start">
                    <div>
                        <table>
                            <tbody>
                                <tr>
                                    <td className="w-20">Nomor</td>
                                    <td className="w-4">:</td>
                                    <td>{documentNo || `UND/${new Date().getFullYear()}/...`}</td>
                                </tr>
                                <tr>
                                    <td>Lampiran</td>
                                    <td>:</td>
                                    <td>-</td>
                                </tr>
                                <tr>
                                    <td>Perihal</td>
                                    <td>:</td>
                                    <td className="font-bold">Undangan</td>
                                </tr>
                            </tbody>
                        </table>
                    </div>
                    <div>
                        <p>Semarang, {date}</p>
                    </div>
                </div>

                {/* Recipient */}
                <div className="mt-6 mb-4">
                    <p>Kepada</p>
                    <p>Yth. Bpk/Ibu/Saudara/i………………</p>
                    <p>Di tempat</p>
                </div>

                {/* Body Text */}
                <div className="text-justify space-y-4">
                    <p className="font-semibold italic">
                        Assalamu’alaikum warahmatullahi wabarakatuh
                    </p>
                    <p className="indent-8">
                        Syukur Alhamdulillah kita panjatkan kepada Allah Subhanahuwata’ala atas segala nikmat yang telah diberikan kepada kita semua. Sholawat dan salam kita haturkan pada junjungan kita Rosulullah Sollalahu’alaihi Wasalam, semoga kita semua menjadi umat yang mendapatkan syafaatnya aamiin.
                    </p>
                    <p className="indent-8">
                        Dengan ini kami bermaksud mengundang bapak/ibu/saudara pada :
                    </p>
                </div>

                {/* Event Details */}
                <div className="ml-8 my-4">
                    <table className="w-full border-collapse">
                        <tbody>
                            <tr>
                                <td className="w-24 py-1 font-semibold">Hari</td>
                                <td className="w-4">:</td>
                                <td>
                                    {eventData.startDate
                                        ? new Date(eventData.startDate).toLocaleDateString('id-ID', { weekday: 'long', day: 'numeric', month: 'long', year: 'numeric' })
                                        : '................................'}
                                </td>
                            </tr>
                            <tr>
                                <td className="py-1 font-semibold">Waktu</td>
                                <td className="w-4">:</td>
                                <td>
                                    {eventData.startDate
                                        ? new Date(eventData.startDate).toLocaleTimeString('id-ID', { hour: '2-digit', minute: '2-digit' })
                                        : '.....'} WIB - Selesai
                                </td>
                            </tr>
                            <tr>
                                <td className="py-1 font-semibold">Tempat</td>
                                <td className="w-4">:</td>
                                <td>{eventData.location || '................................'}</td>
                            </tr>
                            <tr>
                                <td className="py-1 font-semibold align-top">Agenda</td>
                                <td className="w-4 align-top">:</td>
                                <td className="align-top">{eventData.description || '-'}</td>
                            </tr>
                        </tbody>
                    </table>
                </div>

                {/* Closing */}
                <div className="text-justify space-y-4">
                    <p className="indent-8">
                        Demikian undangan dari kami dan mengingat pentingnya acara kami mohon untuk hadir tepat waktu, Atas kehadirannya kami ucapkan banyak terimakasih.
                    </p>
                    <div>
                        <p className="italic font-medium">Wallahul muwafiq ilaa aqwamith thariq</p>
                        <p className="italic font-semibold">Wassalamu’alaikum warahmatullahi wabarakatuh</p>
                    </div>
                </div>
            </div>
        </OfficialDocumentTemplate>
    );
};

export default InvitationTemplate;
