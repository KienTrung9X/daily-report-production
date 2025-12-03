# Development Guidelines

## Code Quality Standards

### Formatting and Structure
- **Consistent Indentation**: Use 4 spaces for JavaScript, 2 spaces for JSON
- **Line Endings**: Windows CRLF (`\r\n`) format throughout codebase
- **Semicolon Usage**: Consistent semicolon placement in JavaScript
- **Bracket Style**: Opening braces on same line, proper spacing around operators

### Naming Conventions
- **Variables**: camelCase for JavaScript variables (`currentData`, `yearMonth`)
- **Constants**: UPPER_SNAKE_CASE for constants (`DATA_FILE`, `REFRESH_INTERVAL`)
- **Functions**: Descriptive camelCase names (`loadData`, `renderPivotTable`)
- **Files**: kebab-case for CSS, camelCase for JS (`data-cache.js`, `main.js`)
- **Database Fields**: UPPER_SNAKE_CASE matching SQL conventions (`COMP_DAY`, `EST_PRO_QTY`)

### Documentation Standards
- **Inline Comments**: Descriptive comments for complex logic sections
- **Function Headers**: Brief descriptions for major functions
- **Configuration Comments**: Bilingual comments (English/Vietnamese) in config files
- **API Documentation**: Clear parameter descriptions in route handlers

## Architectural Patterns

### Modular JavaScript Architecture
```javascript
// Global state management pattern
let currentData = [];
let currentYear = 0;
let currentMonth = 0;

// Event-driven initialization
document.addEventListener('DOMContentLoaded', () => {
    // Initialize components
});
```

### Async/Await Error Handling
```javascript
async function loadData() {
    try {
        const response = await fetch(url);
        const result = await response.json();
        // Process data
    } catch (error) {
        console.error('Error loading data:', error);
        // User-friendly error display
    }
}
```

### Modal Management Pattern
```javascript
const modal = new bootstrap.Modal(document.getElementById('modalId'));

function openModal(data) {
    // Populate modal fields
    modal.show();
}

async function submitModal() {
    // Validate and submit
    modal.hide();
    loadData(); // Refresh data
}
```

## API Design Patterns

### RESTful Route Structure
- **GET /api/production** - Main data endpoint with query parameters
- **POST /api/comments** - Save user comments
- **POST /api/est-qty** - Manual quantity overrides
- **GET /api/holidays** - Holiday management

### Request/Response Format
```javascript
// Consistent error handling
res.status(500).json({ error: 'Internal server error' });

// Success responses with data
res.json({
    data: processedData,
    summary: { totalPlan, totalAct, totalPercent }
});
```

### File-based Data Storage
```javascript
// JSON file operations pattern
const filePath = path.join(__dirname, 'data.json');
let data = {};

if (fs.existsSync(filePath)) {
    data = JSON.parse(fs.readFileSync(filePath, 'utf8'));
}

fs.writeFileSync(filePath, JSON.stringify(data, null, 2));
```

## Frontend Development Patterns

### DOM Manipulation Safety
```javascript
// Safe element creation to prevent XSS
const cell = document.createElement('td');
cell.textContent = row.ITEM_NAME; // Use textContent, not innerHTML

// Event listener attachment
cell.addEventListener('click', () => {
    openModal(row.ITEM, row.YEAR_MONTH);
});
```

### Table Rendering Patterns
```javascript
// Clear and rebuild pattern
tbody.innerHTML = '';

data.forEach(row => {
    const tr = document.createElement('tr');
    // Build row elements
    tbody.appendChild(tr);
});
```

### Search and Filter Implementation
```javascript
// Debounced search pattern
let searchTimeout;
searchInput.addEventListener('input', (e) => {
    clearTimeout(searchTimeout);
    searchTimeout = setTimeout(() => {
        filterTable(e.target.value);
    }, 300);
});
```

## Data Processing Patterns

### Caching Strategy
```javascript
// Incremental cache updates
const existingData = {};
const recordKey = `${row.COMP_DAY}_${row.ITEM}_${row.PR}`;
if (!existingData[recordKey]) {
    existingData[recordKey] = row;
}
```

### Date Handling
```javascript
// Consistent date format conversion
const dayString = dayStr.toString();
const y = dayString.substring(0, 4);
const m = dayString.substring(4, 6);
const d = dayString.substring(6, 8);
const dateObj = new Date(y, m - 1, d);
```

### Data Aggregation
```javascript
// Grouping and summarization pattern
const itemsMap = {};
data.forEach(row => {
    const key = `${row.LINE1}_${row.ITEM}`;
    if (!itemsMap[key]) {
        itemsMap[key] = { info: row, days: {} };
    }
    itemsMap[key].days[dayKey] = { plan: row.EST_PRO_QTY, act: row.ACT_PRO_QTY };
});
```

## Configuration Management

### Environment-Specific Config
```javascript
// Centralized configuration pattern
const config = {
    startMonth: 202504,
    endMonth: 202512,
    lineCodes: ['111', '121', '312'],
    rowLimit: 10000000,
    // Database connection details
};

module.exports = config;
```

### User Preferences
- Manual overrides stored in JSON files (`est_qty.json`, `comments.json`)
- Plan data import/export functionality
- Holiday calendar management
- Work days configuration per month