# Technology Stack

## Programming Languages
- **JavaScript (Node.js)**: Backend server and API implementation
- **JavaScript (ES6+)**: Frontend client-side logic
- **HTML5**: Page structure via EJS templates
- **CSS3**: Styling with modern features (sticky positioning, flexbox)

## Backend Technologies

### Runtime & Framework
- **Node.js**: JavaScript runtime environment
- **Express.js 4.18.2**: Web application framework
  - Routing and middleware
  - Static file serving
  - JSON API endpoints

### Template Engine
- **EJS 3.1.9**: Embedded JavaScript templating
  - Server-side HTML rendering
  - Dynamic content injection

### Database Access
- **node-adodb 5.0.3**: Microsoft Access database connector
  - SQL query execution
  - Windows COM-based database access
  - Supports .mdb and .accdb files

### Middleware
- **body-parser 1.20.2**: Request body parsing
  - JSON payload parsing
  - URL-encoded form data handling

## Frontend Technologies

### Core Libraries
- **Vanilla JavaScript**: No frontend framework dependencies
- **Fetch API**: HTTP requests to backend APIs
- **DOM Manipulation**: Direct DOM access for UI updates

### Styling
- **Custom CSS**: Tailored styles for production dashboard
- **Responsive Design**: Flexible layouts for different screen sizes
- **Sticky Positioning**: Fixed headers for scrollable tables

## Data Storage

### Database
- **Microsoft Access**: Primary production data source
  - Legacy database format
  - Windows-specific
  - SQL query support

### File-based Storage
- **JSON Files**: Configuration and user data
  - comments.json: User comments
  - est_qty.json: Manual estimated quantities
  - plan_data.json: Production plans
  - work_days.json: Work days per month
  - holidays.json: Holiday calendar
  - production_data.json: Cached production data

## Development Tools

### Package Manager
- **npm**: Node package manager
  - Dependency management
  - Script execution

### Development Dependencies
- **nodemon 3.0.1**: Auto-restart development server
  - File watching
  - Automatic server reload on code changes

## Build & Deployment

### Development Commands
```bash
npm install          # Install dependencies
npm run dev          # Start development server with nodemon
npm start            # Start production server
```

### Server Configuration
- **Port**: Dynamic port assignment (process.env.PORT || 0)
- **Static Files**: Served from /public directory
- **Views**: EJS templates in /views directory

## System Requirements

### Platform
- **Operating System**: Windows (required for node-adodb)
- **Node.js Version**: Compatible with ES6+ features
- **Database**: Microsoft Access installed or ODBC drivers

### Dependencies
- Windows COM components for Access database connectivity
- File system read/write permissions for JSON storage
- Network access for HTTP server

## Architecture Patterns

### Backend Patterns
- **RESTful API**: Standard HTTP methods (GET, POST, DELETE)
- **Middleware Chain**: Express middleware for request processing
- **Service Layer**: Separation of database logic (db_service.js)
- **Caching Layer**: In-memory data caching (data-cache.js)

### Frontend Patterns
- **AJAX Communication**: Asynchronous data fetching
- **Event-driven UI**: DOM event listeners for user interactions
- **Dynamic Rendering**: JavaScript-based table and calendar generation

## Data Flow Technologies

### Request/Response Cycle
1. **Client**: Fetch API → HTTP Request
2. **Server**: Express Router → Route Handler
3. **Cache**: data-cache.js → Check cached data
4. **Database**: db_service.js → node-adodb → Access DB
5. **Processing**: Data enrichment with JSON files
6. **Response**: JSON serialization → HTTP Response
7. **Client**: JSON parsing → DOM rendering

### File I/O
- **fs Module**: Node.js file system operations
- **Synchronous Reads**: fs.readFileSync for configuration
- **Synchronous Writes**: fs.writeFileSync for data persistence
- **JSON Parsing**: JSON.parse/JSON.stringify for data conversion

## Performance Optimizations

### Caching Strategy
- **Auto-refresh Cache**: Periodic database queries
- **In-memory Storage**: Fast data retrieval
- **Conditional Queries**: Cache hit avoids database access

### Database Optimization
- **Filtered Queries**: WHERE clauses for date/line filtering
- **Selective Fields**: Only retrieve needed columns
- **Connection Pooling**: Managed by node-adodb

### Frontend Optimization
- **Static Asset Caching**: Browser caching for CSS/JS
- **Minimal Dependencies**: No heavy frontend frameworks
- **Efficient DOM Updates**: Targeted element manipulation
