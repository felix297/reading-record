export function calculateDuration(start, end) {
    if (!start || !end) return "";
    const startDate = new Date(start);
    const endDate = new Date(end);
    return Math.round((endDate - startDate) / (1000 * 60 * 60 * 24));
}