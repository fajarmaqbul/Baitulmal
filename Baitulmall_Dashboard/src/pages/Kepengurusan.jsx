import React from 'react';
import KepengurusanGeneric from './KepengurusanGeneric';

const Kepengurusan = () => {
    return (
        <KepengurusanGeneric
            title="Pengurus Baitulmal"
            kodeStruktur="BAITULMALL_2023"
            defaultDivisi="Pengurus Inti"
            showAmilTable={false}
        />
    );
};

export default Kepengurusan;
