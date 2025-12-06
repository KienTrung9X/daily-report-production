const fs = require('fs');
const path = require('path');
const readline = require('readline');
const dbService = require('./db_service');

const DATA_FILE = path.join(__dirname, 'public', 'production_data.json');
const REFRESH_INTERVAL = 3600000; // 1 hour for manual refresh only

let cachedData = null;
let lastUpdate = null;
let isLoading = false;

// Lazy load: only load data when requested
function loadDataFromFile() {
    return new Promise((resolve) => {
        if (cachedData !== null) {
            resolve(cachedData);
            return;
        }
        
        if (isLoading) {
            // Wait for current load to finish
            const checkInterval = setInterval(() => {
                if (!isLoading && cachedData !== null) {
                    clearInterval(checkInterval);
                    resolve(cachedData);
                }
            }, 100);
            return;
        }
        
        isLoading = true;
        
        try {
            if (fs.existsSync(DATA_FILE)) {
                // Stream read for large files
                const fileContent = fs.readFileSync(DATA_FILE, 'utf8');
                const parsedData = JSON.parse(fileContent);
                
                // Support both array format and object with records property
                cachedData = Array.isArray(parsedData) ? parsedData : (parsedData.records || parsedData.data || []);
                lastUpdate = new Date();
                
                console.log(`✓ Loaded ${cachedData.length} records from production_data.json`);
                isLoading = false;
                resolve(cachedData);
                return;
            }
        } catch (error) {
            console.error('Error loading data from file:', error.message);
        }
        
        isLoading = false;
        cachedData = [];
        resolve([]);
    });
}

// Optional: Refresh from DB when needed (manual trigger only)
async function refreshCacheFromDB() {
    try {
        console.log('Starting DB refresh...');
        const now = new Date();
        const currentYear = now.getFullYear();
        const currentMonth = now.getMonth() + 1;
        
        // Only fetch current month data
        const freshData = await dbService.getData(currentYear, currentMonth, null, true);
        
        if (freshData && freshData.length > 0) {
            cachedData = freshData;
            lastUpdate = new Date();
            
            // Save to file
            fs.writeFileSync(DATA_FILE, JSON.stringify(cachedData, null, 2));
            console.log(`✓ Refreshed ${cachedData.length} records from DB`);
        }
    } catch (error) {
        console.error('DB refresh error:', error.message);
    }
}

// Get data for API (from memory)
function getCachedData() {
    return {
        data: cachedData || [],
        lastUpdate: lastUpdate ? lastUpdate.toISOString() : null,
        totalRecords: cachedData ? cachedData.length : 0
    };
}

// Get data async (lazy load)
async function getCachedDataAsync() {
    const data = await loadDataFromFile();
    return {
        data: data || [],
        lastUpdate: lastUpdate ? lastUpdate.toISOString() : null,
        totalRecords: data ? data.length : 0
    };
}

// Start - don't load immediately (lazy load when needed)
function startAutoRefresh() {
    // Don't load file on startup - will load on first request
    console.log('✓ Cache system ready (lazy load enabled)');
    
    // Optional: Set interval for background DB refresh (1 hour)
    // Uncomment if you want periodic updates from DB
    // setInterval(refreshCacheFromDB, REFRESH_INTERVAL);
}

module.exports = {
    getCachedData,
    getCachedDataAsync,
    refreshCacheFromDB,
    startAutoRefresh,
    getLastUpdate: () => lastUpdate
};