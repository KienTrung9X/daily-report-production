const express = require('express');
const bodyParser = require('body-parser');
const path = require('path');
const odbc = require('odbc');
const fs = require('fs');
const config = require('./config');

const app = express();
const PORT = 3000;

// ODBC Connection String
const connectionString = `DRIVER={IBM i Access ODBC Driver};SYSTEM=${config.hostname};UID=${config.uid};PWD=${config.pwd};DBQ=WAVEDLIB;`;

// Load SQL Queries
const sqlQueries = {
    byMonth: fs.readFileSync(path.join(__dirname, 'SQLcode', 'production_queries.sql'), 'utf8').split(';')[0],
    byDateRange: fs.readFileSync(path.join(__dirname, 'SQLcode', 'production_queries.sql'), 'utf8').split(';')[1],
    calendar: fs.readFileSync(path.join(__dirname, 'SQLcode', 'production_queries.sql'), 'utf8').split(';')[2]
};

// Middleware
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: true }));
app.use(express.static(path.join(__dirname, 'public')));
app.set('view engine', 'ejs');
app.set('views', path.join(__dirname, 'views'));

// Routes
app.get('/', (req, res) => {
    const today = new Date();
    res.render('index', { 
        year: today.getFullYear(), 
        month: today.getMonth() + 1
    });
});

// API: Dashboard Calendar Data
app.get('/api/dashboard/calendar', async (req, res) => {
    try {
        const year = parseInt(req.query.year) || new Date().getFullYear();
        const month = parseInt(req.query.month) || (new Date().getMonth() + 1);
        const yearMonth = `${year}${month.toString().padStart(2, '0')}`;

        const connection = await odbc.connect(connectionString);
        const result = await connection.query(sqlQueries.calendar, [yearMonth]);
        await connection.close();

        res.json({ data: result });
    } catch (error) {
        console.error('Calendar API Error:', error);
        res.status(500).json({ error: 'Database connection failed' });
    }
});

// API: Production Data
app.get('/api/production', async (req, res) => {
    try {
        const year = parseInt(req.query.year) || new Date().getFullYear();
        const month = parseInt(req.query.month) || (new Date().getMonth() + 1);
        const startDate = req.query.startDate;
        const endDate = req.query.endDate;

        const connection = await odbc.connect(connectionString);
        let result;

        if (startDate && endDate) {
            result = await connection.query(sqlQueries.byDateRange, [startDate, endDate]);
        } else {
            const yearMonth = `${year}${month.toString().padStart(2, '0')}`;
            result = await connection.query(sqlQueries.byMonth, [yearMonth]);
        }

        await connection.close();

        // Process data
        const processedData = result.map(row => ({
            ...row,
            PERCENTAGE: ((row.ACT_PRO_QTY / row.EST_PRO_QTY) * 100).toFixed(2)
        }));

        const totalPlan = processedData.reduce((sum, row) => sum + row.EST_PRO_QTY, 0);
        const totalAct = processedData.reduce((sum, row) => sum + row.ACT_PRO_QTY, 0);
        const totalPercent = totalPlan > 0 ? ((totalAct / totalPlan) * 100).toFixed(2) : 0;

        res.json({
            data: processedData,
            summary: {
                totalPlan: totalPlan.toLocaleString(),
                totalAct: totalAct.toLocaleString(),
                totalPercent: totalPercent
            }
        });
    } catch (error) {
        console.error('Production API Error:', error);
        res.status(500).json({ error: 'Database connection failed' });
    }
});

// API: Comments (keep existing functionality)
app.post('/api/comments', (req, res) => {
    const { itemCode, yearMonth, comment } = req.body;
    if (!itemCode || !yearMonth) {
        return res.status(400).json({ error: 'Missing required fields' });
    }
    
    // Simple file-based storage
    const commentsFile = path.join(__dirname, 'comments.json');
    let comments = {};
    
    if (fs.existsSync(commentsFile)) {
        comments = JSON.parse(fs.readFileSync(commentsFile, 'utf8'));
    }
    
    comments[`${itemCode}_${yearMonth}`] = comment;
    fs.writeFileSync(commentsFile, JSON.stringify(comments, null, 2));
    
    res.json({ success: true });
});

app.listen(PORT, () => {
    console.log(`Server running on http://localhost:${PORT}`);
    console.log(`Using ODBC connection to ${config.hostname}`);
});