// Chart.js functionality for enhanced dashboard

// Store chart instances
let trendChartInstance = null;
let gaugeChartInstance = null;

// Initialize charts when data is loaded
function initializeCharts(data) {
    if (typeof Chart === 'undefined') {
        // Load Chart.js dynamically if not loaded
        const script = document.createElement('script');
        script.src = 'https://cdn.jsdelivr.net/npm/chart.js';
        script.onload = () => renderCharts(data);
        document.head.appendChild(script);
    } else {
        renderCharts(data);
    }
}

function renderCharts(data) {
    renderTrendChart(data);
    renderGaugeChart(data);
    renderTopPerformers(data);
}

function renderTrendChart(data) {
    const ctx = document.getElementById('trendChart');
    if (!ctx) return;
    
    // Destroy existing chart
    if (trendChartInstance) {
        trendChartInstance.destroy();
    }
    
    // Group data by date
    const dateGroups = {};
    data.forEach(row => {
        const date = row.COMP_DAY;
        if (!dateGroups[date]) {
            dateGroups[date] = { plan: 0, actual: 0 };
        }
        dateGroups[date].plan += row.EST_PRO_QTY;
        dateGroups[date].actual += row.ACT_PRO_QTY;
    });
    
    const dates = Object.keys(dateGroups).sort();
    const planData = dates.map(date => dateGroups[date].plan);
    const actualData = dates.map(date => dateGroups[date].actual);
    
    // Format dates for display
    const labels = dates.map(date => {
        const d = new Date(date.substring(0,4), date.substring(4,6)-1, date.substring(6,8));
        return d.toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
    });
    
    trendChartInstance = new Chart(ctx, {
        type: 'line',
        data: {
            labels: labels,
            datasets: [{
                label: 'Plan',
                data: planData,
                borderColor: '#6c757d',
                backgroundColor: 'rgba(108, 117, 125, 0.1)',
                tension: 0.4,
                fill: false
            }, {
                label: 'Actual',
                data: actualData,
                borderColor: '#0d6efd',
                backgroundColor: 'rgba(13, 110, 253, 0.1)',
                tension: 0.4,
                fill: false
            }]
        },
        options: {
            responsive: true,
            maintainAspectRatio: false,
            plugins: {
                legend: {
                    position: 'top',
                },
                title: {
                    display: false
                }
            },
            scales: {
                y: {
                    beginAtZero: true,
                    ticks: {
                        callback: function(value) {
                            return value.toLocaleString();
                        }
                    }
                }
            },
            interaction: {
                intersect: false,
                mode: 'index'
            }
        }
    });
}

function renderGaugeChart(data) {
    const ctx = document.getElementById('gaugeChart');
    if (!ctx) return;
    
    // Destroy existing chart
    if (gaugeChartInstance) {
        gaugeChartInstance.destroy();
    }
    
    // Calculate overall percentage
    const totalPlan = data.reduce((sum, row) => sum + row.EST_PRO_QTY, 0);
    const totalActual = data.reduce((sum, row) => sum + row.ACT_PRO_QTY, 0);
    const percentage = totalPlan > 0 ? (totalActual / totalPlan) * 100 : 0;
    
    // Create gauge chart using doughnut chart
    gaugeChartInstance = new Chart(ctx, {
        type: 'doughnut',
        data: {
            datasets: [{
                data: [percentage, 100 - percentage],
                backgroundColor: [
                    percentage >= 100 ? '#198754' : percentage >= 90 ? '#ffc107' : '#dc3545',
                    '#e9ecef'
                ],
                borderWidth: 0,
                cutout: '75%'
            }]
        },
        options: {
            responsive: true,
            maintainAspectRatio: false,
            plugins: {
                legend: {
                    display: false
                },
                tooltip: {
                    enabled: false
                }
            }
        },
        plugins: [{
            beforeDraw: function(chart) {
                const width = chart.width;
                const height = chart.height;
                const ctx = chart.ctx;
                
                ctx.restore();
                const fontSize = (height / 114).toFixed(2);
                ctx.font = `bold ${fontSize}em Inter, sans-serif`;
                ctx.textBaseline = 'middle';
                ctx.fillStyle = '#495057';
                
                const text = Math.round(percentage) + '%';
                const textX = Math.round((width - ctx.measureText(text).width) / 2);
                const textY = height / 2;
                
                ctx.fillText(text, textX, textY);
                ctx.save();
            }
        }]
    });
}

function renderTopPerformers(data) {
    const container = document.getElementById('topPerformers');
    if (!container) return;
    
    // Calculate performance for each item
    const items = data.map(row => ({
        name: row.ITEM_NAME,
        code: row.ITEM,
        line: row.LINE1,
        plan: row.EST_PRO_QTY,
        actual: row.ACT_PRO_QTY,
        percentage: row.EST_PRO_QTY > 0 ? (row.ACT_PRO_QTY / row.EST_PRO_QTY * 100) : 0
    })).filter(item => item.plan > 0);
    
    // Sort by percentage and take top 5
    const topItems = items.sort((a, b) => b.percentage - a.percentage).slice(0, 5);
    
    let html = '';
    topItems.forEach((item, index) => {
        const badgeClass = item.percentage >= 100 ? 'bg-success' : item.percentage >= 90 ? 'bg-warning text-dark' : 'bg-danger';
        const icon = index === 0 ? '🥇' : index === 1 ? '🥈' : index === 2 ? '🥉' : '🏅';
        
        html += `
            <div class="d-flex align-items-center mb-2 p-2 rounded ${index < 3 ? 'bg-light' : ''}">
                <div class="me-2">${icon}</div>
                <div class="flex-grow-1">
                    <div class="fw-medium" style="font-size: 12px;">${item.name}</div>
                    <small class="text-muted">Line ${item.line} • ${item.code}</small>
                </div>
                <div class="text-end">
                    <span class="badge ${badgeClass}" style="font-size: 10px;">
                        ${item.percentage.toFixed(1)}%
                    </span>
                    <div style="font-size: 10px; color: #6c757d;">
                        ${item.actual.toLocaleString()}/${item.plan.toLocaleString()}
                    </div>
                </div>
            </div>
        `;
    });
    
    container.innerHTML = html || '<div class="text-muted text-center p-3">No data available</div>';
}