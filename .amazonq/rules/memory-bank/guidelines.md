# Development Guidelines

## Code Quality Standards

### File Structure and Organization
- **Configuration Pattern**: Use separate config files (`config.js`, `user-config.js`) with clear separation between system and user settings
- **Service Layer**: Implement dedicated service modules (`db_service.js`) for database operations and business logic
- **Static Assets**: Organize frontend assets in `public/` with subdirectories for `css/` and `js/`
- **Template Organization**: Keep view templates in dedicated `views/` directory using EJS templating

### Naming Conventions
- **Variables**: Use camelCase for JavaScript variables (`startMonth`, `yearMonth`, `estQty`)
- **Constants**: Use UPPER_CASE for file paths and database field names (`COMMENTS_FILE`, `COMP_DAY`, `ACT_PRO_QTY`)
- **API Endpoints**: Use kebab-case for URL paths (`/api/dashboard/calendar`, `/api/plan-data`)
- **File Names**: Use kebab-case for multi-word files (`db_service.js`, `user-config.js`)

### Error Handling Patterns
- **Try-Catch Blocks**: Wrap all async operations and file I/O in try-catch blocks
- **Consistent Error Responses**: Return standardized JSON error objects with `error` field
- **Console Logging**: Use descriptive error messages with context (`'Calendar API Error:'`, `'Error editing plan data:'`)
- **HTTP Status Codes**: Use appropriate status codes (400 for bad requests, 500 for server errors, 404 for not found)

## API Design Standards

### Request Validation
- **Required Field Checks**: Always validate required parameters before processing
- **Type Conversion**: Use `parseInt()` and `parseFloat()` for numeric conversions with fallbacks
- **Default Values**: Provide sensible defaults using logical OR operator (`|| new Date().getFullYear()`)

### Response Structure
- **Consistent Format**: Use standardized response objects with `data` and `summary` fields
- **Success Indicators**: Include `success: true` in successful POST/PUT responses
- **Data Transformation**: Process raw data before sending to client (add calculated fields, format numbers)

### Route Organization
```javascript
// Pattern: Verb + Resource + Action
app.get('/api/production', handler);      // Get data
app.post('/api/est-qty', handler);        // Create/Update
app.delete('/api/holidays/:date', handler); // Delete with parameter
```

## Data Management Patterns

### File-Based Persistence
- **JSON Storage**: Use JSON files for configuration and user data with proper formatting (`JSON.stringify(data, null, 2)`)
- **File Existence Checks**: Always check `fs.existsSync()` before reading files
- **Atomic Writes**: Write complete objects to avoid partial data corruption
- **Backup Strategy**: Load existing data before modifications to preserve state

### Database Integration
- **Connection Strings**: Use configuration-driven connection parameters
- **Query Parameterization**: Build dynamic queries with proper escaping and filtering
- **Result Processing**: Transform database results to match frontend expectations
- **Connection Management**: Handle database errors gracefully with meaningful messages

## Frontend Development Standards

### JavaScript Patterns
- **Dynamic Loading**: Load external libraries conditionally (`typeof Chart === 'undefined'`)
- **Event-Driven Architecture**: Use callback functions for asynchronous operations
- **Data Aggregation**: Group and process data client-side for performance
- **Chart Configuration**: Use consistent color schemes and responsive settings

### Chart.js Implementation
```javascript
// Standard chart options pattern
options: {
    responsive: true,
    maintainAspectRatio: false,
    plugins: { legend: { position: 'top' } },
    scales: { y: { beginAtZero: true } }
}
```

### Data Processing
- **Aggregation Logic**: Group data by keys using object accumulation patterns
- **Date Formatting**: Convert database date formats (YYYYMMDD) to display formats
- **Percentage Calculations**: Use `.toFixed(2)` for consistent decimal places
- **Null Safety**: Check for undefined/null values before operations

## Configuration Management

### Environment Settings
- **User Configuration**: Keep user-modifiable settings in separate files
- **System Configuration**: Abstract system settings through configuration layer
- **Database Credentials**: Store connection details in configuration objects
- **Feature Flags**: Use configuration for enabling/disabling features

### Multilingual Support
- **Comment Standards**: Use Vietnamese comments for user-facing configuration
- **Code Documentation**: Use English for technical comments and variable names
- **User Interface**: Support localized date formats and number formatting

## Performance Optimization

### Database Queries
- **Row Limiting**: Use `FETCH FIRST n ROWS ONLY` for large datasets
- **Selective Fields**: Query only required columns to reduce data transfer
- **Filtering**: Apply WHERE clauses at database level rather than application level
- **Indexing**: Structure queries to leverage database indexes

### Memory Management
- **Data Streaming**: Process large datasets in chunks rather than loading entirely
- **Object Reuse**: Reuse configuration objects and connections where possible
- **Garbage Collection**: Clear large objects after processing to free memory

## Security Considerations

### Input Validation
- **SQL Injection Prevention**: Use parameterized queries and input sanitization
- **File Path Validation**: Validate file paths to prevent directory traversal
- **Data Type Checking**: Verify data types before processing
- **Range Validation**: Check numeric ranges for dates and quantities

### Access Control
- **Configuration Security**: Protect database credentials and sensitive settings
- **File Permissions**: Ensure appropriate read/write permissions on data files
- **Error Information**: Avoid exposing sensitive information in error messages