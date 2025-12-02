const express = require('express');
const bodyParser = require('body-parser');
const path = require('path');
const dbService = require('./db_service');

const app = express();
const PORT = 3000;

// Middleware
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: true }));
app.use(express.static(path.join(__dirname, 'public')));

// View Engine
app.set('view engine', 'ejs');
app.set('views', path.join(__dirname, 'views'));

// Routes
app.get('/', (req, res) => {
    // Default to current month
    const today = new Date();
    const currentYear = today.getFullYear();
    const currentMonth = today.getMonth() + 1; // 0-indexed

    res.render('index', { 
        year: currentYear, 
        month: currentMonth
    });
});

// API to get dashboard data
app.get('/api/data', async (req, res) => {
    try {
        const year = parseInt(req.query.year) || new Date().getFullYear();
        const month = parseInt(req.query.month) || (new Date().getMonth() + 1);
        const week = req.query.week ? parseInt(req.query.week) : null;
        const detailed = req.query.detailed === 'true';
        const startDate = req.query.startDate; // Format: YYYYMMDD
        const endDate = req.query.endDate;     // Format: YYYYMMDD

        const rawData = await dbService.getData(year, month, week, detailed, startDate, endDate);
        const comments = dbService.getComments();

        // Process data for the dashboard
        const processedData = rawData.map(row => {
            const commentKey = `${row.ITEM}_${row.YEAR_MONTH}`;
            return {
                ...row,
                PERCENTAGE: ((row.ACT_PRO_QTY / row.EST_PRO_QTY) * 100).toFixed(2),
                COMMENT: comments[commentKey] || ''
            };
        });

        // Calculate Summary Stats
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
        console.error('API Error:', error);
        res.status(500).json({ error: 'Internal server error' });
    }
});

// API to save comments
app.post('/api/comments', (req, res) => {
    const { itemCode, yearMonth, comment } = req.body;
    if (!itemCode || !yearMonth) {
        return res.status(400).json({ error: 'Missing required fields' });
    }
    dbService.saveComment(itemCode, yearMonth, comment);
    res.json({ success: true });
});

// Start Server
app.listen(PORT, () => {
    console.log(`Server is running on http://localhost:${PORT}`);
});
