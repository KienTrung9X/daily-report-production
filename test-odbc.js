const odbc = require('odbc');
const config = require('./config');

async function testODBCConnection() {
    const connectionString = `DRIVER={IBM i Access ODBC Driver};SYSTEM=${config.hostname};UID=${config.uid};PWD=${config.pwd};DBQ=WAVEDLIB;`;
    
    try {
        console.log('Testing ODBC connection...');
        console.log('Connection string:', connectionString.replace(/PWD=[^;]+/, 'PWD=***'));
        
        const connection = await odbc.connect(connectionString);
        console.log('✓ Connected successfully');
        
        const result = await connection.query(`
            SELECT COUNT(*) as RECORD_COUNT 
            FROM WAVEDLIB.ProductionData 
            WHERE LINE1 IN ('111','121','122','161','312','315','313')
        `);
        
        console.log('✓ Query executed successfully');
        console.log('Total records:', result[0].RECORD_COUNT);
        
        await connection.close();
        console.log('✓ Connection closed');
        
    } catch (error) {
        console.error('✗ Connection failed:', error.message);
        console.log('\nTroubleshooting:');
        console.log('1. Install IBM i Access Client Solutions');
        console.log('2. Configure IBM i Access ODBC Driver');
        console.log('3. Verify network connectivity to', config.hostname);
    }
}

testODBCConnection();