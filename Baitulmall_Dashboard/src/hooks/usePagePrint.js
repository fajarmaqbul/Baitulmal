import { useReactToPrint } from 'react-to-print';

export const usePagePrint = (ref, title) => {
    return useReactToPrint({
        contentRef: ref,
        documentTitle: title,
    });
};
