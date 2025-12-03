# Project Structure

## Directory Organization

### Root Level
- `server.js` - Main Express.js application server with API routes
- `config.js` - Database connection configuration
- `user-config.js` - User-configurable parameters (date ranges, line codes, limits)
- `db_service.js` - Database service layer for DB2 connectivity
- `data-cache.js` - Intelligent caching system for performance optimization
- `package.json` - Node.js dependencies and project metadata

### Data Files
- `comments.json` - User comments for specific production items
- `est_qty.json` - Manual estimated quantity overrides
- `plan_data.json` - Imported production plan data
- `work_days.json` - Working days configuration per month
- `holidays.json` - Holiday dates and descriptions
- `production_data.json` - Cached production data

### Frontend Assets (`/public`)
- `css/` - Stylesheets for UI components
  - `style.css` - Main application styles
  - `pivot.css` - Pivot table specific styles
  - `pivot-improvements.css` - Enhanced pivot table features
- `js/` - Client-side JavaScript modules
  - `main.js` - Core application logic and UI management
  - `charts.js` - Chart rendering and data visualization
  - `table-enhanced.js` - Advanced table features and interactions
  - `data-loader.js` - AJAX data loading and API communication
  - `sparkline.js` - Inline sparkline chart generation
  - `column-resizer.js` - Dynamic table column resizing

### Views (`/views`)
- `index.ejs` - Main dashboard template with EJS templating

### Configuration (`/.amazonq/rules`)
- `memory-bank/` - Project documentation and guidelines

## Core Components

### Backend Architecture
- **Express.js Server**: RESTful API server handling all data operations
- **Database Layer**: DB2 connectivity through node-adodb for production data
- **Caching System**: Intelligent data caching with auto-refresh capabilities
- **File Management**: JSON-based storage for configuration and user data

### Frontend Architecture
- **Modular JavaScript**: Separate modules for different functionalities
- **Responsive Design**: CSS Grid and Flexbox for adaptive layouts
- **Interactive Charts**: Custom chart implementations for data visualization
- **Dynamic Tables**: Enhanced table features with sorting, filtering, and resizing

### Data Flow
1. **Configuration**: User settings loaded from config files
2. **Database Query**: Production data fetched from DB2 system
3. **Data Processing**: Raw data transformed with plans, comments, and calculations
4. **Caching**: Processed data cached for performance
5. **API Response**: JSON data served to frontend
6. **Visualization**: Charts and tables rendered from API data

## Architectural Patterns
- **MVC Pattern**: Clear separation of model (database), view (EJS templates), and controller (Express routes)
- **Service Layer**: Database operations abstracted into service modules
- **Caching Strategy**: Multi-level caching with automatic refresh
- **Modular Frontend**: Component-based JavaScript architecture
- **RESTful API**: Standard HTTP methods for data operations