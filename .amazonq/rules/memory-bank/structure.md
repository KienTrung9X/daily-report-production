# Project Structure

## Directory Organization

### Root Level
- `server.js` - Main Express.js application server with API routes
- `config.js` - Application configuration settings
- `db_service.js` - Database connection and query service
- `data-cache.js` - Caching mechanism for performance optimization
- `user-config.js` - User-specific configuration management
- `check-item.js` - Item validation utilities
- `test-group.js` - Testing utilities

### Data Files
- `comments.json` - User comments for production items
- `est_qty.json` - Manual estimated quantity overrides
- `plan_data.json` - Production plan data
- `work_days.json` - Working days configuration per month
- `holidays.json` - Holiday calendar data

### Frontend Structure
```
public/
├── css/
│   ├── style.css - Main application styles
│   └── pivot.css - Pivot table specific styles
└── js/
    ├── main.js - Core application logic and UI management
    ├── charts.js - Chart rendering and visualization
    ├── data-loader.js - Data fetching and processing
    ├── sparkline.js - Sparkline chart implementation
    └── table-enhanced.js - Enhanced table functionality
```

### Views
- `views/index.ejs` - Main dashboard template

## Core Components

### Backend Architecture
- **Express Server**: RESTful API with middleware for JSON/URL parsing
- **Database Service**: Abstracted data access layer with caching
- **File-based Storage**: JSON files for configuration and user data
- **Auto-refresh Cache**: Background data synchronization

### Frontend Architecture
- **Modular JavaScript**: Separate modules for charts, tables, and data handling
- **EJS Templating**: Server-side rendering with dynamic data injection
- **Responsive Design**: CSS Grid and Flexbox for adaptive layouts
- **Interactive Components**: Calendar views, pivot tables, and real-time charts

## Data Flow
1. Database queries through `db_service.js`
2. Data processing and caching via `data-cache.js`
3. API endpoints serve processed data
4. Frontend modules consume API data
5. User interactions update JSON configuration files