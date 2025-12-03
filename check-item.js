const ADODB = require('node-adodb');
const config = require('./config');

async function checkItemData() {
    try {
        const connStr = `Provider=${config.provider};Data Source=${config.hostname};User ID=${config.uid};PASSWORD=${config.pwd};Default Collection=${config.database}`;
        const connection = ADODB.open(connStr);
        
        const query = `
            SELECT PCPU9H AS COMP_DAY, ITMC9H AS ITEM, PCPQ9H AS ACT_PRO_QTY, QUNC9H AS UNIT
            FROM WAVEDLIB.F9H00
            WHERE ITMC9H = '3604270'
            AND SUBSTR(PCPU9H,1,6) = '202511'
            ORDER BY PCPU9H DESC
            FETCH FIRST 20 ROWS ONLY
        `;
        
        const result = await connection.query(query);
        console.log('Data for item 3604270 in November 2025:');
        console.log('Total records:', result.length);
        
        result.forEach(row => {
            console.log(`Date: ${row.COMP_DAY}, Qty: ${row.ACT_PRO_QTY}, Unit: ${row.UNIT}`);
        });
        
        // Check if there are multiple records per day
        const dailyTotals = {};
        result.forEach(row => {
            const day = row.COMP_DAY;
            if (!dailyTotals[day]) {
                dailyTotals[day] = 0;
            }
            dailyTotals[day] += row.ACT_PRO_QTY;
        });
        
        console.log('\nDaily totals:');
        Object.keys(dailyTotals).forEach(day => {
            console.log(`${day}: ${dailyTotals[day]} ${result[0]?.UNIT || 'units'}`);
        });
        
    } catch (error) {
        console.error('Error:', error.message);
    }
}

checkItemData();