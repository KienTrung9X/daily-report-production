# Project Structure

## Directory Organization

### Root Level
- `server.js` - Main Express.js application entry point
- `db_service.js` - Database abstraction layer and data access logic
- `config.js` - Application configuration and database connection settings
- `test-export.js` - Database testing and export utilities
- `query.sql` - SQL queries for database operations
- `comments.json` - Persistent storage for user comments
- `package.json` - Node.js dependencies and scripts

### Frontend Assets (`/public`)
- `css/` - Stylesheets for UI components
  - `style.css` - Main application styles
  - `pivot.css` - Data table and pivot styling
- `js/` - Client-side JavaScript
  - `main.js` - Frontend logic, API calls, and DOM manipulation

### Views (`/views`)
- `index.ejs` - Main dashboard template with EJS templating

### Configuration (`/.amazonq`)
- `rules/memory-bank/` - Project documentation and guidelines

## Core Components

### Backend Architecture
- **Express Server** (`server.js`): RESTful API endpoints, middleware configuration, static file serving
- **Database Service** (`db_service.js`): Data access layer, query execution, comment management
- **Configuration Module** (`config.js`): Database connection strings, application settings

### Frontend Architecture
- **Single Page Application**: EJS template with dynamic JavaScript
- **API Integration**: AJAX calls to backend endpoints
- **Interactive UI**: Data filtering, chart rendering, comment management

### Data Flow
1. Client requests dashboard data via `/api/data` endpoint
2. Server processes query parameters (year, month, week, date range)
3. Database service executes SQL queries against production database
4. Data processing includes percentage calculations and comment integration
5. JSON response sent to client for rendering
6. Frontend updates charts, tables, and summary statistics

## Architectural Patterns
- **MVC Pattern**: Separation of concerns with models (db_service), views (EJS), controllers (server routes)
- **RESTful API**: Clean HTTP endpoints for data retrieval and comment management
- **Service Layer**: Database abstraction through dedicated service module
- **Configuration Management**: Centralized config for environment-specific settings