// Enhanced table rendering with professional styling

function renderEnhancedTable(data) {
    const tbody = document.getElementById('data-table-body');
    tbody.innerHTML = '';

    if (data.length === 0) {
        tbody.innerHTML = '<tr><td colspan="9" class="text-center py-4">No production data found for this period.</td></tr>';
        return;
    }

    // Group data by Line
    const groupedData = {};
    data.forEach(row => {
        const line = row.LINE1 || 'Unknown';
        if (!groupedData[line]) {
            groupedData[line] = [];
        }
        groupedData[line].push(row);
    });

    Object.keys(groupedData).sort().forEach((line, groupIndex) => {
        const lineData = groupedData[line];
        const lineTotal = {
            plan: lineData.reduce((sum, row) => sum + row.EST_PRO_QTY, 0),
            actual: lineData.reduce((sum, row) => sum + row.ACT_PRO_QTY, 0)
        };
        const linePercent = lineTotal.plan > 0 ? (lineTotal.actual / lineTotal.plan * 100) : 0;

        // Line header row
        const headerRow = document.createElement('tr');
        headerRow.className = 'line-header';
        headerRow.style.cursor = 'pointer';
        
        // Format line totals
        const planTotal = Math.round(lineTotal.plan);
        const actualTotal = Math.round(lineTotal.actual);
        const variance = actualTotal - planTotal;
        
        headerRow.innerHTML = `
            <td class="sticky-col" style="position: sticky; left: 0; z-index: 6;">
                <i class="fas fa-chevron-down me-2 collapse-icon"></i>
                <strong>🏢 LINE ${line}</strong>
            </td>
            <td class="sticky-col" style="position: sticky; left: 5%; z-index: 6;">
                <strong>${lineData.length} Products</strong>
                <br><small class="text-muted">Total Summary</small>
            </td>
            <td class="text-center">-</td>
            <td class="text-center">-</td>
            <td class="text-end number-large">
                <strong>${planTotal.toLocaleString()}</strong>
            </td>
            <td class="text-end number-large">
                <strong>${actualTotal.toLocaleString()}</strong>
                <br><small class="${variance >= 0 ? 'text-success' : 'text-danger'}">
                    ${variance >= 0 ? '+' : ''}${variance.toLocaleString()}
                </small>
            </td>
            <td class="text-center">
                <div class="d-flex align-items-center justify-content-center">
                    <div class="progress me-2" style="height: 24px; width: 100px;">
                        <div class="progress-bar ${linePercent >= 100 ? 'bg-success' : linePercent >= 80 ? 'bg-warning' : 'bg-danger'}" 
                             style="width: ${Math.min(linePercent, 100)}%">
                            <strong>${linePercent.toFixed(0)}%</strong>
                        </div>
                    </div>
                </div>
            </td>
            <td class="text-center">
                <span class="badge ${linePercent >= 100 ? 'bg-success' : linePercent >= 80 ? 'bg-warning text-dark' : 'bg-danger'} fs-6">
                    ${linePercent >= 100 ? '🏆 EXCELLENT' : linePercent >= 80 ? '🟡 GOOD' : '🔴 NEEDS IMPROVEMENT'}
                </span>
            </td>
            <td class="text-center">-</td>
        `;
        
        // Toggle collapse functionality
        headerRow.addEventListener('click', () => {
            const icon = headerRow.querySelector('.collapse-icon');
            const isCollapsed = icon.classList.contains('fa-chevron-right');
            
            if (isCollapsed) {
                icon.classList.remove('fa-chevron-right');
                icon.classList.add('fa-chevron-down');
                tbody.querySelectorAll(`.line-${line}-row`).forEach(row => row.style.display = '');
            } else {
                icon.classList.remove('fa-chevron-down');
                icon.classList.add('fa-chevron-right');
                tbody.querySelectorAll(`.line-${line}-row`).forEach(row => row.style.display = 'none');
            }
        });
        
        tbody.appendChild(headerRow);

        // Individual item rows
        lineData.forEach((row, index) => {
            const tr = document.createElement('tr');
            tr.className = `line-${line}-row`;
            const percentage = parseFloat(row.PERCENTAGE);
            
            // Performance class based on percentage
            let perfClass = 'perf-poor';
            let perfIcon = '❌';
            if (percentage >= 100) {
                perfClass = 'perf-excellent';
                perfIcon = '✅';
            } else if (percentage >= 80) {
                perfClass = 'perf-good';
                perfIcon = '⚠️';
            } else if (percentage < 50 && percentage > 0) {
                perfClass = 'perf-critical';
                perfIcon = '🚨';
            }
            
            // Format numbers with proper rounding
            const planQty = Math.round(row.EST_PRO_QTY);
            const actQty = Math.round(row.ACT_PRO_QTY);
            
            // Check if plan is empty
            const isPlanEmpty = planQty === 0;
            
            tr.innerHTML = `
                <td class="sticky-col ps-4" style="position: sticky; left: 0; z-index: 5;">
                    <small class="text-muted">L${line}</small>
                </td>
                <td class="sticky-col" style="position: sticky; left: 5%; z-index: 5;">
                    <div class="fw-medium" style="font-size: 12px;">${row.ITEM_NAME}</div>
                    <small class="text-muted">${row.ITEM}</small>
                </td>
                <td class="text-center"><code>${row.ITEM}</code></td>
                <td class="text-center"><span class="badge bg-light text-dark">${row.UNIT}</span></td>
                <td class="text-end est-qty-cell number-large ${isPlanEmpty ? 'empty-plan' : ''}" 
                    style="cursor: pointer; ${row.IS_MANUAL_EST ? 'background-color: #fff3cd;' : ''}" 
                    onclick="openEstQtyModal('${row.ITEM}', '${row.YEAR_MONTH}', ${row.EST_PRO_QTY})" 
                    title="${row.IS_MANUAL_EST ? 'Manual value (click to edit)' : 'Click to set manual value'}">
                    ${isPlanEmpty ? 'No Plan' : planQty.toLocaleString()}
                </td>
                <td class="text-end number-large">${actQty.toLocaleString()}</td>
                <td class="text-center">
                    ${!isPlanEmpty && percentage > 0 ? `
                        <div class="d-flex align-items-center justify-content-center">
                            <span class="me-1">${perfIcon}</span>
                            <div class="progress flex-grow-1 me-2" style="height: 18px; min-width: 50px; max-width: 80px;">
                                <div class="progress-bar ${percentage >= 100 ? 'bg-success' : percentage >= 80 ? 'bg-warning' : percentage >= 50 ? 'bg-danger' : 'bg-dark'}" 
                                     style="width: ${Math.min(percentage, 100)}%">
                                </div>
                            </div>
                            <small class="fw-bold ${perfClass}" style="min-width: 35px;">
                                ${percentage.toFixed(0)}%
                            </small>
                        </div>
                    ` : '<span class="text-muted">-</span>'}
                </td>
                <td class="text-center">
                    ${!isPlanEmpty && percentage > 0 ? `
                        <span class="badge ${percentage >= 100 ? 'bg-success' : percentage >= 80 ? 'bg-warning text-dark' : percentage >= 50 ? 'bg-danger' : 'bg-dark'}">
                            ${percentage >= 100 ? 'EXCELLENT' : percentage >= 80 ? 'GOOD' : percentage >= 50 ? 'POOR' : 'CRITICAL'}
                        </span>
                    ` : '<span class="text-muted">-</span>'}
                </td>
                <td class="comment-cell" style="cursor: pointer;" onclick="openCommentModal('${row.ITEM}', '${row.YEAR_MONTH}', '${row.COMMENT || ''}')">
                    ${row.COMMENT ? `<small>${row.COMMENT}</small>` : '<small class="text-muted">Add...</small>'}
                </td>
            `;
            
            tbody.appendChild(tr);
        });
    });
}

// Replace original renderTable function
function renderTable(data) {
    const table = document.querySelector('table');
    table.classList.remove('pivot-table');
    renderEnhancedTable(data);
}