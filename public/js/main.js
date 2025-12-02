// Main Dashboard Logic

// Global state to store current data
let currentData = [];
let currentYear = 0;
let currentMonth = 0;
let currentWeek = '';
let currentViewMode = 'list'; // 'list' or 'pivot'

document.addEventListener('DOMContentLoaded', () => {
    // Set initial date from input value
    const dateInput = document.getElementById('monthFilter');
    const weekInput = document.getElementById('weekFilter');
    const startDateInput = document.getElementById('startDate');
    const endDateInput = document.getElementById('endDate');
    const viewRadios = document.querySelectorAll('input[name="viewMode"]');
    
    const [y, m] = dateInput.value.split('-');
    currentYear = parseInt(y);
    currentMonth = parseInt(m);

    // Add event listeners
    dateInput.addEventListener('change', (e) => {
        const [y, m] = e.target.value.split('-');
        currentYear = parseInt(y);
        currentMonth = parseInt(m);
        // Clear date range when month changes
        startDateInput.value = '';
        endDateInput.value = '';
        loadData();
    });

    weekInput.addEventListener('change', (e) => {
        currentWeek = e.target.value;
        // Clear date range when week changes
        startDateInput.value = '';
        endDateInput.value = '';
        loadData();
    });

    // Date range change listeners
    startDateInput.addEventListener('change', () => {
        if (startDateInput.value && endDateInput.value) {
            // Clear month/week when using date range
            weekInput.value = '';
            currentWeek = '';
            loadData();
        }
    });

    endDateInput.addEventListener('change', () => {
        if (startDateInput.value && endDateInput.value) {
            // Clear month/week when using date range
            weekInput.value = '';
            currentWeek = '';
            loadData();
        }
    });

    viewRadios.forEach(radio => {
        radio.addEventListener('change', (e) => {
            currentViewMode = e.target.value;
            loadData();
        });
    });

    // Initial Load
    loadData();
});

async function loadData() {
    const tbody = document.getElementById('data-table-body');
    tbody.innerHTML = '<tr><td colspan="8" class="text-center py-4"><div class="spinner-border text-primary" role="status"></div><span class="ms-2">Loading data...</span></td></tr>';

    try {
        const startDate = document.getElementById('startDate').value;
        const endDate = document.getElementById('endDate').value;
        
        let url;
        
        // Check if using date range
        if (startDate && endDate) {
            // Convert YYYY-MM-DD to YYYYMMDD
            const startFormatted = startDate.replace(/-/g, '');
            const endFormatted = endDate.replace(/-/g, '');
            url = `/api/production?startDate=${startFormatted}&endDate=${endFormatted}`;
        } else {
            // Use month/week filter
            url = `/api/production?year=${currentYear}&month=${currentMonth}`;
            if (currentWeek) {
                const firstDay = new Date(currentYear, currentMonth - 1, 1);
                const getWeek = (d) => {
                    d = new Date(Date.UTC(d.getFullYear(), d.getMonth(), d.getDate()));
                    d.setUTCDate(d.getUTCDate() + 4 - (d.getUTCDay()||7));
                    var yearStart = new Date(Date.UTC(d.getUTCFullYear(),0,1));
                    return Math.ceil((((d - yearStart) / 86400000) + 1)/7);
                };
                const startWeek = getWeek(firstDay);
                const targetWeek = startWeek + parseInt(currentWeek) - 1;
                url += `&week=${targetWeek}`;
            }
        }

        // Pass detailed=true if in pivot mode
        if (currentViewMode === 'pivot') {
            url += '&detailed=true';
        }

        const response = await fetch(url);
        const result = await response.json();
        
        currentData = result.data;
        
        // If pivot mode, we need to calculate summary manually from raw data or use what backend sent?
        // Backend summary might be based on rawData anyway.
        // But for consistency, let's use backend summary.
        renderSummary(result.summary);

        if (currentViewMode === 'pivot') {
            renderPivotTable(currentData);
        } else {
            renderTable(currentData);
        }

    } catch (error) {
        console.error('Error loading data:', error);
        tbody.innerHTML = '<tr><td colspan="8" class="text-center text-danger py-4">Error loading data. Please try again.</td></tr>';
    }
}

function renderSummary(summary) {
    document.getElementById('sum-plan').innerText = summary.totalPlan;
    document.getElementById('sum-act').innerText = summary.totalAct;
    
    const percentEl = document.getElementById('sum-percent');
    const cardPercent = document.getElementById('card-percent');
    
    percentEl.innerText = summary.totalPercent + '%';
    
    // Color coding for summary
    if (parseFloat(summary.totalPercent) < 90) {
        cardPercent.className = 'card text-white bg-warning h-100'; // Warning if below 90%
        if (parseFloat(summary.totalPercent) < 80) {
            cardPercent.className = 'card text-white bg-danger h-100'; // Danger if below 80%
        }
    } else {
        cardPercent.className = 'card text-white bg-success h-100';
    }
}

function renderTable(data) {
    const table = document.querySelector('table');
    table.classList.remove('pivot-table');

    const thead = document.querySelector('.table thead');
    thead.innerHTML = `
        <tr class="table-light text-center">
            <th style="width: 5%">Line</th>
            <th style="width: 25%">Item Name</th>
            <th style="width: 10%">Item Code</th>
            <th style="width: 5%">Unit</th>
            <th style="width: 10%">Est Qty</th>
            <th style="width: 10%">Act Qty</th>
            <th style="width: 10%">Act/Plan %</th>
            <th style="width: 25%">Comment</th>
        </tr>
    `;

    const tbody = document.getElementById('data-table-body');
    tbody.innerHTML = '';

    if (data.length === 0) {
        tbody.innerHTML = '<tr><td colspan="8" class="text-center py-4">No production data found for this period.</td></tr>';
        return;
    }

    data.forEach(row => {
        const tr = document.createElement('tr');
        const percentage = parseFloat(row.PERCENTAGE);
        
        // Highlight low performance rows
        if (percentage < 90) {
            tr.classList.add('bg-low-perf');
        }

        const percentClass = percentage >= 100 ? 'text-success-custom' : 'text-danger-custom';
        
        // Safe rendering to prevent XSS
        const lineCell = document.createElement('td');
        lineCell.className = 'text-center';
        lineCell.textContent = row.LINE1;

        const nameCell = document.createElement('td');
        nameCell.textContent = row.ITEM_NAME;

        const codeCell = document.createElement('td');
        codeCell.className = 'text-center';
        codeCell.textContent = row.ITEM;

        const unitCell = document.createElement('td');
        unitCell.className = 'text-center';
        unitCell.textContent = row.UNIT;

        const planCell = document.createElement('td');
        planCell.className = 'text-end';
        planCell.textContent = row.EST_PRO_QTY.toLocaleString();

        const actCell = document.createElement('td');
        actCell.className = 'text-end';
        actCell.textContent = row.ACT_PRO_QTY.toLocaleString();

        const percentCell = document.createElement('td');
        percentCell.className = `text-end ${percentClass}`;
        percentCell.textContent = `${percentage}%`;

        const commentCell = document.createElement('td');
        commentCell.className = 'comment-cell';
        
        if (row.COMMENT) {
            commentCell.textContent = row.COMMENT;
        } else {
            const span = document.createElement('span');
            span.className = 'text-muted small';
            span.textContent = 'Add comment...';
            commentCell.appendChild(span);
        }
        
        // Add click handler
        // Note: We need to use a closure or arrow function to capture current row data safely
        // But since we are rebuilding the row, we can just attach the listener directly
        commentCell.addEventListener('click', () => {
            openCommentModal(row.ITEM, row.YEAR_MONTH, row.COMMENT || '');
        });

        tr.appendChild(lineCell);
        tr.appendChild(nameCell);
        tr.appendChild(codeCell);
        tr.appendChild(unitCell);
        tr.appendChild(planCell);
        tr.appendChild(actCell);
        tr.appendChild(percentCell);
        tr.appendChild(commentCell);
        
        tbody.appendChild(tr);
    });
}

function renderPivotTable(data) {
    const table = document.querySelector('table');
    table.classList.add('pivot-table');

    const tbody = document.getElementById('data-table-body');
    const thead = document.querySelector('.table thead');
    tbody.innerHTML = '';
    thead.innerHTML = ''; // Rebuild header

    if (data.length === 0) {
        tbody.innerHTML = '<tr><td colspan="100%" class="text-center py-4">No production data found for this period.</td></tr>';
        return;
    }

    // 1. Get Unique Dates and Sort them
    const daysSet = new Set();
    data.forEach(row => daysSet.add(row.COMP_DAY));
    const sortedDays = Array.from(daysSet).sort();

    // 2. Group Data by Item (Line + Item)
    const itemsMap = {};
    data.forEach(row => {
        const key = `${row.LINE1}_${row.ITEM}`;
        if (!itemsMap[key]) {
            itemsMap[key] = {
                info: row,
                days: {}
            };
        }
        // Store daily data
        itemsMap[key].days[row.COMP_DAY] = {
            plan: row.EST_PRO_QTY,
            act: row.ACT_PRO_QTY
        };
    });

    // 3. Build Header
    const headerRow = document.createElement('tr');
    
    // Fixed Columns
    const fixedHeaders = [
        { text: 'Line', cls: 'col-line' },
        { text: 'Item Name', cls: 'col-name' },
        { text: 'Item Code', cls: 'col-code' },
        { text: 'Unit', cls: 'col-unit' },
        { text: 'Metric', cls: 'col-metric' }
    ];
    
    fixedHeaders.forEach(header => {
        const th = document.createElement('th');
        th.textContent = header.text;
        th.classList.add('sticky-col', header.cls);
        headerRow.appendChild(th);
    });

    // Dynamic Date Columns
    sortedDays.forEach(dayStr => {
        const th = document.createElement('th');
        // Format YYYYMMDD -> DD-MMM
        const y = dayStr.substring(0, 4);
        const m = dayStr.substring(4, 6);
        const d = dayStr.substring(6, 8);
        const dateObj = new Date(y, m - 1, d);
        const dateLabel = dateObj.toLocaleDateString('en-US', { day: '2-digit', month: 'short' });
        
        th.textContent = dateLabel;
        th.classList.add('pivot-day-header');
        headerRow.appendChild(th);
    });

    // Summary Column
    const totalTh = document.createElement('th');
    totalTh.textContent = 'Total';
    headerRow.appendChild(totalTh);
    
    const commentTh = document.createElement('th');
    commentTh.textContent = 'Comment';
    headerRow.appendChild(commentTh);

    thead.appendChild(headerRow);

    // 4. Build Body
    Object.values(itemsMap).forEach(itemGroup => {
        const info = itemGroup.info;
        
        // Calculate Totals for this item
        let totalPlan = 0;
        let totalAct = 0;
        
        sortedDays.forEach(day => {
            const dayData = itemGroup.days[day];
            if (dayData) {
                totalPlan += dayData.plan;
                totalAct += dayData.act;
            }
        });

        // Create 3 Rows: Plan, Act, %
        ['Plan', 'Act', '%'].forEach((metric, index) => {
            const tr = document.createElement('tr');
            if (metric === 'Plan') tr.className = 'row-plan';
            if (metric === 'Act') tr.className = 'row-act';
            if (metric === '%') tr.className = 'row-percent';

            // Fixed Columns (Line, Name, Code, Unit) - Render only on first row with rowspan=3
            if (index === 0) {
                const fixedCols = [
                    { text: info.LINE1, cls: 'col-line' },
                    { text: info.ITEM_NAME, cls: 'col-name' },
                    { text: info.ITEM, cls: 'col-code' },
                    { text: info.UNIT, cls: 'col-unit' }
                ];
                
                fixedCols.forEach(col => {
                    const td = document.createElement('td');
                    td.textContent = col.text;
                    td.rowSpan = 3;
                    td.classList.add('sticky-col', 'align-middle', col.cls);
                    td.style.backgroundColor = '#fff'; // Ensure opaque behind sticky
                    tr.appendChild(td);
                });
            }

            // Metric Label
            const tdMetric = document.createElement('td');
            tdMetric.textContent = metric;
            tdMetric.className = 'sub-row-header sticky-col col-metric';
            // We don't need top: auto hack if we aren't using sticky top for rows, only left for cols
            tr.appendChild(tdMetric);

            // Daily Data Columns
            sortedDays.forEach(day => {
                const td = document.createElement('td');
                td.className = 'cell-val';
                const dayData = itemGroup.days[day];
                
                if (dayData) {
                    if (metric === 'Plan') td.textContent = dayData.plan;
                    if (metric === 'Act') td.textContent = dayData.act;
                    if (metric === '%') {
                        const pct = dayData.plan > 0 ? (dayData.act / dayData.plan * 100).toFixed(0) + '%' : '-';
                        td.textContent = pct;
                        
                        // Color code %
                        if (dayData.plan > 0) {
                             const val = (dayData.act / dayData.plan * 100);
                             if (val < 80) td.classList.add('text-danger', 'fw-bold');
                             else if (val >= 100) td.classList.add('text-success', 'fw-bold');
                        }
                    }
                } else {
                    td.textContent = '-';
                    td.classList.add('text-muted');
                }
                tr.appendChild(td);
            });

            // Total Column
            const tdTotal = document.createElement('td');
            tdTotal.className = 'fw-bold';
            if (metric === 'Plan') tdTotal.textContent = totalPlan;
            if (metric === 'Act') tdTotal.textContent = totalAct;
            if (metric === '%') {
                const pct = totalPlan > 0 ? (totalAct / totalPlan * 100).toFixed(2) + '%' : '-';
                tdTotal.textContent = pct;
                 if (totalPlan > 0) {
                     const val = (totalAct / totalPlan * 100);
                     if (val < 90) tdTotal.classList.add('text-danger');
                     else tdTotal.classList.add('text-success');
                }
            }
            tr.appendChild(tdTotal);
            
            // Comment Column (Rowspan 3)
            if (index === 0) {
                const tdComment = document.createElement('td');
                tdComment.rowSpan = 3;
                tdComment.className = 'align-middle comment-cell';
                
                // Comment Logic same as List view
                if (info.COMMENT) {
                    tdComment.textContent = info.COMMENT;
                } else {
                    const span = document.createElement('span');
                    span.className = 'text-muted small';
                    span.textContent = 'Add...';
                    tdComment.appendChild(span);
                }
                
                tdComment.addEventListener('click', () => {
                    openCommentModal(info.ITEM, info.YEAR_MONTH, info.COMMENT || '');
                });

                tr.appendChild(tdComment);
            }

            tbody.appendChild(tr);
        });
    });
}

// Modal Logic
const commentModal = new bootstrap.Modal(document.getElementById('commentModal'));

function openCommentModal(itemCode, yearMonth, currentComment) {
    document.getElementById('modal-item-code').value = itemCode;
    document.getElementById('modal-year-month').value = yearMonth;
    document.getElementById('modal-comment-text').value = currentComment;
    commentModal.show();
}

async function submitComment() {
    const itemCode = document.getElementById('modal-item-code').value;
    const yearMonth = document.getElementById('modal-year-month').value;
    const comment = document.getElementById('modal-comment-text').value;

    try {
        const response = await fetch('/api/comments', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({ itemCode, yearMonth, comment })
        });
        
        const res = await response.json();
        if (res.success) {
            commentModal.hide();
            // Refresh data to show new comment
            loadData();
        } else {
            alert('Failed to save comment');
        }
    } catch (error) {
        console.error('Error saving comment:', error);
        alert('Error saving comment');
    }
}

function exportToExcel() {
    alert("Export functionality would be implemented here (e.g. generating a CSV or .xlsx file).");
}
