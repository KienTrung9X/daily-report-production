// db_service.js
const fs = require('fs');
const path = require('path');
const ADODB = require('node-adodb');
const config = require('./config');

// Comments Storage (JSON File)
const COMMENTS_FILE = path.join(__dirname, 'comments.json');

function getComments() {
    if (!fs.existsSync(COMMENTS_FILE)) {
        return {};
    }
    const data = fs.readFileSync(COMMENTS_FILE, 'utf8');
    try {
        return JSON.parse(data);
    } catch (e) {
        return {};
    }
}

function saveComment(itemCode, yearMonth, comment) {
    const comments = getComments();
    const key = `${itemCode}_${yearMonth}`;
    comments[key] = comment;
    fs.writeFileSync(COMMENTS_FILE, JSON.stringify(comments, null, 2));
}

// Helper to get week number
function getWeekNumber(d) {
    d = new Date(Date.UTC(d.getFullYear(), d.getMonth(), d.getDate()));
    d.setUTCDate(d.getUTCDate() + 4 - (d.getUTCDay() || 7));
    var yearStart = new Date(Date.UTC(d.getUTCFullYear(), 0, 1));
    var weekNo = Math.ceil((((d - yearStart) / 86400000) + 1) / 7);
    return weekNo;
}

// IBM i Database functions
async function getDataFromSQL(year, month, week = null, detailed = false, startDate = null, endDate = null) {
    try {
        const connStr = `Provider=${config.provider};Data Source=${config.hostname};User ID=${config.uid};PASSWORD=${config.pwd};Default Collection=${config.database}`;
        const connection = ADODB.open(connStr);
        const lineFilter = config.lineCodes.map(code => `'${code}'`).join(',');
        let result;
        
        if (startDate && endDate) {
            const query = `
                SELECT SUBSTR(PCPU9H,1,6) AS YEAR_MONTH, PCPU9H AS COMP_DAY, LN1C9H AS LINE1, LN2C9H AS LINE2,
                       LN_NAME, PSHN9H AS PR, ITMC9H AS ITEM, IT1IA0 AS ITEM1, IT2IA0 AS ITEM2,
                       PCPQ9H AS ACT_PRO_QTY, QUNC9H AS UNIT, SIZCA0 AS SIZE, CHNCA0 AS CH
                FROM WAVEDLIB.F9H00
                INNER JOIN WAVEDLIB.FA000 ON ITMC9H = ITMCA0
                INNER JOIN (SELECT DGRC09, SUBSTR(DDTC09,1,3) AS LN1, SUBSTR(DDTC09,4,2) AS LN2,
                            CN1I09 AS LN_NAME FROM WAVEDLIB.C0900 WHERE DGRC09 = 'LN1C' AND SUBSTR(DDTC09,6,2) = '01')
                ON LN1 = LN1C9H AND LN2 = LN2C9H
                WHERE LN1C9H IN (${lineFilter})
                AND SUBSTR(PCPU9H,1,6) BETWEEN '${config.startMonth}' AND '${config.endMonth}'
                ORDER BY PCPU9H DESC
                FETCH FIRST ${config.rowLimit} ROWS ONLY
            `;
            result = await connection.query(query);
        } else {
            const yearMonth = `${year}${month.toString().padStart(2, '0')}`;
            const query = `
                SELECT SUBSTR(PCPU9H,1,6) AS YEAR_MONTH, PCPU9H AS COMP_DAY, LN1C9H AS LINE1, LN2C9H AS LINE2,
                       LN_NAME, PSHN9H AS PR, ITMC9H AS ITEM, IT1IA0 AS ITEM1, IT2IA0 AS ITEM2,
                       PCPQ9H AS ACT_PRO_QTY, QUNC9H AS UNIT, SIZCA0 AS SIZE, CHNCA0 AS CH
                FROM WAVEDLIB.F9H00
                INNER JOIN WAVEDLIB.FA000 ON ITMC9H = ITMCA0
                INNER JOIN (SELECT DGRC09, SUBSTR(DDTC09,1,3) AS LN1, SUBSTR(DDTC09,4,2) AS LN2,
                            CN1I09 AS LN_NAME FROM WAVEDLIB.C0900 WHERE DGRC09 = 'LN1C' AND SUBSTR(DDTC09,6,2) = '01')
                ON LN1 = LN1C9H AND LN2 = LN2C9H
                WHERE LN1C9H IN (${lineFilter})
                AND SUBSTR(PCPU9H,1,6) = '${yearMonth}'
                ORDER BY PCPU9H DESC
                FETCH FIRST ${config.rowLimit} ROWS ONLY
            `;
            result = await connection.query(query);
        }
        
        let rows = result;
        
        // Filter by week if needed
        if (week) {
            rows = rows.filter(row => {
                const day = parseInt(row.COMP_DAY.slice(6, 8));
                const date = new Date(year, month - 1, day);
                const rowWeek = getWeekNumber(date);
                return rowWeek === parseInt(week);
            });
        }
        
        // Add default EST_PRO_QTY = 0 for all rows
        rows = rows.map(row => ({
            ...row,
            EST_PRO_QTY: 0
        }));
        
        // Aggregate if not detailed
        if (!detailed) {
            const aggregated = {};
            rows.forEach(row => {
                const key = `${row.LINE1}_${row.ITEM}`;
                if (!aggregated[key]) {
                    aggregated[key] = { ...row };
                } else {
                    aggregated[key].ACT_PRO_QTY += row.ACT_PRO_QTY;
                }
            });
            return Object.values(aggregated);
        }
        
        return rows;
    } catch (error) {
        console.error('IBM i connection error:', error);
        throw error;
    }
}

// Export functions
module.exports = {
    getData: getDataFromSQL,
    getComments,
    saveComment
};