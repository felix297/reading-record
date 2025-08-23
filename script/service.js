import { calculateDuration } from './util.js';

let allBooks = [];
let currentFilter = 'all';

function createBookCard(record) {
    const duration = calculateDuration(record.start, record.end);
    const isReading = record.start && !record.end;

    return `
        <div class="book-card" data-title="${record.title}" data-author="${record.author}" data-type="${record.type}">
            <div class="book-cover">
                <img src="./image/${record.title}.jpg" alt="${record.title}" onerror="this.src='./image/default-book.jpg'">
                ${isReading ? '<div class="book-progress"><div class="book-progress-bar" style="width: 60%"></div></div>' : ''}
            </div>
            <div class="book-info">
                <div class="book-title">${record.title}</div>
                <div class="book-author">${record.author || '未知作者'}</div>
                <div class="book-meta">
                    <span class="book-type">${record.type || '未分类'}</span>
                    <span class="book-duration">${duration ? duration + '天' : (isReading ? '阅读中' : '未开始')}</span>
                </div>
            </div>
            <div class="book-details">
                <p><strong>书名：</strong>${record.title}</p>
                <p><strong>作者：</strong>${record.author || '未知'}</p>
                <p><strong>类型：</strong>${record.type || '未分类'}</p>
                <p><strong>开始时间：</strong>${record.start || '未开始'}</p>
                <p><strong>结束时间：</strong>${record.end || (isReading ? '阅读中' : '未开始')}</p>
                <p><strong>阅读时长：</strong>${duration ? duration + '天' : '未完成'}</p>
                ${record.note ? `<p><strong>备注：</strong>${record.note}</p>` : ''}
            </div>
        </div>
    `;
}

function getStats(records) {
    const stats = {};
    const currentYear = new Date().getFullYear();
    let totalDays = 0;
    let completedBooks = 0;

    records.forEach(r => {
        if (r.start && r.end) {
            const startYear = new Date(r.start).getFullYear();
            const endYear = new Date(r.end).getFullYear();
            stats[startYear] = (stats[startYear] || 0) + 1;
            if (startYear !== endYear) {
                stats[endYear] = (stats[endYear] || 0) + 1;
            }

            const duration = calculateDuration(r.start, r.end);
            if (duration) {
                totalDays += parseInt(duration);
                completedBooks++;
            }
        }
    });

    return {
        yearlyStats: stats,
        avgDays: completedBooks > 0 ? Math.round(totalDays / completedBooks) : 0,
        thisYearCount: stats[currentYear] || 0
    };
}

function updateStatistics(readingRecords) {
    const readingNow = readingRecords.filter(r => r.start && !r.end);
    const readingDone = readingRecords.filter(r => r.start && r.end);
    const stats = getStats(readingDone);

    // 更新统计卡片
    document.getElementById('readingCount').textContent = readingNow.length;
    document.getElementById('completedCount').textContent = readingDone.length;
    document.getElementById('thisYearCount').textContent = stats.thisYearCount;
    document.getElementById('avgDays').textContent = stats.avgDays;

    // 更新章节计数
    document.getElementById('readingNowCount').textContent = `${readingNow.length} 本`;
    document.getElementById('readingDoneCount').textContent = `${readingDone.length} 本`;
}

function filterBooks(filter) {
    currentFilter = filter;
    const readingDone = allBooks.filter(r => r.start && r.end);

    let filteredBooks = readingDone;
    if (filter !== 'all') {
        const year = parseInt(filter);
        filteredBooks = readingDone.filter(r => {
            const startYear = new Date(r.start).getFullYear();
            const endYear = new Date(r.end).getFullYear();
            return startYear === year || endYear === year;
        });
    }

    document.getElementById('readingDone').innerHTML = filteredBooks.map(createBookCard).join('');

    // 更新筛选标签状态
    document.querySelectorAll('.filter-tab').forEach(tab => {
        tab.classList.toggle('active', tab.dataset.filter === filter);
    });
}

function setupSearch() {
    const searchInput = document.getElementById('searchInput');
    searchInput.addEventListener('input', (e) => {
        const query = e.target.value.toLowerCase();
        const bookCards = document.querySelectorAll('.book-card');

        bookCards.forEach(card => {
            const title = card.dataset.title.toLowerCase();
            const author = card.dataset.author.toLowerCase();
            const type = card.dataset.type.toLowerCase();

            const matches = title.includes(query) || author.includes(query) || type.includes(query);
            card.style.display = matches ? 'block' : 'none';
        });
    });
}

function setupFilterTabs() {
    document.querySelectorAll('.filter-tab').forEach(tab => {
        tab.addEventListener('click', () => {
            filterBooks(tab.dataset.filter);
        });
    });
}

function drawYearlyChart(stats) {
    const canvas = document.getElementById('yearlyChart');
    if (!canvas) return;

    const ctx = canvas.getContext('2d');
    const years = Object.keys(stats.yearlyStats).sort();
    const counts = years.map(year => stats.yearlyStats[year]);

    if (years.length === 0) return;

    // 清空画布
    ctx.clearRect(0, 0, canvas.width, canvas.height);

    // 设置样式
    const padding = 40;
    const chartWidth = canvas.width - padding * 2;
    const chartHeight = canvas.height - padding * 2;
    const maxCount = Math.max(...counts);
    const barWidth = chartWidth / years.length * 0.8;
    const barSpacing = chartWidth / years.length * 0.2;

    // 绘制柱状图
    ctx.fillStyle = '#ff6b35';
    years.forEach((year, index) => {
        const count = stats.yearlyStats[year];
        const barHeight = (count / maxCount) * chartHeight;
        const x = padding + index * (barWidth + barSpacing);
        const y = padding + chartHeight - barHeight;

        // 绘制柱子
        ctx.fillRect(x, y, barWidth, barHeight);

        // 绘制年份标签
        ctx.fillStyle = '#2c3e50';
        ctx.font = '12px Inter';
        ctx.textAlign = 'center';
        ctx.fillText(year, x + barWidth / 2, canvas.height - 10);

        // 绘制数量标签
        ctx.fillText(count, x + barWidth / 2, y - 5);

        ctx.fillStyle = '#ff6b35';
    });
}

export function renderBookshelf(readingRecords) {
    allBooks = readingRecords;

    const readingNow = readingRecords.filter(r => r.start && !r.end);
    const readingDone = readingRecords.filter(r => r.start && r.end);

    // 渲染书架
    document.getElementById('readingNow').innerHTML = readingNow.map(createBookCard).join('');
    document.getElementById('readingDone').innerHTML = readingDone.map(createBookCard).join('');

    // 更新统计信息
    updateStatistics(readingRecords);

    // 生成统计文本
    const stats = getStats(readingDone);
    const statsText = Object.keys(stats.yearlyStats)
        .sort((a, b) => a - b)
        .map(year => `${year} 年阅读了 ${stats.yearlyStats[year]} 本书`)
        .join('，');

    document.getElementById('readingStats').innerHTML = `
        <h3>年度阅读统计</h3>
        <p>${statsText || '暂无阅读记录'}</p>
        <p>平均阅读时长：${stats.avgDays} 天/本</p>
        <p>今年已阅读：${stats.thisYearCount} 本书</p>
    `;

    // 绘制图表
    setTimeout(() => drawYearlyChart(stats), 100);

    // 设置事件监听
    setupSearch();
    setupFilterTabs();
}
