# Development Guidelines

## Code Quality Standards

### File Organization and Structure
- **Modular Architecture**: Separate concerns into dedicated files (server.js for routes, db_service.js for database operations, config files for settings)
- **Clear File Naming**: Use descriptive names that indicate purpose (user-config.js for user settings, db_service.js for database operations)
- **Consistent Directory Structure**: Organize static assets in public/ directory with css/ and js/ subdirectories

### Code Formatting and Style
- **Consistent Indentation**: Use consistent spacing throughout files (4 spaces observed in server.js, 2 spaces in JSON files)
- **Semicolon Usage**: Always terminate statements with semicolons in JavaScript files
- **String Literals**: Use single quotes for string literals consistently
- **Line Length**: Keep reasonable line lengths, break long lines for readability

### Variable and Function Naming
- **camelCase Convention**: Use camelCase for JavaScript variables and functions (currentData, loadData, getComments)
- **Descriptive Names**: Choose meaningful names that describe purpose (estQtyFile, planData, processedData)
- **Constant Naming**: Use UPPER_CASE for constants and file paths (COMMENTS_FILE, PORT)
- **Boolean Prefixes**: Use descriptive prefixes for boolean variables (detailed, IS_MANUAL_EST)

### Comment Standards
- **Header Comments**: Use decorative comment blocks for major sections with clear visual separation
- **Inline Documentation**: Add comments for complex logic and business rules
- **Vietnamese Language Support**: Include Vietnamese comments for user-facing configuration (as seen in user-config.js)
- **API Documentation**: Document API endpoints with clear descriptions of parameters and responses

## Semantic Patterns and Architecture

### Database Integration Patterns
- **Service Layer Abstraction**: Isolate database operations in dedicated service modules (db_service.js)
- **Connection String Management**: Centralize database configuration with environment-specific settings
- **Error Handling**: Implement try-catch blocks for all database operations with meaningful error messages
- **Query Optimization**: Use FETCH FIRST clauses and configurable row limits for performance

### API Design Patterns
- **RESTful Conventions**: Follow REST principles for API endpoints (/api/production, /api/comments)
- **Consistent Response Format**: Use standardized JSON response structure with data and summary fields
- **Error Response Handling**: Return appropriate HTTP status codes (400 for bad requests, 500 for server errors)
- **Parameter Validation**: Validate required parameters and return meaningful error messages

### Frontend Architecture Patterns
- **Global State Management**: Use global variables for application state (currentData, currentYear, currentMonth)
- **Event-Driven Programming**: Attach event listeners to DOM elements for user interactions
- **Async/Await Pattern**: Use modern async/await syntax for API calls and asynchronous operations
- **DOM Manipulation**: Create elements programmatically and use safe text content assignment to prevent XSS

### Configuration Management Patterns
- **Layered Configuration**: Separate user-configurable settings from system configuration
- **Configuration Inheritance**: Use module.exports to expose configuration objects from user-config to main config
- **Environment Flexibility**: Support different database connections and application parameters through configuration files

## Implementation Patterns

### Data Processing Patterns
- **Array Methods**: Use functional programming methods (map, reduce, forEach, filter) for data transformation
- **Object Destructuring**: Extract properties from objects using destructuring syntax
- **Template Literals**: Use template literals for string interpolation and multi-line strings
- **Spread Operator**: Use spread operator for object composition and array operations

### File System Operations
- **Synchronous File Operations**: Use fs.readFileSync and fs.writeFileSync for configuration and data files
- **Path Management**: Use path.join() for cross-platform file path construction
- **File Existence Checking**: Always check file existence before reading with fs.existsSync()
- **JSON Data Persistence**: Store application data in JSON files with proper formatting (null, 2 indentation)

### Error Handling Patterns
- **Comprehensive Try-Catch**: Wrap all async operations in try-catch blocks
- **Console Logging**: Use console.error for error logging with descriptive messages
- **Graceful Degradation**: Provide fallback behavior when operations fail (empty objects for missing files)
- **User-Friendly Messages**: Display meaningful error messages to users in the UI

### Frontend Development Patterns
- **Bootstrap Integration**: Use Bootstrap classes for responsive design and component styling
- **Modal Management**: Use Bootstrap modal components for user interactions (comments, data entry)
- **Dynamic Content Generation**: Build HTML content programmatically using createElement and innerHTML
- **CSS Class Management**: Use classList.add/remove for dynamic styling and state management

## Security and Best Practices

### Input Validation and Sanitization
- **Parameter Validation**: Check for required fields and validate data types before processing
- **XSS Prevention**: Use textContent instead of innerHTML when displaying user data
- **SQL Injection Prevention**: Use parameterized queries and proper escaping for database operations
- **File Path Security**: Use path.join() to prevent directory traversal attacks

### Performance Optimization
- **Database Query Limits**: Implement configurable row limits to prevent memory issues
- **Efficient Data Structures**: Use Maps and Sets for data grouping and uniqueness operations
- **Lazy Loading**: Load data on demand rather than preloading all information
- **Client-Side Caching**: Store current data in global variables to avoid unnecessary API calls

### Code Maintainability
- **Single Responsibility**: Each function and module should have a single, well-defined purpose
- **DRY Principle**: Avoid code duplication by extracting common functionality into reusable functions
- **Consistent Error Handling**: Use similar error handling patterns throughout the application
- **Configuration Externalization**: Keep configurable values in separate configuration files

### Development Workflow
- **Modular Development**: Develop features in isolated modules that can be tested independently
- **API-First Design**: Design API endpoints before implementing frontend functionality
- **Progressive Enhancement**: Build core functionality first, then add advanced features
- **Documentation**: Maintain clear documentation for configuration options and API endpoints