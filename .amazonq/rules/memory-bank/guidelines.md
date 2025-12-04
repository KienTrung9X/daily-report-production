# Development Guidelines

## Code Quality Standards

### File Organization
- **Module Exports**: Use CommonJS module.exports pattern for all Node.js modules
- **Dependency Imports**: Place all require() statements at the top of files
- **Configuration Separation**: Keep user-editable config in separate files (user-config.js)
- **Service Layer Pattern**: Isolate database and external service logic in dedicated service files

### Code Formatting
- **Indentation**: Use consistent indentation (4 spaces or tabs)
- **Line Breaks**: Use Windows-style line breaks (\r\n) for consistency
- **String Quotes**: Use single quotes for strings in backend, flexible in frontend
- **Semicolons**: Use semicolons consistently in backend code
- **Template Literals**: Use backticks for string interpolation and multi-line strings

### Naming Conventions
- **Variables**: camelCase for local variables (currentData, workDays, holidayDates)
- **Constants**: UPPER_SNAKE_CASE for file paths and configuration (DATA_FILE, REFRESH_INTERVAL, COMMENTS_FILE)
- **Functions**: camelCase with descriptive verbs (loadData, renderPivotTable, getCachedData)
- **Database Fields**: UPPER_SNAKE_CASE matching database schema (COMP_DAY, ACT_PRO_QTY, YEAR_MONTH)
- **HTML IDs**: kebab-case for DOM element IDs (data-table-body, plan-table-header, month-filter)
- **CSS Classes**: kebab-case for class names (item-name, item-details, pct-high)

### Documentation Standards
- **File Headers**: Include descriptive comments for service files (// db_service.js)
- **Section Comments**: Use visual separators in config files with Unicode box-drawing characters
- **Inline Comments**: Add comments for complex logic, especially date/week calculations
- **Silent Operations**: Mark intentionally silent error handling with // Silent comments
- **Multi-language Support**: Include Vietnamese comments in user-facing config files

## Semantic Patterns

### Data Flow Patterns

#### Cache-First Strategy (5/5 files)
```javascript
// Check cache before database query
const cached = dataCache.getCachedData();
if (cached && cached.data && cached.data.length > 0) {
    // Use cached data with filtering
    rawData = cached.data.filter(row => /* conditions */);
} else {
    // Fallback to database
    rawData = await dbService.getData(year, month, null, detailed);
}
```

#### Hybrid Data Sources (4/5 files)
```javascript
// Merge database data with file-based overrides
const estQtyFile = path.join(__dirname, 'est_qty.json');
let manualEstQty = {};
if (fs.existsSync(estQtyFile)) {
    manualEstQty = JSON.parse(fs.readFileSync(estQtyFile, 'utf8'));
}

// Priority: Manual > Plan > Default
let estQty = 0;
if (manualEstQty[estQtyKey] !== undefined) {
    estQty = manualEstQty[estQtyKey];
} else if (planData[estQtyKey] !== undefined) {
    estQty = planData[estQtyKey].quantity * 1000; // Unit conversion
}
```

#### Composite Key Pattern (5/5 files)
```javascript
// Create unique keys from multiple fields
const commentKey = `${row.ITEM}_${row.YEAR_MONTH}`;
const recordKey = `${row.COMP_DAY}_${row.ITEM}_${row.PR}`;
const planKey = `${itemCode}_${month}`;
```

### Error Handling Patterns

#### Silent Failure with Fallback (4/5 files)
```javascript
try {
    existingData = JSON.parse(fs.readFileSync(DATA_FILE, 'utf8'));
    // Silent
} catch (error) {
    // Silent
    existingData = {};
}
```

#### Try-Catch with Console Logging (5/5 files)
```javascript
try {
    const rawData = await dbService.getData(year, month, null, true);
    // Process data
} catch (error) {
    console.error('Production API Error:', error);
    res.status(500).json({ error: 'Internal server error' });
}
```

### API Design Patterns

#### RESTful Endpoint Structure (server.js)
```javascript
// GET for data retrieval
app.get('/api/production', async (req, res) => { /* ... */ });
app.get('/api/holidays', (req, res) => { /* ... */ });

// POST for data creation/update
app.post('/api/comments', (req, res) => { /* ... */ });
app.post('/api/plan-import', (req, res) => { /* ... */ });

// DELETE for data removal
app.delete('/api/holidays/:date', (req, res) => { /* ... */ });
```

#### Query Parameter Parsing (5/5 files)
```javascript
// Parse with defaults
const year = parseInt(req.query.year) || new Date().getFullYear();
const month = parseInt(req.query.month) || (new Date().getMonth() + 1);
const detailed = req.query.detailed === 'true';
const lineFilter = req.query.line;
```

### Frontend Patterns

#### Async/Await for API Calls (app.js)
```javascript
async function loadData() {
    try {
        const response = await fetch(url);
        const result = await response.json();
        currentData = result.data;
        renderPivotTable(currentData, workDays, currentYear, currentMonth);
    } catch (error) {
        console.error('Error:', error);
        tbody.innerHTML = '<tr><td colspan="10">Error loading data</td></tr>';
    }
}
```

#### DOM Manipulation Pattern (app.js)
```javascript
// Build HTML strings, then set innerHTML once
let headerHtml = '<tr><th>Item</th><th>Metric</th>';
sortedDays.forEach(dayStr => {
    const d = dayStr.substring(6, 8);
    const m = dayStr.substring(4, 6);
    headerHtml += `<th>${d}/${m}</th>`;
});
headerHtml += '</tr>';
thead.innerHTML = headerHtml;
```

#### Event Delegation (app.js)
```javascript
// Attach events via onclick attributes in HTML
html += `<td onclick="editWorkDay('${month}',${workDays[month]||0})">${workDays[month]||0}</td>`;
html += `<td onclick="openCommentModal('${info.ITEM}','${info.YEAR_MONTH}','${comment}')">${info.COMMENT || 'Add...'}</td>`;
```

### Data Processing Patterns

#### Aggregation with Reduce (4/5 files)
```javascript
const totalPlan = processedData.reduce((sum, row) => sum + row.EST_PRO_QTY, 0);
const totalAct = processedData.reduce((sum, row) => sum + row.ACT_PRO_QTY, 0);
```

#### Map Transformation (5/5 files)
```javascript
const processedData = rawData.map(row => {
    const commentKey = `${row.ITEM}_${row.YEAR_MONTH}`;
    return {
        ...row,
        EST_PRO_QTY: estQty,
        PERCENTAGE: estQty > 0 ? ((row.ACT_PRO_QTY / estQty) * 100).toFixed(2) : 0,
        COMMENT: comments[commentKey] || ''
    };
});
```

#### Set for Unique Values (app.js)
```javascript
const daysSet = new Set();
data.forEach(row => {
    if (row.COMP_DAY) daysSet.add(row.COMP_DAY.toString());
});
const sortedDays = Array.from(daysSet).sort();
```

### File I/O Patterns

#### Synchronous JSON Operations (5/5 files)
```javascript
// Read with existence check
if (fs.existsSync(estQtyFile)) {
    manualEstQty = JSON.parse(fs.readFileSync(estQtyFile, 'utf8'));
}

// Write with formatting
fs.writeFileSync(planFile, JSON.stringify(existingPlan, null, 2));
```

#### Path Construction (5/5 files)
```javascript
const DATA_FILE = path.join(__dirname, 'public', 'production_data.json');
const COMMENTS_FILE = path.join(__dirname, 'comments.json');
```

## Frequently Used Code Idioms

### Date Manipulation
```javascript
// Get current year/month
const now = new Date();
const currentYear = now.getFullYear();
const currentMonth = now.getMonth() + 1; // 1-12

// Format date as YYYYMMDD
const yearMonth = `${year}${month.toString().padStart(2, '0')}`;

// Extract date parts from YYYYMMDD string
const day = dayStr.substring(6, 8);
const month = dayStr.substring(4, 6);
const year = dayStr.substring(0, 4);
```

### Fiscal Year Calculation
```javascript
// April to March fiscal year
if (currentMonth >= 4) {
    fiscalYear = currentYear;
    startYear = currentYear;
    endYear = currentYear + 1;
} else {
    fiscalYear = currentYear - 1;
    startYear = currentYear - 1;
    endYear = currentYear;
}
```

### Unit Conversion
```javascript
// Convert km to meters (plan is in km, actual is in m)
estQty = planQty * 1000;

// Convert meters to km for display
const actKm = Math.round(dayData.act / 1000);
const dailyPlanKm = Math.round(dayData.plan / workDaysInMonth / 1000);
```

### Percentage Calculation with Formatting
```javascript
const percentage = estQty > 0 ? ((row.ACT_PRO_QTY / estQty) * 100).toFixed(2) : 0;

// With CSS class assignment
let pctClass = '';
if (pctVal >= 95) pctClass = 'pct-high';
else if (pctVal >= 80) pctClass = 'pct-medium';
else pctClass = 'pct-low';
```

### String Escaping for HTML
```javascript
// Escape single quotes for onclick attributes
const comment = (info.COMMENT || '').replace(/'/g, "\\'");

// Escape double quotes for CSV
`"${(row.LN_NAME || '').replace(/"/g, '""')}"`;
```

## Internal API Usage

### Database Service (db_service.js)
```javascript
// Get production data with optional filters
const rawData = await dbService.getData(
    year,           // Required: year number
    month,          // Required: month number (1-12)
    week,           // Optional: week number
    detailed,       // Optional: boolean for detailed view
    startDate,      // Optional: YYYYMMDD format
    endDate,        // Optional: YYYYMMDD format
    lineFilter      // Optional: production line code
);

// Comment operations
const comments = dbService.getComments();
dbService.saveComment(itemCode, yearMonth, comment);
```

### Data Cache Service (data-cache.js)
```javascript
// Get cached data (returns object with data array)
const cached = dataCache.getCachedData();
// Returns: { data: [], lastUpdate: ISO string, totalRecords: number }

// Manual refresh
await dataCache.refreshCache();

// Start auto-refresh (call once on server start)
dataCache.startAutoRefresh();

// Get last update timestamp
const lastUpdate = dataCache.getLastUpdate();
```

### Configuration Access (config.js)
```javascript
const config = require('./config');

// Database connection
config.hostname    // IBM i hostname
config.uid         // User ID
config.pwd         // Password
config.database    // Database name
config.provider    // ODBC provider

// Query parameters
config.startMonth  // YYYYMM format
config.endMonth    // YYYYMM format
config.lineCodes   // Array of line codes
config.rowLimit    // Maximum rows to fetch
```

## Common Annotations

### Express Route Handlers
```javascript
// API: Dashboard Calendar Data
app.get('/api/dashboard/calendar', async (req, res) => { /* ... */ });

// API: Production Data (using cache)
app.get('/api/production', async (req, res) => { /* ... */ });

// API to save comments
app.post('/api/comments', (req, res) => { /* ... */ });
```

### Function Purpose Comments
```javascript
// Load existing data from file
function loadExistingData() { /* ... */ }

// Get fiscal year range (April to March)
function getFiscalYearRange() { /* ... */ }

// Initial load - fetch full fiscal year data
async function initialLoad() { /* ... */ }
```

### Configuration Sections (Vietnamese)
```javascript
// ───────────────────────────────────────────────────────────
// NGÀY THÁNG (Thay đổi ở đây)
// ───────────────────────────────────────────────────────────

// ───────────────────────────────────────────────────────────
// DÂY CHUYỀN (Thay đổi ở đây)
// ───────────────────────────────────────────────────────────
```

## Best Practices

### Performance Optimization
1. **Cache frequently accessed data** - Use data-cache.js for production data
2. **Filter cached data before querying database** - Check cache first, fallback to DB
3. **Use SQL GROUP BY** - Aggregate in database rather than client-side
4. **Batch file reads** - Load all JSON files at once when possible
5. **Build HTML strings** - Construct full HTML before single innerHTML assignment

### Security Practices
1. **Validate user input** - Check for required fields before processing
2. **Escape user content** - Escape quotes in comments and CSV exports
3. **Use parameterized queries** - Template literals with validated inputs
4. **Limit query results** - Use FETCH FIRST with configurable row limit

### Maintainability
1. **Separate concerns** - Keep database, caching, and business logic in separate files
2. **Use descriptive variable names** - yearMonth, workDays, holidayDates
3. **Consistent error handling** - Try-catch with console.error for debugging
4. **Configuration externalization** - User-editable settings in user-config.js
5. **Silent operations** - Mark intentional silent failures with comments

### Data Integrity
1. **Composite keys** - Use multiple fields to ensure uniqueness
2. **Default values** - Provide fallbacks for missing data (|| 0, || '')
3. **Unit consistency** - Convert between km and meters consistently
4. **Date format standardization** - Use YYYYMMDD for all date strings
5. **JSON formatting** - Pretty-print with 2-space indentation for readability
