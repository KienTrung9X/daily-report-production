const dbService = require('./db_service');
const config = require('./config');

async function testDB() {
    console.log('Testing DB connection...');
    console.log(`Config: ${config.hostname}, DB: ${config.database}, User: ${config.uid}`);
    
    try {
        const year = 2025;
        const month = 12;
        console.log(`Fetching data for ${year}/${month}...`);
        
        const data = await dbService.getData(year, month, null, true, null, null, null);
        
        console.log(`✓ Success! Got ${data ? data.length : 0} records`);
        if (data && data.length > 0) {
            console.log('Sample records:');
            data.slice(0, 3).forEach(row => {
                console.log(`  - ${row.ITEM} (${row.LINE1}): ${row.ACT_PRO_QTY} ${row.UNIT}`);
            });
        }
    } catch (error) {
        console.error('❌ DB Error:', error.message);
        console.error('Stack:', error.stack);
    }
    
    process.exit(0);
}

testDB();
