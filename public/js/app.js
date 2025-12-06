let currentData = [];
let currentYear = 0;
let currentMonth = 0;
let currentTab = 'production';
let previewData = [];
let workDaysPreviewData = {};
let holidays = [];

document.addEventListener('DOMContentLoaded', () => {
    const dateInput = document.getElementById('monthFilter');
    const [y, m] = dateInput.value.split('-');
    currentYear = parseInt(y);
    currentMonth = parseInt(m);
    
    // Multiple selection is set in HTML
    
    const now = new Date();
    const currentFY = now.getMonth() >= 3 ? now.getFullYear() : now.getFullYear() - 1;
    document.getElementById('fiscalYearFilter').value = currentFY;
    
    document.getElementById('monthFilter').addEventListener('change', (e) => {
        const [y, m] = e.target.value.split('-');
        currentYear = parseInt(y);
        currentMonth = parseInt(m);
        document.getElementById('startDate').value = '';
        document.getElementById('endDate').value = '';
        loadData();
    });
    
    document.getElementById('lineFilter').addEventListener('change', () => loadData());
    
    document.getElementById('startDate').addEventListener('change', () => {
        if (document.getElementById('startDate').value && document.getElementById('endDate').value) {
            loadData();
        }
    });
    
    document.getElementById('endDate').addEventListener('change', () => {
        if (document.getElementById('startDate').value && document.getElementById('endDate').value) {
            loadData();
        }
    });
    
    document.getElementById('workdays-paste-data').addEventListener('input', previewWorkDaysData);
    
    showTab('production');
    loadData();
});

// Refresh cache from database
async function refreshCacheData() {
    const btn = document.getElementById('refresh-btn');
    const originalText = btn.textContent;
    btn.disabled = true;
    btn.textContent = '⏳ Refreshing...';
    
    try {
        const response = await fetch('/api/refresh-cache', { method: 'POST' });
        const result = await response.json();
        
        if (result.success) {
            btn.textContent = '✅ Updated!';
            console.log(`Cache updated: ${result.totalRecords} records`);
            // Reload data after refresh
            setTimeout(() => {
                loadData();
                btn.textContent = originalText;
                btn.disabled = false;
            }, 1000);
        } else {
            throw new Error(result.error);
        }
    } catch (error) {
        console.error('Refresh error:', error);
        btn.textContent = '❌ Failed!';
        setTimeout(() => {
            btn.textContent = originalText;
            btn.disabled = false;
        }, 2000);
    }
}

async function loadData() {
    const tbody = document.getElementById('data-table-body');
    const thead = document.getElementById('data-table-header');
    tbody.innerHTML = '<tr><td colspan="10">Loading...</td></tr>';
    thead.innerHTML = '';
    
    try {
        const [workDaysResponse, workingDaysResponse] = await Promise.all([
            fetch('/api/work-days'),
            fetch('/api/working-days')
        ]);
        const workDays = await workDaysResponse.json();
        const workingDaysData = await workingDaysResponse.json();
        const workingDayDates = new Set(workingDaysData);
        const startDate = document.getElementById('startDate').value;
        const endDate = document.getElementById('endDate').value;
        const fiscalYear = document.getElementById('fiscalYearFilter').value;
        
        let url;
        if (startDate && endDate) {
            url = `/api/production?fiscalYear=${fiscalYear}&detailed=true&startDate=${startDate.replace(/-/g, '')}&endDate=${endDate.replace(/-/g, '')}`;
        } else {
            // Chỉ lấy dữ liệu tháng hiện tại
            const yearMonth = `${currentYear}${currentMonth.toString().padStart(2, '0')}`;
            const firstDay = `${yearMonth}01`;
            const lastDay = `${yearMonth}${new Date(currentYear, currentMonth, 0).getDate()}`;
            url = `/api/production?fiscalYear=${fiscalYear}&detailed=true&startDate=${firstDay}&endDate=${lastDay}`;
        }
        
        const lineSelect = document.getElementById('lineFilter');
        const selectedLines = Array.from(lineSelect.selectedOptions).map(opt => opt.value);
        if (selectedLines.length > 0) url += `&line=${selectedLines.join(',')}`;
        
        const response = await fetch(url);
        const result = await response.json();
        currentData = result.data;
        console.log('API URL:', url);
        console.log('Current Year:', currentYear, 'Current Month:', currentMonth);
        console.log('Data received:', currentData.length, 'rows');
        
        renderPivotTable(currentData, workDays, currentYear, currentMonth, workingDayDates);
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

function renderPivotTable(data, workDays, year, month, workingDayDates = new Set()) {
    const thead = document.getElementById('data-table-header');
    const tbody = document.getElementById('data-table-body');
    const lineSelect = document.getElementById('lineFilter');
    const selectedLines = Array.from(lineSelect.selectedOptions).map(opt => opt.value);
    const isLine312 = selectedLines.includes('312') && selectedLines.length === 1;
    
    if (!data || data.length === 0) {
        thead.innerHTML = '<tr><th>No data</th></tr>';
        tbody.innerHTML = '';
        renderSummary({ totalPlan: '0', totalAct: '0', totalPercent: '0' });
        return;
    }
    
    const startDateInput = document.getElementById('startDate').value;
    const endDateInput = document.getElementById('endDate').value;
    const startDate = startDateInput ? startDateInput.replace(/-/g, '') : '';
    const endDate = endDateInput ? endDateInput.replace(/-/g, '') : '';
    
    // Sử dụng danh sách working days từ file JSON
    const daysSet = new Set();
    const today = new Date();
    const todayStr = `${today.getFullYear()}${(today.getMonth()+1).toString().padStart(2,'0')}${today.getDate().toString().padStart(2,'0')}`;
    
    // Lọc working days theo tháng hiện tại và đến ngày hiện tại
    const yearMonth = `${year}${month.toString().padStart(2, '0')}`;
    workingDayDates.forEach(dateStr => {
        const dateFormatted = dateStr.replace(/-/g, '');
        if (dateFormatted.startsWith(yearMonth) && dateFormatted <= todayStr) {
            daysSet.add(dateFormatted);
        }
    });
    
    const sortedDays = Array.from(daysSet).sort();
    console.log('Sorted days:', sortedDays);
    console.log('Data length:', data.length);
    
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
            if (row.EST_PRO_QTY) itemsMap[key].days[dayKey].plan = row.EST_PRO_QTY;
        }
    });
    

    
    const upToDate = document.getElementById('upToDate').value;
    const upToDateStr = upToDate ? upToDate.replace(/-/g, '') : '';
    
    let headerHtml = '<tr><th>Item</th><th class="sticky-metric" style="position: sticky !important; left: 250px !important; z-index: 35 !important; background: #1e3a5f !important;">Metric</th>';
    sortedDays.forEach(dayStr => {
        const d = dayStr.substring(6, 8);
        const m = dayStr.substring(4, 6);
        headerHtml += `<th>${d}/${m}</th>`;
    });
    headerHtml += '<th class="col-total">Total</th>';
    if (upToDateStr) {
        const d = upToDateStr.substring(6, 8);
        const m = upToDateStr.substring(4, 6);
        headerHtml += `<th class="col-upto">Up To ${d}/${m}</th>`;
    }
    headerHtml += '<th>Comment</th></tr>';
    thead.innerHTML = headerHtml;
    
    tbody.innerHTML = '';
    let grandTotalPlan = 0;
    let grandTotalAct = 0;
    const lineTotals = {}; // Track totals per line
    
    // Sort items: line 313 first, then 312, then others
    const sortedItems = Object.values(itemsMap).sort((a, b) => {
        const lineA = a.info.LINE1;
        const lineB = b.info.LINE1;
        if (lineA === '313' && lineB !== '313') return -1;
        if (lineA !== '313' && lineB === '313') return 1;
        if (lineA === '312' && lineB !== '312' && lineB !== '313') return -1;
        if (lineA !== '312' && lineB === '312' && lineA !== '313') return 1;
        return lineA.localeCompare(lineB);
    });
    
    sortedItems.forEach(itemGroup => {
        const info = itemGroup.info;
        const monthPlans = new Map();
        let totalAct = 0;
        
        sortedDays.forEach(day => {
            const dayData = itemGroup.days[day];
            if (dayData) {
                const dayStr = day.toString();
                const yearMonth = dayStr.substring(0, 6);
                
                if (!monthPlans.has(yearMonth) && dayData.plan > 0) {
                    monthPlans.set(yearMonth, dayData.plan);
                }
                totalAct += dayData.act;
            }
        });
        
        const totalPlan = Array.from(monthPlans.values()).reduce((sum, plan) => sum + plan, 0);
        
        grandTotalPlan += totalPlan;
        grandTotalAct += totalAct;
        
        // Track line totals
        const lineKey = info.LINE1;
        if (!lineTotals[lineKey]) {
            lineTotals[lineKey] = { plan: 0, act: 0 };
        }
        lineTotals[lineKey].plan += totalPlan;
        lineTotals[lineKey].act += totalAct;
        
        let upToPlan = 0;
        let upToAct = 0;
        if (upToDateStr) {
            // Count working days up to the specified date
            const workingDaysUpTo = sortedDays.filter(day => day <= upToDateStr).length;
            
            sortedDays.forEach(day => {
                if (day <= upToDateStr) {
                    const dayData = itemGroup.days[day];
                    const dayStr = day.toString();
                    const dayYear = dayStr.substring(0, 4);
                    const dayMonth = dayStr.substring(4, 6);
                    const yearMonth = `${dayYear}${dayMonth}`;
                    const workDaysInMonth = workDays[yearMonth] || 20;
                    const monthPlan = info.EST_PRO_QTY || 0;
                    
                    // Add daily plan for each working day
                    upToPlan += monthPlan / workDaysInMonth;
                    
                    if (dayData) {
                        upToAct += dayData.act;
                    }
                }
            });
        }
        
        ['Plan', 'Act', '%'].forEach((metric, index) => {
            const tr = document.createElement('tr');
            let html = '';
            
            if (index === 0) {
                html += `<td rowspan="3" style="max-width: 250px;"><div style="font-weight: 600; color: #0f172a;">${info.ITEM_NAME}</div><div style="font-size: 11px; color: #94a3b8; margin-top: 2px;">${info.ITEM} • Line ${info.LINE1}</div></td>`;
            }
            html += `<td class="sticky-metric" style="position: sticky !important; left: 250px !important; z-index: 25 !important; background: white !important;">${metric}</td>`;
            
            sortedDays.forEach(day => {
                const dayData = itemGroup.days[day];
                const dayStr = day.toString();
                const dayYear = dayStr.substring(0, 4);
                const dayMonth = dayStr.substring(4, 6);
                const yearMonth = `${dayYear}${dayMonth}`;
                const workDaysInMonth = workDays[yearMonth] || 20;
                const monthPlan = info.EST_PRO_QTY || 0;
                
                const itemIsLine312 = info.LINE1 === '312';
                const divisor = itemIsLine312 ? 1 : 1000;
                
                if (metric === 'Plan') {
                    const dailyPlan = monthPlan > 0 ? Math.round(monthPlan / workDaysInMonth / divisor) : 0;
                    html += `<td>${dailyPlan || '-'}</td>`;
                } else if (metric === 'Act') {
                    const actVal = dayData ? Math.round(dayData.act / divisor) : 0;
                    const dailyPlan = monthPlan > 0 ? monthPlan / workDaysInMonth : 0;
                    const isZero = actVal === 0 && dailyPlan > 0;
                    html += `<td class="${isZero ? 'val-zero' : ''}">${actVal || '-'}</td>`;
                } else {
                    const dailyPlan = monthPlan > 0 ? monthPlan / workDaysInMonth : 0;
                    const actVal = dayData ? dayData.act : 0;
                    if (dailyPlan > 0) {
                        const pctVal = (actVal / dailyPlan * 100);
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
            });
            
            const itemIsLine312 = info.LINE1 === '312';
            const divisor = itemIsLine312 ? 1 : 1000;
            
            if (metric === 'Plan') {
                html += `<td class="col-total">${Math.round(totalPlan / divisor).toLocaleString('de-DE')}</td>`;
                if (upToDateStr) html += `<td class="col-upto">${Math.round(upToPlan / divisor).toLocaleString('de-DE')}</td>`;
            } else if (metric === 'Act') {
                html += `<td class="col-total">${Math.round(totalAct / divisor).toLocaleString('de-DE')}</td>`;
                if (upToDateStr) html += `<td class="col-upto">${Math.round(upToAct / divisor).toLocaleString('de-DE')}</td>`;
            } else {
                if (totalPlan > 0) {
                    const pctVal = (totalAct / totalPlan * 100);
                    const pct = pctVal.toFixed(0) + '%';
                    let pctClass = '';
                    if (pctVal >= 95) pctClass = 'pct-high';
                    else if (pctVal >= 80) pctClass = 'pct-medium';
                    else pctClass = 'pct-low';
                    html += `<td class="col-total ${pctClass}">${pct}</td>`;
                } else {
                    html += '<td class="col-total">-</td>';
                }
                if (upToDateStr) {
                    if (upToPlan > 0) {
                        const pctVal = (upToAct / upToPlan * 100);
                        const pct = pctVal.toFixed(0) + '%';
                        let pctClass = '';
                        if (pctVal >= 95) pctClass = 'pct-high';
                        else if (pctVal >= 80) pctClass = 'pct-medium';
                        else pctClass = 'pct-low';
                        html += `<td class="col-upto ${pctClass}">${pct}</td>`;
                    } else {
                        html += '<td class="col-upto">-</td>';
                    }
                }
            }
            
            if (index === 0) {
                const comment = (info.COMMENT || '').replace(/'/g, "\\'");
                const hasComment = info.COMMENT && info.COMMENT.trim() !== '';
                const commentClass = hasComment ? 'has-comment' : '';
                html += `<td rowspan="3" class="${commentClass}" onclick="openCommentModal('${info.ITEM}','${info.YEAR_MONTH}','${comment}')">${info.COMMENT || 'Add...'}</td>`;
            }
            
            tr.innerHTML = html;
            tbody.appendChild(tr);
        });
    });
    
    // Render separate stats for each line
    const statsContainer = document.getElementById('stats-container');
    statsContainer.innerHTML = '';
    
    const lineNames = { '312': 'Forming', '313': 'Sewing' };
    
    Object.keys(lineTotals).sort((a, b) => {
        if (a === '313') return -1;
        if (b === '313') return 1;
        return a.localeCompare(b);
    }).forEach(lineKey => {
        const totals = lineTotals[lineKey];
        const unit = lineKey === '312' ? 'kg' : 'km';
        const divisor = lineKey === '312' ? 1 : 1000;
        const percent = totals.plan > 0 ? ((totals.act / totals.plan) * 100).toFixed(2) : 0;
        const lineName = lineNames[lineKey] || `Line ${lineKey}`;
        
        statsContainer.innerHTML += `
            <div style="grid-column: 1 / -1; display: grid; grid-template-columns: repeat(3, 1fr); gap: 1rem;">
                <div class="stat-card">
                    <div class="stat-label">${lineName} - Plan</div>
                    <div class="stat-value">${Math.round(totals.plan / divisor).toLocaleString('de-DE').replace(/\./g, ',')} ${unit}</div>
                </div>
                <div class="stat-card">
                    <div class="stat-label">${lineName} - Actual</div>
                    <div class="stat-value">${Math.round(totals.act / divisor).toLocaleString('de-DE').replace(/\./g, ',')} ${unit}</div>
                </div>
                <div class="stat-card stat-highlight">
                    <div class="stat-label">${lineName} - Achievement</div>
                    <div class="stat-value">${percent}%</div>
                </div>
            </div>
        `;
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
            tbody.innerHTML = '<tr><td>No plan data</td></tr>';
            thead.innerHTML = '<tr><th>Item</th></tr>';
            return;
        }
        
        const months = [...new Set(Object.keys(planData).map(key => {
            const parts = key.split('_');
            return parts.length > 1 ? parts[1] : null;
        }).filter(m => m))].sort();
        
        if (months.length === 0) {
            tbody.innerHTML = '<tr><td>No valid plan data</td></tr>';
            thead.innerHTML = '<tr><th>Item</th></tr>';
            return;
        }
        
        let headerHtml = '<tr><th rowspan="2">Item</th>';
        months.forEach(month => {
            headerHtml += `<th colspan="2">${month}</th>`;
        });
        headerHtml += '</tr><tr>';
        months.forEach(month => {
            headerHtml += `<th>Plan</th><th>Daily</th>`;
        });
        headerHtml += '</tr>';
        
        headerHtml += '<tr><td>Work Days</td>';
        months.forEach(month => {
            headerHtml += `<td colspan="2" onclick="editWorkDay('${month}',${workDays[month]||0})">${workDays[month]||0}</td>`;
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
                const dailyProduct = workDay > 0 ? (qty / workDay).toFixed(2) : 0;
                
                rowHtml += `<td onclick="editPlanQty('${item.itemCode}','${month}',${qty})">${qty > 0 ? parseFloat(qty).toLocaleString() : '-'}</td>`;
                rowHtml += `<td>${qty > 0 && dailyProduct > 0 ? parseFloat(dailyProduct).toLocaleString() : '-'}</td>`;
            });
            
            const tr = document.createElement('tr');
            tr.innerHTML = rowHtml;
            tbody.appendChild(tr);
        });
    } catch (error) {
        console.error('Error loading plan data:', error);
        tbody.innerHTML = '<tr><td>Error loading plan data</td></tr>';
        thead.innerHTML = '<tr><th>Item</th></tr>';
    }
}

async function exportToExcel() {
    const lineSelect = document.getElementById('lineFilter');
    const selectedLines = Array.from(lineSelect.selectedOptions).map(opt => opt.value);
    let url = `/api/export-csv?year=${currentYear}&month=${currentMonth}`;
    if (selectedLines.length > 0) url += `&line=${selectedLines.join(',')}`;
    
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

function applyFilters() {
    closeModal('filterModal');
    loadData();
}

async function copyAsHTML() {
    const statsContainer = document.getElementById('stats-container');
    const dataTable = document.querySelector('.data-table');
    
    // Build stats HTML as table
    let statsHTML = '<table style="width: 100%; margin-bottom: 20px; border-collapse: collapse;">';
    
    statsContainer.querySelectorAll('[style*="grid-column"]').forEach(row => {
        statsHTML += '<tr>';
        row.querySelectorAll('.stat-card').forEach(card => {
            const label = card.querySelector('.stat-label').textContent;
            const value = card.querySelector('.stat-value').textContent;
            const isHighlight = card.classList.contains('stat-highlight');
            const borderColor = isHighlight ? '#10b981' : '#6366f1';
            
            statsHTML += `
                <td style="background: #ffffff; padding: 15px; border-left: 4px solid ${borderColor}; box-shadow: 0 1px 3px rgba(0,0,0,0.1); width: 33.33%;">
                    <div style="font-size: 14px; color: #64748b; font-weight: 500; margin-bottom: 8px;">${label}</div>
                    <div style="font-size: 32px; font-weight: 700; color: #1e293b;">${value}</div>
                </td>
            `;
        });
        statsHTML += '</tr>';
    });
    statsHTML += '</table>';
    
    // Build data table HTML
    const tableClone = dataTable.cloneNode(true);
    tableClone.style.cssText = 'width: 100%; border-collapse: collapse; font-size: 16px; font-family: Arial, sans-serif;';
    
    tableClone.querySelectorAll('th').forEach(th => {
        th.style.cssText = 'background: #1e3a5f; color: white; padding: 10px; text-align: center; font-weight: 600; border: 1px solid #334155;';
        if (th.classList.contains('col-total')) th.style.background = '#0284c7';
        if (th.classList.contains('col-upto')) th.style.background = '#f59e0b';
    });
    
    tableClone.querySelectorAll('tbody tr').forEach((row, rowIndex) => {
        const isActRow = rowIndex % 3 === 1;
        const isPctRow = rowIndex % 3 === 2;
        
        row.querySelectorAll('td').forEach(td => {
            let bgColor = 'white';
            let color = '#1e293b';
            let fontWeight = 'normal';
            
            // Set font-weight based on row type
            if (isActRow) fontWeight = '700';
            if (isPctRow) fontWeight = '600';
            
            // Check if cell contains percentage value
            const cellText = td.textContent.trim();
            if (isPctRow && cellText.includes('%') && cellText !== '-') {
                const pctValue = parseFloat(cellText);
                if (!isNaN(pctValue)) {
                    fontWeight = '700';
                    if (pctValue >= 95) {
                        color = '#10b981';
                    } else if (pctValue >= 80) {
                        color = '#f59e0b';
                    } else {
                        color = '#ef4444';
                    }
                }
            }
            
            // Apply class-based colors (these override default)
            if (td.classList.contains('pct-high')) {
                color = '#10b981';
                fontWeight = '700';
            }
            if (td.classList.contains('pct-medium')) {
                color = '#f59e0b';
                fontWeight = '700';
            }
            if (td.classList.contains('pct-low')) {
                color = '#ef4444';
                fontWeight = '700';
            }
            if (td.classList.contains('val-zero')) color = '#991b1b';
            if (td.classList.contains('col-total')) {
                bgColor = '#e0f2fe';
                fontWeight = '600';
            }
            if (td.classList.contains('col-upto')) {
                bgColor = '#fef3c7';
                fontWeight = '600';
            }
            if (td.classList.contains('has-comment')) {
                bgColor = '#ef4444';
                color = 'white';
                fontWeight = '600';
            }
            
            td.style.cssText = `padding: 8px; border: 1px solid #e2e8f0; text-align: center; background: ${bgColor}; color: ${color}; font-weight: ${fontWeight};`;
        });
    });
    
    const html = `
        <div style="font-family: Arial, sans-serif;">
            ${statsHTML}
            ${tableClone.outerHTML}
        </div>
    `;
    
    try {
        await navigator.clipboard.write([
            new ClipboardItem({
                'text/html': new Blob([html], { type: 'text/html' })
            })
        ]);
        alert('Copied! Paste vào Outlook bằng Ctrl+V');
    } catch (error) {
        console.error('Copy error:', error);
        alert('Copy failed. Please try again.');
    }
}

async function captureScreenshot() {
    const productionTab = document.getElementById('production-tab');
    if (!productionTab) return;
    
    const scrollY = window.scrollY;
    const scrollX = window.scrollX;
    window.scrollTo(0, 0);
    
    const tableContainer = productionTab.querySelector('.table-container');
    const filterSection = productionTab.querySelector('.card-actions');
    const filterCard = productionTab.querySelector('.card');
    const originalMaxHeight = tableContainer.style.maxHeight;
    const originalOverflow = tableContainer.style.overflow;
    const originalFilterDisplay = filterSection.style.display;
    const originalFilterCardDisplay = filterCard.style.display;
    
    tableContainer.style.maxHeight = 'none';
    tableContainer.style.overflow = 'visible';
    filterSection.style.display = 'none';
    filterCard.style.display = 'none';
    
    try {
        const canvas = await html2canvas(productionTab, {
            scale: 1.5,
            backgroundColor: '#ffffff',
            logging: false,
            useCORS: true,
            width: productionTab.scrollWidth,
            height: productionTab.scrollHeight,
            windowWidth: productionTab.scrollWidth,
            windowHeight: productionTab.scrollHeight
        });
        
        tableContainer.style.maxHeight = originalMaxHeight;
        tableContainer.style.overflow = originalOverflow;
        filterSection.style.display = originalFilterDisplay;
        filterCard.style.display = originalFilterCardDisplay;
        window.scrollTo(scrollX, scrollY);
        
        // Convert canvas to blob and copy to clipboard
        canvas.toBlob(async (blob) => {
            try {
                // Try modern clipboard API first
                if (navigator.clipboard && navigator.clipboard.write) {
                    await navigator.clipboard.write([
                        new ClipboardItem({
                            'image/png': blob
                        })
                    ]);
                    alert('✓ Screenshot copied to clipboard!');
                } else {
                    // Fallback: Create data URL and copy
                    const reader = new FileReader();
                    reader.onload = (e) => {
                        const img = new Image();
                        img.src = e.target.result;
                        img.style.display = 'none';
                        document.body.appendChild(img);
                        
                        const range = document.createRange();
                        range.selectNodeContents(img);
                        const sel = window.getSelection();
                        sel.removeAllRanges();
                        sel.addRange(range);
                        
                        try {
                            document.execCommand('copy');
                            alert('✓ Screenshot copied to clipboard!');
                        } catch (err) {
                            alert('⚠ Browser clipboard access denied. Downloading file instead.');
                        }
                        document.body.removeChild(img);
                    };
                    reader.readAsDataURL(blob);
                    return;
                }
            } catch (err) {
                console.warn('Clipboard error, downloading instead:', err);
                alert('⚠ Clipboard access restricted. Downloading file...');
            }
            
            // Download as backup
            const url = URL.createObjectURL(blob);
            const link = document.createElement('a');
            const now = new Date();
            const filename = `production_report_${now.getFullYear()}${(now.getMonth()+1).toString().padStart(2,'0')}${now.getDate().toString().padStart(2,'0')}_${now.getHours()}${now.getMinutes()}.png`;
            link.href = url;
            link.download = filename;
            document.body.appendChild(link);
            link.click();
            document.body.removeChild(link);
            URL.revokeObjectURL(url);
        }, 'image/png');
        
    } catch (error) {
        console.error('Screenshot error:', error);
        alert('❌ Failed to capture screenshot');
        tableContainer.style.maxHeight = originalMaxHeight;
        tableContainer.style.overflow = originalOverflow;
        filterSection.style.display = originalFilterDisplay;
        filterCard.style.display = originalFilterCardDisplay;
        window.scrollTo(scrollX, scrollY);
    }
}
