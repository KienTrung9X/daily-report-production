# Project Structure

## Directory Organization

```
daily-report-production/
├── public/                 # Static web assets
│   ├── css/               # Stylesheets
│   │   ├── pivot.css      # Pivot table styling
│   │   └── style.css      # Main application styles
│   └── js/                # Client-side JavaScript
│       └── main.js        # Frontend application logic
├── views/                 # EJS templates
│   └── index.ejs          # Main dashboard template
├── .amazonq/              # Amazon Q configuration
│   └── rules/             # Project rules and documentation
│       └── memory-bank/   # Generated documentation
├── server.js              # Express server and API routes
├── db_service.js          # Database service layer
├── config.js              # Database configuration
├── user-config.js         # User-configurable parameters
├── package.json           # Node.js dependencies
└── *.json                 # Data files (comments, plans, etc.)
```

## Core Components

### Server Layer (server.js)
- **Express Application**: Main web server handling HTTP requests
- **API Routes**: RESTful endpoints for data retrieval and updates
- **Static File Serving**: CSS, JavaScript, and asset delivery
- **Template Rendering**: EJS view engine for dynamic HTML generation

### Database Layer (db_service.js)
- **DB2 Connection Management**: IBM DB2 database connectivity
- **Data Retrieval**: Production data queries with filtering
- **Comment Management**: Persistent storage for user comments
- **Query Optimization**: Configurable row limits and date filtering

### Configuration Layer
- **config.js**: Database connection parameters
- **user-config.js**: User-configurable application settings
- **JSON Data Files**: Persistent storage for plans, comments, work days

### Frontend Layer
- **main.js**: Client-side application logic and API interactions
- **CSS Files**: Responsive styling and pivot table formatting
- **index.ejs**: Dynamic HTML template with embedded data

## Architectural Patterns

### MVC Architecture
- **Model**: Database service layer handling data operations
- **View**: EJS templates and client-side rendering
- **Controller**: Express routes managing request/response flow

### Service Layer Pattern
- Separation of database operations into dedicated service module
- Centralized data access logic with consistent error handling
- Abstraction of DB2 connectivity details from application logic

### Configuration Management
- Environment-specific settings isolated in configuration files
- User-configurable parameters separated from system configuration
- JSON-based data persistence for application state

### API Design
- RESTful endpoints following standard HTTP conventions
- Consistent JSON response format across all endpoints
- Error handling with appropriate HTTP status codes

## Data Flow

### Production Data Pipeline
1. **Database Query**: DB2 production data retrieval via db_service
2. **Data Processing**: Calculation of percentages and aggregations
3. **Plan Integration**: Merging with imported plan data and manual overrides
4. **Comment Enrichment**: Adding user comments to production records
5. **Response Formatting**: JSON serialization for frontend consumption

### Configuration Flow
1. **User Settings**: user-config.js provides application parameters
2. **Database Config**: config.js manages DB2 connection details
3. **Runtime Application**: server.js applies configuration at startup
4. **Dynamic Updates**: API endpoints allow runtime configuration changes

## Component Relationships

### Database Integration
- db_service.js abstracts all DB2 operations
- server.js consumes database service for API endpoints
- Configuration files provide connection parameters

### Frontend-Backend Communication
- main.js makes AJAX calls to server API endpoints
- server.js provides JSON responses for frontend consumption
- EJS templates render initial page state with server data

### Data Persistence
- JSON files store user-generated content (comments, plans)
- Database provides source production data
- Configuration files maintain application settings