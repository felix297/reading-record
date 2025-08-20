import { renderBookshelf } from './service.js'

// load data
async function loadJsonData(filename) {
    const res = await fetch('./' + filename); // JSON 文件必须和 HTML 同目录
    if (!res.ok) {
        console.error('Cannot load ' + filename, res.status);
        return [];
    }
    return await res.json();
}

loadJsonData('bookData.json').then(data => {
    renderBookshelf(data);
});

// 创建 tooltip 元素
const tooltip = document.createElement('div');
tooltip.className = 'tooltip';
document.body.appendChild(tooltip);

// 为每一行绑定悬浮事件
document.addEventListener('mouseover', (e) => {
    const row = e.target.closest('tr');
    if (row && row.parentElement.id === 'readingTableBody') {
        const cells = row.querySelectorAll('td');
        if (cells.length >= 3) {
            const title = cells[0].textContent;
            const author = cells[1].textContent;
            const type = cells[2].textContent;
            tooltip.innerHTML = `<strong>${title}</strong><br>作者：${author}<br>类型：${type}`;
            tooltip.classList.add('show');
        }
    }
});

document.addEventListener('mousemove', (e) => {
    if (tooltip.classList.contains('show')) {
        const tooltipRect = tooltip.getBoundingClientRect();
        let left = e.clientX + 15;
        let top = e.clientY + 15;

        // 检查右边界
        if (left + tooltipRect.width > window.innerWidth) {
            left = e.clientX - tooltipRect.width - 15;
        }
        // 检查底部边界
        if (top + tooltipRect.height > window.innerHeight) {
            top = e.clientY - tooltipRect.height - 15;
        }

        tooltip.style.left = `${left}px`;
        tooltip.style.top = `${top}px`;
    }
});

document.addEventListener('mouseout', (e) => {
    const row = e.target.closest('tr');
    if (row && row.parentElement.id === 'readingTableBody') {
        tooltip.classList.remove('show');
    }
});
