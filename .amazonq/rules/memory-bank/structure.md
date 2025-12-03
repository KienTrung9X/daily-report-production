# Project Structure

## Directory Organization

### Root Level
- `server.js` - Main Express.js application server with API routes
- `config.js` - Database connection and application configuration
- `db_service.js` - Database abstraction layer for production data queries
- `user-config.js` - User-specific configuration settings
- `package.json` - Node.js dependencies and project metadata

### Data Files
- `comments.json` - User comments associated with production records
- `est_qty.json` - Manual estimated quantity overrides
- `plan_data.json` - Imported production plan data
- `work_days.json` - Working days configuration per month
- `holidays.json` - Holiday calendar affecting production schedules

### Frontend Assets (`public/`)
- `css/` - Stylesheets for UI components
  - `style.css` - Main application styles
  - `pivot.css` - Data table and pivot view styles
- `js/` - Client-side JavaScript modules
  - `main.js` - Core dashboard functionality and API interactions
  - `charts.js` - Chart rendering and data visualization

### Views (`views/`)
- `index.ejs` - Main dashboard template with EJS templating

## Core Components

### Server Layer
- **Express Application**: RESTful API server handling production data requests
- **Database Service**: Abstracted data access layer supporting multiple database types
- **Configuration Management**: Centralized settings for database connections and app behavior

### Data Management
- **Production Data API**: Real-time queries for actual vs planned production
- **Plan Import System**: Excel-compatible data import for production planning
- **Manual Override System**: User-editable estimates and work day adjustments
- **Comment System**: Contextual annotations for production records

### Frontend Architecture
- **Dashboard Views**: Calendar and tabular views of production data
- **Interactive Charts**: Visual representation of performance metrics
- **Data Entry Forms**: Interfaces for plan imports and manual adjustments
- **Responsive Design**: Mobile-friendly interface for field access

## Architectural Patterns
- **MVC Pattern**: Clear separation between data (models), presentation (views), and logic (controllers)
- **RESTful API Design**: Consistent HTTP endpoints for data operations
- **Configuration-Driven**: External configuration files for easy deployment customization
- **File-Based Persistence**: JSON files for user data with database integration for production data