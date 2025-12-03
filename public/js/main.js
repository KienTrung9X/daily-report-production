// Main Dashboard Logic

// Global state to store current data
let currentData = [];
let currentYear = 0;
let currentMonth = 0;
let currentWeek = '';
let currentViewMode = 'pivot'; // 'list' or 'pivot'
let currentTab = 'production'; // 'production' or 'plan'

document.addEventListener('DOMContentLoaded', () => {
    // Set initial date from input value
    const dateInput = document.getElementById('monthFilter');
    const weekInput = document.getElementById('weekFilter');
    const lineInput = document.getElementById('lineFilter');
    const startDateInput = document.getElementById('startDate');
    const endDateInput = document.getElementById('endDate');
    const viewRadios = document.querySelectorAll('input[name="viewMode"]');
    const searchInput = document.getElementById('searchInput');
    
    const [y, m] = dateInput.value.split('-');
    currentYear = parseInt(y);
    currentMonth = parseInt(m);
    
    // Search functionality
    let searchTimeout;
    searchInput.addEventListener('input', (e) => {
        clearTimeout(searchTimeout);
        searchTimeout = setTimeout(() => {
            filterTable(e.target.value);
        }, 300);
    });

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

    lineInput.addEventListener('change', () => {
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
    showTab('production');
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
        
        // Add line filter
        const selectedLine = document.getElementById('lineFilter').value;
        if (selectedLine) {
            url += `&line=${selectedLine}`;
        }
        
        console.log('API URL:', url);
        console.log('Line filter:', selectedLine);

        const response = await fetch(url);
        const result = await response.json();
        
        currentData = result.data;
        
        renderSummary(result.summary);
        
        // Initialize charts with data
        if (typeof initializeCharts === 'function') {
            initializeCharts(currentData);
        }

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
    const sumPlan = document.getElementById('sum-plan');
    const sumAct = document.getElementById('sum-act');
    const percentEl = document.getElementById('sum-percent');
    const cardPercent = document.getElementById('card-percent');
    const progressBar = document.getElementById('progress-bar');
    
    if (!sumPlan || !sumAct || !percentEl || !cardPercent || !progressBar) {
        console.error('Missing summary elements');
        return;
    }
    
    sumPlan.innerText = summary.totalPlan;
    sumAct.innerText = summary.totalAct;
    
    const percentage = parseFloat(summary.totalPercent);
    percentEl.innerText = percentage + '%';
    
    // Update progress bar
    progressBar.style.width = Math.min(percentage, 100) + '%';
    
    // Color coding for summary
    const icon = cardPercent.querySelector('.bg-success');
    if (icon) {
        if (percentage < 80) {
            progressBar.className = 'progress-bar bg-danger';
            icon.className = 'bg-danger bg-opacity-10 rounded-circle p-3 me-3';
            const iconElement = icon.querySelector('i');
            if (iconElement) iconElement.className = 'fas fa-exclamation-triangle text-danger fa-2x';
        } else if (percentage < 90) {
            progressBar.className = 'progress-bar bg-warning';
            icon.className = 'bg-warning bg-opacity-10 rounded-circle p-3 me-3';
            const iconElement = icon.querySelector('i');
            if (iconElement) iconElement.className = 'fas fa-clock text-warning fa-2x';
        } else {
            progressBar.className = 'progress-bar bg-success';
            icon.className = 'bg-success bg-opacity-10 rounded-circle p-3 me-3';
            const iconElement = icon.querySelector('i');
            if (iconElement) iconElement.className = 'fas fa-bullseye text-success fa-2x';
        }
    }
    
    // Calculate variance (optional element)
    const varianceEl = document.getElementById('sum-variance');
    if (varianceEl) {
        const planNum = parseInt(summary.totalPlan.replace(/,/g, ''));
        const actNum = parseInt(summary.totalAct.replace(/,/g, ''));
        const variance = actNum - planNum;
        varianceEl.innerText = (variance >= 0 ? '+' : '') + variance.toLocaleString();
        varianceEl.className = variance >= 0 ? 'mb-0 fw-bold text-success' : 'mb-0 fw-bold text-danger';
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
        
        // Highlight low performance rows and holidays
        if (row.IS_HOLIDAY) {
            tr.classList.add('table-secondary');
            tr.title = 'Holiday - No production expected';
        } else if (percentage < 90) {
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
        planCell.className = 'text-end est-qty-cell';
        planCell.style.cursor = 'pointer';
        planCell.textContent = row.EST_PRO_QTY.toLocaleString();
        
        // Add visual indicator for manual values
        if (row.IS_MANUAL_EST) {
            planCell.style.backgroundColor = '#fff3cd';
            planCell.title = 'Manual value (click to edit)';
        } else {
            planCell.title = 'Click to set manual value';
        }
        
        // Add click handler for editing Est Qty
        planCell.addEventListener('click', () => {
            openEstQtyModal(row.ITEM, row.YEAR_MONTH, row.EST_PRO_QTY);
        });

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
    try {
        console.log('Rendering pivot table with', data ? data.length : 0, 'records');
        console.log('Sample data:', data ? data.slice(0, 2) : 'No data');
        
        const table = document.querySelector('table');
        const tbody = document.getElementById('data-table-body');
        const thead = document.querySelector('.table thead');
        
        if (!table || !tbody || !thead) {
            console.error('Missing table elements');
            return;
        }
        
        table.classList.add('pivot-table');
        tbody.innerHTML = '';
        thead.innerHTML = '';

        if (!data || data.length === 0) {
            tbody.innerHTML = '<tr><td colspan="100%" class="text-center py-4">No production data found for this period.</td></tr>';
            return;
        }

        // 1. Get Unique Dates and Sort them
        const daysSet = new Set();
        data.forEach(row => {
            if (row.COMP_DAY) {
                daysSet.add(row.COMP_DAY.toString());
            }
        });
        const sortedDays = Array.from(daysSet).sort();
        console.log('Found days:', sortedDays);

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
            const dayKey = row.COMP_DAY.toString();
            itemsMap[key].days[dayKey] = {
                plan: row.EST_PRO_QTY || 0,
                act: row.ACT_PRO_QTY || 0
            };
        });
        console.log('Items grouped:', Object.keys(itemsMap).length);

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
        const dayString = dayStr.toString();
        const y = dayString.substring(0, 4);
        const m = dayString.substring(4, 6);
        const d = dayString.substring(6, 8);
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
                    if (metric === 'Plan') {
                        // Show daily plan in KM (monthly plan / work days / 1000)
                        const monthlyPlan = dayData.plan;
                        const workDaysInMonth = 20; // Default, should get from work_days.json
                        const dailyPlanKm = monthlyPlan > 0 ? Math.round(monthlyPlan / workDaysInMonth / 1000 * 100) / 100 : 0;
                        td.textContent = dailyPlanKm;
                    }
                    if (metric === 'Act') {
                        const actKm = Math.round(dayData.act / 1000 * 100) / 100;
                        td.textContent = actKm;
                    }
                    if (metric === '%') {
                        const monthlyPlan = dayData.plan;
                        const workDaysInMonth = 20;
                        const dailyPlan = monthlyPlan > 0 ? monthlyPlan / workDaysInMonth : 0;
                        const pct = dailyPlan > 0 ? (dayData.act / dailyPlan * 100).toFixed(0) + '%' : '-';
                        td.textContent = pct;
                        
                        // Color code %
                        if (dailyPlan > 0) {
                             const val = (dayData.act / dailyPlan * 100);
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
            if (metric === 'Plan') {
                const planKm = Math.round(totalPlan / 1000 * 100) / 100;
                tdTotal.textContent = planKm;
            }
            if (metric === 'Act') {
                const actKm = Math.round(totalAct / 1000 * 100) / 100;
                tdTotal.textContent = actKm;
            }
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
    } catch (error) {
        console.error('Pivot table error:', error);
        const tbody = document.getElementById('data-table-body');
        tbody.innerHTML = '<tr><td colspan="100%" class="text-center py-4 text-danger">Error rendering pivot table. Check console.</td></tr>';
    }
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

// Modal Logic
const estQtyModal = new bootstrap.Modal(document.getElementById('estQtyModal'));
const planImportModal = new bootstrap.Modal(document.getElementById('planImportModal'));

function openEstQtyModal(itemCode, yearMonth, currentEstQty) {
    document.getElementById('modal-est-item-code').value = itemCode;
    document.getElementById('modal-est-year-month').value = yearMonth;
    document.getElementById('modal-est-qty').value = currentEstQty;
    estQtyModal.show();
}

async function submitEstQty() {
    const itemCode = document.getElementById('modal-est-item-code').value;
    const yearMonth = document.getElementById('modal-est-year-month').value;
    const estQty = document.getElementById('modal-est-qty').value;

    try {
        const response = await fetch('/api/est-qty', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({ itemCode, yearMonth, estQty })
        });
        
        const res = await response.json();
        if (res.success) {
            estQtyModal.hide();
            loadData(); // Refresh data
        } else {
            alert('Failed to save Est Qty');
        }
    } catch (error) {
        console.error('Error saving Est Qty:', error);
        alert('Error saving Est Qty');
    }
}

let previewData = [];

function openPlanImportModal() {
    // Reset modal
    document.getElementById('plan-paste-data').value = '';
    document.getElementById('preview-container').innerHTML = '<p class="text-muted">Paste data to see preview</p>';
    document.getElementById('import-plan-btn').disabled = true;
    previewData = [];
    planImportModal.show();
}



function previewPastedData() {
    const pastedData = document.getElementById('plan-paste-data').value.trim();
    if (!pastedData) return;
    
    try {
        const lines = pastedData.split('\n');
        const jsonData = lines.map(line => line.split('\t'));
        processAndPreview(jsonData);
    } catch (error) {
        console.error('Error processing pasted data:', error);
        alert('Error processing pasted data');
    }
}

function processAndPreview(jsonData) {
    if (jsonData.length < 2) {
        alert('Data must have at least header and one data row');
        return;
    }
    
    const headers = jsonData[0];
    previewData = [];
    
    // Convert to object format
    for (let i = 1; i < jsonData.length; i++) {
        if (jsonData[i].length > 0 && jsonData[i][0]) {
            const row = {};
            headers.forEach((header, index) => {
                row[header] = jsonData[i][index] || '';
            });
            previewData.push(row);
        }
    }
    
    // Generate preview table
    let previewHtml = '<table class="table table-sm table-bordered">';
    previewHtml += '<thead class="table-light"><tr>';
    headers.forEach(header => {
        previewHtml += `<th style="font-size: 12px;">${header}</th>`;
    });
    previewHtml += '</tr></thead><tbody>';
    
    // Show first 10 rows
    const previewRows = previewData.slice(0, 10);
    previewRows.forEach(row => {
        previewHtml += '<tr>';
        headers.forEach(header => {
            const value = row[header] || '';
            previewHtml += `<td style="font-size: 11px;">${value}</td>`;
        });
        previewHtml += '</tr>';
    });
    
    if (previewData.length > 10) {
        previewHtml += `<tr><td colspan="${headers.length}" class="text-center text-muted">... and ${previewData.length - 10} more rows</td></tr>`;
    }
    
    previewHtml += '</tbody></table>';
    previewHtml += `<p class="small text-info">Total: ${previewData.length} rows will be imported</p>`;
    
    document.getElementById('preview-container').innerHTML = previewHtml;
    document.getElementById('import-plan-btn').disabled = false;
}

async function submitPlanImport() {
    if (previewData.length === 0) {
        alert('No data to import');
        return;
    }
    
    try {
        const response = await fetch('/api/plan-import', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({ planData: previewData })
        });
        
        const result = await response.json();
        if (result.success) {
            let message = `Successfully imported ${result.imported} plan entries`;
            if (result.workDays > 0) {
                message += ` and ${result.workDays} work days`;
            }
            alert(message);
            planImportModal.hide();
            if (currentTab === 'plan') {
                loadPlanData();
            } else {
                loadData();
            }
        } else {
            alert('Failed to import plan data');
        }
    } catch (error) {
        console.error('Error importing plan:', error);
        alert('Error importing plan data');
    }
}

// Tab Management
function showTab(tabName) {
    // Hide all tabs
    document.getElementById('production-tab').style.display = 'none';
    document.getElementById('plan-tab').style.display = 'none';
    
    // Show selected tab
    document.getElementById(tabName + '-tab').style.display = 'block';
    
    // Update nav links
    document.querySelectorAll('.navbar-nav .nav-link').forEach(link => {
        link.classList.remove('active');
    });
    
    // Find and activate the correct nav link
    const activeLink = document.querySelector(`[onclick="showTab('${tabName}')"]`);
    if (activeLink) {
        activeLink.classList.add('active');
    }
    
    currentTab = tabName;
    
    if (tabName === 'plan') {
        loadPlanData();
    }
}

// Load Plan Data - Excel format
async function loadPlanData() {
    const tbody = document.getElementById('plan-table-body');
    const thead = document.getElementById('plan-table-header');
    tbody.innerHTML = '<tr><td colspan="10" class="text-center py-4">Loading plan data...</td></tr>';
    
    try {
        const [planResponse, workDaysResponse] = await Promise.all([
            fetch('/api/plan-data'),
            fetch('/api/work-days')
        ]);
        
        const planData = await planResponse.json();
        const workDays = await workDaysResponse.json();
        
        if (Object.keys(planData).length === 0) {
            tbody.innerHTML = '<tr><td colspan="3" class="text-center py-4">No plan data found. Click "Import New Plan" to add data.</td></tr>';
            thead.innerHTML = `
                <tr>
                    <th style="width: 8%">Line</th>
                    <th style="width: 15%">Item Code</th>
                    <th style="width: 77%">Item Description</th>
                </tr>
            `;
            return;
        }
        
        // Get all unique months and sort them
        const months = [...new Set(Object.keys(planData).map(key => key.split('_')[1]))].sort();
        
        // Build header
        let headerHtml = '<tr>';
        headerHtml += '<th style="width: 8%">Line</th>';
        headerHtml += '<th style="width: 12%">Item Code</th>';
        headerHtml += '<th style="width: 35%">Item Description</th>';
        months.forEach(month => {
            headerHtml += `<th style="width: ${45/(months.length*2)}%" class="text-center">${month}<br><small>Plan (km)</small></th>`;
            headerHtml += `<th style="width: ${45/(months.length*2)}%" class="text-center"><small>Daily (m)</small></th>`;
        });
        headerHtml += '</tr>';
        
        // Add work days row
        headerHtml += '<tr class="table-warning">';
        headerHtml += '<td colspan="3" class="text-center fw-bold">Work Date</td>';
        months.forEach(month => {
            headerHtml += `<td class="text-center fw-bold work-day-cell" style="cursor: pointer;" onclick="editWorkDay('${month}', ${workDays[month] || 0})" title="Click to edit work days">${workDays[month] || 0}</td>`;
            headerHtml += `<td class="text-center fw-bold">-</td>`;
        });
        headerHtml += '</tr>';
        
        thead.innerHTML = headerHtml;
        
        // Group by item
        const itemGroups = {};
        Object.keys(planData).forEach(key => {
            const [itemCode, month] = key.split('_');
            const planInfo = planData[key];
            
            if (!itemGroups[itemCode]) {
                itemGroups[itemCode] = {
                    itemCode: itemCode,
                    itemName: typeof planInfo === 'object' ? planInfo.itemName : '',
                    itemDesc: typeof planInfo === 'object' ? planInfo.itemDesc : '',

                    line1: typeof planInfo === 'object' ? planInfo.line1 : '',
                    months: {}
                };
            }
            
            itemGroups[itemCode].months[month] = typeof planInfo === 'object' ? planInfo.quantity : planInfo;
        });
        
        // Build table body
        tbody.innerHTML = '';
        Object.values(itemGroups).forEach(item => {
            const tr = document.createElement('tr');
            let rowHtml = `
                <td class="text-center">${item.line1 || ''}</td>
                <td class="text-center">${item.itemCode}</td>
                <td>${item.itemName}${item.itemDesc ? ' - ' + item.itemDesc : ''}</td>
            `;
            
            months.forEach(month => {
                const qty = item.months[month] || 0;
                const workDay = workDays[month] || 0;
                // Convert km to m for daily production
                const dailyProduct = workDay > 0 ? ((qty * 1000) / workDay).toFixed(0) : 0;
                
                rowHtml += `<td class="text-end plan-qty-cell" style="cursor: pointer; background-color: #f8f9fa;" onclick="editPlanQty('${item.itemCode}', '${month}', ${qty})" title="Click to edit">${qty > 0 ? qty.toLocaleString() : '0'}</td>`;
                rowHtml += `<td class="text-end fw-bold text-primary">${dailyProduct > 0 ? parseInt(dailyProduct).toLocaleString() : '0'}</td>`;
            });
            
            tr.innerHTML = rowHtml;
            tbody.appendChild(tr);
        });
        
    } catch (error) {
        console.error('Error loading plan data:', error);
        tbody.innerHTML = '<tr><td colspan="10" class="text-center text-danger py-4">Error loading plan data</td></tr>';
    }
}

async function exportToExcel() {
    try {
        const year = currentYear;
        const month = currentMonth;
        const selectedLine = document.getElementById('lineFilter').value;
        
        let url = `/api/export-csv?year=${year}&month=${month}`;
        if (selectedLine) {
            url += `&line=${selectedLine}`;
        }
        
        // Download CSV file
        const link = document.createElement('a');
        link.href = url;
        link.download = `production_${year}_${month.toString().padStart(2, '0')}.csv`;
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
        
    } catch (error) {
        console.error('Export error:', error);
        alert('Error exporting data');
    }
}

async function clearAllPlan() {
    if (!confirm('Are you sure you want to clear all plan data? This action cannot be undone.')) {
        return;
    }
    
    try {
        console.log('Sending clear request...');
        const response = await fetch('/api/plan-clear', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            }
        });
        
        console.log('Response status:', response.status);
        const result = await response.json();
        console.log('Response result:', result);
        
        if (result.success) {
            alert('All plan data cleared successfully');
            loadPlanData();
        } else {
            alert('Failed to clear plan data: ' + (result.error || 'Unknown error'));
        }
    } catch (error) {
        console.error('Error clearing plan data:', error);
        alert('Error clearing plan data: ' + error.message);
    }
}

// Edit Plan Quantity
const editPlanQtyModal = new bootstrap.Modal(document.getElementById('editPlanQtyModal'));
const editWorkDayModal = new bootstrap.Modal(document.getElementById('editWorkDayModal'));
const pasteWorkDaysModal = new bootstrap.Modal(document.getElementById('pasteWorkDaysModal'));
const holidaysModal = new bootstrap.Modal(document.getElementById('holidaysModal'));
let workDaysPreviewData = {};
let holidays = [];

function editPlanQty(itemCode, month, currentQty) {
    document.getElementById('edit-item-code').value = itemCode;
    document.getElementById('edit-month').value = month;
    document.getElementById('edit-plan-qty').value = currentQty;
    editPlanQtyModal.show();
}

async function savePlanQty() {
    const itemCode = document.getElementById('edit-item-code').value;
    const month = document.getElementById('edit-month').value;
    const qty = document.getElementById('edit-plan-qty').value;
    
    try {
        const response = await fetch('/api/plan-edit', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({ itemCode, month, quantity: parseFloat(qty) })
        });
        
        const result = await response.json();
        if (result.success) {
            editPlanQtyModal.hide();
            loadPlanData();
        } else {
            alert('Failed to save plan quantity');
        }
    } catch (error) {
        console.error('Error saving plan quantity:', error);
        alert('Error saving plan quantity');
    }
}

// Edit Work Day
function editWorkDay(month, currentDays) {
    document.getElementById('edit-work-month').value = month;
    document.getElementById('edit-work-days').value = currentDays;
    editWorkDayModal.show();
}

async function saveWorkDay() {
    const month = document.getElementById('edit-work-month').value;
    const days = document.getElementById('edit-work-days').value;
    
    try {
        const response = await fetch('/api/workday-edit', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({ month, days: parseInt(days) })
        });
        
        const result = await response.json();
        if (result.success) {
            editWorkDayModal.hide();
            loadPlanData();
        } else {
            alert('Failed to save work days');
        }
    } catch (error) {
        console.error('Error saving work days:', error);
        alert('Error saving work days');
    }
}

// Paste Work Days
function openWorkDaysPasteModal() {
    document.getElementById('workdays-paste-data').value = '';
    document.getElementById('workdays-preview').innerHTML = '<p class="text-muted">Paste data to see preview</p>';
    document.getElementById('import-workdays-btn').disabled = true;
    workDaysPreviewData = {};
    pasteWorkDaysModal.show();
    
    // Add paste event listener
    const textarea = document.getElementById('workdays-paste-data');
    textarea.addEventListener('input', previewWorkDaysData);
}

function previewWorkDaysData() {
    const pastedData = document.getElementById('workdays-paste-data').value.trim();
    if (!pastedData) {
        document.getElementById('workdays-preview').innerHTML = '<p class="text-muted">Paste data to see preview</p>';
        document.getElementById('import-workdays-btn').disabled = true;
        return;
    }
    
    try {
        const lines = pastedData.split('\n');
        if (lines.length < 2) {
            throw new Error('Need at least 2 lines (header and data)');
        }
        
        const headers = lines[0].split('\t');
        const dataRow = lines[1].split('\t');
        
        // Check if first column is Category and second row starts with Work Date
        if (headers[0] !== 'Category' || dataRow[0] !== 'Work Date') {
            throw new Error('Invalid format. First column should be "Category" and data row should start with "Work Date"');
        }
        
        workDaysPreviewData = {};
        let previewHtml = '<table class="table table-sm table-bordered"><thead><tr>';
        
        headers.forEach(header => {
            previewHtml += `<th>${header}</th>`;
        });
        previewHtml += '</tr></thead><tbody><tr>';
        
        dataRow.forEach((value, index) => {
            previewHtml += `<td>${value}</td>`;
            // Store work days data (skip Category column)
            if (index > 0 && headers[index].match(/^\d{6}$/)) {
                workDaysPreviewData[headers[index]] = parseInt(value) || 0;
            }
        });
        
        previewHtml += '</tr></tbody></table>';
        previewHtml += `<p class="small text-info">Found ${Object.keys(workDaysPreviewData).length} months of work days data</p>`;
        
        document.getElementById('workdays-preview').innerHTML = previewHtml;
        document.getElementById('import-workdays-btn').disabled = false;
        
    } catch (error) {
        document.getElementById('workdays-preview').innerHTML = `<p class="text-danger">Error: ${error.message}</p>`;
        document.getElementById('import-workdays-btn').disabled = true;
    }
}

async function importWorkDays() {
    if (Object.keys(workDaysPreviewData).length === 0) {
        alert('No work days data to import');
        return;
    }
    
    try {
        const response = await fetch('/api/workdays-bulk', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({ workDays: workDaysPreviewData })
        });
        
        const result = await response.json();
        if (result.success) {
            pasteWorkDaysModal.hide();
            loadPlanData();
            alert(`Successfully imported work days for ${Object.keys(workDaysPreviewData).length} months`);
        } else {
            alert('Failed to import work days');
        }
    } catch (error) {
        console.error('Error importing work days:', error);
        alert('Error importing work days');
    }
}

// Search and filter functionality
function filterTable(searchTerm) {
    const tbody = document.getElementById('data-table-body');
    const rows = tbody.querySelectorAll('tr');
    
    if (!searchTerm) {
        rows.forEach(row => row.style.display = '');
        return;
    }
    
    const term = searchTerm.toLowerCase();
    rows.forEach(row => {
        const itemName = row.cells[1]?.textContent.toLowerCase() || '';
        const itemCode = row.cells[2]?.textContent.toLowerCase() || '';
        const line = row.cells[0]?.textContent.toLowerCase() || '';
        
        if (itemName.includes(term) || itemCode.includes(term) || line.includes(term)) {
            row.style.display = '';
        } else {
            row.style.display = 'none';
        }
    });
}

// Smooth scroll to section
function scrollToSection(sectionId) {
    const element = document.getElementById(sectionId);
    if (element) {
        element.scrollIntoView({ behavior: 'smooth', block: 'start' });
        
        // Update active nav pill
        document.querySelectorAll('.nav-pills .nav-link').forEach(link => {
            link.classList.remove('active');
        });
        document.querySelector(`[href="#${sectionId}"]`).classList.add('active');
    }
}

// Holidays Management
function openHolidaysModal() {
    const now = new Date();
    document.getElementById('calendar-month').value = `${now.getFullYear()}-${(now.getMonth() + 1).toString().padStart(2, '0')}`;
    holidaysModal.show();
    loadHolidays();
}

async function loadHolidays() {
    try {
        const response = await fetch('/api/holidays');
        holidays = await response.json();
        renderCalendar();
    } catch (error) {
        console.error('Error loading holidays:', error);
    }
}

function renderCalendar() {
    const monthInput = document.getElementById('calendar-month').value;
    if (!monthInput) return;
    
    const [year, month] = monthInput.split('-').map(Number);
    const firstDay = new Date(year, month - 1, 1);
    const lastDay = new Date(year, month, 0);
    const startDate = new Date(firstDay);
    startDate.setDate(startDate.getDate() - firstDay.getDay());
    
    let html = '<table class="table table-bordered calendar-table">';
    html += '<thead><tr><th>Sun</th><th>Mon</th><th>Tue</th><th>Wed</th><th>Thu</th><th>Fri</th><th>Sat</th></tr></thead><tbody>';
    
    const current = new Date(startDate);
    while (current <= lastDay || current.getDay() !== 0) {
        html += '<tr>';
        for (let i = 0; i < 7; i++) {
            const dateStr = current.toISOString().split('T')[0];
            const isCurrentMonth = current.getMonth() === month - 1;
            const isWeekend = current.getDay() === 0 || current.getDay() === 6;
            const isHoliday = holidays.some(h => h.date === dateStr);
            
            let cellClass = 'calendar-day';
            if (!isCurrentMonth) cellClass += ' text-muted';
            if (isWeekend) cellClass += ' weekend';
            if (isHoliday) cellClass += ' holiday';
            
            html += `<td class="${cellClass}" onclick="toggleHoliday('${dateStr}')" style="cursor: pointer; height: 60px; vertical-align: top;">`;
            html += `<div class="fw-bold">${current.getDate()}</div>`;
            if (isHoliday) {
                const holiday = holidays.find(h => h.date === dateStr);
                html += `<small class="text-white">${holiday.description}</small>`;
            }
            html += '</td>';
            
            current.setDate(current.getDate() + 1);
        }
        html += '</tr>';
        
        if (current > lastDay && current.getDay() === 0) break;
    }
    
    html += '</tbody></table>';
    document.getElementById('holiday-calendar').innerHTML = html;
}

async function toggleHoliday(dateStr) {
    const isHoliday = holidays.some(h => h.date === dateStr);
    
    if (isHoliday) {
        await deleteHoliday(dateStr);
    } else {
        const description = prompt('Enter holiday description:', 'Holiday');
        if (description !== null) {
            await addHoliday(dateStr, description);
        }
    }
}

async function addHoliday(date, description) {
    try {
        const response = await fetch('/api/holidays', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({ date, description })
        });
        
        const result = await response.json();
        if (result.success) {
            loadHolidays();
        }
    } catch (error) {
        console.error('Error adding holiday:', error);
    }
}

async function deleteHoliday(date) {
    try {
        const response = await fetch(`/api/holidays/${date}`, {
            method: 'DELETE'
        });
        
        const result = await response.json();
        if (result.success) {
            loadHolidays();
        }
    } catch (error) {
        console.error('Error deleting holiday:', error);
    }
}

function isHoliday(dateStr) {
    return holidays.some(h => h.date === dateStr);
}