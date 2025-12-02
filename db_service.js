// db_service.js
const fs = require('fs');
const path = require('path');
const ADODB = require('node-adodb');
const config = require('./config');

// SQL Server Queries
const SQL_QUERIES = {
    BY_MONTH: `
        SELECT SUBSTRING(COMP_DAY,1,6) AS YEAR_MONTH,
               COMP_DAY, LINE1, LINE2, LN_NAME, PR, ITEM, ITEM1, ITEM2,
               EST_PRO_QTY, ACT_PRO_QTY, UNIT, SIZE, CH, ITEM_NAME
        FROM ProductionData p
        INNER JOIN ItemMaster i ON p.ITEM = i.ITEM_CODE
        WHERE LINE1 IN ('111','121','122','161','312','315','313')
        AND SUBSTRING(COMP_DAY,1,6) = @yearMonth
        ORDER BY COMP_DAY DESC
    `,
    BY_DATE_RANGE: `
        SELECT SUBSTRING(COMP_DAY,1,6) AS YEAR_MONTH,
               COMP_DAY, LINE1, LINE2, LN_NAME, PR, ITEM, ITEM1, ITEM2,
               EST_PRO_QTY, ACT_PRO_QTY, UNIT, SIZE, CH, ITEM_NAME
        FROM ProductionData p
        INNER JOIN ItemMaster i ON p.ITEM = i.ITEM_CODE
        WHERE LINE1 IN ('111','121','122','161','312','315','313')
        AND COMP_DAY BETWEEN @startDate AND @endDate
        ORDER BY COMP_DAY DESC
    `
};



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
        const connStr = `Provider=IBMDA400.DataSource;Data Source=${config.hostname};User ID=${config.uid};PASSWORD=${config.pwd};Default Collection=WAVEDLIB`;
        const connection = ADODB.open(connStr);
        let result;
        
        if (startDate && endDate) {
            const query = `
                SELECT SUBSTR(COMP_DAY,1,6) AS YEAR_MONTH,
                       COMP_DAY, LINE1, LINE2, LN_NAME, PR, ITEM, ITEM1, ITEM2,
                       EST_PRO_QTY, ACT_PRO_QTY, UNIT, SIZE, CH
                FROM WAVEDLIB.ProductionData
                WHERE LINE1 IN ('111','121','122','161','312','315','313')
                AND COMP_DAY BETWEEN '${startDate}' AND '${endDate}'
                ORDER BY COMP_DAY DESC
            `;
            result = await connection.query(query);
        } else {
            const yearMonth = `${year}${month.toString().padStart(2, '0')}`;
            const query = `
                SELECT SUBSTR(COMP_DAY,1,6) AS YEAR_MONTH,
                       COMP_DAY, LINE1, LINE2, LN_NAME, PR, ITEM, ITEM1, ITEM2,
                       EST_PRO_QTY, ACT_PRO_QTY, UNIT, SIZE, CH
                FROM WAVEDLIB.ProductionData
                WHERE LINE1 IN ('111','121','122','161','312','315','313')
                AND SUBSTR(COMP_DAY,1,6) = '${yearMonth}'
                ORDER BY COMP_DAY DESC
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
        
        // Aggregate if not detailed
        if (!detailed) {
            const aggregated = {};
            rows.forEach(row => {
                const key = `${row.LINE1}_${row.ITEM}`;
                if (!aggregated[key]) {
                    aggregated[key] = { ...row };
                } else {
                    aggregated[key].EST_PRO_QTY += row.EST_PRO_QTY;
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
