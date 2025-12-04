# Technology Stack

## Programming Languages
- **JavaScript (Node.js)**: Server-side runtime environment
- **JavaScript (ES6+)**: Client-side application logic
- **HTML5**: Page structure and templates
- **CSS3**: Styling and layout
- **EJS**: Server-side templating

## Backend Technologies

### Core Framework
- **Express.js 4.18.2**: Web application framework
  - Routing and middleware
  - Static file serving
  - RESTful API implementation

### Database
- **node-adodb 5.0.3**: Access database connectivity
  - SQL query execution
  - Windows-based database access
  - ADODB provider integration

### Middleware
- **body-parser 1.20.2**: Request body parsing
  - JSON payload handling
  - URL-encoded form data

### Template Engine
- **EJS 3.1.9**: Embedded JavaScript templates
  - Server-side HTML rendering
  - Dynamic content generation

## Frontend Technologies

### Core Libraries
- Native JavaScript (no framework dependencies)
- DOM manipulation
- Fetch API for AJAX requests
- ES6+ features (arrow functions, template literals, destructuring)

### Visualization
- Custom chart implementations
- Sparkline rendering
- Calendar-based data display
- Interactive pivot tables

### UI Components
- Dynamic data tables
- Column resizing
- Inline editing
- Modal dialogs
- Date pickers

## Development Tools

### Package Manager
- **npm**: Dependency management and scripts

### Development Server
- **nodemon 3.0.1**: Auto-restart on file changes
  - Development workflow optimization
  - Hot reload capability

## Data Storage

### Primary Database
- Microsoft Access Database (.mdb/.accdb)
- ADODB connection via OLE DB provider

### File-based Storage
- **JSON files**: Configuration and user data
  - comments.json: Production comments
  - est_qty.json: Manual estimated quantities
  - plan_data.json: Production plans
  - work_days.json: Work day configurations
  - holidays.json: Holiday calendar

## Development Commands

### Start Production Server
```bash
npm start
```
Runs: `node server.js`
- Starts Express server on dynamic port
- Initializes data cache with auto-refresh
- Serves production dashboard

### Start Development Server
```bash
npm run dev
```
Runs: `nodemon server.js`
- Auto-restarts on file changes
- Development mode with hot reload
- Useful for rapid iteration

## Environment Requirements

### Runtime
- Node.js (compatible with ES6+)
- Windows OS (for Access database connectivity)

### Database
- Microsoft Access Database Engine
- ADODB provider installed
- Proper database file permissions

### Network
- Port availability for Express server
- Database file access permissions

## Build System
- No build step required
- Direct JavaScript execution
- Static assets served as-is
- EJS templates compiled on-demand

## Dependencies Overview

### Production Dependencies
```json
{
  "express": "^4.18.2",      // Web framework
  "body-parser": "^1.20.2",  // Request parsing
  "ejs": "^3.1.9",           // Templating
  "node-adodb": "^5.0.3"     // Database access
}
```

### Development Dependencies
```json
{
  "nodemon": "^3.0.1"        // Development server
}
```

## Architecture Style
- Server-side rendering with EJS
- RESTful API for data operations
- Client-side SPA-like behavior
- File-based configuration
- In-memory caching layer
