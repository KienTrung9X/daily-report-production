# Project Structure

## Directory Organization

```
daily-report-production/
├── public/                    # Static client-side assets
│   ├── css/                   # Stylesheets
│   │   ├── main.css          # Global styles and table formatting
│   │   └── plan.css          # Plan tab specific styles (sticky headers/columns)
│   ├── js/                    # Client-side JavaScript
│   │   └── app.js            # Main frontend application logic
│   └── production_data.json   # Cached production data
├── views/                     # EJS templates
│   └── index.ejs             # Main dashboard page
├── .amazonq/                  # Amazon Q configuration
│   └── rules/                 # Project rules and documentation
│       └── memory-bank/       # Memory bank documentation
├── config.js                  # Database connection configuration
├── user-config.js            # User-specific configuration (gitignored)
├── db_service.js             # Database query service layer
├── data-cache.js             # Data caching mechanism with auto-refresh
├── server.js                 # Express server and API routes
├── comments.json             # User comments storage
├── est_qty.json              # Manual estimated quantities
├── plan_data.json            # Production plan data
├── work_days.json            # Work days per month
├── holidays.json             # Holiday dates and descriptions
├── check-item.js             # Item validation utility
├── test-group.js             # Testing utility
├── package.json              # Node.js dependencies and scripts
└── .gitignore                # Git ignore rules
```

## Core Components

### Backend Layer

**server.js** - Express application server
- Middleware configuration (body-parser, static files)
- EJS view engine setup
- RESTful API endpoints for production data, plans, comments, holidays
- CSV export functionality
- Data caching integration

**db_service.js** - Database abstraction layer
- Access database connection via node-adodb
- SQL query execution for production data
- Comment persistence (JSON file-based)
- Data aggregation and filtering logic

**data-cache.js** - Performance optimization
- In-memory caching of production data
- Auto-refresh mechanism (periodic updates)
- Cache invalidation strategies
- Reduces database load for frequent queries

**config.js** - Database configuration
- Access database connection string
- Database path configuration
- Environment-specific settings

**user-config.js** - User-specific overrides
- Local configuration (not version controlled)
- User-specific database paths or settings

### Frontend Layer

**views/index.ejs** - Main dashboard template
- Server-side rendered HTML structure
- Tab-based interface (Dashboard, Plan, Settings)
- Dynamic year/month initialization
- Client-side script inclusion

**public/js/app.js** - Client application logic
- Tab management and navigation
- API communication (fetch requests)
- Data table rendering and updates
- Calendar view generation
- Plan import/export handling
- Comment and holiday management
- Filter controls (year, month, week, line)

**public/css/main.css** - Global styles
- Table styling and formatting
- Color schemes and themes
- Responsive layout rules
- General UI components

**public/css/plan.css** - Plan-specific styles
- Sticky header implementation (multi-row)
- Sticky first column (item names)
- Month column grouping
- Daily vs. quantity column differentiation
- Z-index layering for sticky elements

### Data Storage

**JSON Files** (File-based persistence)
- `comments.json` - Item comments by key (ITEM_YEARMONTH)
- `est_qty.json` - Manual estimated quantities overrides
- `plan_data.json` - Production plans with metadata (quantity, line, item info)
- `work_days.json` - Working days per month (YYYYMM format)
- `holidays.json` - Holiday dates and descriptions
- `production_data.json` - Cached production data from database

**Access Database** (External)
- Production data source (actual quantities)
- Queried via ADODB connection
- Contains: YEAR_MONTH, COMP_DAY, LINE1, LINE2, ITEM, ACT_PRO_QTY, etc.

## Architectural Patterns

### MVC-like Structure
- **Model**: db_service.js, JSON files (data layer)
- **View**: EJS templates, CSS (presentation layer)
- **Controller**: server.js API routes, app.js (logic layer)

### API Design
- RESTful endpoints with consistent naming
- GET for data retrieval, POST for mutations, DELETE for removal
- JSON request/response format
- Query parameters for filtering (year, month, week, line, dates)

### Caching Strategy
- Two-tier data access: cache-first, then database fallback
- Auto-refresh cache to keep data current
- Manual cache invalidation on data changes
- Reduces database query load significantly

### Data Flow
1. Client requests data via API (app.js → server.js)
2. Server checks cache (data-cache.js)
3. If cache miss, query database (db_service.js)
4. Merge with JSON file data (plans, comments, holidays)
5. Process and calculate percentages
6. Return JSON response to client
7. Client renders data in tables/calendar

### Configuration Management
- Base configuration in config.js (version controlled)
- User overrides in user-config.js (gitignored)
- Allows team sharing while supporting local customization

### File-based Persistence
- Simple JSON file storage for user-generated data
- No additional database setup required
- Easy backup and version control
- Suitable for low-concurrency scenarios
