# Project Structure

## Directory Organization

```
daily-report-production/
├── public/                 # Static client-side assets
│   ├── css/               # Stylesheets
│   │   ├── main.css       # Main application styles
│   │   └── plan.css       # Plan table specific styles
│   ├── js/                # Client-side JavaScript
│   │   └── app.js         # Main frontend application logic
│   └── production_data.json # Cached production data
├── views/                 # EJS templates
│   └── index.ejs          # Main dashboard view
├── config.js              # Database and application configuration
├── user-config.js         # User-specific configuration
├── server.js              # Express server and API routes
├── db_service.js          # Database access layer
├── data-cache.js          # Data caching mechanism
├── comments.json          # User comments storage
├── est_qty.json           # Manual estimated quantities
├── plan_data.json         # Production plan data
├── work_days.json         # Work days per month
├── holidays.json          # Holiday calendar
└── package.json           # Node.js dependencies
```

## Core Components

### Server Layer (server.js)
- **Express Application**: Main HTTP server handling routes and middleware
- **API Endpoints**: RESTful APIs for data retrieval and manipulation
- **Static File Serving**: Serves CSS, JavaScript, and cached JSON files
- **View Rendering**: EJS template engine for server-side rendering

### Data Access Layer (db_service.js)
- **Database Connection**: Interfaces with Microsoft Access database via node-adodb
- **Query Execution**: Executes SQL queries to retrieve production data
- **Comment Management**: Handles reading/writing user comments to JSON file

### Caching Layer (data-cache.js)
- **Auto-refresh Mechanism**: Periodically refreshes production data from database
- **In-memory Cache**: Stores frequently accessed data to reduce database queries
- **Cache Invalidation**: Manages cache lifecycle and updates

### Configuration Layer
- **config.js**: Database connection strings and application settings
- **user-config.js**: User-specific preferences and customizations

### Frontend Layer (public/js/app.js)
- **UI Interactions**: Handles user input and DOM manipulation
- **API Communication**: Fetches data from backend APIs
- **Data Visualization**: Renders tables, calendars, and charts
- **Form Handling**: Manages plan imports, edits, and holiday management

### Data Storage
- **JSON Files**: Lightweight storage for comments, plans, work days, holidays
- **Access Database**: Primary data source for production records
- **File-based Persistence**: Simple read/write operations for configuration data

## Architectural Patterns

### MVC-like Structure
- **Model**: Database service and JSON file storage
- **View**: EJS templates and client-side rendering
- **Controller**: Express route handlers in server.js

### API-First Design
- RESTful endpoints for all data operations
- JSON response format for easy client consumption
- Separation of data retrieval and presentation logic

### Caching Strategy
- **Read-through Cache**: Check cache first, fallback to database
- **Time-based Refresh**: Automatic cache updates at intervals
- **Selective Caching**: Only cache frequently accessed production data

### Data Flow
1. Client requests data via API endpoint
2. Server checks cache for existing data
3. If cache miss, query database via db_service
4. Process and enrich data (add comments, plans, holidays)
5. Return JSON response to client
6. Client renders data in UI

## Component Relationships

```
Client Browser
    ↓ HTTP Request
Express Server (server.js)
    ↓ Check Cache
Data Cache (data-cache.js)
    ↓ Cache Miss
DB Service (db_service.js)
    ↓ SQL Query
Access Database
    ↑ Production Data
    ↓ Merge with
JSON Files (comments, plans, holidays)
    ↑ Enriched Data
Client Browser
```

## Key Design Decisions

1. **File-based Storage**: JSON files for user-generated data (comments, plans) for simplicity
2. **Hybrid Data Sources**: Combine database records with file-based overrides
3. **Client-side Rendering**: Heavy use of JavaScript for dynamic UI updates
4. **Sticky Headers**: CSS-based sticky positioning for large data tables
5. **Unit Conversion**: Automatic conversion between km (plan) and meters (actual)
