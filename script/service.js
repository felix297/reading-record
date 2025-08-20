import {calculateDuration} from './util.js'

/**
 * 生成数据行、统计阅读数据
 * @param {*} readingRecords 
 */
function getRows (readingRecords) {
    const stats = {};
    let allRows = "";
    readingRecords.forEach(record => {
        const duration = calculateDuration(record.start, record.end);
        allRows += `
        <tr>
            <td>${record.title}</td>
            <td>${record.author}</td>
            <td>${record.type}</td>
            <td>${record.start}</td>
            <td>${record.end}</td>
            <td>${duration}</td>
        </tr>`;

        // 统计有完整时长的书
        if (duration !== "") {
            const startYear = new Date(record.start).getFullYear();
            const endYear = new Date(record.end).getFullYear();
            stats[startYear] = (stats[startYear] || 0) + 1;
            if (startYear !== endYear) {
                stats[endYear] = (stats[endYear] || 0) + 1;
            }
        }
    });
    return {allRows, stats}
}

export function renderTable(readingRecords) {
    const tbody = document.getElementById("readingTableBody");
    tbody.innerHTML = getRows(readingRecords).allRows;

    // 生成统计文本
    const stats = getRows(readingRecords).stats;
    const statsText = Object.keys(stats)
        .sort((a, b) => a - b)
        .map(year => `${year} 年 ${stats[year]} 本书`)
        .join("，");
    document.getElementById("readingStats").textContent = `阅读统计：${statsText}`;
}
