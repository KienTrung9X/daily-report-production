let currentData = [];
let currentYear = 0;
let currentMonth = 0;
let currentWeek = '';
let currentViewMode = 'pivot';
let currentTab = 'production';
let previewData = [];
let workDaysPreviewData = {};
let holidays = [];

document.addEventListener('DOMContentLoaded', () => {
    const dateInput = document.getElementById('monthFilter');
    const [y, m] = dateInput.value.split('-');
    currentYear = parseInt(y);
    currentMonth = parseInt(m);
    
    document.getElementById('lineFilter').value = '313';
    
    document.getElementById('monthFilter').addEventListener('change', (e) => {
        const [y, m] = e.target.value.split('-');
        currentYear = parseInt(y);
        currentMonth = parseInt(m);
        document.getElementById('startDate').value = '';
        document.getElementById('endDate').value = '';
        loadData();
    });
    
    document.getElementById('weekFilter').addEventListener('change', (e) => {
        currentWeek = e.target.value;
        document.getElementById('startDate').value = '';
        document.getElementById('endDate').value = '';
        loadData();
    });
    
    document.getElementById('lineFilter').addEventListener('change', () => loadData());
    
    document.getElementById('startDate').addEventListener('change', () => {
        if (document.getElementById('startDate').value && document.getElementById('endDate').value) {
            document.getElementById('weekFilter').value = '';
            currentWeek = '';
            loadData();
        }
    });
    
    document.getElementById('endDate').addEventListener('change', () => {
        if (document.getElementById('startDate').value && document.getElementById('endDate').value) {
            document.getElementById('weekFilter').value = '';
            currentWeek = '';
            loadData();
        }
    });
    
    document.querySelectorAll('input[name="viewMode"]').forEach(radio => {
        radio.addEventListener('change', (e) => {
            currentViewMode = e.target.value;
            loadData();
        });
    });
    
    let searchTimeout;
    document.getElementById('searchInput').addEventListener('input', (e) => {
        clearTimeout(searchTimeout);
        searchTimeout = setTimeout(() => filterTable(e.target.value), 300);
    });
    
    document.getElementById('workdays-paste-data').addEventListener('input', previewWorkDaysData);
    
    showTab('production');
    loadData();
});

async function loadData() {
    const tbody = document.getElementById('data-table-body');
    tbody.innerHTML = '<tr><td colspan="10">Loading...</td></tr>';
    
    try {
        const workDaysResponse = await fetch('/api/work-days');
        const workDays = await workDaysResponse.json();
        const startDate = document.getElementById('startDate').value;
        const endDate = document.getElementById('endDate').value;
        
        let url;
        if (startDate && endDate) {
            url = `/api/production?startDate=${startDate.replace(/-/g, '')}&endDate=${endDate.replace(/-/g, '')}`;
        } else {
            url = `/api/production?year=${currentYear}&month=${currentMonth}`;
            if (currentWeek) url += `&week=${currentWeek}`;
        }
        
        if (currentViewMode === 'pivot') url += '&detailed=true';
        
        const selectedLine = document.getElementById('lineFilter').value;
        if (selectedLine) url += `&line=${selectedLine}`;
        
        const response = await fetch(url);
        const result = await response.json();
        currentData = result.data;
        
        if (result.summary) renderSummary(result.summary);
        
        if (currentViewMode === 'pivot') {
            renderPivotTable(currentData, workDays, currentYear, currentMonth);
        } else {
            renderTable(currentData);
        }
    } catch (error) {
        console.error('Error:', error);
        tbody.innerHTML = '<tr><td colspan="10">Error loading data</td></tr>';
    }
}

function renderSummary(summary) {
    const sumPlan = document.getElementById('sum-plan');
    const sumAct = document.getElementById('sum-act');
    const percentEl = document.getElementById('sum-percent');
    
    if (sumPlan) sumPlan.textContent = summary.totalPlan;
    if (sumAct) sumAct.textContent = summary.totalAct;
    if (percentEl) percentEl.textContent = summary.totalPercent + '%';
}

function renderTable(data) {
    const thead = document.getElementById('data-table-header');
    const tbody = document.getElementById('data-table-body');
    
    thead.innerHTML = '<tr><th>Line</th><th>Item</th><th>Code</th><th>Plan</th><th>Actual</th><th>%</th><th>Comment</th></tr>';
    tbody.innerHTML = '';
    
    if (data.length === 0) {
        tbody.innerHTML = '<tr><td colspan="7">No data</td></tr>';
        return;
    }
    
    data.forEach(row => {
        const tr = document.createElement('tr');
        tr.innerHTML = `
            <td>${row.LINE1}</td>
            <td>${row.ITEM_NAME}</td>
            <td>${row.ITEM}</td>
            <td>${row.EST_PRO_QTY.toLocaleString()}</td>
            <td>${row.ACT_PRO_QTY.toLocaleString()}</td>
            <td>${row.PERCENTAGE}%</td>
            <td onclick="openCommentModal('${row.ITEM}','${row.YEAR_MONTH}','${(row.COMMENT || '').replace(/'/g, "\\'")}')">${row.COMMENT || 'Add...'}</td>
        `;
        tbody.appendChild(tr);
    });
}

function renderPivotTable(data, workDays, year, month) {
    const thead = document.getElementById('data-table-header');
    const tbody = document.getElementById('data-table-body');
    
    if (!data || data.length === 0) {
        thead.innerHTML = '<tr><th>No data</th></tr>';
        tbody.innerHTML = '';
        return;
    }
    
    const daysSet = new Set();
    data.forEach(row => {
        if (row.COMP_DAY) daysSet.add(row.COMP_DAY.toString());
    });
    const sortedDays = Array.from(daysSet).sort();
    
    const itemsMap = {};
    data.forEach(row => {
        const key = `${row.LINE1}_${row.ITEM}`;
        if (!itemsMap[key]) {
            itemsMap[key] = { info: row, days: {} };
        }
        const dayKey = row.COMP_DAY.toString();
        if (!itemsMap[key].days[dayKey]) {
            itemsMap[key].days[dayKey] = { plan: row.EST_PRO_QTY || 0, act: row.ACT_PRO_QTY || 0 };
        } else {
            itemsMap[key].days[dayKey].act += row.ACT_PRO_QTY || 0;
        }
    });
    
    let headerHtml = '<tr><th>Item</th><th>Metric</th>';
    sortedDays.forEach(dayStr => {
        const d = dayStr.substring(6, 8);
        const m = dayStr.substring(4, 6);
        headerHtml += `<th>${d}/${m}</th>`;
    });
    headerHtml += '<th>Total</th><th>Comment</th></tr>';
    thead.innerHTML = headerHtml;
    
    tbody.innerHTML = '';
    Object.values(itemsMap).forEach(itemGroup => {
        const info = itemGroup.info;
        let totalPlan = 0;
        let totalAct = 0;
        
        sortedDays.forEach(day => {
            const dayData = itemGroup.days[day];
            if (dayData) {
                totalPlan += dayData.plan;
                totalAct += dayData.act;
            }
        });
        
        ['Plan', 'Act', '%'].forEach((metric, index) => {
            const tr = document.createElement('tr');
            let html = '';
            
            if (index === 0) {
                html += `<td rowspan="3" style="max-width: 250px;"><div style="font-weight: 600; color: #0f172a;">${info.ITEM_NAME}</div><div style="font-size: 11px; color: #94a3b8; margin-top: 2px;">${info.ITEM} • Line ${info.LINE1}</div></td>`;
            }
            html += `<td>${metric}</td>`;
            
            sortedDays.forEach(day => {
                const dayData = itemGroup.days[day];
                if (dayData) {
                    const yearMonth = `${year}${month.toString().padStart(2, '0')}`;
                    const workDaysInMonth = workDays[yearMonth] || 20;
                    
                    if (metric === 'Plan') {
                        const dailyPlanKm = dayData.plan > 0 ? Math.round(dayData.plan / workDaysInMonth / 1000) : 0;
                        html += `<td>${dailyPlanKm || '-'}</td>`;
                    } else if (metric === 'Act') {
                        const actKm = Math.round(dayData.act / 1000);
                        const dailyPlan = dayData.plan > 0 ? dayData.plan / workDaysInMonth : 0;
                        const isZero = actKm === 0 && dailyPlan > 0;
                        html += `<td class="${isZero ? 'val-zero' : ''}">${actKm || '-'}</td>`;
                    } else {
                        const dailyPlan = dayData.plan > 0 ? dayData.plan / workDaysInMonth : 0;
                        if (dailyPlan > 0) {
                            const pctVal = (dayData.act / dailyPlan * 100);
                            const pct = pctVal.toFixed(0) + '%';
                            let pctClass = '';
                            if (pctVal >= 95) pctClass = 'pct-high';
                            else if (pctVal >= 80) pctClass = 'pct-medium';
                            else pctClass = 'pct-low';
                            html += `<td class="${pctClass}">${pct}</td>`;
                        } else {
                            html += '<td>-</td>';
                        }
                    }
                } else {
                    html += '<td>-</td>';
                }
            });
            
            if (metric === 'Plan') {
                html += `<td>${Math.round(totalPlan / 1000).toLocaleString()}</td>`;
            } else if (metric === 'Act') {
                html += `<td>${Math.round(totalAct / 1000).toLocaleString()}</td>`;
            } else {
                if (totalPlan > 0) {
                    const pctVal = (totalAct / totalPlan * 100);
                    const pct = pctVal.toFixed(0) + '%';
                    let pctClass = '';
                    if (pctVal >= 95) pctClass = 'pct-high';
                    else if (pctVal >= 80) pctClass = 'pct-medium';
                    else pctClass = 'pct-low';
                    html += `<td class="${pctClass}">${pct}</td>`;
                } else {
                    html += '<td>-</td>';
                }
            }
            
            if (index === 0) {
                const comment = (info.COMMENT || '').replace(/'/g, "\\'");
                html += `<td rowspan="3" onclick="openCommentModal('${info.ITEM}','${info.YEAR_MONTH}','${comment}')">${info.COMMENT || 'Add...'}</td>`;
            }
            
            tr.innerHTML = html;
            tbody.appendChild(tr);
        });
    });
}

function openCommentModal(itemCode, yearMonth, currentComment) {
    document.getElementById('modal-item-code').value = itemCode;
    document.getElementById('modal-year-month').value = yearMonth;
    document.getElementById('modal-comment-text').value = currentComment;
    openModal('commentModal');
}

async function submitComment() {
    const itemCode = document.getElementById('modal-item-code').value;
    const yearMonth = document.getElementById('modal-year-month').value;
    const comment = document.getElementById('modal-comment-text').value;
    
    const response = await fetch('/api/comments', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ itemCode, yearMonth, comment })
    });
    
    const res = await response.json();
    if (res.success) {
        closeModal('commentModal');
        loadData();
    }
}

function openEstQtyModal(itemCode, yearMonth, currentEstQty) {
    document.getElementById('modal-est-item-code').value = itemCode;
    document.getElementById('modal-est-year-month').value = yearMonth;
    document.getElementById('modal-est-qty').value = currentEstQty;
    openModal('estQtyModal');
}

async function submitEstQty() {
    const itemCode = document.getElementById('modal-est-item-code').value;
    const yearMonth = document.getElementById('modal-est-year-month').value;
    const estQty = document.getElementById('modal-est-qty').value;
    
    const response = await fetch('/api/est-qty', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ itemCode, yearMonth, estQty })
    });
    
    const res = await response.json();
    if (res.success) {
        closeModal('estQtyModal');
        loadData();
    }
}

function openPlanImportModal() {
    document.getElementById('plan-paste-data').value = '';
    document.getElementById('preview-container').innerHTML = 'Paste data to preview';
    document.getElementById('import-plan-btn').disabled = true;
    previewData = [];
    openModal('planImportModal');
}

function previewPastedData() {
    const pastedData = document.getElementById('plan-paste-data').value.trim();
    if (!pastedData) return;
    
    const lines = pastedData.split('\n');
    const jsonData = lines.map(line => line.split('\t'));
    
    if (jsonData.length < 2) return;
    
    const headers = jsonData[0];
    previewData = [];
    
    for (let i = 1; i < jsonData.length; i++) {
        if (jsonData[i].length > 0 && jsonData[i][0]) {
            const row = {};
            headers.forEach((header, index) => {
                row[header] = jsonData[i][index] || '';
            });
            previewData.push(row);
        }
    }
    
    document.getElementById('preview-container').innerHTML = `Ready to import ${previewData.length} rows`;
    document.getElementById('import-plan-btn').disabled = false;
}

async function submitPlanImport() {
    if (previewData.length === 0) return;
    
    const response = await fetch('/api/plan-import', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ planData: previewData })
    });
    
    const result = await response.json();
    if (result.success) {
        alert(`Imported ${result.imported} entries`);
        closeModal('planImportModal');
        if (currentTab === 'plan') loadPlanData();
        loadData();
    }
}

function showTab(tabName) {
    document.getElementById('production-tab').style.display = 'none';
    document.getElementById('plan-tab').style.display = 'none';
    document.getElementById(tabName + '-tab').style.display = 'block';
    
    document.querySelectorAll('.nav-tab').forEach(tab => tab.classList.remove('active'));
    document.querySelectorAll('.nav-tab').forEach(tab => {
        if (tab.textContent.toLowerCase().includes(tabName)) {
            tab.classList.add('active');
        }
    });
    
    currentTab = tabName;
    if (tabName === 'plan') loadPlanData();
}

async function loadPlanData() {
    const tbody = document.getElementById('plan-table-body');
    const thead = document.getElementById('plan-table-header');
    tbody.innerHTML = '<tr><td>Loading...</td></tr>';
    
    try {
        const [planResponse, workDaysResponse] = await Promise.all([
            fetch('/api/plan-data'),
            fetch('/api/work-days')
        ]);
        
        const planData = await planResponse.json();
        const workDays = await workDaysResponse.json();
        
        if (!planData || Object.keys(planData).length === 0) {
            tbody.innerHTML = '<tr><td colspan="3">No plan data</td></tr>';
            thead.innerHTML = '<tr><th>Line</th><th>Code</th><th>Description</th></tr>';
            return;
        }
        
        const months = [...new Set(Object.keys(planData).map(key => {
            const parts = key.split('_');
            return parts.length > 1 ? parts[1] : null;
        }).filter(m => m))].sort();
        
        if (months.length === 0) {
            tbody.innerHTML = '<tr><td colspan="3">No valid plan data</td></tr>';
            thead.innerHTML = '<tr><th>Item</th></tr>';
            return;
        }
        
        let headerHtml = '<tr><th rowspan="2" class="sticky-item-header">Item</th>';
        months.forEach(month => {
            headerHtml += `<th colspan="2" class="month-header">${month}</th>`;
        });
        headerHtml += '</tr>';

        headerHtml += '<tr>';
        months.forEach(month => {
            headerHtml += `<th class="subheader-qty">Qty</th><th class="subheader-daily">Daily</th>`;
        });
        headerHtml += '</tr>';
        
        headerHtml += '<tr><td colspan="1" style="font-weight: bold; background-color: #f8fafc;">Work Days</td>';
        months.forEach(month => {
            headerHtml += `<td onclick="editWorkDay('${month}',${workDays[month]||0})">${workDays[month]||0}</td><td class="daily-col">-</td>`;
        });
        headerHtml += '</tr>';
        thead.innerHTML = headerHtml;
        
        const itemGroups = {};
        Object.keys(planData).forEach(key => {
            const parts = key.split('_');
            if (parts.length < 2) return;
            
            const itemCode = parts[0];
            const month = parts[1];
            const planInfo = planData[key];
            
            if (!itemGroups[itemCode]) {
                itemGroups[itemCode] = {
                    itemCode: itemCode,
                    itemName: typeof planInfo === 'object' ? (planInfo.itemName || '') : '',
                    itemDesc: typeof planInfo === 'object' ? (planInfo.itemDesc || '') : '',
                    line1: typeof planInfo === 'object' ? (planInfo.line1 || '') : '',
                    months: {}
                };
            }
            
            itemGroups[itemCode].months[month] = typeof planInfo === 'object' ? (planInfo.quantity || 0) : (planInfo || 0);
        });
        
        tbody.innerHTML = '';
        Object.values(itemGroups).forEach(item => {
            let rowHtml = `<td>
                <div class="item-name">${item.itemName} ${item.itemDesc}</div>
                <div class="item-details">${item.itemCode} • Line ${item.line1}</div>
            </td>`;
            
            months.forEach(month => {
                const qty = item.months[month] || 0;
                const workDay = workDays[month] || 0;
                const dailyProduct = workDay > 0 ? ((qty * 1000) / workDay).toFixed(0) : 0;
                
                rowHtml += `<td onclick="editPlanQty('${item.itemCode}','${month}',${qty})">${parseFloat(qty).toLocaleString()}</td>`;
                rowHtml += `<td class="daily-col">${parseInt(dailyProduct).toLocaleString()}</td>`;
            });
            
            const tr = document.createElement('tr');
            tr.innerHTML = rowHtml;
            tbody.appendChild(tr);
        });
    } catch (error) {
        console.error('Error loading plan data:', error);
        tbody.innerHTML = '<tr><td colspan="3">Error loading plan data</td></tr>';
        thead.innerHTML = '<tr><th>Line</th><th>Code</th><th>Description</th></tr>';
    }
}

async function exportToExcel() {
    const selectedLine = document.getElementById('lineFilter').value;
    let url = `/api/export-csv?year=${currentYear}&month=${currentMonth}`;
    if (selectedLine) url += `&line=${selectedLine}`;
    
    const link = document.createElement('a');
    link.href = url;
    link.download = `production_${currentYear}_${currentMonth}.csv`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
}

async function clearAllPlan() {
    if (!confirm('Clear all plan data?')) return;
    
    const response = await fetch('/api/plan-clear', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' }
    });
    
    const result = await response.json();
    if (result.success) {
        alert('Cleared');
        loadPlanData();
    }
}

function editPlanQty(itemCode, month, currentQty) {
    document.getElementById('edit-item-code').value = itemCode;
    document.getElementById('edit-month').value = month;
    document.getElementById('edit-plan-qty').value = currentQty;
    openModal('editPlanQtyModal');
}

async function savePlanQty() {
    const itemCode = document.getElementById('edit-item-code').value;
    const month = document.getElementById('edit-month').value;
    const qty = document.getElementById('edit-plan-qty').value;
    
    const response = await fetch('/api/plan-edit', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ itemCode, month, quantity: parseFloat(qty) })
    });
    
    const result = await response.json();
    if (result.success) {
        closeModal('editPlanQtyModal');
        loadPlanData();
        if (currentTab === 'production') loadData();
    }
}

function editWorkDay(month, currentDays) {
    document.getElementById('edit-work-month').value = month;
    document.getElementById('edit-work-days').value = currentDays;
    openModal('editWorkDayModal');
}

async function saveWorkDay() {
    const month = document.getElementById('edit-work-month').value;
    const days = document.getElementById('edit-work-days').value;
    
    const response = await fetch('/api/workday-edit', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ month, days: parseInt(days) })
    });
    
    const result = await response.json();
    if (result.success) {
        closeModal('editWorkDayModal');
        loadPlanData();
        if (currentTab === 'production') loadData();
    }
}

function openWorkDaysPasteModal() {
    document.getElementById('workdays-paste-data').value = '';
    document.getElementById('workdays-preview').innerHTML = 'Paste data to preview';
    document.getElementById('import-workdays-btn').disabled = true;
    workDaysPreviewData = {};
    openModal('pasteWorkDaysModal');
}

function previewWorkDaysData() {
    const pastedData = document.getElementById('workdays-paste-data').value.trim();
    if (!pastedData) {
        document.getElementById('workdays-preview').innerHTML = 'Paste data to preview';
        document.getElementById('import-workdays-btn').disabled = true;
        return;
    }
    
    const lines = pastedData.split('\n');
    if (lines.length < 2) return;
    
    const headers = lines[0].split('\t');
    const dataRow = lines[1].split('\t');
    
    workDaysPreviewData = {};
    dataRow.forEach((value, index) => {
        if (index > 0 && headers[index].match(/^\d{6}$/)) {
            workDaysPreviewData[headers[index]] = parseInt(value) || 0;
        }
    });
    
    document.getElementById('workdays-preview').innerHTML = `Ready to import ${Object.keys(workDaysPreviewData).length} months`;
    document.getElementById('import-workdays-btn').disabled = false;
}

async function importWorkDays() {
    if (Object.keys(workDaysPreviewData).length === 0) return;
    
    const response = await fetch('/api/workdays-bulk', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ workDays: workDaysPreviewData })
    });
    
    const result = await response.json();
    if (result.success) {
        closeModal('pasteWorkDaysModal');
        loadPlanData();
        if (currentTab === 'production') loadData();
        alert(`Imported ${Object.keys(workDaysPreviewData).length} months`);
    }
}

function filterTable(searchTerm) {
    const tbody = document.getElementById('data-table-body');
    const rows = tbody.querySelectorAll('tr');
    
    if (!searchTerm) {
        rows.forEach(row => row.style.display = '');
        return;
    }
    
    const term = searchTerm.toLowerCase();
    rows.forEach(row => {
        const text = row.textContent.toLowerCase();
        row.style.display = text.includes(term) ? '' : 'none';
    });
}

function openHolidaysModal() {
    const now = new Date();
    document.getElementById('calendar-month').value = `${now.getFullYear()}-${(now.getMonth() + 1).toString().padStart(2, '0')}`;
    openModal('holidaysModal');
    loadHolidays();
}

async function loadHolidays() {
    const response = await fetch('/api/holidays');
    holidays = await response.json();
    renderCalendar();
}

function renderCalendar() {
    const monthInput = document.getElementById('calendar-month').value;
    if (!monthInput) return;
    
    const [year, month] = monthInput.split('-').map(Number);
    const firstDay = new Date(year, month - 1, 1);
    const lastDay = new Date(year, month, 0);
    
    let html = '<table><tr><th>Sun</th><th>Mon</th><th>Tue</th><th>Wed</th><th>Thu</th><th>Fri</th><th>Sat</th></tr>';
    
    const startDate = new Date(firstDay);
    startDate.setDate(startDate.getDate() - firstDay.getDay());
    const current = new Date(startDate);
    
    while (current <= lastDay || current.getDay() !== 0) {
        html += '<tr>';
        for (let i = 0; i < 7; i++) {
            const dateStr = current.toISOString().split('T')[0];
            const isHoliday = holidays.some(h => h.date === dateStr);
            const style = isHoliday ? 'background:red;color:white' : '';
            
            html += `<td onclick="toggleHoliday('${dateStr}')" style="${style}">${current.getDate()}`;
            if (isHoliday) {
                const holiday = holidays.find(h => h.date === dateStr);
                html += `<br><small>${holiday.description}</small>`;
            }
            html += '</td>';
            current.setDate(current.getDate() + 1);
        }
        html += '</tr>';
        if (current > lastDay && current.getDay() === 0) break;
    }
    
    html += '</table>';
    document.getElementById('holiday-calendar').innerHTML = html;
}

async function toggleHoliday(dateStr) {
    const isHoliday = holidays.some(h => h.date === dateStr);
    
    if (isHoliday) {
        await fetch(`/api/holidays/${dateStr}`, { method: 'DELETE' });
    } else {
        const description = prompt('Holiday name:', 'Holiday');
        if (description) {
            await fetch('/api/holidays', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ date: dateStr, description })
            });
        }
    }
    loadHolidays();
}

function openModal(modalId) {
    document.getElementById(modalId).classList.add('active');
}

function closeModal(modalId) {
    document.getElementById(modalId).classList.remove('active');
}
