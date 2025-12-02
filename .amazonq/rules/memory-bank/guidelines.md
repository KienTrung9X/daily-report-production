# Development Guidelines

## Code Quality Standards

### File Structure and Organization
- **Modular Architecture**: Separate concerns with dedicated files (server.js, db_service.js, config.js)
- **Static Asset Organization**: Public assets organized in `/public/css/` and `/public/js/` directories
- **Template Structure**: EJS templates in `/views/` directory with semantic HTML structure
- **Configuration Management**: Centralized configuration in dedicated config.js module

### JavaScript Coding Standards
- **ES6+ Features**: Use const/let declarations, arrow functions, async/await patterns
- **Error Handling**: Comprehensive try-catch blocks with meaningful error messages
- **Function Naming**: Descriptive function names (loadData, renderTable, openCommentModal)
- **Variable Naming**: camelCase for variables, UPPER_CASE for constants and SQL field names
- **Code Comments**: Descriptive section headers and inline documentation for complex logic

### Database Integration Patterns
- **Connection String Format**: Use template literals for dynamic connection strings with config variables
- **SQL Query Organization**: Store queries in constants object for maintainability
- **Parameter Binding**: Use parameterized queries to prevent SQL injection
- **Error Handling**: Wrap database operations in try-catch with specific error logging
- **Connection Management**: Use ADODB.open() pattern for IBM i database connectivity

## Frontend Development Standards

### DOM Manipulation Patterns
- **Event Listeners**: Use addEventListener() for all event handling, avoid inline handlers
- **Element Creation**: Use createElement() and appendChild() for dynamic content generation
- **Safe Content Insertion**: Use textContent for user data to prevent XSS attacks
- **Class Management**: Use classList.add/remove for dynamic styling changes
- **Query Selectors**: Use getElementById() for single elements, querySelectorAll() for collections

### API Integration Standards
- **Fetch API**: Use modern fetch() for all HTTP requests with proper error handling
- **URL Construction**: Build query parameters dynamically based on filter state
- **Response Handling**: Parse JSON responses and handle both success and error cases
- **Loading States**: Show loading indicators during async operations
- **Data Validation**: Validate required parameters before API calls

### UI/UX Implementation Patterns
- **Bootstrap Integration**: Use Bootstrap 5 classes for consistent styling and responsive design
- **Modal Management**: Use Bootstrap modal API with proper initialization and event handling
- **Form Handling**: Validate form inputs and provide user feedback
- **Table Rendering**: Dynamic table generation with proper cell formatting and event binding
- **Color Coding**: Implement conditional styling based on performance thresholds (90%, 80%)

## Backend Development Standards

### Express.js Application Structure
- **Middleware Configuration**: Standard middleware stack (bodyParser, static files, view engine)
- **Route Organization**: RESTful API endpoints with clear HTTP method usage
- **Error Handling**: Consistent error response format with appropriate HTTP status codes
- **Request Processing**: Extract and validate query parameters with default values
- **Response Format**: Standardized JSON response structure with data and summary sections

### Data Processing Patterns
- **Aggregation Logic**: Implement data summarization with reduce() operations
- **Percentage Calculations**: Consistent formula application with proper rounding
- **Date Handling**: Use Date objects for date manipulation and formatting
- **Data Transformation**: Map operations to enhance raw data with calculated fields
- **Comment Integration**: Merge comment data with production data using composite keys

### File System Operations
- **JSON File Handling**: Use fs.readFileSync/writeFileSync for configuration persistence
- **Error Resilience**: Handle missing files gracefully with default values
- **Data Serialization**: Use JSON.stringify with formatting for readable output
- **Path Management**: Use path.join() for cross-platform file path construction

## Security and Performance Guidelines

### Security Practices
- **Input Validation**: Validate all user inputs before processing
- **XSS Prevention**: Use textContent instead of innerHTML for user data
- **SQL Injection Prevention**: Use parameterized queries for database operations
- **Configuration Security**: Store sensitive data in separate config files (not in version control)
- **Error Information**: Avoid exposing sensitive system information in error messages

### Performance Optimization
- **Database Queries**: Implement efficient filtering and aggregation at database level
- **Data Caching**: Store current data in global variables to avoid unnecessary API calls
- **DOM Updates**: Batch DOM operations and use document fragments for multiple insertions
- **Event Delegation**: Use event listeners on parent elements for dynamic content
- **Resource Loading**: Load external libraries from CDN for better caching

## Testing and Debugging Standards

### Testing Utilities
- **Database Testing**: Implement test scripts for database connectivity and data export
- **Sample Data**: Use console.table() for readable data output during development
- **Export Functions**: Provide CSV/TSV export capabilities for data validation
- **Connection Validation**: Test database connections with meaningful error messages

### Development Workflow
- **Hot Reload**: Use nodemon for development server with automatic restart
- **Script Organization**: Define npm scripts for different environments (start, dev, test-export)
- **Dependency Management**: Use package-lock.json for consistent dependency versions
- **Environment Configuration**: Separate development and production configurations