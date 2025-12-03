const fs = require('fs');
const path = require('path');
const dbService = require('./db_service');

const DATA_FILE = path.join(__dirname, 'public', 'production_data.json');
const REFRESH_INTERVAL = 10000; // 10 seconds

let existingData = {};
let lastUpdate = null;
let isInitialLoad = true;

// Load existing data from file
function loadExistingData() {
    if (fs.existsSync(DATA_FILE)) {
        try {
            existingData = JSON.parse(fs.readFileSync(DATA_FILE, 'utf8'));
            // Silent
        } catch (error) {
            // Silent
            existingData = {};
        }
    }
}

// Get fiscal year range (April to March)
function getFiscalYearRange() {
    const now = new Date();
    const currentYear = now.getFullYear();
    const currentMonth = now.getMonth() + 1; // 1-12
    
    let fiscalYear, startYear, endYear;
    if (currentMonth >= 4) {
        // April-December: FY starts this year
        fiscalYear = currentYear;
        startYear = currentYear;
        endYear = currentYear + 1;
    } else {
        // January-March: FY started last year
        fiscalYear = currentYear - 1;
        startYear = currentYear - 1;
        endYear = currentYear;
    }
    
    return { fiscalYear, startYear, endYear };
}

// Initial load - fetch full fiscal year data
async function initialLoad() {
    try {
        const { fiscalYear, startYear, endYear } = getFiscalYearRange();
        
        const allData = [];
        
        // Load April-December of start year
        for (let month = 4; month <= 12; month++) {
            try {
                const monthData = await dbService.getData(startYear, month, null, true);
                allData.push(...monthData);
            } catch (error) {
                // Silent
            }
        }
        
        // Load January-March of end year
        for (let month = 1; month <= 3; month++) {
            try {
                const monthData = await dbService.getData(endYear, month, null, true);
                allData.push(...monthData);
            } catch (error) {
                // Silent
            }
        }
        
        // Store all data
        allData.forEach(row => {
            const recordKey = `${row.COMP_DAY}_${row.ITEM}_${row.PR}`;
            existingData[recordKey] = row;
        });
        
        isInitialLoad = false;
        
    } catch (error) {
        // Silent
    }
}

// Incremental refresh - only current day data
async function refreshCache() {
    try {
        if (isInitialLoad) {
            await initialLoad();
        } else {
            const now = new Date();
            const currentYear = now.getFullYear();
            const currentMonth = now.getMonth() + 1;
            
            // Only fetch current month data for refresh
            const todayData = await dbService.getData(currentYear, currentMonth, null, true);
            
            todayData.forEach(row => {
                const recordKey = `${row.COMP_DAY}_${row.ITEM}_${row.PR}`;
                if (!existingData[recordKey] || existingData[recordKey].ACT_PRO_QTY !== row.ACT_PRO_QTY) {
                    existingData[recordKey] = row;
                }
            });
        }
        
        // Save updated data to public file for browser access
        const { fiscalYear, startYear, endYear } = getFiscalYearRange();
        const dataForBrowser = {
            records: Object.values(existingData),
            fiscalYear: fiscalYear,
            fiscalPeriod: `${startYear}/04 - ${endYear}/03`,
            lastUpdate: new Date().toISOString(),
            totalRecords: Object.keys(existingData).length
        };
        
        fs.writeFileSync(DATA_FILE, JSON.stringify(dataForBrowser, null, 2));
        lastUpdate = new Date();
        
        
    } catch (error) {
        // Silent
    }
}

// Get data for API (from memory)
function getCachedData() {
    return {
        data: Object.values(existingData),
        lastUpdate: lastUpdate ? lastUpdate.toISOString() : null,
        totalRecords: Object.keys(existingData).length
    };
}

// Start auto-refresh
function startAutoRefresh() {
    // Load existing data first
    loadExistingData();
    
    // Initial refresh (full load)
    refreshCache();
    
    // Set interval for auto-refresh (incremental)
    setInterval(refreshCache, REFRESH_INTERVAL);
    
    // Auto-refresh started silently
}

module.exports = {
    getCachedData,
    refreshCache,
    startAutoRefresh,
    getLastUpdate: () => lastUpdate
};