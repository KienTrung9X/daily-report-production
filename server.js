const express = require('express');
const bodyParser = require('body-parser');
const path = require('path');
const fs = require('fs');
const config = require('./config');
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
    // Use config start month for default
    const startMonthStr = config.startMonth.toString();
    const defaultYear = parseInt(startMonthStr.substring(0, 4));
    const defaultMonth = parseInt(startMonthStr.substring(4, 6));

    res.render('index', { 
        year: defaultYear, 
        month: defaultMonth
    });
});

// API: Dashboard Calendar Data
app.get('/api/dashboard/calendar', async (req, res) => {
    try {
        const year = parseInt(req.query.year) || new Date().getFullYear();
        const month = parseInt(req.query.month) || (new Date().getMonth() + 1);

        const rawData = await dbService.getData(year, month, null, true);
        
        // Group by day for calendar
        const calendarData = {};
        rawData.forEach(row => {
            const day = row.COMP_DAY;
            if (!calendarData[day]) {
                calendarData[day] = { TOTAL_PLAN: 0, TOTAL_ACTUAL: 0 };
            }
            calendarData[day].TOTAL_PLAN += row.EST_PRO_QTY;
            calendarData[day].TOTAL_ACTUAL += row.ACT_PRO_QTY;
        });

        const result = Object.keys(calendarData).map(day => ({
            COMP_DAY: day,
            TOTAL_PLAN: calendarData[day].TOTAL_PLAN,
            TOTAL_ACTUAL: calendarData[day].TOTAL_ACTUAL,
            PERCENTAGE: calendarData[day].TOTAL_PLAN > 0 ? 
                ((calendarData[day].TOTAL_ACTUAL / calendarData[day].TOTAL_PLAN) * 100).toFixed(2) : 0
        }));

        res.json({ data: result });
    } catch (error) {
        console.error('Calendar API Error:', error);
        res.status(500).json({ error: 'Internal server error' });
    }
});

// API: Production Data
app.get('/api/production', async (req, res) => {
    try {
        const year = parseInt(req.query.year) || new Date().getFullYear();
        const month = parseInt(req.query.month) || (new Date().getMonth() + 1);
        const week = req.query.week ? parseInt(req.query.week) : null;
        const detailed = req.query.detailed === 'true';
        const startDate = req.query.startDate;
        const endDate = req.query.endDate;

        const rawData = await dbService.getData(year, month, week, detailed, startDate, endDate);
        const comments = dbService.getComments();
        
        // Load manual Est Qty
        const estQtyFile = path.join(__dirname, 'est_qty.json');
        let manualEstQty = {};
        if (fs.existsSync(estQtyFile)) {
            manualEstQty = JSON.parse(fs.readFileSync(estQtyFile, 'utf8'));
        }
        
        // Load plan data
        const planFile = path.join(__dirname, 'plan_data.json');
        let planData = {};
        if (fs.existsSync(planFile)) {
            planData = JSON.parse(fs.readFileSync(planFile, 'utf8'));
        }

        const processedData = rawData.map(row => {
            const commentKey = `${row.ITEM}_${row.YEAR_MONTH}`;
            const estQtyKey = `${row.ITEM}_${row.YEAR_MONTH}`;
            
            // Priority: 1. Manual Est Qty, 2. Plan Data, 3. Default 0
            let estQty = 0;
            if (manualEstQty[estQtyKey] !== undefined) {
                estQty = manualEstQty[estQtyKey];
            } else if (planData[estQtyKey] !== undefined) {
                estQty = typeof planData[estQtyKey] === 'object' ? planData[estQtyKey].quantity : planData[estQtyKey];
            }
            
            return {
                ...row,
                EST_PRO_QTY: estQty,
                PERCENTAGE: estQty > 0 ? ((row.ACT_PRO_QTY / estQty) * 100).toFixed(2) : 0,
                COMMENT: comments[commentKey] || '',
                IS_MANUAL_EST: manualEstQty[estQtyKey] !== undefined
            };
        });

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
        res.status(500).json({ error: 'Internal server error' });
    }
});

// API to get dashboard data (legacy)
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

// API to save manual Est Qty
app.post('/api/est-qty', (req, res) => {
    const { itemCode, yearMonth, estQty } = req.body;
    if (!itemCode || !yearMonth || estQty === undefined) {
        return res.status(400).json({ error: 'Missing required fields' });
    }
    
    const estQtyFile = path.join(__dirname, 'est_qty.json');
    let estQtyData = {};
    
    if (fs.existsSync(estQtyFile)) {
        estQtyData = JSON.parse(fs.readFileSync(estQtyFile, 'utf8'));
    }
    
    estQtyData[`${itemCode}_${yearMonth}`] = parseFloat(estQty);
    fs.writeFileSync(estQtyFile, JSON.stringify(estQtyData, null, 2));
    
    res.json({ success: true });
});

// API to import plan data
app.post('/api/plan-import', (req, res) => {
    const { planData } = req.body;
    if (!planData || !Array.isArray(planData)) {
        return res.status(400).json({ error: 'Invalid plan data' });
    }
    
    const planFile = path.join(__dirname, 'plan_data.json');
    let existingPlan = {};
    
    if (fs.existsSync(planFile)) {
        existingPlan = JSON.parse(fs.readFileSync(planFile, 'utf8'));
    }
    
    // Load work days file
    const workDaysFile = path.join(__dirname, 'work_days.json');
    let workDays = {};
    if (fs.existsSync(workDaysFile)) {
        workDays = JSON.parse(fs.readFileSync(workDaysFile, 'utf8'));
    }
    
    // Process plan data
    planData.forEach(row => {
        const itemCode = row['ITEM CD'];
        
        // Check if this is work days row (Category column = 'Work Date')
        if (row['Category'] === 'Work Date' || row['ITEM2'] === 'Work Date') {
            // This is work days row
            Object.keys(row).forEach(key => {
                if (key.match(/^\d{6}$/)) { // YYYYMM format
                    workDays[key] = parseFloat(row[key]) || 0;
                }
            });
        } else if (itemCode) {
            // This is plan data row
            const itemInfo = {
                itemCode: itemCode,
                itemName: row['ITEM1'] || '',
                itemDesc: row['ITEM2'] || '',
                category: row['Category'] || ''
            };
            
            Object.keys(row).forEach(key => {
                if (key.match(/^\d{6}$/)) { // YYYYMM format
                    const planKey = `${itemCode}_${key}`;
                    existingPlan[planKey] = {
                        quantity: parseFloat(row[key]) || 0,
                        ...itemInfo
                    };
                }
            });
        }
    });
    
    // Save work days
    fs.writeFileSync(workDaysFile, JSON.stringify(workDays, null, 2));
    
    fs.writeFileSync(planFile, JSON.stringify(existingPlan, null, 2));
    res.json({ 
        success: true, 
        imported: Object.keys(existingPlan).length,
        workDays: Object.keys(workDays).length
    });
});

// API to get plan data
app.get('/api/plan-data', (req, res) => {
    const planFile = path.join(__dirname, 'plan_data.json');
    let planData = {};
    
    if (fs.existsSync(planFile)) {
        planData = JSON.parse(fs.readFileSync(planFile, 'utf8'));
    }
    
    res.json(planData);
});

// API to get work days
app.get('/api/work-days', (req, res) => {
    const workDaysFile = path.join(__dirname, 'work_days.json');
    let workDays = {};
    
    if (fs.existsSync(workDaysFile)) {
        workDays = JSON.parse(fs.readFileSync(workDaysFile, 'utf8'));
    }
    
    res.json(workDays);
});

// API to get manual Est Qty
app.get('/api/est-qty', (req, res) => {
    const estQtyFile = path.join(__dirname, 'est_qty.json');
    let estQtyData = {};
    
    if (fs.existsSync(estQtyFile)) {
        estQtyData = JSON.parse(fs.readFileSync(estQtyFile, 'utf8'));
    }
    
    res.json(estQtyData);
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
