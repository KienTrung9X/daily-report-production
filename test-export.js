const ADODB = require('node-adodb');
const fs = require('fs');
const config = require('./config');

async function testExportCSV() {
    try {
        console.log('Connecting to IBM i database...');
        const connStr = `Provider=IBMDA400.DataSource;Data Source=${config.hostname};User ID=${config.uid};PASSWORD=${config.pwd};Default Collection=WAVEDLIB`;
        const connection = ADODB.open(connStr);
        
        const query = `
            SELECT SUBSTR(COMP_DAY,1,6) AS YEAR_MONTH,
                   COMP_DAY, LINE1, LINE2, LN_NAME, PR, ITEM, ITEM1, ITEM2,
                   EST_PRO_QTY, ACT_PRO_QTY, UNIT, SIZE, CH
            FROM WAVEDLIB.ProductionData
            WHERE LINE1 IN ('111','121','122','161','312','315','313')
            AND SUBSTR(COMP_DAY,1,6) BETWEEN '202504' AND '202512'
            ORDER BY COMP_DAY DESC
        `;
        
        console.log('Executing SQL query...');
        const result = await connection.query(query);
        
        console.log(`Found ${result.length} records`);
        
        if (result.length > 0) {
            // Export to CSV
            const headers = Object.keys(result[0]).join(',');
            const rows = result.map(row => Object.values(row).join(','));
            const csv = [headers, ...rows].join('\n');
            
            fs.writeFileSync('production_data.csv', csv);
            console.log('✓ Data exported to production_data.csv');
            
            // Export to TSV
            const tsvHeaders = Object.keys(result[0]).join('\t');
            const tsvRows = result.map(row => Object.values(row).join('\t'));
            const tsv = [tsvHeaders, ...tsvRows].join('\n');
            
            fs.writeFileSync('production_data.tsv', tsv);
            console.log('✓ Data exported to production_data.tsv');
            
            // Show sample data
            console.log('\nFirst 5 records:');
            console.table(result.slice(0, 5));
            
            // Show summary
            const summary = {
                totalRecords: result.length,
                dateRange: {
                    from: result[result.length - 1]?.COMP_DAY,
                    to: result[0]?.COMP_DAY
                },
                lines: [...new Set(result.map(r => r.LINE1))].sort(),
                months: [...new Set(result.map(r => r.YEAR_MONTH))].sort()
            };
            
            console.log('\nData Summary:');
            console.log('Total Records:', summary.totalRecords);
            console.log('Date Range:', summary.dateRange.from, 'to', summary.dateRange.to);
            console.log('Lines:', summary.lines.join(', '));
            console.log('Months:', summary.months.join(', '));
            
        } else {
            console.log('No data found');
        }
        
    } catch (error) {
        console.error('Database connection failed:', error.message);
        console.log('Please install IBM i Access Client Solutions and configure ODBC connection.');
    }
}

testExportCSV();