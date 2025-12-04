# Development Guidelines

## Code Quality Standards

### Formatting Conventions
- **Line Endings**: Windows-style CRLF (`\r\n`) used throughout the codebase
- **Indentation**: 4 spaces for JavaScript files (both client and server)
- **Semicolons**: Consistently used to terminate statements
- **String Quotes**: Single quotes for JavaScript strings, double quotes for HTML attributes
- **Trailing Commas**: Not used in object/array literals

### Naming Conventions
- **Variables**: camelCase for local variables and function parameters
  - Examples: `currentData`, `yearMonth`, `estQtyFile`, `workDaysFile`
- **Constants**: UPPER_SNAKE_CASE for module-level constants
  - Examples: `DATA_FILE`, `REFRESH_INTERVAL`, `PORT`
- **Functions**: camelCase for function names
  - Examples: `loadData()`, `renderTable()`, `getCachedData()`, `startAutoRefresh()`
- **Global State**: camelCase with descriptive prefixes
  - Examples: `currentYear`, `currentMonth`, `currentViewMode`, `currentTab`
- **DOM IDs**: kebab-case for HTML element IDs
  - Examples: `data-table-body`, `month-filter`, `plan-table-header`
- **CSS Classes**: kebab-case with Bootstrap conventions
  - Examples: `table-responsive`, `text-center`, `bg-success`

### File Organization
- **Server Files**: Root directory (server.js, config.js, db_service.js)
- **Client JavaScript**: `/public/js/` directory with feature-based naming
- **Stylesheets**: `/public/css/` directory with purpose-based naming
- **Data Files**: Root directory for JSON configuration files
- **Templates**: `/views/` directory for EJS templates

## Semantic Patterns

### Async/Await Pattern
Consistently used for asynchronous operations throughout the codebase:

```javascript
async function loadData() {
    try {
        const response = await fetch(url);
        const result = await response.json();
        // Process result
    } catch (error) {
        console.error('Error loading data:', error);
        // Handle error
    }
}
```

**Frequency**: Used in 100% of asynchronous functions
**Key Characteristics**:
- Always wrapped in try-catch blocks
- Error logging to console
- User-friendly error messages displayed in UI

### Express Route Handler Pattern
Standard structure for API endpoints:

```javascript
app.get('/api/endpoint', async (req, res) => {
    try {
        // Extract and validate parameters
        const param = parseInt(req.query.param) || defaultValue;
        
        // Fetch/process data
        const data = await service.getData(param);
        
        // Return JSON response
        res.json({ data: data, success: true });
    } catch (error) {
        console.error('API Error:', error);
        res.status(500).json({ error: 'Internal server error' });
    }
});
```

**Frequency**: Used in all 20+ API endpoints
**Key Characteristics**:
- Parameter extraction with defaults using `||` operator
- Consistent error handling with 500 status
- JSON response format with success/error indicators

### File-based Data Persistence Pattern
JSON files used for configuration and user data:

```javascript
const dataFile = path.join(__dirname, 'data.json');
let data = {};

// Read
if (fs.existsSync(dataFile)) {
    data = JSON.parse(fs.readFileSync(dataFile, 'utf8'));
}

// Write
fs.writeFileSync(dataFile, JSON.stringify(data, null, 2));
```

**Frequency**: Used for 6 data files (comments, est_qty, plan_data, work_days, holidays, production_data)
**Key Characteristics**:
- Existence check before reading
- Pretty-printed JSON with 2-space indentation
- Synchronous file operations for simplicity

### DOM Manipulation Pattern
Safe, XSS-resistant DOM creation:

```javascript
const cell = document.createElement('td');
cell.className = 'text-center';
cell.textContent = row.VALUE; // Safe text content
cell.addEventListener('click', () => {
    handleClick(row.ITEM, row.YEAR_MONTH);
});
tr.appendChild(cell);
```

**Frequency**: Used throughout main.js for table rendering
**Key Characteristics**:
- createElement instead of innerHTML for user data
- textContent for safe text insertion
- Event listeners attached programmatically
- Arrow functions for event handlers

### Data Transformation Pipeline
Consistent pattern for processing API data:

```javascript
const processedData = rawData.map(row => {
    const key = `${row.ITEM}_${row.YEAR_MONTH}`;
    
    // Calculate derived values
    const estQty = manualEstQty[key] || planData[key] || 0;
    const percentage = estQty > 0 ? ((row.ACT_PRO_QTY / estQty) * 100).toFixed(2) : 0;
    
    return {
        ...row,
        EST_PRO_QTY: estQty,
        PERCENTAGE: percentage,
        COMMENT: comments[key] || ''
    };
});
```

**Frequency**: Used in 3 major API endpoints
**Key Characteristics**:
- Array.map for transformations
- Spread operator for object merging
- Composite keys for lookups
- Fallback values with `||` operator

### Modal Management Pattern
Bootstrap modal integration:

```javascript
const modal = new bootstrap.Modal(document.getElementById('modalId'));

function openModal(param1, param2, currentValue) {
    document.getElementById('modal-field-1').value = param1;
    document.getElementById('modal-field-2').value = param2;
    document.getElementById('modal-field-3').value = currentValue;
    modal.show();
}

async function submitModal() {
    const field1 = document.getElementById('modal-field-1').value;
    const field2 = document.getElementById('modal-field-2').value;
    
    const response = await fetch('/api/endpoint', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ field1, field2 })
    });
    
    const result = await response.json();
    if (result.success) {
        modal.hide();
        loadData(); // Refresh
    }
}
```

**Frequency**: Used for 6 modals (comments, est qty, plan import, plan edit, work day edit, holidays)
**Key Characteristics**:
- Modal instances created at module level
- Separate open and submit functions
- Form fields populated before showing
- Data refresh after successful submission

### Caching Strategy Pattern
In-memory cache with auto-refresh:

```javascript
let cachedData = {};
let lastUpdate = null;

async function refreshCache() {
    try {
        const newData = await fetchData();
        newData.forEach(row => {
            const key = generateKey(row);
            cachedData[key] = row;
        });
        lastUpdate = new Date();
    } catch (error) {
        // Silent failure
    }
}

function startAutoRefresh() {
    refreshCache(); // Initial load
    setInterval(refreshCache, REFRESH_INTERVAL);
}
```

**Frequency**: Implemented in data-cache.js
**Key Characteristics**:
- Object-based cache with composite keys
- Silent error handling for background operations
- Periodic refresh with setInterval
- Incremental updates to reduce load

### Date Formatting Pattern
Consistent date string manipulation:

```javascript
// YYYYMMDD string to Date object
const dayString = row.COMP_DAY.toString();
const y = dayString.substring(0, 4);
const m = dayString.substring(4, 6);
const d = dayString.substring(6, 8);
const dateObj = new Date(y, m - 1, d);

// Date to display format
const dateLabel = dateObj.toLocaleDateString('en-US', { 
    day: '2-digit', 
    month: 'short' 
});

// Date to YYYYMMDD
const formatted = date.replace(/-/g, '');
```

**Frequency**: Used in 10+ locations for date handling
**Key Characteristics**:
- YYYYMMDD format for database dates
- String manipulation with substring
- toLocaleDateString for display
- Month adjustment (0-indexed in JavaScript)

### Conditional Rendering Pattern
Performance-based styling and badges:

```javascript
const percentage = parseFloat(row.PERCENTAGE);

// Row highlighting
if (row.IS_HOLIDAY) {
    tr.classList.add('table-secondary');
} else if (percentage < 90) {
    tr.classList.add('bg-low-perf');
}

// Badge color coding
let badgeClass;
if (percentage < 80) {
    badgeClass = 'badge bg-danger';
} else if (percentage >= 100) {
    badgeClass = 'badge bg-success';
} else {
    badgeClass = 'badge bg-warning text-dark';
}
```

**Frequency**: Used throughout UI rendering
**Key Characteristics**:
- Threshold-based styling (80%, 90%, 100%)
- Bootstrap utility classes for colors
- Semantic color coding (red=poor, yellow=warning, green=good)

### Data Aggregation Pattern
Grouping and summarization:

```javascript
// Group by key
const groups = {};
data.forEach(row => {
    const key = row.ITEM;
    if (!groups[key]) {
        groups[key] = { info: row, days: {} };
    }
    groups[key].days[row.COMP_DAY] = {
        plan: row.EST_PRO_QTY,
        act: row.ACT_PRO_QTY
    };
});

// Calculate totals
const totalPlan = data.reduce((sum, row) => sum + row.EST_PRO_QTY, 0);
const totalAct = data.reduce((sum, row) => sum + row.ACT_PRO_QTY, 0);
```

**Frequency**: Used in pivot table and summary calculations
**Key Characteristics**:
- Object-based grouping with composite keys
- Nested object structures for hierarchical data
- Array.reduce for aggregations
- Initialization checks before accumulation

## Internal API Usage

### Database Service API
```javascript
// Get production data with filters
const data = await dbService.getData(
    year,        // Required: 4-digit year
    month,       // Required: 1-12
    week,        // Optional: week number
    detailed,    // Boolean: include all fields
    startDate,   // Optional: YYYYMMDD format
    endDate,     // Optional: YYYYMMDD format
    lineFilter   // Optional: line code
);

// Comment management
const comments = dbService.getComments();
dbService.saveComment(itemCode, yearMonth, comment);
```

### Data Cache API
```javascript
// Get cached data
const cached = dataCache.getCachedData();
// Returns: { data: [], lastUpdate: ISO string, totalRecords: number }

// Manual refresh
await dataCache.refreshCache();

// Auto-refresh (called on server start)
dataCache.startAutoRefresh();
```

### Client-side Data Loading
```javascript
// Fetch production data
const response = await fetch(`/api/production?year=${year}&month=${month}&detailed=true&line=${line}`);
const result = await response.json();
// Returns: { data: [], summary: { totalPlan, totalAct, totalPercent } }

// Submit data
const response = await fetch('/api/endpoint', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ field1, field2 })
});
const result = await response.json();
// Returns: { success: boolean, error?: string }
```

## Code Idioms

### Parameter Extraction with Defaults
```javascript
const year = parseInt(req.query.year) || new Date().getFullYear();
const month = parseInt(req.query.month) || (new Date().getMonth() + 1);
const week = req.query.week ? parseInt(req.query.week) : null;
```

### Safe Property Access
```javascript
const value = row.FIELD || '';
const nested = obj.prop?.subprop || defaultValue;
const count = array?.length || 0;
```

### Composite Key Generation
```javascript
const key = `${itemCode}_${yearMonth}`;
const recordKey = `${row.COMP_DAY}_${row.ITEM}_${row.PR}`;
```

### Array Filtering and Mapping
```javascript
const filtered = data.filter(row => row.LINE1 === lineFilter);
const transformed = data.map(row => ({ ...row, newField: calculate(row) }));
const sorted = [...array].sort((a, b) => a.value - b.value);
```

### Conditional Chaining
```javascript
if (cached && cached.data && cached.data.length > 0) {
    // Use cached data
}

const result = condition1 ? value1 : condition2 ? value2 : defaultValue;
```

### Number Formatting
```javascript
const formatted = value.toLocaleString(); // Thousands separator
const fixed = value.toFixed(2); // 2 decimal places
const rounded = Math.round(value); // Integer
const percentage = (value * 100).toFixed(0) + '%';
```

### String Manipulation
```javascript
const padded = month.toString().padStart(2, '0'); // "01", "02", etc.
const cleaned = value.replace(/,/g, ''); // Remove commas
const escaped = text.replace(/"/g, '""'); // CSV escaping
```

## Common Annotations

### Console Logging
```javascript
console.log('API URL:', url);
console.log('Sample data:', data ? data.slice(0, 2) : 'No data');
console.error('Error loading data:', error);
```
**Usage**: Debugging and error tracking, not removed in production

### Comments for Complex Logic
```javascript
// Priority: 1. Manual Est Qty, 2. Plan Data, 3. Default 0
// Convert km to m (plan is in km, actual is in m)
// Group by day for calendar
```
**Usage**: Explain business logic and unit conversions

### TODO/FIXME Markers
Not commonly used in this codebase - prefer immediate implementation

## Best Practices

### Error Handling
- Always wrap async operations in try-catch
- Log errors to console for debugging
- Display user-friendly messages in UI
- Return 500 status for server errors
- Silent failures for background operations (cache refresh)

### Security
- Use textContent instead of innerHTML for user data
- Escape CSV output with double quotes
- Validate required fields before processing
- No authentication implemented (internal tool)

### Performance
- Cache frequently accessed data in memory
- Use incremental refresh for large datasets
- Filter cached data before database queries
- Batch DOM updates with requestAnimationFrame
- Debounce search input (300ms delay)

### Code Reusability
- Separate concerns (server, database, cache, client)
- Modular JavaScript files by feature
- Shared utility functions (date formatting, number formatting)
- Bootstrap modal pattern reused across features

### Data Consistency
- Composite keys for unique identification
- Consistent date format (YYYYMMDD)
- Unit conversions documented in comments
- Fallback values for missing data
