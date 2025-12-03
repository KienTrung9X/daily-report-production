// Client-side data loader for production dashboard
let cachedProductionData = null;
let lastDataUpdate = null;

// Load production data from JSON file
async function loadProductionData() {
    try {
        const response = await fetch('/production_data.json');
        if (response.ok) {
            const data = await response.json();
            cachedProductionData = data.records;
            lastDataUpdate = new Date(data.lastUpdate);
            console.log(`Loaded ${data.totalRecords} production records from cache file`);
            return cachedProductionData;
        }
    } catch (error) {
        console.error('Error loading cached data:', error);
    }
    
    // Fallback to API if file not available
    return null;
}

// Get filtered production data
function getFilteredData(year, month, lineFilter = null, week = null) {
    if (!cachedProductionData) {
        return [];
    }
    
    const yearMonth = `${year}${month.toString().padStart(2, '0')}`;
    
    let filtered = cachedProductionData.filter(row => {
        return row.YEAR_MONTH === yearMonth;
    });
    
    if (lineFilter) {
        filtered = filtered.filter(row => row.LINE1 === lineFilter);
    }
    
    if (week) {
        filtered = filtered.filter(row => {
            const day = parseInt(row.COMP_DAY.slice(6, 8));
            const date = new Date(year, month - 1, day);
            const rowWeek = getWeekNumber(date);
            const firstDay = new Date(year, month - 1, 1);
            const startWeek = getWeekNumber(firstDay);
            const targetWeek = startWeek + parseInt(week) - 1;
            return rowWeek === targetWeek;
        });
    }
    
    return filtered;
}

// Helper function for week calculation
function getWeekNumber(d) {
    d = new Date(Date.UTC(d.getFullYear(), d.getMonth(), d.getDate()));
    d.setUTCDate(d.getUTCDate() + 4 - (d.getUTCDay() || 7));
    var yearStart = new Date(Date.UTC(d.getUTCFullYear(), 0, 1));
    var weekNo = Math.ceil((((d - yearStart) / 86400000) + 1) / 7);
    return weekNo;
}

// Auto-refresh data every 15 seconds
function startDataAutoRefresh() {
    setInterval(async () => {
        await loadProductionData();
        // Trigger dashboard refresh if data updated
        if (typeof refreshDashboard === 'function') {
            refreshDashboard();
        }
    }, 15000);
}

// Initialize on page load
document.addEventListener('DOMContentLoaded', () => {
    loadProductionData().then(() => {
        startDataAutoRefresh();
    });
});