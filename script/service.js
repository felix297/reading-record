import { calculateDuration } from './util.js';

function createBookCard(record) {
    return `
        <div class="book-card">
            <img src="./image/${record.title}.jpg" alt="${record.title}">
            <div class="book-title">${record.title}</div>
            <div class="book-details">
                <p><strong>作者：</strong>${record.author}</p>
                <p><strong>类型：</strong>${record.type}</p>
                <p><strong>开始：</strong>${record.start || '无'}</p>
                <p><strong>结束：</strong>${record.end || '无'}</p>
                <p><strong>阅读时长：</strong>${calculateDuration(record.start, record.end) || '未完成'}</p>
            </div>
        </div>
    `;
}

function getStats(records) {
    const stats = {};
    records.forEach(r => {
        if (r.start && r.end) {
            const startYear = new Date(r.start).getFullYear();
            const endYear = new Date(r.end).getFullYear();
            stats[startYear] = (stats[startYear] || 0) + 1;
            if (startYear !== endYear) {
                stats[endYear] = (stats[endYear] || 0) + 1;
            }
        }
    });
    return stats;
}

export function renderBookshelf(readingRecords) {
    const readingNow = readingRecords.filter(r => r.start && !r.end);
    const readingDone = readingRecords.filter(r => r.start && r.end);

    document.getElementById('readingNow').innerHTML = readingNow.map(createBookCard).join('');
    document.getElementById('readingDone').innerHTML = readingDone.map(createBookCard).join('');

    const stats = getStats(readingDone);
    const statsText = Object.keys(stats)
        .sort((a, b) => a - b)
        .map(year => `${year} 年 ${stats[year]} 本书`)
        .join('，');
    document.getElementById('readingStats').textContent = `阅读统计：${statsText}`;
}
