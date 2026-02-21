import * as XLSX from 'xlsx';

/**
 * Export data to Excel
 * @param {Array} data - Array of objects to export
 * @param {string} fileName - Name of the file to save
 * @param {string} sheetName - Name of the worksheet
 */
export const exportToExcel = (data, fileName = 'Baitulmal_Report', sheetName = 'Data') => {
    const worksheet = XLSX.utils.json_to_sheet(data);
    const workbook = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(workbook, worksheet, sheetName);
    XLSX.writeFile(workbook, `${fileName}.xlsx`);
};

/**
 * Import data from Excel
 * @param {File} file - Excel file from input
 * @returns {Promise<Array>} - Promise resolving to array of data
 */
export const importFromExcel = (file) => {
    return new Promise((resolve, reject) => {
        const reader = new FileReader();
        reader.onload = (e) => {
            try {
                const data = new Uint8Array(e.target.result);
                const workbook = XLSX.read(data, { type: 'array' });
                const firstSheetName = workbook.SheetNames[0];
                const worksheet = workbook.Sheets[firstSheetName];
                const jsonData = XLSX.utils.sheet_to_json(worksheet);
                resolve(jsonData);
            } catch (error) {
                reject(error);
            }
        };
        reader.onerror = (error) => reject(error);
        reader.readAsArrayBuffer(file);
    });
};



/**
 * Format date string or object to DD/MM/YYYY
 * @param {string|Date} dateSource - Date string or Date object
 * @returns {string} Formatted date string
 */
export const formatDate = (dateSource) => {
    if (!dateSource) return '-';
    try {
        const date = new Date(dateSource);
        if (isNaN(date.getTime())) return dateSource; // Return original if invalid

        const day = String(date.getDate()).padStart(2, '0');
        const month = String(date.getMonth() + 1).padStart(2, '0');
        const year = date.getFullYear();

        return `${day}/${month}/${year}`;
    } catch (err) {
        return dateSource;
    }
};
