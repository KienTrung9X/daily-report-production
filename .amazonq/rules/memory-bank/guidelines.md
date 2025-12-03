# Development Guidelines

## Code Quality Standards

### File Organization
- **Modular Structure**: Separate concerns into dedicated files (server.js, data-cache.js, db_service.js)
- **Frontend Modules**: Split JavaScript functionality into focused modules (main.js, charts.js, table-enhanced.js)
- **Configuration Management**: Use separate config files (config.js, user-config.js) for environment settings
- **Data Storage**: JSON files for user data and configuration (comments.json, est_qty.json, plan_data.json)

### Naming Conventions
- **Variables**: Use camelCase for JavaScript variables (`currentData`, `yearMonth`, `estQtyData`)
- **Constants**: Use UPPER_SNAKE_CASE for constants (`DATA_FILE`, `REFRESH_INTERVAL`)
- **Functions**: Descriptive camelCase names (`loadData`, `renderPivotTable`, `openCommentModal`)
- **CSS Classes**: Use kebab-case with semantic prefixes (`pivot-table`, `col-product`, `cell-val`)
- **API Endpoints**: RESTful naming with hyphens (`/api/production`, `/api/est-qty`, `/api/plan-import`)

### Error Handling Patterns
- **Try-Catch Blocks**: Wrap async operations with comprehensive error handling
- **Silent Failures**: Use silent error handling for non-critical operations (cache refresh)
- **User Feedback**: Display meaningful error messages to users (`alert('Error saving comment')`)
- **Console Logging**: Log errors for debugging (`console.error('API Error:', error)`)

### Code Documentation
- **Inline Comments**: Use descriptive comments for complex logic
- **Function Headers**: Document function purpose and parameters
- **Configuration Comments**: Extensive Vietnamese comments in config files for user guidance
- **API Documentation**: Clear endpoint descriptions and parameter explanations

## Architectural Patterns

### Frontend Architecture
- **Event-Driven**: Use addEventListener for user interactions
- **Global State Management**: Store application state in global variables (`currentData`, `currentYear`)
- **Modal Management**: Bootstrap modal instances for user input dialogs
- **Dynamic Content**: DOM manipulation for table and chart rendering

### Backend Patterns
- **Express.js Structure**: RESTful API with clear route organization
- **Service Layer**: Database operations abstracted into service modules
- **Middleware Stack**: Body parser, static files, and view engine configuration
- **File-Based Storage**: JSON files for configuration and user data persistence

### Data Flow Patterns
- **Caching Strategy**: Intelligent data caching with auto-refresh capabilities
- **API Response Format**: Consistent JSON structure with data and summary objects
- **Data Transformation**: Process raw database data with plans, comments, and calculations
- **Real-time Updates**: Auto-refresh mechanisms for live data synchronization

## Common Implementation Patterns

### Database Integration
```javascript
// Standard DB query pattern
const rawData = await dbService.getData(year, month, week, detailed, startDate, endDate, lineFilter);

// Data processing with fallbacks
const estQty = manualEstQty[estQtyKey] !== undefined ? 
    manualEstQty[estQtyKey] : 
    (planData[estQtyKey] !== undefined ? planData[estQtyKey].quantity * 1000 : 0);
```

### Modal Management
```javascript
// Modal instance creation
const commentModal = new bootstrap.Modal(document.getElementById('commentModal'));

// Modal data binding
function openCommentModal(itemCode, yearMonth, currentComment) {
    document.getElementById('modal-item-code').value = itemCode;
    document.getElementById('modal-year-month').value = yearMonth;
    document.getElementById('modal-comment-text').value = currentComment;
    commentModal.show();
}
```

### Table Rendering
```javascript
// Safe DOM element creation
const td = document.createElement('td');
td.textContent = row.ITEM_NAME; // Prevents XSS
td.addEventListener('click', () => openModal(row.ITEM, row.YEAR_MONTH));
```

### API Error Handling
```javascript
try {
    const response = await fetch('/api/endpoint', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(data)
    });
    const result = await response.json();
    if (result.success) {
        // Success handling
    } else {
        alert('Operation failed');
    }
} catch (error) {
    console.error('Error:', error);
    alert('Network error');
}
```

## CSS and Styling Guidelines

### Table Styling
- **Responsive Tables**: Use `.table-responsive` containers with horizontal scrolling
- **Sticky Columns**: Position sticky for fixed columns with proper z-index management
- **Performance Indicators**: Color-coded badges and progress bars for visual feedback
- **Hover Effects**: Interactive elements with cursor pointer and hover states

### Layout Patterns
```css
/* Full-width responsive table */
.table-responsive {
    width: 100%;
    overflow-x: auto;
}

table {
    min-width: 100%; /* Key: Expand when few columns, scroll when many */
    border-collapse: collapse;
}

/* Sticky column pattern */
.sticky-col {
    position: sticky;
    left: 0;
    background: white;
    z-index: 10;
}
```

### Component Styling
- **Bootstrap Integration**: Leverage Bootstrap classes for consistent UI
- **Custom CSS**: Minimal custom styles for specific functionality
- **Color Coding**: Semantic colors for status indicators (success, warning, danger)
- **Typography**: Consistent font sizing and weight hierarchy

## Performance Optimization

### Caching Strategies
- **Data Cache**: Intelligent caching with auto-refresh for database queries
- **File-Based Cache**: JSON file storage for processed data
- **Memory Management**: Efficient data structures and cleanup

### Frontend Optimization
- **Lazy Loading**: On-demand chart and table rendering
- **Event Debouncing**: Search input with timeout to prevent excessive API calls
- **DOM Optimization**: Efficient table rendering with document fragments

### Database Optimization
- **Query Optimization**: Filtered queries with date ranges and line filters
- **Connection Management**: Proper database connection handling
- **Data Aggregation**: Server-side data processing to reduce client load

## Security Considerations

### Input Validation
- **Server-Side Validation**: Validate all API inputs before processing
- **XSS Prevention**: Use textContent instead of innerHTML for user data
- **SQL Injection Prevention**: Parameterized queries and input sanitization

### File System Security
- **Controlled Access**: Validate file paths and restrict access
- **Error Handling**: Avoid exposing system information in error messages
- **Configuration Security**: Separate sensitive configuration from code