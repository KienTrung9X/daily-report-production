# Project Structure

## Directory Organization

```
daily-report-production/
├── public/                    # Static client-side assets
│   ├── css/                   # Stylesheets
│   │   ├── style.css          # Main application styles
│   │   ├── pivot.css          # Pivot table styles
│   │   └── pivot-improvements.css  # Enhanced pivot styles
│   ├── js/                    # Client-side JavaScript
│   │   ├── main.js            # Core application logic
│   │   ├── charts.js          # Chart rendering
│   │   ├── sparkline.js       # Sparkline visualizations
│   │   ├── data-loader.js     # Data fetching utilities
│   │   ├── table-enhanced.js  # Table functionality
│   │   └── column-resizer.js  # Column resize handling
│   └── production_data.json   # Static production data
├── views/                     # Server-side templates
│   └── index.ejs              # Main dashboard template
├── server.js                  # Express server and API routes
├── config.js                  # Configuration loader
├── user-config.js             # User-specific database config
├── db_service.js              # Database access layer
├── data-cache.js              # Data caching service
├── comments.json              # Production comments storage
├── est_qty.json               # Manual estimated quantities
├── plan_data.json             # Production plan data
├── work_days.json             # Work days per month
├── holidays.json              # Holiday calendar
├── check-item.js              # Item validation utility
├── test-group.js              # Testing utility
└── package.json               # Dependencies and scripts
```

## Core Components

### Server Layer (server.js)
- Express.js web server
- RESTful API endpoints for production data
- Static file serving
- EJS template rendering
- Request routing and middleware

### Database Layer (db_service.js)
- Access database connectivity via node-adodb
- SQL query execution
- Data retrieval with filtering
- Comment persistence

### Caching Layer (data-cache.js)
- In-memory data caching
- Auto-refresh mechanism
- Performance optimization for repeated queries

### Configuration (config.js, user-config.js)
- Database connection parameters
- Application settings
- Line codes and row limits
- Date range configurations

### Client Layer (public/)
- Single-page application interface
- Dynamic data visualization
- Interactive tables and charts
- AJAX-based data loading

## Architectural Patterns

### MVC-like Structure
- **Model**: Database service and JSON data files
- **View**: EJS templates and client-side rendering
- **Controller**: Express route handlers in server.js

### Data Flow
1. Client requests data via AJAX
2. Server checks cache for existing data
3. If cache miss, query database via db_service
4. Apply filters and transformations
5. Merge with plan data and comments
6. Return JSON response to client
7. Client renders data in tables/charts

### Caching Strategy
- Cache production data in memory
- Auto-refresh on configurable intervals
- Filter cached data by year/month
- Fallback to database for cache misses
- Reduces database load for repeated queries

### Data Storage
- **Database**: Primary production data (Access DB)
- **JSON Files**: Configuration, plans, comments, holidays
- **Memory Cache**: Frequently accessed production data

## Component Relationships

### Server Dependencies
- server.js → config.js → user-config.js
- server.js → db_service.js → config.js
- server.js → data-cache.js → db_service.js

### Client Dependencies
- index.ejs → main.js → data-loader.js
- main.js → charts.js, sparkline.js, table-enhanced.js
- table-enhanced.js → column-resizer.js

### Data Flow
- Database → db_service → data-cache → server API → client
- Client → server API → JSON files (comments, plans, holidays)

## Key Design Decisions

### Separation of Concerns
- Database logic isolated in db_service.js
- Caching logic separated in data-cache.js
- Client-side logic modularized by feature

### File-based Storage
- JSON files for user-editable data (plans, comments)
- Enables easy backup and version control
- Simplifies data persistence without additional database

### Client-side Rendering
- Server provides raw data via API
- Client handles presentation and interactivity
- Reduces server load and improves responsiveness
