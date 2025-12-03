const ADODB = require('node-adodb');
const config = require('./config');

async function testGroupBy() {
    try {
        const connStr = `Provider=${config.provider};Data Source=${config.hostname};User ID=${config.uid};PASSWORD=${config.pwd};Default Collection=${config.database}`;
        const connection = ADODB.open(connStr);
        
        // Test query with GROUP BY
        const query = `
            SELECT PCPU9H AS COMP_DAY, ITMC9H AS ITEM, 
                   SUM(PCPQ9H) AS TOTAL_QTY, COUNT(*) AS RECORD_COUNT
            FROM WAVEDLIB.F9H00
            WHERE ITMC9H = '3604270'
            AND SUBSTR(PCPU9H,1,6) = '202511'
            AND PCPU9H = '20251128'
            GROUP BY PCPU9H, ITMC9H
        `;
        
        const result = await connection.query(query);
        console.log('GROUP BY result for item 3604270 on 2025-11-28:');
        console.table(result);
        
        // Test without GROUP BY
        const query2 = `
            SELECT PCPU9H AS COMP_DAY, ITMC9H AS ITEM, PCPQ9H AS QTY
            FROM WAVEDLIB.F9H00
            WHERE ITMC9H = '3604270'
            AND PCPU9H = '20251128'
            FETCH FIRST 5 ROWS ONLY
        `;
        
        const result2 = await connection.query(query2);
        console.log('\nIndividual records (first 5):');
        console.table(result2);
        
    } catch (error) {
        console.error('Error:', error.message);
    }
}

testGroupBy();