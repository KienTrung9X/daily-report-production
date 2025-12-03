const fs = require('fs');
const path = require('path');
const dbService = require('./db_service');

const DATA_FILE = path.join(__dirname, 'public', 'production_data.json');
const REFRESH_INTERVAL = 10000; // 10 seconds

let existingData = {};
let lastUpdate = null;

// Load existing data from file
function loadExistingData() {
    if (fs.existsSync(DATA_FILE)) {
        try {
            existingData = JSON.parse(fs.readFileSync(DATA_FILE, 'utf8'));
            console.log('Loaded existing data:', Object.keys(existingData).length, 'records');
        } catch (error) {
            console.error('Error loading existing data:', error);
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

// Incremental data refresh - fetch fiscal year data
async function refreshCache() {
    try {
        console.log('Checking for new fiscal year production data...');
        const { fiscalYear, startYear, endYear } = getFiscalYearRange();
        
        console.log(`Loading FY${fiscalYear}: ${startYear}/04 to ${endYear}/03`);
        
        const allData = [];
        
        // Load April-December of start year
        for (let month = 4; month <= 12; month++) {
            try {
                const monthData = await dbService.getData(startYear, month, null, true);
                allData.push(...monthData);
            } catch (error) {
                console.log(`No data for ${startYear}/${month.toString().padStart(2, '0')}`);
            }
        }
        
        // Load January-March of end year
        for (let month = 1; month <= 3; month++) {
            try {
                const monthData = await dbService.getData(endYear, month, null, true);
                allData.push(...monthData);
            } catch (error) {
                console.log(`No data for ${endYear}/${month.toString().padStart(2, '0')}`);
            }
        }
        
        // Find new records not in existing data
        const newRecords = [];
        allData.forEach(row => {
            const recordKey = `${row.COMP_DAY}_${row.ITEM}_${row.PR}`;
            if (!existingData[recordKey]) {
                existingData[recordKey] = row;
                newRecords.push(row);
            }
        });
        
        if (newRecords.length > 0) {
            // Save updated data to public file for browser access
            const dataForBrowser = {
                records: Object.values(existingData),
                fiscalYear: fiscalYear,
                fiscalPeriod: `${startYear}/04 - ${endYear}/03`,
                lastUpdate: new Date().toISOString(),
                totalRecords: Object.keys(existingData).length
            };
            
            fs.writeFileSync(DATA_FILE, JSON.stringify(dataForBrowser, null, 2));
            lastUpdate = new Date();
            
            console.log(`FY${fiscalYear}: Added ${newRecords.length} new records. Total: ${Object.keys(existingData).length} at ${lastUpdate.toLocaleTimeString()}`);
        } else {
            console.log(`FY${fiscalYear}: No new records found`);
        }
        
    } catch (error) {
        console.error('Cache refresh error:', error);
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
    
    // Initial refresh
    refreshCache();
    
    // Set interval for auto-refresh
    setInterval(refreshCache, REFRESH_INTERVAL);
    
    console.log(`Auto-refresh started: every ${REFRESH_INTERVAL/1000} seconds`);
}

module.exports = {
    getCachedData,
    refreshCache,
    startAutoRefresh,
    getLastUpdate: () => lastUpdate
};