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
