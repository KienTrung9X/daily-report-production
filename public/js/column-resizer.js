// Column Resizer for Pivot Table
let isResizing = false;
let currentColumn = null;
let startX = 0;
let startWidth = 0;

function initColumnResizer() {
    const table = document.querySelector('.pivot-table');
    if (!table || table.dataset.resizerInit) return;
    
    table.dataset.resizerInit = 'true';
    
    // Add resize handles to headers
    const headers = table.querySelectorAll('thead th');
    headers.forEach((th, index) => {
        if (th.querySelector('.column-resizer')) return;
        
        const resizer = document.createElement('div');
        resizer.className = 'column-resizer';
        resizer.addEventListener('mousedown', startResize);
        th.appendChild(resizer);
        th.style.position = 'relative';
    });
}

function startResize(e) {
    if (isResizing) return;
    
    isResizing = true;
    currentColumn = e.target.parentElement;
    startX = e.clientX;
    startWidth = parseInt(window.getComputedStyle(currentColumn).width, 10);
    
    document.addEventListener('mousemove', doResize, { passive: true });
    document.addEventListener('mouseup', stopResize, { once: true });
    e.stopPropagation();
    e.preventDefault();
}

function doResize(e) {
    if (!isResizing || !currentColumn) return;
    
    const width = Math.max(30, startWidth + e.clientX - startX);
    currentColumn.style.width = width + 'px';
    currentColumn.style.minWidth = width + 'px';
    currentColumn.style.maxWidth = width + 'px';
    
    const columnIndex = Array.from(currentColumn.parentElement.children).indexOf(currentColumn);
    const table = currentColumn.closest('table');
    
    if (columnIndex === 0) {
        table.querySelectorAll('.col-product').forEach(cell => {
            cell.style.width = width + 'px';
            cell.style.minWidth = width + 'px';
            cell.style.maxWidth = width + 'px';
        });
    } else if (columnIndex === 1) {
        table.querySelectorAll('.col-metric').forEach(cell => {
            cell.style.width = width + 'px';
            cell.style.minWidth = width + 'px';
            cell.style.maxWidth = width + 'px';
        });
    } else {
        const rows = table.querySelectorAll('tbody tr');
        rows.forEach(row => {
            const cell = row.children[columnIndex];
            if (cell) cell.style.width = width + 'px';
        });
    }
}

function stopResize() {
    if (!isResizing) return;
    
    isResizing = false;
    currentColumn = null;
    document.removeEventListener('mousemove', doResize);
    document.removeEventListener('mouseup', stopResize);
}