export function getDateString(dateIns) {
    const day = dateIns.getDate().toString().padStart(2, '0');
    const month = months[dateIns.getMonth()];
    const year = dateIns.getFullYear().toString();
    return `${day}-${month}-${year}`;
}